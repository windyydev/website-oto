"""
Generator & Seeder cho 420+ mẫu xe phổ thông tại Việt Nam:
- Đa dạng nhiên liệu: Xe Xăng, Xe Dầu (Diesel), Xe Điện (EV), Xe Lai Điện (Hybrid: HEV/PHEV/MHEV)
- Hãng phổ thông: Toyota, Honda, Hyundai, Kia, Ford, Mitsubishi, Mazda, VinFast, BYD, Suzuki, Wuling, MG, Nissan
- Nhiều đời xe: 2017 đến 2025 (mới 100%, lướt, đã qua sử dụng)
- Đầy đủ thông số chi tiết (specs), màu sắc theo giá (colors), options phụ kiện (options), ảnh đẹp (images), và Category Tree 4 tầng
"""
import sys
import random
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.core.database import SessionLocal, Base, engine
import app.models
from app.models.brand import Brand
from app.models.category import Category
from app.models.car import Car, CarColor, CarOption, CarImage, CarCondition, CarStatus, ImageCategory
from app.models.consultant import Consultant

# CDN Image pools chuẩn nét theo body_type & màu
IMAGES_POOL = {
    "sedan_white": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    "sedan_red": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
    "sedan_black": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80",
    "sedan_silver": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    "suv_white": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    "suv_black": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    "suv_red": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
    "suv_blue": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    "pickup_grey": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    "pickup_orange": "https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=80",
    "pickup_white": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
    "mpv_silver": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
    "mpv_white": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    "mpv_black": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    "hatch_red": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
    "hatch_yellow": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    "hatch_white": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    "ev_cyan": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    "interior": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
    "dashboard": "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80",
    "wheels": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
}

def get_car_image(body_type: str, fuel: str, color_name: str) -> str:
    color_lower = color_name.lower()
    b = body_type.lower()
    if "bán tải" in b or "pickup" in b:
        if "cam" in color_lower: return IMAGES_POOL["pickup_orange"]
        if "trắng" in color_lower: return IMAGES_POOL["pickup_white"]
        return IMAGES_POOL["pickup_grey"]
    elif "mpv" in b:
        if "đen" in color_lower: return IMAGES_POOL["mpv_black"]
        if "trắng" in color_lower: return IMAGES_POOL["mpv_white"]
        return IMAGES_POOL["mpv_silver"]
    elif "hatchback" in b:
        if "đỏ" in color_lower: return IMAGES_POOL["hatch_red"]
        if "vàng" in color_lower: return IMAGES_POOL["hatch_yellow"]
        return IMAGES_POOL["hatch_white"]
    elif "suv" in b or "crossover" in b:
        if "điện" in fuel.lower(): return IMAGES_POOL["ev_cyan"]
        if "đen" in color_lower: return IMAGES_POOL["suv_black"]
        if "đỏ" in color_lower: return IMAGES_POOL["suv_red"]
        if "xanh" in color_lower: return IMAGES_POOL["suv_blue"]
        return IMAGES_POOL["suv_white"]
    else: # Sedan
        if "đen" in color_lower: return IMAGES_POOL["sedan_black"]
        if "đỏ" in color_lower: return IMAGES_POOL["sedan_red"]
        if "bạc" in color_lower: return IMAGES_POOL["sedan_silver"]
        return IMAGES_POOL["sedan_white"]

# Master Data các thương hiệu phổ thông
BRANDS_MASTER = [
    {"name": "Toyota", "slug": "toyota", "description": "Thương hiệu Nhật Bản bền bỉ số 1, dẫn đầu thị phần Hybrid xăng lai điện."},
    {"name": "Honda", "slug": "honda", "description": "Thiết kế thể thao, động cơ VTEC bốc khỏe và công nghệ Hybrid e:HEV thông minh."},
    {"name": "Hyundai", "slug": "hyundai", "description": "Thương hiệu Hàn Quốc hiện đại, dồi dào tiện nghi, đa dạng động cơ xăng, dầu & hybrid."},
    {"name": "Kia", "slug": "kia", "description": "Kiểu dáng thời trang, công nghệ dẫn đầu tầm giá, nhiều phiên bản hybrid và xăng lướt."},
    {"name": "Ford", "slug": "ford", "description": "Khung gầm Mỹ đầm chắc uy lực, động cơ Bi-Turbo dẫn đầu phân khúc bán tải và SUV 7 chỗ."},
    {"name": "Mitsubishi", "slug": "mitsubishi", "description": "Vua doanh số MPV gia đình Xpander, điều hòa mát sâu, bền bỉ và tiết kiệm."},
    {"name": "Mazda", "slug": "mazda", "description": "Ngôn ngữ thiết kế KODO mỹ cảm, nội thất sang trọng tinh tế và công nghệ SkyActiv."},
    {"name": "VinFast", "slug": "vinfast", "description": "Thương hiệu ô tô điện quốc dân Việt Nam, mạng lưới trạm sạc phủ kín 63 tỉnh thành."},
    {"name": "BYD", "slug": "byd", "description": "Tập đoàn xe năng lượng mới hàng đầu thế giới với công nghệ Pin Blade an toàn vượt trội."},
    {"name": "Suzuki", "slug": "suzuki", "description": "Xe thực dụng Nhật Bản, công nghệ Hybrid SHVS tiết kiệm xăng kỷ lục và giá dễ tiếp cận."},
    {"name": "Wuling", "slug": "wuling", "description": "Xe điện mini đô thị nhỏ gọn, di chuyển linh hoạt, chi phí sạc siêu rẻ."},
    {"name": "MG", "slug": "mg", "description": "Thương hiệu gốc Anh Quốc phong cách trẻ trung, giá bán hấp dẫn trong phân khúc B-C."},
    {"name": "Nissan", "slug": "nissan", "description": "Động cơ bền bỉ, công nghệ lái êm ái, nổi tiếng với dòng bán tải Navara và Kicks e-Power."}
]

