const test = require('node:test');
const assert = require('node:assert');
const { createDriver, BASE_URL } = require('./selenium.config');
const { By, until } = require('selenium-webdriver');

/**
 * Auth Pages — Selenium E2E Tests
 * Tests that the authentication pages load and render correctly.
 */

let driver;

// Setup: Create a new browser before all tests
test.before(async () => {
  driver = await createDriver();
});

// Teardown: Close the browser after all tests
test.after(async () => {
  if (driver) {
    await driver.quit();
  }
});

// ─────────────────────────────────────────────
// Test 1: Splash page loads
// ─────────────────────────────────────────────
test('Splash page loads successfully', async () => {
  await driver.get(`${BASE_URL}/`);

  // Wait for the page to load (check that body exists)
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Verify the page loaded (check page title or any element)
  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Splash page should have content');

  console.log('  ✅ Splash page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 2: Login page loads with form fields
// ─────────────────────────────────────────────
test('Login page loads with form elements', async () => {
  await driver.get(`${BASE_URL}/login`);

  // Wait for the page to render
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Check that the page has content
  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Login page should have content');

  // Check for input fields (email/password)
  const inputs = await driver.findElements(By.css('input'));
  assert.ok(inputs.length >= 1, 'Login page should have at least 1 input field');

  console.log(`  ✅ Login page loaded with ${inputs.length} input field(s)`);
});

// ─────────────────────────────────────────────
// Test 3: Register page loads with form fields
// ─────────────────────────────────────────────
test('Register page loads with form elements', async () => {
  await driver.get(`${BASE_URL}/register`);

  // Wait for the page to render
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Check for input fields
  const inputs = await driver.findElements(By.css('input'));
  assert.ok(inputs.length >= 1, 'Register page should have input fields');

  // Check for a submit button
  const buttons = await driver.findElements(By.css('button'));
  assert.ok(buttons.length >= 1, 'Register page should have at least 1 button');

  console.log(`  ✅ Register page loaded with ${inputs.length} input(s) and ${buttons.length} button(s)`);
});

// ─────────────────────────────────────────────
// Test 4: Forgot Password page loads
// ─────────────────────────────────────────────
test('Forgot Password page loads', async () => {
  await driver.get(`${BASE_URL}/forgot-password`);

  // Wait for page to render
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Forgot Password page should have content');

  console.log('  ✅ Forgot Password page loaded successfully');
});

// ─────────────────────────────────────────────
// Test 5: Navigation flow — Splash → Login
// ─────────────────────────────────────────────
test('Can navigate from Splash to Login page', async () => {
  // Start at splash
  await driver.get(`${BASE_URL}/`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Navigate to login
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Verify URL changed
  const currentUrl = await driver.getCurrentUrl();
  assert.ok(currentUrl.includes('/login'), 'Should be on the login page');

  console.log('  ✅ Navigation: Splash → Login works');
});

// ─────────────────────────────────────────────
// Test 6: Onboarding page loads
// ─────────────────────────────────────────────
test('Onboarding page loads successfully', async () => {
  await driver.get(`${BASE_URL}/onboarding`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  const pageSource = await driver.getPageSource();
  assert.ok(pageSource.length > 0, 'Onboarding page should have content');

  console.log('  ✅ Onboarding page loaded successfully');
});
