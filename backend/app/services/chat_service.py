import re
import logging
import math
from typing import List, Dict, Any, Optional, Tuple
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.core.config import settings
from app.models.car import Car, CarImage, CarStatus, CarCondition
from app.models.brand import Brand
from app.models.lead import Lead, LeadType, LeadStatus
from app.schemas.chat import ChatMessage, SuggestedCarCard, ChatResponse

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """Bạn là "Atelier VIP Concierge" - Giám đốc trải nghiệm & Trợ lý tư vấn xe sang riêng tư của Showroom Atelier Automotive (Khu đô thị Sala, TP. Thủ Đức, TP. Hồ Chí Minh).

Nguyên tắc ứng xử & phong thái giao tiếp:
1. "Quiet Luxury" - Tinh tế, điềm đạm, đẳng cấp, am hiểu sâu sắc về văn hóa chơi xe và giá trị trải nghiệm.
2. Xưng "Em" và gọi khách hàng là "Quý khách" hoặc "Anh/Chị".
3. Trả lời bằng tiếng Việt chuẩn mực, lưu loát, bố cục thẩm mỹ cao (in đậm tên xe, gạch đầu dòng rõ ràng, làm nổi bật giá bán và đặc tính nổi bật).
4. TUYỆT ĐỐI CHỈ TƯ VẤN các mẫu xe có trong danh sách KHO XE THỰC TẾ được cung cấp trong ngữ cảnh. Không bịa đặt thông tin xe không tồn tại trong kho.
5. Khi khách hàng hỏi về thủ tục trả góp, hãy giải thích rõ ràng tiền trả trước, số tiền vay và khoản góp hàng tháng dựa trên bảng tính tài chính đính kèm.
6. Khi khách hàng để lại số điện thoại hoặc đặt hẹn, hãy gửi lời cảm ơn trân trọng và xác nhận chuyên viên cao cấp của Atelier sẽ liên hệ riêng trong vòng 15 phút.
7. Thân thiện mời Quý khách ghé thăm Atelier Showroom tại Sala để trải nghiệm không gian riêng tư, thưởng thức trà/cà phê thượng hạng và lái thử xe."""

def format_vnd(amount: Optional[float]) -> str:
    """Format tiền VNĐ dễ đọc (ví dụ: 4 tỷ 250 triệu VNĐ)"""
    if not amount:
        return "Liên hệ Atelier"
    ty = amount / 1_000_000_000
    if ty >= 1:
        if ty == int(ty):
            return f"{int(ty)} tỷ VNĐ"
        return f"{ty:.2f} tỷ VNĐ".replace(".00", "")
    trieu = amount / 1_000_000
    return f"{int(trieu)} triệu VNĐ"

def _car_to_dict(car: Car) -> Dict[str, Any]:
    primary_img = None
    if car.images:
        for img in car.images:
            if img.is_primary:
                primary_img = img.image_url
                break
        if not primary_img and len(car.images) > 0:
            primary_img = car.images[0].image_url

    return {
        "id": car.id,
        "name": car.name,
        "slug": car.slug,
        "brand": car.brand.name if car.brand else "",
        "price": car.price,
        "price_formatted": format_vnd(car.price),
        "year": car.year,
        "body_type": car.body_type,
        "fuel_type": car.fuel_type,
        "transmission": car.transmission,
        "drivetrain": car.drivetrain,
        "odo_km": car.odo_km,
        "condition": car.condition.value if hasattr(car.condition, 'value') else str(car.condition),
        "condition_text": "Xe mới 100%" if str(car.condition) == "CarCondition.new" or car.condition == "new" else f"Siêu lướt ({car.odo_km:,} km)",
        "status": car.status.value if hasattr(car.status, 'value') else str(car.status),
        "primary_image": primary_img,
        "monthly_installment": car.monthly_installment,
        "is_inspected": car.is_inspected,
        "exterior_color": car.exterior_color,
        "interior": car.interior,
        "description": car.description[:200] if car.description else "",
        "warranty_months": car.warranty_months,
    }

