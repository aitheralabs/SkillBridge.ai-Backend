from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class PaginatedResponse(BaseSchema, Generic[T]):
    items: list[T]
    page: int
    page_size: int
    total: int
    has_next: bool


class MessageResponse(BaseSchema):
    message: str
