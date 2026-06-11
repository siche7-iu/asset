// 충분한 대기 후 지도 상태 확인
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
    location.hash = '#/dashboard';
  });

  // 3초 대기 (모든 setTimeout 콜백 실행 후)
  await page.waitForTimeout(3000);

  const svgInfo = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    if (!svgEl) return { error: 'no svg' };

    return {
      svgStyle: svgEl.getAttribute('style'),
      svgViewBox: svgEl.getAttribute('viewBox'),
      svgWidth: svgEl.getAttribute('width'),
      svgHeight: svgEl.getAttribute('height')
    };
  });

  console.log('3초 후 SVG 상태:', svgInfo);

  // 스크린샷
  await page.screenshot({ path: 'test-results/map-3s.png', fullPage: false });
  var panelEl = await page.$('.dr-map-card');
  if (panelEl) await panelEl.screenshot({ path: 'test-results/map-3s-panel.png' });

  // 수동으로 fitBounds 재실행
  await page.evaluate(() => {
    // DOM에서 Leaflet 내부 접근
    var mapEl = document.getElementById('map-box');
    // Leaflet이 mapEl에 _leaflet_id를 붙이므로 확인
    console.log('leaflet id:', mapEl._leaflet_id);
  });

  await browser.close();
})();
