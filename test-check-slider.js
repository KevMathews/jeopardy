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

  // Check the actual HTML structure
  const html = await page.evaluate(() => {
    const control = document.querySelector('.volumeControl');
    return control ? control.outerHTML : 'NOT FOUND';
  });

  console.log('Volume control HTML:');
  console.log(html);

  // Check computed styles
  const sliderStyles = await page.evaluate(() => {
    const slider = document.querySelector('.volumeSlider');
    if (!slider) return 'NOT FOUND';
    const styles = window.getComputedStyle(slider);
    return {
      display: styles.display,
      visibility: styles.visibility,
      width: styles.width,
      height: styles.height,
      opacity: styles.opacity
    };
  });

  console.log('\nSlider computed styles:', sliderStyles);

  await page.screenshot({ path: '/tmp/check-slider.png' });
  console.log('\n📸 Screenshot: /tmp/check-slider.png');

  await page.waitForTimeout(4000);
  await browser.close();
})();
