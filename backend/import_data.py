
from pathlib import Path

import pandas as pd
from sqlalchemy.dialects.postgresql import insert

from backend.database import engine
from backend.database import Base
from sqlalchemy import MetaData, Table

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"


def import_generation():
    path = DATA_DIR / "Plant_1_Generation_Data.csv"
    df = pd.read_csv(path)

    df["timestamp"] = pd.to_datetime(
        df["DATE_TIME"], format="%d-%m-%Y %H:%M", errors="raise"
    )
    df["plant_id"] = df["PLANT_ID"].astype(int)

    # Aggregate inverter readings to plant-level power per timestamp.
    grouped = (
        df.groupby(["timestamp", "plant_id"], as_index=False)
        .agg(
            ac_power=("AC_POWER", "sum"),
            dc_power=("DC_POWER", "sum"),
            daily_yield=("DAILY_YIELD", "sum"),
            total_yield=("TOTAL_YIELD", "max"),
        )
    )
    grouped["source"] = "historical_dataset"

    return grouped.to_dict(orient="records")


def import_weather():
    path = DATA_DIR / "Plant_1_Weather_Sensor_Data.csv"
    df = pd.read_csv(path)

    df["timestamp"] = pd.to_datetime(
        df["DATE_TIME"], errors="raise"
    )
    df["plant_id"] = df["PLANT_ID"].astype(int)

    # The weather file has one reading per timestamp.
    df = df.rename(
        columns={
            "AMBIENT_TEMPERATURE": "ambient_temperature",
            "MODULE_TEMPERATURE": "module_temperature",
            "IRRADIATION": "irradiation",
        }
    )
    df["source"] = "historical_dataset"

    return df[
        [
            "timestamp",
            "plant_id",
            "ambient_temperature",
            "module_temperature",
            "irradiation",
            "source",
        ]
    ].to_dict(orient="records")


def upsert_rows(table_name, rows, unique_columns):
    if not rows:
        print(f"{table_name}: no rows to import")
        return

    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=engine)

    with engine.begin() as connection:
        for start in range(0, len(rows), 500):
            batch = rows[start : start + 500]
            statement = insert(table).values(batch)
            statement = statement.on_conflict_do_nothing(
                index_elements=unique_columns
            )
            connection.execute(statement)

    print(f"{table_name}: processed {len(rows)} rows")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)

    generation_rows = import_generation()
    weather_rows = import_weather()

    upsert_rows(
        "power_generation",
        generation_rows,
        ["timestamp", "plant_id"],
    )
    upsert_rows(
        "weather_readings",
        weather_rows,
        ["timestamp", "plant_id"],
    )

    print("Historical data import finished.")
