"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-10 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# MySQL stores UUIDs as CHAR(32) (no dashes) via SQLAlchemy's Uuid type
UUID_TYPE = sa.CHAR(32)

# Inline MySQL ENUMs
def _enum(*values):
    return sa.Enum(*values)


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", _enum("job_seeker", "recruiter", "admin"), nullable=False),
        sa.Column("status", _enum("active", "suspended", "deleted"), nullable=False, server_default="active"),
        sa.Column("email_verified_at", sa.DateTime(), nullable=True),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── refresh_tokens ────────────────────────────────────────────────────────
    op.create_table(
        "refresh_tokens",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"])

    # ── email_verification_tokens ─────────────────────────────────────────────
    op.create_table(
        "email_verification_tokens",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_email_verification_tokens_token_hash", "email_verification_tokens", ["token_hash"])

    # ── password_reset_tokens ─────────────────────────────────────────────────
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_password_reset_tokens_token_hash", "password_reset_tokens", ["token_hash"])

    # ── job_seeker_profiles ───────────────────────────────────────────────────
    op.create_table(
        "job_seeker_profiles",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("headline", sa.String(255), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("current_location", sa.String(255), nullable=True),
        sa.Column("visibility", _enum("public", "private", "connections_only"), nullable=False, server_default="public"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # ── profile_educations ────────────────────────────────────────────────────
    op.create_table(
        "profile_educations",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("profile_id", UUID_TYPE, sa.ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("institution_name", sa.String(255), nullable=False),
        sa.Column("degree", sa.String(255), nullable=True),
        sa.Column("field_of_study", sa.String(255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("grade", sa.String(50), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_profile_educations_profile_id", "profile_educations", ["profile_id"])

    # ── profile_experiences ───────────────────────────────────────────────────
    op.create_table(
        "profile_experiences",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("profile_id", UUID_TYPE, sa.ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("job_title", sa.String(255), nullable=False),
        sa.Column("employment_type", _enum("full_time", "part_time", "contract", "internship", "freelance"), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_profile_experiences_profile_id", "profile_experiences", ["profile_id"])

    # ── profile_skills ────────────────────────────────────────────────────────
    op.create_table(
        "profile_skills",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("profile_id", UUID_TYPE, sa.ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("skill_name", sa.String(100), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_profile_skills_profile_id", "profile_skills", ["profile_id"])

    # ── job_preferences ───────────────────────────────────────────────────────
    op.create_table(
        "job_preferences",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("profile_id", UUID_TYPE, sa.ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("desired_roles", sa.JSON(), nullable=True),
        sa.Column("preferred_locations", sa.JSON(), nullable=True),
        sa.Column("employment_types", sa.JSON(), nullable=True),
        sa.Column("expected_salary_min", sa.Integer(), nullable=True),
        sa.Column("expected_salary_max", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # ── companies ─────────────────────────────────────────────────────────────
    op.create_table(
        "companies",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("slug", sa.String(255), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("industry", _enum("technology", "finance", "healthcare", "education", "retail", "manufacturing", "media", "government", "nonprofit", "other"), nullable=True),
        sa.Column("website_url", sa.String(500), nullable=True),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("headquarters_location", sa.String(255), nullable=True),
        sa.Column("employee_count", sa.Integer(), nullable=True),
        sa.Column("founded_year", sa.Integer(), nullable=True),
        sa.Column("verification_status", _enum("pending", "verified", "rejected"), nullable=False, server_default="pending"),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("rejected_at", sa.DateTime(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("created_by_user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # ── company_members ───────────────────────────────────────────────────────
    op.create_table(
        "company_members",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("company_id", UUID_TYPE, sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("membership_role", _enum("owner", "admin", "member"), nullable=False, server_default="member"),
        sa.Column("status", _enum("active", "inactive", "invited"), nullable=False, server_default="active"),
        sa.Column("joined_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("removed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("company_id", "user_id", name="uq_company_member"),
    )

    # ── jobs ──────────────────────────────────────────────────────────────────
    op.create_table(
        "jobs",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("company_id", UUID_TYPE, sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("company_name_snapshot", sa.String(255), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("employment_type", _enum("full_time", "part_time", "contract", "internship", "freelance"), nullable=True),
        sa.Column("industry", _enum("technology", "finance", "healthcare", "education", "retail", "manufacturing", "media", "government", "nonprofit", "other"), nullable=True),
        sa.Column("experience_level", _enum("entry", "mid", "senior", "lead", "executive"), nullable=True),
        sa.Column("required_skills", sa.JSON(), nullable=True),
        sa.Column("salary_min", sa.Integer(), nullable=True),
        sa.Column("salary_max", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("application_deadline", sa.DateTime(), nullable=True),
        sa.Column("application_mode", _enum("internal", "external"), nullable=False, server_default="internal"),
        sa.Column("apply_url", sa.String(500), nullable=True),
        sa.Column("status", _enum("draft", "published", "closed", "archived"), nullable=False, server_default="draft"),
        sa.Column("source_type", _enum("direct", "scraped"), nullable=False, server_default="direct"),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("closed_at", sa.DateTime(), nullable=True),
        sa.Column("created_by_user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("updated_by_user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_jobs_status", "jobs", ["status"])
    op.create_index("ix_jobs_company_id", "jobs", ["company_id"])
    op.create_index("ix_jobs_title", "jobs", ["title"])

    # ── applications ──────────────────────────────────────────────────────────
    op.create_table(
        "applications",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("job_id", UUID_TYPE, sa.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_seeker_user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("status", _enum("submitted", "under_review", "shortlisted", "interview_scheduled", "offered", "hired", "rejected", "withdrawn"), nullable=False, server_default="submitted"),
        sa.Column("submitted_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("withdrawn_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("job_id", "job_seeker_user_id", name="uq_application_job_seeker"),
    )
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_seeker_id", "applications", ["job_seeker_user_id"])

    # ── application_status_history ────────────────────────────────────────────
    op.create_table(
        "application_status_history",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("application_id", UUID_TYPE, sa.ForeignKey("applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("from_status", _enum("submitted", "under_review", "shortlisted", "interview_scheduled", "offered", "hired", "rejected", "withdrawn"), nullable=True),
        sa.Column("to_status", _enum("submitted", "under_review", "shortlisted", "interview_scheduled", "offered", "hired", "rejected", "withdrawn"), nullable=False),
        sa.Column("changed_by_user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_app_history_application_id", "application_status_history", ["application_id"])

    # ── notifications ─────────────────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", UUID_TYPE, primary_key=True),
        sa.Column("user_id", UUID_TYPE, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", _enum("application_update", "job_match", "message", "system"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("application_status_history")
    op.drop_table("applications")
    op.drop_table("jobs")
    op.drop_table("company_members")
    op.drop_table("companies")
    op.drop_table("job_preferences")
    op.drop_table("profile_skills")
    op.drop_table("profile_experiences")
    op.drop_table("profile_educations")
    op.drop_table("job_seeker_profiles")
    op.drop_table("password_reset_tokens")
    op.drop_table("email_verification_tokens")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
