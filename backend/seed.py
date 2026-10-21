"""
Script seed dữ liệu mẫu cho Showroom Atelier Curated Automotive.
Tạo các hãng xe danh tiếng, xe sang cao cấp, thông số kỹ thuật, ảnh và bài viết.
"""
from app.core.database import SessionLocal
from app.models.brand import Brand
from app.models.car import Car, CarImage, CarFeature, InspectionReport, CarCondition, CarStatus, ImageCategory
from app.models.consultant import Consultant
from app.models.post import Post

def seed_data():
    db = SessionLocal()
    try:
        # 1. Brands
        if db.query(Brand).count() == 0:
            print("Creating brands...")
            brands_data = [
                {"name": "Porsche", "slug": "porsche", "description": "Đức", "logo_url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=120&q=80"},
                {"name": "Mercedes-Benz", "slug": "mercedes-benz", "description": "Đức", "logo_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=120&q=80"},
                {"name": "BMW", "slug": "bmw", "description": "Đức", "logo_url": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=120&q=80"},
                {"name": "Audi", "slug": "audi", "description": "Đức", "logo_url": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=120&q=80"},
                {"name": "Land Rover", "slug": "land-rover", "description": "Anh Quốc", "logo_url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=120&q=80"},
                {"name": "Ferrari", "slug": "ferrari", "description": "Ý", "logo_url": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=120&q=80"},
                {"name": "Bentley", "slug": "bentley", "description": "Anh Quốc", "logo_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=120&q=80"},
                {"name": "Lexus", "slug": "lexus", "description": "Nhật Bản", "logo_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=120&q=80"},
            ]
            for b in brands_data:
                db.add(Brand(**b))
            db.commit()

        porsche = db.query(Brand).filter(Brand.slug == "porsche").first()
        merc = db.query(Brand).filter(Brand.slug == "mercedes-benz").first()
        bmw = db.query(Brand).filter(Brand.slug == "bmw").first()
        audi = db.query(Brand).filter(Brand.slug == "audi").first()
        landrover = db.query(Brand).filter(Brand.slug == "land-rover").first()
        ferrari = db.query(Brand).filter(Brand.slug == "ferrari").first()

        # 2. Consultant
        if db.query(Consultant).count() == 0:
            print("Đang tạo tư vấn viên...")
            consultant = Consultant(
                name="Trần Minh Quân",
                title="Giám Đốc Tuyển Chọn & Thẩm Định",
                phone="0908 123 456",
                email="quan.tran@atelier-auto.vn",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                is_active=True
            )
            db.add(consultant)
            db.commit()

        # 3. Cars
        if db.query(Car).count() == 0:
            print("Đang tạo bộ sưu tập xe mẫu...")
            cars_data = [
                {
                    "brand_id": porsche.id,
                    "name": "Porsche 911 GT3 (992)",
                    "slug": "porsche-911-gt3-992-2023",
                    "stock_code": "ATL-992-GT3",
                    "vin": "WP0AC2A98NS291044",
                    "price": 18900000000.0,
                    "monthly_installment": 145000000.0,
                    "year": 2023,
                    "body_type": "Coupe",
                    "fuel_type": "Xăng",
                    "transmission": "PDK 7 cấp",
                    "drivetrain": "RWD",
                    "odo_km": 1800,
                    "condition": CarCondition.used,
                    "status": CarStatus.available,
                    "exterior_color": "Chalk Grey (Xám Xi Măng)",
                    "interior": "Da Nappa & Race-Tex Đen khâu chỉ Vàng",
                    "description": "Porsche 911 GT3 thế hệ 992 đỉnh cao với cánh gió cổ thiên nga đặc trưng, động cơ hút khí tự nhiên 4.0L 502 mã lực gầm rú ở 9.000 vòng/phút. Xe nhập khẩu chính hãng, bảo hành trọn vẹn, đã phủ Ceramic toàn xe.",
                    "badge": "Siêu Phẩm Mới Về",
                    "owners_count": 1,
                    "is_ready": True,
                    "has_factory_warranty": True,
                    "warranty_months": 24,
                    "is_inspected": True,
                    "is_featured": True,
                    "specs": [
                        {"group": "Hiệu năng", "label": "Động cơ", "value": "4.0L Boxer 6 xi-lanh hút khí tự nhiên"},
                        {"group": "Hiệu năng", "label": "Công suất cực đại", "value": "502 hp @ 8,400 rpm"},
                        {"group": "Hiệu năng", "label": "Tăng tốc 0-100 km/h", "value": "3.4 giây"},
                        {"group": "Hiệu năng", "label": "Vận tốc tối đa", "value": "318 km/h"},
                        {"group": "Kích thước", "label": "Trọng lượng", "value": "1,435 kg"},
                    ],
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": True},
                        {"url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": False},
                        {"url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.interior, "is_primary": False},
                    ]
                },
                {
                    "brand_id": merc.id,
                    "name": "Mercedes-AMG G63 Manufaktur",
                    "slug": "mercedes-amg-g63-manufaktur-2023",
                    "stock_code": "ATL-G63-MANU",
                    "vin": "W1N4632761X394821",
                    "price": 12800000000.0,
                    "monthly_installment": 98000000.0,
                    "year": 2023,
                    "body_type": "SUV",
                    "fuel_type": "Xăng",
                    "transmission": "AMG SPEEDSHIFT TCT 9G",
                    "drivetrain": "AWD",
                    "odo_km": 6500,
                    "condition": CarCondition.used,
                    "status": CarStatus.available,
                    "exterior_color": "Đen Mờ Magno",
                    "interior": "Da Nappa Maybach Đỏ Bengal",
                    "description": "Biểu tượng SUV địa hình quyền lực nhất hành tinh. Bản cá nhân hóa Manufaktur độc bản, gói ngoại thất Night Package II, hệ thống âm thanh vòm Burmester High-End 3D, ống xả thể thao AMG kép đặt hông xe.",
                    "badge": "Độc Bản Manufaktur",
                    "owners_count": 1,
                    "is_ready": True,
                    "has_factory_warranty": True,
                    "warranty_months": 18,
                    "is_inspected": True,
                    "is_featured": True,
                    "specs": [
                        {"group": "Hiệu năng", "label": "Động cơ", "value": "4.0L V8 Biturbo Handcrafted AMG"},
                        {"group": "Hiệu năng", "label": "Công suất cực đại", "value": "577 hp @ 6,000 rpm"},
                        {"group": "Hiệu năng", "label": "Mô-men xoắn", "value": "850 Nm @ 2,500 rpm"},
                        {"group": "Hiệu năng", "label": "Tăng tốc 0-100 km/h", "value": "4.5 giây"},
                    ],
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": True},
                        {"url": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.interior, "is_primary": False},
                    ]
                },
                {
                    "brand_id": bmw.id,
                    "name": "BMW M4 Competition Coupe (G82)",
                    "slug": "bmw-m4-competition-coupe-2024",
                    "stock_code": "ATL-M4-COMP",
                    "vin": "WBA33AY07PFP91823",
                    "price": 6250000000.0,
                    "monthly_installment": 52000000.0,
                    "year": 2024,
                    "body_type": "Coupe",
                    "fuel_type": "Xăng",
                    "transmission": "M Steptronic 8 cấp với Drivelogic",
                    "drivetrain": "RWD",
                    "odo_km": 0,
                    "condition": CarCondition.new,
                    "status": CarStatus.available,
                    "exterior_color": "Xanh Isle of Man Green",
                    "interior": "Ghế M Carbon Bucket Da Merino Cam Kyalami",
                    "description": "Chiến binh đường đua hợp pháp hoàn toàn mới 100%. Sở hữu khối động cơ S58 huyền thoại sản sinh 503 mã lực, trần xe bằng sợi carbon siêu nhẹ, hệ thống phanh gốm M Carbon Ceramic tiêu chuẩn cao nhất.",
                    "badge": "Mới 100%",
                    "owners_count": 0,
                    "is_ready": True,
                    "has_factory_warranty": True,
                    "warranty_months": 36,
                    "is_inspected": True,
                    "is_featured": True,
                    "specs": [
                        {"group": "Hiệu năng", "label": "Động cơ", "value": "3.0L BMW M TwinPower Turbo I6 (S58)"},
                        {"group": "Hiệu năng", "label": "Công suất cực đại", "value": "503 hp @ 6,250 rpm"},
                        {"group": "Hiệu năng", "label": "Tăng tốc 0-100 km/h", "value": "3.9 giây"},
                    ],
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": True},
                        {"url": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.interior, "is_primary": False},
                    ]
                },
                {
                    "brand_id": audi.id,
                    "name": "Audi RS7 Sportback Performance",
                    "slug": "audi-rs7-sportback-performance-2023",
                    "stock_code": "ATL-RS7-PERF",
                    "vin": "WAUZZZF28NN029184",
                    "price": 8900000000.0,
                    "monthly_installment": 68000000.0,
                    "year": 2023,
                    "body_type": "Sedan",
                    "fuel_type": "Xăng",
                    "transmission": "Tiptronic 8 cấp",
                    "drivetrain": "AWD",
                    "odo_km": 4200,
                    "condition": CarCondition.used,
                    "status": CarStatus.available,
                    "exterior_color": "Xám Nardo Grey",
                    "interior": "Da Valcona đen khâu chỉ tổ ong RS đỏ",
                    "description": "Tuyệt tác thiết kế Gran Turismo kết hợp sức mạnh phi thường của siêu xe. Hệ dẫn động 4 bánh toàn thời gian Quattro lừng danh với vi sai thể thao, đèn chiếu sáng laser Audi HD Matrix thông minh.",
                    "badge": "Hiệu Năng Cao",
                    "owners_count": 1,
                    "is_ready": True,
                    "has_factory_warranty": True,
                    "warranty_months": 24,
                    "is_inspected": True,
                    "is_featured": True,
                    "specs": [
                        {"group": "Hiệu năng", "label": "Động cơ", "value": "4.0L V8 TFSI Twin-Turbo với MHEV 48V"},
                        {"group": "Hiệu năng", "label": "Công suất cực đại", "value": "621 hp @ 6,000 rpm"},
                        {"group": "Hiệu năng", "label": "Tăng tốc 0-100 km/h", "value": "3.3 giây"},
                    ],
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": True},
                    ]
                },
                {
                    "brand_id": landrover.id,
                    "name": "Range Rover SV Autobiography LWB",
                    "slug": "range-rover-sv-autobiography-lwb-2023",
                    "stock_code": "ATL-RR-SVLWB",
                    "vin": "SALWR2V42PA829104",
                    "price": 23500000000.0,
                    "monthly_installment": 180000000.0,
                    "year": 2023,
                    "body_type": "SUV",
                    "fuel_type": "Xăng",
                    "transmission": "Tự động 8 cấp ZF",
                    "drivetrain": "AWD",
                    "odo_km": 3000,
                    "condition": CarCondition.used,
                    "status": CarStatus.available,
                    "exterior_color": "Bicolour Sunrise Gold / Đen Santorini",
                    "interior": "Da Semi-Aniline SV Serenity Trắng Pearl",
                    "description": "Đỉnh cao du thuyền mặt đất. Bản trục cơ sở kéo dài LWB với khoang thương gia hàng ghế sau chỉnh điện 24 hướng, tủ lạnh rượu champagne tích hợp ly pha lê Dartington, bàn làm việc mở điện.",
                    "badge": "Chủ Tịch",
                    "owners_count": 1,
                    "is_ready": True,
                    "has_factory_warranty": True,
                    "warranty_months": 30,
                    "is_inspected": True,
                    "is_featured": False,
                    "specs": [
                        {"group": "Hiệu năng", "label": "Động cơ", "value": "4.4L V8 Twin-Turbo"},
                        {"group": "Hiệu năng", "label": "Công suất cực đại", "value": "523 hp"},
                    ],
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": True},
                    ]
                },
                {
                    "brand_id": ferrari.id,
                    "name": "Ferrari Roma Coupe V8",
                    "slug": "ferrari-roma-coupe-v8-2022",
                    "stock_code": "ATL-FER-ROMA",
                    "vin": "ZFF90BFA0N0281943",
                    "price": 19800000000.0,
                    "monthly_installment": 150000000.0,
                    "year": 2022,
                    "body_type": "Coupe",
                    "fuel_type": "Xăng",
                    "transmission": "Ly hợp kép F1 8 cấp",
                    "drivetrain": "RWD",
                    "odo_km": 2900,
                    "condition": CarCondition.used,
                    "status": CarStatus.available,
                    "exterior_color": "Xanh Blu Corsa Metallic",
                    "interior": "Da Cuoio Nâu Cổ Điển Ý",
                    "description": "Hiện thân của lối sống La Nuova Dolce Vita nước Ý thập niên 50-60. Đường nét khí động học tối giản không tì vết, âm thanh ống xả thuần túy từ động cơ V8 turbo đạt giải Động cơ của năm.",
                    "badge": "La Nuova Dolce Vita",
                    "owners_count": 1,
                    "is_ready": True,
                    "has_factory_warranty": True,
                    "warranty_months": 12,
                    "is_inspected": True,
                    "is_featured": False,
                    "specs": [
                        {"group": "Hiệu năng", "label": "Động cơ", "value": "3.9L Twin-Turbo 90° V8"},
                        {"group": "Hiệu năng", "label": "Công suất cực đại", "value": "612 hp @ 7,500 rpm"},
                        {"group": "Hiệu năng", "label": "Tăng tốc 0-100 km/h", "value": "3.4 giây"},
                    ],
                    "images": [
                        {"url": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", "category": ImageCategory.exterior, "is_primary": True},
                    ]
                }
            ]

            for c_data in cars_data:
                images_info = c_data.pop("images", [])
                car = Car(**c_data)
                db.add(car)
                db.commit()
                db.refresh(car)

                # Add images
                for img_data in images_info:
                    car_img = CarImage(
                        car_id=car.id,
                        image_url=img_data["url"],
                        category=img_data["category"],
                        is_primary=img_data["is_primary"],
                        sort_order=0 if img_data["is_primary"] else 1
                    )
                    db.add(car_img)

                # Add inspection report
                report = InspectionReport(
                    car_id=car.id,
                    total_points=150,
                    passed_points=150,
                    summary="Xe đã vượt qua quy trình kiểm định 150 điểm tiêu chuẩn Atelier. Khung gầm nguyên bản, không thủy kích, động cơ và hệ thống điện tử hoàn hảo.",
                    items=[
                        {"category": "Khung gầm & Thân vỏ", "status": "passed", "note": "Không tai nạn, nước sơn zin 98%"},
                        {"category": "Động cơ & Truyền động", "status": "passed", "note": "Nguyên bản, không tháo rã"},
                        {"category": "Nội thất & Tiện nghi", "status": "passed", "note": "Hệ thống điện và điều hòa làm lạnh nhanh"},
                    ]
                )
                db.add(report)

            db.commit()

        # 4. Posts
        if db.query(Post).count() == 0:
            print("Đang tạo bài viết tin tức...")
            posts_data = [
                {
                    "title": "Trải Nghiệm Porsche 911 GT3 (992) – Cảm Xúc Cơ Khí Thuần Khiết Giữa Kỷ Nguyên Số Hóa",
                    "slug": "trai-nghiem-porsche-911-gt3-992",
                    "excerpt": "Trong một thế giới ngập tràn xe điện và những con số mô-men xoắn tức thời vô hồn, tiếng thét 9.000 vòng/phút của cỗ máy 4.0L hút khí tự nhiên là một thánh đường dành riêng cho những kẻ tôn sùng xúc giác lái.",
                    "content": "<p>Được nhào nặn từ đội ngũ Porsche Motorsport tại Flacht, 911 GT3 thế hệ 992 không sinh ra để thỏa hiệp. Treo trước tay đòn kép thừa hưởng trực tiếp từ xe đua 911 RSR mang đến sự chính xác tuyệt đối ở từng milimet đánh lái...</p>",
                    "cover_url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
                    "category": "Trải Nghiệm Siêu Xe",
                    "is_published": True
                },
                {
                    "title": "Bí Mật Đằng Sau Tiêu Chuẩn Kiểm Định 150 Điểm Tại Atelier Curated Automotive",
                    "slug": "tieu-chuan-kiem-dinh-150-diem-atelier",
                    "excerpt": "Mỗi chiếc xe khi bước qua ngưỡng cửa của Atelier đều phải vượt qua bài kiểm tra khắt khe bậc nhất ngành công nghiệp xe sang đã qua sử dụng.",
                    "content": "<p>Không chỉ dừng lại ở việc soi độ dày lớp sơn hay kiểm tra lịch sử hãng, các kỹ sư trưởng của chúng tôi sử dụng thiết bị nội soi buồng đốt chuyên dụng và quét sóng siêu âm đo độ biến dạng vi mô của hệ khung unibody...</p>",
                    "cover_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
                    "category": "Cẩm Nang & Tiêu Chuẩn",
                    "is_published": True
                },
                {
                    "title": "Dự Đoán Xu Hướng Giá Trị Các Dòng Xe Thể Thao Động Cơ Đốt Trong Thuần Túy 2026",
                    "slug": "du-doan-gia-tri-xe-the-thao-dot-trong-2026",
                    "excerpt": "Tại sao các nhà sưu tầm thượng lưu đang ráo riết săn lùng những mẫu xe V8 và Flat-6 cuối cùng trước làn sóng điện hóa toàn diện?",
                    "content": "<p>Quy luật khan hiếm đang vận hành mạnh mẽ hơn bao giờ hết. Khi các nhà sản xuất lớn công bố lộ trình khai tử động cơ đốt trong dung tích lớn, những cỗ máy hút khí tự nhiên và twin-turbo hiệu năng cao đã chính thức bước vào hàng ngũ tài sản đầu tư tích sản...</p>",
                    "cover_url": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
                    "category": "Thị Trường & Đầu Tư",
                    "is_published": True
                }
            ]
            for p in posts_data:
                db.add(Post(**p))
            db.commit()

        print("Đã hoàn tất seed dữ liệu thành công!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
