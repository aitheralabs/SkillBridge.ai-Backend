from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import UserStatus
from app.core.exceptions import ConflictError, UnauthorizedError, BadRequestError
from app.core.security import (
    hash_password, verify_password, create_access_token,
    generate_opaque_token, hash_token,
)
from app.models.token import RefreshToken, EmailVerificationToken, PasswordResetToken
from app.models.user import User
from app.repositories.user import user_repo
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshResponse, UserBrief,
)


def _issue_tokens(db: Session, user: User, ip: str | None, ua: str | None) -> TokenResponse:
    access_token, expires_in = create_access_token(str(user.id), user.role.value)
    raw_refresh = generate_opaque_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        ip_address=ip,
        user_agent=ua,
    ))
    db.commit()
    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        expires_in=expires_in,
        user=UserBrief(id=user.id, email=user.email, role=user.role, status=user.status),
    )


def register(db: Session, data: RegisterRequest, ip: str | None = None, ua: str | None = None) -> TokenResponse:
    if user_repo.get_by_email(db, data.email):
        raise ConflictError("Email already registered")
    user = User(email=data.email, password_hash=hash_password(data.password), role=data.role, status=UserStatus.ACTIVE)
    db.add(user)
    db.flush()
    raw = generate_opaque_token()
    db.add(EmailVerificationToken(
        user_id=user.id,
        token_hash=hash_token(raw),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    ))
    db.commit()
    print(f"[DEV] Verify email: {settings.FRONTEND_URL}/auth/verify-email?token={raw}")
    return _issue_tokens(db, user, ip, ua)


def login(db: Session, data: LoginRequest, ip: str | None = None, ua: str | None = None) -> TokenResponse:
    user = user_repo.get_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")
    if user.status == UserStatus.DELETED:
        raise UnauthorizedError("Account not found")
    if user.status == UserStatus.SUSPENDED:
        raise UnauthorizedError("Account suspended. Contact support.")
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return _issue_tokens(db, user, ip, ua)


def logout(db: Session, raw_refresh: str) -> None:
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == hash_token(raw_refresh)).first()
    if rt:
        rt.revoked_at = datetime.now(timezone.utc)
        db.commit()


def refresh(db: Session, raw_refresh: str) -> RefreshResponse:
    rt = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == hash_token(raw_refresh),
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not rt:
        raise UnauthorizedError("Invalid or expired refresh token")
    user = user_repo.get_active(db, rt.user_id)
    if not user:
        raise UnauthorizedError("User not found")
    rt.revoked_at = datetime.now(timezone.utc)
    access_token, expires_in = create_access_token(str(user.id), user.role.value)
    new_raw = generate_opaque_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_raw),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()
    return RefreshResponse(access_token=access_token, refresh_token=new_raw, expires_in=expires_in)


def verify_email(db: Session, raw: str) -> None:
    evt = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token_hash == hash_token(raw),
            EmailVerificationToken.used_at.is_(None),
            EmailVerificationToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not evt:
        raise BadRequestError("Invalid or expired verification token")
    evt.used_at = datetime.now(timezone.utc)
    user = db.query(User).filter(User.id == evt.user_id).first()
    if user:
        user.email_verified_at = datetime.now(timezone.utc)
    db.commit()


def forgot_password(db: Session, email: str) -> None:
    user = user_repo.get_by_email(db, email)
    if not user:
        return
    raw = generate_opaque_token()
    db.add(PasswordResetToken(
        user_id=user.id,
        token_hash=hash_token(raw),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    db.commit()
    print(f"[DEV] Reset password: {settings.FRONTEND_URL}/auth/reset-password?token={raw}")


def reset_password(db: Session, raw: str, new_password: str) -> None:
    prt = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == hash_token(raw),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not prt:
        raise BadRequestError("Invalid or expired reset token")
    prt.used_at = datetime.now(timezone.utc)
    user = db.query(User).filter(User.id == prt.user_id).first()
    if user:
        user.password_hash = hash_password(new_password)
    db.commit()


def resend_verification(db: Session, email: str) -> None:
    user = user_repo.get_by_email(db, email)
    if not user or user.email_verified_at:
        return
    raw = generate_opaque_token()
    db.add(EmailVerificationToken(
        user_id=user.id,
        token_hash=hash_token(raw),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    ))
    db.commit()
    print(f"[DEV] Verify email: {settings.FRONTEND_URL}/auth/verify-email?token={raw}")
