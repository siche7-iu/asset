// Canvas renderer 테스트
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    // Canvas renderer로 맵 생성
    var testDiv = document.createElement('div');
    testDiv.style.cssText = 'width:332px;height:332px;position:fixed;top:50px;left:50px;overflow:hidden;z-index:9999;';
    document.body.appendChild(testDiv);

    var topo = window.MUNICIPALITIES_TOPO;
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    var canvasRenderer = L.canvas({ padding: 0.1 });

    var testMap = L.map(testDiv, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, doubleClickZoom: false, dragging: false,
      renderer: canvasRenderer
    });

    var layer = L.geoJSON(geojson, {
      style: { fillColor: '#3B82F6', fillOpacity: 0.85, color: '#fff', weight: 0.5 },
      renderer: canvasRenderer
    }).addTo(testMap);

    var bounds = layer.getBounds();
    testMap.fitBounds(bounds, { padding: [6, 6], animate: false });

    var canvases = testDiv.querySelectorAll('canvas');
    var svgs = testDiv.querySelectorAll('svg');

    return {
      zoom: testMap.getZoom(),
      canvasCount: canvases.length,
      svgCount: svgs.length,
      pathCount: testDiv.querySelectorAll('path').length
    };
  });

  console.log('=== Canvas Renderer 결과 ===');
  console.log(JSON.stringify(result, null, 2));

  var testMapEl = await page.$('[style*="top:50px"]');
  if (testMapEl) {
    await testMapEl.screenshot({ path: 'test-results/map-canvas-test.png' });
    console.log('Canvas 스크린샷 저장');
  }

  await browser.close();
})();
