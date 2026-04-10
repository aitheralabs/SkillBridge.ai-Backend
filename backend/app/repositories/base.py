import uuid
from typing import Any, Type
from sqlalchemy.orm import Session
from app.db.base import Base


class BaseRepository:
    model: Type[Base]  # type: ignore[type-arg]

    def get(self, db: Session, id: uuid.UUID) -> Any:
        return db.query(self.model).filter(self.model.id == id).first()  # type: ignore[attr-defined]

    def list(self, db: Session, skip: int = 0, limit: int = 100) -> list:
        return db.query(self.model).offset(skip).limit(limit).all()

    def delete(self, db: Session, id: uuid.UUID) -> bool:
        obj = self.get(db, id)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True

    def count(self, db: Session) -> int:
        return db.query(self.model).count()
