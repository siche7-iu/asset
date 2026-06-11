// fitBounds 동작 상세 디버그
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));

  await page.goto(INDEX);

  // Leaflet의 fitBounds/setView를 패치하기 전에 먼저 실행해야 함
  // 방법: Leaflet.js 로드 후 map 생성 전에 패치
  // 직접 renderMap과 동일한 방식으로 테스트

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
  });

  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    // map-box에 직접 Leaflet 맵 생성 (이미 renderMap()이 실행됐을 수 있으니 새 엘리먼트로)
    var mapEl = document.getElementById('map-box');

    // 현재 map-box의 크기
    var rect = mapEl.getBoundingClientRect();

    // 새 div로 테스트
    var testDiv = document.createElement('div');
    testDiv.style.width = rect.width + 'px';
    testDiv.style.height = rect.height + 'px';
    testDiv.style.overflow = 'hidden';
    testDiv.style.position = 'absolute';
    testDiv.style.top = '0';
    testDiv.style.left = '0';
    testDiv.style.visibility = 'hidden'; // 화면에 안 보이게
    document.body.appendChild(testDiv);

    var topo = window.MUNICIPALITIES_TOPO;
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    var testMap = L.map(testDiv, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, doubleClickZoom: false, dragging: false
    });

    var geoLayer = L.geoJSON(geojson, {
      style: { fillColor: '#3B82F6', fillOpacity: 0.85, color: '#fff', weight: 0.5 }
    }).addTo(testMap);

    var bounds = geoLayer.getBounds();
    testMap.fitBounds(bounds, { padding: [6, 6], animate: false });

    var zoom = testMap.getZoom();
    var center = testMap.getCenter();
    var svgEl = testDiv.querySelector('.leaflet-overlay-pane svg');
    var pathCount = svgEl ? svgEl.querySelectorAll('path').length : 0;
    var svgVB = svgEl ? svgEl.getAttribute('viewBox') : 'none';

    // now test with actual map-box (but destroy first if exists)
    return {
      divSize: { w: rect.width, h: rect.height },
      zoom,
      centerLat: center.lat.toFixed(3),
      centerLng: center.lng.toFixed(3),
      pathCount,
      svgVB,
      boundsValid: bounds.isValid(),
      boundsNE: { lat: bounds.getNorthEast().lat.toFixed(2), lng: bounds.getNorthEast().lng.toFixed(2) },
      boundsSW: { lat: bounds.getSouthWest().lat.toFixed(2), lng: bounds.getSouthWest().lng.toFixed(2) }
    };
  });

  console.log('=== testDiv (overflow:hidden, 332x332) fitBounds 결과 ===');
  console.log(JSON.stringify(result, null, 2));

  // 이제 map-box를 직접 확인
  location_hash = '#/dashboard';
  await page.evaluate(() => { location.hash = '#/dashboard'; });
  await page.waitForTimeout(1500);

  const mapBoxState = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    return {
      mapOverflow: window.getComputedStyle(mapEl).overflow,
      mapOffsetW: mapEl.offsetWidth,
      mapOffsetH: mapEl.offsetHeight,
      svgVB: svgEl ? svgEl.getAttribute('viewBox') : 'none'
    };
  });

  console.log('\n=== 실제 map-box 상태 ===');
  console.log(JSON.stringify(mapBoxState, null, 2));

  await browser.close();
})();
