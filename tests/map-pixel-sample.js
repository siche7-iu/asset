// 특정 좌표의 픽셀 색상 직접 확인
const { chromium } = require('@playwright/test');
const path = require('path');
const { PNG } = require('pngjs');
const fs = require('fs');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  // pngjs 없으면 직접 확인
  let hasPNG = false;
  try { require.resolve('pngjs'); hasPNG = true; } catch(e) {}

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(1500);

  // 지도 중앙 픽셀 색상 샘플링 (Canvas API 사용)
  const pixelSamples = await page.evaluate(() => {
    // 지도 영역의 여러 지점 픽셀 색상 확인
    var mapEl = document.getElementById('map-box');
    if (!mapEl) return null;

    var rect = mapEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    // HTML2Canvas는 없으므로 다른 방법: getComputedStyle로 background-color 확인
    var samples = [];
    var points = [
      [cx, cy],
      [cx - 50, cy],
      [cx + 50, cy],
      [cx, cy - 50],
      [cx, cy + 50],
      // path bbox 내부 포인트 (top: 400~706, left: 1040~1328)
      [1184, 550],
      [1200, 580],
      [1160, 600],
    ];

    points.forEach(function(pt) {
      var el = document.elementFromPoint(pt[0], pt[1]);
      if (el) {
        var cs = window.getComputedStyle(el);
        samples.push({
          x: Math.round(pt[0]),
          y: Math.round(pt[1]),
          tag: el.tagName,
          id: el.id,
          class: el.className,
          bg: cs.backgroundColor,
          fill: cs.fill
        });
      }
    });

    return samples;
  });

  console.log('=== 픽셀 색상 샘플 ===');
  console.log(JSON.stringify(pixelSamples, null, 2));

  // 스크린샷 저장 후 픽셀 분석
  const screenshotBuffer = await page.screenshot({ type: 'png' });
  fs.writeFileSync('test-results/map-pixel-raw.png', screenshotBuffer);
  console.log('스크린샷 저장 완료');

  if (hasPNG) {
    // PNG 파싱해서 특정 픽셀 색상 직접 확인
    const png = PNG.sync.read(screenshotBuffer);
    const mapTop = 421, mapLeft = 1051;
    const checkPoints = [
      [mapLeft + 100, mapTop + 100],
      [mapLeft + 166, mapTop + 166],  // 중앙
      [mapLeft + 100, mapTop + 200],
    ];

    checkPoints.forEach(function(pt) {
      var x = pt[0], y = pt[1];
      var idx = (y * png.width + x) * 4;
      var r = png.data[idx], g = png.data[idx+1], b = png.data[idx+2], a = png.data[idx+3];
      console.log('픽셀 (' + x + ', ' + y + '): rgb(' + r + ',' + g + ',' + b + ') a=' + a);
    });
  }

  await browser.close();
})();