def calculate_loan_breakdown(price: float, down_percent: float = 30, term_months: int = 60, annual_rate: float = 8.5) -> Dict[str, Any]:
    down_payment = price * (down_percent / 100.0)
    loan_amount = price - down_payment
    monthly_rate = (annual_rate / 100.0) / 12.0
    
    if monthly_rate > 0:
        monthly_payment = loan_amount * (monthly_rate * ((1 + monthly_rate) ** term_months)) / (((1 + monthly_rate) ** term_months) - 1)
    else:
        monthly_payment = loan_amount / term_months
        
    return {
        "price_formatted": format_vnd(price),
        "down_payment_formatted": format_vnd(down_payment),
        "loan_amount_formatted": format_vnd(loan_amount),
        "term_text": f"{term_months} tháng ({term_months//12} năm)",
        "annual_rate": f"{annual_rate}%/năm",
        "monthly_payment_formatted": format_vnd(monthly_payment)
    }

class AtelierChatService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = "gemini-3.1-flash-lite"
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    def parse_user_intent_and_query_db(self, db: Session, user_message: str) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]], Optional[Dict[str, str]]]:
        msg = user_message.lower()
        
        # 1. Phát hiện số điện thoại (Lead capture)
        phone_match = re.search(r'(?:\+?84|0)(?:3|5|7|8|9)[0-9]{8}\b', user_message)
        lead_info = None
        if phone_match:
            phone = phone_match.group(0)
            lead_info = {"phone": phone}
            
        # 2. Phát hiện ngân sách
        min_price = None
        max_price = None
        
        ty_matches = re.findall(r'(\d+(?:[.,]\d+)?)\s*(?:tỷ|ty|tỉ)', msg)
        if "dưới" in msg or "tầm" in msg or "khoảng" in msg or "dưới" in msg or "<" in msg:
            if ty_matches:
                val = float(ty_matches[0].replace(',', '.')) * 1_000_000_000
                max_price = val
                min_price = max(0, val - 2_000_000_000)
        elif len(ty_matches) >= 2:
            val1 = float(ty_matches[0].replace(',', '.')) * 1_000_000_000
            val2 = float(ty_matches[1].replace(',', '.')) * 1_000_000_000
            min_price = min(val1, val2)
            max_price = max(val1, val2)
            
        # 3. Phát hiện hãng xe
        brand_filter = None
        for b in ["porsche", "mercedes", "mec", "bmw", "lexus", "audi", "land rover", "range rover", "bentley", "rolls-royce", "ferrari", "lamborghini"]:
            if b in msg:
                brand_filter = "mercedes" if b == "mec" else b
                break
                
        # 4. Phát hiện kiểu dáng
        body_filter = None
        for bd in ["suv", "sedan", "coupe", "convertible", "mui trần", "thể thao"]:
            if bd in msg:
                body_filter = "convertible" if bd == "mui trần" else bd
                break

        # 5. Query PostgreSQL
        query = db.query(Car).filter(Car.status == CarStatus.available)
        
        if brand_filter:
            query = query.join(Brand).filter(Brand.name.ilike(f"%{brand_filter}%"))
        if body_filter:
            query = query.filter(Car.body_type.ilike(f"%{body_filter}%"))
        if min_price is not None:
            query = query.filter(Car.price >= min_price)
        if max_price is not None:
            query = query.filter(Car.price <= max_price)
            
        cars = query.order_by(desc(Car.is_featured), desc(Car.id)).limit(4).all()
        
        # Nếu bộ lọc quá chặt không ra kết quả nào, lấy top xe nổi bật
        if not cars:
            cars = db.query(Car).filter(Car.status == CarStatus.available).order_by(desc(Car.is_featured), desc(Car.id)).limit(4).all()
            
        car_dicts = [_car_to_dict(c) for c in cars]
        
        # 6. Loan breakdown nếu khách hỏi về trả góp
        loan_info = None
        if any(w in msg for w in ["trả góp", "vay", "ngân hàng", "lãi suất", "tiền góp", "mỗi tháng", "bao nhiêu một tháng"]):
            ref_price = car_dicts[0]["price"] if car_dicts else 4_000_000_000
            if ty_matches:
                try:
                    ref_price = float(ty_matches[0].replace(',', '.')) * 1_000_000_000
                except Exception:
                    pass
            loan_info = calculate_loan_breakdown(ref_price)
            
        return car_dicts, loan_info, lead_info

    async def chat(
        self,
        db: Session,
        user_message: str,
        history: Optional[List[ChatMessage]] = None
    ) -> ChatResponse:
        # 1. Tra cứu database và phát hiện ý định
        relevant_cars, loan_info, lead_info = self.parse_user_intent_and_query_db(db, user_message)
        
        action_taken = None
        # 2. Xử lý lưu lead nếu khách để lại SĐT
        if lead_info:
            try:
                car_id = relevant_cars[0]["id"] if relevant_cars else None
                car_name = relevant_cars[0]["name"] if relevant_cars else "Chưa xác định"
                new_lead = Lead(
                    name="Khách hàng VIP",
                    phone=lead_info["phone"],
                    type=LeadType.concierge,
                    source="Atelier AI Concierge Chatbot",
                    message=f"Đăng ký qua AI Concierge. Xe quan tâm: {car_name}. Tin nhắn: {user_message}",
                    interested_car_id=car_id,
                    status=LeadStatus.new
                )
                db.add(new_lead)
                db.commit()
                db.refresh(new_lead)
                action_taken = "lead_created"
                logger.info(f"Captured VIP Lead from Chatbot: ID {new_lead.id} - Phone {lead_info['phone']}")
            except Exception as e:
                logger.error(f"Error saving lead: {e}")
                db.rollback()

        # 3. Tạo Context chuyên sâu cho Gemini
        context_parts = []
        context_parts.append("### DỮ LIỆU KHO XE THỰC TẾ ĐANG CÓ SẴN TẠI SHOWROOM SALA:")
        for idx, c in enumerate(relevant_cars, 1):
            inspected_badge = "Đã đạt kiểm định 150 điểm Atelier" if c["is_inspected"] else "Đang hoàn tất kiểm định"
            context_parts.append(
                f"{idx}. {c['name']} (Đời {c['year']})\n"
                f"   - Giá niêm yết: {c['price_formatted']}\n"
                f"   - Tình trạng: {c['condition_text']} | ODO: {c['odo_km']:,} km\n"
                f"   - Kiểu dáng: {c['body_type']} | Động cơ: {c['fuel_type']} | Hộp số: {c['transmission']}\n"
                f"   - Ngoại thất: {c['exterior_color'] or 'Tiêu chuẩn'} | Nội thất: {c['interior'] or 'Da cao cấp'}\n"
                f"   - Chứng chỉ kiểm định: {inspected_badge}\n"
                f"   - Slug liên kết: {c['slug']}"
            )

        if loan_info:
            context_parts.append("\n### BẢNG TÍNH TÀI CHÍNH THAM KHẢO:")
            context_parts.append(
                f"- Giá xe tham chiếu: {loan_info['price_formatted']}\n"
                f"- Trả trước (30%): {loan_info['down_payment_formatted']}\n"
                f"- Số tiền vay ngân hàng (70%): {loan_info['loan_amount_formatted']}\n"
                f"- Thời hạn vay: {loan_info['term_text']}\n"
                f"- Lãi suất ưu đãi: {loan_info['annual_rate']}\n"
                f"- Ước tính thanh toán hàng tháng: {loan_info['monthly_payment_formatted']}"
            )

        if lead_info:
            context_parts.append(f"\n[LƯU Ý]: Khách hàng vừa để lại số điện thoại ({lead_info['phone']}). Hệ thống đã lưu vào CRM thành công. Hãy gửi lời cảm ơn và xác nhận chuyên viên tư vấn cao cấp sẽ gọi lại trong 15 phút!")

        full_context_text = "\n".join(context_parts)

        # 4. Chuẩn bị hội thoại gửi Gemini
        contents = []
        if history:
            for msg in history[-6:]:
                contents.append({
                    "role": "user" if msg.role in ["user", "human"] else "model",
                    "parts": [{"text": msg.content}]
                })

        # Ghép System instruction và context vào lượt nhắn cuối
        final_prompt = (
            f"{SYSTEM_INSTRUCTION}\n\n"
            f"--- BỐI CẢNH THỰC TẾ TỪ CƠ SỞ DỮ LIỆU ATELIER ---\n"
            f"{full_context_text}\n"
            f"--------------------------------------------------\n\n"
            f"Câu hỏi của Quý khách: {user_message}"
        )
        contents.append({
            "role": "user",
            "parts": [{"text": final_prompt}]
        })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 800
            }
        }

        # 5. Gọi Gemini API
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(self.endpoint, json=payload)
                if resp.status_code == 200:
                    cand = resp.json().get("candidates", [])[0]
                    parts = cand.get("content", {}).get("parts", [])
                    ai_text = "".join([p.get("text", "") for p in parts if "text" in p])
                    
                    return ChatResponse(
                        reply=ai_text,
                        suggested_cars=[
                            SuggestedCarCard(
                                id=c["id"],
                                name=c["name"],
                                slug=c["slug"],
                                price=c["price"],
                                year=c["year"],
                                body_type=c["body_type"],
                                fuel_type=c["fuel_type"],
                                condition=c["condition"],
                                primary_image=c.get("primary_image"),
                                monthly_installment=c.get("monthly_installment")
                            )
                            for c in relevant_cars
                        ],
                        action_taken=action_taken
                    )
                else:
                    logger.error(f"Gemini API returned {resp.status_code}: {resp.text}")
                    return self._build_offline_response(relevant_cars, loan_info, lead_info, action_taken)
        except Exception as e:
            logger.exception(f"Chat service error: {e}")
            return self._build_offline_response(relevant_cars, loan_info, lead_info, action_taken)

    def _build_offline_response(
        self,
        cars: List[Dict[str, Any]],
        loan_info: Optional[Dict[str, Any]],
        lead_info: Optional[Dict[str, str]],
        action_taken: Optional[str]
    ) -> ChatResponse:
        lines = [
            "Dạ em xin chào Quý khách! Atelier Concierge rất hân hạnh được đồng hành cùng Quý khách.",
            "",
            "Dưới đây là các mẫu xe tiêu biểu đang có sẵn tại không gian trưng bày Atelier Sala (Thủ Đức, TP.HCM):"
        ]
        for c in cars:
            lines.append(f"• **{c['name']}** ({c['year']}) – Giá: **{c['price_formatted']}** ({c['condition_text']})")

        if loan_info:
            lines.append("")
            lines.append("📊 **Phương án tài chính tham khảo:**")
            lines.append(f"- Trả trước 30%: **{loan_info['down_payment_formatted']}**")
            lines.append(f"- Vay 70% trong {loan_info['term_text']}: Góp ước tính **{loan_info['monthly_payment_formatted']}/tháng**")

        if lead_info:
            lines.append("")
            lines.append(f"✨ Em đã ghi nhận số điện thoại **{lead_info['phone']}** vào danh sách ưu tiên. Giám đốc tư vấn Atelier sẽ chủ động liên hệ riêng để phục vụ Quý khách trong 15 phút tới.")
        else:
            lines.append("")
            lines.append("Quý khách có thể để lại số điện thoại hoặc yêu cầu thời gian lái thử mong muốn, em sẽ chuẩn bị xe và không gian tiếp đón chu đáo nhất ạ.")

        return ChatResponse(
            reply="\n".join(lines),
            suggested_cars=[
                SuggestedCarCard(
                    id=c["id"],
                    name=c["name"],
                    slug=c["slug"],
                    price=c["price"],
                    year=c["year"],
                    body_type=c["body_type"],
                    fuel_type=c["fuel_type"],
                    condition=c["condition"],
                    primary_image=c.get("primary_image"),
                    monthly_installment=c.get("monthly_installment")
                )
                for c in cars
            ],
            action_taken=action_taken
        )

chat_service = AtelierChatService()
