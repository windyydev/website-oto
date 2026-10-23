from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.car import Car, CarStatus
from app.models.lead import Lead, LeadStatus
from app.models.brand import Brand

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Lấy số liệu tổng hợp cho trang Dashboard Admin."""
    total_cars = db.query(Car).count()
    available_cars = db.query(Car).filter(Car.status == CarStatus.available).count()
    sold_cars = db.query(Car).filter(Car.status == CarStatus.sold).count()
    
    total_leads = db.query(Lead).count()
    new_leads = db.query(Lead).filter(Lead.status == LeadStatus.new).count()
    
    total_brands = db.query(Brand).count()

    recent_leads = db.query(Lead).order_by(desc(Lead.created_at)).limit(5).all()
    recent_cars = db.query(Car).order_by(desc(Car.created_at)).limit(5).all()

    return {
        "stats": {
            "total_cars": total_cars,
            "available_cars": available_cars,
            "sold_cars": sold_cars,
            "total_leads": total_leads,
            "new_leads": new_leads,
            "total_brands": total_brands
        },
        "recent_leads": [
            {
                "id": l.id,
                "name": l.name,
                "phone": l.phone,
                "type": l.type,
                "status": l.status,
                "created_at": l.created_at,
                "interested_car_name": l.interested_car.name if l.interested_car else None
            }
            for l in recent_leads
        ],
        "recent_cars": [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "price": c.price,
                "year": c.year,
                "status": c.status,
                "primary_image": next((img.image_url for img in c.images if img.is_primary), c.images[0].image_url if c.images else None)
            }
            for c in recent_cars
        ]
    }
