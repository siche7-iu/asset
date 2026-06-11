// SVG path 위치 및 변환 행렬 확인
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

  await page.waitForTimeout(1500);

  const svgInfo = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    if (!svgEl) return { error: 'no svg' };

    // g 요소의 transform 확인
    var gEls = svgEl.querySelectorAll('g');
    var gInfo = [];
    for (var i = 0; i < Math.min(gEls.length, 5); i++) {
      gInfo.push({
        class: gEls[i].className,
        transform: gEls[i].getAttribute('transform')
      });
    }

    // 첫 path의 d 속성 샘플 (앞 100자)
    var paths = svgEl.querySelectorAll('path');
    var firstPath = paths[0];
    var firstPathD = firstPath ? (firstPath.getAttribute('d') || '').substring(0, 100) : 'none';

    // path들의 bounding box 확인 (처음 5개)
    var pathBBoxes = [];
    for (var j = 0; j < Math.min(paths.length, 3); j++) {
      try {
        var bb = paths[j].getBoundingClientRect();
        pathBBoxes.push({ top: Math.round(bb.top), left: Math.round(bb.left), w: Math.round(bb.width), h: Math.round(bb.height) });
      } catch(e) {
        pathBBoxes.push({ error: e.message });
      }
    }

    // leaflet-overlay-pane 스타일
    var pane = mapEl.querySelector('.leaflet-overlay-pane');
    var paneStyle = pane ? window.getComputedStyle(pane) : null;

    return {
      svgTransform: svgEl.getAttribute('transform'),
      svgStyle: svgEl.getAttribute('style'),
      gInfo,
      firstPathD,
      pathBBoxes,
      paneDisplay: paneStyle ? paneStyle.display : 'n/a',
      panePosition: paneStyle ? paneStyle.position : 'n/a',
      paneWidth: paneStyle ? paneStyle.width : 'n/a',
      paneHeight: paneStyle ? paneStyle.height : 'n/a'
    };
  });

  console.log('=== SVG 정보 ===');
  console.log(JSON.stringify(svgInfo, null, 2));

  await browser.close();
})();
