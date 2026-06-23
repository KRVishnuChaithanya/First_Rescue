const test = require('node:test');
const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Use localhost since we are using Chrome Mobile Emulation directly on the host machine
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

let driver;

test.before(async () => {
  const options = new chrome.Options();
  options.setMobileEmulation({ deviceName: 'iPhone X' });
  
  if (process.env.CI) {
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
  } else {
    options.setChromeBinaryPath('C:/Program Files/Google/Chrome/Application/chrome.exe');
    options.addArguments('--headless=new'); // Headless to avoid popups, remove if you want to see it
  }

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
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
