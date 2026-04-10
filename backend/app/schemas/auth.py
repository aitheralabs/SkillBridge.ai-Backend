import uuid
from pydantic import EmailStr, Field
from app.schemas.common import BaseSchema
from app.core.enums import UserRole, UserStatus


class RegisterRequest(BaseSchema):
    email: EmailStr
    password: str = Field(min_length=8)
    role: UserRole = UserRole.JOB_SEEKER


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class UserBrief(BaseSchema):
    id: uuid.UUID
    email: str
    role: UserRole
    status: UserStatus


class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    expires_in: int
    user: UserBrief


class RefreshRequest(BaseSchema):
    refresh_token: str


class RefreshResponse(BaseSchema):
    access_token: str
    refresh_token: str
    expires_in: int


class LogoutRequest(BaseSchema):
    refresh_token: str


class VerifyEmailRequest(BaseSchema):
    token: str


class ForgotPasswordRequest(BaseSchema):
    email: EmailStr


class ResetPasswordRequest(BaseSchema):
    token: str
    new_password: str = Field(min_length=8)


class ResendVerificationRequest(BaseSchema):
    email: EmailStr
