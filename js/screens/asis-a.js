// As-is 화면 Group A: GIS 현황, 생애주기 모니터링, 통계 분석 리포트

// ─────────────────────────────────────────────────────────────
// 1. renderAsisGis — 핵심 자산 GIS 현황
// ─────────────────────────────────────────────────────────────
window.renderAsisGis = function () {
  var el = document.getElementById('view-asis-gis');
  if (!el) return;
  el.innerHTML = '';

  var MARKERS = [
    // 건물/부동산 (파란색)
    { lat: 37.5172, lng: 127.0473, color: '#2563eb', cat: '건물/부동산', name: '서울 강남지점',    desc: '건물 3동, 총 415억' },
    { lat: 37.5219, lng: 126.9246, color: '#2563eb', cat: '건물/부동산', name: '서울 여의도지점',  desc: '건물 2동, 총 280억' },
    { lat: 37.5765, lng: 126.9780, color: '#2563eb', cat: '건물/부동산', name: '서울 종로지점',    desc: '건물 1동, 총 190억' },
    { lat: 35.1576, lng: 129.0587, color: '#2563eb', cat: '건물/부동산', name: '부산 서면지점',    desc: '건물 2동, 총 95억' },
    { lat: 37.4889, lng: 126.7234, color: '#2563eb', cat: '건물/부동산', name: '인천 부평지점',    desc: '건물 1동, 총 65억' },
    { lat: 35.8705, lng: 128.5932, color: '#2563eb', cat: '건물/부동산', name: '대구 동성로지점',  desc: '건물 1동, 총 55억' },
    { lat: 35.1537, lng: 126.8519, color: '#2563eb', cat: '건물/부동산', name: '광주 상무지점',    desc: '건물 1동, 총 48억' },
    { lat: 36.3541, lng: 127.3789, color: '#2563eb', cat: '건물/부동산', name: '대전 둔산지점',    desc: '건물 1동, 총 42억' },
    // 차량 (주황색)
    { lat: 37.5665, lng: 126.9780, color: '#ea580c', cat: '차량', name: '서울 본사',   desc: '차량 45대' },
    { lat: 37.2636, lng: 127.0286, color: '#ea580c', cat: '차량', name: '수원',        desc: '차량 12대' },
    { lat: 37.4449, lng: 127.1388, color: '#ea580c', cat: '차량', name: '성남',        desc: '차량 8대' },
    { lat: 35.1796, lng: 129.0756, color: '#ea580c', cat: '차량', name: '부산',        desc: '차량 15대' },
    { lat: 35.5384, lng: 129.3114, color: '#ea580c', cat: '차량', name: '울산',        desc: '차량 10대' },
    { lat: 35.2285, lng: 128.6811, color: '#ea580c', cat: '차량', name: '창원',        desc: '차량 9대' },
    // IT장비 (초록색)
    { lat: 37.5500, lng: 126.9700, color: '#16a34a', cat: 'IT장비', name: '서울 IDC',  desc: '서버 120대·PC 450대' },
    { lat: 35.1600, lng: 129.0600, color: '#16a34a', cat: 'IT장비', name: '부산 IDC',  desc: '서버 45대·PC 180대' },
    { lat: 36.3500, lng: 127.3800, color: '#16a34a', cat: 'IT장비', name: '대전 IDC',  desc: '서버 30대·PC 120대' },
    // 기타설비 (보라색)
    { lat: 37.4563, lng: 126.7052, color: '#7c3aed', cat: '기타설비', name: '인천 창고',       desc: '에어컨 32대·기타 56건' },
    { lat: 37.3000, lng: 127.0500, color: '#7c3aed', cat: '기타설비', name: '경기 물류센터',   desc: '설비 28건' },
    { lat: 35.1595, lng: 126.8526, color: '#7c3aed', cat: '기타설비', name: '광주 창고',       desc: '설비 15건' },
    { lat: 37.7519, lng: 128.8761, color: '#7c3aed', cat: '기타설비', name: '강릉 지점',       desc: '설비 8건' },
    { lat: 35.8175, lng: 127.1086, color: '#7c3aed', cat: '기타설비', name: '전주 지점',       desc: '설비 11건' },
    { lat: 36.0190, lng: 129.3435, color: '#7c3aed', cat: '기타설비', name: '포항 지점',       desc: '설비 7건' },
    { lat: 37.8813, lng: 127.7298, color: '#7c3aed', cat: '기타설비', name: '춘천 지점',       desc: '설비 6건' }
  ];

  var LEGEND = [
    { color: '#2563eb', label: '건물/부동산', summary: '9개소 / 1,190억원' },
    { color: '#ea580c', label: '차량',        summary: '99대 / 28억원' },
    { color: '#16a34a', label: 'IT장비',      summary: '3개소 / 52억원' },
    { color: '#7c3aed', label: '기타설비',    summary: '7개소 / 8억원' }
  ];

  // ── HTML 뼈대 ───────────────────────────────────────────────
  var page = document.createElement('div');
  page.className = 'asis-page';
  page.innerHTML = [
    '<div class="asis-page-header">',
    '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '    <h2 class="asis-page-title">핵심 자산 GIS 현황</h2>',
    '    <span class="asis-badge">To-Be</span>',
    '  </div>',
    '  <div class="asis-tabs" id="asis-gis-tabs">',
    '    <button class="asis-tab active" data-tab="count">보유건수</button>',
    '    <button class="asis-tab" data-tab="area">위치면적</button>',
    '  </div>',
    '</div>',
    '<div style="display:grid;grid-template-columns:1fr 240px;gap:20px;align-items:start">',
    '  <div class="asis-panel" style="overflow:hidden">',
    '    <div id="asis-gis-map" style="height:500px;border-radius:8px;overflow:hidden;background:#f0f4f8"></div>',
    '  </div>',
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head"><span class="asis-panel-title">범례</span></div>',
    '    <div class="asis-panel-body" id="asis-gis-legend"></div>',
    '  </div>',
    '</div>'
  ].join('');
  el.appendChild(page);

  // ── 범례 렌더 ────────────────────────────────────────────────
  var legendEl = document.getElementById('asis-gis-legend');
  if (legendEl) {
    var html = '<div style="display:flex;flex-direction:column;gap:14px">';
    LEGEND.forEach(function (item) {
      html += '<div style="display:flex;align-items:center;gap:10px">'
        + '<span style="width:12px;height:12px;border-radius:50%;background:' + item.color + ';flex-shrink:0;display:inline-block"></span>'
        + '<div>'
        + '<div style="font-size:13px;font-weight:600;color:#2c3e50">' + item.label + '</div>'
        + '<div style="font-size:12px;color:#666;margin-top:2px">' + item.summary + '</div>'
        + '</div>'
        + '</div>';
    });
    html += '</div>'
      + '<div style="margin-top:20px;padding-top:14px;border-top:1px solid #e8ecf0">'
      + '  <div style="font-size:12px;color:#888;margin-bottom:4px">총 합계</div>'
      + '  <div style="font-size:15px;font-weight:700;color:#1a1a2e">25개소·1,278억원</div>'
      + '  <div style="font-size:12px;color:#999;margin-top:2px">자산 12,492건 등록</div>'
      + '</div>';
    legendEl.innerHTML = html;
  }

  // ── 탭 동작 ─────────────────────────────────────────────────
  var tabsContainer = document.getElementById('asis-gis-tabs');
  if (tabsContainer) {
    tabsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.asis-tab');
      if (!btn) return;
      tabsContainer.querySelectorAll('.asis-tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
    });
  }

  // ── Leaflet 지도 ─────────────────────────────────────────────
  if (typeof L === 'undefined') return;

  var map = L.map('asis-gis-map', {
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true,
    zoomControl: true
  }).setView([36.5, 127.8], 7);

  // OSM 타일 (오프라인 시 무시)
  try {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);
  } catch (e) { /* 오프라인 환경 — 무시 */ }

  // 마커 추가
  MARKERS.forEach(function (m) {
    var circle = L.circleMarker([m.lat, m.lng], {
      color: m.color,
      fillColor: m.color,
      fillOpacity: 0.82,
      radius: 9,
      weight: 2
    }).addTo(map);
    circle.bindPopup(
      '<div style="min-width:140px">'
      + '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + m.name + '</div>'
      + '<div style="font-size:12px;color:#555">' + m.cat + '</div>'
      + '<div style="font-size:12px;color:#333;margin-top:4px">' + m.desc + '</div>'
      + '</div>'
    );
  });

  setTimeout(function () { map.invalidateSize(); }, 200);
};


