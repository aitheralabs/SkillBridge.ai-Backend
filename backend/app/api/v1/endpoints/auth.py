from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshResponse,
    LogoutRequest, VerifyEmailRequest, ForgotPasswordRequest,
    ResetPasswordRequest, ResendVerificationRequest, UserBrief,
)
from app.schemas.common import MessageResponse
from app.services import auth as auth_svc

router = APIRouter(prefix="/auth", tags=["auth"])


def _ip(request: Request) -> str | None:
    ff = request.headers.get("X-Forwarded-For")
    return ff.split(",")[0].strip() if ff else request.client.host if request.client else None


def _ua(request: Request) -> str | None:
    return request.headers.get("User-Agent")


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    return auth_svc.register(db, body, _ip(request), _ua(request))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    return auth_svc.login(db, body, _ip(request), _ua(request))


@router.post("/logout", response_model=MessageResponse)
def logout(body: LogoutRequest, db: Session = Depends(get_db)):
    auth_svc.logout(db, body.refresh_token)
    return MessageResponse(message="Logged out successfully")


@router.post("/refresh", response_model=RefreshResponse)
def refresh(body: LogoutRequest, db: Session = Depends(get_db)):
    return auth_svc.refresh(db, body.refresh_token)


@router.get("/me", response_model=UserBrief)
def me(current_user: User = Depends(get_current_user)):
    return UserBrief(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        status=current_user.status,
    )


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    auth_svc.verify_email(db, body.token)
    return MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(body: ResendVerificationRequest, db: Session = Depends(get_db)):
    auth_svc.resend_verification(db, body.email)
    return MessageResponse(message="If that email exists, a verification link has been sent")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_svc.forgot_password(db, body.email)
    return MessageResponse(message="If that email exists, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_svc.reset_password(db, body.token, body.new_password)
    return MessageResponse(message="Password reset successfully")
