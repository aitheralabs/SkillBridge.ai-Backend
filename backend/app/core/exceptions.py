from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(404, "NOT_FOUND", message)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Access denied"):
        super().__init__(403, "FORBIDDEN", message)


class ConflictError(AppError):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(409, "CONFLICT", message)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(401, "UNAUTHORIZED", message)


class BadRequestError(AppError):
    def __init__(self, message: str = "Bad request"):
        super().__init__(400, "BAD_REQUEST", message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        field_errors: dict[str, list[str]] = {}
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"][1:])
            field_errors.setdefault(field, []).append(error["msg"])
        return JSONResponse(
            status_code=422,
            content={
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "fieldErrors": field_errors,
            },
        )
