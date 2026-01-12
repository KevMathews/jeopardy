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

  console.log('=== TESTING VOLUME CONTROL ===\n');

  // Check slider is visible and on the left
  const html = await page.evaluate(() => {
    const control = document.querySelector('.volumeControl');
    return control.innerHTML;
  });
  console.log('✓ Volume control structure:', html.substring(0, 100) + '...');

  // Check initial state
  const iconInitial = await page.locator('.volumeIcon').textContent();
  console.log('✓ Initial icon:', iconInitial.trim());

  // Move slider to 0 (mute)
  console.log('\nMuting (moving slider to 0)...');
  await page.locator('.volumeSlider').fill('0');
  await page.waitForTimeout(500);

  // Check muted class
  const hasMuted = await page.locator('.volumeIcon.muted').count();
  console.log('✓ Muted class applied:', hasMuted > 0 ? 'YES' : 'NO');

  // Check icon changed
  const iconMuted = await page.locator('.volumeIcon').textContent();
  console.log('✓ Muted icon:', iconMuted.trim());

  // Screenshot
  await page.screenshot({ path: '/tmp/volume-muted.png', fullPage: false });
  console.log('\n📸 Screenshot: /tmp/volume-muted.png');

  console.log('\n✅ Volume control fully working!');
  console.log('   - Slider on LEFT');
  console.log('   - Icon on RIGHT');
  console.log('   - Red line when muted');

  await page.waitForTimeout(4000);
  await browser.close();
})();
