// 실제 대시보드에서 Canvas renderer 테스트
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(INDEX);

  // 인증 우회 후 대시보드 로드
  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(2500);

  // Canvas renderer로 교체 테스트
  await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    if (!mapEl) return;

    // 기존 Leaflet 맵 제거
    if (mapEl._leaflet_id) {
      // Leaflet 1.9에서 맵 제거 방법
      var existingMap = Object.values(L.Map._instances || {}).find(function(m) {
        return m.getContainer && m.getContainer() === mapEl;
      });
      if (existingMap) existingMap.remove();
    }

    // innerHTML 초기화
    mapEl.innerHTML = '';

    // Canvas renderer로 새 맵 생성
    var topo = window.MUNICIPALITIES_TOPO;
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    var REGION_FILL = ['#1E3A8A','#2563EB','#3B82F6','#60A5FA','#BFDBFE'];
    var REGION_CODE_MAP = {
      '11':0,'23':0,'25':0,'29':0,'31':0,'33':0,'34':0,
      '32':1,
      '21':2,'22':2,'26':2,'37':2,'38':2,
      '24':3,'35':3,'36':3,
      '39':4
    };

    var canvasRenderer = L.canvas({ padding: 0.1 });
    var newMap = L.map(mapEl, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, doubleClickZoom: false, dragging: false,
      renderer: canvasRenderer
    });

    var geoLayer = L.geoJSON(geojson, {
      style: function(feat) {
        var prefix = (feat.properties.code||'').substring(0,2);
        var ri = REGION_CODE_MAP[prefix];
        return { color: '#fff', weight: 0.5, fillColor: ri !== undefined ? REGION_FILL[ri] : '#D1D5DB', fillOpacity: 0.85 };
      },
      renderer: canvasRenderer
    }).addTo(newMap);

    var bounds = geoLayer.getBounds();
    newMap.fitBounds(bounds, { padding: [6, 6], animate: false });

    window._testCanvasMap = newMap;

    var canvases = mapEl.querySelectorAll('canvas');
    console.log('canvas 수:', canvases.length);
  });

  await page.waitForTimeout(500);

  var panelEl = await page.$('.dr-map-card');
  if (panelEl) {
    const panelShot = await panelEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-canvas-real.png'), panelShot);
  }

  var mapEl = await page.$('#map-box');
  if (mapEl) {
    const mapShot = await mapEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-canvas-real-map.png'), mapShot);
  }

  console.log('Canvas renderer 스크린샷 저장 완료');
  await browser.close();
})();
