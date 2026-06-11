// Leaflet 내부 DOM 구조 분석
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

  const structure = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    if (!mapEl) return { error: 'no mapEl' };

    // map-box의 직접 자식들
    var children = [];
    for (var i = 0; i < mapEl.children.length; i++) {
      var child = mapEl.children[i];
      var cs = window.getComputedStyle(child);
      var childRect = child.getBoundingClientRect();
      children.push({
        tag: child.tagName,
        class: child.className,
        position: cs.position,
        width: cs.width,
        height: cs.height,
        zIndex: cs.zIndex,
        top: cs.top,
        left: cs.left,
        rectTop: Math.round(childRect.top),
        rectLeft: Math.round(childRect.left),
        rectW: Math.round(childRect.width),
        rectH: Math.round(childRect.height)
      });
    }

    // leaflet-map-pane 확인
    var mapPane = mapEl.querySelector('.leaflet-map-pane');
    var mapPaneCS = mapPane ? window.getComputedStyle(mapPane) : null;
    var mapPaneRect = mapPane ? mapPane.getBoundingClientRect() : null;

    // leaflet-overlay-pane 확인
    var overlayPane = mapEl.querySelector('.leaflet-overlay-pane');
    var overlayCS = overlayPane ? window.getComputedStyle(overlayPane) : null;
    var overlayRect = overlayPane ? overlayPane.getBoundingClientRect() : null;

    return {
      mapElPosition: window.getComputedStyle(mapEl).position,
      mapElRect: { top: Math.round(mapEl.getBoundingClientRect().top), left: Math.round(mapEl.getBoundingClientRect().left) },
      directChildren: children,
      mapPane: mapPane ? {
        transform: mapPane.style.transform,
        position: mapPaneCS.position,
        rectTop: Math.round(mapPaneRect.top),
        rectLeft: Math.round(mapPaneRect.left),
        rectW: Math.round(mapPaneRect.width),
        rectH: Math.round(mapPaneRect.height)
      } : null,
      overlayPane: overlayPane ? {
        position: overlayCS.position,
        width: overlayCS.width,
        height: overlayCS.height,
        rectTop: Math.round(overlayRect.top),
        rectLeft: Math.round(overlayRect.left),
        rectW: Math.round(overlayRect.width),
        rectH: Math.round(overlayRect.height)
      } : null
    };
  });

  console.log('=== Leaflet DOM 구조 ===');
  console.log(JSON.stringify(structure, null, 2));

  await browser.close();
})();
