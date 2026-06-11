// overflow 설정 차이 테스트
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');

    // map-box overflow를 'visible'로 변경 후 대시보드 로드
    var mapEl = document.getElementById('map-box');
    if (mapEl) {
      mapEl.style.overflow = 'visible';
    }

    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(2000);

  const state = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    return {
      mapOverflow: window.getComputedStyle(mapEl).overflow,
      svgVB: svgEl ? svgEl.getAttribute('viewBox') : 'none',
      svgStyle: svgEl ? svgEl.getAttribute('style') : 'none'
    };
  });

  console.log('=== overflow: visible 설정 후 상태 ===');
  console.log(JSON.stringify(state, null, 2));

  var panelEl = await page.$('.dr-map-card');
  if (panelEl) await panelEl.screenshot({ path: 'test-results/map-overflow-test.png' });

  await browser.close();
})();
