const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('file:///D:/ATG_PJ/asset/index.html');
  await page.waitForTimeout(2000);

  const authOverlay = await page.$eval('#auth-overlay', el => ({
    exists: true,
    display: el.style.display,
    classList: el.className
  })).catch(() => ({ exists: false }));

  const authPassword = await page.$('#auth-password');
  const authSubmit = await page.$('#auth-submit');
  const viewDashboard = await page.$eval('#view-dashboard', el => el.style.display).catch(() => 'NOT FOUND');

  console.log('auth-overlay:', JSON.stringify(authOverlay));
  console.log('auth-password exists:', !!authPassword);
  console.log('auth-submit exists:', !!authSubmit);
  console.log('view-dashboard display:', viewDashboard);

  // 모든 input 요소
  const inputs = await page.$$eval('input', els => els.map(el => ({ id: el.id, type: el.type, name: el.name })));
  console.log('inputs:', JSON.stringify(inputs));

  // 모든 버튼
  const buttons = await page.$$eval('button', els => els.map(el => ({ id: el.id, text: el.textContent.trim().substring(0, 30) })));
  console.log('buttons:', JSON.stringify(buttons));

  await browser.close();
})();
