const { test } = require('@playwright/test');
const path = require('path');

test('지도 말풍선 스크린샷', async ({ page }) => {
  const filePath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
  await page.goto(filePath + '#/dashboard');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/map-check.png', fullPage: false });
});
