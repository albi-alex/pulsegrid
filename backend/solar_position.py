
from datetime import datetime
from zoneinfo import ZoneInfo

import pandas as pd
import pvlib
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(
    prefix="/api/solar-position",
    tags=["Solar Position"]
)


@router.get("/")
def get_solar_position(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    altitude: float = Query(default=0.0, ge=-500, le=10000)
):
    try:
        alt_val = float(altitude.default if hasattr(altitude, "default") else altitude)
        timestamp = datetime.now(ZoneInfo("Asia/Kolkata"))
        times = pd.DatetimeIndex([timestamp])

        position = pvlib.solarposition.get_solarposition(
            time=times,
            latitude=latitude,
            longitude=longitude,
            altitude=alt_val
        )

        sun = position.iloc[0]

        # Calculate sunrise, sunset, and daylight duration
        sunrise_str = None
        sunset_str = None
        daylight_duration_hours = None

        try:
            rise_set = pvlib.solarposition.sun_rise_set_transit_spa(
                times, latitude, longitude
            )
            sunrise_dt = rise_set["sunrise"].iloc[0]
            sunset_dt = rise_set["sunset"].iloc[0]

            if pd.notnull(sunrise_dt) and pd.notnull(sunset_dt):
                sunrise_str = sunrise_dt.strftime("%H:%M:%S")
                sunset_str = sunset_dt.strftime("%H:%M:%S")
                daylight_duration_hours = round(
                    (sunset_dt - sunrise_dt).total_seconds() / 3600.0, 2
                )
        except Exception:
            # Fall back gracefully if sunrise calculation fails
            pass

        return {
            "timestamp": timestamp.isoformat(),
            "latitude": latitude,
            "longitude": longitude,
            "solar_elevation": round(float(sun["elevation"]), 4),
            "solar_azimuth": round(float(sun["azimuth"]), 4),
            "solar_zenith": round(float(sun["zenith"]), 4),
            "sunrise": sunrise_str,
            "sunset": sunset_str,
            "daylight_hours": daylight_duration_hours
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Could not calculate solar position."
        ) from error
