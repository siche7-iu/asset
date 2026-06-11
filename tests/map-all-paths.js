// 모든 path의 실제 화면 위치 분포 확인
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

  await page.waitForTimeout(1500);

  const pathStats = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    if (!svgEl) return { error: 'no svg' };

    var mapRect = mapEl.getBoundingClientRect();
    var paths = svgEl.querySelectorAll('path');

    var minTop = Infinity, maxBottom = -Infinity;
    var minLeft = Infinity, maxRight = -Infinity;
    var inMap = 0, outMap = 0;

    paths.forEach(function(p) {
      var r = p.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      minTop = Math.min(minTop, r.top);
      maxBottom = Math.max(maxBottom, r.bottom);
      minLeft = Math.min(minLeft, r.left);
      maxRight = Math.max(maxRight, r.right);

      var inView = r.bottom > mapRect.top && r.top < mapRect.bottom &&
                   r.right > mapRect.left && r.left < mapRect.right;
      if (inView) inMap++; else outMap++;
    });

    return {
      pathCount: paths.length,
      inMap, outMap,
      pathsBBox: { top: Math.round(minTop), bottom: Math.round(maxBottom), left: Math.round(minLeft), right: Math.round(maxRight) },
      mapBBox: { top: Math.round(mapRect.top), bottom: Math.round(mapRect.bottom), left: Math.round(mapRect.left), right: Math.round(mapRect.right) }
    };
  });

  console.log('=== Path 분포 ===');
  console.log(JSON.stringify(pathStats, null, 2));

  // 전체 페이지 스크린샷 (지도 영역 확인)
  await page.screenshot({ path: 'test-results/map-fullpage.png', fullPage: true });
  console.log('전체 스크린샷: test-results/map-fullpage.png');

  await browser.close();
})();
