// reflow 후 Leaflet 초기화 테스트
const { chromium } = require('@playwright/test');
const path = require('path');

const INDEX = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(INDEX);

  await page.evaluate(() => {
    var overlay = document.getElementById('site-auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    location.hash = '#/dashboard';
  });

  await page.waitForTimeout(1500);

  const state = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');

    // style 설정 후 offsetWidth 읽기 (강제 reflow)
    mapEl.style.width = '332px';
    mapEl.style.height = '332px';

    // reflow 강제 발생
    var _ = mapEl.offsetWidth; // 이 시점에 레이아웃 재계산됨

    return {
      offsetWidth: mapEl.offsetWidth,
      offsetHeight: mapEl.offsetHeight,
      styleWidth: mapEl.style.width,
      styleHeight: mapEl.style.height
    };
  });

  console.log('reflow 후 크기:', state);

  // 실제 map-box가 이미 초기화됐을 경우 Leaflet이 어떤 크기를 기억하는지 확인
  // map-box.leaflet-container 안의 _leaflet 관련 properties
  const leafletSize = await page.evaluate(() => {
    var mapEl = document.getElementById('map-box');
    // Leaflet은 내부적으로 _size를 L.point로 저장
    // L.Map 인스턴스에 직접 접근은 스코프 문제로 어려움
    // 대신 CSS 클래스로 추정

    // map-box의 실제 layout dimensions
    return {
      clientWidth: mapEl.clientWidth,
      clientHeight: mapEl.clientHeight,
      offsetWidth: mapEl.offsetWidth,
      offsetHeight: mapEl.offsetHeight,
      scrollWidth: mapEl.scrollWidth,
      scrollHeight: mapEl.scrollHeight
    };
  });

  console.log('Leaflet container 크기:', leafletSize);

  await browser.close();
})();
