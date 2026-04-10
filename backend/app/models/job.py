from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import (
    ApplicationMode, EmploymentType, ExperienceLevel, Industry,
    JobListingStatus, JobSourceType,
)
from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Job(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "jobs"

    source_type: Mapped[JobSourceType] = mapped_column(
        SAEnum(JobSourceType, native_enum=False), nullable=False, default=JobSourceType.DIRECT,
    )
    company_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("companies.id"), nullable=True, index=True)
    company_name_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    employment_type: Mapped[EmploymentType | None] = mapped_column(SAEnum(EmploymentType, native_enum=False), nullable=True)
    industry: Mapped[Industry | None] = mapped_column(SAEnum(Industry, native_enum=False), nullable=True)
    experience_level: Mapped[ExperienceLevel | None] = mapped_column(SAEnum(ExperienceLevel, native_enum=False), nullable=True)
    required_skills: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    application_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    application_mode: Mapped[ApplicationMode] = mapped_column(
        SAEnum(ApplicationMode, native_enum=False), nullable=False, default=ApplicationMode.INTERNAL,
    )
    apply_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[JobListingStatus] = mapped_column(
        SAEnum(JobListingStatus, native_enum=False), nullable=False, default=JobListingStatus.DRAFT, index=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    updated_by_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
