from datetime import datetime, timedelta, timezone
from typing import Literal
import jwt
from app.config.config import settings

TokenType = Literal["access", "refresh", "reset", "activation"]


def create_token(data: dict, token_type: TokenType, expires_delta: timedelta | None = None) -> str:
    if expires_delta is None:
        if token_type == "access":
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == "refresh":
            expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            expires_delta = timedelta(hours=1)

    payload = data.copy()
    payload.update({
        "exp": datetime.now(timezone.utc) + expires_delta,
        "type": token_type,
    })
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
