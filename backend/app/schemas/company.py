import uuid
from datetime import datetime
from app.schemas.common import BaseSchema
from app.core.enums import Industry, CompanyVerificationStatus


class CompanyCreate(BaseSchema):
    name: str
    description: str | None = None
    industry: Industry | None = None
    website_url: str | None = None
    headquarters_location: str | None = None


class CompanyUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None
    industry: Industry | None = None
    website_url: str | None = None
    headquarters_location: str | None = None


class CompanySummary(BaseSchema):
    id: uuid.UUID
    name: str
    slug: str
    industry: Industry | None
    verification_status: CompanyVerificationStatus


class CompanyResponse(BaseSchema):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    industry: Industry | None
    website_url: str | None
    headquarters_location: str | None
    verification_status: CompanyVerificationStatus
    submitted_at: datetime | None
    approved_at: datetime | None
    rejected_at: datetime | None
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime
