import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.job import Job
from app.core.enums import JobListingStatus
from app.repositories.base import BaseRepository


class JobRepository(BaseRepository):
    model = Job

    def search(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        location: str | None = None,
        employment_type=None,
        industry=None,
        experience_level=None,
        salary_min: int | None = None,
        salary_max: int | None = None,
        status: JobListingStatus = JobListingStatus.PUBLISHED,
    ) -> tuple[list[Job], int]:
        q = db.query(Job).filter(Job.status == status)
        if search:
            pattern = f"%{search}%"
            q = q.filter(
                or_(
                    Job.title.ilike(pattern),
                    Job.company_name_snapshot.ilike(pattern),
                    Job.location.ilike(pattern),
                )
            )
        if location:
            q = q.filter(Job.location.ilike(f"%{location}%"))
        if employment_type:
            q = q.filter(Job.employment_type == employment_type)
        if industry:
            q = q.filter(Job.industry == industry)
        if experience_level:
            q = q.filter(Job.experience_level == experience_level)
        if salary_min is not None:
            q = q.filter(Job.salary_max >= salary_min)
        if salary_max is not None:
            q = q.filter(Job.salary_min <= salary_max)
        total = q.count()
        items = (
            q.order_by(Job.published_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def get_by_recruiter(
        self, db: Session, user_id: uuid.UUID, page: int, page_size: int
    ) -> tuple[list[Job], int]:
        q = db.query(Job).filter(Job.created_by_user_id == user_id)
        total = q.count()
        items = (
            q.order_by(Job.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def get_for_recruiter(
        self, db: Session, job_id: uuid.UUID, user_id: uuid.UUID
    ) -> Job | None:
        return (
            db.query(Job)
            .filter(Job.id == job_id, Job.created_by_user_id == user_id)
            .first()
        )


job_repo = JobRepository()
