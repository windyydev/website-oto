from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings
from app.core.database import Base, engine
import app.models  # Nạp toàn bộ models

# Tự động tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Showroom API", description="API for Car Showroom website")

# Bật CORS cho frontend
origins = [
    "http://localhost:3000",
]

# Thêm CORS_ORIGINS từ env (dùng khi deploy production)
if settings.CORS_ORIGINS:
    extra = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    origins.extend(extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "FastAPI server is running!"}
