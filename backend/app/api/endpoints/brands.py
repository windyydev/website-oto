from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.brand import Brand
from app.schemas.brand import BrandResponse, BrandCreate

router = APIRouter()

@router.get("/", response_model=List[BrandResponse])
def get_brands(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả các thương hiệu."""
    brands = db.query(Brand).order_by(Brand.name.asc()).all()
    return brands

@router.post("/", response_model=BrandResponse)
def create_brand(
    brand: BrandCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Tạo thương hiệu mới (Dành cho Admin)."""
    db_brand = db.query(Brand).filter(Brand.slug == brand.slug).first()
    if db_brand:
        raise HTTPException(status_code=400, detail="Slug thương hiệu đã tồn tại")
    
    new_brand = Brand(**brand.model_dump())
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return new_brand

@router.delete("/{id}")
def delete_brand(
    id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa thương hiệu."""
    brand = db.query(Brand).filter(Brand.id == id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Không tìm thấy thương hiệu")
    
    # Kiểm tra xem có xe nào thuộc thương hiệu này không
    if brand.cars and len(brand.cars) > 0:
        raise HTTPException(status_code=400, detail="Không thể xóa thương hiệu đang có xe liên kết")

    db.delete(brand)
    db.commit()
    return {"status": "ok", "message": f"Đã xóa thương hiệu '{brand.name}' thành công"}
