// 픽셀 색상 직접 확인 — 지도 영역의 실제 색상 샘플링
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

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

  // 지도 영역 좌표 가져오기
  const mapRect = await page.evaluate(() => {
    var el = document.getElementById('map-box');
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  });

  console.log('map-box 위치:', mapRect);

  // 전체 스크린샷에서 지도 영역만 크롭해서 픽셀 확인
  const screenshot = await page.screenshot({ type: 'png' });
  fs.writeFileSync('test-results/map-pixel.png', screenshot);

  // 지도 영역 중앙 픽셀 색상 직접 확인 (Canvas를 통해)
  const pixelColor = await page.evaluate((rect) => {
    // 캔버스에 화면 내용 그리기
    var canvas = document.createElement('canvas');
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    var ctx = canvas.getContext('2d');

    // map-box 요소를 캔버스에 그리기 시도
    var mapEl = document.getElementById('map-box');

    // 다른 방법: 특정 픽셀 위치의 실제 요소 확인
    var cx = Math.round(rect.left + rect.width / 2);
    var cy = Math.round(rect.top + rect.height / 2);

    var elements = document.elementsFromPoint(cx, cy);
    var elementInfo = elements.map(function(el) {
      var cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        class: el.className,
        bg: cs.backgroundColor,
        fill: cs.fill,
        zIndex: cs.zIndex
      };
    });

    return { cx, cy, elements: elementInfo };
  }, mapRect);

  console.log('=== 지도 중앙 픽셀 요소 ===');
  console.log(JSON.stringify(pixelColor, null, 2));

  // path의 getBoundingClientRect 확인 (실제 화면 좌표)
  const pathPositions = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    var svgEl = mapEl ? mapEl.querySelector('.leaflet-overlay-pane svg') : null;
    if (!svgEl) return [];

    var paths = svgEl.querySelectorAll('path');
    var mapRect = mapEl.getBoundingClientRect();
    var results = [];

    for (var i = 0; i < Math.min(paths.length, 10); i++) {
      var pr = paths[i].getBoundingClientRect();
      results.push({
        inMapArea: pr.top >= mapRect.top && pr.bottom <= mapRect.bottom &&
                   pr.left >= mapRect.left && pr.right <= mapRect.right,
        pathTop: Math.round(pr.top),
        pathLeft: Math.round(pr.left),
        pathW: Math.round(pr.width),
        pathH: Math.round(pr.height),
        mapTop: Math.round(mapRect.top),
        mapLeft: Math.round(mapRect.left)
      });
    }
    return results;
  });

  console.log('\n=== Path 위치 vs MapBox 위치 ===');
  console.log(JSON.stringify(pathPositions, null, 2));

  await browser.close();
})();
