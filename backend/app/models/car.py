from sqlalchemy import Column, Integer, String, Text, Boolean, Float, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class CarCondition(str, enum.Enum):
    new = "new"
    used = "used"

class CarStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    sold = "sold"

class ImageCategory(str, enum.Enum):
    exterior = "exterior"
    interior = "interior"
    dashboard = "dashboard"
    wheels = "wheels"

class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    stock_code = Column(String(50), unique=True, nullable=True)
    vin = Column(String(50), unique=True, nullable=True)
    
    price = Column(Float, nullable=False)
    monthly_installment = Column(Float, nullable=True)
    
    year = Column(Integer, nullable=False, index=True)
    body_type = Column(String(50), nullable=False, index=True)
    fuel_type = Column(String(50), nullable=False, index=True)
    transmission = Column(String(50), nullable=False)
    drivetrain = Column(String(50), nullable=False)
    odo_km = Column(Integer, default=0, index=True)
    condition = Column(Enum(CarCondition), default=CarCondition.new, index=True)
    status = Column(Enum(CarStatus), default=CarStatus.available, index=True)
    
    exterior_color = Column(String(50), nullable=True)
    interior = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    badge = Column(String(50), nullable=True) # e.g., "Mới về"
    
    owners_count = Column(Integer, default=0)
    is_ready = Column(Boolean, default=True)
    has_factory_warranty = Column(Boolean, default=False)
    warranty_months = Column(Integer, default=0)
    is_inspected = Column(Boolean, default=False)
    
    is_featured = Column(Boolean, default=False, index=True)
    
    specs = Column(JSONB, nullable=True) # [{group, label, value}]
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    brand = relationship("Brand", back_populates="cars")
    images = relationship("CarImage", back_populates="car", cascade="all, delete-orphan")
    features = relationship("CarFeature", back_populates="car", cascade="all, delete-orphan")
    inspection_report = relationship("InspectionReport", back_populates="car", uselist=False, cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="interested_car")
    test_drives = relationship("TestDriveAppointment", back_populates="car")

class CarImage(Base):
    __tablename__ = "car_images"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    s3_key = Column(String(255), nullable=True)
    category = Column(Enum(ImageCategory), default=ImageCategory.exterior)
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)

    car = relationship("Car", back_populates="images")

class CarFeature(Base):
    __tablename__ = "car_features"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    group = Column(String(100), nullable=False) # e.g. "An toàn", "Tiện nghi"
    name = Column(String(255), nullable=False)

    car = relationship("Car", back_populates="features")

class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"), unique=True, nullable=False)
    total_points = Column(Integer, default=150)
    passed_points = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    items = Column(JSONB, nullable=True) # [{category, status, note}]
    inspected_at = Column(DateTime(timezone=True), server_default=func.now())

    car = relationship("Car", back_populates="inspection_report")
