from datetime import date

from pydantic import BaseModel, EmailStr, Field


# Forecast schemas
class ForecastRequest(BaseModel):
    latitude: float
    longitude: float


class ForecastResponse(BaseModel):
    latitude: float
    longitude: float
    forecast_hours: int
    status: str
    message: str


# User registration schema
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    phone: str | None = Field(default=None, max_length=20)


# User login schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=72)


# User response schema
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: str | None = None


# Solar installation creation schema
class InstallationCreate(BaseModel):
    installation_name: str = Field(..., min_length=1, max_length=150)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: float | None = None
    capacity_kw: float = Field(..., gt=0)
    number_of_panels: int | None = Field(default=None, gt=0)
    panel_type: str | None = Field(default=None, max_length=100)
    panel_efficiency: float | None = Field(default=None, gt=0, le=100)
    tilt_angle: float | None = Field(default=None, ge=0, le=90)
    azimuth_angle: float | None = Field(default=None, ge=0, le=360)
    installation_date: date | None = None


# Solar installation response schema
class InstallationResponse(BaseModel):
    installation_id: int
    user_id: int | None = None
    installation_name: str
    latitude: float
    longitude: float
    altitude: float | None = None
    capacity_kw: float
    number_of_panels: int | None = None
    panel_type: str | None = None
    panel_efficiency: float | None = None
    tilt_angle: float | None = None
    azimuth_angle: float | None = None
    installation_date: date | None = None
