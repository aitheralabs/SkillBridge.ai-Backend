"""Seed the database with fake data using SQLAlchemy directly."""
import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

engine = create_engine(settings.DATABASE_URL, connect_args={"charset": "utf8mb4"})
Session = sessionmaker(bind=engine)
db = Session()

now = datetime.now(timezone.utc)
PWD = "$2b$12$VHhX4CDVP.PJ09Nv/b1b9u/fbtcnwfY8oatTTomSxAUpp0CzmLWdO"

# Fixed UUIDs for reproducibility
U_REC_1  = "a1000000-0000-0000-0000-000000000001"
U_REC_2  = "a1000000-0000-0000-0000-000000000002"
U_REC_3  = "a1000000-0000-0000-0000-000000000003"
U_JS_1   = "b2000000-0000-0000-0000-000000000001"
U_JS_2   = "b2000000-0000-0000-0000-000000000002"
U_JS_3   = "b2000000-0000-0000-0000-000000000003"
U_ADM    = "c3000000-0000-0000-0000-000000000001"

C_1      = "d4000000-0000-0000-0000-000000000001"
C_2      = "d4000000-0000-0000-0000-000000000002"
C_3      = "d4000000-0000-0000-0000-000000000003"

CM_1     = "e5000000-0000-0000-0000-000000000001"
CM_2     = "e5000000-0000-0000-0000-000000000002"
CM_3     = "e5000000-0000-0000-0000-000000000003"

J = [
    "f6000000-0000-0000-0000-000000000001",
    "f6000000-0000-0000-0000-000000000002",
    "f6000000-0000-0000-0000-000000000003",
    "f6000000-0000-0000-0000-000000000004",
    "f6000000-0000-0000-0000-000000000005",
    "f6000000-0000-0000-0000-000000000006",
    "f6000000-0000-0000-0000-000000000007",
    "f6000000-0000-0000-0000-000000000008",
    "f6000000-0000-0000-0000-000000000009",
    "f6000000-0000-0000-0000-000000000010",
]

JSP_1    = "17000000-0000-0000-0000-000000000001"
JSP_2    = "17000000-0000-0000-0000-000000000002"
JSP_3    = "17000000-0000-0000-0000-000000000003"

APP = [
    "28000000-0000-0000-0000-000000000001",
    "28000000-0000-0000-0000-000000000002",
    "28000000-0000-0000-0000-000000000003",
    "28000000-0000-0000-0000-000000000004",
    "28000000-0000-0000-0000-000000000005",
    "28000000-0000-0000-0000-000000000006",
]

ASH = [f"39000000-0000-0000-0000-{str(i).zfill(12)}" for i in range(1, 11)]

