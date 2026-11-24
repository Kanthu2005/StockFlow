"""Comprehensive test suite for StockFlow Step 5: Backend Authentication."""

import sys
from datetime import timedelta
import httpx
from sqlalchemy import text
from app.core.config import settings
from app.core.security import create_access_token
from app.database.session import SessionLocal

BASE_URL = "http://127.0.0.1:8000"

TEST_EMAIL = "test_owner@stockflow-demo.io"
TEST_PASSWORD = "StrongPassword2026!"
TEST_ORG = "StockFlow Logistics Ltd"


def clean_database():
    """Clean up test data from stockflow_db."""
    with SessionLocal() as db:
        db.execute(text("DELETE FROM users WHERE email = :email"), {"email": TEST_EMAIL})
        db.execute(text("DELETE FROM organizations WHERE name = :name"), {"name": TEST_ORG})
        db.commit()


def run_tests():
    print("=" * 70)
    print("STOCKFLOW STEP 5: AUTHENTICATION MODULE VERIFICATION SUITE")
    print("=" * 70)

    clean_database()
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    passed_tests = 0
    total_tests = 9

    # -------------------------------------------------------------
    # Test 1: Registration success
    # -------------------------------------------------------------
    print("\n[Test 1] POST /api/auth/register (Success Scenario)...")
    reg_payload = {
        "email": f"  {TEST_EMAIL.upper()}  ",  # tests normalization
        "password": TEST_PASSWORD,
        "organization_name": f"  {TEST_ORG}  ",
    }
    res1 = client.post("/api/auth/register", json=reg_payload)
    print(f"Status Code: {res1.status_code}")
    assert res1.status_code == 201, f"Expected 201, got {res1.status_code}: {res1.text}"
    data1 = res1.json()
    assert "access_token" in data1 and data1["access_token"]
    assert data1["token_type"].lower() == "bearer"
    user_info = data1["user"]
    assert user_info["email"] == TEST_EMAIL.lower()
    assert user_info["organization_name"] == TEST_ORG
    assert "hashed_password" not in user_info
    assert "password" not in user_info
    valid_token = data1["access_token"]
    user_id = user_info["id"]
    org_id = user_info["organization_id"]
    print(f" PASS: Registered user id={user_id}, org_id={org_id}, token issued.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 2: Duplicate email registration rejected
    # -------------------------------------------------------------
    print("\n[Test 2] POST /api/auth/register (Duplicate Email Prevention)...")
    res2 = client.post(
        "/api/auth/register",
        json={
            "email": TEST_EMAIL.lower(),
            "password": "AnotherPassword123!",
            "organization_name": "Different Org",
        },
    )
    print(f"Status Code: {res2.status_code}, Response: {res2.text}")
    assert res2.status_code == 400, f"Expected 400, got {res2.status_code}"
    assert "already exists" in res2.json()["detail"].lower()
    print(" PASS: Duplicate email registration successfully rejected with HTTP 400.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 3: Login success with valid credentials
    # -------------------------------------------------------------
    print("\n[Test 3] POST /api/auth/login (Valid Credentials)...")
    res3 = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL.upper(), "password": TEST_PASSWORD},
    )
    print(f"Status Code: {res3.status_code}")
    assert res3.status_code == 200, f"Expected 200, got {res3.status_code}: {res3.text}"
    data3 = res3.json()
    assert "access_token" in data3 and data3["access_token"]
    assert data3["user"]["email"] == TEST_EMAIL.lower()
    assert data3["user"]["organization_id"] == org_id
    assert "hashed_password" not in data3["user"]
    login_token = data3["access_token"]
    print(" PASS: Login succeeded and valid JWT token returned.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 4: Login failure with incorrect password
    # -------------------------------------------------------------
    print("\n[Test 4] POST /api/auth/login (Incorrect Password)...")
    res4 = client.post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": "WrongPassword999!"},
    )
    print(f"Status Code: {res4.status_code}, Detail: {res4.json().get('detail')}")
    assert res4.status_code == 401, f"Expected 401, got {res4.status_code}"
    assert res4.json()["detail"] == "Invalid email or password"
    print(" PASS: Incorrect password rejected with generic 401.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 5: Login failure with nonexistent email
    # -------------------------------------------------------------
    print("\n[Test 5] POST /api/auth/login (Unknown Email)...")
    res5 = client.post(
        "/api/auth/login",
        json={"email": "nonexistent_user_999@stockflow.io", "password": TEST_PASSWORD},
    )
    print(f"Status Code: {res5.status_code}, Detail: {res5.json().get('detail')}")
    assert res5.status_code == 401, f"Expected 401, got {res5.status_code}"
    assert res5.json()["detail"] == "Invalid email or password"
    print(" PASS: Nonexistent email rejected with identical generic 401.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 6: /api/auth/me with valid Bearer token
    # -------------------------------------------------------------
    print("\n[Test 6] GET /api/auth/me (Valid Bearer Token)...")
    res6 = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_token}"},
    )
    print(f"Status Code: {res6.status_code}, Data: {res6.json()}")
    assert res6.status_code == 200, f"Expected 200, got {res6.status_code}"
    data6 = res6.json()
    assert data6["id"] == user_id
    assert data6["email"] == TEST_EMAIL.lower()
    assert data6["organization_id"] == org_id
    assert data6["organization_name"] == TEST_ORG
    assert "hashed_password" not in data6
    print(" PASS: Current authenticated user details returned successfully.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 7: /api/auth/me failure without token
    # -------------------------------------------------------------
    print("\n[Test 7] GET /api/auth/me (Missing Token)...")
    res7 = client.get("/api/auth/me")
    print(f"Status Code: {res7.status_code}, Detail: {res7.json().get('detail')}")
    assert res7.status_code == 401, f"Expected 401, got {res7.status_code}"
    print(" PASS: Missing Authorization header rejected with HTTP 401.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 8: /api/auth/me failure with invalid/tampered token
    # -------------------------------------------------------------
    print("\n[Test 8] GET /api/auth/me (Invalid / Tampered Token)...")
    res8 = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"},
    )
    print(f"Status Code: {res8.status_code}, Detail: {res8.json().get('detail')}")
    assert res8.status_code == 401, f"Expected 401, got {res8.status_code}"
    print(" PASS: Invalid / tampered token rejected with HTTP 401.")
    passed_tests += 1

    # -------------------------------------------------------------
    # Test 9: /api/auth/me failure with expired token
    # -------------------------------------------------------------
    print("\n[Test 9] GET /api/auth/me (Expired Token)...")
    expired_token = create_access_token(
        subject=user_id,
        expires_delta=timedelta(minutes=-5),
    )
    res9 = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    print(f"Status Code: {res9.status_code}, Detail: {res9.json().get('detail')}")
    assert res9.status_code == 401, f"Expected 401, got {res9.status_code}"
    assert "expired" in res9.json()["detail"].lower()
    print(" PASS: Expired token rejected with HTTP 401 ('Token has expired').")
    passed_tests += 1

    # -------------------------------------------------------------
    # Bonus Validation Tests: Password length and empty fields
    # -------------------------------------------------------------
    print("\n[Bonus Validation] Input constraint checks...")
    # Password < 8 characters
    short_pw_res = client.post(
        "/api/auth/register",
        json={"email": "short@stockflow.io", "password": "123", "organization_name": "Test"},
    )
    assert short_pw_res.status_code == 422, f"Expected 422 for short password, got {short_pw_res.status_code}"
    print(" PASS: Password < 8 characters correctly rejected with HTTP 422.")

    # Empty organization name
    empty_org_res = client.post(
        "/api/auth/register",
        json={"email": "blank@stockflow.io", "password": "validpassword123", "organization_name": "   "},
    )
    assert empty_org_res.status_code == 422, f"Expected 422 for blank organization, got {empty_org_res.status_code}"
    print(" PASS: Blank organization name correctly rejected with HTTP 422.")

    # Clean up test data
    clean_database()
    print("\nTest data cleanup completed.")

    print("\n" + "=" * 70)
    print(f"SUMMARY: ALL {passed_tests}/{total_tests} CORE TESTS + VALIDATION CHECKS PASSED!")
    print("=" * 70)


if __name__ == "__main__":
    try:
        run_tests()
    except Exception as exc:
        print(f"\nTEST SUITE FAILED: {exc}")
        sys.exit(1)
