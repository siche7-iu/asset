const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('file:///D:/ATG_PJ/asset/index.html');
  await page.waitForTimeout(1000);

  // 인증
  const pw = await page.$('#site-auth-input') || await page.$('input[type="password"]');
  if (pw) {
    await pw.fill('NH@fams2026!');
    const ok = await page.$('#site-auth-ok') || await page.$('button');
    if (ok) await ok.click();
  }

  await page.waitForSelector('#view-dashboard', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(2000);

  // 서울 마커 hover
  await page.evaluate(() => {
    const marker = document.querySelector('.region-marker[data-i="0"]');
    if (marker) marker.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  });
  await page.waitForTimeout(400);

  // 지도 패널(.panel.dg-right) 클로즈업
  const panel = await page.$('.panel.dg-right');
  if (panel) {
    await panel.screenshot({ path: 'D:/ATG_PJ/asset/tests/callout-zoom.png' });
    console.log('저장: tests/callout-zoom.png');
  }

  await browser.close();
})();
