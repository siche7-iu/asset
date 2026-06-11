const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('file:///D:/ATG_PJ/asset/index.html');

  // 비밀번호 처리 (사이트 진입 인증 — #site-auth-input / #site-auth-ok)
  await page.waitForSelector('#site-auth-input', { timeout: 5000 });
  await page.fill('#site-auth-input', 'NH@fams2026!');
  const btn = await page.$('#site-auth-ok');
  if (btn) await btn.click(); else await page.keyboard.press('Enter');

  await page.waitForSelector('#view-dashboard', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(2000);

  // 1. 기본 상태(SVG 지도) 스크린샷
  const mapCard = await page.$('.dr-map-card');
  if (mapCard) await mapCard.screenshot({ path: 'D:/ATG_PJ/asset/tests/toggle-off.png' });

  // 토글 존재 확인
  const toggle = await page.$('#map-mode-cb');
  const toggleLabel = await page.$('.map-mode-toggle');
  console.log('toggle exists:', !!toggle);
  console.log('toggle label exists:', !!toggleLabel);

  // SVG 지도 표시 확인
  const svgBoxVisible = await page.$eval('#map-box-svg', el => el.style.display !== 'none' && el.offsetParent !== null).catch(() => false);
  const lfBoxHidden = await page.$eval('#map-box', el => el.style.display === 'none').catch(() => false);
  console.log('SVG box visible (default):', svgBoxVisible);
  console.log('Leaflet box hidden (default):', lfBoxHidden);

  // 2. 토글 ON → Leaflet 지도
  // #map-mode-cb는 CSS로 숨겨진 checkbox이므로 dispatchEvent로 클릭
  if (toggle) {
    await page.evaluate(() => {
      const cb = document.getElementById('map-mode-cb');
      if (cb) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(3000); // Leaflet lazy init 대기
    if (mapCard) await mapCard.screenshot({ path: 'D:/ATG_PJ/asset/tests/toggle-on.png' });
    const svgHidden = await page.$eval('#map-box-svg', el => el.style.display === 'none').catch(() => false);
    const lfVisible = await page.$eval('#map-box', el => el.style.display !== 'none').catch(() => false);
    const pathCount = await page.$eval('#map-box', el => el.querySelectorAll('path').length).catch(() => 0);
    console.log('SVG box hidden (toggle ON):', svgHidden);
    console.log('Leaflet box visible (toggle ON):', lfVisible);
    console.log('Leaflet path count:', pathCount);
  }

  await browser.close();
  console.log('검수 완료');
})();
