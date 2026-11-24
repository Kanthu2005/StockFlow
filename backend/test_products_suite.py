"""Comprehensive verification suite for StockFlow Step 6: Product Management Backend APIs.

Tests all 14 mandatory test scenarios:
1. Create product successfully
2. Create product with duplicate SKU in same organization (409)
3. Same SKU in a different organization is allowed (201)
4. List only current organization's products (tenant isolation)
5. Search by product name
6. Search by SKU
7. Get existing product
8. Get another organization's product (404)
9. Update product
10. Update product with duplicate SKU (409)
11. Delete product (204)
12. Reject negative quantity and prices (422)
13. Reject requests without JWT (401)
14. Pagination works correctly
"""

import sys
import httpx
from sqlalchemy import text
from app.database.session import SessionLocal

BASE_URL = "http://127.0.0.1:8000"

ORG_A_EMAIL = "tenant_a_admin@stockflow-test.io"
ORG_B_EMAIL = "tenant_b_admin@stockflow-test.io"
TEST_PASSWORD = "StrongPassword2026!"
ORG_A_NAME = "Alpha Logistics Corp"
ORG_B_NAME = "Beta Distribution Ltd"


def cleanup_test_db():
    """Clean up test users, organizations, and cascading products."""
    with SessionLocal() as db:
        db.execute(text("DELETE FROM users WHERE email IN (:a, :b)"), {"a": ORG_A_EMAIL, "b": ORG_B_EMAIL})
        db.execute(text("DELETE FROM organizations WHERE name IN (:a, :b)"), {"a": ORG_A_NAME, "b": ORG_B_NAME})
        db.commit()


