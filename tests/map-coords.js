// SVG 좌표계 상세 분석
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    if (!svgEl) return { error: 'no svg' };

    // SVG 전체 속성
    var attrs = {};
    for (var i = 0; i < svgEl.attributes.length; i++) {
      attrs[svgEl.attributes[i].name] = svgEl.attributes[i].value;
    }

    // 첫 path의 transform
    var firstPath = svgEl.querySelector('path');
    var firstPathTransform = firstPath ? firstPath.getAttribute('transform') : 'none';

    // g 요소들 transform
    var gs = svgEl.querySelectorAll('g');
    var gTransforms = [];
    gs.forEach(function(g) {
      gTransforms.push({ class: g.className.baseVal, transform: g.getAttribute('transform') });
    });

    // leaflet-zoom-animated 요소
    var zoomAnim = svgEl.querySelector('.leaflet-zoom-animated');
    var zoomAnimTransform = zoomAnim ? zoomAnim.getAttribute('transform') : 'none';

    // mapEl의 inline style
    var mapStyle = mapEl.getAttribute('style');

    // 실제 path 개수와 첫번째 path의 d 속성 (전체)
    var paths = svgEl.querySelectorAll('path');
    var firstD = paths[0] ? paths[0].getAttribute('d') : 'none';

    // SVG getBBox (SVG 좌표계 기준 bounding box)
    var svgBBox;
    try { svgBBox = svgEl.getBBox ? JSON.stringify(svgEl.getBBox()) : 'n/a'; }
    catch(e) { svgBBox = 'error: ' + e.message; }

    return {
      svgAttrs: attrs,
      firstPathTransform,
      gTransforms,
      zoomAnimTransform,
      mapStyle,
      pathCount: paths.length,
      firstD: firstD.substring(0, 200),
      svgBBox
    };
  });

  console.log('=== SVG 좌표계 분석 ===');
  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();
