from fastapi import APIRouter, Query
from app.db.session import get_db
from app.schemas.auth import (
    SignupRequest, LoginRequest, ForgotPasswordRequest,
    ResetPasswordRequest, RefreshTokenRequest, ResendEmailRequest,
    TokenResponse, MessageResponse,
)
import app.services.auth_service as auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=MessageResponse, status_code=201)
def signup(payload: SignupRequest):
    return auth_service.signup(get_db(), payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    return auth_service.login(get_db(), payload)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest):
    return auth_service.forgot_password(get_db(), payload)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest):
    return auth_service.reset_password(get_db(), payload)


@router.get("/activate", response_model=MessageResponse)
def activate(token: str = Query(...)):
    return auth_service.activate(get_db(), token)


@router.post("/resend-email", response_model=MessageResponse)
def resend_email(payload: ResendEmailRequest):
    return auth_service.resend_activation_email(get_db(), payload)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshTokenRequest):
    return auth_service.refresh_token(payload)
