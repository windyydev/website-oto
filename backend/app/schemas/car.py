from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.car import CarCondition, CarStatus, ImageCategory

class CarImageResponse(BaseModel):
    id: int
    image_url: str
    s3_key: Optional[str] = None
    category: ImageCategory
    sort_order: int
    is_primary: bool

    class Config:
        from_attributes = True

class ImageOrderItem(BaseModel):
    id: int
    sort_order: int
    is_primary: bool = False

class CarColorBase(BaseModel):
    name: str
    hex_code: str
    color_type: str = "standard" # standard | metallic | bespoke
    price_delta: float = 0.0
    images: List[str] = []
    sort_order: int = 0
    is_default: bool = False

class CarColorCreate(CarColorBase):
    car_id: Optional[int] = None

class CarColorResponse(CarColorBase):
    id: int
    car_id: int

    class Config:
        from_attributes = True

class CarOptionBase(BaseModel):
    group: str
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    price: float = 0.0
    is_standard: bool = False
    is_selected: bool = False
    sort_order: int = 0

class CarOptionCreate(CarOptionBase):
    car_id: Optional[int] = None


class CarOptionResponse(CarOptionBase):
    id: int
    car_id: int

    class Config:
        from_attributes = True

class CarBase(BaseModel):
    brand_id: int
    category_id: Optional[int] = None
    name: str
    slug: str
    stock_code: Optional[str] = None
    vin: Optional[str] = None
    price: float
    monthly_installment: Optional[float] = None
    year: int
    body_type: str
    fuel_type: str
    transmission: str
    drivetrain: str
    odo_km: int = 0
    condition: CarCondition
    status: CarStatus
    exterior_color: Optional[str] = None
    interior: Optional[str] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    owners_count: int = 0
    is_ready: bool = True
    has_factory_warranty: bool = False
    warranty_months: int = 0
    is_inspected: bool = False
    is_featured: bool = False
    specs: Optional[List[Dict[str, Any]]] = None

class CarCreate(CarBase):
    pass

class CarResponse(CarBase):
    id: int
    images: List[CarImageResponse] = []
    colors: List[CarColorResponse] = []
    options: List[CarOptionResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CarListResponse(BaseModel):
    items: List[CarResponse]
    total: int
    page: int
    page_size: int
    facets: Optional[Dict[str, Any]] = None
