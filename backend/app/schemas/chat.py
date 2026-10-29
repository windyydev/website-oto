from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' hoặc 'model'")
    content: str = Field(..., description="Nội dung tin nhắn")

class SuggestedCarCard(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    year: int
    body_type: str
    fuel_type: str
    condition: str
    primary_image: Optional[str] = None
    monthly_installment: Optional[float] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Câu hỏi hoặc yêu cầu của khách hàng")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Lịch sử hội thoại trước đó")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Câu trả lời của Atelier Concierge AI")
    suggested_cars: List[SuggestedCarCard] = Field(default=[], description="Danh sách xe gợi ý nếu có")
    action_taken: Optional[str] = Field(None, description="Hành động hệ thống đã thực thi (ví dụ: lead_created)")
