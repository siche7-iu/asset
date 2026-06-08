const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file:///D:/ATG_PJ/asset/index.html');
  await page.waitForTimeout(1800);

  // 제주(index 4) 마커 호버
  await page.locator('.region-marker[data-i="4"]').hover();
  await page.waitForTimeout(600);

  // 제주 확장 말풍선 위치 측정
  var callout = await page.locator('#callout-exp-4').boundingBox();
  var panel = await page.locator('.dg-bot').boundingBox();
  var mapBox = await page.locator('.map-box').boundingBox();

  console.log('제주 callout:', JSON.stringify({ x: Math.round(callout.x), y: Math.round(callout.y), w: Math.round(callout.width), h: Math.round(callout.height) }));
  console.log('dg-bot panel:', JSON.stringify({ x: Math.round(panel.x), y: Math.round(panel.y), w: Math.round(panel.width), h: Math.round(panel.height) }));
  console.log('map-box:', JSON.stringify({ x: Math.round(mapBox.x), y: Math.round(mapBox.y), w: Math.round(mapBox.width), h: Math.round(mapBox.height) }));

  // dg-right z-index 확인
  var zIndex = await page.evaluate(function() {
    var el = document.querySelector('.dg-right');
    return window.getComputedStyle(el).zIndex;
  });
  console.log('dg-right z-index:', zIndex);

  // 스크린샷 저장
  await page.screenshot({
    path: 'test-results/jeju-callout.png',
    clip: { x: 0, y: Math.max(0, panel.y - 50), width: 1920, height: 500 }
  });
  console.log('스크린샷 저장: test-results/jeju-callout.png');

  await browser.close();
})();
