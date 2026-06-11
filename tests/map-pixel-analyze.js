// 지도 영역 픽셀 색상 직접 분석 (Canvas 통해)
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--force-device-scale-factor=1']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(2500);

  // Page.captureScreenshot with clip to map area
  const mapRect = await page.evaluate(() => {
    var el = document.getElementById('map-box');
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });

  console.log('map-box rect:', mapRect);

  if (mapRect) {
    // 지도 영역만 클리핑해서 스크린샷
    const clipped = await page.screenshot({
      clip: mapRect,
      type: 'png'
    });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-clip.png'), clipped);
    console.log('클리핑 스크린샷: test-results/map-clip.png');

    // 내부에서 Canvas API로 픽셀 읽기
    const pixelData = await page.evaluate(async (rect) => {
      // html2canvas 없으므로 다른 방법
      // screenshot API가 합성 레이어까지 캡처하는지 확인하기 위해
      // 특정 픽셀의 색상을 canvas를 통해 읽기 시도

      // 지도 영역 중앙 픽셀들의 실제 색상 (브라우저 렌더링 기준)
      // window.getComputedStyle이나 elementFromPoint로는 SVG fill 색상 읽기 불가

      return {
        mapCenter: {
          x: Math.round(rect.x + rect.width / 2),
          y: Math.round(rect.y + rect.height / 2)
        }
      };
    }, mapRect);

    console.log('픽셀 데이터:', pixelData);
  }

  // 추가: --disable-gpu 없이 GPU 가속 사용 (합성 레이어 캡처에 필요)
  // Playwright의 page.screenshot은 기본적으로 모든 레이어를 캡처해야 함
  // 하지만 clip 옵션을 사용하면 다를 수 있음

  // elementScreenshot 시도
  var mapEl = await page.$('#map-box');
  if (mapEl) {
    const mapElShot = await mapEl.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-element.png'), mapElShot);
    console.log('element 스크린샷: test-results/map-element.png');
  }

  await browser.close();
})();
