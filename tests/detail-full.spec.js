const { test } = require('@playwright/test');
const path = require('path');
const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
test('자산상세 풀페이지', async ({ page }) => {
  await page.goto(INDEX);
  await page.waitForSelector('#view-dashboard.active', { timeout: 10000 });
  await page.click('[data-view="list"]');
  await page.waitForSelector('#view-list.active', { timeout: 5000 });
  await page.locator('#view-list table tbody tr').first().click();
  await page.waitForSelector('#view-detail.active', { timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/detail-full.png', fullPage: true });
});
