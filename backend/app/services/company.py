from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.enums import MembershipRole, MembershipStatus, CompanyVerificationStatus
from app.core.exceptions import ConflictError, NotFoundError
from app.models.company import Company, CompanyMember
from app.models.user import User
from app.repositories.company import company_repo
from app.schemas.company import CompanyCreate, CompanyUpdate


def create_company(db: Session, data: CompanyCreate, user: User) -> Company:
    if company_repo.get_by_member(db, user.id):
        raise ConflictError("You already belong to a company")
    if company_repo.get_by_name(db, data.name):
        raise ConflictError("Company name already taken")
    company = Company(
        name=data.name,
        slug=company_repo.unique_slug(db, data.name),
        description=data.description,
        industry=data.industry,
        website_url=data.website_url,
        headquarters_location=data.headquarters_location,
        verification_status=CompanyVerificationStatus.PENDING,
        submitted_at=datetime.now(timezone.utc),
        created_by_user_id=user.id,
    )
    db.add(company)
    db.flush()
    db.add(CompanyMember(
        company_id=company.id,
        user_id=user.id,
        membership_role=MembershipRole.OWNER,
        status=MembershipStatus.ACTIVE,
    ))
    db.commit()
    db.refresh(company)
    return company


def get_company_for_user(db: Session, user: User) -> Company:
    company = company_repo.get_by_member(db, user.id)
    if not company:
        raise NotFoundError("No company found. Please create one first.")
    return company


def update_company(db: Session, data: CompanyUpdate, user: User) -> Company:
    company = get_company_for_user(db, user)
    updates = data.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"] != company.name:
        if company_repo.get_by_name(db, updates["name"]):
            raise ConflictError("Company name already taken")
        updates["slug"] = company_repo.unique_slug(db, updates["name"])
    for k, v in updates.items():
        setattr(company, k, v)
    db.commit()
    db.refresh(company)
    return company
