// GeoJSON bounds 실제 계산값 확인
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);
  await page.waitForTimeout(500);

  const boundsInfo = await page.evaluate(() => {
    var topo = window.MUNICIPALITIES_TOPO;
    if (!topo) return { error: 'no topo' };

    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    // 수동으로 bounds 계산
    var minLng = Infinity, maxLng = -Infinity;
    var minLat = Infinity, maxLat = -Infinity;

    geojson.features.forEach(function(f) {
      if (!f.geometry) return;
      var coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates
                  : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.flat()
                  : [];
      coords.forEach(function(ring) {
        ring.forEach(function(pt) {
          var lng = pt[0], lat = pt[1];
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      });
    });

    return {
      minLng, maxLng, minLat, maxLat,
      centerLng: (minLng + maxLng) / 2,
      centerLat: (minLat + maxLat) / 2,
      spanLng: maxLng - minLng,
      spanLat: maxLat - minLat
    };
  });

  console.log('=== GeoJSON Bounds ===');
  console.log(JSON.stringify(boundsInfo, null, 2));

  // Leaflet 지도 초기화 후 bounds 확인
  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(1500);

  const leafletBounds = await page.evaluate(() => {
    // 글로벌 변수로 지도 객체 접근 시도
    // Leaflet 지도는 IIFE 스코프 안에 있어서 직접 접근 불가
    // 대신 DOM을 통해 접근
    var mapEl = document.getElementById('map-box');
    var leafletId = mapEl ? mapEl._leaflet_id : null;
    if (!leafletId) return { error: 'no leaflet id' };

    // Leaflet.maps를 통해 접근 (Leaflet 내부 레지스트리)
    if (L && L._map_id_counter) {
      return { counter: L._map_id_counter };
    }

    // SVG viewBox로 역추적
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    return {
      leafletId,
      svgViewBox: svgEl ? svgEl.getAttribute('viewBox') : 'none',
      svgWidth: svgEl ? svgEl.getAttribute('width') : 'none',
      mapElSize: mapEl ? { w: mapEl.offsetWidth, h: mapEl.offsetHeight } : null
    };
  });

  console.log('\n=== Leaflet 초기화 후 상태 ===');
  console.log(JSON.stringify(leafletBounds, null, 2));

  await browser.close();
})();
