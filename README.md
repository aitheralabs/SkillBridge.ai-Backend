# SkillBridge API

FastAPI backend with JWT authentication, PostgreSQL, and SQLAlchemy.

## Project Structure

```
backend/
├── app/
│   ├── config/         # Settings and logger
│   ├── controller/v1/  # Route handlers
│   ├── db/
│   │   ├── models/     # SQLAlchemy models
│   │   ├── base.py     # DeclarativeBase
│   │   └── session.py  # DB engine, session, init_db
│   ├── schemas/        # Pydantic request/response models
│   ├── services/       # Business logic
│   ├── utils/          # JWT, password helpers
│   └── main.py         # App entrypoint
├── .env
├── .env.example
└── requirements.txt
```

## Setup

1. Clone the repo and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Auth Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/v1/auth/signup         | Register a new user      |
| POST   | /api/v1/auth/login          | Login, returns JWT       |
| POST   | /api/v1/auth/forgot-password| Send password reset link |
| POST   | /api/v1/auth/reset-password | Reset password via token |
| GET    | /api/v1/auth/activate       | Activate account         |
| POST   | /api/v1/auth/resend-email   | Resend activation email  |
| POST   | /api/v1/auth/refresh        | Refresh access token     |

## Docs

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
