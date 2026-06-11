// map-box 조상 요소 overflow/transform 확인
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

  const ancestors = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    if (!mapEl) return [];

    var result = [];
    var el = mapEl.parentElement;
    while (el && el !== document.documentElement) {
      var cs = window.getComputedStyle(el);
      var rect = el.getBoundingClientRect();
      result.push({
        tag: el.tagName,
        id: el.id || '-',
        class: (el.className || '').substring(0, 50),
        overflow: cs.overflow,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        transform: cs.transform,
        position: cs.position,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
      el = el.parentElement;
    }
    return result;
  });

  console.log('=== map-box 조상 요소들 ===');
  ancestors.forEach(function(a) {
    var hasOverflow = a.overflow !== 'visible' && a.overflow !== 'none';
    var hasTransform = a.transform && a.transform !== 'none';
    if (hasOverflow || hasTransform) {
      console.log('⚠️ ' + JSON.stringify(a));
    } else {
      console.log('   ' + a.tag + '#' + a.id + '.' + a.class + ' overflow:' + a.overflow + ' transform:' + (a.transform ? 'Y' : 'N'));
    }
  });

  await browser.close();
})();
