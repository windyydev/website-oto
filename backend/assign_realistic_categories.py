import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.car import Car

def update_mappings():
    db = SessionLocal()
    try:
        # 1. Tìm hoặc tạo các danh mục phù hợp
        # SUV Siêu Sang (cat 2)
        suv_root = db.query(Category).filter(Category.slug == "suv-sieu-sang").first()
        if not suv_root:
            suv_root = db.query(Category).filter(Category.level == 1, Category.name.ilike("%SUV%")).first()

        # Grand Tourer & Sedan (cat 3)
        gt_root = db.query(Category).filter(Category.slug == "grand-tourer-sedan").first()
        if not gt_root:
            gt_root = db.query(Category).filter(Category.level == 1, Category.name.ilike("%Sedan%")).first()

        # Siêu Xe Thể Thao (cat 1)
        sport_root = db.query(Category).filter(Category.slug == "sieu-xe-the-thao").first()
        if not sport_root:
            sport_root = db.query(Category).filter(Category.level == 1, Category.name.ilike("%Siêu Xe%")).first()

        # Land Rover category under SUV
        cat_lr = db.query(Category).filter(Category.slug == "land-rover-suv").first()
        if not cat_lr and suv_root:
            cat_lr = Category(name="Land Rover", slug="land-rover-suv", level=2, sort_order=3, parent_id=suv_root.id)
            db.add(cat_lr)
            db.commit()

        cat_rr = db.query(Category).filter(Category.slug == "range-rover-sv").first()
        if not cat_rr and cat_lr:
            cat_rr = Category(name="Range Rover SV Autobiography", slug="range-rover-sv", level=3, sort_order=1, parent_id=cat_lr.id)
            db.add(cat_rr)
            db.commit()

        # Ferrari Roma category under Ferrari Sports
        cat_ferrari = db.query(Category).filter(Category.slug == "ferrari-sports").first()
        cat_roma = db.query(Category).filter(Category.slug == "ferrari-roma").first()
        if not cat_roma and cat_ferrari:
            cat_roma = Category(name="Ferrari Roma V8", slug="ferrari-roma", level=3, sort_order=2, parent_id=cat_ferrari.id)
            db.add(cat_roma)
            db.commit()

        # BMW M category under Sports
        cat_bmw = db.query(Category).filter(Category.slug == "bmw-m-power").first()
        if not cat_bmw and sport_root:
            cat_bmw = Category(name="BMW M Power", slug="bmw-m-power", level=2, sort_order=4, parent_id=sport_root.id)
            db.add(cat_bmw)
            db.commit()

        cat_m4 = db.query(Category).filter(Category.slug == "bmw-m4-competition").first()
        if not cat_m4 and cat_bmw:
            cat_m4 = Category(name="M4 Competition (G82)", slug="bmw-m4-competition", level=3, sort_order=1, parent_id=cat_bmw.id)
            db.add(cat_m4)
            db.commit()

        # Audi RS under GT & Sedan
        cat_audi = db.query(Category).filter(Category.slug == "audi-sport").first()
        if not cat_audi and gt_root:
            cat_audi = Category(name="Audi Sport", slug="audi-sport", level=2, sort_order=3, parent_id=gt_root.id)
            db.add(cat_audi)
            db.commit()

        cat_rs7 = db.query(Category).filter(Category.slug == "audi-rs7-sportback").first()
        if not cat_rs7 and cat_audi:
            cat_rs7 = Category(name="RS7 Sportback Performance", slug="audi-rs7-sportback", level=3, sort_order=1, parent_id=cat_audi.id)
            db.add(cat_rs7)
            db.commit()

        # Cập nhật từng xe
        cars = db.query(Car).all()
        for car in cars:
            slug = car.slug.lower()
            if "gt3" in slug:
                cat = db.query(Category).filter(Category.slug == "911-gt3-992").first()
                if cat: car.category_id = cat.id
            elif "g63" in slug:
                cat = db.query(Category).filter(Category.slug == "g63-amg-v8").first()
                if cat: car.category_id = cat.id
            elif "roma" in slug:
                cat = db.query(Category).filter(Category.slug == "ferrari-roma").first()
                if cat: car.category_id = cat.id
            elif "range-rover" in slug:
                cat = db.query(Category).filter(Category.slug == "range-rover-sv").first()
                if cat: car.category_id = cat.id
            elif "m4" in slug:
                cat = db.query(Category).filter(Category.slug == "bmw-m4-competition").first()
                if cat: car.category_id = cat.id
            elif "rs7" in slug:
                cat = db.query(Category).filter(Category.slug == "audi-rs7-sportback").first()
                if cat: car.category_id = cat.id
            print(f"Xe: {car.name} -> Category ID: {car.category_id}")

        db.commit()
        print("Cập nhật category chính xác cho tất cả xe thành công!")
    finally:
        db.close()

if __name__ == "__main__":
    update_mappings()
