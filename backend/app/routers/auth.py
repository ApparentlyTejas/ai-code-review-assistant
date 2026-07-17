from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.auth import TokenResponse, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])

_SAMESITE = "none" if settings.cookie_secure else "lax"
_COOKIE_KWARGS = dict(
    httponly=True,
    secure=settings.cookie_secure,
    samesite=_SAMESITE,
)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: UserRegister, db: Session = Depends(get_db)) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, response: Response, payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id))
    max_age = settings.jwt_expire_minutes * 60
    response.set_cookie(key="access_token", value=token, max_age=max_age, **_COOKIE_KWARGS)
    # Non-HttpOnly hint so the frontend can skip the /auth/me call when no session exists
    response.set_cookie(key="auth_hint", value="1", max_age=max_age, httponly=False,
                        secure=settings.cookie_secure, samesite=_SAMESITE)
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(key="access_token", **_COOKIE_KWARGS)
    response.delete_cookie(key="auth_hint", httponly=False, secure=settings.cookie_secure, samesite=_SAMESITE)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
