// AI Phase — 결산·감사 지원

window.renderAiphClosing = function () {
  var el = document.getElementById('view-aiph-closing');
  if (!el) return;
  el.innerHTML = '';

  // ── 데이터 ────────────────────────────────────────────────────
  var BALANCE_ROWS = [
    { account: '유형자산',     diff: '17,300만원', cause: '이수관 누락',        recommend: '이수관 등록 처리', status: '🔴 미처리' },
    { account: '투자부동산',   diff: '4,800만원',  cause: '자본적지출 미반영',  recommend: '자본화 처리',      status: '🟡 검토중' },
    { account: '감가상각누계', diff: '2,100만원',  cause: '감가상각 이상',       recommend: '내용연수 재검토',  status: '🟡 검토중' },
    { account: '리스부채',     diff: '890만원',    cause: '이수관 누락',        recommend: '이수관 등록 처리', status: '🔴 미처리' },
    { account: '유형자산',     diff: '3,200만원',  cause: '처분 회계 오류',     recommend: '역분개 처리',      status: '✅ 처리완료' },
    { account: '투자부동산',   diff: '1,500만원',  cause: '시스템 이슈',        recommend: 'IT 담당자 확인',   status: '✅ 처리완료' },
    { account: '감가상각누계', diff: '760만원',    cause: '자본적지출 미반영',   recommend: '자본화 처리',      status: '🟡 검토중' }
  ];

  var DEPRECIATION_ROWS = [
    { id: 'AST-2021-034', name: '노트북 세트 30대', expected: 60,  actual: 91,  diff: '+31%', risk: '🔴 고위험' },
    { id: 'AST-2019-112', name: '서버룸 에어컨',    expected: 10,  actual: 14,  diff: '+40%', risk: '🔴 고위험' },
    { id: 'AST-2022-078', name: '복합기 5대',        expected: 20,  actual: 24,  diff: '+20%', risk: '🟡 중간' },
    { id: 'AST-2020-055', name: '냉난방기 B동',      expected: 10,  actual: 13,  diff: '+30%', risk: '🟡 중간' }
  ];

  var NOTE_ROWS = [
    { item: '유형자산 장부금액',   prev: '3,842억원',  curr: '3,891억원',  change: '+49억원', result: '✅', resultText: '일치',     color: '#16A34A' },
    { item: '투자부동산 장부금액', prev: '1,204억원',  curr: '1,187억원',  change: '-17억원', result: '⚠️', resultText: '검토 필요', color: '#B45309' },
    { item: '리스부채 잔액',       prev: '892억원',    curr: '934억원',    change: '+42억원', result: '✅', resultText: '일치',     color: '#16A34A' },
    { item: '무형자산 잔액',       prev: '287억원',    curr: '299억원',    change: '+12억원', result: '🔴', resultText: '불일치',   color: '#DC2626' },
    { item: '리스사용권자산',      prev: '1,156억원',  curr: '1,203억원',  change: '+47억원', result: '✅', resultText: '일치',     color: '#16A34A' },
    { item: '충당부채 (복구)',     prev: '78억원',     curr: '84억원',     change: '+6억원',  result: '⚠️', resultText: '검토 필요', color: '#B45309' }
  ];

  var CHECKLIST = [
    { title: '결산 전 수행 작업', total: 6, done: 6, status: '완료' },
    { title: '결산 처리',         total: 8, done: 3, status: '진행중' },
    { title: '결산 후속 작업',    total: 5, done: 0, status: '대기' },
    { title: '주석공시 자료',     total: 4, done: 0, status: '대기' },
    { title: '최종 보고서',       total: 3, done: 0, status: '대기' }
  ];

  // ── HTML 렌더링 ─────────────────────────────────────────────────
  // 탭1: 잔액대사 테이블
  var balanceRows = BALANCE_ROWS.map(function (r) {
    return '<tr><td>' + r.account + '</td><td style="font-weight:600;color:#ef4444;">' + r.diff + '</td><td>' + r.cause + '</td><td>' + r.recommend + '</td><td>' + r.status + '</td></tr>';
  }).join('');

  // 탭1: 감가상각 카드 (4개)
  var depriCards = DEPRECIATION_ROWS.map(function (r) {
    var borderColor = r.risk.indexOf('고위험') !== -1 ? '#ef4444' : '#f59e0b';
    return '<div style="background:#fff;border:1px solid #e5e7eb;border-left:4px solid ' + borderColor + ';border-radius:8px;padding:14px 16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:12px;color:#6b7280;">' + r.id + '</span>' +
      '<span style="font-size:12px;font-weight:600;">' + r.risk + '</span>' +
      '</div>' +
      '<div style="font-size:14px;font-weight:600;margin-bottom:10px;">' + r.name + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">' +
      '<div style="background:#f9fafb;border-radius:4px;padding:6px 8px;"><div style="font-size:11px;color:#9ca3af;">예상 상각률</div><div style="font-size:13px;font-weight:600;">' + r.expected + '%</div></div>' +
      '<div style="background:#fef2f2;border-radius:4px;padding:6px 8px;"><div style="font-size:11px;color:#9ca3af;">실제 상각률</div><div style="font-size:13px;font-weight:600;color:#ef4444;">' + r.actual + '%</div></div>' +
      '<div style="background:#fff7ed;border-radius:4px;padding:6px 8px;"><div style="font-size:11px;color:#9ca3af;">차이</div><div style="font-size:13px;font-weight:600;color:#f97316;">' + r.diff + '</div></div>' +
      '</div></div>';
  }).join('');

  // 도넛 차트 범례
  var donutLegend = [
    { label: '이수관 누락',       count: 3, color: '#EF4444' },
    { label: '자본적지출 미반영', count: 2, color: '#F97316' },
    { label: '처분 회계 오류',    count: 1, color: '#7C3AED' },
    { label: '시스템 이슈',       count: 1, color: '#94A3B8' }
  ].map(function (d) {
    return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">' +
      '<span style="width:10px;height:10px;border-radius:50%;background:' + d.color + ';flex-shrink:0;"></span>' +
      '<span style="font-size:12px;flex:1;">' + d.label + '</span>' +
      '<span style="font-size:12px;font-weight:600;">' + d.count + '건</span>' +
      '</div>';
  }).join('');

  // 탭2: 주석공시 테이블
  var noteRows = NOTE_ROWS.map(function (r) {
    var actionBtn = r.resultText === '불일치' ?
      '<button style="font-size:11px;padding:3px 8px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;">결재함으로 이동</button>' : '—';
    return '<tr><td>' + r.item + '</td><td>' + r.prev + '</td><td>' + r.curr + '</td><td>' + r.change + '</td>' +
      '<td style="font-weight:600;color:' + r.color + ';">' + r.result + ' ' + r.resultText + '</td>' +
      '<td>' + actionBtn + '</td></tr>';
  }).join('');

  // 탭3: 체크리스트 카드
  var checkCards = CHECKLIST.map(function (c) {
    var pct = c.total > 0 ? Math.round(c.done / c.total * 100) : 0;
    var icon, bgColor, barColor, statusLabel;
    if (c.status === '완료') {
      icon = '✅'; bgColor = '#f0fdf4'; barColor = '#16a34a'; statusLabel = '완료';
    } else if (c.status === '진행중') {
      icon = '⏳'; bgColor = '#eff6ff'; barColor = '#2563eb'; statusLabel = '진행중';
    } else {
      icon = '⏱'; bgColor = '#f9fafb'; barColor = '#d1d5db'; statusLabel = '대기';
    }
    return '<div style="background:' + bgColor + ';border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
      '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:16px;">' + icon + '</span><span style="font-size:14px;font-weight:600;">' + c.title + '</span></div>' +
      '<span style="font-size:12px;color:#6b7280;">' + c.done + ' / ' + c.total + '</span>' +
      '</div>' +
      '<div style="background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;margin-bottom:6px;">' +
      '<div style="background:' + barColor + ';height:100%;width:' + pct + '%;border-radius:4px;transition:width .3s;"></div>' +
      '</div>' +
      '<div style="font-size:11px;color:#6b7280;text-align:right;">' + statusLabel + ' · ' + pct + '%</div>' +
      '</div>';
  }).join('');

  // ── 전체 HTML ────────────────────────────────────────────────────
  el.innerHTML =
    '<div class="asis-page">' +

    // 헤더
    '<div class="asis-page-header">' +
    '<h2 class="asis-page-title">AI 결산·감사 지원 <span class="asis-badge">AI</span></h2>' +
    '<span style="font-size:13px;color:var(--text-secondary);">AI가 결산 데이터를 분석하여 이상 항목을 탐지하고 주석공시 정확성을 검증합니다 · 결산기: 2026 상반기</span>' +
    '</div>' +

    // KPI 4개
    '<div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">' +
    '<div class="asis-kpi-card" style="border-top:3px solid #ef4444;"><div class="asis-kpi-label">잔액 불일치</div><div class="asis-kpi-value">7건</div></div>' +
    '<div class="asis-kpi-card" style="border-top:3px solid var(--accent-orange, #f97316);"><div class="asis-kpi-label">감가상각 이상</div><div class="asis-kpi-value">4건</div></div>' +
    '<div class="asis-kpi-card" style="border-top:3px solid #f59e0b;"><div class="asis-kpi-label">미처리 전표</div><div class="asis-kpi-value">12건</div></div>' +
    '<div class="asis-kpi-card" style="border-top:3px solid var(--accent-green, #16a34a);"><div class="asis-kpi-label">AI 검증 정확도</div><div class="asis-kpi-value">97.3%</div></div>' +
    '</div>' +

    // 탭 패널
    '<div class="asis-panel">' +
    '<div class="asis-panel-head">' +
    '<div class="asis-tabs" id="closing-tabs">' +
    '<button class="asis-tab active" data-tab="tab1">결산 이상 탐지</button>' +
    '<button class="asis-tab" data-tab="tab2">주석공시 검증</button>' +
    '<button class="asis-tab" data-tab="tab3">AI 결산 체크리스트</button>' +
    '</div>' +
    '</div>' +
    '<div class="asis-panel-body">' +

    // 탭1
    '<div id="closing-tab1" style="padding:16px 0 0;">' +
    '<div style="display:grid;grid-template-columns:280px 1fr;gap:20px;margin-bottom:20px;">' +
    '<div>' +
    '<div style="font-size:14px;font-weight:600;margin-bottom:10px;">불일치 원인 분류</div>' +
    '<div style="position:relative;height:200px;padding:8px 0;"><canvas id="closing-donut-chart"></canvas></div>' +
    '<div style="margin-top:12px;">' + donutLegend + '</div>' +
    '</div>' +
    '<div>' +
    '<div style="font-size:14px;font-weight:600;margin-bottom:10px;">잔액대사 AI 분석</div>' +
    '<div style="overflow-x:auto;">' +
    '<table class="asis-table"><thead><tr><th>계정과목</th><th>불일치 금액</th><th>원인</th><th>AI 권고사항</th><th>처리 상태</th></tr></thead>' +
    '<tbody>' + balanceRows + '</tbody></table>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div style="font-size:14px;font-weight:600;margin-bottom:10px;">감가상각 이상 탐지</div>' +
    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;">' + depriCards + '</div>' +
    '</div>' +

    // 탭2
    '<div id="closing-tab2" style="display:none;padding:16px 0 0;">' +
    '<div style="background:#F0F9FF;border-left:4px solid #0284C7;padding:12px 16px;border-radius:6px;margin-bottom:16px;font-size:13px;color:#0c4a6e;">' +
    '전기말 기준 vs 당기말 기준 주석공시 데이터를 AI가 자동 비교·검증합니다. 🔴 불일치 항목은 자동으로 AI 결재함에 검토 요청이 생성됩니다.' +
    '</div>' +
    '<div style="overflow-x:auto;">' +
    '<table class="asis-table"><thead><tr><th>항목</th><th>전기말</th><th>당기말</th><th>변동</th><th>AI 검증</th><th>액션</th></tr></thead>' +
    '<tbody>' + noteRows + '</tbody></table>' +
    '</div>' +
    '</div>' +

    // 탭3
    '<div id="closing-tab3" style="display:none;padding:16px 0 0;">' +
    '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">AI가 결산 단계별 진행 현황을 자동 추적합니다. 각 항목을 클릭하면 세부 작업 목록을 확인할 수 있습니다.</div>' +
    '<div style="display:flex;flex-direction:column;gap:12px;">' + checkCards + '</div>' +
    '</div>' +

    '</div></div></div>';

  // ── 탭 전환 이벤트 ─────────────────────────────────────────────
  var tabsEl = document.getElementById('closing-tabs');
  if (tabsEl) {
    tabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button.asis-tab');
      if (!btn) return;
      tabsEl.querySelectorAll('button.asis-tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      var tabId = btn.getAttribute('data-tab');
      ['tab1', 'tab2', 'tab3'].forEach(function (id) {
        var pane = document.getElementById('closing-' + id);
        if (pane) pane.style.display = (id === tabId) ? '' : 'none';
      });
      if (tabId === 'tab1') {
        initDonut();
      }
    });
  }

  // ── Chart.js 도넛 차트 ─────────────────────────────────────────
  function initDonut() {
    var canvas = document.getElementById('closing-donut-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['이수관 누락', '자본적지출 미반영', '처분 회계 오류', '시스템 이슈'],
        datasets: [{
          data: [3, 2, 1, 1],
          backgroundColor: ['#EF4444', '#F97316', '#7C3AED', '#94A3B8'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 16, top: 8 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.parsed + '건';
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 최초 진입 시 도넛 차트 초기화
  initDonut();
};
