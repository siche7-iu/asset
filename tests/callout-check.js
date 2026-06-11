const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('file:///D:/ATG_PJ/asset/index.html');

  // 인증 처리 (실제 selector 확인 후 처리)
  await page.waitForTimeout(1000);
  const pwInput = await page.$('#site-auth-input') || await page.$('#auth-password') || await page.$('input[type="password"]');
  if (pwInput) {
    await pwInput.fill('NH@fams2026!');
    const okBtn = await page.$('#site-auth-ok') || await page.$('#auth-submit') || await page.$('button');
    if (okBtn) await okBtn.click();
  }

  await page.waitForSelector('#view-dashboard', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(2000);

  // 서울 지역 마커(index 0)에 hover → 상세 말풍선 표시
  const seoulMarker = await page.$('.region-marker[data-i="0"] .cb-pin');
  if (seoulMarker) {
    await seoulMarker.hover();
    await page.waitForTimeout(300);
  }

  // 말풍선 위치 확인
  const calloutRect = await page.$eval('#callout-exp-0', el => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) };
  }).catch(() => null);

  console.log('서울 말풍선 위치:', JSON.stringify(calloutRect));
  console.log('화면 왼쪽 기준 left:', calloutRect ? calloutRect.left : 'N/A', '(음수면 화면 밖으로 잘림)');

  // 지도 카드 영역
  const cardRect = await page.$eval('.dr-map-card', el => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right) };
  }).catch(() => null);
  console.log('지도 카드 left:', cardRect ? cardRect.left : 'N/A');
  console.log('말풍선이 카드 왼쪽 밖에 있는가:', calloutRect && cardRect ? calloutRect.left < cardRect.left : 'N/A');

  // 스크린샷 (hover 상태)
  await page.screenshot({ path: 'D:/ATG_PJ/asset/tests/callout-check.png', fullPage: false });
  console.log('스크린샷 저장: tests/callout-check.png');

  await browser.close();
})();
