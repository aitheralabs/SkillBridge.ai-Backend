import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_recruiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.application import ApplicationStatusUpdate, ApplicationWithSeeker
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.schemas.job import JobCreate, JobUpdate, JobStatusUpdate, JobResponse
from app.services import application as app_svc
from app.services import company as company_svc
from app.services import job as job_svc

router = APIRouter(prefix="/recruiter", tags=["recruiter"])


# ── Company ───────────────────────────────────────────────────────────────────

@router.get("/company", response_model=CompanyResponse)
def get_company(db: Session = Depends(get_db), current_user: User = Depends(require_recruiter)):
    return company_svc.get_company_for_user(db, current_user)


@router.post("/company", response_model=CompanyResponse, status_code=201)
def create_company(
    body: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    return company_svc.create_company(db, body, current_user)


@router.patch("/company", response_model=CompanyResponse)
def update_company(
    body: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    return company_svc.update_company(db, body, current_user)


# ── Jobs ──────────────────────────────────────────────────────────────────────

@router.get("/jobs", response_model=PaginatedResponse)
def list_jobs(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    return job_svc.list_recruiter_jobs(db, current_user, page, page_size)


@router.post("/jobs", response_model=JobResponse, status_code=201)
def create_job(
    body: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    job = job_svc.create_job(db, body, current_user)
    resp = JobResponse.model_validate(job)
    job_svc._add_company(db, resp, job.company_id)
    return resp


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    job = job_svc.get_recruiter_job(db, job_id, current_user)
    resp = JobResponse.model_validate(job)
    job_svc._add_company(db, resp, job.company_id)
    return resp


@router.patch("/jobs/{job_id}", response_model=JobResponse)
def update_job(
    job_id: uuid.UUID,
    body: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    job = job_svc.update_job(db, job_id, body, current_user)
    resp = JobResponse.model_validate(job)
    job_svc._add_company(db, resp, job.company_id)
    return resp


@router.patch("/jobs/{job_id}/status", response_model=JobResponse)
def update_job_status(
    job_id: uuid.UUID,
    body: JobStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    job = job_svc.update_job_status(db, job_id, body, current_user)
    resp = JobResponse.model_validate(job)
    job_svc._add_company(db, resp, job.company_id)
    return resp


# ── Applications ──────────────────────────────────────────────────────────────

@router.get("/jobs/{job_id}/applications", response_model=PaginatedResponse)
def list_job_applications(
    job_id: uuid.UUID,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    return app_svc.list_job_applications(db, job_id, current_user, page, page_size)


@router.patch("/applications/{app_id}/status", response_model=ApplicationWithSeeker)
def update_application_status(
    app_id: uuid.UUID,
    body: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    app = app_svc.update_application_status(db, app_id, body, current_user)
    return app_svc._enrich_with_seeker(app, db)
