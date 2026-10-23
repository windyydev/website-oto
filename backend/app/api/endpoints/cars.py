from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.car import Car, CarImage
from app.schemas.car import CarResponse, CarCreate, CarListResponse, ImageOrderItem
from app.services.storage import get_storage_service

router = APIRouter()

@router.get("/", response_model=CarListResponse)
def get_cars(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    brand_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = Query("newest", description="newest, price_asc, price_desc, year_desc, odo_asc"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách xe với hỗ trợ lọc, phân trang và sắp xếp.
    """
    query = db.query(Car)
    
    if brand_id is not None:
        query = query.filter(Car.brand_id == brand_id)
    if status is not None:
        query = query.filter(Car.status == status)
    if search:
        query = query.filter(Car.name.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.filter(Car.price >= min_price)
    if max_price is not None:
        query = query.filter(Car.price <= max_price)
        
    if sort == "newest":
        query = query.order_by(desc(Car.created_at))
    elif sort == "price_asc":
        query = query.order_by(asc(Car.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Car.price))
    elif sort == "year_desc":
        query = query.order_by(desc(Car.year))
    elif sort == "odo_asc":
        query = query.order_by(asc(Car.odo_km))
        
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "facets": {}
    }

@router.get("/id/{id}", response_model=CarResponse)
def get_car_by_id(id: int, db: Session = Depends(get_db)):
    """Lấy thông tin xe theo ID (Dành cho trang Admin chỉnh sửa)."""
    car = db.query(Car).filter(Car.id == id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")
    return car

@router.get("/{slug}", response_model=CarResponse)
def get_car_by_slug(slug: str, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết xe theo slug kèm danh sách hình ảnh."""
    car = db.query(Car).filter(Car.slug == slug).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")
    return car

@router.post("/", response_model=CarResponse)
def create_car(
    car: CarCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Tạo mới một chiếc xe (Dành cho Admin)."""
    # Kiểm tra slug trùng lặp
    existing = db.query(Car).filter(Car.slug == car.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug xe đã tồn tại, vui lòng chọn tên khác")
        
    db_car = Car(**car.model_dump())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

@router.put("/{id}", response_model=CarResponse)
def update_car(
    id: int,
    car_data: CarCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Cập nhật thông tin xe."""
    car = db.query(Car).filter(Car.id == id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")

    for key, value in car_data.model_dump().items():
        setattr(car, key, value)

    db.commit()
    db.refresh(car)
    return car

@router.delete("/{id}")
def delete_car(
    id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa xe và dọn dẹp toàn bộ ảnh của xe trên Cloud Storage."""
    car = db.query(Car).filter(Car.id == id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")

    storage = get_storage_service()
    # Dọn dẹp ảnh trên Cloudinary/S3
    for img in car.images:
        if img.s3_key:
            storage.delete_file(img.s3_key)

    db.delete(car)
    db.commit()
    return {"status": "ok", "message": f"Đã xóa xe '{car.name}' thành công"}

@router.patch("/{id}/images/order")
def update_car_images_order(
    id: int,
    items: List[ImageOrderItem],
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Cập nhật thứ tự hiển thị và ảnh đại diện chính (is_primary) cho xe."""
    car = db.query(Car).filter(Car.id == id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")

    item_dict = {item.id: item for item in items}
    images = db.query(CarImage).filter(CarImage.car_id == id, CarImage.id.in_(item_dict.keys())).all()

    for img in images:
        update_data = item_dict[img.id]
        img.sort_order = update_data.sort_order
        img.is_primary = update_data.is_primary

    db.commit()
    return {"status": "ok", "message": "Cập nhật thứ tự ảnh thành công"}
