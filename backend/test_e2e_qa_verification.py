"""Comprehensive End-to-End QA and Multi-Tenant Isolation Verification Suite for StockFlow (Step 11).

Tests all critical requirements specified in Step 11:
1. Complete Authentication lifecycle (register, org creation, duplicate email, login, bad login, token validation, /auth/me).
2. Product management CRUD (create, list, get, update, delete, search by name/SKU, pagination, input validation, 404 handling).
3. Organization-scoped SKU uniqueness (same SKU allowed across orgs, blocked within same org).
4. Strict Multi-Tenant Isolation (cross-tenant read, update, delete, listing, and search rejection).
5. Dashboard Metrics & Thresholds (aggregation, custom thresholds, org default fallback, boundary equality, cross-tenant isolation).
"""

import sys
import httpx
from datetime import timedelta
from sqlalchemy import text
from app.core.security import create_access_token
from app.database.session import SessionLocal

BASE_URL = "http://127.0.0.1:8000"

ORG_A_EMAIL = "qa_tenant_a@stockflow-qa.io"
ORG_B_EMAIL = "qa_tenant_b@stockflow-qa.io"
TEST_PASSWORD = "StrongQAPassword2026!"
ORG_A_NAME = "StockFlow QA Tenant A"
ORG_B_NAME = "StockFlow QA Tenant B"


def clean_test_database():
    """Purge test organizations and users cascading to products."""
    with SessionLocal() as db:
        db.execute(text("DELETE FROM users WHERE email IN (:a, :b)"), {"a": ORG_A_EMAIL, "b": ORG_B_EMAIL})
        db.execute(text("DELETE FROM organizations WHERE name IN (:a, :b)"), {"a": ORG_A_NAME, "b": ORG_B_NAME})
        db.commit()


