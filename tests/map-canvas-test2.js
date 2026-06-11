// Canvas renderer 테스트 v2 - 스크린샷 경로 수정
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  await page.goto(INDEX);
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    // 전체 페이지를 간단하게 만들기 위해 body 초기화
    document.body.innerHTML = '<div id="test-map" style="width:400px;height:400px;"></div>';

    var testDiv = document.getElementById('test-map');
    var topo = window.MUNICIPALITIES_TOPO;

    if (!topo || !window.topojson || !window.L) {
      document.body.innerHTML += '<p style="color:red">라이브러리 없음</p>';
      return;
    }

    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    var testMap = L.map(testDiv, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, doubleClickZoom: false, dragging: false
    });

    var layer = L.geoJSON(geojson, {
      style: { fillColor: '#3B82F6', fillOpacity: 0.85, color: '#fff', weight: 0.5 }
    }).addTo(testMap);

    var bounds = layer.getBounds();
    testMap.fitBounds(bounds, { padding: [10, 10], animate: false });

    window._testMap = testMap;
  });

  await page.waitForTimeout(500);

  // 스크린샷
  const screenshot = await page.screenshot({ type: 'png' });
  if (!fs.existsSync(path.join(__dirname, '../test-results'))) {
    fs.mkdirSync(path.join(__dirname, '../test-results'), { recursive: true });
  }
  fs.writeFileSync(path.join(__dirname, '../test-results/map-canvas-test2.png'), screenshot);
  console.log('스크린샷 저장: test-results/map-canvas-test2.png');

  const mapEl = await page.$('#test-map');
  if (mapEl) {
    const mapShot = await mapEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-canvas-test2-map.png'), mapShot);
    console.log('맵 스크린샷 저장: test-results/map-canvas-test2-map.png');
  }

  await browser.close();
})();
