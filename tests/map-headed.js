// headless: false로 실제 브라우저에서 스크린샷
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  // 충분히 대기
  await page.waitForTimeout(2000);

  // 스크린샷
  await page.screenshot({ path: 'test-results/map-headed.png', fullPage: false });
  var panelEl = await page.$('.dr-map-card');
  if (panelEl) await panelEl.screenshot({ path: 'test-results/map-headed-panel.png' });

  console.log('스크린샷 저장: test-results/map-headed-panel.png');

  await browser.close();
})();