def run_qa_e2e():
    print("=" * 80)
    print("STOCKFLOW STEP 11: COMPLETE END-TO-END QA & MULTI-TENANT VERIFICATION")
    print("=" * 80)

    clean_test_database()
    client = httpx.Client(base_url=BASE_URL, timeout=12.0)

    tests_run = 0
    tests_passed = 0

    def record_pass(desc):
        nonlocal tests_run, tests_passed
        tests_run += 1
        tests_passed += 1
        print(f" [PASS #{tests_passed}] {desc}")

    try:
        # =========================================================================
        # SECTION 1: AUTHENTICATION & ACCESS CONTROL
        # =========================================================================
        print("\n--- SECTION 1: AUTHENTICATION & ACCESS CONTROL ---")

        # 1.1 Register Org A
        res_reg_a = client.post("/api/auth/register", json={
            "email": ORG_A_EMAIL,
            "password": TEST_PASSWORD,
            "organization_name": ORG_A_NAME,
        })
        assert res_reg_a.status_code == 201, f"Org A registration failed: {res_reg_a.text}"
        data_a = res_reg_a.json()
        token_a = data_a["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}
        record_pass("User registration and Organization A creation succeeded.")

        # 1.2 Duplicate Email Rejection
        res_dup = client.post("/api/auth/register", json={
            "email": ORG_A_EMAIL.upper(),
            "password": TEST_PASSWORD,
            "organization_name": "Another Corp",
        })
        assert res_dup.status_code == 400, f"Duplicate email should return 400, got {res_dup.status_code}"
        record_pass("Duplicate email registration rejected with HTTP 400.")

        # 1.3 Register Org B
        res_reg_b = client.post("/api/auth/register", json={
            "email": ORG_B_EMAIL,
            "password": TEST_PASSWORD,
            "organization_name": ORG_B_NAME,
        })
        assert res_reg_b.status_code == 201, f"Org B registration failed: {res_reg_b.text}"
        data_b = res_reg_b.json()
        token_b = data_b["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}
        record_pass("User registration and Organization B creation succeeded.")

        # 1.4 Login with Correct Credentials
        res_login_ok = client.post("/api/auth/login", json={
            "email": ORG_A_EMAIL,
            "password": TEST_PASSWORD,
        })
        assert res_login_ok.status_code == 200, f"Login failed: {res_login_ok.text}"
        assert "access_token" in res_login_ok.json()
        record_pass("Login with correct credentials returns HTTP 200 with JWT access token.")

        # 1.5 Login with Incorrect Credentials
        res_login_bad = client.post("/api/auth/login", json={
            "email": ORG_A_EMAIL,
            "password": "WrongPassword123!",
        })
        assert res_login_bad.status_code == 401, f"Bad login should return 401, got {res_login_bad.status_code}"
        record_pass("Login with incorrect credentials returns HTTP 401.")

        # 1.6 Current User Endpoint (GET /api/auth/me)
        res_me_a = client.get("/api/auth/me", headers=headers_a)
        assert res_me_a.status_code == 200
        assert res_me_a.json()["email"] == ORG_A_EMAIL
        assert res_me_a.json()["organization_name"] == ORG_A_NAME
        record_pass("Current user profile (/api/auth/me) returns accurate tenant details.")

        # 1.7 Missing Token
        res_unauth = client.get("/api/auth/me")
        assert res_unauth.status_code == 401
        record_pass("Unauthenticated request to /api/auth/me returns HTTP 401.")

        # 1.8 Tampered Token
        res_tampered = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.payload"})
        assert res_tampered.status_code == 401
        record_pass("Tampered / malformed token returns HTTP 401.")

        # 1.9 Expired Token
        expired_token = create_access_token(data_a["user"]["id"], expires_delta=timedelta(seconds=-10))
        res_expired = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert res_expired.status_code == 401
        assert "expired" in res_expired.text.lower()
        record_pass("Expired token returns HTTP 401 indicating token expiration.")

        # =========================================================================
        # SECTION 2: PRODUCT MANAGEMENT & INPUT VALIDATION
        # =========================================================================
        print("\n--- SECTION 2: PRODUCT MANAGEMENT & INPUT VALIDATION ---")

        # 2.1 Create Product A1 in Org A
        p_a1_payload = {
            "name": "Precision Industrial Scale",
            "sku": "SCL-IND-01",
            "description": "High precision measurement scale",
            "quantity_on_hand": 20,
            "cost_price": 150.00,
            "selling_price": 249.99,
            "low_stock_threshold": 5,
        }
        res_pa1 = client.post("/api/products", json=p_a1_payload, headers=headers_a)
        assert res_pa1.status_code == 201, f"Product A1 creation failed: {res_pa1.text}"
        prod_a1 = res_pa1.json()
        assert prod_a1["name"] == "Precision Industrial Scale"
        assert prod_a1["sku"] == "SCL-IND-01"
        record_pass("Created Product A1 in Organization A with HTTP 201.")

        # 2.2 Reject Duplicate SKU in SAME Organization (Org A)
        res_dup_sku = client.post("/api/products", json={
            "name": "Another Scale",
            "sku": "SCL-IND-01",
            "quantity_on_hand": 10,
        }, headers=headers_a)
        assert res_dup_sku.status_code == 409, f"Expected 409 for duplicate SKU in Org A, got {res_dup_sku.status_code}"
        record_pass("Duplicate SKU within same organization correctly rejected with HTTP 409.")

        # 2.3 Allow SAME SKU in a DIFFERENT Organization (Org B)
        p_b1_payload = {
            "name": "Org B Scale Variant",
            "sku": "SCL-IND-01",  # Identical SKU across tenants
            "description": "Scale in Org B",
            "quantity_on_hand": 3,
            "cost_price": 140.00,
            "selling_price": 230.00,
            "low_stock_threshold": 10,
        }
        res_pb1 = client.post("/api/products", json=p_b1_payload, headers=headers_b)
        assert res_pb1.status_code == 201, f"Expected 201 for same SKU in Org B, got {res_pb1.status_code}: {res_pb1.text}"
        prod_b1 = res_pb1.json()
        record_pass("Identical SKU is successfully permitted in a separate organization.")

        # 2.4 Reject Negative Quantity & Prices (Input Validation)
        res_neg_qty = client.post("/api/products", json={
            "name": "Negative Qty Item",
            "sku": "NEG-QTY",
            "quantity_on_hand": -5,
        }, headers=headers_a)
        assert res_neg_qty.status_code == 422, f"Expected 422, got {res_neg_qty.status_code}"
        record_pass("Negative quantity_on_hand rejected with HTTP 422 Unprocessable Entity.")

        res_neg_price = client.post("/api/products", json={
            "name": "Negative Price Item",
            "sku": "NEG-PRC",
            "selling_price": -19.99,
        }, headers=headers_a)
        assert res_neg_price.status_code == 422, f"Expected 422, got {res_neg_price.status_code}"
        record_pass("Negative selling_price rejected with HTTP 422 Unprocessable Entity.")

        # 2.5 Search by Name and SKU
        res_s_name = client.get("/api/products?search=Industrial", headers=headers_a)
        assert res_s_name.status_code == 200
        assert res_s_name.json()["total"] == 1
        assert res_s_name.json()["items"][0]["id"] == prod_a1["id"]
        record_pass("Search by product name filters matching records correctly.")

        res_s_sku = client.get("/api/products?search=SCL-IND-01", headers=headers_a)
        assert res_s_sku.status_code == 200
        assert res_s_sku.json()["total"] == 1
        assert res_s_sku.json()["items"][0]["id"] == prod_a1["id"]
        record_pass("Search by SKU filters matching records correctly.")

        # 2.6 Pagination
        # Create second product in Org A for pagination
        res_pa2 = client.post("/api/products", json={
            "name": "Laser Barcode Scanner",
            "sku": "SCN-LSR-02",
            "quantity_on_hand": 15,
        }, headers=headers_a)
        assert res_pa2.status_code == 201
        prod_a2 = res_pa2.json()

        res_page1 = client.get("/api/products?page=1&page_size=1", headers=headers_a)
        assert res_page1.status_code == 200
        p1_data = res_page1.json()
        assert p1_data["total"] == 2
        assert p1_data["total_pages"] == 2
        assert len(p1_data["items"]) == 1

        res_page2 = client.get("/api/products?page=2&page_size=1", headers=headers_a)
        assert res_page2.status_code == 200
        p2_data = res_page2.json()
        assert len(p2_data["items"]) == 1
        assert p1_data["items"][0]["id"] != p2_data["items"][0]["id"]
        record_pass("Pagination mechanics (page, page_size, total_pages) operate correctly.")

        # =========================================================================
        # SECTION 3: MULTI-TENANT ISOLATION
        # =========================================================================
        print("\n--- SECTION 3: MULTI-TENANT ISOLATION ---")

        # 3.1 Organization A cannot list Organization B's products
        res_list_a = client.get("/api/products", headers=headers_a)
        item_ids_a = [item["id"] for item in res_list_a.json()["items"]]
        assert prod_b1["id"] not in item_ids_a
        record_pass("Organization A product listing strictly excludes Organization B products.")

        # 3.2 Organization A cannot retrieve Organization B's product by ID (404)
        res_cross_get = client.get(f"/api/products/{prod_b1['id']}", headers=headers_a)
        assert res_cross_get.status_code == 404, f"Cross-tenant GET should return 404, got {res_cross_get.status_code}"
        record_pass("Organization A cross-tenant GET returns HTTP 404 Not Found.")

        # 3.3 Organization A cannot update Organization B's product (404)
        res_cross_put = client.put(f"/api/products/{prod_b1['id']}", json={
            "name": "Hacked Product Name",
            "sku": "HACKED-SKU",
            "quantity_on_hand": 9999,
        }, headers=headers_a)
        assert res_cross_put.status_code == 404, f"Cross-tenant PUT should return 404, got {res_cross_put.status_code}"
        record_pass("Organization A cross-tenant PUT returns HTTP 404 Not Found.")

        # 3.4 Organization A cannot delete Organization B's product (404)
        res_cross_del = client.delete(f"/api/products/{prod_b1['id']}", headers=headers_a)
        assert res_cross_del.status_code == 404, f"Cross-tenant DELETE should return 404, got {res_cross_del.status_code}"
        record_pass("Organization A cross-tenant DELETE returns HTTP 404 Not Found.")

        # Verify Product B1 is completely intact in Org B
        res_b1_verify = client.get(f"/api/products/{prod_b1['id']}", headers=headers_b)
        assert res_b1_verify.status_code == 200
        assert res_b1_verify.json()["name"] == "Org B Scale Variant"
        assert res_b1_verify.json()["quantity_on_hand"] == 3
        record_pass("Organization B product verified completely intact after cross-tenant attack attempts.")

        # =========================================================================
        # SECTION 4: DASHBOARD & THRESHOLD CALCULATION
        # =========================================================================
        print("\n--- SECTION 4: DASHBOARD & THRESHOLD CALCULATION ---")

        # 4.1 Org A Dashboard Check
        # Org A has prod_a1 (qty 20, threshold 5 -> normal stock), prod_a2 (qty 15, threshold None -> Org default 5 -> normal stock)
        res_sum_a = client.get("/api/dashboard/summary", headers=headers_a)
        assert res_sum_a.status_code == 200
        sum_a = res_sum_a.json()
        assert sum_a["total_products"] == 2
        assert sum_a["total_quantity"] == 35  # 20 + 15
        assert sum_a["low_stock_count"] == 0
        record_pass("Organization A dashboard summary accurately reflects 2 products, 35 units, 0 low stock.")

        # 4.2 Org B Dashboard Check (Tenant Isolation + Low Stock)
        # Org B has prod_b1 (qty 3, threshold 10 -> low stock: 3 <= 10)
        res_sum_b = client.get("/api/dashboard/summary", headers=headers_b)
        assert res_sum_b.status_code == 200
        sum_b = res_sum_b.json()
        assert sum_b["total_products"] == 1
        assert sum_b["total_quantity"] == 3
        assert sum_b["low_stock_count"] == 1
        record_pass("Organization B dashboard reflects exactly 1 product, 3 units, 1 low stock (tenant isolated).")

        # 4.3 Low-stock list for Org B
        res_low_b = client.get("/api/dashboard/low-stock", headers=headers_b)
        assert res_low_b.status_code == 200
        low_items_b = res_low_b.json()["items"]
        assert len(low_items_b) == 1
        assert low_items_b[0]["id"] == prod_b1["id"]
        assert low_items_b[0]["effective_threshold"] == 10
        record_pass("Organization B low-stock listing accurately surfaces Product B1 with effective_threshold=10.")

        # 4.4 Boundary Condition: Quantity == Threshold is low stock
        # In Org B, create Product B2 with qty=5, threshold=5 (exact boundary)
        res_pb2 = client.post("/api/products", json={
            "name": "Boundary Item",
            "sku": "BND-001",
            "quantity_on_hand": 5,
            "low_stock_threshold": 5,
        }, headers=headers_b)
        assert res_pb2.status_code == 201

        # In Org B, create Product B3 with qty=6, threshold=None (Org default is 5; 6 > 5 -> normal stock)
        res_pb3 = client.post("/api/products", json={
            "name": "Above Default Item",
            "sku": "ABV-001",
            "quantity_on_hand": 6,
        }, headers=headers_b)
        assert res_pb3.status_code == 201

        # In Org B, create Product B4 with qty=5, threshold=None (Org default is 5; 5 <= 5 -> low stock)
        res_pb4 = client.post("/api/products", json={
            "name": "At Default Item",
            "sku": "AT-DEF-001",
            "quantity_on_hand": 5,
        }, headers=headers_b)
        assert res_pb4.status_code == 201

        # Check Org B summary:
        # total_products = 4 (b1, b2, b3, b4)
        # total_quantity = 3 + 5 + 6 + 5 = 19
        # low_stock_count = 3 (b1: 3<=10, b2: 5<=5, b4: 5<=5). b3 (6>5) is NOT low stock.
        res_sum_b2 = client.get("/api/dashboard/summary", headers=headers_b)
        sum_b2 = res_sum_b2.json()
        assert sum_b2["total_products"] == 4
        assert sum_b2["total_quantity"] == 19
        assert sum_b2["low_stock_count"] == 3
        record_pass("Threshold calculation verified for: custom threshold, org fallback, boundary equality, and above-threshold exclusion.")

        # 4.5 Verify Sorting of low-stock items (quantity ASC, name ASC)
        res_low_b2 = client.get("/api/dashboard/low-stock", headers=headers_b)
        low_items_b2 = res_low_b2.json()["items"]
        assert len(low_items_b2) == 3
        quantities = [item["quantity_on_hand"] for item in low_items_b2]
        assert quantities == sorted(quantities)
        record_pass("Low-stock products sorted ascending by quantity_on_hand.")

        # =========================================================================
        # SECTION 5: UPDATE & DELETE LIFECYCLE
        # =========================================================================
        print("\n--- SECTION 5: UPDATE & DELETE LIFECYCLE ---")

        # 5.1 Update Product A1 quantity to 4 (becomes low stock <= 5)
        res_put_a1 = client.put(f"/api/products/{prod_a1['id']}", json={
            "name": "Precision Industrial Scale Pro",
            "sku": prod_a1["sku"],
            "quantity_on_hand": 4,
            "cost_price": 150.00,
            "selling_price": 269.99,
            "low_stock_threshold": 5,
        }, headers=headers_a)
        assert res_put_a1.status_code == 200
        assert res_put_a1.json()["name"] == "Precision Industrial Scale Pro"
        assert res_put_a1.json()["quantity_on_hand"] == 4
        record_pass("Product A1 updated successfully.")

        # Check Org A summary updated
        res_sum_a_post = client.get("/api/dashboard/summary", headers=headers_a)
        assert res_sum_a_post.json()["low_stock_count"] == 1
        assert res_sum_a_post.json()["total_quantity"] == 19  # 4 + 15
        record_pass("Dashboard summary dynamically reflects updated product stock and low-stock classification.")

        # 5.2 Delete Product A2
        res_del_a2 = client.delete(f"/api/products/{prod_a2['id']}", headers=headers_a)
        assert res_del_a2.status_code == 204
        record_pass("Product A2 deleted with HTTP 204 No Content.")

        # Subsequent GET returns 404
        res_get_del = client.get(f"/api/products/{prod_a2['id']}", headers=headers_a)
        assert res_get_del.status_code == 404
        record_pass("Deleted product returns HTTP 404 Not Found on subsequent requests.")

        # Check Org A summary after delete
        res_sum_a_del = client.get("/api/dashboard/summary", headers=headers_a)
        assert res_sum_a_del.json()["total_products"] == 1
        assert res_sum_a_del.json()["total_quantity"] == 4
        record_pass("Dashboard summary dynamically decrements counters on product deletion.")

        # Clean up database
        clean_test_database()
        print("\nTest data cleanup completed successfully.")

        print("\n" + "=" * 80)
        print(f"VERIFICATION RESULT: ALL {tests_passed}/{tests_run} E2E & TENANT-ISOLATION TESTS PASSED!")
        print("=" * 80)
        return True

    except Exception as e:
        print(f"\n[FAIL] Test aborted with error: {e}")
        import traceback
        traceback.print_exc()
        clean_test_database()
        return False


if __name__ == "__main__":
    success = run_qa_e2e()
    sys.exit(0 if success else 1)
