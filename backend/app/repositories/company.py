import re
import uuid
from sqlalchemy.orm import Session
from app.models.company import Company, CompanyMember
from app.core.enums import MembershipStatus
from app.repositories.base import BaseRepository


class CompanyRepository(BaseRepository):
    model = Company

    def get_by_name(self, db: Session, name: str) -> Company | None:
        return db.query(Company).filter(Company.name == name).first()

    def get_by_slug(self, db: Session, slug: str) -> Company | None:
        return db.query(Company).filter(Company.slug == slug).first()

    def get_by_member(self, db: Session, user_id: uuid.UUID) -> Company | None:
        member = (
            db.query(CompanyMember)
            .filter(
                CompanyMember.user_id == user_id,
                CompanyMember.status == MembershipStatus.ACTIVE,
            )
            .first()
        )
        if not member:
            return None
        return db.query(Company).filter(Company.id == member.company_id).first()

    @staticmethod
    def slugify(name: str) -> str:
        slug = name.lower().strip()
        slug = re.sub(r"[^\w\s-]", "", slug)
        slug = re.sub(r"[\s_-]+", "-", slug)
        slug = re.sub(r"^-+|-+$", "", slug)
        return slug

    def unique_slug(self, db: Session, name: str) -> str:
        base = self.slugify(name)
        slug, counter = base, 1
        while self.get_by_slug(db, slug):
            slug = f"{base}-{counter}"
            counter += 1
        return slug


company_repo = CompanyRepository()
