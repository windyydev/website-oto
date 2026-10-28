"""
Automated Comprehensive Test Suite for Car Showroom Backend
"""
import sys
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.car import Car
from app.models.brand import Brand
from app.models.category import Category
from app.models.lead import Lead, TestDriveAppointment
from app.models.post import Post

client = TestClient(app)

class TestBackendAPI(unittest.TestCase):
    def test_01_health_check(self):
        res = client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "ok")
        print("==> [PASS] Health check GET /health")

    def test_02_get_brands(self):
        res = client.get("/api/brands/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)
        print(f"==> [PASS] GET /api/brands/ (Found {len(data)} brands)")
    def test_03_get_categories_tree(self):
        res = client.get("/api/categories/tree")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)
        print(f"==> [PASS] GET /api/categories/tree (Found {len(data)} root categories)")

    def test_04_get_cars(self):
        res = client.get("/api/cars/?page=1&page_size=6")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)
        self.assertIn("total", data)
        print(f"==> [PASS] GET /api/cars/ (Total cars in DB: {data['total']})")
        if data["items"]:
            first_car = data["items"][0]
            self.assertIn("name", first_car)
            self.assertIn("slug", first_car)
            self.assertIn("price", first_car)

    def test_05_car_slug_lookup(self):
        # Fetch one car
        res = client.get("/api/cars/?page=1&page_size=1")
        self.assertEqual(res.status_code, 200)
        items = res.json().get("items", [])
        if items:
            slug = items[0]["slug"]
            detail_res = client.get(f"/api/cars/{slug}")
            self.assertEqual(detail_res.status_code, 200)
            car_data = detail_res.json()
            self.assertEqual(car_data["slug"], slug)
            print(f"==> [PASS] GET /api/cars/{slug} (Name: {car_data['name']})")

    def test_06_test_drive_booking(self):
        # Fetch available car
        cars_res = client.get("/api/cars/?page=1&page_size=1")
        items = cars_res.json().get("items", [])
        if items:
            car_id = items[0]["id"]
            payload = {
                "car_id": car_id,
                "name": "Nguyen Van Test",
                "phone": "0987654321",
                "email": "test@atelier.vn",
                "appointment_date": "2026-10-30",
                "time_slot": "09:00 - 11:00",
                "location_type": "showroom",
                "address": "Atelier Showroom Sala",
                "notes": "Test automated booking",
            }
            res = client.post("/api/leads/test-drive", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("booking_code", data)
            self.assertTrue(data["booking_code"].startswith("ATL-"))
            print(f"==> [PASS] POST /api/leads/test-drive (Generated Code: {data['booking_code']})")

    def test_07_get_posts(self):
        res = client.get("/api/posts/")
        self.assertEqual(res.status_code, 200)
        posts = res.json()
        self.assertIsInstance(posts, list)
        print(f"==> [PASS] GET /api/posts/ (Found {len(posts)} articles)")

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBackendAPI)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
