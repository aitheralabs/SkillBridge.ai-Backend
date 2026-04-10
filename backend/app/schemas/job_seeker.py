import uuid
from datetime import date, datetime
from app.schemas.common import BaseSchema
from app.core.enums import ProfileVisibility, EmploymentType


class EducationCreate(BaseSchema):
    institution_name: str
    degree: str | None = None
    field_of_study: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    grade: str | None = None
    description: str | None = None
    sort_order: int = 0


class EducationResponse(EducationCreate):
    id: uuid.UUID
    profile_id: uuid.UUID


class ExperienceCreate(BaseSchema):
    company_name: str
    job_title: str
    employment_type: EmploymentType | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None
    sort_order: int = 0


class ExperienceResponse(ExperienceCreate):
    id: uuid.UUID
    profile_id: uuid.UUID


class SkillCreate(BaseSchema):
    skill_name: str
    sort_order: int = 0


class SkillResponse(SkillCreate):
    id: uuid.UUID
    profile_id: uuid.UUID


class PreferencesUpsert(BaseSchema):
    desired_roles: list[str] | None = None
    preferred_locations: list[str] | None = None
    employment_types: list[str] | None = None
    expected_salary_min: int | None = None
    expected_salary_max: int | None = None
    currency: str = "USD"


class PreferencesResponse(PreferencesUpsert):
    id: uuid.UUID
    profile_id: uuid.UUID
    updated_at: datetime


class ProfileUpdate(BaseSchema):
    full_name: str | None = None
    phone: str | None = None
    headline: str | None = None
    summary: str | None = None
    current_location: str | None = None
    visibility: ProfileVisibility | None = None


class ProfileResponse(BaseSchema):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None
    phone: str | None
    headline: str | None
    summary: str | None
    current_location: str | None
    visibility: ProfileVisibility
    educations: list[EducationResponse] = []
    experiences: list[ExperienceResponse] = []
    skills: list[SkillResponse] = []
    preferences: PreferencesResponse | None = None
    created_at: datetime
    updated_at: datetime
