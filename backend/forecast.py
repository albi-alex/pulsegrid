from pathlib import Path
from datetime import datetime, timedelta, timezone

import numpy as np
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database import engine, get_db


router = APIRouter(
    prefix="/api/forecast",
    tags=["Solar Forecast"]
)

PROJECT_FOLDER = Path(__file__).resolve().parent.parent


# GET: Retrieve saved solar forecasts
@router.get("/")
def get_forecasts(
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            id,
            forecast_timestamp,
            generated_at,
            predicted_ac_power,
            model_version,
            source
        FROM solar_forecasts
        ORDER BY forecast_timestamp ASC
        LIMIT :limit
    """)

    result = db.execute(query, {"limit": limit})

    records = []

    for row in result.mappings():
        record = dict(row)

        for field in ("forecast_timestamp", "generated_at"):
            if record.get(field) is not None:
                record[field] = record[field].isoformat()

        records.append(record)

    return {
        "count": len(records),
        "data": records
    }


# POST: Generate a test prediction and save it to PostgreSQL
@router.post("/test-prediction")
def test_prediction():
    from prediction import predict_power

    test_data_path = PROJECT_FOLDER / "data" / "X_test.npy"

    if not test_data_path.exists():
        return {
            "status": "error",
            "message": "Test dataset X_test.npy was not found."
        }

    try:
        # Load one sample from the held-out test dataset
        X_test = np.load(test_data_path)

        if len(X_test) == 0:
            return {
                "status": "error",
                "message": "The test dataset is empty."
            }

        sample_sequence = X_test[0]

        # Generate 16 predictions covering 4 hours
        forecast = predict_power(sample_sequence)[0]

        # Record when this prediction was generated
        generated_at = datetime.now(timezone.utc)

        forecast_rows = []

        for index, power in enumerate(forecast, start=1):
            forecast_rows.append({
                "forecast_timestamp": (
                    generated_at + timedelta(minutes=15 * index)
                ),
                "generated_at": generated_at,
                "predicted_ac_power": float(power),
                "model_version": "best_cnn_lstm",
                "source": "cnn_lstm_test_sample"
            })

        # Save all 16 forecast points to PostgreSQL
        insert_query = text("""
            INSERT INTO solar_forecasts (
                forecast_timestamp,
                generated_at,
                predicted_ac_power,
                model_version,
                source
            )
            VALUES (
                :forecast_timestamp,
                :generated_at,
                :predicted_ac_power,
                :model_version,
                :source
            )
        """)

        with engine.begin() as connection:
            connection.execute(insert_query, forecast_rows)

        # Return the generated predictions
        return {
            "status": "success",
            "forecast_hours": 4,
            "interval_minutes": 15,
            "prediction_count": len(forecast),
            "predictions": [
                round(float(power), 2)
                for power in forecast
            ],
            "saved_to_database": True,
            "note": (
                "Generated from a held-out test sample. "
                "This is not a live weather-based forecast."
            )
        }

    except Exception as error:
        print(f"Forecast prediction error: {error}")

        return {
            "status": "error",
            "message": (
                "Prediction failed. Check the server terminal "
                "for details."
            )
        }


# POST: Validate prediction pipeline using the latest historical feature rows
@router.post("/historical-input-test")
def historical_input_test():
    import pandas as pd
    from prediction import predict_power, feature_scaler

    data_path = PROJECT_FOLDER / "data" / "plant1_features.csv"

    if not data_path.exists():
        return {
            "status": "error",
            "message": "plant1_features.csv was not found."
        }

    try:
        df = pd.read_csv(data_path)

        feature_columns = [
            "AC_POWER",
            "AMBIENT_TEMPERATURE",
            "MODULE_TEMPERATURE",
            "IRRADIATION",
            "solar_elevation",
            "solar_azimuth",
            "hour_sin",
            "hour_cos",
            "day_of_year_sin",
            "day_of_year_cos"
        ]

        if len(df) < 16 or not set(feature_columns).issubset(df.columns):
            return {
                "status": "error",
                "message": "Dataset is missing required columns or rows."
            }

        # This is a historical test, not a live forecast.
        sequence = df[feature_columns].tail(16).to_numpy()
        scaled_sequence = feature_scaler.transform(sequence)
        predictions = predict_power(scaled_sequence)[0]

        return {
            "status": "success",
            "input_source": "plant1_features.csv",
            "input_type": "historical",
            "forecast_hours": 4,
            "interval_minutes": 15,
            "prediction_count": len(predictions),
            "predictions_watts": [
                round(float(power), 2) for power in predictions
            ],
            "saved_to_database": False,
            "note": "Historical-input pipeline test only; not a live forecast."
        }

    except Exception as error:
        print(f"Historical input test error: {error}")
        return {
            "status": "error",
            "message": "Historical prediction test failed. Check the server terminal."
        }
