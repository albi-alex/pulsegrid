
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database import get_db

router = APIRouter(prefix="/api/power", tags=["Power Generation"])


@router.get("/history")
def get_power_history(
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            id,
            timestamp,
            plant_id,
            ac_power,
            dc_power,
            daily_yield,
            total_yield,
            source
        FROM power_generation
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

@router.get("/today")
def get_today_power_generation(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            COUNT(*) AS record_count,
            COALESCE(SUM(ac_power), 0) AS total_ac_power,
            COALESCE(MAX(daily_yield), 0) AS latest_daily_yield,
            COALESCE(MAX(total_yield), 0) AS latest_total_yield
        FROM power_generation
        WHERE timestamp >= CURRENT_DATE
          AND timestamp < CURRENT_DATE + INTERVAL '1 day'
    """)

    result = db.execute(query).mappings().one()

    return {
        "date": str(db.execute(text("SELECT CURRENT_DATE")).scalar()),
        "record_count": result["record_count"],
        "total_ac_power": float(result["total_ac_power"]),
        "latest_daily_yield": float(result["latest_daily_yield"]),
        "latest_total_yield": float(result["latest_total_yield"])
    }
