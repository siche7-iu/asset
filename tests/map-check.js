// 지도 렌더링 상태 확인 스크립트 (Node.js + Playwright)
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  // 인증 팝업 우회: 오버레이 숨기고 대시보드 직접 렌더
  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
  });

  // 대시보드가 활성화될 때까지 대기
  await page.waitForSelector('#view-dashboard', { timeout: 5000 });

  // renderDashboard 강제 호출 (이미 IIFE 내부에서 실행됐을 수도 있음)
  // → location.hash를 '#/dashboard'로 변경해 _renderView 트리거
  await page.evaluate(() => {
    location.hash = '#/dashboard';
  });

  // 짧은 대기 후 map-box 상태 확인
  await page.waitForTimeout(1000);

  const mapInfo = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    if (!mapEl) return { error: 'map-box element not found' };
    var rect = mapEl.getBoundingClientRect();
    var hasLeaflet = mapEl.classList.contains('leaflet-container');
    var canvases = mapEl.querySelectorAll('canvas').length;
    var svgLayers = mapEl.querySelectorAll('svg').length;
    var parentCard = mapEl.closest('.dr-map-card');
    var parentRect = parentCard ? parentCard.getBoundingClientRect() : null;
    return {
      mapWidth: rect.width,
      mapHeight: rect.height,
      mapTop: rect.top,
      mapLeft: rect.left,
      hasLeaflet: hasLeaflet,
      canvases: canvases,
      svgLayers: svgLayers,
      parentCardWidth: parentRect ? parentRect.width : 0,
      parentCardHeight: parentRect ? parentRect.height : 0,
      innerHTML_len: mapEl.innerHTML.length,
      classNames: mapEl.className
    };
  });

  console.log('map-box 상태:', JSON.stringify(mapInfo, null, 2));

  // 스크린샷 (지도 영역 포함)
  await page.screenshot({ path: 'test-results/map-check.png', fullPage: false });
  console.log('스크린샷 저장: test-results/map-check.png');

  // 지도 패널 부분만 클로즈업
  var panelEl = await page.$('.dr-map-card');
  if (panelEl) {
    await panelEl.screenshot({ path: 'test-results/map-panel.png' });
    console.log('패널 스크린샷: test-results/map-panel.png');
  } else {
    console.log('dr-map-card 요소를 찾을 수 없음');
  }

  await browser.close();
})();
