from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Category(Base):
    """
    Cây danh mục phân cấp đa tầng (Category Tree):
    Level 1: Phân khúc (e.g. Siêu xe Thể thao, SUV Siêu sang, Grand Tourer)
    Level 2: Hãng xe / Brand (e.g. Porsche, Mercedes-Benz, Ferrari)
    Level 3: Dòng xe / Series (e.g. 911 Series, Panamera, G-Class)
    Level 4: Phiên bản / Trim (e.g. 911 Carrera GTS, G63 AMG Edition 1)
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    level = Column(Integer, default=1, index=True)
    sort_order = Column(Integer, default=0)
    
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)

    # Quan hệ cây tự tham chiếu
    parent = relationship("Category", remote_side=[id], backref="children")
    
    # Quan hệ với xe
    cars = relationship("Car", back_populates="category")
