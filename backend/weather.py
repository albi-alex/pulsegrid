import requests


def get_weather_status():
    """Return current weather integration status."""
    return {
        "status": "configured",
        "provider": "Open-Meteo",
        "message": "Weather API is ready to use."
    }


def get_current_weather(latitude=8.8932, longitude=76.6141):
    """Fetch current weather data from Open-Meteo."""

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,relative_humidity_2m,"
            "cloud_cover,wind_speed_10m"
        ),
        "timezone": "Asia/Kolkata"
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=15
        )
        response.raise_for_status()

        data = response.json()
        current = data.get("current", {})

        return {
            "status": "success",
            "provider": "Open-Meteo",
            "timestamp": current.get("time"),
            "ambient_temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "cloud_cover": current.get("cloud_cover"),
            "wind_speed": current.get("wind_speed_10m"),
            "wind_speed_unit": "km/h"
        }

    except requests.RequestException as error:
        return {
            "status": "error",
            "message": "Unable to fetch current weather data.",
            "details": str(error)
        }
