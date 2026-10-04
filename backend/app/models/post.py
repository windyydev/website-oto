from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    cover_url = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    is_published = Column(Boolean, default=False)
