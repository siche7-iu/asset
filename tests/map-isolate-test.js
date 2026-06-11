// 실제 대시보드와 동일한 조건에서 div만 달리하여 테스트
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);
  await page.waitForTimeout(300);

  // 대시보드와 유사한 조건으로 map div 생성
  await page.evaluate(() => {
    // 기존 콘텐츠 유지하면서 추가 div 생성
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;top:10px;right:10px;width:340px;height:460px;background:#fff;border-radius:14px;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:visible;';

    var mapDiv = document.createElement('div');
    mapDiv.id = 'test-map-iso';
    mapDiv.style.cssText = 'width:332px;height:332px;overflow:hidden;flex:none;';

    wrapper.appendChild(mapDiv);
    document.body.appendChild(wrapper);

    var topo = window.MUNICIPALITIES_TOPO;
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    var testMap = L.map(mapDiv, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, doubleClickZoom: false, dragging: false
    });

    var layer = L.geoJSON(geojson, {
      style: function(f) {
        var prefix = (f.properties.code||'').substring(0,2);
        var fills = { '11':'#1E3A8A', '21':'#2563EB', '22':'#2563EB', '23':'#1E3A8A',
                       '24':'#3B82F6', '25':'#1E3A8A', '26':'#2563EB', '29':'#1E3A8A',
                       '31':'#1E3A8A', '32':'#60A5FA', '33':'#1E3A8A', '34':'#1E3A8A',
                       '35':'#3B82F6', '36':'#3B82F6', '37':'#2563EB', '38':'#2563EB', '39':'#BFDBFE' };
        return { fillColor: fills[prefix] || '#D1D5DB', fillOpacity: 0.85, color: '#fff', weight: 0.5 };
      }
    }).addTo(testMap);

    var bounds = layer.getBounds();
    testMap.fitBounds(bounds, { padding: [6, 6], animate: false });

    window._isoMap = testMap;
  });

  await page.waitForTimeout(500);

  var wrapperEl = await page.$('div[style*="top:10px;right:10px"]');
  if (wrapperEl) {
    const shot = await wrapperEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-iso-wrapper.png'), shot);
  }

  var mapEl = await page.$('#test-map-iso');
  if (mapEl) {
    const shot = await mapEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-iso-map.png'), shot);
    console.log('분리 테스트 스크린샷 저장');
  }

  await browser.close();
})();
