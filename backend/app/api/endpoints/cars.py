from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.car import Car, CarImage, CarColor, CarOption
from app.models.category import Category
from app.schemas.car import (
    CarResponse, CarCreate, CarListResponse, ImageOrderItem,
    CarColorResponse, CarColorCreate, CarOptionResponse, CarOptionCreate
)
from app.services.storage import get_storage_service

router = APIRouter()

@router.get("/", response_model=CarListResponse)
def get_cars(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    brand_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None, description="Lọc theo ID danh mục trong Category Tree"),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = Query("newest", description="newest, price_asc, price_desc, year_desc, odo_asc"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách xe với hỗ trợ lọc theo Category Tree, Brand, phân trang và sắp xếp.
    """
    query = db.query(Car)
    
    if brand_id is not None:
        query = query.filter(Car.brand_id == brand_id)
    if category_id is not None:
        # Lấy tất cả category con thuộc category này
        def get_all_sub_cat_ids(parent_id: int) -> List[int]:
            sub_cats = db.query(Category.id).filter(Category.parent_id == parent_id).all()
            ids = [parent_id]
            for s in sub_cats:
                ids.extend(get_all_sub_cat_ids(s[0]))
            return ids
        all_cat_ids = get_all_sub_cat_ids(category_id)
        query = query.filter(Car.category_id.in_(all_cat_ids))
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

@router.post("/{id}/colors", response_model=CarColorResponse)
def add_car_color(
    id: int,
    color_data: CarColorCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Thêm biến thể màu sắc kèm ảnh & giá chênh lệch cho xe."""
    car = db.query(Car).filter(Car.id == id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")

    color_dict = color_data.model_dump()
    color_dict.pop("car_id", None)
    new_color = CarColor(car_id=id, **color_dict)
    db.add(new_color)
    db.commit()
    db.refresh(new_color)
    return new_color

@router.delete("/{id}/colors/{color_id}")
def delete_car_color(
    id: int,
    color_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa biến thể màu của xe."""
    color = db.query(CarColor).filter(CarColor.id == color_id, CarColor.car_id == id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Không tìm thấy màu")

    db.delete(color)
    db.commit()
    return {"status": "ok", "message": "Đã xóa màu thành công"}

@router.post("/{id}/options", response_model=CarOptionResponse)
def add_car_option(
    id: int,
    opt_data: CarOptionCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Thêm trang bị option và giá cho xe."""
    car = db.query(Car).filter(Car.id == id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")

    opt_dict = opt_data.model_dump()
    opt_dict.pop("car_id", None)
    new_opt = CarOption(car_id=id, **opt_dict)
    db.add(new_opt)
    db.commit()
    db.refresh(new_opt)
    return new_opt


@router.delete("/{id}/options/{option_id}")
def delete_car_option(
    id: int,
    option_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa option của xe."""
    opt = db.query(CarOption).filter(CarOption.id == option_id, CarOption.car_id == id).first()
    if not opt:
        raise HTTPException(status_code=404, detail="Không tìm thấy option")

    db.delete(opt)
    db.commit()
    return {"status": "ok", "message": "Đã xóa option thành công"}
