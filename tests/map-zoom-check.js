// 현재 zoom 및 fitBounds 목표 zoom 확인
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

  await page.waitForTimeout(2000);

  // Leaflet Map 인스턴스에 접근하기 위해 전역 변수로 노출
  const mapAccess = await page.evaluate(() => {
    // app.js의 IIFE 스코프 내부 변수에 접근 불가
    // 대신: 새로운 Leaflet 맵을 생성해서 fitBounds 계산이 실제로 어떤 값인지 확인

    var mapEl = document.getElementById('map-box');
    var topo = window.MUNICIPALITIES_TOPO;
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    // 임시 맵으로 fitBounds 결과 계산
    var tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'width:332px;height:332px;position:absolute;top:421px;left:1051px;overflow:hidden;';
    document.body.appendChild(tempDiv);

    var tempMap = L.map(tempDiv, {
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, doubleClickZoom: false, dragging: false
    });

    var layer = L.geoJSON(geojson).addTo(tempMap);
    var bounds = layer.getBounds();

    // fitBounds 계산만 하고 setView는 아직 안 된 상태에서 getBoundsZoom 호출
    var targetZoom = tempMap.getBoundsZoom(bounds, false, [6, 6]);
    var targetCenter = bounds.getCenter();

    // 실제 fitBounds 실행
    tempMap.fitBounds(bounds, { padding: [6, 6], animate: false });
    var actualZoom = tempMap.getZoom();
    var actualCenter = tempMap.getCenter();

    var svgEl = tempDiv.querySelector('.leaflet-overlay-pane svg');
    var svgVB = svgEl ? svgEl.getAttribute('viewBox') : 'none';

    document.body.removeChild(tempDiv);

    return {
      targetZoom,
      targetCenter: { lat: targetCenter.lat.toFixed(3), lng: targetCenter.lng.toFixed(3) },
      actualZoom,
      actualCenter: { lat: actualCenter.lat.toFixed(3), lng: actualCenter.lng.toFixed(3) },
      svgVB
    };
  });

  console.log('=== fitBounds 계산 결과 ===');
  console.log(JSON.stringify(mapAccess, null, 2));

  // 1050ms 후 상태 확인
  await page.waitForTimeout(200);

  const finalState = await page.evaluate(() => {
    var svgEl = document.querySelector('#map-box .leaflet-overlay-pane svg');
    return {
      svgVB: svgEl ? svgEl.getAttribute('viewBox') : 'none',
      svgStyle: svgEl ? svgEl.getAttribute('style') : 'none'
    };
  });

  console.log('\n=== 현재 실제 맵 SVG 상태 ===');
  console.log(JSON.stringify(finalState, null, 2));

  await browser.close();
})();
