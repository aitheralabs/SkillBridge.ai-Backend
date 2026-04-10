from fastapi import APIRouter

from app.core.enums import (
    UserRole, EmploymentType, ExperienceLevel, Industry,
    ApplicationStatus, ApplicationMode, JobListingStatus,
)

router = APIRouter(prefix="/meta", tags=["metadata"])


@router.get("/enums")
def get_enums():
    return {
        "userRoles": [e.value for e in UserRole],
        "employmentTypes": [e.value for e in EmploymentType],
        "experienceLevels": [e.value for e in ExperienceLevel],
        "industries": [e.value for e in Industry],
        "applicationStatuses": [e.value for e in ApplicationStatus],
        "applicationModes": [e.value for e in ApplicationMode],
        "jobListingStatuses": [e.value for e in JobListingStatus],
    }
