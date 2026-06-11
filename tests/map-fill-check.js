// path fill 색상 및 실제 표시 상태 확인
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

  await page.waitForTimeout(1200);

  const fillInfo = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    if (!svgEl) return { error: 'no svg' };

    var paths = svgEl.querySelectorAll('path');

    // 처음 5개 path의 스타일 확인
    var pathStyles = [];
    for (var i = 0; i < Math.min(paths.length, 5); i++) {
      var p = paths[i];
      var cs = window.getComputedStyle(p);
      pathStyles.push({
        fill: cs.fill,
        fillOpacity: cs.fillOpacity,
        stroke: cs.stroke,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        attrFill: p.getAttribute('fill'),
        attrStyle: p.getAttribute('style')
      });
    }

    // leaflet-overlay-pane 의 computed style
    var pane = mapEl.querySelector('.leaflet-overlay-pane');
    var paneCS = window.getComputedStyle(pane);

    // map-box 자체의 computed style
    var mapCS = window.getComputedStyle(mapEl);

    return {
      pathStyles,
      paneDisplay: paneCS.display,
      paneVisibility: paneCS.visibility,
      paneOverflow: paneCS.overflow,
      paneOpacity: paneCS.opacity,
      mapOverflow: mapCS.overflow,
      mapWidth: mapCS.width,
      mapHeight: mapCS.height
    };
  });

  console.log('=== Fill 색상 및 표시 상태 ===');
  console.log(JSON.stringify(fillInfo, null, 2));

  // 200ms 더 기다린 후 스크린샷
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/map-fill.png', fullPage: false });

  var panelEl = await page.$('.dr-map-card');
  if (panelEl) await panelEl.screenshot({ path: 'test-results/map-fill-panel.png' });

  await browser.close();
})();
