"""Comprehensive verification test suite for StockFlow Step 7: Dashboard Summary & Low-Stock APIs.

Tests all 10 mandatory test scenarios:
1. Summary with no products (returns zeros)
2. Summary with multiple products
3. Total quantity calculation
4. Low-stock count calculation
5. Product-specific threshold
6. Organization default threshold when product threshold is NULL
7. Product above threshold is excluded
8. Product at threshold is included
9. Products from another organization are excluded (multi-tenant isolation)
10. Unauthorized request is rejected (401)
"""

import sys
import httpx
from sqlalchemy import text
from app.database.session import SessionLocal

BASE_URL = "http://127.0.0.1:8000"

TENANT_1_EMAIL = "dash_tenant1@stockflow-test.io"
TENANT_2_EMAIL = "dash_tenant2@stockflow-test.io"
TEST_PASSWORD = "StrongPassword2026!"
TENANT_1_NAME = "Apex Supplies Ltd"
TENANT_2_NAME = "Vortex Retail Corp"


def cleanup_test_db():
    """Clean up test users, organizations, and cascading products."""
    with SessionLocal() as db:
        db.execute(text("DELETE FROM users WHERE email IN (:t1, :t2)"), {"t1": TENANT_1_EMAIL, "t2": TENANT_2_EMAIL})
        db.execute(text("DELETE FROM organizations WHERE name IN (:t1, :t2)"), {"t1": TENANT_1_NAME, "t2": TENANT_2_NAME})
        db.commit()


