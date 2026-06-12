// AI Phase — 이상탐지 보드

window.renderAiphAnomaly = function () {
  var el = document.getElementById('view-aiph-anomaly');
  if (!el) return;
  el.innerHTML = '';

  // ── 데이터 ────────────────────────────────────────────────────
  var CARDS = [
    {
      category: '노후 고위험',
      badgeColor: '#ef4444',
      badgeEmoji: '⚠️',
      id: 'AST-2019-003',
      name: '서버룸 에어컨',
      location: '경기 수원',
      detail: '내용연수 초과 3년 (2016년 취득, 기준 10년)',
      btnLabel: '자산 상세 보기'
    },
    {
      category: '장기 유휴',
      badgeColor: '#f97316',
      badgeEmoji: '🟡',
      id: 'AST-2021-089',
      name: '회의실 프로젝터',
      location: '서울 여의도',
      detail: '유휴 기간 14개월 (2025-04 이후 미사용)',
      btnLabel: '처리 요청'
    },
    {
      category: '보험 만료 임박',
      badgeColor: '#ef4444',
      badgeEmoji: '🔴',
      id: 'AST-2023-045',
      name: '법인차 소나타',
      location: '부산 해운대',
      detail: '보험 만료 2026-06-19',
      btnLabel: '갱신 요청'
    },
    {
      category: '노후 고위험',
      badgeColor: '#ef4444',
      badgeEmoji: '⚠️',
      id: 'AST-2018-112',
      name: '냉방기 B동',
      location: '서울 강남',
      detail: '내용연수 초과 1년, 유지보수비 급증',
      btnLabel: '자산 상세 보기'
    },
    {
      category: '감가 이상',
      badgeColor: '#7c3aed',
      badgeEmoji: '📊',
      id: 'AST-2022-034',
      name: '노트북 세트 (30대)',
      location: '대전 둔산',
      detail: '감가 상각률 실제치 91% vs 기준치 60% 불일치',
      btnLabel: '검토 요청'
    },
    {
      category: '장기 유휴',
      badgeColor: '#f97316',
      badgeEmoji: '🟡',
      id: 'AST-2020-056',
      name: '복합기 A동 2층',
      location: '서울 마포',
      detail: '유휴 기간 9개월, 인근 부서 이전 후 방치',
      btnLabel: '재배치 검토'
    }
  ];

  var FILTER_TABS = [
    { label: '전체', count: 23, category: '' },
    { label: '노후 고위험', count: 8, category: '노후 고위험' },
    { label: '장기 유휴', count: 7, category: '장기 유휴' },
    { label: '보험 만료 임박', count: 5, category: '보험 만료 임박' },
    { label: '감가 이상', count: 3, category: '감가 이상' }
  ];

  var HISTORY = [
    { date: '2026-06-12', type: '노후 고위험', name: '서버룸 에어컨',     dept: '정보기술부',  statusEmoji: '🔴', status: '미처리', person: '김담당' },
    { date: '2026-06-12', type: '보험 만료 임박', name: '법인차 소나타',  dept: '총무부',      statusEmoji: '🔴', status: '미처리', person: '이담당' },
    { date: '2026-06-11', type: '장기 유휴',   name: '회의실 프로젝터',   dept: '경영기획부',  statusEmoji: '🟡', status: '검토중', person: '박담당' },
    { date: '2026-06-11', type: '감가 이상',   name: '노트북 세트',       dept: '디지털혁신부', statusEmoji: '🟡', status: '검토중', person: '최담당' },
    { date: '2026-06-10', type: '노후 고위험', name: '냉방기 B동',        dept: '시설관리부',  statusEmoji: '✅', status: '완료',   person: '정담당' },
    { date: '2026-06-10', type: '장기 유휴',   name: '복합기 A동',        dept: '영업1부',     statusEmoji: '✅', status: '완료',   person: '홍담당' },
    { date: '2026-06-09', type: '보험 만료 임박', name: '화물차 12가1234', dept: '물류부',      statusEmoji: '✅', status: '완료',   person: '김담당' },
    { date: '2026-06-09', type: '노후 고위험', name: 'UPS 전원장치',      dept: '정보기술부',  statusEmoji: '✅', status: '완료',   person: '이담당' },
    { date: '2026-06-08', type: '감가 이상',   name: '서버 랙 C동',       dept: '정보기술부',  statusEmoji: '✅', status: '완료',   person: '박담당' },
    { date: '2026-06-07', type: '장기 유휴',   name: '빔프로젝터',        dept: '인재개발부',  statusEmoji: '✅', status: '완료',   person: '최담당' }
  ];

  var CHART_CANVAS_ID = 'aiph-anomaly-trend-chart';

  // ── 카드 HTML 생성 ────────────────────────────────────────────
  function renderCards(filterCategory) {
    var filtered = filterCategory
      ? CARDS.filter(function (c) { return c.category === filterCategory; })
      : CARDS;

    if (filtered.length === 0) {
      return '<p style="color:#888;font-size:14px;padding:24px 0;">해당 카테고리의 탐지 항목이 없습니다.</p>';
    }

    return filtered.map(function (c) {
      var borderColor = c.badgeColor;
      return [
        '<div class="aiph-anomaly-card" data-category="' + c.category + '">',
        '  <div class="aiph-anomaly-card-header">',
        '    <span class="aiph-anomaly-badge" style="background:' + borderColor + '20;color:' + borderColor + ';border:1px solid ' + borderColor + '60;">',
        '      ' + c.badgeEmoji + ' ' + c.category,
        '    </span>',
        '    <span class="aiph-anomaly-id">' + c.id + '</span>',
        '  </div>',
        '  <div class="aiph-anomaly-name">' + c.name + '</div>',
        '  <div class="aiph-anomaly-location">📍 ' + c.location + '</div>',
        '  <div class="aiph-anomaly-detail">' + c.detail + '</div>',
        '  <div class="aiph-anomaly-card-footer">',
        '    <button class="asis-btn primary aiph-anomaly-cta">' + c.btnLabel + '</button>',
        '    <span class="aiph-anomaly-false-report" onclick="alert(\'오탐 신고가 접수되었습니다. 담당자가 검토합니다.\')">오탐 신고</span>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');
  }

  // ── 이력 테이블 행 생성 ────────────────────────────────────────
  var historyRows = HISTORY.map(function (h) {
    return '<tr>' +
      '<td>' + h.date + '</td>' +
      '<td>' + h.type + '</td>' +
      '<td>' + h.name + '</td>' +
      '<td>' + h.dept + '</td>' +
      '<td>' + h.statusEmoji + ' ' + h.status + '</td>' +
      '<td>' + h.person + '</td>' +
      '</tr>';
  }).join('');

  // ── 필터 탭 생성 ──────────────────────────────────────────────
  var tabsHtml = FILTER_TABS.map(function (t, i) {
    var active = i === 0 ? ' active' : '';
    return '<button class="asis-tab' + active + '" data-category="' + t.category + '">' +
      t.label + ' <span class="aiph-anomaly-tab-count">(' + t.count + ')</span>' +
      '</button>';
  }).join('');

  // ── 메인 HTML ─────────────────────────────────────────────────
  el.innerHTML = [
    '<style>',
    '.aiph-anomaly-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}',
    '@media(max-width:1100px){.aiph-anomaly-grid{grid-template-columns:repeat(2,1fr);}}',
    '@media(max-width:700px){.aiph-anomaly-grid{grid-template-columns:1fr;}}',
    '.aiph-anomaly-card{background:#fff;border:1px solid #e8edf2;border-radius:10px;padding:18px 18px 14px;',
    '  display:flex;flex-direction:column;gap:8px;transition:box-shadow .15s;}',
    '.aiph-anomaly-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.09);}',
    '.aiph-anomaly-card[data-category="노후 고위험"]{border-left:4px solid #ef4444;}',
    '.aiph-anomaly-card[data-category="장기 유휴"]{border-left:4px solid #f97316;}',
    '.aiph-anomaly-card[data-category="보험 만료 임박"]{border-left:4px solid #ef4444;}',
    '.aiph-anomaly-card[data-category="감가 이상"]{border-left:4px solid #7c3aed;}',
    '.aiph-anomaly-card-header{display:flex;align-items:center;justify-content:space-between;gap:8px;}',
    '.aiph-anomaly-badge{font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:20px;white-space:nowrap;}',
    '.aiph-anomaly-id{font-size:11px;color:#aaa;font-family:monospace;}',
    '.aiph-anomaly-name{font-size:15px;font-weight:700;color:#1a1a2e;margin-top:2px;}',
    '.aiph-anomaly-location{font-size:12.5px;color:#888;}',
    '.aiph-anomaly-detail{font-size:13px;color:#444;line-height:1.5;background:#f8f9fb;',
    '  border-radius:6px;padding:8px 10px;margin-top:2px;}',
    '.aiph-anomaly-card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:4px;}',
    '.aiph-anomaly-cta{font-size:12.5px;padding:6px 14px;}',
    '.aiph-anomaly-false-report{font-size:12px;color:#aaa;cursor:pointer;text-decoration:underline;}',
    '.aiph-anomaly-false-report:hover{color:#ef4444;}',
    '.aiph-anomaly-tab-count{font-size:11px;color:inherit;opacity:.7;}',
    '.aiph-anomaly-scan-btn{padding:8px 18px;background:#ef4444;color:#fff;border:none;border-radius:7px;',
    '  font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;}',
    '.aiph-anomaly-scan-btn:hover{background:#dc2626;}',
    '.aiph-anomaly-scan-btn:disabled{background:#fca5a5;cursor:not-allowed;}',
    '</style>',

    '<div class="asis-page">',

    // 페이지 헤더
    '  <div class="asis-page-header">',
    '    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '      <h2 class="asis-page-title">이상탐지 보드</h2>',
    '      <span class="asis-badge">AI</span>',
    '    </div>',
    '    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">',
    '      <span style="font-size:13px;color:#888;">AI가 실시간으로 분석한 위험 자산 현황 · 마지막 스캔: 2026-06-12 09:00</span>',
    '      <button id="aiph-scan-btn" class="aiph-anomaly-scan-btn">전체 스캔 실행</button>',
    '    </div>',
    '  </div>',

    // KPI 카드
    '  <div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);">',
    '    <div class="asis-kpi-card" style="border-top:3px solid #ef4444;">',
    '      <div class="asis-kpi-label">신규 탐지</div>',
    '      <div class="asis-kpi-value">5<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">오늘 새로 발견</div>',
    '    </div>',
    '    <div class="asis-kpi-card accent-orange">',
    '      <div class="asis-kpi-label">위험 자산 합계</div>',
    '      <div class="asis-kpi-value">23<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">현재 모니터링 중</div>',
    '    </div>',
    '    <div class="asis-kpi-card accent-green">',
    '      <div class="asis-kpi-label">해소 완료</div>',
    '      <div class="asis-kpi-value">8<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">이번 주 처리</div>',
    '    </div>',
    '    <div class="asis-kpi-card" style="border-top:3px solid #94a3b8;">',
    '      <div class="asis-kpi-label">마지막 스캔</div>',
    '      <div class="asis-kpi-value">09:00</div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">2026-06-12 자동 실행</div>',
    '    </div>',
    '  </div>',

    // 필터 탭
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head">',
    '      <div class="asis-tabs" id="aiph-anomaly-tabs" style="border-bottom:none;">',
    tabsHtml,
    '      </div>',
    '    </div>',
    '    <div class="asis-panel-body">',
    '      <div class="aiph-anomaly-grid" id="aiph-anomaly-grid">',
    renderCards(''),
    '      </div>',
    '    </div>',
    '  </div>',

    // 탐지 건수 추이 차트
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head">',
    '      <span class="asis-panel-title">최근 30일 탐지 건수 추이</span>',
    '    </div>',
    '    <div class="asis-panel-body" style="padding-top:8px;">',
    '      <canvas id="' + CHART_CANVAS_ID + '" style="width:100%;height:180px;max-height:180px;"></canvas>',
    '    </div>',
    '  </div>',

    // 탐지 이력 테이블
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head">',
    '      <span class="asis-panel-title">탐지 이력</span>',
    '    </div>',
    '    <div class="asis-panel-body">',
    '      <div class="asis-table-wrap">',
    '        <table class="asis-table">',
    '          <thead><tr>',
    '            <th>탐지일</th><th>유형</th><th>자산명</th><th>부서</th><th>상태</th><th>처리 담당자</th>',
    '          </tr></thead>',
    '          <tbody>' + historyRows + '</tbody>',
    '        </table>',
    '      </div>',
    '    </div>',
    '  </div>',

    '</div>'
  ].join('\n');

  // ── 전체 스캔 버튼 동작 ───────────────────────────────────────
  var scanBtn = document.getElementById('aiph-scan-btn');
  if (scanBtn) {
    scanBtn.addEventListener('click', function () {
      scanBtn.textContent = '스캔 중...';
      scanBtn.disabled = true;
      setTimeout(function () {
        scanBtn.textContent = '전체 스캔 실행';
        scanBtn.disabled = false;
      }, 2000);
    });
  }

  // ── 필터 탭 동작 ─────────────────────────────────────────────
  var tabsEl = document.getElementById('aiph-anomaly-tabs');
  var gridEl = document.getElementById('aiph-anomaly-grid');
  if (tabsEl && gridEl) {
    tabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button.asis-tab');
      if (!btn) return;
      tabsEl.querySelectorAll('button.asis-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      btn.classList.add('active');
      gridEl.innerHTML = renderCards(btn.getAttribute('data-category'));
    });
  }

  // ── Chart.js 탐지 건수 추이 차트 ─────────────────────────────
  (function () {
    var canvas = document.getElementById(CHART_CANVAS_ID);
    if (!canvas || typeof Chart === 'undefined') return;

    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    var ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['6/1', '6/2', '6/3', '6/4', '6/5', '6/6', '6/7', '6/8', '6/9', '6/10', '6/11', '6/12'],
        datasets: [{
          label: '탐지 건수',
          data: [2, 3, 1, 4, 2, 3, 5, 2, 4, 3, 2, 5],
          backgroundColor: 'rgba(220,38,38,0.7)',
          borderColor: 'rgba(220,38,38,1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return '탐지 건수: ' + context.parsed.y + '건';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 12 } }
          },
          y: {
            min: 0,
            max: 8,
            ticks: {
              stepSize: 2,
              font: { size: 12 }
            },
            grid: { color: '#f0f0f0' }
          }
        }
      }
    });
  })();
};
