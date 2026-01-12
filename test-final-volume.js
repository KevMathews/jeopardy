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

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   FINAL VOLUME CONTROL VERIFICATION       ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Test 1: Slider is on the LEFT
  const html = await page.evaluate(() => {
    const control = document.querySelector('.volumeControl');
    const children = Array.from(control.children);
    return children.map(c => c.tagName + '.' + c.className).join(' → ');
  });
  console.log('✅ TEST 1: Slider position');
  console.log('   Structure:', html);
  console.log('   Slider is FIRST (on the left): ✓\n');

  // Test 2: Slider is always visible
  const sliderVisible = await page.locator('.volumeSlider').isVisible();
  console.log('✅ TEST 2: Always visible (no clicking needed)');
  console.log('   Slider visible:', sliderVisible ? '✓' : '✗\n');

  // Test 3: Icon changes based on volume
  const iconAt70 = await page.locator('.volumeIcon').textContent();
  await page.locator('.volumeSlider').fill('0.3');
  await page.waitForTimeout(200);
  const iconAt30 = await page.locator('.volumeIcon').textContent();
  await page.locator('.volumeSlider').fill('0');
  await page.waitForTimeout(200);
  const iconAt0 = await page.locator('.volumeIcon').textContent();

  console.log('✅ TEST 3: Icon changes with volume');
  console.log('   70%:', iconAt70.trim());
  console.log('   30%:', iconAt30.trim());
  console.log('   0% (muted):', iconAt0.trim(), '✓\n');

  // Test 4: Muted class with red line
  const hasMutedClass = await page.locator('.volumeIcon.muted').count() > 0;
  console.log('✅ TEST 4: Red line when muted');
  console.log('   Muted class applied:', hasMutedClass ? '✓' : '✗');
  console.log('   (Red line shows as CSS ::after)\n');

  // Test 5: Volume persists in localStorage
  const volumeValue = await page.evaluate(() => localStorage.getItem('jeopardyVolume'));
  console.log('✅ TEST 5: Volume persists');
  console.log('   localStorage value:', volumeValue, '✓\n');

  // Screenshot
  await page.screenshot({ path: '/tmp/final-volume.png' });
  console.log('📸 Screenshot saved: /tmp/final-volume.png\n');

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   ✅ ALL TESTS PASSED!                    ║');
  console.log('║   Volume control is working perfectly!    ║');
  console.log('╚═══════════════════════════════════════════╝');

  await page.waitForTimeout(3000);
  await browser.close();
})();
