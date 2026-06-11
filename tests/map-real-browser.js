// 실제 브라우저에서 비밀번호 입력 후 대시보드 확인
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

  // 대시보드 active 대기
  await page.waitForSelector('#view-dashboard.active', { timeout: 5000 });

  // animation(0.5s delay + 0.42s duration) + 초기화 지연(1050ms) + 보정(150ms) = 약 1.8s
  // 여유 포함해서 3초 대기
  await page.waitForTimeout(3000);

  // 전체 페이지 스크린샷
  const fullShot = await page.screenshot({ type: 'png' });
  fs.writeFileSync(path.join(__dirname, '../test-results/map-real-full.png'), fullShot);

  // 지도 패널만
  var panelEl = await page.$('.dr-map-card');
  if (panelEl) {
    const panelShot = await panelEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-real-panel.png'), panelShot);
  }

  // 상태 확인
  const state = await page.evaluate(() => {
    var svgEl = document.querySelector('#map-box .leaflet-overlay-pane svg');
    var paths = svgEl ? svgEl.querySelectorAll('path') : [];
    var mapEl = document.getElementById('map-box');
    var mapRect = mapEl ? mapEl.getBoundingClientRect() : {};

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
      pathCount: paths.length,
      pathsBbox,
      mapRect: { top: Math.round(mapRect.top), bottom: Math.round(mapRect.bottom), left: Math.round(mapRect.left), right: Math.round(mapRect.right) }
    };
  });

  console.log('상태:', JSON.stringify(state, null, 2));

  await browser.close();

  console.log('스크린샷 저장 완료');
})();
