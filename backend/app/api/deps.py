from typing import Annotated

import jwt
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import UserRole
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.db.session import get_db
from app.models.user import User
from app.repositories.user import user_repo


def _decode_bearer(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedError("Invalid token payload")
        return user_id
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Invalid token")


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> User:
    user_id = _decode_bearer(authorization)
    import uuid as _uuid
    user = user_repo.get_active(db, _uuid.UUID(user_id))
    if not user:
        raise UnauthorizedError("User not found or inactive")
    return user


def require_role(*roles: UserRole):
    def _dep(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise ForbiddenError("Insufficient permissions")
        return current_user
    return _dep


def require_job_seeker(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.JOB_SEEKER:
        raise ForbiddenError("Job seeker access required")
    return current_user


def require_recruiter(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.RECRUITER, UserRole.ADMIN):
        raise ForbiddenError("Recruiter access required")
    return current_user
