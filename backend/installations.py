from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import get_current_user_id
from backend.schemas import InstallationCreate

router = APIRouter(
    prefix="/api/installations",
    tags=["Solar Installations"]
)


# POST /api/installations/
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_installation(
    installation: InstallationCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    try:
        result = db.execute(
            text("""
                INSERT INTO solar_installations (
                    user_id,
                    installation_name,
                    latitude,
                    longitude,
                    altitude,
                    capacity_kw,
                    number_of_panels,
                    panel_type,
                    panel_efficiency,
                    tilt_angle,
                    azimuth_angle,
                    installation_date
                )
                VALUES (
                    :user_id,
                    :installation_name,
                    :latitude,
                    :longitude,
                    :altitude,
                    :capacity_kw,
                    :number_of_panels,
                    :panel_type,
                    :panel_efficiency,
                    :tilt_angle,
                    :azimuth_angle,
                    :installation_date
                )
                RETURNING
                    installation_id,
                    user_id,
                    installation_name,
                    latitude,
                    longitude,
                    altitude,
                    capacity_kw,
                    number_of_panels,
                    panel_type,
                    panel_efficiency,
                    tilt_angle,
                    azimuth_angle,
                    installation_date
            """),
            {
                "user_id": user_id,
                **installation.model_dump()
            }
        )

        record = dict(result.mappings().one())
        db.commit()
        return record

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create the solar installation."
        )


# GET /api/installations/
@router.get("/")
def get_installations(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("""
            SELECT
                installation_id,
                user_id,
                installation_name,
                latitude,
                longitude,
                altitude,
                capacity_kw,
                number_of_panels,
                panel_type,
                panel_efficiency,
                tilt_angle,
                azimuth_angle,
                installation_date
            FROM solar_installations
            WHERE user_id = :user_id
            ORDER BY installation_id DESC
        """),
        {"user_id": user_id}
    )

    return {
        "count": result.rowcount if result.rowcount >= 0 else 0,
        "data": [
            dict(row) for row in result.mappings()
        ]
    }
