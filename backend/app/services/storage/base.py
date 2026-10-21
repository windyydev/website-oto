from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseStorageService(ABC):
    """
    Interface chung cho các dịch vụ lưu trữ (Cloudinary, AWS S3, v.v.)
    Giúp hoán đổi linh hoạt giữa các nhà cung cấp lưu trữ mà không cần sửa code API.
    """

    @abstractmethod
    def upload_file(self, file_obj, filename: str, folder: str = "general") -> Optional[Dict[str, Any]]:
        """
        Upload file lên dịch vụ lưu trữ.
        
        Args:
            file_obj: File-like object (ví dụ file.file từ FastAPI UploadFile)
            filename: Tên file gốc
            folder: Thư mục phân loại (ví dụ: 'cars/1/exterior', 'posts')
            
        Returns:
            dict: {
                "url": str,      # Link ảnh công khai (HTTPS)
                "file_id": str   # public_id (Cloudinary) hoặc s3_key (S3) để xóa sau này
            }
        """
        pass

    @abstractmethod
    def delete_file(self, file_id: str) -> bool:
        """
        Xóa file khỏi dịch vụ lưu trữ bằng file_id.
        
        Args:
            file_id: public_id trên Cloudinary hoặc s3_key trên S3.
            
        Returns:
            bool: True nếu xóa thành công, False nếu thất bại.
        """
        pass
