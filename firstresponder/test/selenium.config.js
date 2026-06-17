const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TIMEOUT = 10000;

// Create Chrome WebDriver
async function createDriver() {

  const options = new chrome.Options();

  // Run headless only in GitHub Actions
  if (process.env.CI) {
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
  } else {
    // Local Chrome location (Windows only)
    options.setChromeBinaryPath(
      'C:/Program Files/Google/Chrome/Application/chrome.exe'
    );
  }

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: TIMEOUT
  });

  return driver;
}

module.exports = {
  createDriver,
  BASE_URL,
  TIMEOUT
};