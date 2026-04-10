import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_recruiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.job import JobResponse, JobSummary
from app.services import application as app_svc
from app.services import job as job_svc

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=PaginatedResponse)
def search_jobs(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 20,
    q: str | None = None,
    location: str | None = None,
    industry: str | None = None,
    employment_type: str | None = None,
    experience_level: str | None = None,
    db: Session = Depends(get_db),
):
    return job_svc.search_jobs(
        db, page=page, page_size=page_size,
        q=q, location=location, industry=industry,
        employment_type=employment_type, experience_level=experience_level,
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: uuid.UUID, db: Session = Depends(get_db)):
    from app.services.job import get_public_job, _add_company
    from app.schemas.job import JobResponse
    job = get_public_job(db, job_id)
    resp = JobResponse.model_validate(job)
    _add_company(db, resp, job.company_id)
    return resp


@router.post("/{job_id}/apply", response_model=ApplicationResponse, status_code=201)
def apply_to_job(
    job_id: uuid.UUID,
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = app_svc.apply_to_job(db, job_id, body, current_user)
    return app_svc._enrich(app, db)
