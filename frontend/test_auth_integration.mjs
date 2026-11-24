/**
 * Frontend-Backend Authentication Integration Verification Script
 * Validates the exact contracts and flows implemented in authService and AuthContext:
 * 1. Register a new user with an organization name.
 * 2. Confirm registration succeeds and JWT token + user profile returned.
 * 3. Verify session restoration via GET /auth/me with the Bearer token.
 * 4. Verify login with the registered credentials.
 * 5. Verify incorrect credentials return a 401 error with a clean message.
 * 6. Verify duplicate registration email is rejected with a 400 error.
 * 7. Verify invalid/expired token on /auth/me returns 401.
 */

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TEST_EMAIL = `frontend_user_${Date.now()}@stockflow-demo.io`;
const TEST_PASSWORD = 'StrongPassword2026!';
const TEST_ORG = 'Frontend Automated Testing Org';

async function runIntegrationTests() {
  console.log('='.repeat(75));
  console.log('STOCKFLOW STEP 8: FRONTEND AUTHENTICATION INTEGRATION SUITE');
  console.log('='.repeat(75));

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true, // Don't throw so we can inspect status codes
  });

  let passed = 0;
  let total = 7;

  // 1. Register new user
  console.log('\n[1] Testing Registration (POST /auth/register)...');
  const regRes = await client.post('/auth/register', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    organization_name: TEST_ORG,
  });
  console.log(`Status: ${regRes.status}`);
  if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  const { access_token, user } = regRes.data;
  if (!access_token || !user) throw new Error('Missing token or user in registration response');
  if (user.email !== TEST_EMAIL.toLowerCase()) throw new Error('Email mismatch');
  if (user.organization_name !== TEST_ORG) throw new Error('Organization name mismatch');
  console.log(` PASS: Successfully registered user id=${user.id}, org=${user.organization_name}`);
  passed++;

  // 2. Validate session restoration via /auth/me
  console.log('\n[2] Testing Session Restoration (GET /auth/me with Bearer token)...');
  const meRes = await client.get('/auth/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  console.log(`Status: ${meRes.status}`);
  if (meRes.status !== 200) throw new Error(`Failed to restore session: ${JSON.stringify(meRes.data)}`);
  if (meRes.data.id !== user.id || meRes.data.email !== user.email) throw new Error('Session profile mismatch');
  console.log(` PASS: Session restored successfully (user id=${meRes.data.id}, email=${meRes.data.email})`);
  passed++;

  // 3. Test Login with registered credentials
  console.log('\n[3] Testing Login (POST /auth/login with valid credentials)...');
  const loginRes = await client.post('/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  console.log(`Status: ${loginRes.status}`);
  if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
  const loginToken = loginRes.data.access_token;
  if (!loginToken) throw new Error('Missing access_token in login response');
  console.log(` PASS: Login succeeded and new JWT token returned.`);
  passed++;

  // 4. Test Login with incorrect credentials
  console.log('\n[4] Testing Login with incorrect password (POST /auth/login)...');
  const badLoginRes = await client.post('/auth/login', {
    email: TEST_EMAIL,
    password: 'WrongPassword123!',
  });
  console.log(`Status: ${badLoginRes.status}, Detail: ${badLoginRes.data?.detail}`);
  if (badLoginRes.status !== 401) throw new Error(`Expected 401, got ${badLoginRes.status}`);
  if (!badLoginRes.data?.detail?.toLowerCase().includes('invalid')) throw new Error('Expected invalid credentials detail');
  console.log(` PASS: Incorrect password rejected with HTTP 401.`);
  passed++;

  // 5. Test Duplicate Registration Prevention
  console.log('\n[5] Testing Duplicate Email Registration (POST /auth/register)...');
  const dupRes = await client.post('/auth/register', {
    email: TEST_EMAIL,
    password: 'AnotherPassword123!',
    organization_name: 'Another Org',
  });
  console.log(`Status: ${dupRes.status}, Detail: ${dupRes.data?.detail}`);
  if (dupRes.status !== 400) throw new Error(`Expected 400, got ${dupRes.status}`);
  if (!dupRes.data?.detail?.toLowerCase().includes('already exists')) throw new Error('Expected duplicate email detail');
  console.log(` PASS: Duplicate registration email rejected with HTTP 400.`);
  passed++;

  // 6. Test /auth/me with invalid / missing token
  console.log('\n[6] Testing /auth/me without token...');
  const noTokenRes = await client.get('/auth/me');
  console.log(`Status: ${noTokenRes.status}`);
  if (noTokenRes.status !== 401) throw new Error(`Expected 401, got ${noTokenRes.status}`);
  console.log(` PASS: Unauthenticated /auth/me properly rejected with HTTP 401.`);
  passed++;

  // 7. Test /auth/me with invalid token signature
  console.log('\n[7] Testing /auth/me with invalid token signature...');
  const badTokenRes = await client.get('/auth/me', {
    headers: { Authorization: 'Bearer invalid.jwt.token' },
  });
  console.log(`Status: ${badTokenRes.status}`);
  if (badTokenRes.status !== 401) throw new Error(`Expected 401, got ${badTokenRes.status}`);
  console.log(` PASS: Tampered token properly rejected with HTTP 401.`);
  passed++;

  console.log('\n' + '='.repeat(75));
  console.log(`SUMMARY: ALL ${passed}/${total} FRONTEND INTEGRATION CONTRACTS VERIFIED!`);
  console.log('='.repeat(75));
}

runIntegrationTests().catch((err) => {
  console.error('\nINTEGRATION TEST FAILED:', err.message);
  process.exit(1);
});
