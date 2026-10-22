// Automated API test suite for Campus Lost & Found Portal
// Runs against the live backend server
const http = require('http');
const app = require('../app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = 5099; // Dedicated test port
let server;
let baseUrl = `http://127.0.0.1:${PORT}/api`;

let adminToken = '';
let studentToken = '';
let testItemId = '';
let testClaimId = '';

const testsPassed = [];
const testsFailed = [];

const assert = (condition, message) => {
  if (condition) {
    testsPassed.push(message);
    console.log(`  [PASS] ${message}`);
  } else {
    testsFailed.push(message);
    console.error(`  [FAIL] ${message}`);
  }
};

const runSuite = async () => {
  console.log('========================================================');
  console.log('  Campus Lost & Found Portal - Automated API Test Suite ');
  console.log('========================================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found');
    server = app.listen(PORT);
    console.log(`Test server running at ${baseUrl}\n`);

    // 1. Health check
    console.log('[1] Testing System Health Check...');
    const resHealth = await fetch(`${baseUrl}/health`);
    const dataHealth = await resHealth.json();
    assert(resHealth.status === 200 && dataHealth.status === 'healthy', 'GET /api/health returns 200 and healthy status');

    // 2. Authentication - Admin Login
    console.log('\n[2] Testing Authentication...');
    const resAdminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@campus.edu',
        password: 'AdminPass123!'
      })
    });
    const dataAdminLogin = await resAdminLogin.json();
    assert(resAdminLogin.status === 200 && !!dataAdminLogin.token, 'POST /api/auth/login admin login succeeds and returns JWT');
    adminToken = dataAdminLogin.token;

    // 3. Authentication - Register New Student
    const testEmail = `tester.${Date.now()}@college.edu`;
    const resRegister = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Tester',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'Information Technology',
        role: 'student'
      })
    });
    const dataRegister = await resRegister.json();
    assert(resRegister.status === 201 && !!dataRegister.token, 'POST /api/auth/register creates new student and returns JWT');
    studentToken = dataRegister.token;

    // 4. Authentication - Verify /me
    const resMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataMe = await resMe.json();
    assert(resMe.status === 200 && dataMe.user.email === testEmail, 'GET /api/auth/me returns authenticated student profile');

    // 5. Items - List all items
    console.log('\n[3] Testing Item Management...');
    const resItems = await fetch(`${baseUrl}/items`);
    const dataItems = await resItems.json();
    assert(resItems.status === 200 && Array.isArray(dataItems.items), 'GET /api/items returns list of active campus items');
    assert(dataItems.total >= 6, `GET /api/items returned total count of ${dataItems.total} seeded items`);

    // 6. Items - Search & Filter
    const resSearch = await fetch(`${baseUrl}/items?search=AirPods&reportType=lost`);
    const dataSearch = await resSearch.json();
    assert(resSearch.status === 200 && dataSearch.items.length >= 1, 'GET /api/items with search and reportType filters works accurately');

    // 7. Items - Create a new Lost Item
    const resCreate = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Water Bottle - HydroFlask Navy Blue',
        description: 'Lost my insulated stainless steel navy blue water bottle during basketball practice.',
        category: 'Other',
        reportType: 'lost',
        campusLocation: 'Sports Complex',
        locationDetails: 'Bleachers near court 1',
        identifyingDetails: 'Scratch on the cap and sticker saying "Never Give Up"',
        contactPreference: 'email'
      })
    });
    const dataCreate = await resCreate.json();
    assert(resCreate.status === 201 && !!dataCreate.item._id, 'POST /api/items successfully creates new item report');
    testItemId = dataCreate.item._id;

    // 8. Items - Fetch single item by ID
    const resSingle = await fetch(`${baseUrl}/items/${testItemId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataSingle = await resSingle.json();
    assert(resSingle.status === 200 && dataSingle.item.title.includes('HydroFlask'), 'GET /api/items/:id retrieves correct item details');
    assert(dataSingle.isOwner === true, 'GET /api/items/:id correctly identifies current user as owner');
    assert(!!dataSingle.item.identifyingDetails, 'Owner receives private identifyingDetails');

    // 9. Items - Update item
    const resUpdate = await fetch(`${baseUrl}/items/${testItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        locationDetails: 'Bleachers near court 1, under row 2'
      })
    });
    const dataUpdate = await resUpdate.json();
    assert(resUpdate.status === 200 && dataUpdate.item.locationDetails.includes('under row 2'), 'PUT /api/items/:id updates owned item fields');

    // 10. Items - Unauthorized modification check
    const resUnauthorizedUpdate = await fetch(`${baseUrl}/items/${testItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        // No auth header
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(resUnauthorizedUpdate.status === 401, 'Unauthorized PUT /api/items/:id without token is rejected with 401');

    // 11. Claims - Submit claim (student claims seeded found item)
    console.log('\n[4] Testing Claims & Recovery Workflow...');
    // Seeded found item #2
    const foundItem = dataItems.items.find(i => i.reportType === 'found' && i.status === 'found');
    assert(!!foundItem, 'Found seeded found item to test claim submission');

    const resClaim = await fetch(`${baseUrl}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        itemId: foundItem._id,
        message: 'This is my notebook and calculator left after lunch!',
        identifyingEvidence: 'Formula list on page 23 and my name written on inside cover.',
        claimantContact: '+91 99999 88888'
      })
    });
    const dataClaim = await resClaim.json();
    assert(resClaim.status === 201 && !!dataClaim.claim._id, 'POST /api/claims successfully creates pending claim');
    testClaimId = dataClaim.claim._id;

    // 12. Claims - Get current user claims
    const resMyClaims = await fetch(`${baseUrl}/claims/mine`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const dataMyClaims = await resMyClaims.json();
    assert(resMyClaims.status === 200 && dataMyClaims.claims.length >= 1, 'GET /api/claims/mine returns claimant submitted claims');

    // 13. Admin - Access Control (Student trying to access admin route)
    console.log('\n[5] Testing Role-based Access Control (RBAC)...');
    const resForbiddenAdmin = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resForbiddenAdmin.status === 403, 'Regular student accessing /api/admin/stats is blocked with 403 Forbidden');

    // 14. Admin - Statistics Dashboard
    console.log('\n[6] Testing Administrator Moderation...');
    const resAdminStats = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataAdminStats = await resAdminStats.json();
    assert(resAdminStats.status === 200 && dataAdminStats.stats.totalItems > 0, 'GET /api/admin/stats returns real database aggregates');
    assert(dataAdminStats.stats.recoveryRate >= 0, `Admin stats returns calculated recovery rate (${dataAdminStats.stats.recoveryRate}%)`);

    // 15. Admin - Moderate item
    const resModerate = await fetch(`${baseUrl}/admin/items/${testItemId}/moderate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        isModerated: false,
        moderationNote: 'Verified by Administrator'
      })
    });
    const dataModerate = await resModerate.json();
    assert(resModerate.status === 200 && dataModerate.item.moderationNote === 'Verified by Administrator', 'PATCH /api/admin/items/:id/moderate successfully updates moderation note');

    // 16. Cleanup - Delete test item
    console.log('\n[7] Testing Deletion & Cleanup...');
    const resDelete = await fetch(`${baseUrl}/items/${testItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(resDelete.status === 200, 'DELETE /api/items/:id deletes owned item report');

    console.log('\n========================================================');
    console.log(`  Tests Passed: ${testsPassed.length} | Tests Failed: ${testsFailed.length}`);
    console.log('========================================================\n');

    server.close();
    await mongoose.connection.close();

    if (testsFailed.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runSuite();
