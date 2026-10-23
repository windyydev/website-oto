from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.post import Post
from app.schemas.post import PostResponse, PostCreate

router = APIRouter()

@router.get("/", response_model=List[PostResponse])
def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lấy danh sách bài viết / tin tức."""
    query = db.query(Post).filter(Post.is_published == True)
    
    if category:
        query = query.filter(Post.category == category)
        
    posts = query.order_by(Post.published_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return posts

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
        raise HTTPException(status_code=400, detail="Slug already registered")
        
    new_post = Post(**post.model_dump())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post
