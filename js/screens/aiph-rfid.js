// AI Phase — 재물조사 분석

window.renderAiphRfid = function () {
  var el = document.getElementById('view-aiph-rfid');
  if (!el) return;
  el.innerHTML = '';

  // ── 데이터 ────────────────────────────────────────────────────
  var ANOMALY_DATA = [
    { label: '위치 불일치', count: 23, color: '#EF4444' },
    { label: '원장 미반영', count: 12, color: '#F97316' },
    { label: '원장 초과',   count: 8,  color: '#7C3AED' },
    { label: 'RFID 오류',  count: 4,  color: '#94A3B8' }
  ];

  var REGION_STATUS = [
    { name: '서울', lat: 37.5665, lng: 126.9780, total: 180, done: 162, rate: 90 },
    { name: '인천', lat: 37.4563, lng: 126.7052, total: 85,  done: 72,  rate: 85 },
    { name: '경기', lat: 37.2752, lng: 127.0097, total: 130, done: 104, rate: 80 },
    { name: '대전', lat: 36.3504, lng: 127.3845, total: 70,  done: 63,  rate: 90 },
    { name: '부산', lat: 35.1796, lng: 129.0756, total: 95,  done: 71,  rate: 75 },
    { name: '대구', lat: 35.8714, lng: 128.6014, total: 88,  done: 61,  rate: 69 },
    { name: '광주', lat: 35.1595, lng: 126.8526, total: 65,  done: 45,  rate: 69 },
    { name: '강원', lat: 37.8228, lng: 128.1555, total: 42,  done: 25,  rate: 60 },
    { name: '제주', lat: 33.4996, lng: 126.5312, total: 28,  done: 19,  rate: 68 }
  ];

  var PRIORITY_ASSETS = [
    { id: 'AST-2019-043', name: '서버 랙 A',      origin: '서울 전산센터 3F', actual: '부산 데이터센터',      risk: '🔴 고위험', action: '이수관 등록' },
    { id: 'AST-2022-118', name: '노트북 12대',     origin: '영업점',           actual: '원장 없음',            risk: '🟡 중간',   action: '신규 등록' },
    { id: 'AST-2021-056', name: 'UPS 전원장치',    origin: '서울 본점 B1',     actual: '대전 지점 1F',         risk: '🔴 고위험', action: '이수관 등록' },
    { id: 'AST-2020-089', name: '복합기 3대',      origin: '인천 지점',        actual: '원장 없음',            risk: '🟡 중간',   action: '신규 등록' },
    { id: 'AST-2018-034', name: '냉방기 B동',      origin: '부산 해운대',      actual: '원장 있음 / 실물 없음', risk: '🔴 고위험', action: '폐기 처리' },
    { id: 'AST-2023-071', name: 'RFID 리더기 5대', origin: '창고 2층',         actual: 'RFID 스캔 불가',       risk: '🟡 중간',   action: 'RFID 재부착' },
    { id: 'AST-2019-112', name: '서버 L3 스위치',  origin: '대구 지점 전산실', actual: '광주 지점 전산실',      risk: '🔴 고위험', action: '이수관 등록' },
    { id: 'AST-2024-003', name: '프린터 8대',      origin: '강원 지점',        actual: '원장 없음',            risk: '🟡 중간',   action: '신규 등록' }
  ];

  // ── 우선처리 자산 테이블 행 생성 ──────────────────────────────
  var priorityRows = PRIORITY_ASSETS.map(function (a) {
    return '<tr>' +
      '<td style="font-family:monospace;font-size:12px;">' + a.id + '</td>' +
      '<td style="font-weight:600;">' + a.name + '</td>' +
      '<td>' + a.origin + '</td>' +
      '<td>' + a.actual + '</td>' +
      '<td>' + a.risk + '</td>' +
      '<td>' + a.action + '</td>' +
      '<td><button onclick="alert(\'AI 결재함으로 요청이 전달되었습니다.\')" ' +
        'style="padding:3px 9px;background:#3B82F6;color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">요청</button></td>' +
      '</tr>';
  }).join('');

  // ── 메인 HTML ─────────────────────────────────────────────────
  el.innerHTML = [
    '<div class="asis-page">',

    // 페이지 헤더
    '  <div class="asis-page-header">',
    '    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '      <h2 class="asis-page-title">AI 재물조사 분석</h2>',
    '      <span class="asis-badge">AI</span>',
    '    </div>',
    '    <span style="font-size:13px;color:#888;">AI가 RFID 재물조사 결과를 분석하여 이상 자산을 분류하고 우선처리 목록을 제공합니다 · 2026년 상반기 재물조사</span>',
    '  </div>',

    // KPI 4개
    '  <div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);">',
    // KPI 1: 조사 완료 사무소 (진행바 포함)
    '    <div class="asis-kpi-card accent-blue">',
    '      <div class="asis-kpi-label">조사 완료 사무소</div>',
    '      <div class="asis-kpi-value">47<span class="asis-kpi-sub">/62개</span></div>',
    '      <div style="background:#e0e7ff;border-radius:4px;height:6px;margin-top:8px;">',
    '        <div style="background:#3b82f6;width:76%;height:6px;border-radius:4px;"></div>',
    '      </div>',
    '      <div style="font-size:11px;color:#888;margin-top:4px;">전체 대비 76%</div>',
    '    </div>',
    // KPI 2: 이상 발견 자산
    '    <div class="asis-kpi-card" style="border-top:3px solid #ef4444;">',
    '      <div class="asis-kpi-label">이상 발견 자산</div>',
    '      <div class="asis-kpi-value">47<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">AI 분류 기준</div>',
    '    </div>',
    // KPI 3: RFID 미부착 중요자산
    '    <div class="asis-kpi-card accent-orange">',
    '      <div class="asis-kpi-label">RFID 미부착 중요자산</div>',
    '      <div class="asis-kpi-value">12<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">즉시 조치 필요</div>',
    '    </div>',
    // KPI 4: 전년 대비
    '    <div class="asis-kpi-card" style="border-top:3px solid #94a3b8;">',
    '      <div class="asis-kpi-label">전년 대비</div>',
    '      <div class="asis-kpi-value">+3<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">이상 발견 증가</div>',
    '    </div>',
    '  </div>',

    // 2열: 이상 분류 차트 + 지역별 현황 지도
    '  <div style="display:grid;grid-template-columns:340px 1fr;gap:20px;margin-bottom:20px;">',

    // 이상 분류 수평 막대 차트
    '    <div class="asis-panel">',
    '      <div class="asis-panel-head"><span class="asis-panel-title">이상 자산 AI 분류 (총 47건)</span></div>',
    '      <div class="asis-panel-body">',
    '        <canvas id="rfid-bar-chart" style="max-height:200px;"></canvas>',
    '        <div style="margin-top:12px;font-size:12px;color:#888;">AI 분석 기준 · 2026-06-15 09:00</div>',
    '      </div>',
    '    </div>',

    // 지역별 조사 현황 Leaflet 지도
    '    <div class="asis-panel">',
    '      <div class="asis-panel-head"><span class="asis-panel-title">지역별 재물조사 현황</span></div>',
    '      <div class="asis-panel-body" style="padding:0;">',
    '        <div id="rfid-map" style="height:260px;border-radius:0 0 8px 8px;"></div>',
    '      </div>',
    '    </div>',

    '  </div>',

    // 우선처리 자산 테이블
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head">',
    '      <span class="asis-panel-title">우선 처리 자산 목록</span>',
    '      <button onclick="alert(\'AI 결재함으로 일괄 처리 요청이 전달되었습니다.\')" ' +
    '        style="padding:6px 14px;background:#3B82F6;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">AI 결재함으로 일괄 요청</button>',
    '    </div>',
    '    <div class="asis-panel-body">',
    '      <div class="asis-table-wrap">',
    '        <table class="asis-table">',
    '          <thead><tr>',
    '            <th>자산번호</th><th>자산명</th><th>원장 위치</th><th>실물 위치</th><th>AI 위험도</th><th>권고 조치</th><th>처리</th>',
    '          </tr></thead>',
    '          <tbody>' + priorityRows + '</tbody>',
    '        </table>',
    '      </div>',
    '    </div>',
    '  </div>',

    '</div>'
  ].join('\n');

  // ── Chart.js 수평 막대 차트 ───────────────────────────────────
  (function () {
    var canvas = document.getElementById('rfid-bar-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ANOMALY_DATA.map(function (d) { return d.label; }),
        datasets: [{
          data: ANOMALY_DATA.map(function (d) { return d.count; }),
          backgroundColor: ANOMALY_DATA.map(function (d) { return d.color; }),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.parsed.x + '건'; }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 5 },
            grid: { color: '#f0f0f0' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  })();

  // ── Leaflet 지도 (지역별 마커) ────────────────────────────────
  (function () {
    var mapEl = document.getElementById('rfid-map');
    if (!mapEl || typeof L === 'undefined') return;

    // 재진입 방어: 기존 Leaflet 인스턴스 제거
    if (mapEl._leaflet_id) {
      mapEl.innerHTML = '';
      delete mapEl._leaflet_id;
    }

    var map = L.map('rfid-map', {
      center: [36.5, 127.5],
      zoom: 6,
      scrollWheelZoom: false,
      zoomControl: true
    });

    // 흰색 배경 (타일 없음, 로컬 전용)
    map.getContainer().style.background = '#f8fafc';

    REGION_STATUS.forEach(function (r) {
      var color = r.rate >= 85 ? '#16a34a' : (r.rate >= 70 ? '#f59e0b' : '#ef4444');

      var circle = L.circleMarker([r.lat, r.lng], {
        radius: 18,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      L.marker([r.lat, r.lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="text-align:center;font-size:10px;font-weight:700;color:#fff;line-height:1.2;margin-top:-8px;">' +
                r.name + '<br>' + r.rate + '%</div>',
          iconSize: [40, 30],
          iconAnchor: [20, 15]
        })
      }).addTo(map);

      circle.bindTooltip(
        '<b>' + r.name + '</b><br>완료: ' + r.done + '/' + r.total + ' (' + r.rate + '%)<br>' +
        (r.rate >= 85 ? '✅ 정상' : (r.rate >= 70 ? '⚠️ 진행중' : '🔴 지연')),
        { permanent: false, direction: 'top' }
      );
    });
  })();
};
