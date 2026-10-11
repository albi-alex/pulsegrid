import os
from pathlib import Path
from dotenv import load_dotenv

# Find the project's root directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load environment variables from the project root
load_dotenv(PROJECT_ROOT / ".env")

# Weather API key (optional)
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "")

# JWT authentication settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")

if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is missing. Check your project .env file."
    )

JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30
