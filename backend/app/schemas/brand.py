from pydantic import BaseModel
from typing import Optional

class BrandBase(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    description: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BrandBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class BrandResponse(BrandBase):
    id: int

    class Config:
        from_attributes = True
