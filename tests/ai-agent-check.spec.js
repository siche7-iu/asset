// AI Agent 화면 동작 검증
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

test('AI Agent 화면이 정상 진입한다', async ({ page }) => {
  await page.goto(FILE_URL);
  await page.click('button[data-view="ai-agent"]');
  await expect(page.locator('#view-ai-agent')).toBeVisible();
  await expect(page.locator('.ai-page-title h1')).toHaveText('AI Agent');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/ai-01-진입.png', fullPage: true });
});

test('시나리오 1: 노후 PC 추천 질문 클릭 → 답변 출력 → 자산 클릭 → 우측 상세', async ({ page }) => {
  await page.goto(FILE_URL);
  await page.click('button[data-view="ai-agent"]');
  await page.waitForSelector('#suggest-list .suggest-item');

  // 첫 번째 추천 질문 클릭
  await page.click('#suggest-list .suggest-item:first-child');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/ai-02-분석중.png', fullPage: true });

  // 답변 카드 등장 대기 (약 2.2초)
  await page.waitForSelector('.msg.agent.answer', { timeout: 4000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/ai-03-답변완료.png', fullPage: true });

  // 첫 번째 자산 행 클릭
  await page.click('.answer-table tbody tr:first-child');
  await page.waitForTimeout(400);
  await expect(page.locator('#ai-right')).toHaveClass(/detail-mode/);
  await page.screenshot({ path: 'test-results/ai-04-자산상세.png', fullPage: true });
});

test('시나리오 2: 보험 만료 차량 → 답변 → 보험계약 클릭', async ({ page }) => {
  await page.goto(FILE_URL);
  await page.click('button[data-view="ai-agent"]');
  await page.waitForSelector('#suggest-list .suggest-item');

  // 두 번째 추천 질문 클릭
  await page.click('#suggest-list .suggest-item:nth-child(2)');
  await page.waitForSelector('.msg.agent.answer', { timeout: 4000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/ai-05-차량답변.png', fullPage: true });

  // 차량 첫 행 클릭
  await page.click('.answer-table tbody tr:first-child');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test-results/ai-06-차량상세.png', fullPage: true });
});

test('+ 새 분석 시작 클릭 시 채팅·우측 패널 초기화', async ({ page }) => {
  await page.goto(FILE_URL);
  await page.click('button[data-view="ai-agent"]');
  await page.click('#suggest-list .suggest-item:first-child');
  await page.waitForSelector('.msg.agent.answer', { timeout: 4000 });

  // 새 분석 시작 버튼
  await page.click('text=+ 새 분석 시작');
  await page.waitForTimeout(200);
  // 답변 카드 없고 인사 메시지만 남음
  await expect(page.locator('.msg.agent.answer')).toHaveCount(0);
  await expect(page.locator('.msg.agent')).toHaveCount(1);
});
