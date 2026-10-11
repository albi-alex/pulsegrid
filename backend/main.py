from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from backend.database import engine
from backend.database import get_db
from backend.power import router as power_router
from backend.environment import router as environment_router
from backend.forecast import router as forecast_router
from backend.weather import get_current_weather
from backend.users import router as users_router
from backend.installations import router as installations_router
from backend.alerts import router as alerts_router
from backend.solar_position import router as solar_position_router


app = FastAPI(
    title="GridPulse API",
    description="Backend API for GridPulse solar power forecasting",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(power_router)
app.include_router(environment_router)
app.include_router(forecast_router)
app.include_router(users_router)
app.include_router(installations_router)
app.include_router(alerts_router)
app.include_router(solar_position_router)

@app.get("/api/weather/current", tags=["Weather"])
def current_weather(
    latitude: float = 8.8932,
    longitude: float = 76.6141
):
    return get_current_weather(latitude=latitude, longitude=longitude)


@app.get("/")
def root():
    return {
        "message": "GridPulse API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }
