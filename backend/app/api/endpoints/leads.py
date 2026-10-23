from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.lead import Lead, TestDriveAppointment, LeadType, LeadStatus, AppointmentStatus
from app.schemas.lead import (
    LeadCreate, LeadResponse, LeadStatusUpdate,
    TestDriveCreate, TestDriveResponse
)

router = APIRouter()

@router.get("/", response_model=List[LeadResponse])
def get_leads(
    type: Optional[LeadType] = None,
    status: Optional[LeadStatus] = None,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Lấy danh sách tất cả các Lead liên hệ (Dành cho Admin)."""
    query = db.query(Lead)
    if type:
        query = query.filter(Lead.type == type)
    if status:
        query = query.filter(Lead.status == status)
    
    leads = query.order_by(desc(Lead.created_at)).all()
    
    results = []
    for lead in leads:
        lead_dict = {
            "id": lead.id,
            "name": lead.name,
            "phone": lead.phone,
            "email": lead.email,
            "type": lead.type,
            "source": lead.source,
            "message": lead.message,
            "interested_car_id": lead.interested_car_id,
            "status": lead.status,
            "created_at": lead.created_at,
            "interested_car_name": lead.interested_car.name if lead.interested_car else None
        }
        results.append(lead_dict)
        
    return results

@router.patch("/{id}/status", response_model=LeadResponse)
def update_lead_status(
    id: int,
    data: LeadStatusUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Cập nhật trạng thái xử lý của Lead."""
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Không tìm thấy Lead")
        
    lead.status = data.status
    db.commit()
    db.refresh(lead)
    
    return {
        "id": lead.id,
        "name": lead.name,
        "phone": lead.phone,
        "email": lead.email,
        "type": lead.type,
        "source": lead.source,
        "message": lead.message,
        "interested_car_id": lead.interested_car_id,
        "status": lead.status,
        "created_at": lead.created_at,
        "interested_car_name": lead.interested_car.name if lead.interested_car else None
    }

@router.get("/test-drives", response_model=List[TestDriveResponse])
def get_test_drives(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Lấy danh sách lịch hẹn lái thử (Dành cho Admin)."""
    appointments = db.query(TestDriveAppointment).order_by(desc(TestDriveAppointment.appointment_date)).all()
    results = []
    for app in appointments:
        results.append({
            "id": app.id,
            "booking_code": app.booking_code,
            "status": app.status,
            "appointment_date": app.appointment_date,
            "time_slot": app.time_slot,
            "lead_id": app.lead_id,
            "car_id": app.car_id,
            "car_name": app.car.name if app.car else None,
            "customer_name": app.lead.name if app.lead else None,
            "customer_phone": app.lead.phone if app.lead else None,
            "notes": app.notes
        })
    return results

@router.post("/", response_model=LeadResponse)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """Gửi form liên hệ chung (tư vấn, định giá, trả góp...)"""
    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.post("/test-drive", response_model=TestDriveResponse)
def create_test_drive(data: TestDriveCreate, db: Session = Depends(get_db)):
    """Gửi form đặt lịch lái thử, tự động tạo khách hàng và trả về booking_code"""
    
    # 1. Tạo thông tin khách hàng (Lead)
    new_lead = Lead(
        name=data.name,
        phone=data.phone,
        email=data.email,
        type=LeadType.test_drive,
        interested_car_id=data.car_id,
        message=data.notes
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    
    # 2. Sinh mã đặt lịch
    booking_code = f"ATL-{datetime.now().year}-{str(uuid.uuid4().hex[:4]).upper()}"
    
    # 3. Tạo lịch hẹn (Appointment)
    appointment = TestDriveAppointment(
        lead_id=new_lead.id,
        car_id=data.car_id,
        appointment_date=data.appointment_date,
        time_slot=data.time_slot,
        location_type=data.location_type,
        address=data.address,
        booking_code=booking_code,
        notes=data.notes
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return {
        "id": appointment.id,
        "booking_code": appointment.booking_code,
        "status": appointment.status,
        "appointment_date": appointment.appointment_date,
        "time_slot": appointment.time_slot,
        "lead_id": appointment.lead_id,
        "car_id": appointment.car_id,
        "car_name": appointment.car.name if appointment.car else None,
        "customer_name": new_lead.name,
        "customer_phone": new_lead.phone,
        "notes": appointment.notes
    }
