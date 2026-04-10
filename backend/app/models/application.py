from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.enums import ApplicationStatus
from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin


class Application(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("job_id", "job_seeker_user_id"),)

    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    job_seeker_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    cover_letter: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus, native_enum=False), nullable=False, default=ApplicationStatus.SUBMITTED, index=True,
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    withdrawn_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class ApplicationStatusHistory(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "application_status_history"

    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    from_status: Mapped[ApplicationStatus | None] = mapped_column(SAEnum(ApplicationStatus, native_enum=False), nullable=True)
    to_status: Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus, native_enum=False), nullable=False)
    changed_by_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