def run_product_tests():
    print("=" * 75)
    print("STOCKFLOW STEP 6: PRODUCT MANAGEMENT BACKEND APIS TEST SUITE")
    print("=" * 75)

    cleanup_test_db()
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # -------------------------------------------------------------------------
    # Setup: Register two separate tenant organizations & users
    # -------------------------------------------------------------------------
    print("\n[Setup] Registering Tenant A and Tenant B...")
    res_a = client.post(
        "/api/auth/register",
        json={"email": ORG_A_EMAIL, "password": TEST_PASSWORD, "organization_name": ORG_A_NAME},
    )
    assert res_a.status_code == 201, f"Failed to register Tenant A: {res_a.text}"
    token_a = res_a.json()["access_token"]
    org_a_id = res_a.json()["user"]["organization_id"]

    res_b = client.post(
        "/api/auth/register",
        json={"email": ORG_B_EMAIL, "password": TEST_PASSWORD, "organization_name": ORG_B_NAME},
    )
    assert res_b.status_code == 201, f"Failed to register Tenant B: {res_b.text}"
    token_b = res_b.json()["access_token"]
    org_b_id = res_b.json()["user"]["organization_id"]
    print(f" Registered Tenant A (ID {org_a_id}) and Tenant B (ID {org_b_id})")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    passed_tests = 0
    total_tests = 14

    # -------------------------------------------------------------------------
    # Test 1: Create product successfully
    # -------------------------------------------------------------------------
    print("\n[Test 1] Create product successfully (POST /api/products)...")
    payload1 = {
        "name": "Industrial Widget A1",
        "sku": "SKU-WIDGET-001",
        "description": "High-grade industrial component",
        "quantity_on_hand": 15,
        "cost_price": "24.50",
        "selling_price": "49.99",
        "low_stock_threshold": 5,
    }
    res1 = client.post("/api/products", json=payload1, headers=headers_a)
    print(f"Status Code: {res1.status_code}")
    assert res1.status_code == 201, f"Expected 201, got {res1.status_code}: {res1.text}"
    prod1 = res1.json()
    assert prod1["name"] == "Industrial Widget A1"
    assert prod1["sku"] == "SKU-WIDGET-001"
    assert prod1["organization_id"] == org_a_id
    assert prod1["quantity_on_hand"] == 15
    assert prod1["is_low_stock"] is False  # 15 > 5
    prod1_id = prod1["id"]
    print(f" PASS: Created product id={prod1_id} for Org A")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 2: Create product with duplicate SKU in same organization (409 Conflict)
    # -------------------------------------------------------------------------
    print("\n[Test 2] Reject duplicate SKU within same organization (409 Conflict)...")
    res2 = client.post("/api/products", json=payload1, headers=headers_a)
    print(f"Status Code: {res2.status_code}, Response: {res2.text}")
    assert res2.status_code == 409, f"Expected 409, got {res2.status_code}"
    assert "already exists" in res2.json()["detail"].lower()
    print(" PASS: Duplicate SKU in same organization correctly rejected with HTTP 409")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 3: Same SKU in a different organization is allowed (201 Created)
    # -------------------------------------------------------------------------
    print("\n[Test 3] Allow same SKU in a different organization (Tenant Isolation)...")
    payload_b = {
        "name": "Beta's Version of Widget",
        "sku": "SKU-WIDGET-001",  # Identical SKU to Org A's product
        "quantity_on_hand": 2,
        "selling_price": "55.00",
    }
    res3 = client.post("/api/products", json=payload_b, headers=headers_b)
    print(f"Status Code: {res3.status_code}")
    assert res3.status_code == 201, f"Expected 201 for different org, got {res3.status_code}: {res3.text}"
    prod_b = res3.json()
    assert prod_b["organization_id"] == org_b_id
    assert prod_b["sku"] == "SKU-WIDGET-001"
    # Low stock logic check: quantity 2 <= default 5 -> is_low_stock True
    assert prod_b["is_low_stock"] is True
    prod_b_id = prod_b["id"]
    print(f" PASS: Same SKU permitted in Org B (Product id={prod_b_id})")
    passed_tests += 1

    # Create additional products in Org A for search and pagination tests
    extra_products_payloads = [
        {"name": "Heavy Duty Sprocket", "sku": "SKU-SPROCKET-002", "quantity_on_hand": 4, "low_stock_threshold": 10},
        {"name": "Hydraulic Valve", "sku": "SKU-VALVE-003", "quantity_on_hand": 20, "cost_price": "12.00", "selling_price": "29.00"},
        {"name": "Precision Bearing", "sku": "SKU-BEARING-004", "quantity_on_hand": 0},
    ]
    for p in extra_products_payloads:
        client.post("/api/products", json=p, headers=headers_a)

    # -------------------------------------------------------------------------
    # Test 4: List only current organization's products (Data Isolation)
    # -------------------------------------------------------------------------
    print("\n[Test 4] List products strictly scoped to current tenant...")
    res4 = client.get("/api/products", headers=headers_a)
    assert res4.status_code == 200, f"Expected 200, got {res4.status_code}"
    list_a = res4.json()
    assert list_a["total"] == 4  # Org A created 4 products
    for item in list_a["items"]:
        assert item["organization_id"] == org_a_id
        assert item["id"] != prod_b_id
    print(f" PASS: Org A returned only its 4 products; Org B product excluded.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 5: Search by product name
    # -------------------------------------------------------------------------
    print("\n[Test 5] Search by product name (GET /api/products?search=hydraulic)...")
    res5 = client.get("/api/products?search=hydraulic", headers=headers_a)
    assert res5.status_code == 200
    data5 = res5.json()
    assert data5["total"] == 1
    assert data5["items"][0]["sku"] == "SKU-VALVE-003"
    assert "Hydraulic Valve" in data5["items"][0]["name"]
    print(f" PASS: Name search returned exact expected record.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 6: Search by SKU
    # -------------------------------------------------------------------------
    print("\n[Test 6] Search by SKU (GET /api/products?search=SPROCKET-002)...")
    res6 = client.get("/api/products?search=SPROCKET-002", headers=headers_a)
    assert res6.status_code == 200
    data6 = res6.json()
    assert data6["total"] == 1
    assert data6["items"][0]["name"] == "Heavy Duty Sprocket"
    print(f" PASS: SKU search returned exact expected record.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 7: Get existing product
    # -------------------------------------------------------------------------
    print(f"\n[Test 7] Get product details by ID (GET /api/products/{prod1_id})...")
    res7 = client.get(f"/api/products/{prod1_id}", headers=headers_a)
    assert res7.status_code == 200
    data7 = res7.json()
    assert data7["id"] == prod1_id
    assert data7["name"] == "Industrial Widget A1"
    print(f" PASS: Product {prod1_id} retrieved successfully.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 8: Get another organization's product (404 Not Found)
    # -------------------------------------------------------------------------
    print(f"\n[Test 8] Prevent cross-tenant access to another org's product (GET /api/products/{prod_b_id})...")
    # Org A tries to fetch Org B's product
    res8 = client.get(f"/api/products/{prod_b_id}", headers=headers_a)
    print(f"Status Code: {res8.status_code}, Response: {res8.text}")
    assert res8.status_code == 404, f"Expected 404, got {res8.status_code}"
    print(" PASS: Cross-tenant product access properly rejected with HTTP 404.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 9: Update product
    # -------------------------------------------------------------------------
    print(f"\n[Test 9] Update product (PUT /api/products/{prod1_id})...")
    update_payload = {
        "name": "Industrial Widget A1 (Upgraded)",
        "sku": "SKU-WIDGET-001",
        "description": "Updated high-grade industrial component",
        "quantity_on_hand": 3,  # Changed quantity to 3 (<= threshold 5) -> now low stock!
        "cost_price": "26.00",
        "selling_price": "54.99",
        "low_stock_threshold": 5,
    }
    res9 = client.put(f"/api/products/{prod1_id}", json=update_payload, headers=headers_a)
    assert res9.status_code == 200, f"Expected 200, got {res9.status_code}: {res9.text}"
    updated = res9.json()
    assert updated["name"] == "Industrial Widget A1 (Upgraded)"
    assert updated["quantity_on_hand"] == 3
    assert updated["is_low_stock"] is True
    print(f" PASS: Product updated successfully and low-stock recalculation verified.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 10: Update product with duplicate SKU (409 Conflict)
    # -------------------------------------------------------------------------
    print(f"\n[Test 10] Reject update with duplicate SKU (PUT /api/products/{prod1_id})...")
    conflict_update = {
        "name": "Should Fail",
        "sku": "SKU-SPROCKET-002",  # Already taken by another product in Org A
        "quantity_on_hand": 10,
    }
    res10 = client.put(f"/api/products/{prod1_id}", json=conflict_update, headers=headers_a)
    print(f"Status Code: {res10.status_code}, Response: {res10.text}")
    assert res10.status_code == 409, f"Expected 409, got {res10.status_code}"
    print(" PASS: Duplicate SKU on update correctly rejected with HTTP 409.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 11: Delete product (204 No Content)
    # -------------------------------------------------------------------------
    print(f"\n[Test 11] Delete product (DELETE /api/products/{prod1_id})...")
    res11 = client.delete(f"/api/products/{prod1_id}", headers=headers_a)
    print(f"Status Code: {res11.status_code}")
    assert res11.status_code == 204, f"Expected 204, got {res11.status_code}"

    # Verify subsequent GET returns 404
    get_deleted = client.get(f"/api/products/{prod1_id}", headers=headers_a)
    assert get_deleted.status_code == 404
    print(" PASS: Product deleted with HTTP 204 and no longer retrievable (404).")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 12: Reject negative quantity and prices (422 Unprocessable Entity)
    # -------------------------------------------------------------------------
    print("\n[Test 12] Validation rejects negative numbers (422 Unprocessable Entity)...")
    neg_qty = client.post(
        "/api/products",
        json={"name": "Bad Product", "sku": "BAD-QTY", "quantity_on_hand": -5},
        headers=headers_a,
    )
    assert neg_qty.status_code == 422, f"Expected 422 for negative qty, got {neg_qty.status_code}"

    neg_price = client.post(
        "/api/products",
        json={"name": "Bad Product", "sku": "BAD-PRICE", "cost_price": "-10.00"},
        headers=headers_a,
    )
    assert neg_price.status_code == 422, f"Expected 422 for negative cost price, got {neg_price.status_code}"

    neg_threshold = client.post(
        "/api/products",
        json={"name": "Bad Product", "sku": "BAD-THRESHOLD", "low_stock_threshold": -2},
        headers=headers_a,
    )
    assert neg_threshold.status_code == 422, f"Expected 422 for negative threshold, got {neg_threshold.status_code}"
    print(" PASS: Negative quantity, price, and threshold all rejected with HTTP 422.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 13: Reject requests without JWT (401 Unauthorized)
    # -------------------------------------------------------------------------
    print("\n[Test 13] Reject unauthenticated requests (401 Unauthorized)...")
    unauth_list = client.get("/api/products")
    assert unauth_list.status_code == 401
    unauth_post = client.post("/api/products", json={"name": "Unauth", "sku": "UNAUTH"})
    assert unauth_post.status_code == 401
    print(" PASS: Unauthenticated access rejected with HTTP 401.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 14: Pagination works correctly
    # -------------------------------------------------------------------------
    print("\n[Test 14] Pagination mechanics (page=1&page_size=2 vs page=2&page_size=2)...")
    res_page1 = client.get("/api/products?page=1&page_size=2", headers=headers_a)
    assert res_page1.status_code == 200
    p1_data = res_page1.json()
    assert p1_data["page"] == 1
    assert p1_data["page_size"] == 2
    assert p1_data["total"] == 3  # Remaining 3 products in Org A
    assert p1_data["total_pages"] == 2
    assert len(p1_data["items"]) == 2

    res_page2 = client.get("/api/products?page=2&page_size=2", headers=headers_a)
    assert res_page2.status_code == 200
    p2_data = res_page2.json()
    assert p2_data["page"] == 2
    assert len(p2_data["items"]) == 1
    assert p2_data["items"][0]["id"] != p1_data["items"][0]["id"]
    print(" PASS: Pagination correctly slices items, counts total pages, and respects page_size.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Cleanup
    # -------------------------------------------------------------------------
    cleanup_test_db()
    print("\nTest data cleanup completed.")

    print("\n" + "=" * 75)
    print(f"SUMMARY: ALL {passed_tests}/{total_tests} PRODUCT TESTS PASSED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    try:
        run_product_tests()
    except Exception as exc:
        print(f"\nTEST SUITE FAILED: {exc}")
        sys.exit(1)
