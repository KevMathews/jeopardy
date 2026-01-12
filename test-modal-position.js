const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to localhost:4000...');
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Enter player name
  console.log('Entering player name...');
  const playerInput = await page.locator('.playerInput').first();
  await playerInput.fill('Test Player');
  await page.waitForTimeout(500);

  // Start the game
  console.log('Starting game...');
  const startButton = await page.locator('.startGameButton').first();
  await startButton.click();
  await page.waitForTimeout(3000);

  // Get viewport size
  const viewport = page.viewportSize();
  console.log('Viewport size:', viewport);

  // Click volume icon
  console.log('Clicking volume icon...');
  const volumeIcon = await page.locator('.volumeIcon').first();
  await volumeIcon.click();
  await page.waitForTimeout(1000);

  // Get modal position
  const modalOverlay = await page.locator('.volumeModalOverlay').boundingBox();
  const modal = await page.locator('.volumeModal').boundingBox();

  console.log('Modal overlay position:', modalOverlay);
  console.log('Modal position:', modal);

  if (modal && viewport) {
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const modalCenterX = modal.x + (modal.width / 2);
    const modalCenterY = modal.y + (modal.height / 2);

    console.log('');
    console.log('Expected center:', { x: centerX, y: centerY });
    console.log('Actual modal center:', { x: modalCenterX, y: modalCenterY });

    const xDiff = Math.abs(centerX - modalCenterX);
    const yDiff = Math.abs(centerY - modalCenterY);

    console.log('');
    console.log('X offset from center:', xDiff, 'pixels');
    console.log('Y offset from center:', yDiff, 'pixels');

    if (xDiff < 10 && yDiff < 10) {
      console.log('');
      console.log('✅ Modal is CENTERED correctly!');
    } else {
      console.log('');
      console.log('❌ Modal is NOT centered');
    }
  }

  await page.screenshot({ path: '/tmp/modal-centered.png' });
  console.log('Screenshot saved: /tmp/modal-centered.png');

  await page.waitForTimeout(3000);
  await browser.close();
})();
