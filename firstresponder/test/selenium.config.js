const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TIMEOUT = 10000; // 10 seconds

/**
 * Creates a Selenium WebDriver instance for Chrome.
 * Uses headless mode when running in CI (GitHub Actions).
 * Uses normal mode when running locally (so you can see the browser).
 */
async function createDriver() {
  const options = new chrome.Options();

  // Run headless in CI, normal mode locally
  if (process.env.CI) {
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
  } else {
    options.addArguments('--window-size=1280,900');
  }

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  // Set implicit wait timeout
  await driver.manage().setTimeouts({ implicit: TIMEOUT });

  return driver;
}

module.exports = { createDriver, BASE_URL, TIMEOUT };
