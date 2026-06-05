// 비밀 버튼 → 프로젝트 관리 화면 동작 검증
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

async function dismissIntro(page) {
  const block = page.locator('.intro-block');
  if (await block.isVisible().catch(() => false)) {
    await block.click();
    await page.waitForTimeout(1100); // 페이드아웃 대기
  }
}

test('비밀 버튼 클릭 → 비밀번호 모달이 뜬다', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(FILE_URL);
  await dismissIntro(page);

  await expect(page.locator('#pw-modal')).not.toBeVisible();
  await page.click('#secret-ver');
  await expect(page.locator('#pw-modal')).toBeVisible();
  await page.screenshot({ path: 'test-results/pj-01-모달.png' });
  expect(errors).toEqual([]);
});

test('틀린 비밀번호 → 오류 표시, 진입 안 됨', async ({ page }) => {
  await page.goto(FILE_URL);
  await dismissIntro(page);
  await page.click('#secret-ver');
  await page.fill('#pw-input', '00000');
  await page.click('#pw-ok');
  await expect(page.locator('#pw-error')).toBeVisible();
  await expect(page.locator('#view-project')).not.toBeVisible();
});

test('정답(78963) + Enter → 프로젝트 관리 화면 진입', async ({ page }) => {
  await page.goto(FILE_URL);
  await dismissIntro(page);
  await page.click('#secret-ver');
  await page.fill('#pw-input', '78963');
  await page.press('#pw-input', 'Enter');

  await expect(page.locator('#view-project')).toBeVisible();
  await expect(page.locator('#project-nav')).toBeVisible();
  await expect(page.locator('#nav')).toBeHidden();
  await expect(page.locator('.pj-topbar-title')).toBeVisible();
  await page.screenshot({ path: 'test-results/pj-02-진입.png', fullPage: true });
});

test('트리 메뉴 클릭 → 해당 섹션으로 이동 + 활성 표시', async ({ page }) => {
  await page.goto(FILE_URL);
  await dismissIntro(page);
  await page.click('#secret-ver');
  await page.fill('#pw-input', '78963');
  await page.click('#pw-ok');
  await expect(page.locator('#view-project')).toBeVisible();

  await page.click('.pj-link[data-pj="pj-flow"]');
  await expect(page.locator('.pj-link[data-pj="pj-flow"]')).toHaveClass(/active/);
  await page.waitForTimeout(1200); // 페이지가 길어 부드러운 스크롤 완료 대기
  await expect(page.locator('#pj-flow')).toBeInViewport({ ratio: 0.05 });
  await page.screenshot({ path: 'test-results/pj-03-플로우.png', fullPage: true });
});

async function enterProject(page) {
  await page.goto(FILE_URL);
  await dismissIntro(page);
  await page.click('#secret-ver');
  await page.fill('#pw-input', '78963');
  await page.click('#pw-ok');
  await expect(page.locator('#view-project')).toBeVisible();
}

test('As-Is 하위 트리: 14개 화면 링크가 보이고, 클릭 시 해당 화면으로 이동', async ({ page }) => {
  await enterProject(page);
  // 하위 트리 기본 펼침 (As-Is pj-subgroup)
  const subgroups = page.locator('.pj-subgroup');
  await expect(subgroups.first()).toHaveClass(/open/);
  // As-Is 서브링크만 14개 (AI 서브링크 pj-ai-sublink 제외)
  const asIsSubLinks = page.locator('.pj-sublink:not(.pj-ai-sublink)');
  await expect(asIsSubLinks).toHaveCount(14);

  // 현행 개선 화면 하나 클릭 → 해당 스크린 섹션이 화면에 보임
  await page.click('.pj-sublink[data-pj="pjs-ps-tobe-vehicle"]');
  await page.waitForTimeout(500);
  await expect(page.locator('#pjs-ps-tobe-vehicle')).toBeInViewport({ ratio: 0.05 });
  await page.screenshot({ path: 'test-results/pj-04-asis갤러리.png', fullPage: true });
});

test('화면 이미지 클릭 → 라이트박스 열림, Esc로 닫힘', async ({ page }) => {
  await enterProject(page);
  await page.click('#pjs-ps-dash-main .pj-shot');
  await expect(page.locator('#pj-lightbox')).toBeVisible();
  const src = await page.locator('#pj-lightbox-img').getAttribute('src');
  expect(src).toContain('ps-dash-main.png');
  await page.screenshot({ path: 'test-results/pj-05-라이트박스.png' });
  await page.keyboard.press('Escape');
  await expect(page.locator('#pj-lightbox')).toBeHidden();
});

test('AI 갤러리: #pj-ai 안에 .pj-shot이 10개 이상 존재', async ({ page }) => {
  await enterProject(page);
  const shots = page.locator('#pj-ai .pj-shot');
  const count = await shots.count();
  expect(count).toBeGreaterThanOrEqual(10);
  await page.screenshot({ path: 'test-results/pj-06-ai갤러리.png', fullPage: true });
});

test('AI 갤러리: enterProjectMode 호출 후 이미지 src가 주입됨', async ({ page }) => {
  await enterProject(page);
  // 첫 번째 AI 갤러리 이미지 확인
  const img = page.locator('#pjs-ai-platform-A .pj-shot-img').first();
  const src = await img.getAttribute('src');
  expect(src).toBeTruthy();
  expect(src).not.toBe('');
  expect(src).toContain('ai-platform-A.png');
});

test('비밀 버튼 재클릭 → 대시보드로 복귀 (비밀번호 안 물음)', async ({ page }) => {
  await page.goto(FILE_URL);
  await dismissIntro(page);
  await page.click('#secret-ver');
  await page.fill('#pw-input', '78963');
  await page.click('#pw-ok');
  await expect(page.locator('#view-project')).toBeVisible();

  await page.click('#secret-ver');
  await expect(page.locator('#pw-modal')).not.toBeVisible();
  await expect(page.locator('#view-project')).not.toBeVisible();
  await expect(page.locator('#view-dashboard')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#project-nav')).toBeHidden();
});
