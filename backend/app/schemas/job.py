import uuid
from datetime import datetime
from app.schemas.common import BaseSchema
from app.core.enums import (
    ApplicationMode, EmploymentType, ExperienceLevel, Industry, JobListingStatus
)
from app.schemas.company import CompanySummary


class JobCreate(BaseSchema):
    title: str
    description: str
    location: str | None = None
    employment_type: EmploymentType | None = None
    industry: Industry | None = None
    experience_level: ExperienceLevel | None = None
    required_skills: list[str] | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str = "USD"
    application_deadline: datetime | None = None
    application_mode: ApplicationMode = ApplicationMode.INTERNAL
    apply_url: str | None = None
    status: JobListingStatus = JobListingStatus.DRAFT


class JobUpdate(BaseSchema):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    employment_type: EmploymentType | None = None
    industry: Industry | None = None
    experience_level: ExperienceLevel | None = None
    required_skills: list[str] | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str | None = None
    application_deadline: datetime | None = None
    application_mode: ApplicationMode | None = None
    apply_url: str | None = None


class JobStatusUpdate(BaseSchema):
    status: JobListingStatus


class JobSummary(BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID | None
    company_name_snapshot: str
    title: str
    location: str | None
    employment_type: EmploymentType | None
    industry: Industry | None
    experience_level: ExperienceLevel | None
    salary_min: int | None
    salary_max: int | None
    currency: str
    application_mode: ApplicationMode
    status: JobListingStatus
    published_at: datetime | None
    created_at: datetime


class JobResponse(JobSummary):
    description: str
    required_skills: list[str] | None
    application_deadline: datetime | None
    apply_url: str | None
    updated_at: datetime
    company: CompanySummary | None = None
