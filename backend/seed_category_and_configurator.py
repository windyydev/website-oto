"""
Seed Cây danh mục đa cấp (Category Tree), Biến thể màu sắc kèm ảnh & giá, và Bảng Option xe sang
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from sqlalchemy import text
from app.core.database import SessionLocal, Base, engine
import app.models # Nạp models
from app.models.category import Category
from app.models.car import Car, CarColor, CarOption

def run_seed():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;"))
        conn.commit()
    db = SessionLocal()
    try:
        print("--- 1. SEED CÂY DANH MỤC ĐA TẦNG (CATEGORY TREE) ---")
        if db.query(Category).count() == 0:
            # LEVEL 1: Phân Khúc Xe
            cat_sports = Category(name="Siêu Xe Thể Thao", slug="sieu-xe-the-thao", level=1, sort_order=1)
            cat_suv = Category(name="SUV Siêu Sang", slug="suv-sieu-sang", level=1, sort_order=2)
            cat_gt = Category(name="Grand Tourer & Sedan", slug="grand-tourer-sedan", level=1, sort_order=3)
            db.add_all([cat_sports, cat_suv, cat_gt])
            db.commit()

            # LEVEL 2: Hãng Xe dưới Phân Khúc
            # Dưới Siêu Xe Thể Thao:
            cat_porsche_sports = Category(name="Porsche", slug="porsche-sports", level=2, sort_order=1, parent_id=cat_sports.id)
            cat_ferrari_sports = Category(name="Ferrari", slug="ferrari-sports", level=2, sort_order=2, parent_id=cat_sports.id)
            # Dưới SUV Siêu Sang:
            cat_merc_suv = Category(name="Mercedes-AMG", slug="mercedes-amg-suv", level=2, sort_order=1, parent_id=cat_suv.id)
            cat_porsche_suv = Category(name="Porsche SUV", slug="porsche-suv", level=2, sort_order=2, parent_id=cat_suv.id)
            # Dưới Grand Tourer & Sedan:
            cat_bentley_gt = Category(name="Bentley", slug="bentley-gt", level=2, sort_order=1, parent_id=cat_gt.id)
            cat_bmw_gt = Category(name="BMW M Series", slug="bmw-m-gt", level=2, sort_order=2, parent_id=cat_gt.id)
            db.add_all([cat_porsche_sports, cat_ferrari_sports, cat_merc_suv, cat_porsche_suv, cat_bentley_gt, cat_bmw_gt])
            db.commit()

            # LEVEL 3: Dòng Xe / Series
            # Dưới Porsche Sports:
            series_911 = Category(name="Porsche 911 Series", slug="porsche-911-series", level=3, sort_order=1, parent_id=cat_porsche_sports.id)
            series_718 = Category(name="Porsche 718 Cayman/Boxster", slug="porsche-718-series", level=3, sort_order=2, parent_id=cat_porsche_sports.id)
            # Dưới Mercedes-AMG SUV:
            series_g_class = Category(name="G-Class (G63 AMG)", slug="mercedes-g-class", level=3, sort_order=1, parent_id=cat_merc_suv.id)
            # Dưới Ferrari:
            series_f8 = Category(name="Ferrari F8 / 296 Series", slug="ferrari-f8-series", level=3, sort_order=1, parent_id=cat_ferrari_sports.id)
            db.add_all([series_911, series_718, series_g_class, series_f8])
            db.commit()

            # LEVEL 4: Phiên Bản / Trim
            # Dưới 911 Series:
            trim_911_gt3 = Category(name="911 GT3 (992)", slug="911-gt3-992", level=4, sort_order=1, parent_id=series_911.id)
            trim_911_turbo_s = Category(name="911 Turbo S", slug="911-turbo-s", level=4, sort_order=2, parent_id=series_911.id)
            trim_911_carrera_gts = Category(name="911 Carrera GTS", slug="911-carrera-gts", level=4, sort_order=3, parent_id=series_911.id)
            # Dưới G-Class:
            trim_g63_amg = Category(name="G63 AMG V8 BiTurbo", slug="g63-amg-v8", level=4, sort_order=1, parent_id=series_g_class.id)
            db.add_all([trim_911_gt3, trim_911_turbo_s, trim_911_carrera_gts, trim_g63_amg])
            db.commit()
            print("Đã tạo cây danh mục 4 cấp độ thành công!")

        # Gán category cho các xe hiện có
        cat_gt3 = db.query(Category).filter(Category.slug == "911-gt3-992").first()
        cat_g63 = db.query(Category).filter(Category.slug == "g63-amg-v8").first()

        cars = db.query(Car).all()
        for car in cars:
            if "gt3" in car.slug.lower() and cat_gt3:
                car.category_id = cat_gt3.id
            elif ("g63" in car.slug.lower() or "mercedes" in car.slug.lower()) and cat_g63:
                car.category_id = cat_g63.id
            elif cat_gt3:
                car.category_id = cat_gt3.id
        db.commit()
        print(f"Đã liên kết {len(cars)} mẫu xe vào Cây danh mục!")

        print("--- 2. SEED BIẾN THỂ MÀU SẮC (COLOR VARIANTS) CHO XE ---")
        # Thêm màu sắc cho từng xe nếu chưa có
        for car in cars:
            if db.query(CarColor).filter(CarColor.car_id == car.id).count() == 0:
                colors_data = [
                    {
                        "car_id": car.id,
                        "name": "Chalk / Crayon (Xám Khói)",
                        "hex_code": "#D2D1CD",
                        "color_type": "metallic",
                        "price_delta": 95000000.0,
                        "images": [
                            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
                        ],
                        "sort_order": 1,
                        "is_default": True
                    },
                    {
                        "car_id": car.id,
                        "name": "Guards Red (Đỏ Thể Thao)",
                        "hex_code": "#C41E3A",
                        "color_type": "standard",
                        "price_delta": 0.0,
                        "images": [
                            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1400&q=80"
                        ],
                        "sort_order": 2,
                        "is_default": False
                    },
                    {
                        "car_id": car.id,
                        "name": "Gentian Blue Metallic (Xanh Biển Ánh Kim)",
                        "hex_code": "#1B365D",
                        "color_type": "metallic",
                        "price_delta": 95000000.0,
                        "images": [
                            "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1400&q=80"
                        ],
                        "sort_order": 3,
                        "is_default": False
                    },
                    {
                        "car_id": car.id,
                        "name": "Python Green (Xanh Lục Độc Bản PTS)",
                        "hex_code": "#30B547",
                        "color_type": "bespoke",
                        "price_delta": 360000000.0,
                        "images": [
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80"
                        ],
                        "sort_order": 4,
                        "is_default": False
                    },
                    {
                        "car_id": car.id,
                        "name": "Deep Obsidian Black (Đen Huyền Bí)",
                        "hex_code": "#111215",
                        "color_type": "standard",
                        "price_delta": 0.0,
                        "images": [
                            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1400&q=80",
                            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1400&q=80"
                        ],
                        "sort_order": 5,
                        "is_default": False
                    }
                ]
                for c in colors_data:
                    db.add(CarColor(**c))
        db.commit()
        print("Đã tạo bộ biến thể màu sắc kèm ảnh & giá chênh lệch thành công!")

        print("--- 3. SEED BẢNG OPTIONS & TRANG BỊ CẤU HÌNH ---")
        for car in cars:
            if db.query(CarOption).filter(CarOption.car_id == car.id).count() == 0:
                options_data = [
                    # Nhóm: Mâm xe
                    {
                        "car_id": car.id,
                        "group": "Mâm & Lốp (Wheels)",
                        "name": "Mâm 20/21-inch Carrera S Tiêu Chuẩn",
                        "code": "46I",
                        "description": "Mâm hợp kim nhôm đúc nguyên khối trọng lượng nhẹ.",
                        "price": 0.0,
                        "is_standard": True,
                        "is_selected": True,
                        "sort_order": 1
                    },
                    {
                        "car_id": car.id,
                        "group": "Mâm & Lốp (Wheels)",
                        "name": "Mâm 20/21-inch 911 Turbo S Khóa Tâm Siêu Nhẹ",
                        "code": "46M",
                        "description": "Thiết kế chấu chữ Y khóa tâm Center-Lock thừa hưởng từ xe đua.",
                        "price": 165000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 2
                    },
                    {
                        "car_id": car.id,
                        "group": "Mâm & Lốp (Wheels)",
                        "name": "Gói sơn mâm Satin Black mờ thể thao",
                        "code": "1NX",
                        "description": "Phủ lớp sơn bảo vệ chống trầy Satin Black cao cấp.",
                        "price": 55000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 3
                    },

                    # Nhóm: Nội thất & Da
                    {
                        "car_id": car.id,
                        "group": "Nội Thất & Ghế (Interior)",
                        "name": "Gói da nội thất cao cấp phối 2 tông màu Black/Bordeaux Red",
                        "code": "KA",
                        "description": "Da bò Nappa cao cấp bọc toàn bộ taplo, tapi cửa và bệ tỳ tay.",
                        "price": 180000000.0,
                        "is_standard": False,
                        "is_selected": True,
                        "sort_order": 4
                    },
                    {
                        "car_id": car.id,
                        "group": "Nội Thất & Ghế (Interior)",
                        "name": "Ghế thể thao Sports Seats Plus chỉnh điện 18 hướng có sưởi & làm mát",
                        "code": "Q1J",
                        "description": "Nhớ vị trí ghế lái và nâng đỡ thắt lưng tự động.",
                        "price": 95000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 5
                    },
                    {
                        "car_id": car.id,
                        "group": "Nội Thất & Ghế (Interior)",
                        "name": "Gói ốp nội thất sợi Carbon nhám Matt Carbon Fiber",
                        "code": "5TX",
                        "description": "Ốp sợi Carbon thật trên bảng điều khiển trung tâm và bệ cửa.",
                        "price": 140000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 6
                    },

                    # Nhóm: Vận hành & Hiệu năng
                    {
                        "car_id": car.id,
                        "group": "Vận Hành & Khung Gầm (Performance)",
                        "name": "Hệ thống nâng hạ gầm trục trước chủ động Front Axle Lift",
                        "code": "2UH",
                        "description": "Tăng khoảng sáng gầm xe 40mm bằng nút bấm hoặc định vị GPS tự động.",
                        "price": 125000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 7
                    },
                    {
                        "car_id": car.id,
                        "group": "Vận Hành & Khung Gầm (Performance)",
                        "name": "Hệ thống phanh gốm Carbon Ceramic (PCCB) kẹp phanh vàng",
                        "code": "1LX",
                        "description": "Hiệu suất phanh tức thì, giảm 50% trọng lượng không treo.",
                        "price": 390000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 8
                    },
                    {
                        "car_id": car.id,
                        "group": "Vận Hành & Khung Gầm (Performance)",
                        "name": "Hệ thống ống xả thể thao Sport Exhaust chụp pô đen bóng",
                        "code": "0P9",
                        "description": "Van điều khiển âm thanh ống xả cho tiếng nổ gầm rú phấn khích.",
                        "price": 135000000.0,
                        "is_standard": False,
                        "is_selected": True,
                        "sort_order": 9
                    },

                    # Nhóm: Công nghệ & Âm thanh
                    {
                        "car_id": car.id,
                        "group": "Công Nghệ & Âm Thanh (Technology)",
                        "name": "Dàn âm thanh vòm Burmester® High-End 3D Surround Sound (13 loa 855W)",
                        "code": "9VJ",
                        "description": "Đỉnh cao âm thanh tái hiện không gian phòng hòa nhạc tại tư gia.",
                        "price": 230000000.0,
                        "is_standard": False,
                        "is_selected": False,
                        "sort_order": 10
                    },
                    {
                        "car_id": car.id,
                        "group": "Công Nghệ & Âm Thanh (Technology)",
                        "name": "Cụm đèn pha LED ma trận tối màu với công nghệ PDLS Plus",
                        "code": "8JU",
                        "description": "Tự động phân vùng chùm sáng chống chói xe đối diện.",
                        "price": 155000000.0,
                        "is_standard": False,
                        "is_selected": True,
                        "sort_order": 11
                    }
                ]
                for opt in options_data:
                    db.add(CarOption(**opt))
        db.commit()
        print("Đã hoàn tất seed Options và trang bị xe sang thành công!")

    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
