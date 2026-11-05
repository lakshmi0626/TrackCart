import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log("==========================================");
console.log("  TrackCart Frontend Verification Suite   ");
console.log("==========================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// Test 1: Production bundle exists
test('Production dist/index.html was built', () => {
  assert.ok(fs.existsSync('dist/index.html'), 'dist/index.html missing');
});

// Test 2: Assets generated
test('Production CSS and JS bundle files generated', () => {
  const assets = fs.readdirSync('dist/assets');
  assert.ok(assets.some(f => f.endsWith('.js')), 'No JS assets found');
  assert.ok(assets.some(f => f.endsWith('.css')), 'No CSS assets found');
});

// Test 3: API client service contract
test('API client exports complete REST modules', async () => {
  const apiModule = await import('./src/services/api.js');
  const api = apiModule.api;
  assert.ok(api.auth, 'api.auth missing');
  assert.ok(api.orders, 'api.orders missing');
  assert.ok(api.shipments, 'api.shipments missing');
  assert.ok(api.deliveryPartners, 'api.deliveryPartners missing');
  assert.ok(api.complaints, 'api.complaints missing');
  assert.ok(api.analytics, 'api.analytics missing');
  assert.ok(api.notifications, 'api.notifications missing');
  assert.ok(api.seed, 'api.seed missing');
});

// Test 4: All required pages exist
test('All required application views and dashboards exist on disk', () => {
  const requiredFiles = [
    'src/pages/auth/LoginPage.jsx',
    'src/pages/auth/RegisterPage.jsx',
    'src/pages/customer/CustomerDashboard.jsx',
    'src/pages/customer/CreateOrderPage.jsx',
    'src/pages/customer/CustomerOrdersPage.jsx',
    'src/pages/customer/CustomerComplaintsPage.jsx',
    'src/pages/admin/AdminDashboard.jsx',
    'src/pages/admin/AdminOrdersPage.jsx',
    'src/pages/admin/AdminShipmentsPage.jsx',
    'src/pages/admin/AdminCustomersPage.jsx',
    'src/pages/admin/AdminPartnersPage.jsx',
    'src/pages/admin/AdminComplaintsPage.jsx',
    'src/pages/admin/AdminReportsPage.jsx',
    'src/pages/admin/AdminAuditLogsPage.jsx',
    'src/pages/partner/PartnerDashboard.jsx',
    'src/pages/partner/PartnerDeliveriesPage.jsx',
    'src/pages/partner/PartnerHistoryPage.jsx',
    'src/pages/tracking/TrackingPage.jsx',
    'src/pages/ProfilePage.jsx',
    'src/components/tracking/TrackingTimeline.jsx',
    'src/components/layout/Navbar.jsx',
    'src/components/layout/Sidebar.jsx',
    'src/components/layout/AppLayout.jsx',
  ];

  for (const file of requiredFiles) {
    assert.ok(fs.existsSync(file), `Required component missing: ${file}`);
  }
});

console.log(`\nResults: ${passed}/${total} test assertions passed.\n`);
if (passed !== total) process.exit(1);
