from fastapi import APIRouter

from app.api.v1.endpoints import auth, jobs, job_seekers, recruiters, me, metadata

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(jobs.router)
api_router.include_router(job_seekers.router)
api_router.include_router(recruiters.router)
api_router.include_router(me.router)
api_router.include_router(metadata.router)
