/**
 * Frontend Product Integration Verification Script
 * Validates the full Product CRUD flow as wired into productService and the UI screens:
 * 1. Authenticate / register tenant user.
 * 2. Add product (POST /products).
 * 3. Fetch product list (GET /products).
 * 4. Search by product name.
 * 5. Search by SKU.
 * 6. Update product (PUT /products/{id}) and change quantity.
 * 7. Verify dynamic low-stock evaluation.
 * 8. Reject duplicate SKU with 409 Conflict.
 * 9. Verify pagination parameters.
 * 10. Delete product (DELETE /products/{id}) and confirm removal.
 * 11. Reject unauthenticated requests with 401.
 */

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TEST_EMAIL = `prod_integ_${Date.now()}@stockflow-demo.io`;
const TEST_PASSWORD = 'StrongPassword2026!';
const TEST_ORG = 'Product Integration Test Logistics';

async function runProductIntegrationTests() {
  console.log('='.repeat(75));
  console.log('STOCKFLOW STEP 9: PRODUCT MANAGEMENT FRONTEND INTEGRATION TEST');
  console.log('='.repeat(75));

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  // Step 1: Register Tenant User
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

  // Step 2: Add Product
  console.log('\n[2] Creating Product 1 (POST /products)...');
  const prod1Res = await client.post(
    '/products',
    {
      name: 'Industrial Optical Sensor',
      sku: 'SNS-OPT-001',
      description: 'Precision laser sensor',
      quantity_on_hand: 12,
      cost_price: 45.0,
      selling_price: 89.99,
      low_stock_threshold: 10,
    },
    { headers: authHeaders }
  );
  console.log(`Status: ${prod1Res.status}`);
  if (prod1Res.status !== 201) throw new Error(`Create failed: ${JSON.stringify(prod1Res.data)}`);
  const prod1 = prod1Res.data;
  console.log(` PASS: Created product id=${prod1.id}, is_low_stock=${prod1.is_low_stock} (12 > 10)`);
  if (prod1.is_low_stock !== false) throw new Error('Expected is_low_stock to be false');

  // Step 3: List Products
  console.log('\n[3] Fetching products list (GET /products)...');
  const listRes = await client.get('/products', { headers: authHeaders });
  if (listRes.status !== 200) throw new Error(`List failed: ${JSON.stringify(listRes.data)}`);
  if (listRes.data.total !== 1 || listRes.data.items[0].id !== prod1.id) throw new Error('List content mismatch');
  console.log(` PASS: Retrieved 1 product in catalogue (id=${prod1.id})`);

  // Step 4: Search by Product Name
  console.log('\n[4] Searching by product name (GET /products?search=optical)...');
  const searchNameRes = await client.get('/products?search=optical', { headers: authHeaders });
  if (searchNameRes.data.total !== 1 || searchNameRes.data.items[0].sku !== 'SNS-OPT-001') {
    throw new Error('Name search failed');
  }
  console.log(` PASS: Name search returned "${searchNameRes.data.items[0].name}"`);

  // Step 5: Search by SKU
  console.log('\n[5] Searching by SKU (GET /products?search=SNS-OPT-001)...');
  const searchSkuRes = await client.get('/products?search=SNS-OPT-001', { headers: authHeaders });
  if (searchSkuRes.data.total !== 1 || searchSkuRes.data.items[0].id !== prod1.id) {
    throw new Error('SKU search failed');
  }
  console.log(` PASS: SKU search returned product id=${searchSkuRes.data.items[0].id}`);

  // Step 6: Update Product & Change Quantity (triggers low stock)
  console.log('\n[6] Updating product quantity from 12 to 5 (PUT /products/:id)...');
  const updateRes = await client.put(
    `/products/${prod1.id}`,
    {
      name: 'Industrial Optical Sensor v2',
      sku: 'SNS-OPT-001',
      description: 'Updated laser sensor',
      quantity_on_hand: 5, // Now <= threshold 10 -> is_low_stock must be true
      cost_price: 45.0,
      selling_price: 95.0,
      low_stock_threshold: 10,
    },
    { headers: authHeaders }
  );
  if (updateRes.status !== 200) throw new Error(`Update failed: ${JSON.stringify(updateRes.data)}`);
  const updatedProd = updateRes.data;
  if (updatedProd.quantity_on_hand !== 5) throw new Error('Quantity not updated');
  if (updatedProd.is_low_stock !== true) throw new Error('Low stock status not recomputed (5 <= 10)');
  console.log(` PASS: Product updated: qty=${updatedProd.quantity_on_hand}, is_low_stock=${updatedProd.is_low_stock}`);

  // Step 7: Duplicate SKU Rejection
  console.log('\n[7] Attempting to create duplicate SKU in same organization...');
  const dupRes = await client.post(
    '/products',
    {
      name: 'Duplicate Sensor',
      sku: 'SNS-OPT-001',
      quantity_on_hand: 1,
    },
    { headers: authHeaders }
  );
  console.log(`Status: ${dupRes.status}, Detail: ${dupRes.data?.detail}`);
  if (dupRes.status !== 409) throw new Error(`Expected 409 for duplicate SKU, got ${dupRes.status}`);
  console.log(' PASS: Duplicate SKU properly rejected with HTTP 409 Conflict.');

  // Step 8: Add second product and test pagination
  console.log('\n[8] Creating second product & verifying pagination...');
  await client.post(
    '/products',
    {
      name: 'Fiber Optic Cable M12',
      sku: 'CBL-FBR-002',
      quantity_on_hand: 50,
      selling_price: 15.5,
    },
    { headers: authHeaders }
  );
  const p1Res = await client.get('/products?page=1&page_size=1', { headers: authHeaders });
  if (p1Res.data.total !== 2 || p1Res.data.items.length !== 1 || p1Res.data.total_pages !== 2) {
    throw new Error('Pagination page 1 failed');
  }
  const p2Res = await client.get('/products?page=2&page_size=1', { headers: authHeaders });
  if (p2Res.data.items.length !== 1 || p2Res.data.items[0].id === p1Res.data.items[0].id) {
    throw new Error('Pagination page 2 failed');
  }
  console.log(' PASS: Pagination correctly split 2 items across 2 pages.');

  // Step 9: Delete Product
  console.log(`\n[9] Deleting product id=${prod1.id} (DELETE /products/:id)...`);
  const delRes = await client.delete(`/products/${prod1.id}`, { headers: authHeaders });
  console.log(`Status: ${delRes.status}`);
  if (delRes.status !== 204) throw new Error(`Expected 204, got ${delRes.status}`);

  // Confirm deleted item is no longer returned
  const getDeleted = await client.get(`/products/${prod1.id}`, { headers: authHeaders });
  if (getDeleted.status !== 404) throw new Error(`Expected 404 for deleted product, got ${getDeleted.status}`);
  console.log(' PASS: Product deleted with HTTP 204; subsequent GET returns 404.');

  // Step 10: Reject Unauthenticated Requests
  console.log('\n[10] Verifying unauthenticated requests are rejected...');
  const unauthRes = await client.get('/products');
  if (unauthRes.status !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
  console.log(' PASS: Unauthenticated access rejected with HTTP 401.');

  console.log('\n' + '='.repeat(75));
  console.log('SUMMARY: ALL 10/10 FRONTEND PRODUCT MANAGEMENT CONTRACTS VERIFIED!');
  console.log('='.repeat(75));
}

runProductIntegrationTests().catch((err) => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
