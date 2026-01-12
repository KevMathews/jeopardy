const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

  await page.goto('http://localhost:4000');
  await page.waitForTimeout(2000);

  // Start game
  await page.locator('input[type="text"]').first().fill('Player 1');
  await page.locator('button:has-text("Start Game")').click();
  await page.waitForTimeout(2000);

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   MOBILE RESPONSIVE VERIFICATION          ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // Measure scoreboard title container
  const scoreboardBox = await page.locator('.scoreboardTitle').boundingBox();
  console.log('📊 Scoreboard Title Container:');
  console.log(`   Width: ${scoreboardBox.width}px`);
  console.log(`   Height: ${scoreboardBox.height}px\n`);

  // Measure volume control
  const volumeBox = await page.locator('.volumeControl').boundingBox();
  console.log('🔊 Volume Control:');
  console.log(`   Width: ${volumeBox.width}px`);
  console.log(`   Height: ${volumeBox.height}px`);
  console.log(`   Position: (${volumeBox.x}, ${volumeBox.y})\n`);

  // Measure slider specifically
  const sliderBox = await page.locator('.volumeSlider').boundingBox();
  console.log('🎚️  Volume Slider:');
  console.log(`   Width: ${sliderBox.width}px (should be ~60px)`);
  console.log(`   Height: ${sliderBox.height}px\n`);

  // Measure "Players" text
  const playersText = await page.evaluate(() => {
    const titleDiv = document.querySelector('.scoreboardTitle');
    const textNodes = Array.from(titleDiv.childNodes).filter(n => n.nodeType === 3);
    const playersNode = textNodes.find(n => n.textContent.trim() === 'Players');
    return playersNode ? { found: true } : { found: false };
  });
  console.log('👥 "Players" Text:');
  console.log(`   Found: ${playersText.found}\n`);

  // Measure button
  const buttonBox = await page.locator('.newGameButtonSmall').boundingBox();
  console.log('🎮 New Game Button:');
  console.log(`   Width: ${buttonBox.width}px`);
  console.log(`   Height: ${buttonBox.height}px`);
  console.log(`   Position: (${buttonBox.x}, ${buttonBox.y})\n`);

  // Check computed styles
  const styles = await page.evaluate(() => {
    const scoreboard = document.querySelector('.scoreboardTitle');
    const button = document.querySelector('.newGameButtonSmall');
    const slider = document.querySelector('.volumeSlider');
    const icon = document.querySelector('.volumeIcon');

    return {
      scoreboard: {
        fontSize: window.getComputedStyle(scoreboard).fontSize,
        gap: window.getComputedStyle(scoreboard).gap,
        display: window.getComputedStyle(scoreboard).display,
        justifyContent: window.getComputedStyle(scoreboard).justifyContent,
        alignItems: window.getComputedStyle(scoreboard).alignItems
      },
      button: {
        fontSize: window.getComputedStyle(button).fontSize,
        padding: window.getComputedStyle(button).padding
      },
      slider: {
        width: window.getComputedStyle(slider).width,
        height: window.getComputedStyle(slider).height
      },
      icon: {
        fontSize: window.getComputedStyle(icon).fontSize
      }
    };
  });

  console.log('📐 Computed Styles:');
  console.log('   Scoreboard:');
  console.log(`     - font-size: ${styles.scoreboard.fontSize} (target: 18px)`);
  console.log(`     - gap: ${styles.scoreboard.gap} (target: 8px)`);
  console.log(`     - display: ${styles.scoreboard.display}`);
  console.log(`     - justify-content: ${styles.scoreboard.justifyContent}`);
  console.log(`     - align-items: ${styles.scoreboard.alignItems}`);
  console.log('   Button:');
  console.log(`     - font-size: ${styles.button.fontSize} (target: 10px)`);
  console.log(`     - padding: ${styles.button.padding} (target: 4px 8px)`);
  console.log('   Slider:');
  console.log(`     - width: ${styles.slider.width} (target: 60px)`);
  console.log(`     - height: ${styles.slider.height} (target: 5px)`);
  console.log('   Icon:');
  console.log(`     - font-size: ${styles.icon.fontSize} (target: 14px)\n`);

  // Screenshot
  await page.screenshot({ path: '/tmp/mobile-final.png', fullPage: true });
  console.log('📸 Screenshot saved: /tmp/mobile-final.png\n');

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   ✅ MOBILE LAYOUT TEST COMPLETE          ║');
  console.log('╚═══════════════════════════════════════════╝');

  await page.waitForTimeout(3000);
  await browser.close();
})();
