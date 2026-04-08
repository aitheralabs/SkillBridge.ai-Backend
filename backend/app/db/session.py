from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config.config import settings
from app.db.base import Base

# Import all models so Base knows about them for table creation
import app.db.models.role  # noqa: F401
import app.db.models.user  # noqa: F401

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_db_instance: Session | None = None


def get_db() -> Session:
    global _db_instance
    if _db_instance is None:
        _db_instance = SessionLocal()
    return _db_instance


def init_db():
    Base.metadata.create_all(bind=engine)
