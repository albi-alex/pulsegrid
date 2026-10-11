from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database import get_db, engine
from backend.weather import get_current_weather


router = APIRouter(
    prefix="/api/environmental-data",
    tags=["Environmental Data"]
)


# GET: Retrieve environmental readings from PostgreSQL
@router.get("/")
def get_environmental_data(
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            id,
            timestamp,
            plant_id,
            ambient_temperature,
            module_temperature,
            irradiation,
            cloud_cover,
            humidity,
            wind_speed,
            source
        FROM weather_readings
        ORDER BY timestamp DESC
        LIMIT :limit
    """)

    result = db.execute(query, {"limit": limit})

    records = []

    for row in result.mappings():
        record = dict(row)

        if record.get("timestamp") is not None:
            record["timestamp"] = record["timestamp"].isoformat()

        records.append(record)

    return {
        "count": len(records),
        "data": records
    }


# POST: Fetch current weather and save it to PostgreSQL
@router.post("/fetch-current")
def fetch_and_save_current_weather():
    weather = get_current_weather()

    if weather.get("status") != "success":
        return weather

    timestamp = weather.get("timestamp")

    if not timestamp:
        return {
            "status": "error",
            "message": "Weather response did not contain a timestamp."
        }

    insert_query = text("""
        INSERT INTO weather_readings (
            timestamp,
            plant_id,
            ambient_temperature,
            cloud_cover,
            humidity,
            wind_speed,
            source
        )
        VALUES (
            :timestamp,
            :plant_id,
            :ambient_temperature,
            :cloud_cover,
            :humidity,
            :wind_speed,
            :source
        )
        ON CONFLICT (timestamp, plant_id) DO UPDATE SET
            ambient_temperature = EXCLUDED.ambient_temperature,
            cloud_cover = EXCLUDED.cloud_cover,
            humidity = EXCLUDED.humidity,
            wind_speed = EXCLUDED.wind_speed,
            source = EXCLUDED.source
    """)

    try:
        with engine.begin() as connection:
            connection.execute(
                insert_query,
                {
                    "timestamp": timestamp,
                    "plant_id": 4135001,
                    "ambient_temperature": weather.get(
                        "ambient_temperature"
                    ),
                    "cloud_cover": weather.get("cloud_cover"),
                    "humidity": weather.get("humidity"),
                    "wind_speed": weather.get("wind_speed"),
                    "source": "open_meteo"
                }
            )

        return {
            "status": "success",
            "message": "Current weather fetched and saved to PostgreSQL.",
            "weather": weather
        }

    except Exception as error:
        print(f"Failed to save current weather: {error}")

        return {
            "status": "error",
            "message": "Weather was fetched but could not be saved."
        }
