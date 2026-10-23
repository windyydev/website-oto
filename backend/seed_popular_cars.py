"""
Script Seed Dữ Liệu Xe Phổ Thông ("Xe Cỏ" / Xe Gia Đình Thông Dụng tại Việt Nam)
Bao gồm các hãng: Toyota, Honda, Hyundai, Kia, Ford, Mitsubishi, Mazda
Mỗi hãng từ 5 - 10 mẫu xe kèm năm sản xuất, kiểu dáng, màu sắc, gói phụ kiện và Cây danh mục 4 tầng.
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.core.database import SessionLocal, Base, engine
import app.models
from app.models.brand import Brand
from app.models.category import Category
from app.models.car import Car, CarColor, CarOption, CarImage, CarCondition, CarStatus, ImageCategory
from app.models.consultant import Consultant

def run_seed():
    print("=========================================================")
    print("BẮT ĐẦU XÓA DỮ LIỆU CŨ VÀ SEED XE PHỔ THÔNG VIỆT NAM")
    print("=========================================================")
    
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        # Xóa an toàn tất cả các bảng xe, ảnh, màu, option, category và brand cũ
        conn.execute(text("""
            TRUNCATE TABLE 
                test_drive_appointments, 
                leads, 
                car_images, 
                car_colors, 
                car_options, 
                car_features, 
                inspection_reports, 
                cars, 
                categories, 
                brands 
            RESTART IDENTITY CASCADE;
        """))
        conn.commit()
    print("-> Đã xóa sạch toàn bộ xe cũ, ảnh, danh mục và thương hiệu cũ!")

    db = SessionLocal()
    try:
        # 1. TẠO TƯ VẤN VIÊN
        if db.query(Consultant).count() == 0:
            consultant = Consultant(
                name="Nguyễn Văn Hùng",
                title="Chuyên Viên Tư Vấn & Định Giá Xe Lướt",
                phone="0908 123 456",
                email="hung.nguyen@showroom-oto.vn",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                is_active=True
            )
            db.add(consultant)
            db.commit()

        # 2. SEED CÁC HÃNG XE PHỔ THÔNG TẠI VIỆT NAM
        print("-> Đang tạo các hãng xe phổ thông...")
        brands_data = [
            {
                "name": "Toyota",
                "slug": "toyota",
                "description": "Thương hiệu ô tô bền bỉ, tiết kiệm nhiên liệu và giữ giá số 1 tại Việt Nam.",
                "logo_url": "https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?auto=format&fit=crop&w=150&q=80"
            },
            {
                "name": "Honda",
                "slug": "honda",
                "description": "Cảm giác lái thể thao, động cơ VTEC mạnh mẽ và công nghệ an toàn Honda Sensing.",
                "logo_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=150&q=80"
            },
            {
                "name": "Hyundai",
                "slug": "hyundai",
                "description": "Thiết kế hiện đại, trang bị công nghệ ngập tràn và tiện nghi vượt tầm phân khúc.",
                "logo_url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=150&q=80"
            },
            {
                "name": "Kia",
                "slug": "kia",
                "description": "Phong cách năng động, thời thượng, giá bán hấp dẫn và chi phí sử dụng tối ưu.",
                "logo_url": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=150&q=80"
            },
            {
                "name": "Ford",
                "slug": "ford",
                "description": "Khung gầm đầm chắc chuẩn Mỹ, động cơ Bi-Turbo uy lực và dẫn đầu phân khúc bán tải.",
                "logo_url": "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=150&q=80"
            },
            {
                "name": "Mitsubishi",
                "slug": "mitsubishi",
                "description": "Vua doanh số MPV gia đình, động cơ bền bỉ, gầm cao và điều hòa mát sâu huyền thoại.",
                "logo_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80"
            },
            {
                "name": "Mazda",
                "slug": "mazda",
                "description": "Ngôn ngữ thiết kế KODO tinh tế, nội thất da cao cấp và công nghệ SkyActiv tiết kiệm.",
                "logo_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80"
            }
        ]
        
        brand_map = {}
        for b in brands_data:
            brand_obj = Brand(**b)
            db.add(brand_obj)
            db.commit()
            db.refresh(brand_obj)
            brand_map[brand_obj.slug] = brand_obj
        print(f"-> Đã tạo {len(brand_map)} hãng xe phổ thông thành công!")

        # 3. SEED CÂY DANH MỤC XE PHỔ THÔNG (CATEGORY TREE 4 CẤP)
        print("-> Đang tạo cây danh mục phân cấp...")
        # CẤP 1: Phân Khúc Kiểu Dáng & Công Năng
        root_categories = [
            {"name": "Sedan Đô Thị & Gia Đình", "slug": "sedan-gia-dinh", "level": 1, "sort_order": 1, "desc": "Các mẫu sedan 4-5 chỗ êm ái, cốp riêng biệt, tối ưu di chuyển hàng ngày."},
            {"name": "SUV & Crossover Gầm Cao", "slug": "suv-crossover", "level": 1, "sort_order": 2, "desc": "Gầm cao thoáng đãng, tầm nhìn vượt trội, linh hoạt phố đông và đèo dốc."},
            {"name": "MPV 7 Chỗ Đa Dụng", "slug": "mpv-7-cho", "level": 1, "sort_order": 3, "desc": "Không gian rộng rãi cho 7 người, nội thất linh hoạt cho cả nhà và kinh doanh dịch vụ."},
            {"name": "Bán Tải & Bán Tải Địa Hình", "slug": "ban-tai-pickup", "level": 1, "sort_order": 4, "desc": "Thùng hàng rộng rãi, động cơ diesel khỏe khoắn, đa dụng chở hàng và đi phượt."},
            {"name": "Hatchback Đô Thị Nhỏ Gọn", "slug": "hatchback-co-nho", "level": 1, "sort_order": 5, "desc": "Kích thước nhỏ gọn, dễ luồn lách phố hẹp, tiết kiệm xăng vượt trội."}
        ]
        
        cat_roots = {}
        for rc in root_categories:
            c = Category(name=rc["name"], slug=rc["slug"], level=rc["level"], sort_order=rc["sort_order"], description=rc["desc"])
            db.add(c)
            db.commit()
            db.refresh(c)
            cat_roots[rc["slug"]] = c

        # Helper tạo category con
        def create_cat(name, slug, level, sort_order, parent_id):
            cat = Category(name=name, slug=slug, level=level, sort_order=sort_order, parent_id=parent_id)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            return cat

        # CẤP 2: Hãng xe dưới Phân khúc
        cat_l2 = {}
        # Dưới Sedan:
        cat_l2["sedan-toyota"] = create_cat("Toyota Sedan", "sedan-toyota", 2, 1, cat_roots["sedan-gia-dinh"].id)
        cat_l2["sedan-honda"] = create_cat("Honda Sedan", "sedan-honda", 2, 2, cat_roots["sedan-gia-dinh"].id)
        cat_l2["sedan-hyundai"] = create_cat("Hyundai Sedan", "sedan-hyundai", 2, 3, cat_roots["sedan-gia-dinh"].id)
        cat_l2["sedan-kia"] = create_cat("Kia Sedan", "sedan-kia", 2, 4, cat_roots["sedan-gia-dinh"].id)
        cat_l2["sedan-mazda"] = create_cat("Mazda Sedan", "sedan-mazda", 2, 5, cat_roots["sedan-gia-dinh"].id)
        cat_l2["sedan-mitsubishi"] = create_cat("Mitsubishi Sedan", "sedan-mitsubishi", 2, 6, cat_roots["sedan-gia-dinh"].id)

        # Dưới SUV & CUV:
        cat_l2["suv-toyota"] = create_cat("Toyota SUV & CUV", "suv-toyota", 2, 1, cat_roots["suv-crossover"].id)
        cat_l2["suv-honda"] = create_cat("Honda SUV & CUV", "suv-honda", 2, 2, cat_roots["suv-crossover"].id)
        cat_l2["suv-hyundai"] = create_cat("Hyundai SUV & CUV", "suv-hyundai", 2, 3, cat_roots["suv-crossover"].id)
        cat_l2["suv-kia"] = create_cat("Kia SUV & CUV", "suv-kia", 2, 4, cat_roots["suv-crossover"].id)
        cat_l2["suv-ford"] = create_cat("Ford SUV & CUV", "suv-ford", 2, 5, cat_roots["suv-crossover"].id)
        cat_l2["suv-mitsubishi"] = create_cat("Mitsubishi SUV & CUV", "suv-mitsubishi", 2, 6, cat_roots["suv-crossover"].id)
        cat_l2["suv-mazda"] = create_cat("Mazda SUV & CUV", "suv-mazda", 2, 7, cat_roots["suv-crossover"].id)

        # Dưới MPV 7 Chỗ:
        cat_l2["mpv-mitsubishi"] = create_cat("Mitsubishi MPV", "mpv-mitsubishi", 2, 1, cat_roots["mpv-7-cho"].id)
        cat_l2["mpv-toyota"] = create_cat("Toyota MPV", "mpv-toyota", 2, 2, cat_roots["mpv-7-cho"].id)
        cat_l2["mpv-hyundai"] = create_cat("Hyundai MPV", "mpv-hyundai", 2, 3, cat_roots["mpv-7-cho"].id)
        cat_l2["mpv-kia"] = create_cat("Kia MPV", "mpv-kia", 2, 4, cat_roots["mpv-7-cho"].id)
        cat_l2["mpv-honda"] = create_cat("Honda MPV", "mpv-honda", 2, 5, cat_roots["mpv-7-cho"].id)

        # Dưới Bán Tải:
        cat_l2["pickup-ford"] = create_cat("Ford Bán Tải", "pickup-ford", 2, 1, cat_roots["ban-tai-pickup"].id)
        cat_l2["pickup-toyota"] = create_cat("Toyota Bán Tải", "pickup-toyota", 2, 2, cat_roots["ban-tai-pickup"].id)
        cat_l2["pickup-mitsubishi"] = create_cat("Mitsubishi Bán Tải", "pickup-mitsubishi", 2, 3, cat_roots["ban-tai-pickup"].id)

        # Dưới Hatchback:
        cat_l2["hatch-hyundai"] = create_cat("Hyundai Hatchback", "hatch-hyundai", 2, 1, cat_roots["hatchback-co-nho"].id)
        cat_l2["hatch-kia"] = create_cat("Kia Hatchback", "hatch-kia", 2, 2, cat_roots["hatchback-co-nho"].id)
        cat_l2["hatch-toyota"] = create_cat("Toyota Hatchback", "hatch-toyota", 2, 3, cat_roots["hatchback-co-nho"].id)
        cat_l2["hatch-honda"] = create_cat("Honda Hatchback", "hatch-honda", 2, 4, cat_roots["hatchback-co-nho"].id)

        print("-> Đã tạo xong Cây danh mục tầng 1 & tầng 2.")

        # CẤP 3: Dòng xe / Model
        cat_models = {}
        # Dòng xe Toyota
        cat_models["vios"] = create_cat("Toyota Vios Series", "toyota-vios-series", 3, 1, cat_l2["sedan-toyota"].id)
        cat_models["camry"] = create_cat("Toyota Camry Series", "toyota-camry-series", 3, 2, cat_l2["sedan-toyota"].id)
        cat_models["corolla-cross"] = create_cat("Toyota Corolla Cross Series", "toyota-corolla-cross-series", 3, 1, cat_l2["suv-toyota"].id)
        cat_models["fortuner"] = create_cat("Toyota Fortuner Series", "toyota-fortuner-series", 3, 2, cat_l2["suv-toyota"].id)
        cat_models["raize"] = create_cat("Toyota Raize Series", "toyota-raize-series", 3, 3, cat_l2["suv-toyota"].id)
        cat_models["veloz"] = create_cat("Toyota Veloz Cross Series", "toyota-veloz-cross-series", 3, 1, cat_l2["mpv-toyota"].id)
        cat_models["hilux"] = create_cat("Toyota Hilux Series", "toyota-hilux-series", 3, 1, cat_l2["pickup-toyota"].id)
        cat_models["yaris"] = create_cat("Toyota Yaris Series", "toyota-yaris-series", 3, 1, cat_l2["hatch-toyota"].id)

        # Dòng xe Honda
        cat_models["city"] = create_cat("Honda City Series", "honda-city-series", 3, 1, cat_l2["sedan-honda"].id)
        cat_models["civic"] = create_cat("Honda Civic Series", "honda-civic-series", 3, 2, cat_l2["sedan-honda"].id)
        cat_models["accord"] = create_cat("Honda Accord Series", "honda-accord-series", 3, 3, cat_l2["sedan-honda"].id)
        cat_models["crv"] = create_cat("Honda CR-V Series", "honda-crv-series", 3, 1, cat_l2["suv-honda"].id)
        cat_models["hrv"] = create_cat("Honda HR-V Series", "honda-hrv-series", 3, 2, cat_l2["suv-honda"].id)
        cat_models["brv"] = create_cat("Honda BR-V Series", "honda-brv-series", 3, 1, cat_l2["mpv-honda"].id)
        cat_models["brio"] = create_cat("Honda Brio Series", "honda-brio-series", 3, 1, cat_l2["hatch-honda"].id)

        # Dòng xe Hyundai
        cat_models["accent"] = create_cat("Hyundai Accent Series", "hyundai-accent-series", 3, 1, cat_l2["sedan-hyundai"].id)
        cat_models["elantra"] = create_cat("Hyundai Elantra Series", "hyundai-elantra-series", 3, 2, cat_l2["sedan-hyundai"].id)
        cat_models["creta"] = create_cat("Hyundai Creta Series", "hyundai-creta-series", 3, 1, cat_l2["suv-hyundai"].id)
        cat_models["tucson"] = create_cat("Hyundai Tucson Series", "hyundai-tucson-series", 3, 2, cat_l2["suv-hyundai"].id)
        cat_models["santafe"] = create_cat("Hyundai Santa Fe Series", "hyundai-santafe-series", 3, 3, cat_l2["suv-hyundai"].id)
        cat_models["custin"] = create_cat("Hyundai Custin Series", "hyundai-custin-series", 3, 1, cat_l2["mpv-hyundai"].id)
        cat_models["i10"] = create_cat("Hyundai Grand i10 Series", "hyundai-i10-series", 3, 1, cat_l2["hatch-hyundai"].id)

        # Dòng xe Kia
        cat_models["k3"] = create_cat("Kia K3 Series", "kia-k3-series", 3, 1, cat_l2["sedan-kia"].id)
        cat_models["k5"] = create_cat("Kia K5 Series", "kia-k5-series", 3, 2, cat_l2["sedan-kia"].id)
        cat_models["sonet"] = create_cat("Kia Sonet Series", "kia-sonet-series", 3, 1, cat_l2["suv-kia"].id)
        cat_models["seltos"] = create_cat("Kia Seltos Series", "kia-seltos-series", 3, 2, cat_l2["suv-kia"].id)
        cat_models["sportage"] = create_cat("Kia Sportage Series", "kia-sportage-series", 3, 3, cat_l2["suv-kia"].id)
        cat_models["sorento"] = create_cat("Kia Sorento Series", "kia-sorento-series", 3, 4, cat_l2["suv-kia"].id)
        cat_models["carnival"] = create_cat("Kia Carnival Series", "kia-carnival-series", 3, 1, cat_l2["mpv-kia"].id)
        cat_models["morning"] = create_cat("Kia Morning Series", "kia-morning-series", 3, 1, cat_l2["hatch-kia"].id)

        # Dòng xe Ford
        cat_models["ranger"] = create_cat("Ford Ranger Series", "ford-ranger-series", 3, 1, cat_l2["pickup-ford"].id)
        cat_models["raptor"] = create_cat("Ford Ranger Raptor Series", "ford-raptor-series", 3, 2, cat_l2["pickup-ford"].id)
        cat_models["everest"] = create_cat("Ford Everest Series", "ford-everest-series", 3, 1, cat_l2["suv-ford"].id)
        cat_models["territory"] = create_cat("Ford Territory Series", "ford-territory-series", 3, 2, cat_l2["suv-ford"].id)
        cat_models["explorer"] = create_cat("Ford Explorer Series", "ford-explorer-series", 3, 3, cat_l2["suv-ford"].id)

        # Dòng xe Mitsubishi
        cat_models["xpander"] = create_cat("Mitsubishi Xpander Series", "mitsubishi-xpander-series", 3, 1, cat_l2["mpv-mitsubishi"].id)
        cat_models["xpander-cross"] = create_cat("Mitsubishi Xpander Cross Series", "mitsubishi-xpander-cross-series", 3, 2, cat_l2["mpv-mitsubishi"].id)
        cat_models["xforce"] = create_cat("Mitsubishi Xforce Series", "mitsubishi-xforce-series", 3, 1, cat_l2["suv-mitsubishi"].id)
        cat_models["attrage"] = create_cat("Mitsubishi Attrage Series", "mitsubishi-attrage-series", 3, 1, cat_l2["sedan-mitsubishi"].id)
        cat_models["outlander"] = create_cat("Mitsubishi Outlander Series", "mitsubishi-outlander-series", 3, 2, cat_l2["suv-mitsubishi"].id)
        cat_models["pajero"] = create_cat("Mitsubishi Pajero Sport Series", "mitsubishi-pajero-sport-series", 3, 3, cat_l2["suv-mitsubishi"].id)
        cat_models["triton"] = create_cat("Mitsubishi Triton Series", "mitsubishi-triton-series", 3, 1, cat_l2["pickup-mitsubishi"].id)

        # Dòng xe Mazda
        cat_models["mazda2"] = create_cat("Mazda 2 Series", "mazda-2-series", 3, 1, cat_l2["sedan-mazda"].id)
        cat_models["mazda3"] = create_cat("Mazda 3 Series", "mazda-3-series", 3, 2, cat_l2["sedan-mazda"].id)
        cat_models["mazda6"] = create_cat("Mazda 6 Series", "mazda-6-series", 3, 3, cat_l2["sedan-mazda"].id)
        cat_models["cx3"] = create_cat("Mazda CX-3 Series", "mazda-cx3-series", 3, 1, cat_l2["suv-mazda"].id)
        cat_models["cx5"] = create_cat("Mazda CX-5 Series", "mazda-cx5-series", 3, 2, cat_l2["suv-mazda"].id)
        cat_models["cx8"] = create_cat("Mazda CX-8 Series", "mazda-cx8-series", 3, 3, cat_l2["suv-mazda"].id)

        print("-> Đã tạo xong Cây danh mục tầng 3 (Dòng xe).")

        # 4. DANH SÁCH 48 MẪU XE PHỔ THÔNG THỰC TẾ
        print("-> Đang nạp danh sách 48 mẫu xe phổ thông...")

        # Mẫu ảnh xe theo từng loại (Unsplash CDN chất lượng cao)
        IMG_SEDAN_WHITE = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80"
        IMG_SEDAN_RED = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80"
        IMG_SEDAN_BLACK = "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1400&q=80"
        IMG_SEDAN_SILVER = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
        
        IMG_SUV_WHITE = "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=80"
        IMG_SUV_BLACK = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80"
        IMG_SUV_RED = "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1400&q=80"
        IMG_SUV_ORANGE = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80"

        IMG_PICKUP_ORANGE = "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1400&q=80"
        IMG_PICKUP_GREY = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80"
        IMG_PICKUP_WHITE = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1400&q=80"

        IMG_MPV_WHITE = "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80"
        IMG_MPV_SILVER = "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1400&q=80"
        IMG_MPV_BLACK = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80"

        IMG_HATCH_YELLOW = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80"
        IMG_HATCH_RED = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80"
        IMG_HATCH_WHITE = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1400&q=80"

        # Ảnh nội thất & chi tiết
        IMG_INTERIOR = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80"
        IMG_DASHBOARD = "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1400&q=80"
        IMG_WHEELS = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"

        cars_database = [
            # ──────────────────── 1. TOYOTA (8 XE) ────────────────────
            {
                "brand": "toyota", "cat": "vios", "name": "Toyota Vios 1.5G CVT", "year": 2023,
                "body_type": "Sedan", "price": 545000000.0, "odo": 12000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Trắng Ngọc Trai", "interior": "Ghế da màu kem trang nhã",
                "badge": "Vua Doanh Số", "stock": "TOY-VIO-2023", "vin": "RL4BA3884K0184910",
                "desc": "Mẫu sedan hạng B bán chạy số 1 Việt Nam. Vận hành cực kỳ bền bỉ, tiết kiệm xăng chỉ 5.8L/100km, trang bị 7 túi khí, đèn full LED và kiểm soát hành trình Cruise Control.",
                "engine": "1.5L Dual VVT-i 4 xi-lanh", "power": "106 hp @ 6,000 rpm", "consumption": "5.8 L / 100km", "dims": "4,425 x 1,730 x 1,475 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            },
            {
                "brand": "toyota", "cat": "corolla-cross", "name": "Toyota Corolla Cross 1.8V", "year": 2023,
                "body_type": "SUV", "price": 860000000.0, "odo": 16000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Ánh Kim", "interior": "Da Nappa màu Nâu đỏ Terra Cotta",
                "badge": "Gầm Cao Đô Thị", "stock": "TOY-CRO-2023", "vin": "MR0BA3994N0294812",
                "desc": "Crossover nhập khẩu nguyên chiếc từ Thái Lan. Khung gầm TNGA toàn cầu đầm chắc, gói an toàn Toyota Safety Sense chủ động (cảnh báo tiền va chạm, giữ làn đường, radar ga tự động).",
                "engine": "1.8L 2ZR-FE 4 xi-lanh DOHC", "power": "138 hp @ 6,400 rpm", "consumption": "6.9 L / 100km", "dims": "4,460 x 1,825 x 1,620 mm",
                "main_img": IMG_SUV_RED, "type": "suv"
            },
            {
                "brand": "toyota", "cat": "camry", "name": "Toyota Camry 2.5Q", "year": 2022,
                "body_type": "Sedan", "price": 1280000000.0, "odo": 22000, "fuel": "Xăng", "trans": "Tự động 8 cấp Direct-Shift",
                "drive": "Cầu trước (FWD)", "color": "Đen Huyền Bí", "interior": "Da cao cấp Đen khâu chỉ thể thao",
                "badge": "Sang Trọng Đẳng Cấp", "stock": "TOY-CAM-2022", "vin": "6T1BF3253P0493821",
                "desc": "Sedan D chuẩn mực của giới doanh nhân thành đạt. Hàng ghế sau chỉnh điện ngả lưng, rèm che nắng điện, hệ thống âm thanh 9 loa JBL hàng hiệu, cửa sổ trời toàn cảnh.",
                "engine": "2.5L Dynamic Force 4 xi-lanh", "power": "207 hp @ 6,600 rpm", "consumption": "7.1 L / 100km", "dims": "4,885 x 1,840 x 1,445 mm",
                "main_img": IMG_SEDAN_BLACK, "type": "sedan"
            },
            {
                "brand": "toyota", "cat": "fortuner", "name": "Toyota Fortuner Legender 2.8L 4x4 AT", "year": 2022,
                "body_type": "SUV", "price": 1350000000.0, "odo": 28000, "fuel": "Dầu (Diesel)", "trans": "Tự động 6 cấp có lẫy chuyển số",
                "drive": "2 cầu bán thời gian (4WD)", "color": "Trắng Ngọc Trai", "interior": "Da 2 tông màu Đỏ Đen Legender",
                "badge": "SUV Địa Hình 7 Chỗ", "stock": "TOY-FOR-2022", "vin": "MHFAB3943M0193847",
                "desc": "Chiếc SUV 7 chỗ khung gầm rời unibody trứ danh. Động cơ dầu 2.8L tăng áp khỏe khoắn 500Nm mô-men xoắn, camera 360 độ, gói an toàn TSS, vượt mọi cung đường địa hình phức tạp.",
                "engine": "2.8L Diesel 1GD-FTV Turbo tăng áp", "power": "201 hp @ 3,400 rpm", "consumption": "7.9 L / 100km", "dims": "4,795 x 1,855 x 1,835 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "toyota", "cat": "veloz", "name": "Toyota Veloz Cross Top 1.5 CVT", "year": 2023,
                "body_type": "MPV", "price": 698000000.0, "odo": 14000, "fuel": "Xăng", "trans": "Tự động vô cấp D-CVT",
                "drive": "Cầu trước (FWD)", "color": "Bạc Ánh Kim", "interior": "Da pha nỉ cao cấp phối 2 màu",
                "badge": "MPV 7 Chỗ Gia Đình", "stock": "TOY-VEL-2023", "vin": "MHFBA3842N0948371",
                "desc": "MPV 7 chỗ phong cách crossover hiện đại. Phanh tay điện tử Auto Hold, sạc không dây, cảnh báo điểm mù, camera 360 và chế độ ghế sofa thư giãn cho cả gia đình.",
                "engine": "1.5L 2NR-VE 4 xi-lanh thẳng hàng", "power": "105 hp @ 6,000 rpm", "consumption": "6.3 L / 100km", "dims": "4,475 x 1,750 x 1,700 mm",
                "main_img": IMG_MPV_SILVER, "type": "mpv"
            },
            {
                "brand": "toyota", "cat": "raize", "name": "Toyota Raize 1.0 Turbo CVT", "year": 2023,
                "body_type": "SUV", "price": 510000000.0, "odo": 9500, "fuel": "Xăng", "trans": "Tự động vô cấp D-CVT",
                "drive": "Cầu trước (FWD)", "color": "Vàng Nóc Đen", "interior": "Ghế nỉ pha da viền chỉ nổi",
                "badge": "Gầm Cao Đô Thị Nhỏ", "stock": "TOY-RAI-2023", "vin": "JTDBC3124P0384729",
                "desc": "Mẫu CUV cỡ nhỏ nhập khẩu nguyên chiếc. Động cơ 1.0 Turbo linh hoạt, khoảng sáng gầm 200mm leo vỉa hè thoải mái, lẫy chuyển số vô lăng, màn hình 9 inch kết nối Apple CarPlay.",
                "engine": "1.0L 1KR-VET 3 xi-lanh Turbo tăng áp", "power": "98 hp @ 6,000 rpm", "consumption": "5.6 L / 100km", "dims": "4,030 x 1,710 x 1,605 mm",
                "main_img": IMG_SUV_ORANGE, "type": "suv"
            },
            {
                "brand": "toyota", "cat": "hilux", "name": "Toyota Hilux Adventure 2.8L 4x4 AT", "year": 2021,
                "body_type": "Bán tải", "price": 885000000.0, "odo": 35000, "fuel": "Dầu (Diesel)", "trans": "Tự động 6 cấp",
                "drive": "2 cầu 4x4 gài cầu điện tử", "color": "Xám Titan", "interior": "Da Đen thể thao Adventure",
                "badge": "Vua Bán Tải Bền Bỉ", "stock": "TOY-HIL-2021", "vin": "MROER3242M0194832",
                "desc": "Biểu tượng bán tải 'nồi đồng cối đá'. Khung gầm chịu lực siêu bền, dàn âm thanh 9 loa JBL, đèn LED Projector sắc sảo, gài cầu điện tử với khóa vi sai cầu sau vượt lầy.",
                "engine": "2.8L Diesel 1GD-FTV Turbo", "power": "201 hp @ 3,400 rpm", "consumption": "8.2 L / 100km", "dims": "5,325 x 1,900 x 1,815 mm",
                "main_img": IMG_PICKUP_GREY, "type": "pickup"
            },
            {
                "brand": "toyota", "cat": "yaris", "name": "Toyota Yaris 1.5G CVT", "year": 2022,
                "body_type": "Hatchback", "price": 595000000.0, "odo": 18000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Xanh Dương Ngọc", "interior": "Da màu kem sáng thanh lịch",
                "badge": "Nữ Hoàng Đô Thị", "stock": "TOY-YAR-2022", "vin": "MR0BA3821N0184729",
                "desc": "Chiếc hatchback nhập khẩu Thái Lan hoàn hảo cho phái đẹp và gia đình nhỏ. Vận hành nhẹ nhàng, bán kính vòng quay nhỏ 5.1m, cách âm tốt và 7 túi khí bảo vệ toàn diện.",
                "engine": "1.5L 2NR-FE 4 xi-lanh DOHC", "power": "107 hp @ 6,000 rpm", "consumption": "5.7 L / 100km", "dims": "4,140 x 1,730 x 1,500 mm",
                "main_img": IMG_HATCH_YELLOW, "type": "hatch"
            },

            # ──────────────────── 2. HONDA (7 XE) ────────────────────
            {
                "brand": "honda", "cat": "city", "name": "Honda City RS 1.5 CVT", "year": 2023,
                "body_type": "Sedan", "price": 569000000.0, "odo": 11000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Cá Tính", "interior": "Da pha da lộn khâu chỉ Đỏ thể thao RS",
                "badge": "Sedan Lái Hay Nhất", "stock": "HON-CIT-2023", "vin": "RLHGN2684P0394821",
                "desc": "Sedan hạng B rộng rãi nhất phân khúc, cảm giác lái phấn khích hàng đầu. Trang bị gói an toàn Honda Sensing, phanh đĩa 4 bánh, lẫy chuyển số thể thao và khởi động từ xa.",
                "engine": "1.5L i-VTEC DOHC 4 xi-lanh", "power": "119 hp @ 6,600 rpm", "consumption": "5.6 L / 100km", "dims": "4,580 x 1,748 x 1,467 mm",
                "main_img": IMG_SEDAN_RED, "type": "sedan"
            },
            {
                "brand": "honda", "cat": "civic", "name": "Honda Civic RS 1.5 VTEC Turbo", "year": 2022,
                "body_type": "Sedan", "price": 870000000.0, "odo": 19000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT có lẫy chuyển số",
                "drive": "Cầu trước (FWD)", "color": "Trắng Ngọc Trai", "interior": "Da kết hợp viền chỉ đỏ và lưới nhôm tổ ong",
                "badge": "Đậm Chất Thể Thao", "stock": "HON-CIV-2022", "vin": "MRHFE1683N0284729",
                "desc": "Chiếc sedan hạng C phong cách thể thao ấn tượng nhất. Động cơ tăng áp 176 mã lực tăng tốc dính lưng, 12 loa Bose cao cấp, màn hình kỹ thuật số 10.2 inch hiển thị đa thông tin.",
                "engine": "1.5L VTEC Turbo tăng áp", "power": "176 hp @ 6,000 rpm", "consumption": "6.5 L / 100km", "dims": "4,678 x 1,802 x 1,415 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            },
            {
                "brand": "honda", "cat": "crv", "name": "Honda CR-V 1.5L Turbo Sensing", "year": 2022,
                "body_type": "SUV", "price": 960000000.0, "odo": 25000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Đen Ánh Độc Tôn", "interior": "Da màu Đen ốp gỗ sang trọng",
                "badge": "CUV 7 Chỗ Gia Đình", "stock": "HON-CRV-2022", "vin": "RLHRW1882N0394821",
                "desc": "CUV 5+2 chỗ quốc dân của Honda. Khoang lái cực kỳ yên tĩnh, cửa sổ trời toàn cảnh Panorama, gói an toàn Honda Sensing kiểm soát hành trình thích ứng, đá cốp rảnh tay tiện lợi.",
                "engine": "1.5L VTEC Turbo 4 xi-lanh", "power": "188 hp @ 5,600 rpm", "consumption": "6.9 L / 100km", "dims": "4,623 x 1,855 x 1,679 mm",
                "main_img": IMG_SUV_BLACK, "type": "suv"
            },
            {
                "brand": "honda", "cat": "hrv", "name": "Honda HR-V RS 1.5 VTEC Turbo", "year": 2023,
                "body_type": "SUV", "price": 871000000.0, "odo": 13000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Xám Thiên Thạch", "interior": "Da Đen khâu chỉ Đỏ phong cách RS",
                "badge": "Coupe CUV Trẻ Trung", "stock": "HON-HRV-2023", "vin": "MRHRV3884P0193847",
                "desc": "Chiếc CUV B nhập khẩu Thái Lan kiểu dáng lai Coupe vuốt đuôi gợi cảm. Động cơ tăng áp 174 mã lực, ghế gập Magic Seat 3 chế độ độc quyền, tay nắm cửa sau ẩn cột C tinh tế.",
                "engine": "1.5L VTEC Turbo tăng áp", "power": "174 hp @ 6,000 rpm", "consumption": "6.7 L / 100km", "dims": "4,385 x 1,790 x 1,590 mm",
                "main_img": IMG_SUV_ORANGE, "type": "suv"
            },
            {
                "brand": "honda", "cat": "accord", "name": "Honda Accord 1.5 Turbo Sensing", "year": 2021,
                "body_type": "Sedan", "price": 1150000000.0, "odo": 31000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Đen Kim Loại", "interior": "Da Nappa màu Đen ốp gỗ Piano",
                "badge": "Sedan Doanh Nhân Đầm Chắc", "stock": "HON-ACC-2021", "vin": "1HGCV1F32MA019283",
                "desc": "Sedan hạng D nhập Thái Lan với khung gầm cứng vững đỉnh cao. Không gian hàng ghế sau mênh mông, hệ thống chủ động giảm ồn ANC 3 micrô, kính cách âm 2 lớp dày dặn.",
                "engine": "1.5L VTEC Turbo 4 xi-lanh", "power": "188 hp @ 5,500 rpm", "consumption": "6.2 L / 100km", "dims": "4,901 x 1,862 x 1,450 mm",
                "main_img": IMG_SEDAN_BLACK, "type": "sedan"
            },
            {
                "brand": "honda", "cat": "brv", "name": "Honda BR-V L 1.5 i-VTEC", "year": 2023,
                "body_type": "MPV", "price": 690000000.0, "odo": 10500, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Trắng Ngọc Trai", "interior": "Da Đen cao cấp êm ái",
                "badge": "MPV An Toàn 5 Sao", "stock": "HON-BRV-2023", "vin": "MRHBR1884P0384721",
                "desc": "Mẫu MPV 7 chỗ duy nhất trong tầm giá trang bị trọn vẹn Honda Sensing trên cả bản tiêu chuẩn. Khởi động từ xa, phanh khẩn cấp tự động, động cơ 119 mã lực khỏe nhất phân khúc MPV.",
                "engine": "1.5L i-VTEC DOHC 4 xi-lanh", "power": "119 hp @ 6,600 rpm", "consumption": "6.4 L / 100km", "dims": "4,490 x 1,780 x 1,685 mm",
                "main_img": IMG_MPV_WHITE, "type": "mpv"
            },
            {
                "brand": "honda", "cat": "brio", "name": "Honda Brio RS 1.2 AT", "year": 2021,
                "body_type": "Hatchback", "price": 410000000.0, "odo": 29000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Cam Sành Điệu", "interior": "Nỉ thể thao viền Cam nổi bật",
                "badge": "Xe Đô Thị Nhỏ Gọn", "stock": "HON-BRI-2021", "vin": "MRHDD1881M0194832",
                "desc": "Hatchback hạng A nhập khẩu Indonesia. Đầm chắc và rộng nhất phân khúc xe cỡ nhỏ, cảm giác lái lanh lợi, đuôi lướt gió RS thể thao, gương gập điện tích hợp xi-nhan LED.",
                "engine": "1.2L i-VTEC SOHC 4 xi-lanh", "power": "89 hp @ 6,000 rpm", "consumption": "5.4 L / 100km", "dims": "3,815 x 1,680 x 1,485 mm",
                "main_img": IMG_HATCH_YELLOW, "type": "hatch"
            },

            # ──────────────────── 3. HYUNDAI (7 XE) ────────────────────
            {
                "brand": "hyundai", "cat": "accent", "name": "Hyundai Accent 1.4 AT Đặc Biệt", "year": 2023,
                "body_type": "Sedan", "price": 495000000.0, "odo": 15000, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Cầu trước (FWD)", "color": "Trắng Tinh Khôi", "interior": "Da 2 màu Be và Xám thanh lịch",
                "badge": "Bán Chạy Nhất", "stock": "HYU-ACC-2023", "vin": "KMHC341BPPU019482",
                "desc": "Sedan hạng B siêu hot tại Việt Nam. Trang bị cửa sổ trời hiếm có trong phân khúc, gạt mưa tự động, đèn pha bi-halogen tự động bật tắt, đề nổ từ xa bằng chìa khóa thông minh.",
                "engine": "Kappa 1.4L MPI 4 xi-lanh", "power": "100 hp @ 6,000 rpm", "consumption": "5.6 L / 100km", "dims": "4,440 x 1,720 x 1,470 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            },
            {
                "brand": "hyundai", "cat": "creta", "name": "Hyundai Creta 1.5L Cao Cấp", "year": 2023,
                "body_type": "SUV", "price": 690000000.0, "odo": 14000, "fuel": "Xăng", "trans": "Tự động vô cấp thông minh iVT",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Mận Chín", "interior": "Da cao cấp màu Đen tuyền",
                "badge": "CUV Đô Thị Trẻ", "stock": "HYU-CRE-2023", "vin": "KMHE241CPPU029481",
                "desc": "'Tiểu Tucson' với thiết kế đèn LED cánh chim parametric jewel ẩn lưới tản nhiệt. Ghế làm mát hàng trước, phanh tay điện tử, 8 loa Bose, gói hỗ trợ lái an toàn Hyundai SmartSense.",
                "engine": "Smartstream 1.5L hút khí tự nhiên", "power": "115 hp @ 6,300 rpm", "consumption": "6.1 L / 100km", "dims": "4,315 x 1,790 x 1,660 mm",
                "main_img": IMG_SUV_RED, "type": "suv"
            },
            {
                "brand": "hyundai", "cat": "tucson", "name": "Hyundai Tucson 1.6 T-GDi Turbo HTRAC", "year": 2023,
                "body_type": "SUV", "price": 959000000.0, "odo": 18000, "fuel": "Xăng", "trans": "Ly hợp kép 7 cấp DCT",
                "drive": "Dẫn động 4 bánh toàn thời gian (HTRAC)", "color": "Bạc Ánh Kim", "interior": "Da Nappa màu Nâu hạt dẻ",
                "badge": "Thiết Kế Tương Lai", "stock": "HYU-TUC-2023", "vin": "KMHJ381EPPU038472",
                "desc": "Crossover C đột phá về thiết kế. Cần số điện tử dạng nút bấm hiện đại, camera 360 độ kèm màn hình hiển thị điểm mù trên cụm đồng hồ kỹ thuật số 10.25 inch, dẫn động HTRAC bám đường.",
                "engine": "Smartstream 1.6L T-GDi Turbo", "power": "180 hp @ 5,500 rpm", "consumption": "7.2 L / 100km", "dims": "4,630 x 1,865 x 1,695 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "hyundai", "cat": "santafe", "name": "Hyundai Santa Fe 2.2 Diesel Cao Cấp HTRAC", "year": 2022,
                "body_type": "SUV", "price": 1190000000.0, "odo": 26000, "fuel": "Dầu (Diesel)", "trans": "Ly hợp kép 8 cấp ướt 8-DCT",
                "drive": "Dẫn động 4 bánh (HTRAC)", "color": "Trắng Ngọc Trai", "interior": "Da Nappa màu Nâu Cognac 2 tông",
                "badge": "Vua SUV Máy Dầu", "stock": "HYU-SAN-2022", "vin": "KMHM381DPNU049382",
                "desc": "Biểu tượng SUV máy dầu 7 chỗ được săn đón bậc nhất Việt Nam. Cực kỳ tiết kiệm dầu chỉ 6.5L/100km, hiển thị kính lái HUD, sưởi và làm mát ghế, 10 loa Harman Kardon cao cấp.",
                "engine": "Smartstream D2.2L Diesel Turbo", "power": "202 hp @ 3,800 rpm", "consumption": "6.7 L / 100km", "dims": "4,785 x 1,900 x 1,730 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "hyundai", "cat": "elantra", "name": "Hyundai Elantra N-Line 1.6 Turbo", "year": 2023,
                "body_type": "Sedan", "price": 779000000.0, "odo": 11500, "fuel": "Xăng", "trans": "Ly hợp kép 7 cấp DCT",
                "drive": "Cầu trước (FWD)", "color": "Xanh Dương Ngọc", "interior": "Da thể thao N-Line dập logo N nổi",
                "badge": "Sedan Thể Thao", "stock": "HYU-ELA-2023", "vin": "KMHD341EPPU019483",
                "desc": "Sedan hạng C phong cách khí động học táo bạo Parametric Dynamics. Treo sau độc lập đa liên kết, ống xả kép thể thao gầm gừ uy lực, màn hình kép nối liền 10.25 inch sắc nét.",
                "engine": "Smartstream 1.6L T-GDi Turbo", "power": "204 hp @ 6,000 rpm", "consumption": "6.8 L / 100km", "dims": "4,675 x 1,825 x 1,430 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            },
            {
                "brand": "hyundai", "cat": "custin", "name": "Hyundai Custin 2.0T Cao Cấp", "year": 2023,
                "body_type": "MPV", "price": 974000000.0, "odo": 8500, "fuel": "Xăng", "trans": "Tự động 8 cấp",
                "drive": "Cầu trước (FWD)", "color": "Xám Than Chì", "interior": "Da Nappa cao cấp màu Đen xám",
                "badge": "MPV Cửa Lùa Thông Minh", "stock": "HYU-CUS-2023", "vin": "KMHH381FPPU029384",
                "desc": "MPV 7 chỗ cửa lùa điện chuẩn gia đình hiện đại. Hàng ghế thứ 2 thương gia chỉnh điện 10 hướng có đệm đỡ bắp chân và chế độ không trọng lực thư giãn tuyệt đối.",
                "engine": "2.0L Turbo GDi tăng áp", "power": "236 hp @ 6,000 rpm", "consumption": "8.4 L / 100km", "dims": "4,950 x 1,850 x 1,725 mm",
                "main_img": IMG_MPV_SILVER, "type": "mpv"
            },
            {
                "brand": "hyundai", "cat": "i10", "name": "Hyundai Grand i10 1.2 AT Hatchback", "year": 2022,
                "body_type": "Hatchback", "price": 395000000.0, "odo": 28000, "fuel": "Xăng", "trans": "Tự động 4 cấp",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Pha Lê", "interior": "Nỉ kết hợp da viền chỉ Đỏ",
                "badge": "Tiết Kiệm Xăng Số 1", "stock": "HYU-I10-2022", "vin": "MALAA51BLNM019482",
                "desc": "Chiếc xe hạng A quốc dân cực kỳ kinh tế. Chi phí bảo dưỡng siêu rẻ, phụ tùng sẵn có, có ga tự động Cruise Control và cảm biến áp suất lốp hiếm có ở xe cỡ nhỏ.",
                "engine": "Kappa 1.2L MPI 4 xi-lanh", "power": "83 hp @ 6,000 rpm", "consumption": "5.4 L / 100km", "dims": "3,850 x 1,680 x 1,520 mm",
                "main_img": IMG_HATCH_RED, "type": "hatch"
            },

            # ──────────────────── 4. KIA (8 XE) ────────────────────
            {
                "brand": "kia", "cat": "k3", "name": "Kia K3 1.6 Premium", "year": 2023,
                "body_type": "Sedan", "price": 629000000.0, "odo": 14500, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Cầu trước (FWD)", "color": "Trắng Ngọc Trai", "interior": "Da 2 màu Đen - Đỏ thể thao",
                "badge": "Sedan Trẻ Trung", "stock": "KIA-K3-2023", "vin": "KNAB341CPPU019482",
                "desc": "Sedan hạng C thiết kế thời thượng nhất phân khúc. Trang bị sưởi và làm mát ghế lái, nhớ 2 vị trí ghế, cửa sổ trời, sạc điện thoại không dây và cốp sau mở điện thông minh.",
                "engine": "Gamma 1.6L MPI 4 xi-lanh", "power": "126 hp @ 6,300 rpm", "consumption": "6.3 L / 100km", "dims": "4,640 x 1,800 x 1,450 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            },
            {
                "brand": "kia", "cat": "sonet", "name": "Kia Sonet 1.5 Premium", "year": 2023,
                "body_type": "SUV", "price": 584000000.0, "odo": 12000, "fuel": "Xăng", "trans": "Tự động vô cấp thông minh Smartstream IVT",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Tươi", "interior": "Da Đen chỉ khâu đỏ hình học",
                "badge": "Mini CUV Gầm Cao", "stock": "KIA-SON-2023", "vin": "KNAD241EPPU029381",
                "desc": "Mẫu SUV cỡ nhỏ tiên phong tại Việt Nam. Khoảng sáng gầm 205mm vượt trội, cửa sổ trời chỉnh điện, sạc không dây, màn hình giải trí 10.25 inch kết nối Apple CarPlay mượt mà.",
                "engine": "Smartstream 1.5L Dual CVVT", "power": "113 hp @ 6,300 rpm", "consumption": "5.7 L / 100km", "dims": "4,120 x 1,790 x 1,642 mm",
                "main_img": IMG_SUV_RED, "type": "suv"
            },
            {
                "brand": "kia", "cat": "seltos", "name": "Kia Seltos 1.4 Turbo GT-Line", "year": 2022,
                "body_type": "SUV", "price": 675000000.0, "odo": 24000, "fuel": "Xăng", "trans": "Ly hợp kép 7 cấp DCT",
                "drive": "Cầu trước (FWD)", "color": "Vàng Nóc Đen", "interior": "Da Đen khâu chỉ Đỏ GT-Line",
                "badge": "CUV Đô Thị Cá Tính", "stock": "KIA-SEL-2022", "vin": "KNAC341DPNU039482",
                "desc": "Mẫu CUV B tạo nên cơn sốt doanh số. Động cơ 1.4 Turbo bốc khỏe, làm mát hàng ghế trước, hệ thống đèn Mood Light đổi màu theo điệu nhạc và 3 chế độ lái kèm 3 chế độ kiểm soát lực kéo.",
                "engine": "Kappa 1.4L T-GDi Turbo", "power": "138 hp @ 6,000 rpm", "consumption": "6.3 L / 100km", "dims": "4,315 x 1,800 x 1,645 mm",
                "main_img": IMG_SUV_ORANGE, "type": "suv"
            },
            {
                "brand": "kia", "cat": "sportage", "name": "Kia Sportage 1.6T Signature AWD", "year": 2023,
                "body_type": "SUV", "price": 999000000.0, "odo": 13500, "fuel": "Xăng", "trans": "Ly hợp kép 7 cấp DCT",
                "drive": "Dẫn động 4 bánh toàn thời gian (AWD)", "color": "Xanh Rêu Jungle Green", "interior": "Da Nappa cao cấp màu Nâu da bò",
                "badge": "Công Nghệ Đỉnh Cao", "stock": "KIA-SPO-2023", "vin": "KNAE381FPPU049382",
                "desc": "CUV C thế hệ mới với cụm màn hình cong Panoramic 12.3 inch siêu rộng. Đèn ban ngày LED hình Boomerang độc bản, camera 360 độ 3D sắc nét, âm thanh 8 loa Harman Kardon đỉnh cao.",
                "engine": "Smartstream 1.6L T-GDi Turbo", "power": "178 hp @ 5,500 rpm", "consumption": "7.1 L / 100km", "dims": "4,660 x 1,865 x 1,660 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "kia", "cat": "sorento", "name": "Kia Sorento Signature 2.2D AWD", "year": 2022,
                "body_type": "SUV", "price": 1150000000.0, "odo": 29000, "fuel": "Dầu (Diesel)", "trans": "Ly hợp kép 8 cấp ướt 8-DCT",
                "drive": "Dẫn động 4 bánh toàn thời gian (AWD)", "color": "Trắng Ngọc Trai", "interior": "Da Nappa thêu họa tiết quả trám màu Xám",
                "badge": "SUV 7 Chỗ Đẳng Cấp", "stock": "KIA-SOR-2022", "vin": "KNAF381DPNU019483",
                "desc": "SUV 7 chỗ gia đình hội tụ đầy đủ tinh hoa thiết kế. Cần số núm xoay điện tử sang xịn, 4 chế độ lái kèm 3 chế độ địa hình Tuyết/Bùn/Cát, hiển thị điểm mù trên đồng hồ BVM.",
                "engine": "Smartstream D2.2L Diesel Turbo", "power": "198 hp @ 3,800 rpm", "consumption": "6.8 L / 100km", "dims": "4,810 x 1,900 x 1,700 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "kia", "cat": "carnival", "name": "Kia Carnival 2.2D Signature 7 Chỗ", "year": 2023,
                "body_type": "MPV", "price": 1439000000.0, "odo": 17000, "fuel": "Dầu (Diesel)", "trans": "Tự động 8 cấp",
                "drive": "Cầu trước (FWD)", "color": "Đen Obsidian", "interior": "Da cao cấp màu Nâu Saddle Brown",
                "badge": "MPV VIP Doanh Nhân", "stock": "KIA-CAR-2023", "vin": "KNAG381FPPU029384",
                "desc": "Chuyên cơ mặt đất 7 chỗ VIP. Cửa trượt điện thông minh chống kẹt, hàng ghế giữa thương gia đệm bắp chân chỉnh điện, 2 cửa sổ trời độc lập, 12 loa Bose mang rạp hát vào xe.",
                "engine": "Smartstream D2.2L Diesel Turbo", "power": "199 hp @ 3,800 rpm", "consumption": "7.0 L / 100km", "dims": "5,155 x 1,995 x 1,775 mm",
                "main_img": IMG_MPV_BLACK, "type": "mpv"
            },
            {
                "brand": "kia", "cat": "k5", "name": "Kia K5 2.5 GT-Line", "year": 2023,
                "body_type": "Sedan", "price": 999000000.0, "odo": 16000, "fuel": "Xăng", "trans": "Tự động 8 cấp",
                "drive": "Cầu trước (FWD)", "color": "Xanh Nước Biển", "interior": "Da Đỏ GT-Line khâu chỉ đen thể thao",
                "badge": "Sedan Fastback Thể Thao", "stock": "KIA-K5-2023", "vin": "KNAH341EPPU039482",
                "desc": "Sedan hạng D kiểu dáng Fastback thể thao đầy mê hoặc. Động cơ 2.5L 191 mã lực mạnh mẽ, sưởi vô lăng, làm mát ghế, sạc không dây và hiển thị kính lái HUD màu.",
                "engine": "Theta-III 2.5L GDi 4 xi-lanh", "power": "191 hp @ 6,100 rpm", "consumption": "7.0 L / 100km", "dims": "4,905 x 1,860 x 1,445 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            },
            {
                "brand": "kia", "cat": "morning", "name": "Kia Morning GT-Line 1.25 AT", "year": 2022,
                "body_type": "Hatchback", "price": 385000000.0, "odo": 26000, "fuel": "Xăng", "trans": "Tự động 4 cấp",
                "drive": "Cầu trước (FWD)", "color": "Vàng Cát", "interior": "Da 2 tông màu viền chỉ thể thao",
                "badge": "Nhỏ Gọn Tiết Kiệm", "stock": "KIA-MOR-2022", "vin": "KNAA241CPNU019482",
                "desc": "Chiếc xe cỡ nhỏ hoàn hảo cho người mới lái và chị em phụ nữ. Ngoại hình thể thao GT-Line, màn hình 8 inch nổi, khởi động nút bấm Start/Stop, camera lùi và cảm biến lùi tiện lợi.",
                "engine": "Kappa 1.25L 4 xi-lanh thẳng hàng", "power": "83 hp @ 6,000 rpm", "consumption": "5.3 L / 100km", "dims": "3,595 x 1,595 x 1,485 mm",
                "main_img": IMG_HATCH_YELLOW, "type": "hatch"
            },

            # ──────────────────── 5. FORD (6 XE) ────────────────────
            {
                "brand": "ford", "cat": "ranger", "name": "Ford Ranger Wildtrak 2.0L Bi-Turbo 4x4 AT", "year": 2023,
                "body_type": "Bán tải", "price": 929000000.0, "odo": 15000, "fuel": "Dầu (Diesel)", "trans": "Tự động 10 cấp điện tử E-Shifter",
                "drive": "2 cầu 4x4 có khóa vi sai cầu sau", "color": "Vàng Cam Luxe Yellow", "interior": "Da Đen chỉ may Vàng Cam Wildtrak",
                "badge": "Vua Bán Tải Việt Nam", "stock": "FOR-RAN-2023", "vin": "MNBMS3843P0194821",
                "desc": "Thống trị tuyệt đối phân khúc bán tải. Màn hình dọc 12 inch SYNC 4A không dây, camera 360, 6 chế độ lái địa hình, đèn pha Matrix LED tự động chống chói và bậc bước thùng sau cực kỳ tiện lợi.",
                "engine": "2.0L Bi-Turbo Diesel I4", "power": "210 hp @ 3,750 rpm", "consumption": "7.8 L / 100km", "dims": "5,362 x 1,918 x 1,875 mm",
                "main_img": IMG_PICKUP_ORANGE, "type": "pickup"
            },
            {
                "brand": "ford", "cat": "raptor", "name": "Ford Ranger Raptor 2.0 Bi-Turbo 4x4", "year": 2023,
                "body_type": "Bán tải", "price": 1299000000.0, "odo": 11000, "fuel": "Dầu (Diesel)", "trans": "Tự động 10 cấp",
                "drive": "2 cầu 4WD toàn thời gian có 4A", "color": "Xám Xi Măng Conquer Grey", "interior": "Ghế thể thao Raptor bọc da lộn Alcantara",
                "badge": "Siêu Bán Tải Địa Hình", "stock": "FOR-RAP-2023", "vin": "MNBMS3854P0293841",
                "desc": "Quái thú địa hình đỉnh cao. Phuộc nhún FOX 2.5 inch Live Valve van điện tử thích ứng theo địa hình, chế độ lái Baja chạy sa mạc tốc độ cao, khung gầm gia cường chịu va đập cực mạnh.",
                "engine": "2.0L Bi-Turbo Diesel I4", "power": "210 hp @ 3,750 rpm", "consumption": "8.5 L / 100km", "dims": "5,381 x 2,028 x 1,922 mm",
                "main_img": IMG_PICKUP_GREY, "type": "pickup"
            },
            {
                "brand": "ford", "cat": "everest", "name": "Ford Everest Titanium+ 2.0L Bi-Turbo 4x4 AT", "year": 2023,
                "body_type": "SUV", "price": 1415000000.0, "odo": 18000, "fuel": "Dầu (Diesel)", "trans": "Tự động 10 cấp",
                "drive": "2 cầu 4WD toàn thời gian", "color": "Đen Tuyền Tuyệt Đối", "interior": "Da Ebony cao cấp khâu chỉ trang trí",
                "badge": "SUV 7 Chỗ Cơ Bắp Mỹ", "stock": "FOR-EVE-2023", "vin": "MNBMS3944P0384729",
                "desc": "SUV 7 chỗ khung gầm rời đầm chắc chuẩn Mỹ. Hàng ghế thứ 3 gập điện 1 chạm, cửa sổ trời toàn cảnh, cảnh báo phương tiện cắt ngang khi lùi, lội nước sâu tới 800mm an toàn vượt ngập.",
                "engine": "2.0L Bi-Turbo Diesel I4", "power": "210 hp @ 3,750 rpm", "consumption": "8.0 L / 100km", "dims": "4,914 x 1,923 x 1,842 mm",
                "main_img": IMG_SUV_BLACK, "type": "suv"
            },
            {
                "brand": "ford", "cat": "territory", "name": "Ford Territory Titanium X 1.5 EcoBoost", "year": 2023,
                "body_type": "SUV", "price": 889000000.0, "odo": 14000, "fuel": "Xăng", "trans": "Tự động 7 cấp ly hợp kép ướt",
                "drive": "Cầu trước (FWD)", "color": "Trắng Kim Cương", "interior": "Da cao cấp phối 2 tông màu Xanh & Ghi xám",
                "badge": "CUV Thông Minh Ngập Tràn", "stock": "FOR-TER-2023", "vin": "MNBMS3413P0493821",
                "desc": "Chiếc CUV 5 chỗ rộng rãi và êm ái bậc nhất. Tự động lùi chuồng đỗ xe thông minh, màn hình kép 12.3 inch, phanh tay điện tử, làm mát ghế và mở cốp rảnh tay tiện nghi.",
                "engine": "1.5L EcoBoost Turbo tăng áp", "power": "160 hp @ 5,400 rpm", "consumption": "7.0 L / 100km", "dims": "4,630 x 1,935 x 1,706 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "ford", "cat": "explorer", "name": "Ford Explorer 2.3L EcoBoost 4WD", "year": 2022,
                "body_type": "SUV", "price": 1999000000.0, "odo": 29000, "fuel": "Xăng", "trans": "Tự động 10 cấp",
                "drive": "Dẫn động 4 bánh thông minh 4WD", "color": "Đỏ Mận Nung", "interior": "Da cao cấp màu Đen đục lỗ thông hơi",
                "badge": "SUV Cỡ Lớn Nhập Mỹ", "stock": "FOR-EXP-2022", "vin": "1FM5K8GC8NGA19483",
                "desc": "SUV cỡ lớn 7 chỗ nhập khẩu nguyên chiếc từ Mỹ. Động cơ EcoBoost 301 mã lực cực bốc, âm thanh 12 loa B&O danh tiếng, hệ thống kiểm soát địa hình TMS 7 chế độ chuyên sâu.",
                "engine": "2.3L EcoBoost I4 tăng áp", "power": "301 hp @ 5,500 rpm", "consumption": "9.5 L / 100km", "dims": "5,049 x 2,004 x 1,778 mm",
                "main_img": IMG_SUV_BLACK, "type": "suv"
            },
            {
                "brand": "ford", "cat": "ranger", "name": "Ford Ranger XLS 2.0L 4x2 AT", "year": 2022,
                "body_type": "Bán tải", "price": 685000000.0, "odo": 32000, "fuel": "Dầu (Diesel)", "trans": "Tự động 6 cấp",
                "drive": "Cầu sau (RWD)", "color": "Trắng Tuyết", "interior": "Nỉ cao cấp màu Đen bền bỉ",
                "badge": "Bán Tải Kinh Tế", "stock": "FOR-XLS-2022", "vin": "MNBMS3812N0193847",
                "desc": "Phiên bản bán tải thực dụng bán chạy nhất của Ranger. Tiết kiệm nhiên liệu chỉ 6.9L/100km dầu, màn hình 10 inch SYNC 4 kết nối Apple CarPlay không dây, chi phí vận hành siêu kinh tế.",
                "engine": "2.0L Turbo Diesel đơn I4", "power": "170 hp @ 3,500 rpm", "consumption": "6.9 L / 100km", "dims": "5,362 x 1,918 x 1,875 mm",
                "main_img": IMG_PICKUP_WHITE, "type": "pickup"
            },

            # ──────────────────── 6. MITSUBISHI (7 XE) ────────────────────
            {
                "brand": "mitsubishi", "cat": "xpander", "name": "Mitsubishi Xpander 1.5 AT Premium", "year": 2023,
                "body_type": "MPV", "price": 628000000.0, "odo": 16000, "fuel": "Xăng", "trans": "Tự động 4 cấp bền bỉ",
                "drive": "Cầu trước (FWD)", "color": "Trắng Ngọc Trai", "interior": "Da cao cấp 2 tông màu Nâu - Đen",
                "badge": "Vua MPV 7 Chỗ", "stock": "MIT-XPA-2023", "vin": "MK2NC1844P0194821",
                "desc": "Mẫu MPV 7 chỗ bán chạy nhất lịch sử thị trường ô tô Việt Nam. Khoảng sáng gầm 225mm vượt ngập nước vô địch, phanh tay điện tử Auto Hold, điều hòa mát sâu lạnh buốt huyền thoại.",
                "engine": "1.5L MIVEC 4 xi-lanh DOHC", "power": "104 hp @ 6,000 rpm", "consumption": "6.2 L / 100km", "dims": "4,595 x 1,750 x 1,750 mm",
                "main_img": IMG_MPV_WHITE, "type": "mpv"
            },
            {
                "brand": "mitsubishi", "cat": "xpander-cross", "name": "Mitsubishi Xpander Cross", "year": 2023,
                "body_type": "MPV", "price": 678000000.0, "odo": 13500, "fuel": "Xăng", "trans": "Tự động 4 cấp",
                "drive": "Cầu trước (FWD)", "color": "Cam Nóc Đen Thể Thao", "interior": "Da kháng nhiệt 2 tông màu Xanh Navy - Đen",
                "badge": "MPV Phong Cách SUV", "stock": "MIT-CRO-2023", "vin": "MK2NC2844P0293847",
                "desc": "Phiên bản gầm cao mang đậm phong cách SUV thể thao. Hệ thống kiểm soát vào cua chủ động AYC độc quyền của xe đua Lancer Evolution, vô lăng 4 chấu thể thao thừa hưởng từ Pajero Sport.",
                "engine": "1.5L MIVEC 4 xi-lanh", "power": "104 hp @ 6,000 rpm", "consumption": "6.4 L / 100km", "dims": "4,595 x 1,790 x 1,750 mm",
                "main_img": IMG_MPV_SILVER, "type": "mpv"
            },
            {
                "brand": "mitsubishi", "cat": "xforce", "name": "Mitsubishi Xforce Premium", "year": 2024,
                "body_type": "SUV", "price": 680000000.0, "odo": 5000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT",
                "drive": "Cầu trước (FWD)", "color": "Vàng Cát Nổi Bật", "interior": "Vải dệt cao cấp phối da mềm chống bám bẩn",
                "badge": "Tân Binh Đột Phá 2024", "stock": "MIT-XFO-2024", "vin": "MK2ND1845R0194832",
                "desc": "Chiếc CUV B thế hệ mới nhất với khoảng sáng gầm 222mm cao nhất phân khúc. 4 chế độ lái chuyên biệt: Đường trường, Đường ngập nước (Wet Mode), Đường sỏi đá và Đường bùn lầy.",
                "engine": "1.5L MIVEC 4 xi-lanh", "power": "105 hp @ 6,000 rpm", "consumption": "5.9 L / 100km", "dims": "4,390 x 1,810 x 1,660 mm",
                "main_img": IMG_SUV_ORANGE, "type": "suv"
            },
            {
                "brand": "mitsubishi", "cat": "attrage", "name": "Mitsubishi Attrage 1.2 CVT Premium", "year": 2022,
                "body_type": "Sedan", "price": 445000000.0, "odo": 21000, "fuel": "Xăng", "trans": "Tự động vô cấp INVECS-III CVT",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Cherry", "interior": "Da Đen chỉ may viền Đỏ",
                "badge": "Tiết Kiệm Xăng Vô Địch", "stock": "MIT-ATT-2022", "vin": "MMBHA1822N0193847",
                "desc": "Sedan hạng B nhập Thái Lan ăn xăng ít nhất thị trường chỉ 5.0L/100km. Bán kính quay đầu nhỏ nhất chỉ 4.8m, đèn pha bi-LED tự động, ga tự động Cruise Control và phanh khẩn cấp BA.",
                "engine": "1.2L MIVEC 3 xi-lanh DOHC", "power": "78 hp @ 6,000 rpm", "consumption": "5.0 L / 100km", "dims": "4,305 x 1,670 x 1,515 mm",
                "main_img": IMG_SEDAN_RED, "type": "sedan"
            },
            {
                "brand": "mitsubishi", "cat": "outlander", "name": "Mitsubishi Outlander 2.0 CVT Premium", "year": 2022,
                "body_type": "SUV", "price": 875000000.0, "odo": 25000, "fuel": "Xăng", "trans": "Tự động vô cấp CVT có lẫy chuyển số",
                "drive": "Cầu trước (FWD)", "color": "Nâu Titan", "interior": "Da Nappa cao cấp thêu họa tiết mắt cáo",
                "badge": "CUV 5+2 Cách Âm Tốt", "stock": "MIT-OUT-2022", "vin": "RL7HA2822N0293841",
                "desc": "CUV 5+2 chỗ ngồi cách âm hàng đầu phân khúc nhờ vật liệu tiêu âm đa lớp. Khung gầm RISE cứng cáp thép gia cường, 7 túi khí, rửa đèn pha tự động và cốp sau đóng mở điện.",
                "engine": "2.0L MIVEC DOHC 16 van", "power": "145 hp @ 6,000 rpm", "consumption": "7.2 L / 100km", "dims": "4,695 x 1,810 x 1,710 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "mitsubishi", "cat": "pajero", "name": "Mitsubishi Pajero Sport 4x4 AT Diesel", "year": 2021,
                "body_type": "SUV", "price": 1150000000.0, "odo": 36000, "fuel": "Dầu (Diesel)", "trans": "Tự động 8 cấp",
                "drive": "2 cầu Super Select II 4WD có 4 chế độ địa hình", "color": "Trắng Ngọc Trai", "interior": "Da Đen cao cấp",
                "badge": "SUV Địa Hình Chuyên Nghiệp", "stock": "MIT-PAJ-2021", "vin": "MMBHA3842M0394821",
                "desc": "SUV 7 chỗ địa hình sở hữu hệ dẫn động Super Select 4WD-II trứ danh với 4 chế độ gài cầu linh hoạt có khóa vi sai trung tâm và cầu sau. Ứng dụng điều khiển xe từ xa qua điện thoại thông minh.",
                "engine": "2.4L MIVEC Diesel Turbo", "power": "181 hp @ 3,500 rpm", "consumption": "7.7 L / 100km", "dims": "4,825 x 1,815 x 1,835 mm",
                "main_img": IMG_SUV_BLACK, "type": "suv"
            },
            {
                "brand": "mitsubishi", "cat": "triton", "name": "Mitsubishi Triton 4x4 AT Athlete", "year": 2023,
                "body_type": "Bán tải", "price": 865000000.0, "odo": 17000, "fuel": "Dầu (Diesel)", "trans": "Tự động 6 cấp có lẫy chuyển số thể thao",
                "drive": "2 cầu Super Select 4WD-II", "color": "Cam Đen Sunflare Orange", "interior": "Da 2 tông màu Cam - Đen Athlete",
                "badge": "Bán Tải Bền Bỉ Thể Thao", "stock": "MIT-TRI-2023", "vin": "MMBHA3944P0193847",
                "desc": "Bán tải thể thao với thiết kế J-Line độc quyền giúp bán kính quay vòng chỉ 5.9m nhỏ nhất phân khúc xe bán tải. Ghế ngồi phía sau ngả 25 độ thoải mái nhất không bị đứng lưng khi đi xa.",
                "engine": "2.4L MIVEC Diesel Clean-Diesel", "power": "181 hp @ 3,500 rpm", "consumption": "7.5 L / 100km", "dims": "5,305 x 1,815 x 1,795 mm",
                "main_img": IMG_PICKUP_ORANGE, "type": "pickup"
            },

            # ──────────────────── 7. MAZDA (6 XE) ────────────────────
            {
                "brand": "mazda", "cat": "mazda3", "name": "Mazda 3 1.5 Premium", "year": 2023,
                "body_type": "Sedan", "price": 699000000.0, "odo": 14000, "fuel": "Xăng", "trans": "Tự động 6 cấp SkyActiv-Drive",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Pha Lê Soul Red Crystal", "interior": "Da Nappa màu Trắng kem sang trọng",
                "badge": "Sedan Thiết Kế Đẹp Nhất", "stock": "MAZ-M3-2023", "vin": "JM7BP3414P0194821",
                "desc": "Đạt giải thưởng Thiết kế xe đẹp nhất thế giới (World Car Design of the Year). Nội thất tiệm cận xe sang Đức, hệ thống kiểm soát gia tốc G-Vectoring Control Plus và gói i-Activsense.",
                "engine": "SkyActiv-G 1.5L 4 xi-lanh", "power": "110 hp @ 6,000 rpm", "consumption": "5.9 L / 100km", "dims": "4,660 x 1,795 x 1,440 mm",
                "main_img": IMG_SEDAN_RED, "type": "sedan"
            },
            {
                "brand": "mazda", "cat": "cx5", "name": "Mazda CX-5 2.0 Premium Exclusive", "year": 2023,
                "body_type": "SUV", "price": 829000000.0, "odo": 12500, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Cầu trước (FWD)", "color": "Đỏ Pha Lê Soul Red Crystal", "interior": "Da Nappa cao cấp màu Nâu sẫm",
                "badge": "Vua Doanh Số CUV C", "stock": "MAZ-CX5-2023", "vin": "JM7KF3814P0293847",
                "desc": "Mẫu CUV 5 chỗ được yêu thích nhất tại Việt Nam. Âm thanh 10 loa Bose vòm trung thực, hiển thị kính lái HUD sắc nét, sưởi và làm mát ghế hàng trước, cốp điện đá chân nhạy bén.",
                "engine": "SkyActiv-G 2.0L phun xăng trực tiếp", "power": "154 hp @ 6,000 rpm", "consumption": "6.8 L / 100km", "dims": "4,590 x 1,845 x 1,680 mm",
                "main_img": IMG_SUV_RED, "type": "suv"
            },
            {
                "brand": "mazda", "cat": "cx8", "name": "Mazda CX-8 2.5 Premium AWD", "year": 2022,
                "body_type": "SUV", "price": 1050000000.0, "odo": 27000, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Dẫn động 4 bánh toàn thời gian i-Activ AWD", "color": "Trắng Tuyết Snowflake White", "interior": "Da Nappa màu Nâu đỏ Deep Red",
                "badge": "SUV 7 Chỗ Rộng Rãi", "stock": "MAZ-CX8-2022", "vin": "JM7KG3812N0394821",
                "desc": "SUV 7 chỗ thực thụ với chiều dài cơ sở 2.930mm lớn nhất phân khúc. Hàng ghế thứ 3 người lớn ngồi thoải mái, sưởi ấm hàng ghế 2, camera 360 độ và rèm che nắng tích hợp cửa xe.",
                "engine": "SkyActiv-G 2.5L 4 xi-lanh", "power": "188 hp @ 6,000 rpm", "consumption": "8.2 L / 100km", "dims": "4,900 x 1,840 x 1,730 mm",
                "main_img": IMG_SUV_WHITE, "type": "suv"
            },
            {
                "brand": "mazda", "cat": "mazda2", "name": "Mazda 2 1.5 AT Luxury", "year": 2022,
                "body_type": "Sedan", "price": 489000000.0, "odo": 23000, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Cầu trước (FWD)", "color": "Xanh Pha Lê Deep Crystal Blue", "interior": "Da kết hợp nỉ cao cấp màu Đen xám",
                "badge": "Sedan Đô Thị Nhập Thái", "stock": "MAZ-M2-2022", "vin": "MM6DJ3412N0193847",
                "desc": "Sedan hạng B nhập khẩu nguyên chiếc từ Thái Lan. Đèn LED thích ứng thông minh ALH, lẫy chuyển số thể thao, cảm giác lái lanh lẹ và nội thất gia công tỉ mỉ vượt tầm tiền.",
                "engine": "SkyActiv-G 1.5L", "power": "110 hp @ 6,000 rpm", "consumption": "5.2 L / 100km", "dims": "4,340 x 1,695 x 1,470 mm",
                "main_img": IMG_SEDAN_SILVER, "type": "sedan"
            },
            {
                "brand": "mazda", "cat": "cx3", "name": "Mazda CX-3 1.5 Premium", "year": 2023,
                "body_type": "SUV", "price": 614000000.0, "odo": 15000, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Cầu trước (FWD)", "color": "Xám Xi Măng Polymetal Grey", "interior": "Da Nappa Đen phối viền Đỏ",
                "badge": "CUV Đô Thị Cá Tính", "stock": "MAZ-CX3-2023", "vin": "MM6DK3413P0293847",
                "desc": "CUV cỡ nhỏ nhập khẩu Thái Lan. Thiết kế KODO thể thao, phanh tay điện tử Auto Hold, màn hình HUD kính lái, gói an toàn i-Activsense với cảnh báo điểm mù và giữ làn đường.",
                "engine": "SkyActiv-G 1.5L", "power": "110 hp @ 6,000 rpm", "consumption": "6.0 L / 100km", "dims": "4,275 x 1,765 x 1,535 mm",
                "main_img": IMG_SUV_ORANGE, "type": "suv"
            },
            {
                "brand": "mazda", "cat": "mazda6", "name": "Mazda 6 2.0 Premium", "year": 2022,
                "body_type": "Sedan", "price": 790000000.0, "odo": 28000, "fuel": "Xăng", "trans": "Tự động 6 cấp",
                "drive": "Cầu trước (FWD)", "color": "Trắng Tuyết Snowflake White", "interior": "Da Nappa cao cấp màu Đen",
                "badge": "Sedan D Đẳng Cấp", "stock": "MAZ-M6-2022", "vin": "JM7GJ3412N0394821",
                "desc": "Sedan hạng D thanh lịch và đầm chắc. 11 loa Bose âm thanh vòm sống động, làm mát ghế lái và phụ, cửa sổ trời chỉnh điện, rèm che nắng kính sau chỉnh điện tiện nghi.",
                "engine": "SkyActiv-G 2.0L 4 xi-lanh", "power": "154 hp @ 6,000 rpm", "consumption": "6.5 L / 100km", "dims": "4,865 x 1,840 x 1,450 mm",
                "main_img": IMG_SEDAN_WHITE, "type": "sedan"
            }
        ]

        # 5. TIẾN HÀNH THÊM TỪNG XE VÀO CƠ SỞ DỮ LIỆU
        for cdata in cars_database:
            brand_obj = brand_map[cdata["brand"]]
            parent_cat = cat_models[cdata["cat"]]
            
            # CẤP 4: Phiên bản cụ thể của xe (ví dụ: Toyota Vios 1.5G CVT 2023)
            trim_slug = f"{cdata['cat']}-{cdata['year']}-trim"
            existing_trim = db.query(Category).filter(Category.slug == trim_slug).first()
            if not existing_trim:
                trim_cat = Category(
                    name=f"{cdata['name']} ({cdata['year']})",
                    slug=trim_slug,
                    level=4,
                    sort_order=1,
                    parent_id=parent_cat.id
                )
                db.add(trim_cat)
                db.commit()
                db.refresh(trim_cat)
            else:
                trim_cat = existing_trim

            # Ước tính trả góp hàng tháng (80% giá trị trong 5 năm ~ 60 tháng)
            monthly_est = round((cdata["price"] * 0.8 / 60) * 1.085)

            new_car = Car(
                brand_id=brand_obj.id,
                category_id=trim_cat.id,
                name=f"{cdata['name']} ({cdata['year']})",
                slug=f"{cdata['stock'].lower()}-{cdata['year']}",
                stock_code=cdata["stock"],
                vin=cdata["vin"],
                price=cdata["price"],
                monthly_installment=monthly_est,
                year=cdata["year"],
                body_type=cdata["body_type"],
                fuel_type=cdata["fuel"],
                transmission=cdata["trans"],
                drivetrain=cdata["drive"],
                odo_km=cdata["odo"],
                condition=CarCondition.used,
                status=CarStatus.available,
                exterior_color=cdata["color"],
                interior=cdata["interior"],
                description=cdata["desc"],
                badge=cdata["badge"],
                owners_count=1,
                is_ready=True,
                has_factory_warranty=True,
                warranty_months=18 if cdata["year"] >= 2023 else 12,
                is_inspected=True,
                is_featured=True if cdata["odo"] < 15000 else False,
                specs=[
                    {"group": "Động Cơ & Vận Hành", "label": "Loại Động Cơ", "value": cdata["engine"]},
                    {"group": "Động Cơ & Vận Hành", "label": "Công Suất Tối Đa", "value": cdata["power"]},
                    {"group": "Động Cơ & Vận Hành", "label": "Mức Tiêu Thụ Nhiên Liệu", "value": cdata["consumption"]},
                    {"group": "Động Cơ & Vận Hành", "label": "Hộp Số", "value": cdata["trans"]},
                    {"group": "Kích Thước & Khung Gầm", "label": "Kích Thước (D x R x C)", "value": cdata["dims"]},
                    {"group": "Kích Thước & Khung Gầm", "label": "Hệ Dẫn Động", "value": cdata["drive"]},
                ]
            )
            db.add(new_car)
            db.commit()
            db.refresh(new_car)

            # 5.1 THÊM BỘ ẢNH CHI TIẾT
            main_url = cdata["main_img"]
            car_images = [
                CarImage(car_id=new_car.id, image_url=main_url, category=ImageCategory.exterior, sort_order=1, is_primary=True),
                CarImage(car_id=new_car.id, image_url=IMG_INTERIOR, category=ImageCategory.interior, sort_order=2, is_primary=False),
                CarImage(car_id=new_car.id, image_url=IMG_DASHBOARD, category=ImageCategory.dashboard, sort_order=3, is_primary=False),
                CarImage(car_id=new_car.id, image_url=IMG_WHEELS, category=ImageCategory.wheels, sort_order=4, is_primary=False),
            ]
            db.add_all(car_images)

            # 5.2 THÊM BIẾN THỂ MÀU SẮC (4 - 5 MÀU PHỔ BIẾN TẠI VIỆT NAM)
            # Tại VN, Trắng ngọc trai thường được các hãng (Toyota, Hyundai, Kia...) thu phụ phí 8 triệu đồng
            color_variants = [
                {
                    "car_id": new_car.id,
                    "name": "Trắng Ngọc Trai (Pearl White)",
                    "hex_code": "#F4F5F6",
                    "color_type": "metallic",
                    "price_delta": 8000000.0,
                    "images": [IMG_SEDAN_WHITE if cdata["type"] == "sedan" else (IMG_PICKUP_WHITE if cdata["type"] == "pickup" else (IMG_MPV_WHITE if cdata["type"] == "mpv" else IMG_SUV_WHITE))],
                    "sort_order": 1,
                    "is_default": "Trắng" in cdata["color"]
                },
                {
                    "car_id": new_car.id,
                    "name": "Đen Kim Loại (Black Mica)",
                    "hex_code": "#1A1A1D",
                    "color_type": "standard",
                    "price_delta": 0.0,
                    "images": [IMG_SEDAN_BLACK if cdata["type"] == "sedan" else (IMG_SUV_BLACK if cdata["type"] == "suv" else IMG_MPV_BLACK)],
                    "sort_order": 2,
                    "is_default": "Đen" in cdata["color"]
                },
                {
                    "car_id": new_car.id,
                    "name": "Đỏ Pha Lê (Crystal Red)",
                    "hex_code": "#C92A2A",
                    "color_type": "metallic",
                    "price_delta": 8000000.0 if "mazda" in cdata["brand"] else 0.0,
                    "images": [IMG_SEDAN_RED if cdata["type"] == "sedan" else (IMG_SUV_RED if cdata["type"] == "suv" else IMG_HATCH_RED)],
                    "sort_order": 3,
                    "is_default": "Đỏ" in cdata["color"]
                },
                {
                    "car_id": new_car.id,
                    "name": "Bạc Ánh Kim (Silver Metallic)",
                    "hex_code": "#D2D3D5",
                    "color_type": "standard",
                    "price_delta": 0.0,
                    "images": [IMG_SEDAN_SILVER if cdata["type"] == "sedan" else IMG_MPV_SILVER],
                    "sort_order": 4,
                    "is_default": "Bạc" in cdata["color"]
                },
                {
                    "car_id": new_car.id,
                    "name": "Xám Titan / Cam Thể Thao (Titanium Grey)",
                    "hex_code": "#59595B",
                    "color_type": "metallic",
                    "price_delta": 0.0,
                    "images": [IMG_PICKUP_GREY if cdata["type"] == "pickup" else IMG_SUV_ORANGE],
                    "sort_order": 5,
                    "is_default": not any(k in cdata["color"] for k in ["Trắng", "Đen", "Đỏ", "Bạc"])
                }
            ]
            
            for cv in color_variants:
                db.add(CarColor(**cv))

            # 5.3 THÊM BẢNG GÓI PHỤ KIỆN VÀ OPTION PHỔ THÔNG THỰC TẾ
            common_options = [
                {
                    "car_id": new_car.id,
                    "group": "Dán Phim & Bảo Vệ Sơn",
                    "name": "Phim Cách Nhiệt 3M Crystalline Chính Hãng Toàn Xe",
                    "code": "ACC-3M-CRY",
                    "description": "Cách nhiệt 99% tia hồng ngoại, cản 99.9% tia UV độc hại, bảo hành điện tử 10 năm.",
                    "price": 12500000.0,
                    "is_standard": False,
                    "is_selected": True,
                    "sort_order": 1
                },
                {
                    "car_id": new_car.id,
                    "group": "Dán Phim & Bảo Vệ Sơn",
                    "name": "Phủ Ceramic 9H Bảo Vệ Sơn & Bóng Sâu 3 Lớp",
                    "code": "ACC-CER-9H",
                    "description": "Tạo hiệu ứng lá sen trôi nước chống ố sơn, hạn chế xước dăm và giữ nước sơn bóng loáng.",
                    "price": 7500000.0,
                    "is_standard": False,
                    "is_selected": False,
                    "sort_order": 2
                },
                {
                    "car_id": new_car.id,
                    "group": "Camera & An Toàn Lái",
                    "name": "Camera Hành Trình Vietmap SpeedMap M1 Cảnh Báo Tốc Độ 4K",
                    "code": "ACC-CAM-M1",
                    "description": "Ghi hình trước & sau chuẩn 4K, cảnh báo biển báo giao thông và camera phạt nguội bằng giọng nói.",
                    "price": 5490000.0,
                    "is_standard": False,
                    "is_selected": True,
                    "sort_order": 3
                },
                {
                    "car_id": new_car.id,
                    "group": "Camera & An Toàn Lái",
                    "name": "Hệ Thống Cảnh Báo Điểm Mù Trên Gương BSM",
                    "code": "ACC-BSM-01",
                    "description": "Radar kép quét đuôi xe, cảnh báo đèn chớp trên gương chiếu hậu và âm thanh cảnh báo vượt an toàn.",
                    "price": 6800000.0,
                    "is_standard": False,
                    "is_selected": False,
                    "sort_order": 4
                },
                {
                    "car_id": new_car.id,
                    "group": "Tiện Nghi & Nội Thất",
                    "name": "Thảm Lót Sàn Cao Su Đúc KATA 5D Chuẩn Phom",
                    "code": "ACC-MAT-KATA",
                    "description": "Chất liệu cao su thiên nhiên không mùi, chống nước tuyệt đối, dễ xịt rửa vệ sinh trong ngày.",
                    "price": 2190000.0,
                    "is_standard": False,
                    "is_selected": True,
                    "sort_order": 5
                },
                {
                    "car_id": new_car.id,
                    "group": "Tiện Nghi & Nội Thất",
                    "name": "Cốp Điện Thông Minh Tích Hợp Cảm Biến Đá Chân Rảnh Tay",
                    "code": "ACC-POW-TRUNK",
                    "description": "Đóng mở cốp êm ái bằng nút bấm trong xe, chìa khóa hoặc đá chân khi xách đồ nặng.",
                    "price": 9200000.0,
                    "is_standard": False,
                    "is_selected": False,
                    "sort_order": 6
                },
                {
                    "car_id": new_car.id,
                    "group": "Màn Hình & Công Nghệ",
                    "name": "Màn Hình Android OledPro Liền Camera 360 Toàn Cảnh",
                    "code": "ACC-AND-360",
                    "description": "Màn hình IPS 10 inch siêu nét, điều khiển giọng nói Kiki, bản đồ dẫn đường Vietmap Live và Navitel.",
                    "price": 13900000.0,
                    "is_standard": False,
                    "is_selected": False,
                    "sort_order": 7
                },
                {
                    "car_id": new_car.id,
                    "group": "Khung Gầm & Vận Hành",
                    "name": "Cảm Biến Áp Suất Lốp Gắn Trong Steelmate",
                    "code": "ACC-TPMS-STM",
                    "description": "Hiển thị áp suất và nhiệt độ từng bánh xe theo thời gian thực, cảnh báo rò rỉ khí tức thì.",
                    "price": 2600000.0,
                    "is_standard": False,
                    "is_selected": True,
                    "sort_order": 8
                },
                {
                    "car_id": new_car.id,
                    "group": "Khung Gầm & Vận Hành",
                    "name": "Gói Phun Phủ Gầm Chống Gỉ & Cách Âm Gầm Wurth Đức",
                    "code": "ACC-UND-COAT",
                    "description": "Phun 5 chai phủ gầm gốc cao su non Wurth của Đức, chống đá văng rỉ sét và giảm tiếng ồn dội từ mặt đường.",
                    "price": 4200000.0,
                    "is_standard": False,
                    "is_selected": False,
                    "sort_order": 9
                }
            ]

            # Thêm option thùng cuộn điện riêng cho xe bán tải
            if cdata["type"] == "pickup":
                common_options.append({
                    "car_id": new_car.id,
                    "group": "Thùng Xe & Dã Ngoại",
                    "name": "Nắp Thùng Cuộn Điện Chống Nước Kèm Thanh Thể Thao",
                    "code": "ACC-PIC-ROLL",
                    "description": "Đóng mở thùng xe bằng remote điện tử, chống nước 100%, bảo vệ an toàn hành lý và hàng hóa khi đi mưa.",
                    "price": 21500000.0,
                    "is_standard": False,
                    "is_selected": False,
                    "sort_order": 10
                })

            for opt in common_options:
                db.add(CarOption(**opt))

            db.commit()

        print(f"-> Đã tạo thành công {len(cars_database)} xe phổ thông kèm đầy đủ ảnh, màu sắc, gói option và cây danh mục!")
        print("=========================================================")
        print("HOÀN TẤT SEED XE PHỔ THÔNG THÀNH CÔNG!")
        print("=========================================================")

    except Exception as e:
        db.rollback()
        print(f"LỖI SEED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
