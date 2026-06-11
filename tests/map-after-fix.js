// 수정 후 3.5초 대기 (1050ms 초기화 + 추가 대기)
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

  // 1050ms 초기화 + 충분한 여유
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    var paths = svgEl ? svgEl.querySelectorAll('path') : [];

    var pathsBbox = { minTop: Infinity, maxBottom: -Infinity, minLeft: Infinity, maxRight: -Infinity };
    paths.forEach(function(p) {
      var r = p.getBoundingClientRect();
      if (r.width > 0) {
        pathsBbox.minTop = Math.min(pathsBbox.minTop, r.top);
        pathsBbox.maxBottom = Math.max(pathsBbox.maxBottom, r.bottom);
        pathsBbox.minLeft = Math.min(pathsBbox.minLeft, r.left);
        pathsBbox.maxRight = Math.max(pathsBbox.maxRight, r.right);
      }
    });

    var mapRect = mapEl ? mapEl.getBoundingClientRect() : null;

    return {
      svgVB: svgEl ? svgEl.getAttribute('viewBox') : 'none',
      svgStyle: svgEl ? svgEl.getAttribute('style') : 'none',
      pathCount: paths.length,
      pathsBbox,
      mapBox: mapRect ? {
        top: Math.round(mapRect.top),
        bottom: Math.round(mapRect.bottom),
        left: Math.round(mapRect.left),
        right: Math.round(mapRect.right)
      } : null
    };
  });

  console.log('=== 2.5초 후 상태 ===');
  console.log(JSON.stringify(state, null, 2));

  var panelEl = await page.$('.dr-map-card');
  if (panelEl) await panelEl.screenshot({ path: 'test-results/map-after-fix.png' });
  await page.screenshot({ path: 'test-results/map-after-fix-full.png' });

  await browser.close();
})();
