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

    def test_08_post_admin_crud(self):
        from app.core.security import create_access_token
        token = create_access_token({"sub": "admin", "role": "admin"})
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a test post
        test_slug = "bai-viet-test-kiem-thu-tu-dong-2026"
        payload = {
            "title": "Bài viết test kiểm thử tự động 2026",
            "slug": test_slug,
            "excerpt": "Tóm tắt bài viết test tự động",
            "content": "Nội dung bài viết chi tiết phục vụ test suite tự động.",
            "cover_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
            "category": "Đánh giá xe",
            "is_published": True
        }
        create_res = client.post("/api/posts/", json=payload, headers=headers)
        self.assertIn(create_res.status_code, [200, 400]) # if 400 it might exist already
        post_id = None
        if create_res.status_code == 200:
            post_id = create_res.json()["id"]
            print(f"==> [PASS] POST /api/posts/ (Created Post ID: {post_id})")

        # 2. Get admin posts
        admin_list_res = client.get("/api/posts/admin/all", headers=headers)
        self.assertEqual(admin_list_res.status_code, 200)
        admin_data = admin_list_res.json()
        self.assertIn("items", admin_data)
        self.assertIn("total", admin_data)
        print(f"==> [PASS] GET /api/posts/admin/all (Total in Admin: {admin_data['total']})")

        # 3. If created, update and then delete it
        if post_id:
            update_res = client.put(f"/api/posts/{post_id}", json={"title": "Bài viết đã cập nhật tiêu đề"}, headers=headers)
            self.assertEqual(update_res.status_code, 200)
            self.assertEqual(update_res.json()["title"], "Bài viết đã cập nhật tiêu đề")
            print(f"==> [PASS] PUT /api/posts/{post_id} (Updated Post)")

            del_res = client.delete(f"/api/posts/{post_id}", headers=headers)
            self.assertEqual(del_res.status_code, 200)
            print(f"==> [PASS] DELETE /api/posts/{post_id} (Cleaned up test post)")

    def test_09_category_admin_crud(self):
        from app.core.security import create_access_token
        token = create_access_token({"sub": "admin", "role": "admin"})
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create a category
        cat_slug = "test-phan-khuc-xe-dua-2026"
        payload = {
            "name": "Phân khúc Xe Đua F1 Test",
            "slug": cat_slug,
            "description": "Danh mục thử nghiệm tự động",
            "level": 1,
            "sort_order": 99
        }
        res = client.post("/api/categories/", json=payload, headers=headers)
        self.assertIn(res.status_code, [200, 400])
        if res.status_code == 200:
            cat_id = res.json()["id"]
            print(f"==> [PASS] POST /api/categories/ (Created Category ID: {cat_id})")

            # 2. Update category
            update_res = client.put(f"/api/categories/{cat_id}", json={"name": "Phân khúc Xe Đua Updated"}, headers=headers)
            self.assertEqual(update_res.status_code, 200)
            self.assertEqual(update_res.json()["name"], "Phân khúc Xe Đua Updated")
            print(f"==> [PASS] PUT /api/categories/{cat_id} (Updated Category)")

            # 3. Delete category
            del_res = client.delete(f"/api/categories/{cat_id}", headers=headers)
            self.assertEqual(del_res.status_code, 200)
            print(f"==> [PASS] DELETE /api/categories/{cat_id} (Deleted Category)")

    def test_10_car_color_and_option_flow(self):
        from app.core.security import create_access_token
        token = create_access_token({"sub": "admin", "role": "admin"})
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch one car
        cars_res = client.get("/api/cars/?page=1&page_size=1")
        items = cars_res.json().get("items", [])
        if items:
            car_id = items[0]["id"]
            
            # 1. Add color
            color_payload = {
                "name": "Test Ruby Star Neo",
                "hex_code": "#881337",
                "color_type": "bespoke",
                "price_delta": 150000000,
                "is_default": False,
                "images": ["https://images.unsplash.com/photo-1503376780353-7e6692767b70"]
            }
            c_res = client.post(f"/api/cars/{car_id}/colors", json=color_payload, headers=headers)
            self.assertEqual(c_res.status_code, 200)
            color_id = c_res.json()["id"]
            print(f"==> [PASS] POST /api/cars/{car_id}/colors (Added Color ID: {color_id})")

            # 2. Add option
            opt_payload = {
                "group": "Mâm xe & Lốp",
                "name": "Mâm Test RS Spyder 21 inch",
                "code": "46M",
                "price": 280000000,
                "is_standard": False
            }
            o_res = client.post(f"/api/cars/{car_id}/options", json=opt_payload, headers=headers)
            self.assertEqual(o_res.status_code, 200)
            opt_id = o_res.json()["id"]
            print(f"==> [PASS] POST /api/cars/{car_id}/options (Added Option ID: {opt_id})")

            # 3. Clean up
            del_c = client.delete(f"/api/cars/{car_id}/colors/{color_id}", headers=headers)
            self.assertEqual(del_c.status_code, 200)
            del_o = client.delete(f"/api/cars/{car_id}/options/{opt_id}", headers=headers)
            self.assertEqual(del_o.status_code, 200)
            print(f"==> [PASS] Cleaned up Test Color and Option on Car #{car_id}")



if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBackendAPI)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
