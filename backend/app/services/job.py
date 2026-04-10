import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.enums import JobListingStatus
from app.core.exceptions import NotFoundError
from app.models.job import Job
from app.models.user import User
from app.repositories.job import job_repo
from app.repositories.company import company_repo
from app.schemas.common import PaginatedResponse
from app.schemas.job import JobCreate, JobUpdate, JobStatusUpdate, JobSummary, JobResponse
from app.schemas.company import CompanySummary
from app.models.company import Company


def _add_company(db: Session, resp: JobResponse, company_id: uuid.UUID | None) -> JobResponse:
    if company_id:
        company = db.query(Company).filter(Company.id == company_id).first()
        if company:
            resp.company = CompanySummary.model_validate(company)
    return resp


def create_job(db: Session, data: JobCreate, user: User) -> Job:
    company = company_repo.get_by_member(db, user.id)
    job = Job(
        company_id=company.id if company else None,
        company_name_snapshot=company.name if company else "Unknown",
        title=data.title,
        description=data.description,
        location=data.location,
        employment_type=data.employment_type,
        industry=data.industry,
        experience_level=data.experience_level,
        required_skills=data.required_skills,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        currency=data.currency,
        application_deadline=data.application_deadline,
        application_mode=data.application_mode,
        apply_url=data.apply_url,
        status=data.status,
        published_at=datetime.now(timezone.utc) if data.status == JobListingStatus.PUBLISHED else None,
        created_by_user_id=user.id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def update_job(db: Session, job_id: uuid.UUID, data: JobUpdate, user: User) -> Job:
    job = job_repo.get_for_recruiter(db, job_id, user.id)
    if not job:
        raise NotFoundError("Job not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(job, k, v)
    job.updated_by_user_id = user.id
    db.commit()
    db.refresh(job)
    return job


def update_job_status(db: Session, job_id: uuid.UUID, data: JobStatusUpdate, user: User) -> Job:
    job = job_repo.get_for_recruiter(db, job_id, user.id)
    if not job:
        raise NotFoundError("Job not found")
    if data.status == JobListingStatus.PUBLISHED and not job.published_at:
        job.published_at = datetime.now(timezone.utc)
    if data.status == JobListingStatus.CLOSED and not job.closed_at:
        job.closed_at = datetime.now(timezone.utc)
    job.status = data.status
    job.updated_by_user_id = user.id
    db.commit()
    db.refresh(job)
    return job


def get_public_job(db: Session, job_id: uuid.UUID) -> Job:
    job = db.query(Job).filter(Job.id == job_id, Job.status == JobListingStatus.PUBLISHED).first()
    if not job:
        raise NotFoundError("Job not found")
    return job


def get_recruiter_job(db: Session, job_id: uuid.UUID, user: User) -> Job:
    job = job_repo.get_for_recruiter(db, job_id, user.id)
    if not job:
        raise NotFoundError("Job not found")
    return job


def search_jobs(db: Session, page: int, page_size: int, **filters) -> PaginatedResponse:
    # map frontend 'q' param to repo's 'search' param
    if 'q' in filters:
        filters['search'] = filters.pop('q')
    items, total = job_repo.search(db, page=page, page_size=page_size, **filters)
    return PaginatedResponse(
        items=[JobSummary.model_validate(j) for j in items],
        page=page,
        page_size=page_size,
        total=total,
        has_next=(page * page_size) < total,
    )


def list_recruiter_jobs(db: Session, user: User, page: int, page_size: int) -> PaginatedResponse:
    items, total = job_repo.get_by_recruiter(db, user.id, page, page_size)
    resp_items = []
    for j in items:
        r = JobResponse.model_validate(j)
        _add_company(db, r, j.company_id)
        resp_items.append(r)
    return PaginatedResponse(
        items=resp_items,
        page=page,
        page_size=page_size,
        total=total,
        has_next=(page * page_size) < total,
    )
