// Leaflet 내부 상태 (zoom, center) 확인을 위해 renderMap을 수정한 버전으로 테스트
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 콘솔 로그 캡처
  const logs = [];
  page.on('console', msg => {
    if (msg.type() !== 'log') return;
    logs.push(msg.text());
  });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(2000);

  // Leaflet 지도 상태를 console.log로 출력하는 코드 삽입
  const mapState = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    if (!mapEl || !mapEl._leaflet_id) return { error: 'no leaflet' };

    // Leaflet은 L.Map.instances 또는 L.maps 같은 글로벌 레지스트리가 없음
    // 하지만 mapEl에서 Leaflet 인스턴스를 찾는 방법:
    // Leaflet 1.9.x에서 map은 DOM 요소의 _leaflet_id를 통해 추적됨
    // 직접 접근은 IIFE 스코프 외에서는 불가능

    // 대신 SVG 내 실제 path d 속성의 수치 범위로 zoom을 역추정
    var svgEl = mapEl.querySelector('.leaflet-overlay-pane svg');
    if (!svgEl) return { error: 'no svg' };

    // viewBox 파싱
    var vb = svgEl.getAttribute('viewBox');
    var vbParts = vb ? vb.split(' ').map(Number) : [];

    // SVG transform 파싱
    var style = svgEl.getAttribute('style') || '';
    var match = style.match(/translate3d\(([^,]+),\s*([^,]+),/);
    var tx = match ? parseFloat(match[1]) : 0;
    var ty = match ? parseFloat(match[2]) : 0;

    // leaflet-map-pane transform
    var mapPane = mapEl.querySelector('.leaflet-map-pane');
    var mapPaneStyle = mapPane ? mapPane.style.transform : 'none';

    // 모든 path의 d 속성에서 숫자 범위 추출
    var paths = svgEl.querySelectorAll('path');
    var allNums = [];
    paths.forEach(function(p) {
      var d = p.getAttribute('d') || '';
      var nums = d.match(/[\d.]+/g);
      if (nums) allNums = allNums.concat(nums.map(Number));
    });

    allNums.sort(function(a,b){return a-b;});
    var minNum = allNums[0];
    var maxNum = allNums[allNums.length - 1];

    return {
      viewBox: vb,
      vbParts,
      svgTranslate: { tx, ty },
      mapPaneTransform: mapPaneStyle,
      pathCoordRange: { min: Math.round(minNum), max: Math.round(maxNum) }
    };
  });

  console.log('=== Leaflet 상태 ===');
  console.log(JSON.stringify(mapState, null, 2));

  // 수동으로 invalidateSize + fitBounds 강제 실행 (app.js IIFE 스코프를 우회)
  // 방법: 새 Leaflet 지도를 직접 생성해서 올바르게 렌더링되는지 확인
  const testResult = await page.evaluate(() => {
    // 테스트용 div 생성
    var testDiv = document.createElement('div');
    testDiv.id = 'test-map-box';
    testDiv.style.width = '300px';
    testDiv.style.height = '300px';
    testDiv.style.position = 'fixed';
    testDiv.style.top = '0';
    testDiv.style.left = '0';
    testDiv.style.zIndex = '9999';
    document.body.appendChild(testDiv);

    var topo = window.MUNICIPALITIES_TOPO;
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    var testMap = L.map(testDiv, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: false
    });

    var geoLayer = L.geoJSON(geojson).addTo(testMap);
    var bounds = geoLayer.getBounds();
    testMap.fitBounds(bounds, { padding: [5, 5], animate: false });

    var svgEl = testDiv.querySelector('.leaflet-overlay-pane svg');
    var pathCount = svgEl ? svgEl.querySelectorAll('path').length : 0;
    var svgVB = svgEl ? svgEl.getAttribute('viewBox') : 'none';
    var svgStyle = svgEl ? svgEl.getAttribute('style') : 'none';

    var zoom = testMap.getZoom();
    var center = testMap.getCenter();

    return {
      pathCount,
      svgVB,
      svgStyle,
      zoom,
      centerLat: center.lat.toFixed(2),
      centerLng: center.lng.toFixed(2),
      boundsValid: bounds.isValid()
    };
  });

  console.log('\n=== 새 Leaflet 테스트 맵 ===');
  console.log(JSON.stringify(testResult, null, 2));

  await page.screenshot({ path: 'test-results/map-leaflet-state.png' });

  await browser.close();
})();
