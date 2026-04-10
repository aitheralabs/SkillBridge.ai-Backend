import uuid
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationStatusHistory
from app.core.enums import ApplicationStatus
from app.repositories.base import BaseRepository


class ApplicationRepository(BaseRepository):
    model = Application

    def get_by_job_and_seeker(
        self, db: Session, job_id: uuid.UUID, seeker_user_id: uuid.UUID
    ) -> Application | None:
        return (
            db.query(Application)
            .filter(
                Application.job_id == job_id,
                Application.job_seeker_user_id == seeker_user_id,
            )
            .first()
        )

    def get_by_seeker(
        self, db: Session, user_id: uuid.UUID, page: int, page_size: int
    ) -> tuple[list[Application], int]:
        q = db.query(Application).filter(Application.job_seeker_user_id == user_id)
        total = q.count()
        items = (
            q.order_by(Application.submitted_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def get_by_job(
        self, db: Session, job_id: uuid.UUID, page: int, page_size: int
    ) -> tuple[list[Application], int]:
        q = db.query(Application).filter(Application.job_id == job_id)
        total = q.count()
        items = (
            q.order_by(Application.submitted_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def add_history(
        self,
        db: Session,
        application_id: uuid.UUID,
        from_status: ApplicationStatus | None,
        to_status: ApplicationStatus,
        changed_by_user_id: uuid.UUID,
        note: str | None = None,
    ) -> ApplicationStatusHistory:
        entry = ApplicationStatusHistory(
            application_id=application_id,
            from_status=from_status,
            to_status=to_status,
            changed_by_user_id=changed_by_user_id,
            note=note,
        )
        db.add(entry)
        db.commit()
        return entry


application_repo = ApplicationRepository()
