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

  console.log('✓ Game started\n');

  // Get icon position
  const icon = await page.locator('.volumeIcon').boundingBox();
  console.log('Icon position:', icon);

  // Click icon
  await page.locator('.volumeIcon').click();
  await page.waitForTimeout(500);

  // Get popup position
  const popup = await page.locator('.volumePopup').boundingBox();

  if (popup) {
    console.log('Popup position:', popup);
    console.log('\n✅ Popup appears!');
    console.log(`   Icon is at Y: ${Math.round(icon.y)}`);
    console.log(`   Popup is at Y: ${Math.round(popup.y)}`);
    console.log(`   Popup is above icon: ${popup.y < icon.y ? 'YES ✓' : 'NO ✗'}`);
  } else {
    console.log('❌ Popup not found');
  }

  await page.screenshot({ path: '/tmp/simple-popup.png' });
  console.log('\n📸 Screenshot: /tmp/simple-popup.png');

  await page.waitForTimeout(4000);
  await browser.close();
})();
