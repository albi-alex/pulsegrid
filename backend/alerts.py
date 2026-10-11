
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import get_current_user_id

router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"]
)


@router.get("/")
def get_alerts(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("""
            SELECT
                alert_id,
                user_id,
                installation_id,
                alert_type,
                message,
                severity,
                created_at,
                is_read
            FROM alerts
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        """),
        {"user_id": user_id}
    )

    records = []
    for row in result.mappings():
        record = dict(row)
        if record.get("created_at") is not None:
            record["created_at"] = record["created_at"].isoformat()
        records.append(record)

    return {
        "count": len(records),
        "data": records
    }


@router.patch("/{alert_id}/read")
def mark_alert_as_read(
    alert_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("""
            UPDATE alerts
            SET is_read = TRUE
            WHERE alert_id = :alert_id
              AND user_id = :user_id
            RETURNING alert_id, is_read
        """),
        {"alert_id": alert_id, "user_id": user_id}
    )

    alert = result.mappings().first()

    if not alert:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found."
        )

    db.commit()

    return {
        "message": "Alert marked as read.",
        "alert_id": alert["alert_id"],
        "is_read": alert["is_read"]
    }
