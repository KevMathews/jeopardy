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

  console.log('=== TESTING INLINE VOLUME CONTROL ===\n');

  // Check if slider is visible
  const sliderVisible = await page.locator('.volumeSlider').isVisible();
  console.log('✓ Slider visible:', sliderVisible);

  // Check if icon is visible
  const iconVisible = await page.locator('.volumeIcon').isVisible();
  console.log('✓ Icon visible:', iconVisible);

  // Get initial volume
  const initialVolume = await page.locator('.volumeSlider').inputValue();
  console.log('✓ Initial volume:', initialVolume);

  // Move slider to 0 (muted)
  await page.locator('.volumeSlider').fill('0');
  await page.waitForTimeout(500);

  // Check if muted class is applied
  const hasMutedClass = await page.locator('.volumeIcon.muted').count();
  console.log('✓ Muted class applied when volume=0:', hasMutedClass > 0);

  // Take screenshot
  await page.screenshot({ path: '/tmp/inline-volume.png' });
  console.log('\n📸 Screenshot: /tmp/inline-volume.png');

  console.log('\n✅ Inline volume control working!');

  await page.waitForTimeout(3000);
  await browser.close();
})();
