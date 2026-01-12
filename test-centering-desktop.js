const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Start game
  await page.locator('input[type="text"]').first().fill('Player 1');
  await page.locator('button:has-text("Start Game")').click();
  await page.waitForTimeout(2000);

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   DESKTOP CENTERING VERIFICATION          ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Get positions
  const containerBox = await page.locator('.scoreboardTitle').boundingBox();
  const volumeBox = await page.locator('.volumeControl').boundingBox();
  const buttonBox = await page.locator('.newGameButtonSmall').boundingBox();

  // Find "Players" text node position
  const playersPos = await page.evaluate(() => {
    const titleDiv = document.querySelector('.scoreboardTitle');
    const range = document.createRange();
    const textNodes = Array.from(titleDiv.childNodes).filter(n => n.nodeType === 3);
    const playersNode = textNodes.find(n => n.textContent.trim() === 'Players');

    if (playersNode) {
      range.selectNodeContents(playersNode);
      const rect = range.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        center: (rect.left + rect.right) / 2
      };
    }
    return null;
  });

  const containerCenter = containerBox.x + (containerBox.width / 2);

  console.log('📐 Container Measurements:');
  console.log(`   Container width: ${containerBox.width.toFixed(2)}px`);
  console.log(`   Container X: ${containerBox.x.toFixed(2)}px`);
  console.log(`   Container center: ${containerCenter.toFixed(2)}px\n`);

  console.log('🔊 Volume Control:');
  console.log(`   Position: ${volumeBox.x.toFixed(2)}px`);
  console.log(`   Width: ${volumeBox.width.toFixed(2)}px\n`);

  console.log('👥 "Players" Text:');
  console.log(`   Center: ${playersPos.center.toFixed(2)}px\n`);

  console.log('🎮 New Game Button:');
  console.log(`   Position: ${buttonBox.x.toFixed(2)}px`);
  console.log(`   Width: ${buttonBox.width.toFixed(2)}px\n`);

  console.log('📊 Centering Analysis:');
  console.log(`   Container center: ${containerCenter.toFixed(2)}px`);
  console.log(`   "Players" center: ${playersPos.center.toFixed(2)}px`);

  const offset = Math.abs(playersPos.center - containerCenter);
  const isWellCentered = offset < 5;

  console.log(`   Offset: ${offset.toFixed(2)}px`);
  console.log(`   Status: ${isWellCentered ? '✅ WELL CENTERED' : '⚠️ NEEDS ADJUSTMENT'}\n`);

  // Screenshot
  await page.screenshot({ path: '/tmp/centering-desktop.png' });
  console.log('📸 Screenshot: /tmp/centering-desktop.png\n');

  console.log('╔═══════════════════════════════════════════╗');
  if (isWellCentered) {
    console.log('║   ✅ DESKTOP CENTERING PERFECT            ║');
  } else {
    console.log('║   ⚠️  NEEDS ADJUSTMENT                    ║');
  }
  console.log('╚═══════════════════════════════════════════╝');

  await page.waitForTimeout(3000);
  await browser.close();
})();