// ─────────────────────────────────────────────────────────────
// 2. renderAsisLifecycle — 자산 생애주기 모니터링
// ─────────────────────────────────────────────────────────────
window.renderAsisLifecycle = function () {
  var el = document.getElementById('view-asis-lifecycle');
  if (!el) return;
  el.innerHTML = '';

  var GAUGES = [
    { label: '취득단계', value: 2141, pct: 17.1, color: '#2563eb',  accent: 'accent-blue'   },
    { label: '운용단계', value: 10247, pct: 82.0, color: '#16a34a', accent: 'accent-green'  },
    { label: '폐기단계', value: 633,   pct: 5.1,  color: '#ea580c', accent: 'accent-orange' },
    { label: '유휴',     value: 1612,  pct: 12.9, color: '#94a3b8', accent: 'accent-purple' }
  ];

  var TABLE_ROWS = [
    { cat: '노트북·PC',       total: 4523, active: 3891, idle: 450,  retire: 182, note: '5년 내용연수' },
    { cat: '서버·네트워크',   total: 1247, active: 1089, idle: 103,  retire: 55,  note: '7년 내용연수' },
    { cat: '차량',             total: 156,  active: 142,  idle: 8,    retire: 6,   note: '10년 내용연수' },
    { cat: '건물·부동산',     total: 23,   active: 23,   idle: 0,    retire: 0,   note: '40년 내용연수' },
    { cat: '사무가구',         total: 3218, active: 2655, idle: 412,  retire: 151, note: '10년 내용연수' },
    { cat: '기타설비',         total: 3325, active: 2447, idle: 639,  retire: 239, note: '다양' }
  ];

  var BAR_YEARS   = ['2018','2019','2020','2021','2022','2023','2024','2025'];
  var BAR_BLD     = [140,  60,   0,   850,  0,   0,   0,   0  ];
  var BAR_IT      = [280,  310,  285, 320,  295, 340, 380, 210];
  var BAR_ETC     = [95,   112,  98,  108,  115, 125, 138, 75 ];

  // ── HTML 뼈대 ───────────────────────────────────────────────
  var gaugeCanvases = GAUGES.map(function (g, i) {
    return '<div class="asis-kpi-card ' + g.accent + '" style="position:relative;text-align:center;padding:16px 12px">'
      + '<div class="asis-kpi-label">' + g.label + '</div>'
      + '<div style="position:relative;display:inline-block;width:100px;height:60px;margin:4px auto 0">'
      + '  <canvas id="asis-lifecycle-gauge-' + i + '" width="100" height="60"></canvas>'
      + '  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,20%);font-size:18px;font-weight:700;color:' + g.color + '">' + g.pct + '%</div>'
      + '</div>'
      + '<div class="asis-kpi-value" style="margin-top:8px">' + g.value.toLocaleString('ko-KR') + '건</div>'
      + '</div>';
  }).join('');

  var tableRows = TABLE_ROWS.map(function (r) {
    return '<tr>'
      + '<td>' + r.cat + '</td>'
      + '<td class="num">' + r.total.toLocaleString('ko-KR') + '</td>'
      + '<td class="num">' + r.active.toLocaleString('ko-KR') + '</td>'
      + '<td class="num">' + r.idle.toLocaleString('ko-KR') + '</td>'
      + '<td class="num">' + r.retire.toLocaleString('ko-KR') + '</td>'
      + '<td>' + r.note + '</td>'
      + '</tr>';
  }).join('');

  var page = document.createElement('div');
  page.className = 'asis-page';
  page.innerHTML = [
    '<div class="asis-page-header">',
    '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '    <h2 class="asis-page-title">자산 생애주기 모니터링</h2>',
    '    <span class="asis-badge">To-Be</span>',
    '  </div>',
    '  <div class="asis-toolbar">',
    '    <span style="font-size:13px;color:#666">기간</span>',
    '    <select class="asis-select"><option>2026년 기준</option></select>',
    '  </div>',
    '</div>',

    // KPI 4칸
    '<div class="asis-kpi-row" style="margin-bottom:20px">',
    '  <div class="asis-kpi-card accent-blue">',
    '    <div class="asis-kpi-label">전체 자산</div>',
    '    <div class="asis-kpi-value">12,492건</div>',
    '    <div class="asis-kpi-sub">2026년 기준</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-green">',
    '    <div class="asis-kpi-label">운용중</div>',
    '    <div class="asis-kpi-value">10,247건</div>',
    '    <div class="asis-kpi-sub">전체의 82.0%</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-orange">',
    '    <div class="asis-kpi-label">폐기예정</div>',
    '    <div class="asis-kpi-value">633건</div>',
    '    <div class="asis-kpi-sub">전체의 5.1%</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-purple">',
    '    <div class="asis-kpi-label">유휴</div>',
    '    <div class="asis-kpi-value">1,612건</div>',
    '    <div class="asis-kpi-sub">전체의 12.9%</div>',
    '  </div>',
    '</div>',

    // 게이지 카드 4개
    '<div class="asis-kpi-row" style="margin-bottom:24px">',
    gaugeCanvases,
    '</div>',

    // 하단 2열
    '<div class="asis-grid-2">',
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head"><span class="asis-panel-title">자산별 현황</span></div>',
    '    <div class="asis-panel-body" style="padding:0">',
    '      <div class="asis-table-wrap">',
    '        <table class="asis-table">',
    '          <thead><tr>',
    '            <th>분류</th><th>전체</th><th>운용중</th><th>유휴</th><th>폐기예정</th><th>비고</th>',
    '          </tr></thead>',
    '          <tbody>' + tableRows + '</tbody>',
    '        </table>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head"><span class="asis-panel-title">취득연도별 현황</span></div>',
    '    <div class="asis-panel-body">',
    '      <canvas id="asis-lifecycle-bar" height="200"></canvas>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');
  el.appendChild(page);

  if (typeof Chart === 'undefined') return;

  // ── 아크 게이지 (Chart.js 도넛) ─────────────────────────────
  GAUGES.forEach(function (g, i) {
    var canvas = document.getElementById('asis-lifecycle-gauge-' + i);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [g.pct, 100 - g.pct],
          backgroundColor: [g.color, '#f0f3f7'],
          borderWidth: 0,
          circumference: 220,
          rotation: -110
        }]
      },
      options: {
        cutout: '72%',
        plugins: {
          legend:  { display: false },
          tooltip: { enabled: false }
        },
        animation: { duration: 800 }
      }
    });
  });

  // ── 취득연도별 stacked bar ────────────────────────────────────
  var barCanvas = document.getElementById('asis-lifecycle-bar');
  if (barCanvas) {
    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: BAR_YEARS,
        datasets: [
          { label: '건물',  data: BAR_BLD,  backgroundColor: '#2563eb', stack: 'a' },
          { label: 'IT',    data: BAR_IT,   backgroundColor: '#16a34a', stack: 'a' },
          { label: '기타',  data: BAR_ETC,  backgroundColor: '#ea580c', stack: 'a' }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y + '억'; }
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: {
            stacked: true,
            ticks: {
              callback: function (v) { return v + '억'; },
              font: { size: 11 }
            }
          }
        }
      }
    });
  }
};


