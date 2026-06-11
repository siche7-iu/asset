// TopoJSON 데이터 구조 확인
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.waitForTimeout(500);

  const topoInfo = await page.evaluate(() => {
    var topo = window.MUNICIPALITIES_TOPO;
    if (!topo) return { error: 'no topo' };

    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    // 첫 5개 feature의 properties 확인
    var samples = geojson.features.slice(0, 10).map(function(f) {
      return { props: f.properties, geomType: f.geometry ? f.geometry.type : 'none' };
    });

    // code prefix 분포 확인
    var prefixCounts = {};
    geojson.features.forEach(function(f) {
      var code = (f.properties.code || f.properties.CTP_KOR_NM || '').substring(0, 2);
      prefixCounts[code] = (prefixCounts[code] || 0) + 1;
    });

    return {
      totalFeatures: geojson.features.length,
      samples,
      prefixCounts
    };
  });

  console.log('=== TopoJSON 정보 ===');
  console.log(JSON.stringify(topoInfo, null, 2));

  await browser.close();
})();
