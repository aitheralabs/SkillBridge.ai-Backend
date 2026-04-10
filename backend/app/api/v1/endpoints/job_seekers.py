import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_job_seeker
from app.db.session import get_db
from app.models.user import User
from app.schemas.application import ApplicationResponse, ApplicationStatusUpdate
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.job_seeker import (
    ProfileUpdate, ProfileResponse, EducationCreate, EducationResponse,
    ExperienceCreate, ExperienceResponse, SkillCreate, SkillResponse,
    PreferencesUpsert, PreferencesResponse,
)
from app.services import application as app_svc
from app.services import profile as profile_svc

router = APIRouter(prefix="/job-seeker", tags=["job-seeker"])


# ── Profile ──────────────────────────────────────────────────────────────────

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(require_job_seeker)):
    profile = profile_svc.get_or_create(db, current_user)
    return profile_svc.build_response(db, profile)


@router.patch("/profile", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    profile = profile_svc.update_profile(db, current_user, body)
    return profile_svc.build_response(db, profile)


# ── Education ─────────────────────────────────────────────────────────────────

@router.post("/profile/education", response_model=EducationResponse, status_code=201)
def add_education(
    body: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return profile_svc.add_education(db, current_user, body)


@router.put("/profile/education/{edu_id}", response_model=EducationResponse)
def update_education(
    edu_id: uuid.UUID,
    body: EducationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return profile_svc.update_education(db, current_user, edu_id, body)


@router.delete("/profile/education/{edu_id}", response_model=MessageResponse)
def delete_education(
    edu_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    profile_svc.delete_education(db, current_user, edu_id)
    return MessageResponse(message="Education record deleted")


# ── Experience ────────────────────────────────────────────────────────────────

@router.post("/profile/experience", response_model=ExperienceResponse, status_code=201)
def add_experience(
    body: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return profile_svc.add_experience(db, current_user, body)


@router.put("/profile/experience/{exp_id}", response_model=ExperienceResponse)
def update_experience(
    exp_id: uuid.UUID,
    body: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return profile_svc.update_experience(db, current_user, exp_id, body)


@router.delete("/profile/experience/{exp_id}", response_model=MessageResponse)
def delete_experience(
    exp_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    profile_svc.delete_experience(db, current_user, exp_id)
    return MessageResponse(message="Experience record deleted")


# ── Skills ────────────────────────────────────────────────────────────────────

@router.post("/profile/skills", response_model=SkillResponse, status_code=201)
def add_skill(
    body: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return profile_svc.add_skill(db, current_user, body)


@router.delete("/profile/skills/{skill_id}", response_model=MessageResponse)
def delete_skill(
    skill_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    profile_svc.delete_skill(db, current_user, skill_id)
    return MessageResponse(message="Skill deleted")


# ── Preferences ───────────────────────────────────────────────────────────────

@router.get("/profile/preferences", response_model=PreferencesResponse | None)
def get_preferences(db: Session = Depends(get_db), current_user: User = Depends(require_job_seeker)):
    prefs = profile_svc.get_preferences(db, current_user)
    return PreferencesResponse.model_validate(prefs) if prefs else None


@router.put("/profile/preferences", response_model=PreferencesResponse)
def upsert_preferences(
    body: PreferencesUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return profile_svc.upsert_preferences(db, current_user, body)


# ── Applications ──────────────────────────────────────────────────────────────

@router.get("/applications", response_model=PaginatedResponse)
def list_applications(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    return app_svc.list_seeker_applications(db, current_user, page, page_size)


@router.delete("/applications/{app_id}", response_model=ApplicationResponse)
def withdraw_application(
    app_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_job_seeker),
):
    app = app_svc.withdraw_application(db, app_id, current_user)
    return app_svc._enrich(app, db)
