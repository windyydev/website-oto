import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import uuid

# Khởi tạo S3 Client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

def upload_file_to_s3(file_obj, filename: str, folder: str = "misc") -> dict:
    """
    Upload file lên S3 và trả về dict chứa s3_key và url
    """
    # Tạo s3_key duy nhất để tránh trùng tên ảnh (bằng cách nối uuid)
    ext = filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    s3_key = f"{folder}/{unique_filename}"
    
    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.AWS_BUCKET_NAME,
            s3_key,
            ExtraArgs={
                "ContentType": f"image/{ext.lower() if ext.lower() != 'jpg' else 'jpeg'}"
            }
        )
        
        # Tạo URL public
        s3_url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
        return {"s3_key": s3_key, "url": s3_url}
    except Exception as e:
        print(f"Lỗi upload S3: {e}")
        return None

def delete_file_from_s3(s3_key: str) -> bool:
    """Xóa file khỏi S3 theo s3_key"""
    try:
        s3_client.delete_object(Bucket=settings.AWS_BUCKET_NAME, Key=s3_key)
        return True
    except Exception as e:
        print(f"Lỗi xóa S3: {e}")
        return False
