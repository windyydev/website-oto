from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_admin
from app.services.storage import get_storage_service
from app.models.car import CarImage, ImageCategory

router = APIRouter()

@router.post("/car-images")
def upload_car_images(
    car_id: int = Form(...),
    category: ImageCategory = Form(ImageCategory.exterior),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """
    Nhận nhiều file ảnh cho 1 chiếc xe, lưu trữ qua Storage Service (Cloudinary/S3)
    và lưu URL vào Database.
    """
    storage = get_storage_service()
    uploaded_images = []
    
    for file in files:
        # Đường dẫn thư mục: cars/{car_id}/{category}
        folder_path = f"website-oto/cars/{car_id}/{category.value}"
        result = storage.upload_file(file.file, file.filename, folder=folder_path)
        
        if result:
            # Lưu vào Database
            car_image = CarImage(
                car_id=car_id,
                image_url=result["url"],
                s3_key=result["file_id"],  # Lưu public_id hoặc s3_key để xoá khi cần
                category=category
            )
            db.add(car_image)
            db.commit()
            db.refresh(car_image)
            uploaded_images.append(car_image)
            
    if not uploaded_images:
        raise HTTPException(status_code=400, detail="Không có ảnh nào được upload thành công.")
        
    return {
        "message": f"Upload {len(uploaded_images)} ảnh thành công", 
        "images": [{"id": img.id, "url": img.image_url, "file_id": img.s3_key} for img in uploaded_images]
    }

@router.delete("/car-images/{image_id}")
def delete_car_image(
    image_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa ảnh trong cả Database và Cloud Storage (Cloudinary/S3)."""
    db_img = db.query(CarImage).filter(CarImage.id == image_id).first()
    if not db_img:
        raise HTTPException(status_code=404, detail="Không tìm thấy ảnh")
        
    storage = get_storage_service()
    # Xóa file trên Cloudinary hoặc S3
    if db_img.s3_key:
        storage.delete_file(db_img.s3_key)
        
    # Xóa bản ghi trong Database
    db.delete(db_img)
    db.commit()
    
    return {"status": "ok", "message": "Đã xóa ảnh thành công"}

@router.post("/general")
def upload_general_image(
    file: UploadFile = File(...),
    folder: str = Form("general"),
    admin: dict = Depends(get_current_admin)
):
    """Upload ảnh thông thường (banner, avatar, bài viết) trả về URL trực tiếp."""
    storage = get_storage_service()
    result = storage.upload_file(file.file, file.filename, folder=f"website-oto/{folder}")
    if not result:
        raise HTTPException(status_code=400, detail="Upload thất bại")
    return result