try:
    db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
    for t in ["application_status_history", "applications", "jobs", "company_members",
              "companies", "job_seeker_profiles", "users"]:
        db.execute(text(f"TRUNCATE TABLE {t}"))
        print(f"[TRUNCATE] {t}")
    db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

    db.execute(text("""
        INSERT INTO users (id, email, password_hash, role, status, email_verified_at, created_at, updated_at) VALUES
        (:u1, 'alice@techcorp.com',    :pwd, 'RECRUITER',  'ACTIVE', :now, :now, :now),
        (:u2, 'bob@financeplus.com',   :pwd, 'RECRUITER',  'ACTIVE', :now, :now, :now),
        (:u3, 'carol@healthmed.com',   :pwd, 'RECRUITER',  'ACTIVE', :now, :now, :now),
        (:u4, 'john.doe@gmail.com',    :pwd, 'JOB_SEEKER', 'ACTIVE', :now, :now, :now),
        (:u5, 'jane.smith@gmail.com',  :pwd, 'JOB_SEEKER', 'ACTIVE', :now, :now, :now),
        (:u6, 'mike.dev@gmail.com',    :pwd, 'JOB_SEEKER', 'ACTIVE', :now, :now, :now),
        (:u7, 'admin@skillbridge.com', :pwd, 'ADMIN',      'ACTIVE', :now, :now, :now)
    """), {"u1": U_REC_1, "u2": U_REC_2, "u3": U_REC_3,
           "u4": U_JS_1,  "u5": U_JS_2,  "u6": U_JS_3, "u7": U_ADM,
           "pwd": PWD, "now": now})
    print("[OK] users")

    db.execute(text("""
        INSERT INTO companies (id, name, slug, description, industry, website_url,
            headquarters_location, verification_status, approved_at, created_by_user_id, created_at, updated_at) VALUES
        (:c1, 'TechCorp Inc.',   'techcorp-inc',    'Leading software solutions company.',        'TECHNOLOGY', 'https://techcorp.com',    'San Francisco, CA', 'APPROVED', :now, :u1, :now, :now),
        (:c2, 'Finance Plus',    'finance-plus',    'Global financial services and consulting.',  'FINANCE',    'https://financeplus.com', 'New York, NY',      'APPROVED', :now, :u2, :now, :now),
        (:c3, 'HealthMed Group', 'healthmed-group', 'Innovative healthcare technology provider.', 'HEALTHCARE', 'https://healthmed.com',   'Boston, MA',        'APPROVED', :now, :u3, :now, :now)
    """), {"c1": C_1, "c2": C_2, "c3": C_3, "u1": U_REC_1, "u2": U_REC_2, "u3": U_REC_3, "now": now})
    print("[OK] companies")

    db.execute(text("""
        INSERT INTO company_members (id, company_id, user_id, membership_role, status, joined_at, created_at) VALUES
        (:m1, :c1, :u1, 'OWNER', 'ACTIVE', :now, :now),
        (:m2, :c2, :u2, 'OWNER', 'ACTIVE', :now, :now),
        (:m3, :c3, :u3, 'OWNER', 'ACTIVE', :now, :now)
    """), {"m1": CM_1, "m2": CM_2, "m3": CM_3,
           "c1": C_1, "c2": C_2, "c3": C_3,
           "u1": U_REC_1, "u2": U_REC_2, "u3": U_REC_3, "now": now})
    print("[OK] company_members")

    jobs_data = [
        (J[0], C_1, "TechCorp Inc.",   U_REC_1, "Senior Backend Engineer",          "FULL_TIME",  "TECHNOLOGY", "SENIOR_LEVEL",  120000, 160000, "San Francisco, CA", '["Python","FastAPI","PostgreSQL","Docker"]'),
        (J[1], C_1, "TechCorp Inc.",   U_REC_1, "Frontend Developer (Angular)",     "FULL_TIME",  "TECHNOLOGY", "MID_LEVEL",      90000, 120000, "Remote",            '["Angular","TypeScript","RxJS"]'),
        (J[2], C_1, "TechCorp Inc.",   U_REC_1, "DevOps Engineer",                  "FULL_TIME",  "TECHNOLOGY", "MID_LEVEL",     100000, 140000, "San Francisco, CA", '["Kubernetes","Terraform","AWS"]'),
        (J[3], C_1, "TechCorp Inc.",   U_REC_1, "Junior Python Developer",          "FULL_TIME",  "TECHNOLOGY", "ENTRY_LEVEL",    60000,  80000, "Remote",            '["Python","REST APIs","Git"]'),
        (J[4], C_2, "Finance Plus",    U_REC_2, "Financial Analyst",                "FULL_TIME",  "FINANCE",    "MID_LEVEL",      85000, 110000, "New York, NY",      '["Excel","SQL","Python"]'),
        (J[5], C_2, "Finance Plus",    U_REC_2, "Risk Management Consultant",       "CONTRACT",   "FINANCE",    "SENIOR_LEVEL",  130000, 170000, "New York, NY",      '["Risk Analysis","SQL","VBA"]'),
        (J[6], C_2, "Finance Plus",    U_REC_2, "Data Engineer - Finance",          "FULL_TIME",  "FINANCE",    "MID_LEVEL",      95000, 125000, "Remote",            '["Spark","Airflow","Snowflake"]'),
        (J[7], C_3, "HealthMed Group", U_REC_3, "Healthcare Software Engineer",     "FULL_TIME",  "HEALTHCARE", "MID_LEVEL",      95000, 130000, "Boston, MA",        '["Java","Spring Boot","HL7 FHIR"]'),
        (J[8], C_3, "HealthMed Group", U_REC_3, "Data Scientist - Health Analytics","FULL_TIME",  "HEALTHCARE", "SENIOR_LEVEL",  110000, 150000, "Boston, MA",        '["Python","TensorFlow","R"]'),
        (J[9], C_3, "HealthMed Group", U_REC_3, "UX Designer - Medical Apps",       "PART_TIME",  "HEALTHCARE", "INTERMEDIATE",   50000,  70000, "Remote",            '["Figma","User Research","Accessibility"]'),
    ]

    for jid, cid, cname, uid, title, etype, industry, exp, smin, smax, loc, skills in jobs_data:
        db.execute(text("""
            INSERT INTO jobs (id, source_type, company_id, company_name_snapshot, title, description,
                location, employment_type, industry, experience_level, required_skills,
                salary_min, salary_max, currency, application_mode, status, published_at,
                created_by_user_id, created_at, updated_at)
            VALUES (:id, 'DIRECT', :cid, :cname, :title,
                'We are hiring a talented professional to join our growing team and work on exciting projects.',
                :loc, :etype, :industry, :exp, :skills,
                :smin, :smax, 'USD', 'INTERNAL', 'PUBLISHED', :now, :uid, :now, :now)
        """), {"id": jid, "cid": cid, "cname": cname, "uid": uid, "title": title,
               "loc": loc, "etype": etype, "industry": industry, "exp": exp,
               "skills": skills, "smin": smin, "smax": smax, "now": now})
    print("[OK] jobs (10)")

    db.execute(text("""
        INSERT INTO job_seeker_profiles (id, user_id, full_name, phone, headline, summary, current_location, visibility, created_at, updated_at) VALUES
        (:p1, :u1, 'John Doe',   '+1-555-0101', 'Full Stack Developer | Python & Angular', 'Passionate developer with 4 years of experience.', 'Austin, TX',  'PUBLIC', :now, :now),
        (:p2, :u2, 'Jane Smith', '+1-555-0102', 'Data Scientist | ML & Analytics',         'Data scientist with ML and statistical modeling.',  'Seattle, WA', 'PUBLIC', :now, :now),
        (:p3, :u3, 'Mike Dev',   '+1-555-0103', 'Backend Engineer | Java & Python',        'Backend engineer focused on scalable microservices.','Chicago, IL', 'PUBLIC', :now, :now)
    """), {"p1": JSP_1, "p2": JSP_2, "p3": JSP_3,
           "u1": U_JS_1, "u2": U_JS_2, "u3": U_JS_3, "now": now})
    print("[OK] job_seeker_profiles")

    db.execute(text("""
        INSERT INTO applications (id, job_id, job_seeker_user_id, cover_letter, status, submitted_at, updated_at) VALUES
        (:a1, :j1, :u1, 'I am excited about this role. My Python experience makes me a strong fit.',  'SUBMITTED',           :now, :now),
        (:a2, :j2, :u1, 'Angular is my primary framework and I would love to contribute.',            'UNDER_REVIEW',        :now, :now),
        (:a3, :j5, :u2, 'My background in data science aligns perfectly with this position.',         'SHORTLISTED',         :now, :now),
        (:a4, :j9, :u2, 'I have published research in health analytics.',                             'INTERVIEW_SCHEDULED', :now, :now),
        (:a5, :j8, :u3, 'I have 3 years of Java Spring Boot experience in healthcare systems.',       'SUBMITTED',           :now, :now),
        (:a6, :j3, :u3, 'I have hands-on Kubernetes and Terraform experience in production.',         'HIRED',               :now, :now)
    """), {"a1": APP[0], "a2": APP[1], "a3": APP[2], "a4": APP[3], "a5": APP[4], "a6": APP[5],
           "j1": J[0], "j2": J[1], "j3": J[2], "j5": J[4], "j8": J[7], "j9": J[8],
           "u1": U_JS_1, "u2": U_JS_2, "u3": U_JS_3, "now": now})
    print("[OK] applications")

    ash_data = [
        (ASH[0], APP[1], "SUBMITTED",           "UNDER_REVIEW",         U_REC_1, "Looks promising."),
        (ASH[1], APP[2], "SUBMITTED",           "UNDER_REVIEW",         U_REC_2, "Strong profile."),
        (ASH[2], APP[2], "UNDER_REVIEW",        "SHORTLISTED",          U_REC_2, "Shortlisted for interview."),
        (ASH[3], APP[3], "SUBMITTED",           "UNDER_REVIEW",         U_REC_3, "Reviewing application."),
        (ASH[4], APP[3], "UNDER_REVIEW",        "SHORTLISTED",          U_REC_3, "Great background."),
        (ASH[5], APP[3], "SHORTLISTED",         "INTERVIEW_SCHEDULED",  U_REC_3, "Interview scheduled."),
        (ASH[6], APP[5], "SUBMITTED",           "UNDER_REVIEW",         U_REC_1, "Strong DevOps background."),
        (ASH[7], APP[5], "UNDER_REVIEW",        "SHORTLISTED",          U_REC_1, "Top candidate."),
        (ASH[8], APP[5], "SHORTLISTED",         "INTERVIEW_SCHEDULED",  U_REC_1, "Very impressive."),
        (ASH[9], APP[5], "INTERVIEW_SCHEDULED", "HIRED",                U_REC_1, "Offer accepted!"),
    ]
    for ash_id, app_id, from_s, to_s, uid, note in ash_data:
        db.execute(text("""
            INSERT INTO application_status_history (id, application_id, from_status, to_status, changed_by_user_id, note, created_at)
            VALUES (:id, :app, :from_s, :to_s, :uid, :note, :now)
        """), {"id": ash_id, "app": app_id, "from_s": from_s, "to_s": to_s, "uid": uid, "note": note, "now": now})
    print("[OK] application_status_history")

    db.commit()
    print("\nSeed complete.")

except Exception as e:
    db.rollback()
    print(f"\n[ERROR] {e}")
    raise
finally:
    db.close()
