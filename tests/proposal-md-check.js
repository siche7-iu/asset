const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file:///D:/ATG_PJ/asset/index.html');
  await page.waitForTimeout(1500);

  // 비밀번호 입력 → 프로젝트 관리 화면 진입
  await page.locator('#secret-ver').click();
  await page.waitForTimeout(300);
  await page.locator('#pw-input').fill('NH@fams2026!');
  await page.locator('#pw-input').press('Enter');
  await page.waitForTimeout(500);

  // 제안서 섹션으로 스크롤
  await page.locator('a[data-pj="pj-proposal"]').click();
  await page.waitForTimeout(400);

  // 버튼 존재 확인
  var btn = await page.locator('#btn-proposal-md-toggle');
  var visible = await btn.isVisible();
  console.log('버튼 표시:', visible);
  console.log('버튼 텍스트:', await btn.textContent());

  // 버튼 클릭 → 뷰어 열림 확인
  await btn.click();
  await page.waitForTimeout(300);
  var viewer = await page.locator('#proposal-md-viewer');
  var viewerVisible = await viewer.isVisible();
  console.log('뷰어 열림:', viewerVisible);

  // 스크린샷
  await page.screenshot({ path: 'test-results/proposal-md.png' });
  console.log('스크린샷: test-results/proposal-md.png');

  await browser.close();
})();
