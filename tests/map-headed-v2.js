// headed 브라우저에서 2초 이상 대기 후 스크린샷
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  // 애니메이션 완료 + 모든 setTimeout 실행까지 충분히 대기
  await page.waitForTimeout(3000);

  // 지도 패널 스크린샷
  var panelEl = await page.$('.dr-map-card');
  if (panelEl) await panelEl.screenshot({ path: 'test-results/map-headed-v2-panel.png' });

  // 전체 화면
  await page.screenshot({ path: 'test-results/map-headed-v2.png' });

  // SVG 상태
  const state = await page.evaluate(() => {
    var svgEl = document.querySelector('#map-box .leaflet-overlay-pane svg');
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
    return {
      svgVB: svgEl ? svgEl.getAttribute('viewBox') : 'none',
      svgStyle: svgEl ? svgEl.getAttribute('style') : 'none',
      pathsBbox
    };
  });

  console.log('3초 후 상태:', JSON.stringify(state, null, 2));

  await browser.close();
})();
