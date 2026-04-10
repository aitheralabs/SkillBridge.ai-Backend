import uuid
from datetime import datetime
from app.schemas.common import BaseSchema
from app.core.enums import ApplicationStatus
from app.schemas.job import JobSummary


class ApplicationCreate(BaseSchema):
    cover_letter: str | None = None


class ApplicationStatusUpdate(BaseSchema):
    status: ApplicationStatus
    note: str | None = None


class ApplicationResponse(BaseSchema):
    id: uuid.UUID
    job_id: uuid.UUID
    job_seeker_user_id: uuid.UUID
    cover_letter: str | None
    status: ApplicationStatus
    submitted_at: datetime
    withdrawn_at: datetime | None
    updated_at: datetime
    job: JobSummary | None = None


class SeekerBrief(BaseSchema):
    user_id: uuid.UUID
    full_name: str | None
    headline: str | None
    current_location: str | None


class ApplicationWithSeeker(ApplicationResponse):
    seeker: SeekerBrief | None = None