def run_dashboard_tests():
    print("=" * 75)
    print("STOCKFLOW STEP 7: DASHBOARD & LOW-STOCK APIS VERIFICATION SUITE")
    print("=" * 75)

    cleanup_test_db()
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # -------------------------------------------------------------------------
    # Setup: Register Tenant 1 and Tenant 2
    # -------------------------------------------------------------------------
    print("\n[Setup] Registering Tenant 1 (Apex) and Tenant 2 (Vortex)...")
    res1 = client.post(
        "/api/auth/register",
        json={"email": TENANT_1_EMAIL, "password": TEST_PASSWORD, "organization_name": TENANT_1_NAME},
    )
    assert res1.status_code == 201
    token1 = res1.json()["access_token"]
    org1_id = res1.json()["user"]["organization_id"]

    res2 = client.post(
        "/api/auth/register",
        json={"email": TENANT_2_EMAIL, "password": TEST_PASSWORD, "organization_name": TENANT_2_NAME},
    )
    assert res2.status_code == 201
    token2 = res2.json()["access_token"]
    org2_id = res2.json()["user"]["organization_id"]

    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    passed_tests = 0
    total_tests = 10

    # -------------------------------------------------------------------------
    # Test 1: Summary with no products (returns zeros)
    # -------------------------------------------------------------------------
    print("\n[Test 1] GET /api/dashboard/summary with zero products...")
    sum0_res = client.get("/api/dashboard/summary", headers=headers1)
    print(f"Status Code: {sum0_res.status_code}, Response: {sum0_res.text}")
    assert sum0_res.status_code == 200
    sum0 = sum0_res.json()
    assert sum0["total_products"] == 0
    assert sum0["total_quantity"] == 0
    assert sum0["low_stock_count"] == 0

    # Also test empty low-stock list
    low0_res = client.get("/api/dashboard/low-stock", headers=headers1)
    assert low0_res.status_code == 200
    low0 = low0_res.json()
    assert low0["items"] == []
    assert low0["total"] == 0
    print(" PASS: Zero products safely returns 0 totals and empty low-stock list.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Create test products for Tenant 1:
    # Org 1 default threshold is 5 (from organizations table default).
    #
    # Product A: custom threshold=10, qty=8  -> LOW STOCK (8 <= 10) [Test 5]
    # Product B: threshold=None,   qty=5  -> LOW STOCK (5 <= default 5) [Test 6, Test 8 at threshold]
    # Product C: threshold=None,   qty=6  -> ABOVE THRESHOLD (6 > 5) [Test 7 excluded]
    # Product D: custom threshold=2,  qty=50 -> ABOVE THRESHOLD (50 > 2)
    # Total products = 4, Total quantity = 8 + 5 + 6 + 50 = 69
    # Low stock count = 2 (Product A, Product B)
    # -------------------------------------------------------------------------
    print("\n[Setup] Populating products for Tenant 1...")
    pA = client.post("/api/products", json={"name": "A-Grade Filter", "sku": "SKU-A", "quantity_on_hand": 8, "low_stock_threshold": 10}, headers=headers1).json()
    pB = client.post("/api/products", json={"name": "B-Grade Gasket", "sku": "SKU-B", "quantity_on_hand": 5}, headers=headers1).json()  # threshold None -> org default 5
    pC = client.post("/api/products", json={"name": "C-Grade O-Ring", "sku": "SKU-C", "quantity_on_hand": 6}, headers=headers1).json()  # threshold None -> org default 5
    pD = client.post("/api/products", json={"name": "D-Grade Screw", "sku": "SKU-D", "quantity_on_hand": 50, "low_stock_threshold": 2}, headers=headers1).json()

    # Create 1 product in Tenant 2 for tenant isolation checks
    # Tenant 2: qty=1, threshold=None (default 5) -> low stock for Tenant 2
    p_t2 = client.post("/api/products", json={"name": "Tenant2 Item", "sku": "SKU-T2", "quantity_on_hand": 1}, headers=headers2).json()

    # -------------------------------------------------------------------------
    # Test 2: Summary with multiple products
    # -------------------------------------------------------------------------
    print("\n[Test 2] GET /api/dashboard/summary with multiple products...")
    sum_res = client.get("/api/dashboard/summary", headers=headers1)
    assert sum_res.status_code == 200
    sum_data = sum_res.json()
    print(f"Summary: {sum_data}")
    assert sum_data["total_products"] == 4
    print(" PASS: Correct total_products count (4).")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 3: Total quantity calculation
    # -------------------------------------------------------------------------
    print("\n[Test 3] Verify total_quantity sum across products...")
    # Expected: 8 + 5 + 6 + 50 = 69
    assert sum_data["total_quantity"] == 69
    print(f" PASS: Total quantity is exactly 69 (8 + 5 + 6 + 50).")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 4: Low-stock count calculation
    # -------------------------------------------------------------------------
    print("\n[Test 4] Verify low_stock_count...")
    # Expected: 2 (pA: 8 <= 10, pB: 5 <= 5)
    assert sum_data["low_stock_count"] == 2
    print(" PASS: low_stock_count is exactly 2.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Fetch low-stock list for detailed checks
    # -------------------------------------------------------------------------
    low_res = client.get("/api/dashboard/low-stock", headers=headers1)
    assert low_res.status_code == 200
    low_items = low_res.json()["items"]
    low_skus = [i["sku"] for i in low_items]

    # -------------------------------------------------------------------------
    # Test 5: Product-specific threshold
    # -------------------------------------------------------------------------
    print("\n[Test 5] Verify product-specific threshold (SKU-A with custom threshold 10, qty 8)...")
    item_a = next(i for i in low_items if i["sku"] == "SKU-A")
    assert item_a["quantity_on_hand"] == 8
    assert item_a["effective_threshold"] == 10
    print(" PASS: Product-specific threshold evaluated correctly (effective_threshold=10).")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 6: Organization default threshold when product threshold is NULL
    # -------------------------------------------------------------------------
    print("\n[Test 6] Verify fallback to organization default threshold (SKU-B)...")
    item_b = next(i for i in low_items if i["sku"] == "SKU-B")
    assert item_b["quantity_on_hand"] == 5
    assert item_b["effective_threshold"] == 5  # Org default
    print(" PASS: Fallback to organization default threshold verified (effective_threshold=5).")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 7: Product above threshold is excluded
    # -------------------------------------------------------------------------
    print("\n[Test 7] Verify products above threshold (SKU-C with qty 6 > 5) are excluded...")
    assert "SKU-C" not in low_skus
    assert "SKU-D" not in low_skus
    print(" PASS: Products with quantity > effective_threshold are excluded from low-stock list.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 8: Product at threshold is included (boundary condition: qty == threshold)
    # -------------------------------------------------------------------------
    print("\n[Test 8] Verify boundary condition: quantity == effective_threshold is included...")
    # SKU-B has quantity 5 and threshold 5 -> 5 <= 5 must be included!
    assert "SKU-B" in low_skus
    print(" PASS: Exact threshold boundary (qty == threshold) is included.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 9: Products from another organization are excluded
    # -------------------------------------------------------------------------
    print("\n[Test 9] Verify multi-tenant isolation...")
    # Tenant 1 low-stock list must NOT contain Tenant 2's item
    assert "SKU-T2" not in low_skus

    # Tenant 2 summary must only reflect its own 1 product
    sum2 = client.get("/api/dashboard/summary", headers=headers2).json()
    assert sum2["total_products"] == 1
    assert sum2["total_quantity"] == 1
    assert sum2["low_stock_count"] == 1

    # Tenant 2 low stock must only contain SKU-T2
    low2 = client.get("/api/dashboard/low-stock", headers=headers2).json()
    assert low2["total"] == 1
    assert low2["items"][0]["sku"] == "SKU-T2"
    print(" PASS: Multi-tenant isolation verified across summary and low-stock endpoints.")
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Test 10: Unauthorized request is rejected (401)
    # -------------------------------------------------------------------------
    print("\n[Test 10] Verify unauthenticated requests are rejected with 401...")
    unauth_sum = client.get("/api/dashboard/summary")
    assert unauth_sum.status_code == 401
    unauth_low = client.get("/api/dashboard/low-stock")
    assert unauth_low.status_code == 401
    print(" PASS: Unauthenticated access rejected with HTTP 401.")
    passed_tests += 1

    # Cleanup
    cleanup_test_db()
    print("\nTest data cleanup completed.")

    print("\n" + "=" * 75)
    print(f"SUMMARY: ALL {passed_tests}/{total_tests} DASHBOARD TESTS PASSED!")
    print("=" * 75)


if __name__ == "__main__":
    try:
        run_dashboard_tests()
    except Exception as exc:
        print(f"\nTEST SUITE FAILED: {exc}")
        sys.exit(1)
