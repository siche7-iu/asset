// AI Phase — AI 예산 어시스턴트

window.renderAiphBudget = function () {
  var el = document.getElementById('view-aiph-budget');
  if (!el) return;
  el.innerHTML = '';

  // ── 데이터 ────────────────────────────────────────────────────
  var BUDGET_DATA = [
    { no: 'BDG-2026-031', office: '서울중부', item: 'IT 장비 구매',  allocated: 5000, executed: 600,  rate: 12, predict: '🔴 불용위험', action: '재배분' },
    { no: 'BDG-2026-055', office: '인천',     item: '시설보수',       allocated: 3200, executed: 1380, rate: 43, predict: '🟡 주의',    action: '모니터링' },
    { no: 'BDG-2026-078', office: '부산',     item: '차량교체',       allocated: 8500, executed: 7200, rate: 85, predict: '🟢 정상',    action: '—' },
    { no: 'BDG-2026-042', office: '대구',     item: '차량교체',       allocated: 2900, executed: 900,  rate: 31, predict: '🔴 불용위험', action: '재배분' },
    { no: 'BDG-2026-067', office: '광주',     item: '냉난방 교체',    allocated: 5600, executed: 3472, rate: 62, predict: '🟡 주의',    action: '집행 촉진' },
    { no: 'BDG-2026-088', office: '대전',     item: '서버 장비',      allocated: 7200, executed: 6840, rate: 95, predict: '🟢 정상',    action: '—' },
    { no: 'BDG-2026-019', office: '서울강남', item: '사무환경 개선',  allocated: 4100, executed: 2583, rate: 63, predict: '🟡 주의',    action: '집행 촉진' },
    { no: 'BDG-2026-033', office: '수원',     item: '보안장비',       allocated: 3300, executed: 3135, rate: 95, predict: '🟢 정상',    action: '—' },
    { no: 'BDG-2026-071', office: '인천',     item: '사무환경 개선',  allocated: 5300, executed: 3074, rate: 58, predict: '🟡 주의',    action: '집행 촉진' },
    { no: 'BDG-2026-102', office: '부산',     item: '시설보수',       allocated: 4800, executed: 4656, rate: 97, predict: '🟢 정상',    action: '—' },
    { no: 'BDG-2026-015', office: '대구',     item: '냉난방 교체',    allocated: 6200, executed: 5890, rate: 95, predict: '🟢 정상',    action: '—' },
    { no: 'BDG-2026-099', office: '광주',     item: 'IT 장비 구매',  allocated: 3700, executed: 2442, rate: 66, predict: '🟡 주의',    action: '집행 촉진' }
  ];

  var INSIGHT_ITEMS = [
    {
      level: 'danger',
      title: '불용 위험 예산 탐지 (3건)',
      items: [
        { name: '서울중부 / IT 장비 구매 예산', remain: '4,200만원', rate: 12, predict: '연말까지 소진 불가능', action: '재배분 요청' },
        { name: '부산지역 / 시설보수 예산',      remain: '1,800만원', rate: 43, predict: '목표 미달 가능',      action: '경고 알림 전송' },
        { name: '대구지역 / 차량교체 예산',      remain: '900만원',   rate: 31, predict: '위험 (추세 악화)',    action: '재배분 요청' }
      ]
    },
    {
      level: 'warning',
      title: '집행 가속 권고 (5건)',
      items: [
        { name: '인천 / 사무환경 개선',  remain: '3,100만원', rate: 58, predict: '목표 달성 가능', action: '집행 촉진' },
        { name: '광주 / 냉난방 교체',    remain: '2,200만원', rate: 62, predict: '목표 달성 가능', action: '집행 촉진' }
      ]
    }
  ];

  // ── 인사이트 카드 HTML 생성 ───────────────────────────────────
  function renderInsightCard(ins) {
    var isDanger = ins.level === 'danger';
    var borderColor  = isDanger ? '#ef4444' : '#f59e0b';
    var bgColor      = isDanger ? '#fef2f2' : '#fffbeb';
    var titleColor   = isDanger ? '#dc2626' : '#b45309';

    var itemsHtml = ins.items.map(function (item) {
      return [
        '<div style="background:#fff;border-radius:6px;padding:12px 14px;border:1px solid ' + borderColor + '30;margin-top:8px;">',
        '  <div style="font-weight:600;font-size:13px;color:#1a1a2e;margin-bottom:6px;">' + item.name + '</div>',
        '  <div style="font-size:12px;color:#666;margin-bottom:4px;">잔여: ' + item.remain + ' &nbsp;/&nbsp; 집행률: ' + item.rate + '%</div>',
        '  <div style="font-size:12px;color:#888;margin-bottom:10px;">예측: ' + item.predict + '</div>',
        '  <button onclick="alert(\'AI 결재함으로 요청이 전달되었습니다.\')" style="padding:4px 10px;background:' + borderColor + ';color:#fff;border:none;border-radius:5px;font-size:11.5px;cursor:pointer;">' + item.action + '</button>',
        '</div>'
      ].join('');
    }).join('');

    return [
      '<div style="border-left:4px solid ' + borderColor + ';background:' + bgColor + ';border-radius:8px;padding:14px 14px 10px;">',
      '  <div style="font-size:13.5px;font-weight:700;color:' + titleColor + ';margin-bottom:4px;">' + ins.title + '</div>',
      itemsHtml,
      '</div>'
    ].join('');
  }

  // ── 테이블 행 HTML 생성 ───────────────────────────────────────
  var tableRows = BUDGET_DATA.map(function (row) {
    var rateColor = row.rate >= 80 ? '#16a34a' : (row.rate >= 50 ? '#b45309' : '#dc2626');
    var actionHtml = row.action === '—'
      ? '<span style="color:#aaa;">—</span>'
      : '<button onclick="alert(\'AI 결재함으로 요청이 전달되었습니다.\')" style="padding:3px 9px;background:#3B82F6;color:#fff;border:none;border-radius:4px;font-size:11.5px;cursor:pointer;">' + row.action + '</button>';

    return '<tr>' +
      '<td style="font-family:monospace;font-size:12px;">' + row.no + '</td>' +
      '<td>' + row.office + '</td>' +
      '<td>' + row.item + '</td>' +
      '<td style="text-align:right;">' + row.allocated.toLocaleString() + '</td>' +
      '<td style="text-align:right;">' + row.executed.toLocaleString() + '</td>' +
      '<td style="text-align:right;font-weight:600;color:' + rateColor + ';">' + row.rate + '%</td>' +
      '<td>' + row.predict + '</td>' +
      '<td>' + actionHtml + '</td>' +
      '</tr>';
  }).join('');

  // ── 메인 HTML ─────────────────────────────────────────────────
  el.innerHTML = [
    '<div class="asis-page">',

    // 페이지 헤더
    '  <div class="asis-page-header">',
    '    <h2 class="asis-page-title">AI 예산 어시스턴트 <span class="asis-badge">AI</span></h2>',
    '    <span style="font-size:13px;color:#888;">AI가 예산 집행 데이터를 분석하여 불용 예산을 사전 탐지하고 재배분을 제안합니다 · 마지막 분석: 2026-06-15 09:00</span>',
    '  </div>',

    // KPI 4개
    '  <div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);">',
    '    <div class="asis-kpi-card accent-blue">',
    '      <div class="asis-kpi-label">잔여 예산</div>',
    '      <div class="asis-kpi-value">287<span class="asis-kpi-sub">억원</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">전체 배정 대비 잔여</div>',
    '    </div>',
    '    <div class="asis-kpi-card" style="border-top:3px solid #ef4444;">',
    '      <div class="asis-kpi-label">불용 위험 예산</div>',
    '      <div class="asis-kpi-value">3<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">AI 연말 소진 불가 예측</div>',
    '    </div>',
    '    <div class="asis-kpi-card accent-orange">',
    '      <div class="asis-kpi-label">집행률 달성 예측</div>',
    '      <div class="asis-kpi-value">83.7<span class="asis-kpi-sub">%</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">AI 9월 말 기준 예측치</div>',
    '    </div>',
    '    <div class="asis-kpi-card accent-green">',
    '      <div class="asis-kpi-label">AI 재배분 제안</div>',
    '      <div class="asis-kpi-value">3<span class="asis-kpi-sub">건</span></div>',
    '      <div style="font-size:11.5px;color:#888;margin-top:4px;">승인 대기 중</div>',
    '    </div>',
    '  </div>',

    // 2열: 좌(차트 2개) / 우(AI 인사이트)
    '  <div style="display:grid;grid-template-columns:1fr minmax(0,320px);gap:20px;margin-bottom:20px;overflow:hidden;">',

    // 좌측: 차트 패널
    '    <div style="display:flex;flex-direction:column;gap:16px;min-width:0;">',
    '      <div class="asis-panel">',
    '        <div class="asis-panel-head"><span class="asis-panel-title">사무소별 예산 배정 vs 집행 현황</span></div>',
    '        <div class="asis-panel-body"><canvas id="budget-office-chart" style="max-height:220px;"></canvas></div>',
    '      </div>',
    '      <div class="asis-panel">',
    '        <div class="asis-panel-head"><span class="asis-panel-title">월별 집행 추세 + AI 예측선</span></div>',
    '        <div class="asis-panel-body"><canvas id="budget-trend-chart" style="max-height:200px;"></canvas></div>',
    '      </div>',
    '    </div>',

    // 우측: AI 인사이트 패널
    '    <div class="asis-panel" style="height:fit-content;min-width:0;overflow:hidden;">',
    '      <div class="asis-panel-head"><span class="asis-panel-title">🤖 AI 인사이트</span></div>',
    '      <div class="asis-panel-body" style="display:flex;flex-direction:column;gap:14px;padding:14px;">',
    INSIGHT_ITEMS.map(renderInsightCard).join('\n'),
    '      </div>',
    '    </div>',

    '  </div>',

    // 예산 집행 상세 테이블
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head" style="flex-wrap:wrap;gap:8px;">',
    '      <span class="asis-panel-title">예산 집행 상세</span>',
    '      <button onclick="alert(\'CSV로 내보냅니다.\')" style="padding:5px 12px;border:1px solid #E2E8F0;border-radius:6px;background:#F8FAFC;font-size:12px;cursor:pointer;flex-shrink:0;">📥 내보내기</button>',
    '    </div>',
    '    <div class="asis-panel-body">',
    '      <div class="asis-table-wrap" style="overflow-x:auto;">',
    '        <table class="asis-table">',
    '          <thead><tr>',
    '            <th>예산번호</th><th>사무소</th><th>항목</th><th style="text-align:right;">배정(만원)</th><th style="text-align:right;">집행(만원)</th><th style="text-align:right;">집행률</th><th>AI 예측</th><th>조치</th>',
    '          </tr></thead>',
    '          <tbody>' + tableRows + '</tbody>',
    '        </table>',
    '      </div>',
    '    </div>',
    '  </div>',

    '</div>'
  ].join('\n');

  // ── Chart.js: 사무소별 예산 배정 vs 집행 바 차트 ─────────────
  (function () {
    var canvas = document.getElementById('budget-office-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    var ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['서울중부', '인천', '부산', '대구', '광주', '대전', '서울강남', '수원'],
        datasets: [
          {
            label: '배정',
            data: [9100, 8500, 13300, 9100, 5600, 7200, 4100, 3300],
            backgroundColor: 'rgba(59,130,246,0.5)',
            borderColor: '#3B82F6',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: '집행',
            data: [600, 4454, 11856, 6790, 3472, 6840, 2583, 3135],
            backgroundColor: 'rgba(34,197,94,0.6)',
            borderColor: '#22C55E',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback: function (v) { return (v / 10000).toFixed(0) + '억'; }
            },
            grid: { color: '#f0f0f0' }
          }
        }
      }
    });
  })();

  // ── Chart.js: 월별 집행 추세 + AI 예측 꺾은선 ────────────────
  (function () {
    var canvas = document.getElementById('budget-trend-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    var ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월(예)', '8월(예)', '9월(예)'],
        datasets: [
          {
            label: '실제 집행률',
            data: [38.2, 41.5, 45.8, 52.1, 58.7, 63.4, null, null, null],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: 'AI 예측',
            data: [null, null, null, null, null, 63.4, 69.8, 74.2, 83.7],
            borderColor: '#EF4444',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: function (v) { return v + '%'; }
            },
            grid: { color: '#f0f0f0' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  })();
};
