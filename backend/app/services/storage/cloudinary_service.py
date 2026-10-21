import cloudinary
import cloudinary.uploader
from typing import Dict, Any, Optional
import uuid
import logging
from app.core.config import settings
from app.services.storage.base import BaseStorageService

logger = logging.getLogger(__name__)

class CloudinaryStorageService(BaseStorageService):
    """
    Adapter lưu trữ file lên Cloudinary.
    """

    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    def upload_file(self, file_obj, filename: str, folder: str = "general") -> Optional[Dict[str, Any]]:
        try:
            # Tạo tên public_id duy nhất để tránh bị ghi đè file cũ
            clean_name = "".join(c for c in filename.rsplit(".", 1)[0] if c.isalnum() or c in ("-", "_"))[:20]
            unique_public_id = f"{clean_name}_{uuid.uuid4().hex[:8]}"
            
            response = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                public_id=unique_public_id,
                resource_type="auto",
                overwrite=True
            )
            
            return {
                "url": response.get("secure_url"),
                "file_id": response.get("public_id")
            }
        except Exception as e:
            logger.error(f"Error uploading to Cloudinary: {e}")
            return None

    def delete_file(self, file_id: str) -> bool:
        try:
            res = cloudinary.uploader.destroy(file_id)
            return res.get("result") in ["ok", "not found"]
        except Exception as e:
            logger.error(f"Error deleting from Cloudinary: {e}")
            return False
