// Windows 스크린샷 API로 캡처
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--no-sandbox'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  await page.goto(INDEX);

  // 인증 우회
  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(3000);

  // 방법 1: cdp를 통한 스크린샷
  const cdpSession = await context.newCDPSession(page);
  const { data } = await cdpSession.send('Page.captureScreenshot', {
    format: 'png',
    quality: 100,
    captureBeyondViewport: false,
    fromSurface: true  // 화면 표면에서 직접 캡처 (합성 레이어 포함)
  });

  fs.writeFileSync(path.join(__dirname, '../test-results/map-cdp.png'), Buffer.from(data, 'base64'));
  console.log('CDP 스크린샷 저장: test-results/map-cdp.png');

  // 지도 영역 클리핑
  const mapRect = await page.evaluate(() => {
    var el = document.getElementById('map-box');
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
  });

  if (mapRect) {
    const { data: clippedData } = await cdpSession.send('Page.captureScreenshot', {
      format: 'png',
      clip: { ...mapRect, scale: 1 },
      fromSurface: true
    });
    fs.writeFileSync(path.join(__dirname, '../test-results/map-cdp-clip.png'), Buffer.from(clippedData, 'base64'));
    console.log('CDP 클립 스크린샷 저장: test-results/map-cdp-clip.png');
  }

  await browser.close();
})();
