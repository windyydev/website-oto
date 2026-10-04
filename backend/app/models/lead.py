from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class LeadType(str, enum.Enum):
    consult = "consult"
    valuation = "valuation"
    consignment = "consignment"
    finance = "finance"
    concierge = "concierge"
    test_drive = "test_drive"

class LeadStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    done = "done"
    cancelled = "cancelled"

class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class LocationType(str, enum.Enum):
    showroom = "showroom"
    home = "home"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    type = Column(Enum(LeadType), nullable=False)
    source = Column(String(100), nullable=True)
    message = Column(Text, nullable=True)
    
    interested_car_id = Column(Integer, ForeignKey("cars.id"), nullable=True)
    status = Column(Enum(LeadStatus), default=LeadStatus.new)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    interested_car = relationship("Car", back_populates="leads")
    appointment = relationship("TestDriveAppointment", back_populates="lead", uselist=False)

class TestDriveAppointment(Base):
    __tablename__ = "test_drive_appointments"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), unique=True, nullable=False)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=True)
    
    appointment_date = Column(DateTime(timezone=True), nullable=False)
    time_slot = Column(String(50), nullable=False)
    location_type = Column(Enum(LocationType), default=LocationType.showroom)
    address = Column(String(255), nullable=True)
    route = Column(String(255), nullable=True)
    booking_code = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.pending)
    notes = Column(Text, nullable=True)

    lead = relationship("Lead", back_populates="appointment")
    car = relationship("Car", back_populates="test_drives")
    consultant = relationship("Consultant", back_populates="appointments")
