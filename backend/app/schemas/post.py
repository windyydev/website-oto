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

class PostResponse(PostBase):
    id: int
    published_at: datetime
    
    class Config:
        from_attributes = True
