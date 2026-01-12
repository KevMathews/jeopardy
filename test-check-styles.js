const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Enter player name and start game
  await page.locator('.playerInput').first().fill('Test Player');
  await page.locator('.startGameButton').first().click();
  await page.waitForTimeout(3000);

  // Click volume icon
  await page.locator('.volumeIcon').first().click();
  await page.waitForTimeout(1000);

  // Check computed styles
  const overlayStyles = await page.evaluate(() => {
    const overlay = document.querySelector('.volumeModalOverlay');
    if (!overlay) return 'NOT FOUND';
    const styles = window.getComputedStyle(overlay);
    return {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      right: styles.right,
      bottom: styles.bottom,
      width: styles.width,
      height: styles.height,
      display: styles.display,
      justifyContent: styles.justifyContent,
      alignItems: styles.alignItems,
      zIndex: styles.zIndex
    };
  });

  console.log('Overlay computed styles:', overlayStyles);

  const modalStyles = await page.evaluate(() => {
    const modal = document.querySelector('.volumeModal');
    if (!modal) return 'NOT FOUND';
    const styles = window.getComputedStyle(modal);
    return {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      width: styles.width,
      height: styles.height
    };
  });

  console.log('Modal computed styles:', modalStyles);

  await page.waitForTimeout(3000);
  await browser.close();
})();
