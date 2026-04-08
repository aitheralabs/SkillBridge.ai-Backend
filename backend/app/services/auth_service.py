from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import jwt

from app.db.models.user import User
from app.schemas.auth import (
    SignupRequest, LoginRequest, ForgotPasswordRequest,
    ResetPasswordRequest, RefreshTokenRequest, ResendEmailRequest,
    TokenResponse, MessageResponse,
)
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_token, decode_token
from app.config.config import settings


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def signup(db: Session, payload: SignupRequest) -> MessageResponse:
    if _get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        phone=payload.phone,
        password=hash_password(payload.password),
        role_id=payload.role_id,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": str(user.id)}, token_type="activation")
    activation_link = f"{settings.FRONTEND_URL}/auth/activate?token={token}"
    # TODO: send activation_link via email
    print(f"[DEV] Activation link: {activation_link}")

    return MessageResponse(message="Account created. Please check your email to activate your account.")


def login(db: Session, payload: LoginRequest) -> TokenResponse:
    user = _get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not activated")

    access_token = create_token({"sub": str(user.id)}, token_type="access")
    refresh_token = create_token({"sub": str(user.id)}, token_type="refresh")

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


def forgot_password(db: Session, payload: ForgotPasswordRequest) -> MessageResponse:
    user = _get_user_by_email(db, payload.email)
    if not user:
        # Return generic message to avoid user enumeration
        return MessageResponse(message="If that email exists, a reset link has been sent.")

    token = create_token({"sub": str(user.id)}, token_type="reset")
    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    # TODO: send reset_link via email
    print(f"[DEV] Reset link: {reset_link}")

    return MessageResponse(message="If that email exists, a reset link has been sent.")


def reset_password(db: Session, payload: ResetPasswordRequest) -> MessageResponse:
    try:
        data = decode_token(payload.token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    if data.get("type") != "reset":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")

    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password = hash_password(payload.new_password)
    db.commit()

    return MessageResponse(message="Password reset successful.")


def activate(db: Session, token: str) -> MessageResponse:
    try:
        data = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activation token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    if data.get("type") != "activation":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")

    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.is_verified:
        return MessageResponse(message="Account already activated.")

    user.is_verified = True
    db.commit()

    return MessageResponse(message="Account activated successfully.")


def resend_activation_email(db: Session, payload: ResendEmailRequest) -> MessageResponse:
    user = _get_user_by_email(db, payload.email)
    if not user:
        return MessageResponse(message="If that email exists, an activation link has been sent.")

    if user.is_verified:
        return MessageResponse(message="Account is already activated.")

    token = create_token({"sub": str(user.id)}, token_type="activation")
    activation_link = f"{settings.FRONTEND_URL}/auth/activate?token={token}"
    # TODO: send activation_link via email
    print(f"[DEV] Activation link: {activation_link}")

    return MessageResponse(message="If that email exists, an activation link has been sent.")


def refresh_token(payload: RefreshTokenRequest) -> TokenResponse:
    try:
        data = decode_token(payload.refresh_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    new_access = create_token({"sub": data["sub"]}, token_type="access")
    new_refresh = create_token({"sub": data["sub"]}, token_type="refresh")

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)
