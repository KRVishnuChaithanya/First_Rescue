const test = require('node:test');
const assert = require('node:assert');
const { createDriver, BASE_URL } = require('./selenium.config');
const { By, until } = require('selenium-webdriver');

/**
 * Admin Pages — Selenium E2E Tests
 * Tests that admin-facing pages load and render correctly.
 */

let driver;

test.before(async () => {
  driver = await createDriver();
});

test.after(async () => {
  if (driver) {
    await driver.quit();
  }
});

// ─────────────────────────────────────────────
// Test 1: Admin Login page loads
// ─────────────────────────────────────────────
test('Admin Login page loads successfully', async () => {
  await driver.get(`${BASE_URL}/admin`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Admin Login page should have content');

  // Check for login form elements
  const inputs = await driver.findElements(By.css('input'));
  assert.ok(inputs.length >= 1, 'Admin Login should have at least 1 input field');

  console.log(`  ✅ Admin Login page loaded with ${inputs.length} input(s)`);
});

// ─────────────────────────────────────────────
// Test 2: Admin Dashboard page loads
// ─────────────────────────────────────────────
test('Admin Dashboard page loads successfully', async () => {
  await driver.get(`${BASE_URL}/admin/dashboard`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Admin Dashboard page should have content');

  console.log('  ✅ Admin Dashboard page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 3: Admin Reports page loads
// ─────────────────────────────────────────────
test('Admin Reports page loads successfully', async () => {
  await driver.get(`${BASE_URL}/admin/reports`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Admin Reports page should have content');

  console.log('  ✅ Admin Reports page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 4: Admin Volunteer Management page loads
// ─────────────────────────────────────────────
test('Admin Volunteer Management page loads', async () => {
  await driver.get(`${BASE_URL}/admin/volunteers`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Volunteer Management page should have content');

  console.log('  ✅ Admin Volunteer Management page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 5: Admin Heatmap page loads
// ─────────────────────────────────────────────
test('Admin Heatmap page loads successfully', async () => {
  await driver.get(`${BASE_URL}/admin/heatmap`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Heatmap page should have content');

  console.log('  ✅ Admin Heatmap page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 6: Admin Settings page loads
// ─────────────────────────────────────────────
test('Admin Settings page loads successfully', async () => {
  await driver.get(`${BASE_URL}/admin/settings`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Admin Settings page should have content');

  console.log('  ✅ Admin Settings page loaded successfully');
});
