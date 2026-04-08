from fastapi import FastAPI
from app.db.session import init_db
from app.controller.v1.auth import router as auth_router

app = FastAPI(title="SkillBridge API")


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(auth_router, prefix="/api/v1")
