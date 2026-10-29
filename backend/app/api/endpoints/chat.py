from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter()

@router.post("", response_model=ChatResponse, summary="Gửi tin nhắn cho Atelier AI Concierge")
async def send_chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Tương tác thời gian thực với Atelier AI Concierge.
    AI có khả năng tra cứu kho xe, tính toán trả góp và đặt lịch lái thử trực tiếp vào cơ sở dữ liệu.
    """
    try:
        response = await chat_service.chat(
            db=db,
            user_message=payload.message,
            history=payload.history
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xử lý tư vấn: {str(e)}"
        )

@router.get("/suggested-prompts", response_model=List[str], summary="Danh sách câu hỏi gợi ý nhanh")
def get_suggested_prompts():
    return [
        "Có những mẫu SUV nào dưới 5 tỷ đang sẵn xe?",
        "Tư vấn bảng tính trả góp Porsche 911 trong 5 năm",
        "Showroom có những mẫu Mercedes nào mới về?",
        "Quy trình kiểm định 150 điểm tại Atelier gồm những gì?",
        "Tôi muốn đặt lịch lái thử tại Khu đô thị Sala cuối tuần này"
    ]
