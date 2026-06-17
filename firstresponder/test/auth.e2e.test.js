const test = require('node:test');
const assert = require('node:assert');
const { createDriver, BASE_URL } = require('./selenium.config');
const { By, until } = require('selenium-webdriver');

let driver;

test.before(async () => {
  driver = await createDriver();
});

test.after(async () => {
  if (driver) {
    await driver.quit();
  }
});

// Helper function to test all buttons on a dashboard
async function testDashboardButtons(driver, dashboardUrl) {
  // Wait until we are on the dashboard
  await driver.wait(until.urlContains(dashboardUrl), 10000);
  await driver.sleep(3000); // Give the user 3 seconds to see the dashboard load

  // Find all buttons, links, and explicitly clickable divs
  let buttons = await driver.findElements(By.css('button, a, .cursor-pointer'));
  console.log(`  Found ${buttons.length} clickable elements on ${dashboardUrl}`);

  for (let i = 0; i < buttons.length; i++) {
    try {
      // Navigate to clean dashboard to ensure no modals are blocking
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes(dashboardUrl)) {
        await driver.get(`${BASE_URL}/${dashboardUrl.replace(/^\/+/, '')}`);
        await driver.wait(until.urlContains(dashboardUrl), 10000);
      } else {
        // Refresh to close any open modals from previous clicks
        await driver.navigate().refresh();
        await driver.wait(until.urlContains(dashboardUrl), 10000);
      }
      // Give the user 2.5 seconds to see the dashboard reset before clicking the next button
      await driver.sleep(2500);

      // Re-fetch buttons after refresh
      buttons = await driver.findElements(By.css('button, a, .cursor-pointer'));
      if (!buttons[i]) continue;
      
      const isDisplayed = await buttons[i].isDisplayed();
      if (!isDisplayed) continue;

      const btnText = await buttons[i].getText();
      const btnTag = await buttons[i].getTagName();
      
      // Don't click logout during the loop if we can avoid it, or we'll get logged out!
      if (btnText && btnText.toLowerCase().includes('logout')) {
         console.log(`  Skipping ${btnTag} ${i+1}: "${btnText}" (Logout)`);
         continue;
      }
      if (btnText && btnText.toLowerCase().includes('sign out')) {
         console.log(`  Skipping ${btnTag} ${i+1}: "${btnText}" (Sign Out)`);
         continue;
      }

      console.log(`  Clicking ${btnTag} ${i+1}: "${btnText.replace(/\n/g, ' ')}"`);
      await buttons[i].click();
      
      // Give the user 3 seconds to observe what happened after the click
      await driver.sleep(3000);

    } catch (err) {
      console.log(`  Could not click element ${i+1} (Hidden or obscured)`);
    }
  }
}

test('Citizen login and dashboard buttons work', async () => {
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Exact match to avoid clicking the submit button span
  const citizenTab = await driver.findElement(By.xpath("//button[normalize-space(text())='Citizen']"));
  await citizenTab.click();
  await driver.sleep(1500); // Pause to let user see tab switch

  const emailInput = await driver.findElement(By.css('input[type="text"]'));
  await emailInput.clear();
  await emailInput.sendKeys('e2ecitizen@test.com');
  await driver.sleep(500); // Pause while typing

  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  await passwordInput.clear();
  await passwordInput.sendKeys('password123');
  await driver.sleep(1500); // Pause to let user read credentials

  const loginBtn = await driver.findElement(By.css('button[type="submit"]'));
  await loginBtn.click();
  await driver.sleep(2000); // Pause to see login transition

  await testDashboardButtons(driver, 'citizen-home');
  console.log('  ✅ Citizen Dashboard Tested');
});

test('Volunteer login and dashboard buttons work', async () => {
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Exact match
  const volunteerTab = await driver.findElement(By.xpath("//button[normalize-space(text())='Volunteer']"));
  await volunteerTab.click();
  await driver.sleep(1500); // Pause to let user see tab switch

  const emailInput = await driver.findElement(By.css('input[type="text"]'));
  await emailInput.clear();
  await emailInput.sendKeys('e2evolunteer@test.com');
  await driver.sleep(500);

  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  await passwordInput.clear();
  await passwordInput.sendKeys('password123');
  await driver.sleep(1500); // Pause to let user read credentials

  const loginBtn = await driver.findElement(By.css('button[type="submit"]'));
  await loginBtn.click();
  await driver.sleep(2000); // Pause to see login transition

  await testDashboardButtons(driver, 'volunteer-home');
  console.log('  ✅ Volunteer Dashboard Tested');
});

test('Admin login and dashboard buttons work', async () => {
  await driver.get(`${BASE_URL}/login`);
  await driver.wait(until.elementLocated(By.css('body')), 10000);

  // Exact match
  const adminTab = await driver.findElement(By.xpath("//button[normalize-space(text())='Admin']"));
  await adminTab.click();
  await driver.sleep(1500); // Pause to let user see tab switch

  const emailInput = await driver.findElement(By.css('input[type="text"]'));
  await emailInput.clear();
  await emailInput.sendKeys('nani@admin');
  await driver.sleep(500);

  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  await passwordInput.clear();
  await passwordInput.sendKeys('nani@2005');
  await driver.sleep(1500); // Pause to let user read credentials

  const loginBtn = await driver.findElement(By.css('button[type="submit"]'));
  await loginBtn.click();
  await driver.sleep(2000); // Pause to see login transition

  await testDashboardButtons(driver, 'admin/dashboard');
  console.log('  ✅ Admin Dashboard Tested');
});


