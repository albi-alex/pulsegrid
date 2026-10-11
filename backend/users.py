from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Form,
)
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from backend.schemas import UserRegister, UserResponse
from jose import JWTError


router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/login"
)


# POST /api/register
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = db.execute(
        text("""
            SELECT user_id
            FROM users
            WHERE email = :email
        """),
        {"email": user.email}
    ).mappings().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    password_hash = hash_password(user.password)

    try:
        result = db.execute(
            text("""
                INSERT INTO users (
                    name,
                    email,
                    password_hash,
                    phone
                )
                VALUES (
                    :name,
                    :email,
                    :password_hash,
                    :phone
                )
                RETURNING user_id, name, email, phone
            """),
            {
                "name": user.name,
                "email": user.email,
                "password_hash": password_hash,
                "phone": user.phone,
            }
        )

        new_user = dict(result.mappings().one())
        db.commit()
        return new_user

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed."
        )


# POST /api/login
# Accepts OAuth2 form data for Swagger's Authorize dialog.
@router.post("/login")
def login_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    result = db.execute(
        text("""
            SELECT
                user_id,
                name,
                email,
                phone,
                password_hash
            FROM users
            WHERE email = :email
        """),
        {"email": username}
    ).mappings().first()

    if not result or not verify_password(
        password,
        result["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        int(result["user_id"])
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# GET /api/profile
# Requires a valid JWT access token.
@router.get("/profile")
def get_profile(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")

        if subject is None:
            raise credentials_error

        user_id = int(subject)

    except (JWTError, ValueError, TypeError):
        raise credentials_error

    result = db.execute(
        text("""
            SELECT
                user_id,
                name,
                email,
                phone,
                created_at
            FROM users
            WHERE user_id = :user_id
        """),
        {"user_id": user_id}
    ).mappings().first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    profile = dict(result)

    if profile.get("created_at") is not None:
        profile["created_at"] = profile["created_at"].isoformat()

    return profile
