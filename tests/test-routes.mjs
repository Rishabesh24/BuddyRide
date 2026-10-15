// Route Verification Script
const routes = [
  '/',
  '/rides',
  '/rides/ride-sf-sjc-01',
  '/bookings',
  '/driver',
  '/driver/publish',
  '/profile',
  '/admin',
  '/api/rides',
  '/api/rides/search?originLat=37.77&originLng=-122.41&destLat=37.33&destLng=-121.89',
  '/api/notifications',
  '/api/admin/stats',
  '/api/admin/reports',
];

async function verifyRoutes() {
  console.log('Verifying RouteShare Application Endpoints on http://localhost:3000:');
  let passed = 0;
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const text = await res.text();
      console.log(`[${res.status}] ${route} (${text.length} bytes)`);
      if (res.status === 200) passed++;
    } catch (err) {
      console.error(`[FAIL] ${route}:`, err.message);
    }
  }
  console.log(`\nResult: ${passed}/${routes.length} endpoints responded with HTTP 200 OK.`);
}

verifyRoutes();
