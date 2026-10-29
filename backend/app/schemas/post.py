from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PostBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    cover_url: Optional[str] = None
    category: Optional[str] = None
    is_published: bool = False

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_url: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None

class PostResponse(PostBase):
    id: int
    published_at: datetime
    
    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    items: list[PostResponse]
    total: int
    page: int
    page_size: int


