const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('VolumeControl') || text.includes('toggleSlider') || text.includes('showSlider')) {
      console.log('BROWSER LOG:', text);
    }
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to localhost:4000...');
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Start the game
  console.log('Starting game...');
  const startButton = await page.locator('.startGameButton').first();
  await startButton.waitFor({ state: 'visible', timeout: 10000 });
  await startButton.click({ timeout: 10000 });
  await page.waitForTimeout(3000);

  // Click volume icon
  console.log('Clicking volume icon...');
  const volumeIcon = await page.locator('.volumeIcon').first();
  await volumeIcon.click();
  await page.waitForTimeout(2000);

  // Check if modal appeared
  const modalVisible = await page.locator('.volumeModalOverlay').isVisible().catch(() => false);
  console.log('Modal visible after click:', modalVisible);

  await page.waitForTimeout(5000);
  await browser.close();
})();
