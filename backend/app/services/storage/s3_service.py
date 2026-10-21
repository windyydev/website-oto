import boto3
from typing import Dict, Any, Optional
import uuid
from app.core.config import settings
from app.services.storage.base import BaseStorageService

class S3StorageService(BaseStorageService):
    """
    Adapter lưu trữ file lên AWS S3.
    """

    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.AWS_BUCKET_NAME
        self.region = settings.AWS_REGION

    def upload_file(self, file_obj, filename: str, folder: str = "general") -> Optional[Dict[str, Any]]:
        try:
            ext = filename.split(".")[-1].lower() if "." in filename else "jpg"
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            s3_key = f"{folder}/{unique_filename}"
            
            content_type = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"

            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket,
                s3_key,
                ExtraArgs={"ContentType": content_type}
            )

            s3_url = f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{s3_key}"
            return {
                "url": s3_url,
                "file_id": s3_key
            }
        except Exception as e:
            print(f"Lỗi upload AWS S3: {e}")
            return None

    def delete_file(self, file_id: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket, Key=file_id)
            return True
        except Exception as e:
            print(f"Lỗi xóa AWS S3: {e}")
            return False
