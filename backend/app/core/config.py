from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    
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

    class Config:
        env_file = ".env"

settings = Settings()
