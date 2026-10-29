from pydantic import BaseModel
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    level: int = 1
    sort_order: int = 0
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    level: Optional[int] = None
    sort_order: Optional[int] = None
    parent_id: Optional[int] = None

class CategoryResponse(CategoryBase):

    id: int

    class Config:
        from_attributes = True

class CategoryTreeResponse(CategoryResponse):
    children: List['CategoryTreeResponse'] = []
    cars_count: Optional[int] = 0

    class Config:
        from_attributes = True
