// AI 에이전트 모니터링 대시보드

window.renderAiphMonitor = function () {
  var el = document.getElementById('view-aiph-monitor');
  if (!el) return;
  el.innerHTML = '';

  // ── 데이터 ──────────────────────────────────────────────────────────────────

  var AGENTS = [
    {
      id: 'agent-query',
      name: '자산조회 Agent',
      type: 'Copilot',
      calls: 198,
      successRate: '99.5%',
      avgResp: '1.2초',
      statusCls: 'ok',
      statusLabel: '🟢 정상',
      rowBg: '',
      session: {
        id: 'SES-20260612-0847',
        user: '김담당',
        agentLabel: 'AI Copilot',
        timeRange: '09:14:32 ~ 09:14:34 (1.8초)',
        result: '성공',
        confidence: 'GOOD',
        timeline: [
          { time: '09:14:32.001', msg: '사용자 입력 수신' },
          { time: '09:14:32.120', msg: '자산DB 검색 실행 (location:서울, status:유휴)' },
          { time: '09:14:32.890', msg: '검색 결과 14건 수신' },
          { time: '09:14:33.200', msg: '집계 계산 (취득금액 합산: 38억 2천만원)' },
          { time: '09:14:33.800', msg: 'LLM 답변 생성 (384토큰)' },
          { time: '09:14:34.000', msg: '응답 전송 완료' }
        ],
        footer: '근거 자산 14건 · 토큰 384 · 정책 검사 통과'
      }
    },
    {
      id: 'agent-anomaly',
      name: '이상탐지 Agent',
      type: '배치',
      calls: 1,
      successRate: '100%',
      avgResp: '45초',
      statusCls: 'ok',
      statusLabel: '🟢 정상',
      rowBg: '',
      session: {
        id: 'SES-20260612-0300',
        user: '시스템 스케줄러',
        agentLabel: '배치 Agent',
        timeRange: '03:00:00 ~ 03:00:45 (45초)',
        result: '성공',
        confidence: 'HIGH',
        timeline: [
          { time: '03:00:00.000', msg: '배치 스케줄 트리거' },
          { time: '03:00:01.200', msg: '자산 데이터 12,492건 로드' },
          { time: '03:00:18.500', msg: '이상 패턴 분석 (내용연수 초과 기준 적용)' },
          { time: '03:00:38.900', msg: '위험 자산 247건 식별' },
          { time: '03:00:43.200', msg: '알림 발송 (담당자 12명)' },
          { time: '03:00:45.000', msg: '배치 완료 / 결과 저장' }
        ],
        footer: '분석 자산 12,492건 · 위험 식별 247건 · 알림 12건 발송'
      }
    },
    {
      id: 'agent-report',
      name: '리포트 Agent',
      type: '요청',
      calls: 8,
      successRate: '87.5%',
      avgResp: '8.3초',
      statusCls: 'warn',
      statusLabel: '🟡 주의',
      rowBg: '#fffbeb',
      session: {
        id: 'SES-20260612-1102',
        user: '이팀장',
        agentLabel: '요청 Agent',
        timeRange: '11:02:15 ~ 11:02:24 (8.9초)',
        result: '실패',
        confidence: 'LOW',
        warning: '경고: 최근 1건 실패 — 데이터 범위 오류(2026-07-01 미래 날짜 요청)',
        timeline: [
          { time: '11:02:15.000', msg: '리포트 생성 요청 수신 (2026-01 ~ 2026-07)' },
          { time: '11:02:15.800', msg: '입력 파라미터 검증' },
          { time: '11:02:16.200', msg: '⚠️ 날짜 범위 오류 감지 (종료일 2026-07-01 미래)' },
          { time: '11:02:16.500', msg: '오류 응답 반환 — 가능 범위: 2026-01 ~ 2026-06' },
          { time: '11:02:24.000', msg: '세션 종료 (실패 처리)' }
        ],
        footer: '처리 토큰 52 · 오류 코드 INVALID_DATE_RANGE · 재시도 가능'
      }
    },
    {
      id: 'agent-insurance',
      name: '보험만료 Agent',
      type: '배치',
      calls: 1,
      successRate: '100%',
      avgResp: '12초',
      statusCls: 'ok',
      statusLabel: '🟢 정상',
      rowBg: '',
      session: {
        id: 'SES-20260612-0600',
        user: '시스템 스케줄러',
        agentLabel: '배치 Agent',
        timeRange: '06:00:00 ~ 06:00:12 (12초)',
        result: '성공',
        confidence: 'HIGH',
        timeline: [
          { time: '06:00:00.000', msg: '보험만료 점검 스케줄 트리거' },
          { time: '06:00:01.500', msg: '보험 계약 데이터 조회 (차량 99건·건물 9건)' },
          { time: '06:00:05.200', msg: 'D-30일 이내 만료 건 필터링' },
          { time: '06:00:09.800', msg: '만료 예정 3건 식별 (차량 2건·건물 1건)' },
          { time: '06:00:11.400', msg: '담당자 이메일·SMS 알림 발송' },
          { time: '06:00:12.000', msg: '점검 완료 / 결과 로그 저장' }
        ],
        footer: '점검 108건 · 만료 예정 3건 · 알림 3건 발송'
      }
    }
  ];

  var GUARDRAIL_ROWS = [
    { time: '09:23', user: '박○○', query: '타 부서 개인정보 포함 질의', type: 'PII 탐지',  action: '자동 차단' },
    { time: '10:02', user: '이○○', query: '전체 자산 원가 일괄 조회',   type: '권한 오류', action: '자동 차단' },
    { time: '11:15', user: '김○○', query: '사원 자택 주소 포함 질의',   type: 'PII 탐지',  action: '자동 차단' }
  ];

  var AXIS_CARDS = [
    { icon: '🤖', label: '빌드',   value: '에이전트 4개 운영 중', color: '#2563eb', footer: '모두 정상' },
    { icon: '👁',  label: '관찰',  value: '오늘 247 세션',        color: '#7c3aed', footer: '↑ 12% vs 어제' },
    { icon: '✅',  label: '평가',  value: '정확도 91.2%',          color: '#16a34a', footer: '목표 95% 진행 중' },
    { icon: '💰', label: '비용',   value: '142,300 토큰',          color: '#d97706', footer: '월 예산 38% 소진' },
    { icon: '🛡',  label: '보안',  value: '차단 4건',              color: '#dc2626', footer: 'PII 3건, 권한 1건' },
    { icon: '📋', label: '결재',   value: '대기 3건',              color: '#0891b2', footer: 'SLA: D-1일 이내' }
  ];

  var HOUR_DATA = [0,0,1,0,2,3,8,15,22,18,21,19,14,16,20,18,22,15,10,8,5,3,1,0];
  var RESP_LABELS = ['6/6','6/7','6/8','6/9','6/10','6/11','6/12'];
  var RESP_P50    = [2.1, 1.9, 2.3, 1.8, 2.0, 1.7, 1.8];
  var RESP_P95    = [4.2, 3.8, 4.5, 3.6, 4.0, 3.4, 3.6];

  // ── CSS ─────────────────────────────────────────────────────────────────────

  if (!document.getElementById('aiph-monitor-style')) {
    var style = document.createElement('style');
    style.id = 'aiph-monitor-style';
    style.textContent = [
      /* 6축 카드 그리드 */
      '.am-axis-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px}',
      '@media(min-width:1280px){.am-axis-grid{grid-template-columns:repeat(6,1fr)}}',
      '.am-axis-card{background:#fff;border-radius:10px;padding:18px 16px 14px;border-top:4px solid;',
        'box-shadow:0 1px 4px rgba(0,0,0,.07);cursor:pointer;transition:transform .15s,box-shadow .15s}',
      '.am-axis-card:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.13)}',
      '.am-axis-icon{font-size:22px;margin-bottom:6px}',
      '.am-axis-value{font-size:15px;font-weight:700;color:#111827;line-height:1.3;margin-bottom:4px}',
      '.am-axis-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;margin-bottom:8px}',
      '.am-axis-footer{font-size:11px;color:#6b7280;border-top:1px solid #f3f4f6;padding-top:8px;margin-top:4px}',
      /* 차트 2열 */
      '.am-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}',
      '@media(max-width:900px){.am-chart-grid{grid-template-columns:1fr}}',
      /* 세션 상세 패널 */
      '.am-session-panel{display:none;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;',
        'padding:18px 20px;margin-top:10px;font-size:13px;line-height:1.6}',
      '.am-session-panel.open{display:block}',
      '.am-session-panel h4{font-size:13px;font-weight:700;color:#1e293b;margin:0 0 8px}',
      '.am-session-divider{border:none;border-top:1px dashed #cbd5e1;margin:10px 0}',
      '.am-session-meta{display:grid;grid-template-columns:auto 1fr;gap:2px 14px;margin-bottom:4px}',
      '.am-session-meta dt{font-weight:600;color:#64748b;white-space:nowrap}',
      '.am-session-meta dd{margin:0;color:#1e293b}',
      /* 타임라인 */
      '.am-timeline{position:relative;padding-left:20px;border-left:2px dashed #cbd5e1;',
        'margin:8px 0;display:flex;flex-direction:column;gap:5px}',
      '.am-tl-row{display:flex;gap:10px;align-items:baseline;position:relative}',
      '.am-tl-row::before{content:"";position:absolute;left:-25px;top:6px;',
        'width:8px;height:8px;border-radius:50%;background:#94a3b8;border:2px solid #fff}',
      '.am-tl-time{font-size:11px;color:#94a3b8;white-space:nowrap;min-width:96px}',
      '.am-tl-msg{color:#374151}',
      '.am-session-footer-note{font-size:11px;color:#64748b;margin-top:10px;padding-top:8px;',
        'border-top:1px dashed #cbd5e1}',
      '.am-session-warn{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;',
        'padding:6px 10px;font-size:12px;color:#92400e;margin-bottom:8px}',
      /* 가드레일 stat 카드 */
      '.am-stat-row{display:flex;gap:12px;margin-bottom:14px}',
      '.am-stat-card{flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:8px;',
        'padding:12px 14px;text-align:center}',
      '.am-stat-num{font-size:22px;font-weight:800;color:#dc2626}',
      '.am-stat-label{font-size:11px;color:#6b7280;margin-top:2px}',
      /* 세션 보기 버튼 */
      '.am-btn-sess{font-size:12px;padding:3px 10px;border:1px solid #d1d5db;border-radius:5px;',
        'background:#fff;cursor:pointer;color:#374151;transition:background .1s}',
      '.am-btn-sess:hover{background:#f3f4f6}',
      '.am-btn-sess.active{background:#eff6ff;border-color:#93c5fd;color:#1d4ed8}'
    ].join('');
    document.head.appendChild(style);
  }

  // ── HTML 조립 ────────────────────────────────────────────────────────────────

  /* 6축 카드 */
  var axisHtml = '<div class="am-axis-grid">' +
    AXIS_CARDS.map(function (c) {
      return '<div class="am-axis-card" style="border-top-color:' + c.color + '" onclick="alert(\'준비 중인 화면입니다.\')">' +
        '<div class="am-axis-icon">' + c.icon + '</div>' +
        '<div class="am-axis-label">' + c.label + '</div>' +
        '<div class="am-axis-value">' + c.value + '</div>' +
        '<div class="am-axis-footer">' + c.footer + '</div>' +
        '</div>';
    }).join('') +
    '</div>';

  /* KPI 카드 */
  var kpiHtml = '<div class="asis-kpi-row">' +
    '<div class="asis-kpi-card accent-blue">' +
      '<div class="asis-kpi-label">오늘 질의 수</div>' +
      '<div class="asis-kpi-value">247<span class="asis-kpi-sub">건</span></div>' +
      '<div class="asis-kpi-delta up">↑ 12% vs 어제</div>' +
    '</div>' +
    '<div class="asis-kpi-card accent-green">' +
      '<div class="asis-kpi-label">평균 응답 시간</div>' +
      '<div class="asis-kpi-value">1.8<span class="asis-kpi-sub">초</span></div>' +
      '<div class="asis-kpi-delta">목표 2.0초 이내</div>' +
    '</div>' +
    '<div class="asis-kpi-card accent-orange">' +
      '<div class="asis-kpi-label">토큰 사용량</div>' +
      '<div class="asis-kpi-value">142,300<span class="asis-kpi-sub">tok</span></div>' +
      '<div class="asis-kpi-delta">월 예산 38% 소진</div>' +
    '</div>' +
    '<div class="asis-kpi-card accent-purple">' +
      '<div class="asis-kpi-label">오류율</div>' +
      '<div class="asis-kpi-value">0.4<span class="asis-kpi-sub">%</span></div>' +
      '<div class="asis-kpi-delta down">↓ 0.2%p 개선</div>' +
    '</div>' +
    '</div>';

  /* 차트 영역 */
  var chartsHtml = '<div class="am-chart-grid">' +
    '<div class="asis-panel">' +
      '<div class="asis-panel-head"><span class="asis-panel-title">시간대별 질의량 (오늘)</span></div>' +
      '<div class="asis-panel-body" style="padding:12px">' +
        '<canvas id="am-chart-hour" height="200"></canvas>' +
      '</div>' +
    '</div>' +
    '<div class="asis-panel">' +
      '<div class="asis-panel-head"><span class="asis-panel-title">평균 응답 시간 추이 (최근 7일)</span></div>' +
      '<div class="asis-panel-body" style="padding:12px">' +
        '<canvas id="am-chart-resp" height="200"></canvas>' +
      '</div>' +
    '</div>' +
    '</div>';

  /* 에이전트 테이블 */
  var tableRowsHtml = AGENTS.map(function (a) {
    return '<tr style="background:' + a.rowBg + '">' +
      '<td style="font-weight:600">' + a.name + '</td>' +
      '<td><span class="asis-badge" style="font-size:11px">' + a.type + '</span></td>' +
      '<td style="text-align:right">' + a.calls + '건</td>' +
      '<td style="text-align:right">' + a.successRate + '</td>' +
      '<td style="text-align:right">' + a.avgResp + '</td>' +
      '<td>' + a.statusLabel + '</td>' +
      '<td><button class="am-btn-sess" data-agent-id="' + a.id + '">세션 보기</button></td>' +
      '</tr>' +
      '<tr class="am-session-row" id="am-sess-row-' + a.id + '" style="background:' + (a.rowBg || '#f9fafb') + '">' +
        '<td colspan="7" style="padding:0 12px 12px">' +
          '<div class="am-session-panel" id="am-sess-' + a.id + '">' +
            buildSessionHtml(a.session) +
          '</div>' +
        '</td>' +
      '</tr>';
  }).join('');

  var tableHtml = '<div class="asis-panel">' +
    '<div class="asis-panel-head"><span class="asis-panel-title">에이전트별 오늘 실행 현황</span></div>' +
    '<div class="asis-panel-body">' +
      '<div style="overflow-x:auto;">' +
        '<table class="asis-table">' +
          '<thead><tr>' +
            '<th>에이전트명</th><th>유형</th><th style="text-align:right">오늘 호출</th>' +
            '<th style="text-align:right">성공률</th><th style="text-align:right">평균 응답</th>' +
            '<th>상태</th><th>세션</th>' +
          '</tr></thead>' +
          '<tbody>' + tableRowsHtml + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '</div>';

  /* 가드레일 */
  var guardrailRowsHtml = GUARDRAIL_ROWS.map(function (r) {
    return '<tr>' +
      '<td>' + r.time + '</td>' +
      '<td>' + r.user + '</td>' +
      '<td>' + r.query + '</td>' +
      '<td><span class="asis-status ' + (r.type === 'PII 탐지' ? 'danger' : 'warn') + '">' + r.type + '</span></td>' +
      '<td>' + r.action + '</td>' +
      '</tr>';
  }).join('');

  var guardrailHtml = '<div class="asis-panel">' +
    '<div class="asis-panel-head"><span class="asis-panel-title">오늘 가드레일 차단 현황</span></div>' +
    '<div class="asis-panel-body">' +
      '<div class="am-stat-row">' +
        '<div class="am-stat-card"><div class="am-stat-num">4</div><div class="am-stat-label">총 차단 건수</div></div>' +
        '<div class="am-stat-card"><div class="am-stat-num" style="color:#7c3aed">3</div><div class="am-stat-label">PII 탐지</div></div>' +
        '<div class="am-stat-card"><div class="am-stat-num" style="color:#d97706">1</div><div class="am-stat-label">권한 오류</div></div>' +
      '</div>' +
      '<div style="overflow-x:auto;">' +
        '<table class="asis-table">' +
          '<thead><tr><th>시각</th><th>사용자</th><th>질의 요약</th><th>차단 유형</th><th>처리</th></tr></thead>' +
          '<tbody>' + guardrailRowsHtml + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '</div>';

  // ── 전체 페이지 조립 ─────────────────────────────────────────────────────────

  var page = document.createElement('div');
  page.className = 'asis-page';
  page.innerHTML =
    '<div class="asis-page-header">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
        '<h2 class="asis-page-title">AI 에이전트 모니터링</h2>' +
        '<span class="asis-badge">To-Be</span>' +
      '</div>' +
      '<div style="font-size:12px;color:#6b7280;margin-top:4px">AI 에이전트 실행 현황 및 품질 지표 · 기준: 2026-06-12 실시간</div>' +
    '</div>' +

    '<div class="asis-panel" style="margin-bottom:20px">' +
      '<div class="asis-panel-head"><span class="asis-panel-title">6축 운영 현황 (오늘 기준)</span></div>' +
      '<div class="asis-panel-body" style="padding:16px">' +
        axisHtml +
      '</div>' +
    '</div>' +

    kpiHtml +
    chartsHtml +
    tableHtml +
    '<div style="margin-top:20px">' + guardrailHtml + '</div>';

  el.appendChild(page);

  // ── Chart.js 초기화 ──────────────────────────────────────────────────────────

  (function initCharts() {
    if (typeof window.Chart === 'undefined') return;

    var canvasHour = document.getElementById('am-chart-hour');
    if (canvasHour) {
      var existing = window.Chart.getChart(canvasHour);
      if (existing) existing.destroy();
      new window.Chart(canvasHour, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 24 }, function (_, i) {
            return i % 4 === 0 ? String(i).padStart(2, '0') + '시' : '';
          }),
          datasets: [{
            label: '질의 건수',
            data: HOUR_DATA,
            backgroundColor: 'rgba(37,99,235,0.7)',
            borderRadius: 3,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { right: 16 } },
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true } },
            y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } }, beginAtZero: true }
          }
        }
      });
    }

    var canvasResp = document.getElementById('am-chart-resp');
    if (canvasResp) {
      var existingR = window.Chart.getChart(canvasResp);
      if (existingR) existingR.destroy();
      new window.Chart(canvasResp, {
        type: 'line',
        data: {
          labels: RESP_LABELS,
          datasets: [
            {
              label: 'P50',
              data: RESP_P50,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37,99,235,0.08)',
              borderWidth: 2,
              pointRadius: 4,
              tension: 0.3,
              fill: false
            },
            {
              label: 'P95',
              data: RESP_P95,
              borderColor: '#dc2626',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 4],
              pointRadius: 4,
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 24 } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: {
              grid: { color: '#f3f4f6' },
              ticks: { font: { size: 11 }, callback: function (v) { return v + '초'; } },
              min: 0,
              max: 5
            }
          }
        }
      });
    }
  }());

  // ── 세션 보기 토글 ───────────────────────────────────────────────────────────

  var tableEl = el.querySelector('.asis-table');
  if (tableEl) {
    tableEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.am-btn-sess');
      if (!btn) return;
      var agentId = btn.getAttribute('data-agent-id');
      var panel = document.getElementById('am-sess-' + agentId);
      if (!panel) return;
      var isOpen = panel.classList.contains('open');

      /* 열려 있는 모든 패널 닫기 */
      el.querySelectorAll('.am-session-panel.open').forEach(function (p) { p.classList.remove('open'); });
      el.querySelectorAll('.am-btn-sess.active').forEach(function (b) { b.classList.remove('active'); });

      if (!isOpen) {
        panel.classList.add('open');
        btn.classList.add('active');
      }
    });
  }

  // ── 세션 HTML 빌더 (클로저 바깥에서 참조하기 위해 hoisting 필요 — 함수 선언식 사용) ──

  function buildSessionHtml(sess) {
    var warnBlock = sess.warning
      ? '<div class="am-session-warn">⚠️ ' + sess.warning + '</div>'
      : '';
    var timelineHtml = sess.timeline.map(function (t) {
      return '<div class="am-tl-row">' +
        '<span class="am-tl-time">' + t.time + '</span>' +
        '<span class="am-tl-msg">' + t.msg + '</span>' +
        '</div>';
    }).join('');

    return '<h4>세션 상세: ' + sess.id + '</h4>' +
      '<hr class="am-session-divider">' +
      warnBlock +
      '<dl class="am-session-meta">' +
        '<dt>사용자</dt><dd>' + sess.user + ' / ' + sess.agentLabel + '</dd>' +
        '<dt>시각</dt><dd>' + sess.timeRange + '</dd>' +
        '<dt>결과</dt><dd>' + sess.result + ' / 신뢰도 ' + sess.confidence + '</dd>' +
      '</dl>' +
      '<hr class="am-session-divider">' +
      '<div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px">타임라인</div>' +
      '<div class="am-timeline">' + timelineHtml + '</div>' +
      '<div class="am-session-footer-note">' + sess.footer + '</div>';
  }
};
