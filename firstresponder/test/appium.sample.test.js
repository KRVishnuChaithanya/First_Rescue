const test = require('node:test');
const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');

// Assuming you are running Vite on localhost:5173 
// You must use 10.0.2.2 instead of localhost to access your laptop's localhost from the Android Emulator!
const BASE_URL = 'http://10.0.2.2:5173';

let driver;

test.before(async () => {
  // Connect to the local Appium server
  driver = await new Builder()
    .usingServer('http://127.0.0.1:4723/') // Appium Server URL
    .withCapabilities({
      "platformName": "Android",
      "appium:automationName": "UiAutomator2",
      "browserName": "Browser", // generic AOSP browser (Chrome is not in default CI emulators)
      "appium:deviceName": "Android Emulator",
      // Optional: Add specific device UDID if needed
      // "appium:udid": "emulator-5554" 
    })
    .build();
});

test.after(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('Mobile Citizen Dashboard should load successfully', { timeout: 60000 }, async () => {
  console.log(`  📱 Navigating to ${BASE_URL}/login on Android Emulator...`);
  await driver.get(`${BASE_URL}/login`);

  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Example interaction
  const citizenTab = await driver.findElement(By.xpath("//button[normalize-space(text())='Citizen']"));
  await citizenTab.click();
  
  const emailInput = await driver.findElement(By.css('input[type="text"]'));
  await emailInput.sendKeys('e2ecitizen@test.com');
  
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  await passwordInput.sendKeys('password123');
  
  const loginBtn = await driver.findElement(By.css('button[type="submit"]'));
  await loginBtn.click();
  
  await driver.sleep(2000); // Wait for transition
  
  const currentUrl = await driver.getCurrentUrl();
  assert.ok(currentUrl.includes('citizen-home'), 'Should navigate to citizen home');
  console.log('  ✅ Mobile Appium test passed successfully');
});
