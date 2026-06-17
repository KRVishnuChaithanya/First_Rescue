const test = require('node:test');
const assert = require('node:assert');
const { createDriver, BASE_URL } = require('./selenium.config');
const { By, until } = require('selenium-webdriver');

/**
 * Citizen Pages — Selenium E2E Tests
 * Tests that citizen-facing pages load and render correctly.
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
// Test 1: Citizen Home page loads
// ─────────────────────────────────────────────
test('Citizen Home page loads successfully', async () => {
  await driver.get(`${BASE_URL}/citizen-home`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Citizen Home page should have content');

  console.log('  ✅ Citizen Home page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 2: Hospital Finder page loads
// ─────────────────────────────────────────────
test('Hospital Finder page loads successfully', async () => {
  await driver.get(`${BASE_URL}/hospitals`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Hospital Finder page should have content');

  console.log('  ✅ Hospital Finder page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 3: First Aid List page loads
// ─────────────────────────────────────────────
test('First Aid List page loads successfully', async () => {
  await driver.get(`${BASE_URL}/first-aid`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'First Aid List page should have content');

  console.log('  ✅ First Aid List page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 4: Report Step 1 page loads
// ─────────────────────────────────────────────
test('Report Step 1 page loads successfully', async () => {
  await driver.get(`${BASE_URL}/report/step1`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Report Step 1 page should have content');

  console.log('  ✅ Report Step 1 page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 5: Citizen History page loads
// ─────────────────────────────────────────────
test('Citizen History page loads successfully', async () => {
  await driver.get(`${BASE_URL}/citizen-history`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Citizen History page should have content');

  console.log('  ✅ Citizen History page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 6: Multiple citizen pages navigation
// ─────────────────────────────────────────────
test('Can navigate between citizen pages', async () => {
  // Visit citizen home — wait for React Router to settle on the URL
  await driver.get(`${BASE_URL}/citizen-home`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);
  await driver.wait(until.urlContains('/citizen-home'), 5000);
  let url = await driver.getCurrentUrl();
  assert.ok(url.includes('/citizen-home'), 'Should be on citizen home');

  // Navigate to hospitals
  await driver.get(`${BASE_URL}/hospitals`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);
  await driver.wait(until.urlContains('/hospitals'), 5000);
  url = await driver.getCurrentUrl();
  assert.ok(url.includes('/hospitals'), 'Should be on hospitals page');

  // Navigate to first aid
  await driver.get(`${BASE_URL}/first-aid`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);
  await driver.wait(until.urlContains('/first-aid'), 5000);
  url = await driver.getCurrentUrl();
  assert.ok(url.includes('/first-aid'), 'Should be on first aid page');

  console.log('  ✅ Citizen page navigation works');
});
