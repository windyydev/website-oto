from fastapi import APIRouter
from app.api.endpoints import brands, cars, leads, posts, upload, admin

api_router = APIRouter()

# Tích hợp các router con vào router chính
api_router.include_router(brands.router, prefix="/brands", tags=["Brands"])
api_router.include_router(cars.router, prefix="/cars", tags=["Cars"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(posts.router, prefix="/posts", tags=["Posts"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
