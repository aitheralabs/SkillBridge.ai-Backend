import uuid
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError
from app.models.job_seeker import (
    JobSeekerProfile, ProfileEducation, ProfileExperience, ProfileSkill, JobPreference
)
from app.models.user import User
from app.schemas.job_seeker import (
    ProfileUpdate, ProfileResponse, EducationCreate, EducationResponse,
    ExperienceCreate, ExperienceResponse, SkillCreate, SkillResponse,
    PreferencesUpsert, PreferencesResponse,
)


def get_or_create(db: Session, user: User) -> JobSeekerProfile:
    p = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == user.id).first()
    if not p:
        p = JobSeekerProfile(user_id=user.id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def build_response(db: Session, profile: JobSeekerProfile) -> ProfileResponse:
    edus = db.query(ProfileEducation).filter(ProfileEducation.profile_id == profile.id).order_by(ProfileEducation.sort_order).all()
    exps = db.query(ProfileExperience).filter(ProfileExperience.profile_id == profile.id).order_by(ProfileExperience.sort_order).all()
    skills = db.query(ProfileSkill).filter(ProfileSkill.profile_id == profile.id).order_by(ProfileSkill.sort_order).all()
    prefs = db.query(JobPreference).filter(JobPreference.profile_id == profile.id).first()
    resp = ProfileResponse.model_validate(profile)
    resp.educations = [EducationResponse.model_validate(e) for e in edus]
    resp.experiences = [ExperienceResponse.model_validate(e) for e in exps]
    resp.skills = [SkillResponse.model_validate(s) for s in skills]
    resp.preferences = PreferencesResponse.model_validate(prefs) if prefs else None
    return resp


def update_profile(db: Session, user: User, data: ProfileUpdate) -> JobSeekerProfile:
    p = get_or_create(db, user)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


def add_education(db: Session, user: User, data: EducationCreate) -> ProfileEducation:
    p = get_or_create(db, user)
    edu = ProfileEducation(profile_id=p.id, **data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


def update_education(db: Session, user: User, edu_id: uuid.UUID, data: EducationCreate) -> ProfileEducation:
    p = get_or_create(db, user)
    edu = db.query(ProfileEducation).filter(ProfileEducation.id == edu_id, ProfileEducation.profile_id == p.id).first()
    if not edu:
        raise NotFoundError("Education record not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(edu, k, v)
    db.commit()
    db.refresh(edu)
    return edu


def delete_education(db: Session, user: User, edu_id: uuid.UUID) -> None:
    p = get_or_create(db, user)
    edu = db.query(ProfileEducation).filter(ProfileEducation.id == edu_id, ProfileEducation.profile_id == p.id).first()
    if not edu:
        raise NotFoundError("Education record not found")
    db.delete(edu)
    db.commit()


def add_experience(db: Session, user: User, data: ExperienceCreate) -> ProfileExperience:
    p = get_or_create(db, user)
    exp = ProfileExperience(profile_id=p.id, **data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def update_experience(db: Session, user: User, exp_id: uuid.UUID, data: ExperienceCreate) -> ProfileExperience:
    p = get_or_create(db, user)
    exp = db.query(ProfileExperience).filter(ProfileExperience.id == exp_id, ProfileExperience.profile_id == p.id).first()
    if not exp:
        raise NotFoundError("Experience record not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(exp, k, v)
    db.commit()
    db.refresh(exp)
    return exp


def delete_experience(db: Session, user: User, exp_id: uuid.UUID) -> None:
    p = get_or_create(db, user)
    exp = db.query(ProfileExperience).filter(ProfileExperience.id == exp_id, ProfileExperience.profile_id == p.id).first()
    if not exp:
        raise NotFoundError("Experience record not found")
    db.delete(exp)
    db.commit()


def add_skill(db: Session, user: User, data: SkillCreate) -> ProfileSkill:
    p = get_or_create(db, user)
    skill = ProfileSkill(profile_id=p.id, **data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def delete_skill(db: Session, user: User, skill_id: uuid.UUID) -> None:
    p = get_or_create(db, user)
    skill = db.query(ProfileSkill).filter(ProfileSkill.id == skill_id, ProfileSkill.profile_id == p.id).first()
    if not skill:
        raise NotFoundError("Skill not found")
    db.delete(skill)
    db.commit()


def get_preferences(db: Session, user: User) -> JobPreference | None:
    p = get_or_create(db, user)
    return db.query(JobPreference).filter(JobPreference.profile_id == p.id).first()


def upsert_preferences(db: Session, user: User, data: PreferencesUpsert) -> JobPreference:
    p = get_or_create(db, user)
    prefs = db.query(JobPreference).filter(JobPreference.profile_id == p.id).first()
    if not prefs:
        prefs = JobPreference(profile_id=p.id, **data.model_dump())
        db.add(prefs)
    else:
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(prefs, k, v)
    db.commit()
    db.refresh(prefs)
    return prefs
