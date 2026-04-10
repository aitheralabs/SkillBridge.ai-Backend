import uuid
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.enums import UserStatus
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    model = User

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def get_active(self, db: Session, id: uuid.UUID) -> User | None:
        return (
            db.query(User)
            .filter(User.id == id, User.status != UserStatus.DELETED)
            .first()
        )


user_repo = UserRepository()
