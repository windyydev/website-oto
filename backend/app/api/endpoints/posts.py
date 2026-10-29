from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.post import Post
from app.schemas.post import PostResponse, PostCreate, PostUpdate, PostListResponse

router = APIRouter()

@router.get("/", response_model=List[PostResponse])
def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lấy danh sách bài viết / tin tức đã xuất bản (Public)."""
    query = db.query(Post).filter(Post.is_published == True)
    
    if category:
        query = query.filter(Post.category == category)
        
    posts = query.order_by(Post.published_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return posts

@router.get("/admin/all", response_model=PostListResponse)
def get_admin_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_published: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Lấy toàn bộ bài viết (kể cả Bản nháp) dành riêng cho Quản trị viên."""
    query = db.query(Post)

    if category:
        query = query.filter(Post.category == category)
    if is_published is not None:
        query = query.filter(Post.is_published == is_published)
    if search:
        query = query.filter(Post.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(Post.published_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/id/{id}", response_model=PostResponse)
def get_post_by_id(id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    """Lấy chi tiết một bài viết qua ID cho Quản trị viên."""
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    return post

@router.get("/{slug}", response_model=PostResponse)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Lấy chi tiết một bài viết qua slug."""
    post = db.query(Post).filter(Post.slug == slug, Post.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/", response_model=PostResponse)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Tạo bài viết mới (Dành cho Admin)."""
    db_post = db.query(Post).filter(Post.slug == post.slug).first()
    if db_post:
        raise HTTPException(status_code=400, detail="Slug bài viết đã tồn tại")
        
    new_post = Post(**post.model_dump())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.put("/{id}", response_model=PostResponse)
def update_post(
    id: int,
    post_in: PostUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Cập nhật bài viết (Dành cho Admin)."""
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

    update_data = post_in.model_dump(exclude_unset=True)

    # Nếu cập nhật slug, kiểm tra xem có bị trùng với bài khác không
    if "slug" in update_data and update_data["slug"] != db_post.slug:
        existing = db.query(Post).filter(Post.slug == update_data["slug"], Post.id != id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug bài viết đã tồn tại ở bài khác")

    for field, value in update_data.items():
        setattr(db_post, field, value)

    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/{id}")
def delete_post(
    id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Xóa bài viết (Dành cho Admin)."""
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

    db.delete(db_post)
    db.commit()
    return {"status": "ok", "message": f"Đã xóa bài viết '{db_post.title}' thành công"}

