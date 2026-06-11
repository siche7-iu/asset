// 지도 렌더링 상세 디버그 스크립트
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  const logs = [];
  page.on('console', msg => logs.push(msg.type() + ': ' + msg.text()));
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(INDEX);

  // 인증 팝업 우회
  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(1500);

  const debugInfo = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    if (!mapEl) return { error: 'map-box not found' };

    // Leaflet map 객체가 있는지 확인
    var leafletMap = mapEl._leaflet_map;

    // municipalities topo 데이터 확인
    var hasTopo = !!window.MUNICIPALITIES_TOPO;
    var topoKeys = hasTopo ? Object.keys(window.MUNICIPALITIES_TOPO) : [];
    var topoObjKeys = hasTopo ? Object.keys(window.MUNICIPALITIES_TOPO.objects || {}) : [];

    // topojson 라이브러리 확인
    var hasTopojson = typeof window.topojson !== 'undefined';
    var hasL = typeof window.L !== 'undefined';

    // Leaflet 내부 레이어 확인
    var leafletPanes = mapEl.querySelectorAll('.leaflet-pane');
    var svgPanes = mapEl.querySelectorAll('.leaflet-overlay-pane svg');
    var pathElements = mapEl.querySelectorAll('path');

    // SVG 실제 내용
    var svgEl = mapEl.querySelector('.leaflet-overlay-pane svg');
    var svgWidth = svgEl ? svgEl.getAttribute('width') : 'none';
    var svgHeight = svgEl ? svgEl.getAttribute('height') : 'none';
    var svgViewBox = svgEl ? svgEl.getAttribute('viewBox') : 'none';
    var pathCount = svgEl ? svgEl.querySelectorAll('path').length : 0;

    // 지도 bounds 확인
    var mapBounds = leafletMap ? JSON.stringify(leafletMap.getBounds()) : 'no map';
    var mapZoom = leafletMap ? leafletMap.getZoom() : 'no map';

    return {
      hasTopo,
      topoKeys,
      topoObjKeys,
      hasTopojson,
      hasL,
      leafletPaneCount: leafletPanes.length,
      svgPaneCount: svgPanes.length,
      pathCount,
      svgWidth,
      svgHeight,
      svgViewBox,
      mapBounds,
      mapZoom,
      mapElSize: { w: mapEl.offsetWidth, h: mapEl.offsetHeight }
    };
  });

  console.log('=== 디버그 정보 ===');
  console.log(JSON.stringify(debugInfo, null, 2));

  console.log('\n=== 콘솔 로그 ===');
  logs.forEach(l => console.log(l));

  console.log('\n=== 페이지 오류 ===');
  errors.forEach(e => console.log(e));

  // 1초 더 대기 후 다시 확인
  await page.waitForTimeout(1000);

  const afterInfo = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    return {
      pathCount: svgEl ? svgEl.querySelectorAll('path').length : 0,
      svgWidth: svgEl ? svgEl.getAttribute('width') : 'none'
    };
  });
  console.log('\n=== 1초 후 상태 ===');
  console.log(JSON.stringify(afterInfo, null, 2));

  await page.screenshot({ path: 'test-results/map-debug.png', fullPage: false });

  await browser.close();
})();