// ─────────────────────────────────────────────────────────────
// 3. renderAsisReport — 통계 분석 리포트
// ─────────────────────────────────────────────────────────────
window.renderAsisReport = function () {
  var el = document.getElementById('view-asis-report');
  if (!el) return;
  el.innerHTML = '';

  var DONUT_DATA = [
    { label: '건물/부동산', value: 1190, pct: 46.7, color: '#2563eb' },
    { label: 'IT장비',      value:  890, pct: 34.9, color: '#16a34a' },
    { label: '차량',        value:  280, pct: 11.0, color: '#ea580c' },
    { label: '사무가구',    value:  120, pct:  4.7, color: '#7c3aed' },
    { label: '기타',        value:   68, pct:  2.7, color: '#94a3b8' }
  ];

  var BAR_DEPT = [
    { label: 'IT본부',       value: 890 },
    { label: '자산운용팀',   value: 580 },
    { label: '경영지원팀',   value: 420 },
    { label: '마케팅팀',     value: 310 },
    { label: '영업본부',     value: 280 },
    { label: '리스크관리팀', value: 190 }
  ];
  var DEPT_COLORS = ['#2563eb','#16a34a','#ea580c','#7c3aed','#f59e0b','#06b6d4'];

  var LEDGER = [
    { id:'NH-BLD-001', name:'서울 강남지점 사옥',   cat:'건물',   date:'2015-03-15', acq:'415억원', dep:'62억원',  bv:'353억원', status:'운용중' },
    { id:'NH-BLD-002', name:'여의도 본사 건물',       cat:'건물',   date:'2012-08-20', acq:'280억원', dep:'56억원',  bv:'224억원', status:'운용중' },
    { id:'NH-BLD-003', name:'부산 서면지점',           cat:'건물',   date:'2018-05-10', acq:'95억원',  dep:'19억원',  bv:'76억원',  status:'운용중' },
    { id:'NH-IT-001',  name:'서울 IDC 서버팜',        cat:'IT장비', date:'2022-01-15', acq:'180억원', dep:'54억원',  bv:'126억원', status:'운용중' },
    { id:'NH-IT-002',  name:'업무용 노트북 일괄',     cat:'IT장비', date:'2023-09-01', acq:'85억원',  dep:'17억원',  bv:'68억원',  status:'운용중' },
    { id:'NH-VHC-001', name:'법인차량 (전체)',        cat:'차량',   date:'2021-06-30', acq:'42억원',  dep:'17억원',  bv:'25억원',  status:'운용중' },
    { id:'NH-FUR-001', name:'강남지점 인테리어',      cat:'사무가구',date:'2020-02-28', acq:'28억원',  dep:'14억원',  bv:'14억원',  status:'운용중' },
    { id:'NH-IT-003',  name:'네트워크 장비',          cat:'IT장비', date:'2021-11-15', acq:'35억원',  dep:'18억원',  bv:'17억원',  status:'운용중' },
    { id:'NH-IT-004',  name:'보안 서버 시스템',       cat:'IT장비', date:'2024-03-10', acq:'22억원',  dep:'2억원',   bv:'20억원',  status:'운용중' },
    { id:'NH-FUR-002', name:'여의도 본사 가구',       cat:'사무가구',date:'2019-07-01', acq:'15억원',  dep:'9억원',   bv:'6억원',   status:'운용중' }
  ];

  // ── 테이블 행 ────────────────────────────────────────────────
  var ledgerRows = LEDGER.map(function (r) {
    return '<tr>'
      + '<td style="font-family:monospace;font-size:12px">' + r.id + '</td>'
      + '<td>' + r.name + '</td>'
      + '<td class="center"><span class="asis-status ok">' + r.cat + '</span></td>'
      + '<td class="center">' + r.date + '</td>'
      + '<td class="num">' + r.acq + '</td>'
      + '<td class="num">' + r.dep + '</td>'
      + '<td class="num" style="font-weight:600">' + r.bv + '</td>'
      + '<td class="center"><span class="asis-status ok">' + r.status + '</span></td>'
      + '</tr>';
  }).join('');

  // ── HTML 뼈대 ───────────────────────────────────────────────
  var page = document.createElement('div');
  page.className = 'asis-page';
  page.innerHTML = [
    '<div class="asis-page-header">',
    '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '    <h2 class="asis-page-title">통계 분석 리포트</h2>',
    '    <span class="asis-badge">To-Be</span>',
    '  </div>',
    '  <div class="asis-filter-bar">',
    '    <label>조회연도</label>',
    '    <select class="asis-select"><option>2026년</option></select>',
    '  </div>',
    '</div>',

    // KPI 4칸
    '<div class="asis-kpi-row" style="margin-bottom:24px">',
    '  <div class="asis-kpi-card accent-blue">',
    '    <div class="asis-kpi-label">총 자산액</div>',
    '    <div class="asis-kpi-value">2,548억원</div>',
    '    <div class="asis-kpi-sub">취득가액 합계</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-orange">',
    '    <div class="asis-kpi-label">누적상각액</div>',
    '    <div class="asis-kpi-value">842억원</div>',
    '    <div class="asis-kpi-sub">총 자산액의 33.0%</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-green">',
    '    <div class="asis-kpi-label">장부가액</div>',
    '    <div class="asis-kpi-value">1,706억원</div>',
    '    <div class="asis-kpi-sub">현재 회계 장부 기준</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-purple">',
    '    <div class="asis-kpi-label">자산</div>',
    '    <div class="asis-kpi-value">12,492건</div>',
    '    <div class="asis-kpi-sub">등록 자산 수</div>',
    '  </div>',
    '</div>',

    // 상단 2열 차트
    '<div class="asis-grid-2" style="margin-bottom:24px">',
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head"><span class="asis-panel-title">자산구성 현황</span></div>',
    '    <div class="asis-panel-body" style="display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap">',
    '      <div style="position:relative;width:180px;height:180px">',
    '        <canvas id="asis-report-donut" width="180" height="180"></canvas>',
    '        <div id="asis-report-donut-center" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none">',
    '          <div style="font-size:11px;color:#888">총</div>',
    '          <div style="font-size:14px;font-weight:700;color:#1a1a2e;white-space:nowrap">2,548억</div>',
    '        </div>',
    '      </div>',
    '      <div id="asis-report-donut-legend" style="display:flex;flex-direction:column;gap:8px"></div>',
    '    </div>',
    '  </div>',
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head"><span class="asis-panel-title">부서별 자산 현황</span></div>',
    '    <div class="asis-panel-body">',
    '      <canvas id="asis-report-dept-bar" height="180"></canvas>',
    '    </div>',
    '  </div>',
    '</div>',

    // 자산 대금 원장 테이블
    '<div class="asis-panel">',
    '  <div class="asis-panel-head"><span class="asis-panel-title">자산 대금 원장</span></div>',
    '  <div class="asis-panel-body" style="padding:0">',
    '    <div class="asis-table-wrap">',
    '      <table class="asis-table">',
    '        <thead><tr>',
    '          <th>자산번호</th><th>자산명</th><th>분류</th><th>취득일</th>',
    '          <th>취득가액</th><th>누적상각</th><th>장부가액</th><th>상태</th>',
    '        </tr></thead>',
    '        <tbody>' + ledgerRows + '</tbody>',
    '      </table>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');
  el.appendChild(page);

  if (typeof Chart === 'undefined') return;

  // ── 도넛 범례 ────────────────────────────────────────────────
  var legendEl = document.getElementById('asis-report-donut-legend');
  if (legendEl) {
    legendEl.innerHTML = DONUT_DATA.map(function (d) {
      return '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="width:10px;height:10px;border-radius:50%;background:' + d.color + ';flex-shrink:0;display:inline-block"></span>'
        + '<span style="font-size:12px;color:#555">' + d.label + '</span>'
        + '<span style="font-size:12px;color:#999;margin-left:auto;padding-left:12px">' + d.pct + '%</span>'
        + '</div>';
    }).join('');
  }

  // ── 도넛 차트 ────────────────────────────────────────────────
  var donutCanvas = document.getElementById('asis-report-donut');
  if (donutCanvas) {
    // afterDraw 플러그인: 캔버스 센터에 텍스트 표시
    var centerTextPlugin = {
      id: 'asisReportCenterText',
      afterDraw: function (chart) {
        var ctx = chart.ctx;
        var cx  = chart.chartArea ? (chart.chartArea.left + chart.chartArea.right) / 2 : chart.width / 2;
        var cy  = chart.chartArea ? (chart.chartArea.top + chart.chartArea.bottom) / 2 : chart.height / 2;
        ctx.save();
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#1a1a2e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2,548억', cx, cy - 6);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText('총 자산액', cx, cy + 10);
        ctx.restore();
      }
    };

    new Chart(donutCanvas, {
      type: 'doughnut',
      data: {
        labels: DONUT_DATA.map(function (d) { return d.label; }),
        datasets: [{
          data: DONUT_DATA.map(function (d) { return d.value; }),
          backgroundColor: DONUT_DATA.map(function (d) { return d.color; }),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        cutout: '65%',
        plugins: {
          legend:  { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.parsed + '억원 (' + DONUT_DATA[ctx.dataIndex].pct + '%)';
              }
            }
          }
        },
        animation: { duration: 800 }
      },
      plugins: [centerTextPlugin]
    });
  }

  // ── 부서별 수평 막대 차트 ────────────────────────────────────
  var deptCanvas = document.getElementById('asis-report-dept-bar');
  if (deptCanvas) {
    new Chart(deptCanvas, {
      type: 'bar',
      data: {
        labels: BAR_DEPT.map(function (d) { return d.label; }),
        datasets: [{
          label: '자산액(억원)',
          data: BAR_DEPT.map(function (d) { return d.value; }),
          backgroundColor: DEPT_COLORS,
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend:  { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.parsed.x + '억원'; }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: function (v) { return v + '억'; },
              font: { size: 11 }
            },
            grid: { color: '#f0f0f0' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 12 } }
          }
        }
      }
    });
  }
};
