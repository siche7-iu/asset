const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // file:// 프로토콜로 열기
  const filePath = 'file:///' + path.resolve('D:/ATG_PJ/asset/index.html').replace(/\\/g, '/');
  await page.goto(filePath + '#/dashboard');

  // 비밀번호 팝업이 있으면 처리
  try {
    const pwInput = await page.waitForSelector('#auth-password', { timeout: 5000 });
    if (pwInput) {
      await pwInput.fill('NH@fams2026!');
      await page.click('#auth-submit');
      console.log('비밀번호 입력 완료, 대시보드 대기...');
    }
  } catch(e) {
    console.log('비밀번호 팝업 없음:', e.message);
  }

  // 대시보드 로드 대기 (애니메이션 + Leaflet 지연 포함, 총 6초)
  await page.waitForTimeout(6000);

  // 현재 URL/상태 로그
  console.log('현재 URL:', page.url());

  // 대시보드가 보이는지 확인
  const dashVisible = await page.evaluate(() => {
    const dash = document.getElementById('view-dashboard');
    return dash ? window.getComputedStyle(dash).display : 'element-not-found';
  });
  console.log('대시보드 display:', dashVisible);

  // JS 상태 진단
  const diag = await page.evaluate(() => {
    const mapEl = document.getElementById('map-box');
    const parentCard = mapEl ? mapEl.closest('.dr-map-card') : null;

    // Leaflet 상태
    const hasLeafletClass = mapEl ? mapEl.classList.contains('leaflet-container') : false;
    const mapRect = mapEl ? mapEl.getBoundingClientRect() : null;
    const cardRect = parentCard ? parentCard.getBoundingClientRect() : null;

    // SVG paths 수
    const svgPaths = mapEl ? mapEl.querySelectorAll('path').length : 0;
    const svgLayers = mapEl ? mapEl.querySelectorAll('.leaflet-overlay-pane').length : 0;
    const svgEl = mapEl ? mapEl.querySelector('svg') : null;
    const svgRect = svgEl ? svgEl.getBoundingClientRect() : null;

    // TopoJSON 확인
    const hasTopo = !!window.MUNICIPALITIES_TOPO;
    const topoFeatureCount = hasTopo ? Object.keys(window.MUNICIPALITIES_TOPO.objects || {}).length : 0;

    // Leaflet 전역 확인
    const hasLeaflet = !!window.L;
    const hasTopojson = !!window.topojson;

    // inline 스타일 확인
    const inlineWidth = mapEl ? mapEl.style.width : 'N/A';
    const inlineHeight = mapEl ? mapEl.style.height : 'N/A';

    // computed style
    const computed = mapEl ? window.getComputedStyle(mapEl) : null;
    const compWidth = computed ? computed.width : 'N/A';
    const compHeight = computed ? computed.height : 'N/A';
    const compOverflow = computed ? computed.overflow : 'N/A';

    // SVG 상세 진단
    const overlayPane = mapEl ? mapEl.querySelector('.leaflet-overlay-pane') : null;
    const overlayPaneStyle = overlayPane ? window.getComputedStyle(overlayPane) : null;
    const overlayRect = overlayPane ? overlayPane.getBoundingClientRect() : null;

    // SVG 자체 속성
    const svgWidth = svgEl ? svgEl.getAttribute('width') : null;
    const svgHeight = svgEl ? svgEl.getAttribute('height') : null;
    const svgViewBox = svgEl ? svgEl.getAttribute('viewBox') : null;
    const svgStyle = svgEl ? svgEl.getAttribute('style') : null;

    // mapPane transform
    const mapPane = mapEl ? mapEl.querySelector('.leaflet-map-pane') : null;
    const mapPaneTransform = mapPane ? mapPane.style.transform : null;

    // 첫 번째 path 샘플
    const firstPath = mapEl ? mapEl.querySelector('path') : null;
    const firstPathD = firstPath ? (firstPath.getAttribute('d') || '').substring(0, 80) : null;
    const firstPathFill = firstPath ? firstPath.getAttribute('fill') : null;
    const firstPathRect = firstPath ? firstPath.getBoundingClientRect() : null;

    return {
      hasLeaflet, hasTopojson, hasTopo, topoFeatureCount,
      hasLeafletClass,
      mapRect: mapRect ? { w: Math.round(mapRect.width), h: Math.round(mapRect.height), x: Math.round(mapRect.x), y: Math.round(mapRect.y) } : null,
      cardRect: cardRect ? { w: Math.round(cardRect.width), h: Math.round(cardRect.height) } : null,
      svgPaths, svgLayers,
      svgRect: svgRect ? { w: Math.round(svgRect.width), h: Math.round(svgRect.height), x: Math.round(svgRect.x), y: Math.round(svgRect.y) } : null,
      svgAttr: { width: svgWidth, height: svgHeight, viewBox: svgViewBox, style: svgStyle },
      overlayPane: overlayPane ? {
        rect: overlayRect ? { w: Math.round(overlayRect.width), h: Math.round(overlayRect.height) } : null,
        compWidth: overlayPaneStyle ? overlayPaneStyle.width : null,
        compHeight: overlayPaneStyle ? overlayPaneStyle.height : null,
        transform: overlayPane.style.transform,
        innerHTML_length: overlayPane.innerHTML.length
      } : null,
      mapPaneTransform,
      firstPath: { d: firstPathD, fill: firstPathFill, rect: firstPathRect ? { w: Math.round(firstPathRect.width), h: Math.round(firstPathRect.height) } : null },
      inlineWidth, inlineHeight, compWidth, compHeight, compOverflow,
      paneChildren: mapEl ? Array.from(mapEl.querySelectorAll('.leaflet-pane')).map(p => p.className) : []
    };
  });

  console.log('=== 진단 결과 ===');
  console.log(JSON.stringify(diag, null, 2));

  // 스크린샷 (전체 페이지)
  await page.screenshot({ path: 'D:/ATG_PJ/asset/tests/map-diagnose-screenshot.png', fullPage: true });
  console.log('스크린샷: tests/map-diagnose-screenshot.png');

  await browser.close();
})();
