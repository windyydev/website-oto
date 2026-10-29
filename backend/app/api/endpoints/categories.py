from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.category import Category
from app.models.car import Car
from app.schemas.category import CategoryResponse, CategoryTreeResponse, CategoryCreate, CategoryUpdate

router = APIRouter()

def build_category_tree(categories, parent_id=None) -> List[dict]:
    branch = []
    for cat in categories:
        if cat.parent_id == parent_id:
            children = build_category_tree(categories, cat.id)
            node = {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "description": cat.description,
                "level": cat.level,
                "sort_order": cat.sort_order,
                "parent_id": cat.parent_id,
                "cars_count": len(cat.cars) if cat.cars else 0,
                "children": children
            }
            branch.append(node)
    return branch

@router.get("/tree", response_model=List[CategoryTreeResponse])
def get_category_tree(db: Session = Depends(get_db)):
    """Lấy toàn bộ cây danh mục dạng đa tầng (Phân khúc -> Hãng -> Dòng xe -> Phiên bản)."""
    categories = db.query(Category).order_by(Category.level.asc(), Category.sort_order.asc(), Category.name.asc()).all()
    tree = build_category_tree(categories, None)
    return tree

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    level: Optional[int] = Query(None, description="Lọc theo cấp độ: 1-Phân khúc, 2-Hãng, 3-Dòng, 4-Phiên bản"),
    parent_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lấy danh sách danh mục phẳng với hỗ trợ lọc theo level hoặc parent_id."""
    query = db.query(Category)
    if level is not None:
        query = query.filter(Category.level == level)
    if parent_id is not None:
        query = query.filter(Category.parent_id == parent_id)
        
    return query.order_by(Category.sort_order.asc(), Category.name.asc()).all()

@router.get("/{slug}", response_model=CategoryResponse)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết một danh mục qua slug."""
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    return cat

@router.post("/", response_model=CategoryResponse)
def create_category(
    cat_data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Tạo mới danh mục trong cây phân cấp (Dành cho Admin)."""
    existing = db.query(Category).filter(Category.slug == cat_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug danh mục đã tồn tại")

    new_cat = Category(**cat_data.model_dump())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.put("/{id}", response_model=CategoryResponse)
def update_category(
    id: int,
    cat_in: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Cập nhật thông tin danh mục trong cây phân cấp."""
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")

    update_data = cat_in.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"] != cat.slug:
        existing = db.query(Category).filter(Category.slug == update_data["slug"], Category.id != id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug danh mục đã tồn tại")

    for field, value in update_data.items():
        setattr(cat, field, value)

    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa danh mục khỏi cây phân cấp."""
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")

    # Kiểm tra danh mục con
    if cat.children and len(cat.children) > 0:
        raise HTTPException(status_code=400, detail="Vui lòng xóa các danh mục con trước khi xóa danh mục này")

    db.delete(cat)
    db.commit()
    return {"status": "ok", "message": f"Đã xóa danh mục '{cat.name}' thành công"}
