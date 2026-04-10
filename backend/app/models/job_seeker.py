from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum as SAEnum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.enums import EmploymentType, ProfileVisibility
from app.db.base import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class JobSeekerProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "job_seeker_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    headline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    visibility: Mapped[ProfileVisibility] = mapped_column(
        SAEnum(ProfileVisibility, native_enum=False), nullable=False, default=ProfileVisibility.PUBLIC,
    )


class ProfileEducation(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "profile_educations"

    profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[str | None] = mapped_column(String(255), nullable=True)
    field_of_study: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    grade: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class ProfileExperience(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "profile_experiences"

    profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    employment_type: Mapped[EmploymentType | None] = mapped_column(SAEnum(EmploymentType, native_enum=False), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class ProfileSkill(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "profile_skills"

    profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class JobPreference(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "job_preferences"

    profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    desired_roles: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    preferred_locations: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    employment_types: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    expected_salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expected_salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
