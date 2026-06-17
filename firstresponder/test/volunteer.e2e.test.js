const test = require('node:test');
const assert = require('node:assert');
const { createDriver, BASE_URL } = require('./selenium.config');
const { By, until } = require('selenium-webdriver');

/**
 * Volunteer Pages — Selenium E2E Tests
 * Tests that volunteer-facing pages load and render correctly.
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
// Test 1: Volunteer Register page loads
// ─────────────────────────────────────────────
test('Volunteer Register page loads successfully', async () => {
  await driver.get(`${BASE_URL}/volunteer-register`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Volunteer Register page should have content');

  console.log(`  ✅ Volunteer Register page loaded`);
});

// ─────────────────────────────────────────────
// Test 2: Volunteer Home page loads
// ─────────────────────────────────────────────
test('Volunteer Home page loads successfully', async () => {
  await driver.get(`${BASE_URL}/volunteer-home`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Volunteer Home page should have content');

  console.log('  ✅ Volunteer Home page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 3: SOS Screen page loads
// ─────────────────────────────────────────────
test('SOS Screen page loads successfully', async () => {
  await driver.get(`${BASE_URL}/sos`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'SOS Screen page should have content');

  console.log('  ✅ SOS Screen page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 4: Rescue History page loads
// ─────────────────────────────────────────────
test('Rescue History page loads successfully', async () => {
  await driver.get(`${BASE_URL}/rescue-history`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Rescue History page should have content');

  console.log('  ✅ Rescue History page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 5: Cert Upload page loads
// ─────────────────────────────────────────────
test('Cert Upload page loads successfully', async () => {
  await driver.get(`${BASE_URL}/cert-upload`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Cert Upload page should have content');

  console.log('  ✅ Cert Upload page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 6: Incoming Alert page loads
// ─────────────────────────────────────────────
test('Incoming Alert page loads successfully', async () => {
  await driver.get(`${BASE_URL}/alert/incoming`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Incoming Alert page should have content');

  console.log('  ✅ Incoming Alert page loaded successfully');
});
