// 고정자산관리 시스템 - 화면 스크린샷 & 기본 동작 테스트
const { test, expect } = require('@playwright/test');
const path = require('path');

// index.html 파일 경로
const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

// JS가 초기화되어 대시보드가 활성화될 때까지 기다리는 헬퍼
async function waitForDashboard(page) {
  await page.goto(INDEX);
  // JS가 view에 .active 클래스를 붙일 때까지 대기
  await page.waitForSelector('#view-dashboard.active', { timeout: 10000 });
}

// 특정 뷰로 전환하고 활성화될 때까지 기다리는 헬퍼
async function switchView(page, viewName) {
  await page.click(`[data-view="${viewName}"]`);
  await page.waitForSelector(`#view-${viewName}.active`, { timeout: 5000 });
}

// ── 스크린샷 캡처 ──────────────────────────────────────────────
test('대시보드 스크린샷 @screenshot', async ({ page }) => {
  await waitForDashboard(page);
  await page.screenshot({ path: 'test-results/01_대시보드.png', fullPage: false });
});

test('자산목록 스크린샷 @screenshot', async ({ page }) => {
  await waitForDashboard(page);
  await switchView(page, 'list');
  await page.screenshot({ path: 'test-results/02_자산목록.png', fullPage: false });
});

test('자산상세 스크린샷 @screenshot', async ({ page }) => {
  await waitForDashboard(page);
  await switchView(page, 'list');
  // 자산목록 안의 첫 번째 행 클릭
  const firstRow = page.locator('#view-list table tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 5000 });
  await firstRow.click();
  await page.waitForSelector('#view-detail.active', { timeout: 5000 });
  await page.screenshot({ path: 'test-results/03_자산상세.png', fullPage: false });
});

// ── 기본 동작 테스트 ───────────────────────────────────────────
test('페이지가 정상적으로 열린다', async ({ page }) => {
  await page.goto(INDEX);
  await expect(page.locator('body')).toBeVisible();
});

test('대시보드 화면이 표시된다', async ({ page }) => {
  await waitForDashboard(page);
  await expect(page.locator('#view-dashboard')).toBeVisible();
});

test('원장관리로 전환되고 표가 나타난다', async ({ page }) => {
  await waitForDashboard(page);
  await switchView(page, 'list');
  // 자산목록 화면과 데이터 테이블 확인
  await expect(page.locator('#view-list')).toBeVisible();
  const rows = page.locator('#view-list table tbody tr');
  await expect(rows.first()).toBeVisible();
});
