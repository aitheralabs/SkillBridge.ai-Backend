import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.enums import (
    ApplicationStatus, JobListingStatus, ApplicationMode,
    APPLICATION_STATUS_TRANSITIONS, TERMINAL_STATUSES,
)
from app.core.exceptions import NotFoundError, ForbiddenError, BadRequestError, ConflictError
from app.models.application import Application
from app.models.job import Job
from app.models.job_seeker import JobSeekerProfile
from app.models.user import User
from app.repositories.application import application_repo
from app.schemas.application import (
    ApplicationCreate, ApplicationStatusUpdate,
    ApplicationResponse, ApplicationWithSeeker, SeekerBrief,
)
from app.schemas.common import PaginatedResponse
from app.schemas.job import JobSummary


def _enrich(app: Application, db: Session) -> ApplicationResponse:
    resp = ApplicationResponse.model_validate(app)
    job = db.query(Job).filter(Job.id == app.job_id).first()
    if job:
        resp.job = JobSummary.model_validate(job)
    return resp


def _enrich_with_seeker(app: Application, db: Session) -> ApplicationWithSeeker:
    resp = ApplicationWithSeeker.model_validate(app)
    job = db.query(Job).filter(Job.id == app.job_id).first()
    if job:
        resp.job = JobSummary.model_validate(job)
    profile = db.query(JobSeekerProfile).filter(
        JobSeekerProfile.user_id == app.job_seeker_user_id
    ).first()
    if profile:
        resp.seeker = SeekerBrief(
            user_id=app.job_seeker_user_id,
            full_name=profile.full_name,
            headline=profile.headline,
            current_location=profile.current_location,
        )
    return resp


def apply_to_job(
    db: Session, job_id: uuid.UUID, data: ApplicationCreate, user: User
) -> Application:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.status != JobListingStatus.PUBLISHED:
        raise NotFoundError("Job not found or not accepting applications")
    if job.application_mode != ApplicationMode.INTERNAL:
        raise BadRequestError("This job requires an external application")
    if application_repo.get_by_job_and_seeker(db, job_id, user.id):
        raise ConflictError("You have already applied to this job")
    app = Application(
        job_id=job_id,
        job_seeker_user_id=user.id,
        cover_letter=data.cover_letter,
        status=ApplicationStatus.SUBMITTED,
    )
    db.add(app)
    db.flush()
    application_repo.add_history(db, app.id, None, ApplicationStatus.SUBMITTED, user.id)
    db.refresh(app)
    return app


def withdraw_application(db: Session, app_id: uuid.UUID, user: User) -> Application:
    app = application_repo.get(db, app_id)
    if not app or app.job_seeker_user_id != user.id:
        raise NotFoundError("Application not found")
    if app.status in TERMINAL_STATUSES:
        raise BadRequestError("Cannot withdraw a finalized application")
    prev = app.status
    app.status = ApplicationStatus.WITHDRAWN
    app.withdrawn_at = datetime.now(timezone.utc)
    db.commit()
    application_repo.add_history(db, app.id, prev, ApplicationStatus.WITHDRAWN, user.id)
    db.refresh(app)
    return app


def update_application_status(
    db: Session, app_id: uuid.UUID, data: ApplicationStatusUpdate, user: User
) -> Application:
    app = application_repo.get(db, app_id)
    if not app:
        raise NotFoundError("Application not found")
    job = db.query(Job).filter(Job.id == app.job_id).first()
    if not job or job.created_by_user_id != user.id:
        raise ForbiddenError("Not authorized to update this application")
    allowed = APPLICATION_STATUS_TRANSITIONS.get(app.status, set())
    if data.status not in allowed:
        raise BadRequestError(f"Cannot transition from {app.status} to {data.status}")
    prev = app.status
    app.status = data.status
    db.commit()
    application_repo.add_history(db, app.id, prev, data.status, user.id, data.note)
    db.refresh(app)
    return app


def list_seeker_applications(
    db: Session, user: User, page: int, page_size: int
) -> PaginatedResponse:
    items, total = application_repo.get_by_seeker(db, user.id, page, page_size)
    return PaginatedResponse(
        items=[_enrich(a, db) for a in items],
        page=page, page_size=page_size, total=total,
        has_next=(page * page_size) < total,
    )


def list_job_applications(
    db: Session, job_id: uuid.UUID, user: User, page: int, page_size: int
) -> PaginatedResponse:
    job = job_repo_check(db, job_id, user)
    items, total = application_repo.get_by_job(db, job_id, page, page_size)
    return PaginatedResponse(
        items=[_enrich_with_seeker(a, db) for a in items],
        page=page, page_size=page_size, total=total,
        has_next=(page * page_size) < total,
    )


def job_repo_check(db: Session, job_id: uuid.UUID, user: User) -> Job:
    from app.repositories.job import job_repo
    job = job_repo.get_for_recruiter(db, job_id, user.id)
    if not job:
        raise NotFoundError("Job not found")
    return job
