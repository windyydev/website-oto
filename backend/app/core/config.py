from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    
    # CORS — danh sách URL được phép, cách nhau bởi dấu phẩy
    # VD: "https://my-app.vercel.app,https://www.mydomain.com"
    CORS_ORIGINS: str = ""

    # Storage Provider: 'cloudinary' or 's3'
    STORAGE_PROVIDER: str = "cloudinary"
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # AWS S3 Config (Ready for future switch)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-southeast-1"
    AWS_BUCKET_NAME: str = "website-oto-assets"

    # Security & Admin Authentication
    JWT_SECRET: str = "atelier-curated-automotive-super-secret-key-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@atelier.vn"
    ADMIN_PASSWORD: str = "Atelier@2026!"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
