import uuid
from datetime import datetime
from app.schemas.common import BaseSchema
from app.core.enums import NotificationType


class NotificationResponse(BaseSchema):
    id: uuid.UUID
    type: NotificationType
    title: str
    message: str
    payload: dict
    read_at: datetime | None
    created_at: datetime
    expires_at: datetime | None
