const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to localhost:4000...');

  // Listen for console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Start the game first
  console.log('Starting game...');
  const startButton = await page.locator('.startGameButton').first();
  await startButton.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Start button visible, clicking...');
  await startButton.click({ timeout: 10000 });
  await page.waitForTimeout(3000);

  // Find and click the volume icon
  console.log('Looking for volume icon...');
  const volumeIcon = await page.locator('.volumeIcon').first();
  const isVisible = await volumeIcon.isVisible();
  console.log('Volume icon visible:', isVisible);

  if (isVisible) {
    // Get scoreboard dimensions BEFORE clicking
    const scoreboardBefore = await page.locator('.playerScoreboard').boundingBox();
    console.log('Scoreboard dimensions BEFORE click:', scoreboardBefore);

    // Take screenshot of initial state
    await page.screenshot({ path: '/tmp/before-click.png' });
    console.log('Screenshot saved: /tmp/before-click.png');

    console.log('Clicking volume icon...');
    await volumeIcon.click();
    await page.waitForTimeout(1000);

    // Take screenshot after click
    await page.screenshot({ path: '/tmp/after-click.png' });
    console.log('Screenshot saved: /tmp/after-click.png');

    // Check if modal overlay exists
    const modalOverlay = await page.locator('.volumeModalOverlay').first();
    const overlayExists = await modalOverlay.isVisible().catch(() => false);
    console.log('Modal overlay visible:', overlayExists);

    // Check if modal exists
    const modal = await page.locator('.volumeModal').first();
    const modalExists = await modal.isVisible().catch(() => false);
    console.log('Modal visible:', modalExists);

    // Check if modal is actually in document.body (portal check)
    const modalParent = await page.evaluate(() => {
      const modal = document.querySelector('.volumeModalOverlay');
      if (modal) {
        return modal.parentElement.tagName;
      }
      return 'NOT FOUND';
    });
    console.log('Modal parent element:', modalParent);

    // Check if scoreboard resized
    const scoreboardAfter = await page.locator('.playerScoreboard').boundingBox();
    console.log('Scoreboard dimensions AFTER click:', scoreboardAfter);

    // Compare dimensions
    const widthChanged = Math.abs(scoreboardBefore.width - scoreboardAfter.width) > 1;
    const heightChanged = Math.abs(scoreboardBefore.height - scoreboardAfter.height) > 1;

    console.log('');
    console.log('=== TEST RESULTS ===');
    console.log('✓ Volume icon clickable:', isVisible);
    console.log('✓ Modal appears:', modalExists);
    console.log('✓ Modal uses React Portal (in body):', modalParent === 'BODY');
    console.log('✓ Scoreboard width unchanged:', !widthChanged);
    console.log('✓ Scoreboard height unchanged:', !heightChanged);

    if (modalExists && modalParent === 'BODY' && !widthChanged && !heightChanged) {
      console.log('');
      console.log('🎉 ALL TESTS PASSED! Modal is working correctly.');
    } else {
      console.log('');
      console.log('❌ SOME TESTS FAILED');
    }

  } else {
    console.log('ERROR: Volume icon not found!');
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();