# Các mẫu xe hạt nhân theo phân khúc & hệ truyền động để nhân bản theo các năm (2018 - 2025)
CAR_MODELS_DEFINITIONS = [
    # --- TOYOTA ---
    {"brand": "toyota", "model": "Vios", "body": "Sedan", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024], "base_price": 540000000, "engine": "1.5L Dual VVT-i 4 xi-lanh", "power": "106 hp", "consumption": "5.8 L/100km", "dims": "4,425 x 1,730 x 1,475 mm"},
    {"brand": "toyota", "model": "Camry", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 8 cấp", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 1250000000, "engine": "2.5L Dynamic Force", "power": "207 hp", "consumption": "7.1 L/100km", "dims": "4,885 x 1,840 x 1,445 mm"},
    {"brand": "toyota", "model": "Camry HEV", "body": "Sedan", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024, 2025], "base_price": 1460000000, "engine": "2.5L Xăng + Mô-tơ điện Hybrid", "power": "211 hp", "consumption": "4.4 L/100km", "dims": "4,885 x 1,840 x 1,445 mm"},
    {"brand": "toyota", "model": "Corolla Cross 1.8V", "body": "SUV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 860000000, "engine": "1.8L 2ZR-FE 4 xi-lanh", "power": "138 hp", "consumption": "6.9 L/100km", "dims": "4,460 x 1,825 x 1,620 mm"},
    {"brand": "toyota", "model": "Corolla Cross 1.8HEV", "body": "SUV", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024, 2025], "base_price": 955000000, "engine": "1.8L Hybrid Xăng lai Điện", "power": "170 hp", "consumption": "4.2 L/100km", "dims": "4,460 x 1,825 x 1,620 mm"},
    {"brand": "toyota", "model": "Yaris Cross HEV", "body": "SUV", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024, 2025], "base_price": 728000000, "engine": "1.5L HEV Atkinson + Mô-tơ điện", "power": "110 hp", "consumption": "3.56 L/100km", "dims": "4,310 x 1,770 x 1,655 mm"},
    {"brand": "toyota", "model": "Veloz Cross", "body": "MPV", "fuel": "Xăng", "trans": "D-CVT", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 660000000, "engine": "1.5L 2NR-VE 4 xi-lanh", "power": "105 hp", "consumption": "6.3 L/100km", "dims": "4,475 x 1,750 x 1,700 mm"},
    {"brand": "toyota", "model": "Innova Cross HEV", "body": "MPV", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024, 2025], "base_price": 990000000, "engine": "2.0L Hybrid 5th Gen Toyota", "power": "183 hp", "consumption": "4.3 L/100km", "dims": "4,755 x 1,850 x 1,790 mm"},
    {"brand": "toyota", "model": "Fortuner 2.4AT", "body": "SUV", "fuel": "Dầu", "trans": "Tự động 6 cấp", "drive": "Cầu sau (RWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023], "base_price": 1050000000, "engine": "2.4L Diesel 2GD-FTV Turbo", "power": "147 hp", "consumption": "7.5 L/100km", "dims": "4,795 x 1,855 x 1,835 mm"},
    {"brand": "toyota", "model": "Fortuner Legender 2.8 4x4", "body": "SUV", "fuel": "Dầu", "trans": "Tự động 6 cấp", "drive": "2 Cầu (4WD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 1390000000, "engine": "2.8L Diesel 1GD-FTV Turbo 500Nm", "power": "201 hp", "consumption": "8.1 L/100km", "dims": "4,795 x 1,855 x 1,835 mm"},
    {"brand": "toyota", "model": "Hilux Adventure 4x4", "body": "Bán tải", "fuel": "Dầu", "trans": "Tự động 6 cấp", "drive": "2 Cầu (4WD)",
     "years": [2019, 2020, 2021, 2023, 2024], "base_price": 890000000, "engine": "2.8L Diesel Turbo Intercooler", "power": "201 hp", "consumption": "8.3 L/100km", "dims": "5,325 x 1,900 x 1,815 mm"},
    {"brand": "toyota", "model": "Raize 1.0 Turbo", "body": "SUV", "fuel": "Xăng", "trans": "D-CVT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 520000000, "engine": "1.0L Turbo 3 xi-lanh", "power": "98 hp", "consumption": "5.6 L/100km", "dims": "4,030 x 1,710 x 1,605 mm"},
    {"brand": "toyota", "model": "Yaris 1.5G", "body": "Hatchback", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022], "base_price": 630000000, "engine": "1.5L Dual VVT-i", "power": "107 hp", "consumption": "5.7 L/100km", "dims": "4,140 x 1,730 x 1,500 mm"},

    # --- HONDA ---
    {"brand": "honda", "model": "City RS", "body": "Sedan", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 580000000, "engine": "1.5L i-VTEC DOHC", "power": "119 hp", "consumption": "5.6 L/100km", "dims": "4,580 x 1,748 x 1,467 mm"},
    {"brand": "honda", "model": "Civic RS", "body": "Sedan", "fuel": "Xăng", "trans": "CVT lẫy số", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 890000000, "engine": "1.5L VTEC Turbo tăng áp", "power": "176 hp", "consumption": "6.5 L/100km", "dims": "4,678 x 1,802 x 1,415 mm"},
    {"brand": "honda", "model": "Civic e:HEV RS", "body": "Sedan", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 999000000, "engine": "2.0L Xăng + 2 Mô-tơ điện e:HEV", "power": "200 hp", "consumption": "4.1 L/100km", "dims": "4,678 x 1,802 x 1,415 mm"},
    {"brand": "honda", "model": "CR-V 1.5 Turbo", "body": "SUV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023], "base_price": 1050000000, "engine": "1.5L VTEC Turbo", "power": "188 hp", "consumption": "6.9 L/100km", "dims": "4,623 x 1,855 x 1,679 mm"},
    {"brand": "honda", "model": "CR-V e:HEV RS", "body": "SUV", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024, 2025], "base_price": 1259000000, "engine": "2.0L Atkinson + Hệ thống 2 Mô-tơ điện", "power": "204 hp", "consumption": "4.8 L/100km", "dims": "4,691 x 1,866 x 1,681 mm"},
    {"brand": "honda", "model": "HR-V RS Turbo", "body": "SUV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 870000000, "engine": "1.5L VTEC Turbo", "power": "174 hp", "consumption": "6.7 L/100km", "dims": "4,385 x 1,790 x 1,590 mm"},
    {"brand": "honda", "model": "HR-V e:HEV RS", "body": "SUV", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 869000000, "engine": "1.5L Atkinson + 2 Mô-tơ điện Hybrid", "power": "131 hp", "consumption": "4.0 L/100km", "dims": "4,385 x 1,790 x 1,590 mm"},
    {"brand": "honda", "model": "BR-V L", "body": "MPV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024], "base_price": 705000000, "engine": "1.5L i-VTEC DOHC", "power": "119 hp", "consumption": "6.4 L/100km", "dims": "4,490 x 1,780 x 1,685 mm"},
    {"brand": "honda", "model": "Brio RS", "body": "Hatchback", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022], "base_price": 430000000, "engine": "1.2L i-VTEC 4 xi-lanh", "power": "89 hp", "consumption": "5.4 L/100km", "dims": "3,815 x 1,680 x 1,485 mm"},

    # --- HYUNDAI ---
    {"brand": "hyundai", "model": "Accent 1.4AT", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024], "base_price": 500000000, "engine": "Kappa 1.4L MPI", "power": "100 hp", "consumption": "5.6 L/100km", "dims": "4,440 x 1,720 x 1,470 mm"},
    {"brand": "hyundai", "model": "Elantra 1.6 Turbo N-Line", "body": "Sedan", "fuel": "Xăng", "trans": "7-DCT ly hợp kép", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 780000000, "engine": "Smartstream 1.6 T-GDi", "power": "204 hp", "consumption": "6.8 L/100km", "dims": "4,675 x 1,825 x 1,430 mm"},
    {"brand": "hyundai", "model": "Creta 1.5L Cao Cấp", "body": "SUV", "fuel": "Xăng", "trans": "iVT", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 699000000, "engine": "Smartstream 1.5L", "power": "115 hp", "consumption": "6.1 L/100km", "dims": "4,315 x 1,790 x 1,660 mm"},
    {"brand": "hyundai", "model": "Tucson 1.6T HTRAC", "body": "SUV", "fuel": "Xăng", "trans": "7-DCT", "drive": "4 Bánh (AWD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 990000000, "engine": "Smartstream 1.6 T-GDi Turbo", "power": "180 hp", "consumption": "7.2 L/100km", "dims": "4,630 x 1,865 x 1,695 mm"},
    {"brand": "hyundai", "model": "Tucson 2.0 Diesel", "body": "SUV", "fuel": "Dầu", "trans": "Tự động 8 cấp", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 980000000, "engine": "Smartstream D2.0L Diesel Turbo", "power": "186 hp", "consumption": "6.3 L/100km", "dims": "4,630 x 1,865 x 1,695 mm"},
    {"brand": "hyundai", "model": "Santa Fe 2.2 Diesel HTRAC", "body": "SUV", "fuel": "Dầu", "trans": "8-DCT ly hợp kép ướt", "drive": "4 Bánh (AWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 1280000000, "engine": "Smartstream D2.2L Diesel", "power": "202 hp", "consumption": "6.7 L/100km", "dims": "4,785 x 1,900 x 1,730 mm"},
    {"brand": "hyundai", "model": "Santa Fe Hybrid HTRAC", "body": "SUV", "fuel": "Hybrid", "trans": "Tự động 6 cấp", "drive": "4 Bánh (AWD)",
     "years": [2023, 2024, 2025], "base_price": 1399000000, "engine": "1.6L Smartstream Turbo + Mô-tơ điện", "power": "235 hp", "consumption": "6.3 L/100km", "dims": "4,785 x 1,900 x 1,730 mm"},
    {"brand": "hyundai", "model": "Custin 2.0T", "body": "MPV", "fuel": "Xăng", "trans": "Tự động 8 cấp", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024], "base_price": 974000000, "engine": "2.0L Turbo GDi", "power": "236 hp", "consumption": "8.4 L/100km", "dims": "4,950 x 1,850 x 1,725 mm"},
    {"brand": "hyundai", "model": "Grand i10 1.2AT", "body": "Hatchback", "fuel": "Xăng", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024], "base_price": 420000000, "engine": "Kappa 1.2L MPI", "power": "83 hp", "consumption": "5.4 L/100km", "dims": "3,850 x 1,680 x 1,520 mm"},

    # --- KIA ---
    {"brand": "kia", "model": "K3 1.6 Premium", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 639000000, "engine": "Gamma 1.6L MPI", "power": "126 hp", "consumption": "6.3 L/100km", "dims": "4,640 x 1,800 x 1,450 mm"},
    {"brand": "kia", "model": "K5 2.0 Premium", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 859000000, "engine": "Smartstream G2.0", "power": "150 hp", "consumption": "7.0 L/100km", "dims": "4,905 x 1,860 x 1,445 mm"},
    {"brand": "kia", "model": "Sonet 1.5 Premium", "body": "SUV", "fuel": "Xăng", "trans": "IVT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 599000000, "engine": "Smartstream 1.5L Dual CVVT", "power": "113 hp", "consumption": "5.7 L/100km", "dims": "4,120 x 1,790 x 1,642 mm"},
    {"brand": "kia", "model": "Seltos 1.4 Turbo GT-Line", "body": "SUV", "fuel": "Xăng", "trans": "7-DCT", "drive": "Cầu trước (FWD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 699000000, "engine": "Kappa 1.4 T-GDi", "power": "138 hp", "consumption": "6.3 L/100km", "dims": "4,315 x 1,800 x 1,645 mm"},
    {"brand": "kia", "model": "Sportage 2.0G", "body": "SUV", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 820000000, "engine": "Smartstream G2.0", "power": "154 hp", "consumption": "7.2 L/100km", "dims": "4,660 x 1,865 x 1,665 mm"},
    {"brand": "kia", "model": "Sorento 2.2D Signature", "body": "SUV", "fuel": "Dầu", "trans": "8-DCT ly hợp kép", "drive": "4 Bánh (AWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 1299000000, "engine": "Smartstream D2.2L Diesel", "power": "198 hp", "consumption": "6.8 L/100km", "dims": "4,810 x 1,900 x 1,700 mm"},
    {"brand": "kia", "model": "Sorento HEV Signature", "body": "SUV", "fuel": "Hybrid", "trans": "Tự động 6 cấp", "drive": "4 Bánh (AWD)",
     "years": [2022, 2023, 2024, 2025], "base_price": 1399000000, "engine": "Smartstream 1.6L Turbo + Mô-tơ điện", "power": "230 hp", "consumption": "5.9 L/100km", "dims": "4,810 x 1,900 x 1,700 mm"},
    {"brand": "kia", "model": "Carnival 2.2D Signature", "body": "MPV", "fuel": "Dầu", "trans": "Tự động 8 cấp", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 1439000000, "engine": "Smartstream D2.2L CRDi", "power": "199 hp", "consumption": "7.4 L/100km", "dims": "5,155 x 1,995 x 1,775 mm"},
    {"brand": "kia", "model": "Morning GT-Line", "body": "Hatchback", "fuel": "Xăng", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023], "base_price": 389000000, "engine": "Kappa 1.25L 4 xi-lanh", "power": "83 hp", "consumption": "5.5 L/100km", "dims": "3,595 x 1,595 x 1,485 mm"},

    # --- FORD ---
    {"brand": "ford", "model": "Ranger XLS 2.0L 4x2", "body": "Bán tải", "fuel": "Dầu", "trans": "Tự động 6 cấp", "drive": "Cầu sau (RWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024], "base_price": 688000000, "engine": "2.0L Single Turbo Diesel", "power": "170 hp", "consumption": "7.5 L/100km", "dims": "5,362 x 1,918 x 1,875 mm"},
    {"brand": "ford", "model": "Ranger Wildtrak 2.0L 4x4", "body": "Bán tải", "fuel": "Dầu", "trans": "Tự động 10 cấp", "drive": "2 Cầu (4WD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 979000000, "engine": "2.0L Bi-Turbo Diesel 500Nm", "power": "210 hp", "consumption": "8.0 L/100km", "dims": "5,362 x 1,918 x 1,875 mm"},
    {"brand": "ford", "model": "Ranger Raptor 2.0L", "body": "Bán tải", "fuel": "Dầu", "trans": "Tự động 10 cấp", "drive": "4 Bánh toàn thời gian",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 1299000000, "engine": "2.0L Bi-Turbo Diesel Fox Racing", "power": "213 hp", "consumption": "8.9 L/100km", "dims": "5,381 x 2,028 x 1,922 mm"},
    {"brand": "ford", "model": "Everest Titanium 2.0L 4x2", "body": "SUV", "fuel": "Dầu", "trans": "Tự động 6 cấp", "drive": "Cầu sau (RWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 1245000000, "engine": "2.0L Single Turbo Diesel", "power": "170 hp", "consumption": "7.8 L/100km", "dims": "4,914 x 1,923 x 1,842 mm"},
    {"brand": "ford", "model": "Everest Titanium+ 4x4 Bi-Turbo", "body": "SUV", "fuel": "Dầu", "trans": "Tự động 10 cấp", "drive": "4 Bánh (4WD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 1468000000, "engine": "2.0L Bi-Turbo Diesel", "power": "210 hp", "consumption": "8.3 L/100km", "dims": "4,914 x 1,923 x 1,842 mm"},
    {"brand": "ford", "model": "Territory Titanium X", "body": "SUV", "fuel": "Xăng", "trans": "7-DCT", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 889000000, "engine": "EcoBoost 1.5L Turbo", "power": "160 hp", "consumption": "7.0 L/100km", "dims": "4,630 x 1,935 x 1,706 mm"},

    # --- MITSUBISHI ---
    {"brand": "mitsubishi", "model": "Xpander AT", "body": "MPV", "fuel": "Xăng", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024], "base_price": 598000000, "engine": "1.5L MIVEC 4 xi-lanh", "power": "105 hp", "consumption": "6.2 L/100km", "dims": "4,475 x 1,750 x 1,700 mm"},
    {"brand": "mitsubishi", "model": "Xpander Cross", "body": "MPV", "fuel": "Xăng", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 698000000, "engine": "1.5L MIVEC DOHC", "power": "105 hp", "consumption": "6.4 L/100km", "dims": "4,500 x 1,800 x 1,750 mm"},
    {"brand": "mitsubishi", "model": "Xforce Ultimate", "body": "SUV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024, 2025], "base_price": 705000000, "engine": "1.5L MIVEC 4 chế độ lái", "power": "105 hp", "consumption": "6.3 L/100km", "dims": "4,390 x 1,810 x 1,660 mm"},
    {"brand": "mitsubishi", "model": "Outlander 2.0 CVT", "body": "SUV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 825000000, "engine": "2.0L MIVEC", "power": "145 hp", "consumption": "7.2 L/100km", "dims": "4,695 x 1,810 x 1,710 mm"},
    {"brand": "mitsubishi", "model": "Triton 4x4 Athlete", "body": "Bán tải", "fuel": "Dầu", "trans": "Tự động 6 cấp", "drive": "2 Cầu Super Select II",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 890000000, "engine": "2.4L MIVEC Clean Diesel", "power": "181 hp", "consumption": "7.9 L/100km", "dims": "5,305 x 1,815 x 1,795 mm"},
    {"brand": "mitsubishi", "model": "Attrage CVT", "body": "Sedan", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 465000000, "engine": "1.2L MIVEC 3 xi-lanh", "power": "78 hp", "consumption": "5.1 L/100km", "dims": "4,305 x 1,670 x 1,515 mm"},

    # --- MAZDA ---
    {"brand": "mazda", "model": "Mazda 2 Sedan", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 490000000, "engine": "SkyActiv-G 1.5L", "power": "110 hp", "consumption": "5.3 L/100km", "dims": "4,340 x 1,695 x 1,470 mm"},
    {"brand": "mazda", "model": "Mazda 3 1.5 Premium", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023, 2024], "base_price": 729000000, "engine": "SkyActiv-G 1.5L", "power": "110 hp", "consumption": "5.9 L/100km", "dims": "4,660 x 1,795 x 1,440 mm"},
    {"brand": "mazda", "model": "Mazda 6 2.0 Premium", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 820000000, "engine": "SkyActiv-G 2.0L", "power": "154 hp", "consumption": "6.5 L/100km", "dims": "4,865 x 1,840 x 1,450 mm"},
    {"brand": "mazda", "model": "CX-3 1.5 Premium", "body": "SUV", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 620000000, "engine": "SkyActiv-G 1.5L", "power": "110 hp", "consumption": "6.0 L/100km", "dims": "4,275 x 1,765 x 1,535 mm"},
    {"brand": "mazda", "model": "CX-5 2.0 Premium", "body": "SUV", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2018, 2019, 2020, 2021, 2022, 2023, 2024], "base_price": 829000000, "engine": "SkyActiv-G 2.0L", "power": "154 hp", "consumption": "6.9 L/100km", "dims": "4,590 x 1,845 x 1,680 mm"},
    {"brand": "mazda", "model": "CX-8 2.5 Premium", "body": "SUV", "fuel": "Xăng", "trans": "Tự động 6 cấp", "drive": "Cầu trước (FWD)",
     "years": [2020, 2021, 2022, 2023, 2024], "base_price": 1079000000, "engine": "SkyActiv-G 2.5L", "power": "188 hp", "consumption": "7.5 L/100km", "dims": "4,900 x 1,840 x 1,730 mm"},

    # --- VINFAST (XE ĐIỆN QUỐC DÂN) ---
    {"brand": "vinfast", "model": "VF 3", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu sau (RWD)",
     "years": [2024, 2025], "base_price": 290000000, "engine": "Mô-tơ điện 32 kW (43 hp) pin LFP 18.6 kWh", "power": "43 hp", "consumption": "210 km / lần sạc", "dims": "3,190 x 1,679 x 1,622 mm"},
    {"brand": "vinfast", "model": "VF 5 Plus", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024, 2025], "base_price": 480000000, "engine": "Mô-tơ điện 100 kW pin 37.23 kWh", "power": "134 hp", "consumption": "326 km / lần sạc", "dims": "3,965 x 1,720 x 1,580 mm"},
    {"brand": "vinfast", "model": "VF 6 Plus", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2023, 2024, 2025], "base_price": 710000000, "engine": "Mô-tơ điện 150 kW pin LFP 59.6 kWh", "power": "201 hp", "consumption": "381 km / lần sạc", "dims": "4,238 x 1,820 x 1,594 mm"},
    {"brand": "vinfast", "model": "VF 7 Plus AWD", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "4 Bánh (AWD)",
     "years": [2023, 2024, 2025], "base_price": 999000000, "engine": "2 Mô-tơ điện kép 260 kW pin 75.3 kWh", "power": "349 hp", "consumption": "450 km / lần sạc", "dims": "4,545 x 1,890 x 1,635 mm"},
    {"brand": "vinfast", "model": "VF 8 Plus", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "4 Bánh (AWD)",
     "years": [2022, 2023, 2024], "base_price": 1150000000, "engine": "2 Mô-tơ điện 300 kW pin CATL 87.7 kWh", "power": "402 hp", "consumption": "400 km / lần sạc", "dims": "4,750 x 1,934 x 1,667 mm"},
    {"brand": "vinfast", "model": "VF 9 Plus 6 Chỗ", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "4 Bánh (AWD)",
     "years": [2023, 2024], "base_price": 1690000000, "engine": "2 Mô-tơ điện 300 kW pin CATL 92 kWh", "power": "402 hp", "consumption": "580 km / lần sạc", "dims": "5,118 x 2,070 x 1,696 mm"},
    {"brand": "vinfast", "model": "VF e34", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023], "base_price": 540000000, "engine": "Mô-tơ điện 110 kW pin 42 kWh", "power": "147 hp", "consumption": "285 km / lần sạc", "dims": "4,300 x 1,768 x 1,613 mm"},

    # --- BYD (XE ĐIỆN & HYBRID CÔNG NGHỆ CAO) ---
    {"brand": "byd", "model": "Dolphin GLX", "body": "Hatchback", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 499000000, "engine": "Pin Blade 44.9 kWh + Mô-tơ điện 70 kW", "power": "94 hp", "consumption": "405 km / lần sạc", "dims": "4,125 x 1,770 x 1,570 mm"},
    {"brand": "byd", "model": "Atto 3 Premium", "body": "SUV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 866000000, "engine": "Pin Blade 60.48 kWh + Mô-tơ 150 kW", "power": "201 hp", "consumption": "480 km / lần sạc", "dims": "4,455 x 1,875 x 1,615 mm"},
    {"brand": "byd", "model": "Seal Performance AWD", "body": "Sedan", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "4 Bánh (AWD)",
     "years": [2024, 2025], "base_price": 1359000000, "engine": "2 Mô-tơ điện kép 390 kW pin Blade 82.5 kWh", "power": "523 hp", "consumption": "520 km / lần sạc", "dims": "4,800 x 1,875 x 1,460 mm"},
    {"brand": "byd", "model": "Sealion 6 DM-i Super Hybrid", "body": "SUV", "fuel": "Hybrid", "trans": "E-CVT", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 880000000, "engine": "1.5L Xăng + Mô-tơ điện Super Hybrid DM-i", "power": "218 hp", "consumption": "1,200 km tổng hành trình (Pin 18.3 kWh)", "dims": "4,775 x 1,890 x 1,670 mm"},
    {"brand": "byd", "model": "M6 7 Chỗ", "body": "MPV", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 756000000, "engine": "Pin Blade 55.4 kWh + Mô-tơ điện", "power": "161 hp", "consumption": "420 km / lần sạc", "dims": "4,710 x 1,810 x 1,690 mm"},

    # --- SUZUKI (HYBRID THỰC DỤNG) ---
    {"brand": "suzuki", "model": "XL7 Hybrid", "body": "MPV", "fuel": "Hybrid", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 599000000, "engine": "1.5L K15B + Hệ thống Mild-Hybrid SHVS", "power": "103 hp", "consumption": "5.3 L/100km", "dims": "4,450 x 1,775 x 1,710 mm"},
    {"brand": "suzuki", "model": "Ertiga Hybrid", "body": "MPV", "fuel": "Hybrid", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 560000000, "engine": "1.5L Xăng + Máy phát điện thông minh ISG", "power": "103 hp", "consumption": "5.0 L/100km", "dims": "4,395 x 1,735 x 1,690 mm"},
    {"brand": "suzuki", "model": "Swift GLX", "body": "Hatchback", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021, 2022, 2023], "base_price": 530000000, "engine": "1.2L K12M 4 xi-lanh", "power": "82 hp", "consumption": "4.7 L/100km", "dims": "3,845 x 1,735 x 1,495 mm"},
    {"brand": "suzuki", "model": "Ciaz 1.4AT", "body": "Sedan", "fuel": "Xăng", "trans": "Tự động 4 cấp", "drive": "Cầu trước (FWD)",
     "years": [2019, 2020, 2021], "base_price": 490000000, "engine": "1.4L K14B 4 xi-lanh", "power": "91 hp", "consumption": "5.6 L/100km", "dims": "4,490 x 1,730 x 1,475 mm"},

    # --- WULING (XE ĐIỆN ĐÔ THỊ) ---
    {"brand": "wuling", "model": "HongGuang Mini EV LV2", "body": "Hatchback", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu sau (RWD)",
     "years": [2023, 2024], "base_price": 255000000, "engine": "Mô-tơ điện 20 kW pin LFP 13.9 kWh", "power": "27 hp", "consumption": "170 km / lần sạc", "dims": "2,920 x 1,493 x 1,621 mm"},
    {"brand": "wuling", "model": "Bingo 333km", "body": "Hatchback", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu trước (FWD)",
     "years": [2024, 2025], "base_price": 420000000, "engine": "Mô-tơ điện 50 kW pin LFP 31.9 kWh", "power": "67 hp", "consumption": "333 km / lần sạc", "dims": "3,950 x 1,708 x 1,580 mm"},

    # --- MG ---
    {"brand": "mg", "model": "MG5 1.5 Luxury", "body": "Sedan", "fuel": "Xăng", "trans": "CVT giả lập 8 cấp", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 540000000, "engine": "1.5L DOHC 4 xi-lanh", "power": "112 hp", "consumption": "6.1 L/100km", "dims": "4,675 x 1,842 x 1,480 mm"},
    {"brand": "mg", "model": "MG ZS 1.5 Lux+", "body": "SUV", "fuel": "Xăng", "trans": "CVT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 599000000, "engine": "1.5L NSE DOHC", "power": "112 hp", "consumption": "6.3 L/100km", "dims": "4,323 x 1,809 x 1,653 mm"},
    {"brand": "mg", "model": "MG HS 1.5 Trophy", "body": "SUV", "fuel": "Xăng", "trans": "7-DCT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2024], "base_price": 750000000, "engine": "1.5L Turbo tăng áp", "power": "162 hp", "consumption": "7.1 L/100km", "dims": "4,574 x 1,876 x 1,664 mm"},
    {"brand": "mg", "model": "MG4 EV Com", "body": "Hatchback", "fuel": "Điện", "trans": "Tự động 1 cấp", "drive": "Cầu sau (RWD)",
     "years": [2024, 2025], "base_price": 680000000, "engine": "Mô-tơ điện 125 kW pin 51 kWh sạc nhanh DC", "power": "170 hp", "consumption": "350 km / lần sạc", "dims": "4,287 x 1,836 x 1,504 mm"},

    # --- NISSAN ---
    {"brand": "nissan", "model": "Almera 1.0 Turbo", "body": "Sedan", "fuel": "Xăng", "trans": "Xtronic CVT", "drive": "Cầu trước (FWD)",
     "years": [2021, 2022, 2023, 2024], "base_price": 570000000, "engine": "1.0L Turbo 3 xi-lanh DOHC", "power": "100 hp", "consumption": "5.3 L/100km", "dims": "4,495 x 1,740 x 1,460 mm"},
    {"brand": "nissan", "model": "Kicks e-Power V", "body": "SUV", "fuel": "Hybrid", "trans": "Tự động truyền động điện", "drive": "Cầu trước (FWD)",
     "years": [2022, 2023, 2024], "base_price": 780000000, "engine": "1.2L Máy phát + Mô-tơ điện e-Power", "power": "136 hp", "consumption": "2.2 L/100km đô thị", "dims": "4,305 x 1,760 x 1,615 mm"},
    {"brand": "nissan", "model": "Navara Pro4X 4x4", "body": "Bán tải", "fuel": "Dầu", "trans": "Tự động 7 cấp", "drive": "2 Cầu bán thời gian",
     "years": [2021, 2022, 2023, 2024], "base_price": 945000000, "engine": "2.3L Twin Turbo Diesel", "power": "190 hp", "consumption": "8.1 L/100km", "dims": "5,260 x 1,875 x 1,855 mm"}
]

# Danh mục màu sắc phổ thông & phụ phí
COLOR_TEMPLATES = [
    {"name": "Trắng Ngọc Trai", "hex": "#F5F5F7", "type": "metallic", "delta": 8000000.0},
    {"name": "Đen Ánh Kim", "hex": "#1B1C1E", "type": "standard", "delta": 0.0},
    {"name": "Đỏ Pha Lê", "hex": "#C41E3A", "type": "metallic", "delta": 0.0},
    {"name": "Bạc Ánh Kim", "hex": "#D1D5DB", "type": "standard", "delta": 0.0},
    {"name": "Xám Titan", "hex": "#4B5563", "type": "metallic", "delta": 0.0},
    {"name": "Xanh Dương Topaz", "hex": "#1E3A8A", "type": "metallic", "delta": 0.0},
    {"name": "Vàng Cát Sa Mạc", "hex": "#D4AF37", "type": "standard", "delta": 0.0}
]

# Các gói trang bị phổ thông thực tế
OPTIONS_TEMPLATES = [
    {"group": "Dán Phim & Cách Nhiệt", "name": "Phim Cách Nhiệt 3M Crystalline Toàn Xe", "code": "OPT-3M", "price": 12500000.0, "desc": "Cản 99% tia hồng ngoại, bảo hành điện tử 10 năm"},
    {"group": "Camera & An Toàn", "name": "Camera Hành Trình Vietmap M1 Cảnh Báo Tốc Độ 4K", "code": "OPT-M1", "price": 5490000.0, "desc": "Ghi hình trước sau 4K, cảnh báo biển báo giọng nói"},
    {"group": "Tiện Nghi & Lót Sàn", "name": "Thảm Lót Sàn Cao Su Đúc KATA 5D Cao Cấp", "code": "OPT-KATA", "price": 2190000.0, "desc": "Chống nước, không mùi độc hại, vệ sinh dễ dàng"},
    {"group": "Bảo Vệ Xe", "name": "Gói Phủ Ceramic 9H Bóng Sâu 3 Lớp", "code": "OPT-CERAMIC", "price": 7500000.0, "desc": "Bảo vệ nước sơn, hiệu ứng trôi nước lá sen"},
    {"group": "Vận Hành & Áp Suất", "name": "Cảm Biến Áp Suất Lốp Van Trong Steelmate", "code": "OPT-TPMS", "price": 2600000.0, "desc": "Cảnh báo xì lốp, giám sát nhiệt độ lốp theo thời gian thực"},
    {"group": "Tiện Nghi Cao Cấp", "name": "Cốp Điện Thông Minh Tích Hợp Đá Cốp Tự Động", "code": "OPT-TRUNK", "price": 8900000.0, "desc": "Đóng mở cốp êm ái, chống kẹt thông minh"},
    {"group": "Công Nghệ & Màn Hình", "name": "Màn Hình Android Liền Camera 360 Toàn Cảnh", "code": "OPT-CAM360", "price": 13500000.0, "desc": "Màn hình IPS 10 inch siêu nét kèm 4 mắt camera 360 độ"}
]

def calculate_car_price_and_odo(base_price: float, year: int):
    # Khấu hao xe theo năm sản xuất (2025 là mới 100%, 2018 khấu hao ~ 35 - 40%)
    age = 2025 - year
    depreciation_rate = min(0.45, age * 0.075)
    adjusted_price = base_price * (1.0 - depreciation_rate)
    
    if age == 0:
        odo = random.randint(10, 150)
        condition = CarCondition.new
        badge = "Mới 100%"
    elif age == 1:
        odo = random.randint(5000, 18000)
        condition = CarCondition.used
        badge = "Siêu Lướt"
    elif age <= 3:
        odo = random.randint(19000, 45000)
        condition = CarCondition.used
        badge = "Xe Lướt Đẹp"
    else:
        odo = random.randint(46000, 95000)
        condition = CarCondition.used
        badge = "Giá Cực Tốt"

    # Làm tròn tới triệu
    final_price = float(round(adjusted_price / 1000000.0) * 1000000)
    return final_price, odo, condition, badge

def seed_massive_popular_cars():
    print("==================================================================")
    print("BẮT ĐẦU SEED HỆ THỐNG 420+ XE PHỔ THÔNG (XĂNG, DẦU, HYBRID & ĐIỆN)")
    print("==================================================================")

    Base.metadata.create_all(bind=engine)

    # 1. DỌN SẠCH CÁC BẢNG LIÊN QUAN
    with engine.connect() as conn:
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
    print("-> Đã xóa dữ liệu cũ an toàn.")

    db = SessionLocal()
    try:
        # 2. TẠO TƯ VẤN VIÊN
        consultant = Consultant(
            name="Nguyễn Văn Hùng",
            title="Chuyên Viên Thẩm Định & Tư Vấn Xe Toàn Quốc",
            phone="0908 123 456",
            email="hung.nguyen@showroom-oto.vn",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            is_active=True
        )
        db.add(consultant)
        db.commit()

        # 3. TẠO THƯƠNG HIỆU PHỔ THÔNG (13 BRANDS)
        brand_map = {}
        for b in BRANDS_MASTER:
            brand_obj = Brand(
                name=b["name"],
                slug=b["slug"],
                description=b["description"],
                logo_url=f"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80"
            )
            db.add(brand_obj)
            db.commit()
            db.refresh(brand_obj)
            brand_map[b["slug"]] = brand_obj
        print(f"-> Đã tạo {len(brand_map)} hãng xe phổ thông thành công!")

        # 4. TẠO CÂY DANH MỤC 4 TẦNG (CATEGORY TREE)
        # Tầng 1: Phân Khúc Kiểu Dáng
        root_cats_data = [
            {"name": "Sedan Gia Đình & Đô Thị", "slug": "sedan-gia-dinh", "sort": 1},
            {"name": "SUV & Crossover Gầm Cao", "slug": "suv-crossover", "sort": 2},
            {"name": "MPV 7 Chỗ Đa Dụng", "slug": "mpv-7-cho", "sort": 3},
            {"name": "Bán Tải Địa Hình & Công Việc", "slug": "ban-tai-pickup", "sort": 4},
            {"name": "Hatchback Đô Thị Nhỏ Gọn", "slug": "hatchback-co-nho", "sort": 5}
        ]
        cat_roots = {}
        for rc in root_cats_data:
            c = Category(name=rc["name"], slug=rc["slug"], level=1, sort_order=rc["sort"])
            db.add(c)
            db.commit()
            db.refresh(c)
            cat_roots[rc["slug"]] = c

        # Mapping phân khúc cấp 1 theo body_type
        def get_root_slug(body_type: str) -> str:
            b = body_type.lower()
            if "sedan" in b: return "sedan-gia-dinh"
            if "mpv" in b: return "mpv-7-cho"
            if "bán tải" in b or "pickup" in b: return "ban-tai-pickup"
            if "hatchback" in b: return "hatchback-co-nho"
            return "suv-crossover"

        # Cache tầng 2 và tầng 3
        cat_l2_cache = {}
        cat_l3_cache = {}

        created_cars_count = 0
        used_vin_set = set()
        used_stock_set = set()
        used_slug_set = set()

        # 5. SINH TỰ ĐỘNG CÁC XE CHI TIẾT
        print("-> Đang khởi tạo và cấu hình dữ liệu 400+ xe...")

        for defn in CAR_MODELS_DEFINITIONS:
            brand_slug = defn["brand"]
            brand_obj = brand_map[brand_slug]
            root_slug = get_root_slug(defn["body"])
            root_cat = cat_roots[root_slug]

            # Cấp 2: Brand trong Phân khúc (vd: Toyota Sedan, Hyundai SUV)
            l2_slug = f"{root_slug}-{brand_slug}"
            if l2_slug not in cat_l2_cache:
                l2_cat = Category(
                    name=f"{brand_obj.name} {defn['body']}",
                    slug=l2_slug,
                    level=2,
                    sort_order=len(cat_l2_cache) + 1,
                    parent_id=root_cat.id
                )
                db.add(l2_cat)
                db.commit()
                db.refresh(l2_cat)
                cat_l2_cache[l2_slug] = l2_cat
            else:
                l2_cat = cat_l2_cache[l2_slug]

            # Cấp 3: Dòng xe (vd: Toyota Vios Series, VinFast VF 7 Series)
            model_slug_part = defn["model"].lower().replace(" ", "-").replace(":", "").replace("+", "plus")
            l3_slug = f"{brand_slug}-{model_slug_part}-series"
            if l3_slug not in cat_l3_cache:
                l3_cat = Category(
                    name=f"{brand_obj.name} {defn['model']} Series",
                    slug=l3_slug,
                    level=3,
                    sort_order=len(cat_l3_cache) + 1,
                    parent_id=l2_cat.id
                )
                db.add(l3_cat)
                db.commit()
                db.refresh(l3_cat)
                cat_l3_cache[l3_slug] = l3_cat
            else:
                l3_cat = cat_l3_cache[l3_slug]

            # Sinh các phiên bản cho mỗi năm & các màu khác nhau
            for year in defn["years"]:
                # Mỗi năm có thể sinh từ 1 đến 3 biến thể màu sắc / phiên bản để đạt mục tiêu 400+ xe
                variants_count = 2 if year >= 2021 else 1
                if defn["fuel"] in ["Hybrid", "Điện"]:
                    variants_count = 2  # Ưu tiên tạo thêm biến thể cho dòng xe mới

                for var_idx in range(variants_count):
                    # Chọn màu chủ đạo
                    chosen_color = COLOR_TEMPLATES[(created_cars_count + var_idx) % len(COLOR_TEMPLATES)]
                    car_price, odo_km, condition, badge = calculate_car_price_and_odo(defn["base_price"], year)

                    # Mã stock, vin & slug duy nhất
                    brand_prefix = brand_slug[:3].upper()
                    model_prefix = model_slug_part[:3].upper()
                    stock_code = f"{brand_prefix}-{model_prefix}-{year}-{var_idx+1}-{random.randint(100, 999)}"
                    while stock_code in used_stock_set:
                        stock_code = f"{brand_prefix}-{model_prefix}-{year}-{var_idx+1}-{random.randint(1000, 9999)}"
                    used_stock_set.add(stock_code)

                    vin_suffix = f"{year}{created_cars_count:04d}{random.randint(100, 999)}"
                    vin = f"VN{brand_prefix}{vin_suffix}"[:17]
                    while vin in used_vin_set:
                        vin = f"VN{brand_prefix}{random.randint(10000000000, 99999999999)}"[:17]
                    used_vin_set.add(vin)

                    base_slug = f"{stock_code.lower()}"
                    slug = base_slug
                    counter = 1
                    while slug in used_slug_set:
                        slug = f"{base_slug}-{counter}"
                        counter += 1
                    used_slug_set.add(slug)

                    # Cấp 4: Phiên bản chi tiết theo năm
                    trim_slug = f"{model_slug_part}-{year}-v{var_idx+1}"
                    trim_cat = db.query(Category).filter(Category.slug == trim_slug).first()
                    if not trim_cat:
                        trim_cat = Category(
                            name=f"{defn['model']} ({year})",
                            slug=trim_slug,
                            level=4,
                            sort_order=year,
                            parent_id=l3_cat.id
                        )
                        db.add(trim_cat)
                        db.commit()
                        db.refresh(trim_cat)

                    monthly_installment = float(round((car_price * 0.8 / 60) * 1.085))

                    car_title = f"{brand_obj.name} {defn['model']} {year}"
                    if variants_count > 1:
                        car_title += f" - {chosen_color['name']}"

                    desc = (
                        f"{car_title} thuộc dòng {defn['body']} được người tiêu dùng đánh giá cao. "
                        f"Xe vận hành với động cơ {defn['fuel']} ({defn['engine']}), công suất {defn['power']}, "
                        f"tiêu thụ/quãng đường {defn['consumption']}, cam kết nguyên bản, bảo dưỡng định kỳ."
                    )

                    main_image_url = get_car_image(defn["body"], defn["fuel"], chosen_color["name"])

                    car_obj = Car(
                        brand_id=brand_obj.id,
                        category_id=trim_cat.id,
                        name=car_title,
                        slug=slug,
                        stock_code=stock_code,
                        vin=vin,
                        price=car_price,
                        monthly_installment=monthly_installment,
                        year=year,
                        body_type=defn["body"],
                        fuel_type=defn["fuel"],
                        transmission=defn["trans"],
                        drivetrain=defn["drive"],
                        odo_km=odo_km,
                        condition=condition,
                        status=CarStatus.available,
                        exterior_color=chosen_color["name"],
                        interior="Ghế da cao cấp bọc chỉ tương phản",
                        description=desc,
                        badge=badge,
                        owners_count=1 if condition == CarCondition.used else 0,
                        is_ready=True,
                        has_factory_warranty=(year >= 2023),
                        warranty_months=36 if year >= 2024 else (12 if year >= 2022 else 6),
                        is_inspected=True,
                        is_featured=(created_cars_count % 8 == 0),
                        specs=[
                            {"group": "Động Cơ & Vận Hành", "label": "Loại Động Cơ", "value": defn["engine"]},
                            {"group": "Động Cơ & Vận Hành", "label": "Hệ Nhiên Liệu", "value": defn["fuel"]},
                            {"group": "Động Cơ & Vận Hành", "label": "Công Suất Tối Đa", "value": defn["power"]},
                            {"group": "Động Cơ & Vận Hành", "label": "Mức Tiêu Thụ / Tầm Hoạt Động", "value": defn["consumption"]},
                            {"group": "Động Cơ & Vận Hành", "label": "Hộp Số", "value": defn["trans"]},
                            {"group": "Kích Thước & Khung Gầm", "label": "Kích Thước (D x R x C)", "value": defn["dims"]},
                            {"group": "Kích Thước & Khung Gầm", "label": "Hệ Dẫn Động", "value": defn["drive"]},
                        ]
                    )
                    db.add(car_obj)
                    db.commit()
                    db.refresh(car_obj)

                    # Thêm ảnh
                    db.add_all([
                        CarImage(car_id=car_obj.id, image_url=main_image_url, category=ImageCategory.exterior, sort_order=1, is_primary=True),
                        CarImage(car_id=car_obj.id, image_url=IMAGES_POOL["interior"], category=ImageCategory.interior, sort_order=2, is_primary=False),
                        CarImage(car_id=car_obj.id, image_url=IMAGES_POOL["dashboard"], category=ImageCategory.dashboard, sort_order=3, is_primary=False),
                        CarImage(car_id=car_obj.id, image_url=IMAGES_POOL["wheels"], category=ImageCategory.wheels, sort_order=4, is_primary=False),
                    ])

                    # Thêm 4 tùy chọn màu sắc cho xe
                    for c_idx, c_temp in enumerate(COLOR_TEMPLATES[:4]):
                        is_def = (c_temp["name"] == chosen_color["name"])
                        db.add(CarColor(
                            car_id=car_obj.id,
                            name=c_temp["name"],
                            hex_code=c_temp["hex"],
                            color_type=c_temp["type"],
                            price_delta=c_temp["delta"],
                            images=[get_car_image(defn["body"], defn["fuel"], c_temp["name"])],
                            sort_order=c_idx + 1,
                            is_default=is_def
                        ))

                    # Thêm 4 gói options phụ kiện phổ thông
                    for o_idx, opt in enumerate(OPTIONS_TEMPLATES[:4]):
                        db.add(CarOption(
                            car_id=car_obj.id,
                            group=opt["group"],
                            name=opt["name"],
                            code=opt["code"],
                            description=opt["desc"],
                            price=opt["price"],
                            is_standard=False,
                            is_selected=(o_idx == 0),
                            sort_order=o_idx + 1
                        ))

                    db.commit()
                    created_cars_count += 1
                    if created_cars_count % 50 == 0:
                        print(f"   -> Đã seed xong {created_cars_count} xe...")

        print(f"==================================================================")
        print(f"HOÀN TẤT SEED THÀNH CÔNG TỔNG CỘNG: {created_cars_count} XE PHỔ THÔNG!")
        print(f"Bao gồm đầy đủ Xe Xăng, Xe Dầu, Xe Điện, và Xe Hybrid (Xăng lai điện).")
        print(f"==================================================================")

    except Exception as e:
        db.rollback()
        print(f"LỖI SEED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_massive_popular_cars()

