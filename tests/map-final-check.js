const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('file:///D:/ATG_PJ/asset/index.html');

  // 비밀번호 팝업 처리
  await page.waitForSelector('#site-auth-input', { timeout: 5000 });
  await page.fill('#site-auth-input', 'NH@fams2026!');
  await page.click('#site-auth-ok');

  // 대시보드 로드 대기 (Leaflet 1050ms delay + 애니메이션 포함, 4초)
  await page.waitForSelector('#view-dashboard', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(4000);

  // 지도 영역만 클로즈업 스크린샷
  const mapEl = await page.$('#map-box');
  if (mapEl) {
    await mapEl.screenshot({ path: 'D:/ATG_PJ/asset/tests/map-final-check.png' });
    console.log('지도 클로즈업 저장: tests/map-final-check.png');
  }

  // 전체 화면도 저장
  await page.screenshot({ path: 'D:/ATG_PJ/asset/tests/dashboard-final-check.png', fullPage: false });
  console.log('대시보드 전체 저장: tests/dashboard-final-check.png');

  await browser.close();
})();
