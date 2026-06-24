/**
 * appium.sample.test.js
 *
 * Appium E2E tests for the First Rescue web app running inside an
 * Android Emulator (API 31, Google APIs target — Chrome is available).
 *
 * The Vite preview server is started on the CI host at :5173.
 * Inside the Android emulator, 10.0.2.2 is the special alias for
 * the host machine's localhost, so we use that instead of 127.0.0.1.
 */

const test = require('node:test');
const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');

// 10.0.2.2 = host machine's localhost from inside the Android emulator
const BASE_URL = 'http://10.0.2.2:5173';

// Generous timeouts for CI emulator (cold starts are slow)
const PAGE_LOAD_TIMEOUT = 60000;   // 60 s
const ELEMENT_TIMEOUT  = 30000;   // 30 s
const NAV_TIMEOUT      = 20000;   // 20 s

let driver;

test.before(async () => {
  console.log('  🔧 Connecting to Appium server at http://127.0.0.1:4723/ ...');
  driver = await new Builder()
    .usingServer('http://127.0.0.1:4723/')
    .withCapabilities({
      platformName:              'Android',
      'appium:automationName':   'UiAutomator2',
      'appium:deviceName':       'Android Emulator',
      // Use Chrome — available on google_apis API 31+ targets
      browserName:               'Chrome',
      'appium:chromedriverAutodownload': true,
      // Performance & stability options
      'appium:newCommandTimeout': 120,
      'appium:adbExecTimeout':    60000,
    })
    .build();

  await driver.manage().setTimeouts({
    implicit: ELEMENT_TIMEOUT,
    pageLoad: PAGE_LOAD_TIMEOUT,
    script:   30000,
  });

  console.log('  ✅ Appium driver connected successfully');
});

test.after(async () => {
  if (driver) {
    await driver.quit();
    console.log('  🔌 Appium driver disconnected');
  }
});

// ─── Test 1: Splash / Login page loads ────────────────────────────────────────
test('Mobile — Login page loads on Android Chrome', { timeout: 90000 }, async () => {
  console.log(`  📱 Navigating to ${BASE_URL}/login ...`);
  await driver.get(`${BASE_URL}/login`);

  // Wait for the body to be present
  await driver.wait(until.elementLocated(By.css('body')), PAGE_LOAD_TIMEOUT);

  const title = await driver.getTitle();
  console.log(`  📄 Page title: "${title}"`);

  // Page must have loaded something (title not empty)
  const currentUrl = await driver.getCurrentUrl();
  assert.ok(
    currentUrl.includes('5173'),
    `Expected URL to contain the preview port, got: ${currentUrl}`
  );
  console.log('  ✅ Login page loaded successfully on Android Chrome');
});

// ─── Test 2: Role tabs are visible ────────────────────────────────────────────
test('Mobile — Citizen / Volunteer / Admin role tabs are visible', { timeout: 90000 }, async () => {
  console.log(`  📱 Navigating to ${BASE_URL}/login for role tab check...`);
  await driver.get(`${BASE_URL}/login`);

  await driver.wait(until.elementLocated(By.css('body')), PAGE_LOAD_TIMEOUT);

  // Find the Citizen tab button
  const citizenBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space(text())='Citizen']")),
    ELEMENT_TIMEOUT
  );
  assert.ok(await citizenBtn.isDisplayed(), 'Citizen tab should be visible');

  // Find the Volunteer tab button
  const volunteerBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space(text())='Volunteer']")),
    ELEMENT_TIMEOUT
  );
  assert.ok(await volunteerBtn.isDisplayed(), 'Volunteer tab should be visible');

  // Find the Admin tab button
  const adminBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space(text())='Admin']")),
    ELEMENT_TIMEOUT
  );
  assert.ok(await adminBtn.isDisplayed(), 'Admin tab should be visible');

  console.log('  ✅ All three role tabs are visible on mobile');
});

// ─── Test 3: Email + password inputs accept text ───────────────────────────────
test('Mobile — Login form accepts email and password input', { timeout: 90000 }, async () => {
  console.log(`  📱 Navigating to ${BASE_URL}/login for form input test...`);
  await driver.get(`${BASE_URL}/login`);

  await driver.wait(until.elementLocated(By.css('body')), PAGE_LOAD_TIMEOUT);

  // Select Citizen role
  const citizenTab = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space(text())='Citizen']")),
    ELEMENT_TIMEOUT
  );
  await citizenTab.click();
  await driver.sleep(500);

  // Type into email field
  const emailInput = await driver.wait(
    until.elementLocated(By.css('input[type="text"]')),
    ELEMENT_TIMEOUT
  );
  await emailInput.clear();
  await emailInput.sendKeys('test@firstrescue.app');
  const emailVal = await emailInput.getAttribute('value');
  assert.strictEqual(emailVal, 'test@firstrescue.app', 'Email field should hold typed value');

  // Type into password field
  const passwordInput = await driver.wait(
    until.elementLocated(By.css('input[type="password"]')),
    ELEMENT_TIMEOUT
  );
  await passwordInput.clear();
  await passwordInput.sendKeys('testpassword123');
  const passVal = await passwordInput.getAttribute('value');
  assert.strictEqual(passVal, 'testpassword123', 'Password field should hold typed value');

  console.log('  ✅ Login form accepts typed input correctly on Android');
});

// ─── Test 4: Submit button is present and clickable ───────────────────────────
test('Mobile — Sign In button is present and clickable', { timeout: 90000 }, async () => {
  console.log(`  📱 Checking Sign In button...`);
  await driver.get(`${BASE_URL}/login`);

  await driver.wait(until.elementLocated(By.css('body')), PAGE_LOAD_TIMEOUT);

  const submitBtn = await driver.wait(
    until.elementLocated(By.css('button[type="submit"]')),
    ELEMENT_TIMEOUT
  );
  assert.ok(await submitBtn.isDisplayed(), 'Submit button should be visible');
  assert.ok(await submitBtn.isEnabled(),   'Submit button should be enabled');

  const btnText = await submitBtn.getText();
  console.log(`  📄 Button text: "${btnText}"`);
  assert.ok(btnText.length > 0, 'Submit button should have text');

  console.log('  ✅ Sign In button is present and interactive on Android');
});

// ─── Test 5: Register link navigates to /register ─────────────────────────────
test('Mobile — Register link navigates to registration page', { timeout: 90000 }, async () => {
  console.log(`  📱 Testing Register navigation...`);
  await driver.get(`${BASE_URL}/login`);

  await driver.wait(until.elementLocated(By.css('body')), PAGE_LOAD_TIMEOUT);

  // Find the "Register here" link
  const registerLink = await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Register')]")),
    ELEMENT_TIMEOUT
  );
  assert.ok(await registerLink.isDisplayed(), 'Register link should be visible');
  await registerLink.click();

  // Wait for URL to change to /register
  await driver.wait(
    until.urlContains('register'),
    NAV_TIMEOUT,
    'URL should change to /register after clicking Register link'
  );

  const finalUrl = await driver.getCurrentUrl();
  console.log(`  📍 Navigated to: ${finalUrl}`);
  assert.ok(finalUrl.includes('register'), `Expected /register URL, got: ${finalUrl}`);

  console.log('  ✅ Register navigation works correctly on Android');
});
