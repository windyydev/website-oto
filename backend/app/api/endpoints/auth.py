from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.core.security import (
    verify_admin_credentials,
    create_access_token,
    get_current_admin
)
from app.core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Xác thực tài khoản Admin và cấp JWT token."""
    if not verify_admin_credentials(request.username, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {
        "sub": settings.ADMIN_USERNAME,
        "email": settings.ADMIN_EMAIL,
        "role": "admin"
    }
    
    access_token = create_access_token(token_data)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            username=settings.ADMIN_USERNAME,
            email=settings.ADMIN_EMAIL,
            name="Giám Đốc Quản Trị Atelier",
            role="admin"
        )
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(admin: dict = Depends(get_current_admin)):
    """Lấy thông tin tài khoản Admin đang đăng nhập."""
    return UserResponse(
        username=admin.get("sub", settings.ADMIN_USERNAME),
        email=admin.get("email", settings.ADMIN_EMAIL),
        name="Giám Đốc Quản Trị Atelier",
        role="admin"
    )
