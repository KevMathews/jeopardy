const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== VOLUME MODAL TEST ===\n');

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(3000);

  // Start game
  await page.locator('input[type="text"]').first().fill('Player 1');
  await page.locator('button:has-text("Start Game")').click();
  await page.waitForTimeout(2000);

  console.log('✓ Game started');

  // Get viewport
  const viewport = page.viewportSize();
  console.log(`✓ Viewport: ${viewport.width}x${viewport.height}`);

  // Click volume icon
  await page.locator('.volumeIcon').click();
  await page.waitForTimeout(1000);

  console.log('✓ Volume icon clicked\n');

  // Check modal position
  const modal = await page.locator('.volumeModal').boundingBox();
  if (modal) {
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const modalCenterX = modal.x + (modal.width / 2);
    const modalCenterY = modal.y + (modal.height / 2);

    console.log(`Expected center: (${centerX}, ${centerY})`);
    console.log(`Modal center: (${Math.round(modalCenterX)}, ${Math.round(modalCenterY)})`);

    const xDiff = Math.abs(centerX - modalCenterX);
    const yDiff = Math.abs(centerY - modalCenterY);

    console.log(`\nOffset from center: X=${Math.round(xDiff)}px, Y=${Math.round(yDiff)}px\n`);

    if (xDiff < 5 && yDiff < 5) {
      console.log('✅ SUCCESS: Modal is perfectly centered!');
    } else if (xDiff < 20 && yDiff < 20) {
      console.log('✅ SUCCESS: Modal is acceptably centered');
    } else {
      console.log('❌ FAIL: Modal is not centered');
    }
  } else {
    console.log('❌ FAIL: Modal not found');
  }

  await page.screenshot({ path: '/tmp/volume-modal-final.png' });
  console.log('\n📸 Screenshot: /tmp/volume-modal-final.png');

  await page.waitForTimeout(4000);
  await browser.close();
})();
