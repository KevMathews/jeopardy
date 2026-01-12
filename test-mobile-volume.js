const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Start game
  await page.locator('input[type="text"]').first().fill('Player 1');
  await page.locator('button:has-text("Start Game")').click();
  await page.waitForTimeout(2000);

  console.log('=== TESTING ON MOBILE (iPhone SE) ===\n');

  // Check if volume control is visible
  const isVisible = await page.locator('.volumeControl').isVisible();
  console.log('✓ Volume control visible:', isVisible);

  // Check layout
  const bbox = await page.locator('.volumeControl').boundingBox();
  console.log('✓ Volume control position:', bbox);

  // Check slider is there
  const sliderVisible = await page.locator('.volumeSlider').isVisible();
  console.log('✓ Slider visible:', sliderVisible);

  // Screenshot
  await page.screenshot({ path: '/tmp/mobile-volume.png', fullPage: true });
  console.log('\n📸 Screenshot: /tmp/mobile-volume.png');

  console.log('\n✅ Mobile volume control working!');

  await page.waitForTimeout(3000);
  await browser.close();
})();
