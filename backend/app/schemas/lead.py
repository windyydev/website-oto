from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.models.lead import LeadType, LeadStatus, AppointmentStatus, LocationType

class LeadBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    type: LeadType
    source: Optional[str] = None
    message: Optional[str] = None
    interested_car_id: Optional[int] = None

class LeadCreate(LeadBase):
    pass

class LeadStatusUpdate(BaseModel):
    status: LeadStatus

class LeadResponse(LeadBase):
    id: int
    status: LeadStatus
    created_at: datetime
    interested_car_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class TestDriveCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    car_id: int
    appointment_date: datetime
    time_slot: str
    location_type: LocationType = LocationType.showroom
    address: Optional[str] = None
    notes: Optional[str] = None

class TestDriveResponse(BaseModel):
    id: int
    booking_code: str
    status: AppointmentStatus
    appointment_date: datetime
    time_slot: str
    lead_id: Optional[int] = None
    car_id: Optional[int] = None
    car_name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True
