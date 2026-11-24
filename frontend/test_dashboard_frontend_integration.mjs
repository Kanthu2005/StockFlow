/**
 * Frontend Dashboard Integration Test Script
 * Validates the complete dashboard lifecycle:
 * 1. Initial empty state (zeros).
 * 2. Summary update on product creation.
 * 3. Accurate total_quantity summation.
 * 4. Accurate low_stock_count calculation.
 * 5. Inclusion of items at or below threshold.
 * 6. Exclusion of items above threshold.
 * 7. Summary update after product edit.
 * 8. Summary update after product deletion.
 * 9. Unauthenticated request protection.
 */

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TEST_EMAIL = `dash_integ_${Date.now()}@stockflow-demo.io`;
const TEST_PASSWORD = 'StrongPassword2026!';
const TEST_ORG = 'Dashboard Frontend Integration Corp';

async function runDashboardIntegrationTests() {
  console.log('='.repeat(75));
  console.log('STOCKFLOW STEP 10: DASHBOARD FRONTEND INTEGRATION TEST');
  console.log('='.repeat(75));

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  // Step 1: Register Tenant
  console.log('\n[1] Registering tenant user...');
  const regRes = await client.post('/auth/register', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    organization_name: TEST_ORG,
  });
  if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  const token = regRes.data.access_token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log(` PASS: Authenticated user id=${regRes.data.user.id}, org=${regRes.data.user.organization_name}`);

  // Step 2: Empty Dashboard State
  console.log('\n[2] Checking initial empty dashboard summary & low-stock...');
  const sum0 = await client.get('/dashboard/summary', { headers: authHeaders });
  const low0 = await client.get('/dashboard/low-stock', { headers: authHeaders });
  if (sum0.status !== 200 || low0.status !== 200) throw new Error('Initial fetch failed');
  if (sum0.data.total_products !== 0 || sum0.data.total_quantity !== 0 || sum0.data.low_stock_count !== 0) {
    throw new Error(`Expected zero summary, got: ${JSON.stringify(sum0.data)}`);
  }
  if (low0.data.items.length !== 0 || low0.data.total !== 0) {
    throw new Error(`Expected empty low stock items, got: ${JSON.stringify(low0.data)}`);
  }
  console.log(' PASS: Initial dashboard summary returns zeros and empty low-stock list.');

  // Step 3: Create Product 1 (Normal Stock: Qty 50, Threshold 10)
  console.log('\n[3] Creating Product 1 (above threshold: Qty 50, Threshold 10)...');
  const p1Res = await client.post(
    '/products',
    { name: 'Server Rack 42U', sku: 'RCK-42U', quantity_on_hand: 50, low_stock_threshold: 10 },
    { headers: authHeaders }
  );
  if (p1Res.status !== 201) throw new Error('Product 1 creation failed');
  const p1 = p1Res.data;

  // Verify Summary: total_products=1, total_quantity=50, low_stock_count=0
  const sum1 = await client.get('/dashboard/summary', { headers: authHeaders });
  if (sum1.data.total_products !== 1 || sum1.data.total_quantity !== 50 || sum1.data.low_stock_count !== 0) {
    throw new Error(`Summary 1 mismatch: ${JSON.stringify(sum1.data)}`);
  }
  console.log(' PASS: Summary updated: total_products=1, total_quantity=50, low_stock_count=0');

  // Step 4: Create Product 2 (At Threshold Boundary: Qty 5, Threshold 5)
  console.log('\n[4] Creating Product 2 (at boundary: Qty 5, Threshold 5)...');
  const p2Res = await client.post(
    '/products',
    { name: 'Cat6 Patch Cable', sku: 'CBL-CAT6', quantity_on_hand: 5, low_stock_threshold: 5 },
    { headers: authHeaders }
  );
  if (p2Res.status !== 201) throw new Error('Product 2 creation failed');
  const p2 = p2Res.data;

  // Step 5: Create Product 3 (Below Default Threshold: Qty 2, Threshold None -> Org default 5)
  console.log('\n[5] Creating Product 3 (below default threshold: Qty 2, Threshold null)...');
  const p3Res = await client.post(
    '/products',
    { name: 'Network Switch 8P', sku: 'SW-8P', quantity_on_hand: 2 },
    { headers: authHeaders }
  );
  if (p3Res.status !== 201) throw new Error('Product 3 creation failed');
  const p3 = p3Res.data;

  // Step 6: Verify Summary with 3 Products
  console.log('\n[6] Verifying updated dashboard summary with 3 products...');
  const sum3 = await client.get('/dashboard/summary', { headers: authHeaders });
  // total = 3, quantity = 50 + 5 + 2 = 57, low_stock_count = 2 (p2, p3)
  if (sum3.data.total_products !== 3 || sum3.data.total_quantity !== 57 || sum3.data.low_stock_count !== 2) {
    throw new Error(`Summary 3 mismatch: ${JSON.stringify(sum3.data)}`);
  }
  console.log(` PASS: Summary matches: products=3, quantity=57, low_stock=2`);

  // Step 7: Verify Low-Stock List Content and Sorting
  console.log('\n[7] Verifying low-stock items list (GET /dashboard/low-stock)...');
  const low3 = await client.get('/dashboard/low-stock', { headers: authHeaders });
  if (low3.data.total !== 2 || low3.data.items.length !== 2) {
    throw new Error(`Low stock count mismatch: ${JSON.stringify(low3.data)}`);
  }
  // Check sorting: lowest quantity first (p3 with qty 2, then p2 with qty 5)
  if (low3.data.items[0].id !== p3.id || low3.data.items[1].id !== p2.id) {
    throw new Error(`Sorting mismatch: ${JSON.stringify(low3.data.items)}`);
  }
  // Verify Product 1 (qty 50 > 10) is excluded
  const itemIds = low3.data.items.map((i) => i.id);
  if (itemIds.includes(p1.id)) {
    throw new Error('Product 1 (above threshold) should NOT appear in low-stock list');
  }
  console.log(' PASS: Low-stock list correctly contains items at or below threshold, sorted by quantity ASC.');

  // Step 8: Edit Product 1 (Drop quantity to 8 <= threshold 10)
  console.log('\n[8] Editing Product 1 quantity from 50 to 8 (becomes low stock)...');
  await client.put(
    `/products/${p1.id}`,
    { name: p1.name, sku: p1.sku, quantity_on_hand: 8, low_stock_threshold: 10 },
    { headers: authHeaders }
  );

  const sumAfterEdit = await client.get('/dashboard/summary', { headers: authHeaders });
  // quantity = 8 + 5 + 2 = 15, low_stock_count = 3
  if (sumAfterEdit.data.total_quantity !== 15 || sumAfterEdit.data.low_stock_count !== 3) {
    throw new Error(`Summary after edit mismatch: ${JSON.stringify(sumAfterEdit.data)}`);
  }
  console.log(' PASS: Dashboard summary automatically reflected product edit (qty=15, low_stock=3).');

  // Step 9: Delete Product 2
  console.log(`\n[9] Deleting Product 2 (id=${p2.id})...`);
  await client.delete(`/products/${p2.id}`, { headers: authHeaders });

  const sumAfterDel = await client.get('/dashboard/summary', { headers: authHeaders });
  // total = 2, quantity = 8 + 2 = 10, low_stock_count = 2
  if (sumAfterDel.data.total_products !== 2 || sumAfterDel.data.total_quantity !== 10 || sumAfterDel.data.low_stock_count !== 2) {
    throw new Error(`Summary after delete mismatch: ${JSON.stringify(sumAfterDel.data)}`);
  }
  console.log(' PASS: Dashboard summary automatically reflected product deletion (products=2, qty=10, low_stock=2).');

  // Step 10: Verify Unauthenticated Request Protection
  console.log('\n[10] Verifying unauthenticated requests to dashboard endpoints...');
  const unauthSum = await client.get('/dashboard/summary');
  const unauthLow = await client.get('/dashboard/low-stock');
  if (unauthSum.status !== 401 || unauthLow.status !== 401) {
    throw new Error('Unauthenticated requests were not rejected with 401');
  }
  console.log(' PASS: Unauthenticated access rejected with HTTP 401.');

  console.log('\n' + '='.repeat(75));
  console.log('SUMMARY: ALL 10/10 DASHBOARD FRONTEND INTEGRATION CONTRACTS VERIFIED!');
  console.log('='.repeat(75));
}

runDashboardIntegrationTests().catch((err) => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
