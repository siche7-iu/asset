// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  // 테스트 결과 폴더
  outputDir: './test-results',
  // 각 테스트 최대 실행 시간 (30초)
  timeout: 30000,
  // 실패 시 재시도 횟수
  retries: 0,
  // HTML 리포트 자동 생성
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // index.html 파일을 file:// 프로토콜로 열기
    baseURL: 'file://' + path.resolve(__dirname, 'index.html'),
    // 스크린샷: 테스트 실패 시 자동 저장
    screenshot: 'only-on-failure',
    // 뷰포트 크기 (1280×800 = 일반 노트북 화면)
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
