from app.core.config import settings
from app.services.storage.base import BaseStorageService
from app.services.storage.cloudinary_service import CloudinaryStorageService
from app.services.storage.s3_service import S3StorageService

_storage_instance: BaseStorageService = None

def get_storage_service() -> BaseStorageService:
    """
    Factory trả về Storage Service tương ứng dựa trên cấu hình STORAGE_PROVIDER trong .env.
    - STORAGE_PROVIDER=cloudinary -> CloudinaryStorageService
    - STORAGE_PROVIDER=s3 -> S3StorageService
    """
    global _storage_instance
    if _storage_instance is None:
        provider = settings.STORAGE_PROVIDER.lower()
        if provider == "s3":
            _storage_instance = S3StorageService()
        elif provider == "cloudinary":
            _storage_instance = CloudinaryStorageService()
        else:
            raise ValueError(f"Không hỗ trợ storage provider: {provider}")
            
    return _storage_instance
