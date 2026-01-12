const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Start game
  await page.locator('input[type="text"]').first().fill('Player 1');
  await page.locator('button:has-text("Start Game")').click();
  await page.waitForTimeout(2000);

  console.log('Clicking volume icon...');
  await page.locator('.volumeIcon').click();
  await page.waitForTimeout(1000);

  // Check what's in the DOM
  const html = await page.evaluate(() => {
    const volumeControl = document.querySelector('.volumeControl');
    return volumeControl ? volumeControl.outerHTML : 'NOT FOUND';
  });

  console.log('\nVolume control HTML:', html);

  // Check all elements with "volume" in class name
  const volumeElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('[class*="volume"]');
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      class: el.className,
      text: el.textContent.substring(0, 50)
    }));
  });

  console.log('\nAll volume elements:', volumeElements);

  await page.waitForTimeout(5000);
  await browser.close();
})();
