// pngjs 없이 픽셀 색상 확인 (elementFromPoint 방식)
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

  const samples = await page.evaluate(() => {
    var results = [];

    // path bbox: top=400, bottom=706, left=1040, right=1328
    // mapbox: top=421, bottom=753, left=1051, right=1383
    var checkPoints = [
      [1100, 450],   // mapbox 내 왼쪽 위
      [1150, 500],   //
      [1184, 553],   // path들 중앙 근처
      [1200, 600],   //
      [1250, 650],   // mapbox 내 중앙
      [1300, 700],   // mapbox 내 오른쪽 아래
      [1100, 600],   //
    ];

    checkPoints.forEach(function(pt) {
      var x = pt[0], y = pt[1];
      // elementFromPoint는 가장 위의 요소만 반환
      var el = document.elementFromPoint(x, y);
      if (el) {
        var cs = window.getComputedStyle(el);
        results.push({
          x, y,
          tag: el.tagName,
          class: (el.className || '').substring(0, 40),
          bg: cs.backgroundColor,
          fill: cs.fill
        });
      }
    });
    return results;
  });

  console.log('=== 픽셀 색상 샘플 ===');
  samples.forEach(function(s) {
    console.log(JSON.stringify(s));
  });

  await browser.close();
})();
