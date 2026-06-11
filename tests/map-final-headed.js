// headed 브라우저에서 최종 확인
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(INDEX);

  // 인증 팝업 우회
  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  // 1050ms 초기화 지연 + 보정 + 여유 = 2초 대기
  await page.waitForTimeout(2500);

  const screenshot = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(__dirname, '../test-results/map-final-full.png'), screenshot);

  // 지도 패널 클로즈업
  var panelEl = await page.$('.dr-map-card');
  if (panelEl) {
    const panelShot = await panelEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-final-panel.png'), panelShot);
  }

  // 지도 요소만 클로즈업
  var mapEl = await page.$('#map-box');
  if (mapEl) {
    const mapShot = await mapEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-final-mapbox.png'), mapShot);
  }

  console.log('스크린샷 완료');
  await browser.close();
})();
