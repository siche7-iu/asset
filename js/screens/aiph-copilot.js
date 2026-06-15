// AI Copilot 화면 — AI 대화형 자산 조회
// window.renderAiphCopilot 하나만 전역 노출

window.renderAiphCopilot = function () {
  var el = document.getElementById('view-aiph-copilot');
  if (!el) return;
  el.innerHTML = '';

  // ── 스타일 (한 번만 주입) ────────────────────────────────────
  if (!document.getElementById('acp-style')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'acp-style';
    styleEl.textContent = [
      /* 전체 레이아웃 */
      '.acp-root{display:flex;height:100%;gap:12px;background:transparent;font-family:inherit;}',
      /* 좌측 패널 */
      '.acp-left{width:240px;min-width:200px;flex-shrink:0;background:#fff;border:1px solid #e8edf2;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;flex-direction:column;overflow-y:auto}',
      '.acp-left-head{padding:16px 16px 10px;font-size:11px;font-weight:700;color:#888;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #f0f2f5}',
      '.acp-suggest-list{display:flex;flex-direction:column;gap:6px;padding:8px}',
      '.acp-suggest-btn{display:block;width:100%;text-align:left;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:13px;color:#374151;cursor:pointer;line-height:1.45;transition:background .15s,border-color .15s,box-shadow .15s}',
      '.acp-suggest-btn:hover{background:#EFF6FF;border-color:#93C5FD;color:#1D4ED8;box-shadow:0 1px 3px rgba(59,130,246,0.1)}',
      '.acp-left-section-head{padding:14px 16px 6px;font-size:11px;font-weight:700;color:#aaa;letter-spacing:.06em;text-transform:uppercase;border-top:1px solid #f0f2f5;margin-top:4px}',
      /* 중앙 채팅 */
      '.acp-center{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;background:#fff;border:1px solid #e8edf2;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}',
      '.acp-chat-header{padding:14px 20px;background:#fff;border-bottom:1px solid #e8ecf0;display:flex;align-items:center;gap:10px;flex-shrink:0}',
      '.acp-chat-title{font-size:15px;font-weight:700;color:#1a1a2e}',
      '.acp-chat-subtitle{font-size:12px;color:#888}',
      '.acp-ai-badge{display:inline-flex;align-items:center;gap:5px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;color:#1d4ed8}',
      '.acp-ai-dot{width:7px;height:7px;border-radius:50%;background:#2563eb;display:inline-block}',
      '.acp-messages{flex:1;overflow-y:auto;padding:20px 20px 10px;display:flex;flex-direction:column;gap:18px}',
      /* 메시지 버블 */
      '.acp-msg{display:flex;flex-direction:column;gap:6px;max-width:85%}',
      '.acp-msg.user{align-self:flex-end;align-items:flex-end}',
      '.acp-msg.ai{align-self:flex-start;align-items:flex-start}',
      '.acp-bubble-user{background:#2563eb;color:#fff;border-radius:14px 14px 4px 14px;padding:10px 14px;font-size:14px;line-height:1.55;word-break:break-word}',
      '.acp-bubble-ai{background:#F3F4F6;color:#1a1a2e;border-radius:4px 14px 14px 14px;padding:12px 14px;font-size:14px;line-height:1.6;word-break:break-word}',
      /* 인용 칩 */
      '.acp-citations{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
      '.acp-cite{display:inline-flex;align-items:center;gap:3px;border:1px solid #bfdbfe;border-radius:20px;padding:2px 9px;font-size:11px;font-weight:600;color:#1d4ed8;cursor:default;background:#fff;transition:background .15s}',
      '.acp-cite:hover{background:#eff6ff}',
      '.acp-cite-more{border-color:#d1d5db;color:#6b7280;background:#f9fafb}',
      /* 신뢰도 배지 */
      '.acp-confidence{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;margin-top:5px}',
      '.acp-conf-excellent{background:#dcfce7;color:#15803d}',
      '.acp-conf-good{background:#dbeafe;color:#1d4ed8}',
      '.acp-conf-moderate{background:#fef3c7;color:#b45309}',
      '.acp-conf-bad{background:#fee2e2;color:#b91c1c}',
      '.acp-conf-dot{width:7px;height:7px;border-radius:50%;display:inline-block;background:currentColor}',
      /* 추론 단계 토글 */
      '.acp-reasoning-toggle{display:inline-flex;align-items:center;gap:5px;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:4px 10px;font-size:12px;color:#6b7280;cursor:pointer;margin-top:4px;transition:border-color .15s,color .15s}',
      '.acp-reasoning-toggle:hover{border-color:#93c5fd;color:#2563eb}',
      '.acp-reasoning-body{display:none;margin-top:8px;padding:4px 0 4px 12px;border-left:3px solid #e5e7eb}',
      '.acp-reasoning-body.open{display:block}',
      '.acp-step{display:flex;align-items:flex-start;gap:8px;padding:6px 0}',
      '.acp-step-num{min-width:22px;height:22px;border-radius:50%;background:#f3f4f6;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#6b7280;flex-shrink:0}',
      '.acp-step-text{font-size:12px;color:#4b5563;line-height:1.5}',
      '.acp-step-time{font-size:11px;color:#9ca3af;margin-left:4px}',
      /* 피드백 버튼 */
      '.acp-feedback{display:flex;gap:6px;margin-top:6px}',
      '.acp-fb-btn{background:none;border:1px solid #e5e7eb;border-radius:8px;padding:4px 10px;font-size:12px;color:#6b7280;cursor:pointer;transition:border-color .15s,color .15s,background .15s}',
      '.acp-fb-btn:hover{border-color:#93c5fd;color:#2563eb;background:#eff6ff}',
      /* 인라인 테이블 */
      '.acp-inline-table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;border-radius:8px;overflow:hidden}',
      '.acp-inline-table th{background:#e5e7eb;color:#374151;font-weight:700;padding:6px 10px;text-align:left}',
      '.acp-inline-table td{padding:5px 10px;border-bottom:1px solid #f3f4f6;color:#4b5563}',
      '.acp-inline-table tr:last-child td{border-bottom:none}',
      '.acp-more-row td{color:#9ca3af;font-style:italic}',
      /* 스피너 */
      '.acp-typing{display:flex;align-items:center;gap:5px;padding:10px 14px;background:#F3F4F6;border-radius:4px 14px 14px 14px;font-size:13px;color:#6b7280;align-self:flex-start}',
      '.acp-spin{width:14px;height:14px;border:2px solid #d1d5db;border-top-color:#2563eb;border-radius:50%;animation:acpSpin .7s linear infinite;display:inline-block}',
      '@keyframes acpSpin{to{transform:rotate(360deg)}}',
      /* 입력창 */
      '.acp-input-wrap{padding:14px 20px 16px;background:#fff;border-top:1px solid #e8ecf0;flex-shrink:0}',
      '.acp-input-row{display:flex;gap:8px;align-items:flex-end}',
      '.acp-input{flex:1;border:1.5px solid #e5e7eb;border-radius:12px;padding:10px 14px;font-size:14px;outline:none;resize:none;min-height:42px;max-height:100px;line-height:1.5;font-family:inherit;transition:border-color .15s}',
      '.acp-input:focus{border-color:#2563eb}',
      '.acp-send-btn{height:42px;border-radius:12px;background:#2563eb;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;color:#fff;}',
      '.acp-send-btn:hover{background:#1d4ed8}',
      /* 우측 패널 */
      '.acp-right{width:280px;min-width:240px;flex-shrink:0;background:#fff;border:1px solid #e8edf2;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;flex-direction:column;overflow-y:auto}',
      '.acp-right-head{padding:16px 16px 10px;font-size:11px;font-weight:700;color:#888;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #f0f2f5}',
      '.acp-agent-list{display:flex;flex-direction:column;gap:4px;padding:8px}',
      '.acp-agent-card{display:flex;align-items:center;gap:10px;padding:10px 10px;border-radius:10px;transition:background .15s;background:#f9fafb;border:1px solid #f0f2f5;margin-bottom:4px}',
      '.acp-agent-card:last-child{margin-bottom:0}',
      '.acp-agent-icon{font-size:20px;min-width:28px;text-align:center}',
      '.acp-agent-name{font-size:13px;font-weight:600;color:#374151}',
      '.acp-agent-status{font-size:11px;color:#9ca3af;margin-top:1px}',
      '.acp-agent-status.running{color:#16a34a;font-weight:600}',
      '.acp-live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#16a34a;margin-right:3px;animation:acpPulse 1s ease-in-out infinite}',
      '@keyframes acpPulse{0%,100%{opacity:1}50%{opacity:.3}}',
      '.acp-result-section{padding:10px 14px;border-top:1px solid #f0f2f5}',
      '.acp-result-head{font-size:11px;font-weight:700;color:#888;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}',
      '.acp-result-stat{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6}',
      '.acp-result-stat:last-child{border-bottom:none}',
      '.acp-result-label{font-size:12px;color:#6b7280}',
      '.acp-result-val{font-size:13px;font-weight:700;color:#1a1a2e}'
    ].join('');
    document.head.appendChild(styleEl);
  }

  // ── Mock 데이터 (질문별 답변) ─────────────────────────────────
  var MOCK_ANSWERS = {
    '서울 지역 유휴 자산 현황 알려줘': {
      text: '서울 지역 유휴 자산은 총 14건이며, 취득금액 기준 38억 2천만원입니다. 여의도 5건, 강남 4건, 용산 3건, 기타 2건으로 분포됩니다.',
      citations: ['AST-2024-001', 'AST-2024-007', 'AST-2024-019'],
      moreCount: 11,
      confidence: 'good',
      confLabel: 'GOOD',
      confDetail: '근거 14건 · 기준 2026-06-12',
      steps: [
        { text: '자산조회 에이전트 — "서울 유휴 자산" 검색 실행', time: '0.12s' },
        { text: '집계분석 에이전트 — 14건 합산, 금액 계산', time: '0.08s' },
        { text: '답변생성 에이전트 — 결과 포맷·요약', time: '0.60s' }
      ],
      table: null
    },
    '내용연수 초과 자산 목록 보여줘': {
      text: '내용연수를 초과한 자산은 총 8건입니다. 노후 위험도 HIGH로 분류되며, 즉시 폐기 검토가 필요한 자산 3건이 포함되어 있습니다.',
      citations: [],
      moreCount: 0,
      confidence: 'moderate',
      confLabel: 'MODERATE',
      confDetail: '근거 8건',
      steps: [
        { text: '자산조회 에이전트 — 내용연수 초과 필터 적용', time: '0.15s' },
        { text: '집계분석 에이전트 — 위험도 HIGH 분류', time: '0.09s' },
        { text: '답변생성 에이전트 — 목록 포맷 생성', time: '0.55s' }
      ],
      table: {
        headers: ['자산명', '취득연도', '초과연수'],
        rows: [
          ['서버룸 에어컨', '2016년', '3년 초과'],
          ['복합기 A동', '2015년', '4년 초과'],
          ['승합차 25가 3456', '2014년', '5년 초과']
        ],
        moreCount: 5
      }
    },
    '이번 달 취득한 자산은?': {
      text: '2026년 6월에 취득한 자산은 총 7건이며, 취득금액 합계는 12억 4천만원입니다. IT장비 4건, 사무기기 2건, 차량 1건이 신규 등록되었습니다.',
      citations: ['AST-2026-188', 'AST-2026-189'],
      moreCount: 5,
      confidence: 'good',
      confLabel: 'GOOD',
      confDetail: '근거 7건 · 기준 2026-06-12',
      steps: [
        { text: '자산조회 에이전트 — 2026-06 취득일 필터', time: '0.10s' },
        { text: '집계분석 에이전트 — 분류별 집계', time: '0.07s' },
        { text: '답변생성 에이전트 — 결과 요약', time: '0.48s' }
      ],
      table: null
    },
    '부서별 자산 현황 요약해줘': {
      text: '전체 17개 부서 중 자산 보유 상위 3개 부서는 IT본부(2,341건), 자산운용팀(1,204건), 경영지원팀(987건)입니다. 전사 평균 장부금액은 건당 약 3,200만원입니다.',
      citations: [],
      moreCount: 0,
      confidence: 'excellent',
      confLabel: 'EXCELLENT',
      confDetail: '근거 12,492건 · 기준 2026-06-12',
      steps: [
        { text: '자산조회 에이전트 — 전체 자산 부서별 그룹화', time: '0.22s' },
        { text: '집계분석 에이전트 — 건수·금액 집계', time: '0.18s' },
        { text: '답변생성 에이전트 — 순위 포맷 생성', time: '0.63s' }
      ],
      table: null
    },
    '보험 만료 임박 자산 알려줘': {
      text: '보험 만료가 30일 이내로 임박한 자산은 6건입니다. 그 중 건물/부동산 2건은 만료까지 7일 미만으로 즉시 갱신이 필요합니다.',
      citations: ['AST-2023-045', 'AST-2022-118'],
      moreCount: 4,
      confidence: 'good',
      confLabel: 'GOOD',
      confDetail: '근거 6건 · 기준 2026-06-12',
      steps: [
        { text: '자산조회 에이전트 — 보험 만료일 D-30 필터', time: '0.11s' },
        { text: '이상탐지 에이전트 — 긴급 항목(D-7) 우선 분류', time: '0.14s' },
        { text: '답변생성 에이전트 — 결과 포맷·알림', time: '0.52s' }
      ],
      table: null
    },
    '전체 자산 감가상각률은?': {
      text: '전체 자산의 평균 감가상각률은 62.3%입니다. 취득금액 합계 4,128억원 대비 현재 장부금액은 1,558억원이며, 연간 감가상각비는 약 287억원으로 추정됩니다.',
      citations: [],
      moreCount: 0,
      confidence: 'excellent',
      confLabel: 'EXCELLENT',
      confDetail: '근거 12,492건 · 기준 2026-06-12',
      steps: [
        { text: '자산조회 에이전트 — 전체 자산 취득가·잔존가 조회', time: '0.19s' },
        { text: '집계분석 에이전트 — 감가상각률 계산', time: '0.21s' },
        { text: '답변생성 에이전트 — 비율·금액 포맷', time: '0.58s' }
      ],
      table: null
    }
  };

  // ── 추천 질문 목록 ────────────────────────────────────────────
  var SUGGESTIONS = [
    { icon: '🏢', color: '#EF4444', bg: '#FEF2F2', text: '서울 지역 유휴 자산 현황 알려줘' },
    { icon: '📋', color: '#3B82F6', bg: '#EFF6FF', text: '내용연수 초과 자산 목록 보여줘' },
    { icon: '📅', color: '#F59E0B', bg: '#FFFBEB', text: '이번 달 취득한 자산은?' },
    { icon: '🏦', color: '#8B5CF6', bg: '#F5F3FF', text: '부서별 자산 현황 요약해줘' },
    { icon: '🛡️', color: '#10B981', bg: '#F0FDF4', text: '보험 만료 임박 자산 알려줘' },
    { icon: '📊', color: '#6366F1', bg: '#EEF2FF', text: '전체 자산 감가상각률은?' }
  ];

  // ── 에이전트 정의 ─────────────────────────────────────────────
  var AGENTS = [
    { id: 'search',   icon: '🔍', name: '자산조회 에이전트',  status: '대기 중',          live: false },
    { id: 'analyze',  icon: '📊', name: '집계분석 에이전트',  status: '대기 중',          live: false },
    { id: 'generate', icon: '✍️', name: '답변생성 에이전트',  status: '대기 중',          live: false },
    { id: 'detect',   icon: '⚡', name: '이상탐지 에이전트',  status: '백그라운드 실행 중', live: true  }
  ];

  // ── 헬퍼: 신뢰도 클래스 ──────────────────────────────────────
  function confClass(conf) {
    var map = { excellent: 'acp-conf-excellent', good: 'acp-conf-good', moderate: 'acp-conf-moderate', bad: 'acp-conf-bad' };
    return map[conf] || 'acp-conf-good';
  }

  // ── 헬퍼: AI 버블 HTML 생성 ──────────────────────────────────
  var _bubbleIndex = 0;
  function buildAiBubble(answer) {
    var idx = ++_bubbleIndex;
    var toggleId = 'acp-tog-' + idx;
    var bodyId   = 'acp-body-' + idx;

    // 인용 칩
    var citeHtml = '';
    if (answer.citations && answer.citations.length) {
      citeHtml = '<div class="acp-citations">';
      answer.citations.forEach(function (c) {
        citeHtml += '<span class="acp-cite">' + c + ' ↗</span>';
      });
      if (answer.moreCount > 0) {
        citeHtml += '<span class="acp-cite acp-cite-more">+' + answer.moreCount + '건</span>';
      }
      citeHtml += '</div>';
    }

    // 인라인 테이블
    var tableHtml = '';
    if (answer.table) {
      tableHtml = '<table class="acp-inline-table"><thead><tr>';
      answer.table.headers.forEach(function (h) { tableHtml += '<th>' + h + '</th>'; });
      tableHtml += '</tr></thead><tbody>';
      answer.table.rows.forEach(function (row) {
        tableHtml += '<tr>';
        row.forEach(function (cell) { tableHtml += '<td>' + cell + '</td>'; });
        tableHtml += '</tr>';
      });
      if (answer.table.moreCount > 0) {
        tableHtml += '<tr class="acp-more-row"><td colspan="' + answer.table.headers.length + '">... +' + answer.table.moreCount + '건 더 있음</td></tr>';
      }
      tableHtml += '</tbody></table>';
    }

    // 추론 단계
    var stepsHtml = '<div class="acp-reasoning-body" id="' + bodyId + '">';
    answer.steps.forEach(function (s, i) {
      stepsHtml += '<div class="acp-step">'
        + '<span class="acp-step-num">' + (i + 1) + '</span>'
        + '<span class="acp-step-text">' + s.text + '<span class="acp-step-time">(' + s.time + ')</span></span>'
        + '</div>';
    });
    stepsHtml += '</div>';

    return '<div class="acp-bubble-ai">'
      + '<span>' + answer.text + '</span>'
      + tableHtml
      + '</div>'
      + citeHtml
      + '<span class="acp-confidence ' + confClass(answer.confidence) + '">'
      + '<span class="acp-conf-dot"></span>'
      + answer.confLabel + ' · ' + answer.confDetail
      + '</span>'
      + '<button class="acp-reasoning-toggle" id="' + toggleId + '">▶ 추론 과정 보기</button>'
      + stepsHtml
      + '<div class="acp-feedback">'
      + '<button class="acp-fb-btn">👍 도움됨</button>'
      + '<button class="acp-fb-btn">👎 개선 필요</button>'
      + '</div>';
  }

  // ── 루트 구조 ─────────────────────────────────────────────────
  var root = document.createElement('div');
  root.className = 'acp-root';

  // ── 좌측 패널 ─────────────────────────────────────────────────
  var leftPanel = document.createElement('div');
  leftPanel.className = 'acp-left';
  leftPanel.innerHTML = '<div class="acp-left-head">추천 질문</div>';

  var suggestList = document.createElement('div');
  suggestList.className = 'acp-suggest-list';
  SUGGESTIONS.forEach(function (item) {
    var btn = document.createElement('button');
    btn.className = 'acp-suggest-btn';
    btn.dataset.q = item.text;
    btn.innerHTML = '<span style="display:flex;align-items:center;gap:10px;">'
      + '<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:' + item.bg + ';flex-shrink:0;font-size:16px;">' + item.icon + '</span>'
      + '<span style="font-size:13px;color:#374151;line-height:1.4;text-align:left;">' + item.text + '</span>'
      + '</span>';
    suggestList.appendChild(btn);
  });
  leftPanel.appendChild(suggestList);

  var freqHead = document.createElement('div');
  freqHead.className = 'acp-left-section-head';
  freqHead.textContent = '즐겨찾는 분석';
  leftPanel.appendChild(freqHead);

  var freqList = document.createElement('div');
  freqList.className = 'acp-suggest-list';
  [
    { icon: '✅', color: '#15803D', bg: '#F0FDF4', text: '전체 자산 요약' },
    { icon: '🏛️', color: '#1D4ED8', bg: '#EFF6FF', text: '부서별 현황' },
    { icon: '⚠️', color: '#B45309', bg: '#FFFBEB', text: '위험 자산 목록' },
    { icon: '📈', color: '#7C3AED', bg: '#F5F3FF', text: '감가상각 현황' }
  ].forEach(function (item) {
    var btn = document.createElement('button');
    btn.className = 'acp-suggest-btn';
    btn.dataset.q = item.text;
    btn.innerHTML = '<span style="display:flex;align-items:center;gap:10px;">'
      + '<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:' + item.bg + ';flex-shrink:0;font-size:16px;">' + item.icon + '</span>'
      + '<span style="font-size:13px;color:#6B7280;line-height:1.4;text-align:left;">' + item.text + '</span>'
      + '</span>';
    freqList.appendChild(btn);
  });
  leftPanel.appendChild(freqList);

  // ── 중앙 채팅 ─────────────────────────────────────────────────
  var center = document.createElement('div');
  center.className = 'acp-center';

  var chatHeader = document.createElement('div');
  chatHeader.className = 'acp-chat-header';
  chatHeader.innerHTML = '<span class="acp-ai-badge"><span class="acp-ai-dot"></span>AI</span>'
    + '<span class="acp-chat-title">자산 AI Copilot</span>'
    + '<span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">'
    + '<span style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600;color:#1D4ED8;">고정자산관리</span>'
    + '<span style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600;color:#15803D;">NH농협</span>'
    + '<span style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600;color:#7C3AED;">Claude 3.5</span>'
    + '<span style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600;color:#C2410C;">12,492건</span>'
    + '</span>'
    + '<div style="margin-left:auto;display:flex;gap:8px;">'
    + '<button onclick="alert(\'대화 이력 기능은 준비 중입니다.\')" style="padding:5px 12px;background:none;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;color:#6b7280;cursor:pointer;white-space:nowrap;">이력 보기</button>'
    + '<button onclick="document.getElementById(\'acp-messages\').innerHTML=\'\'" style="padding:5px 12px;background:#2563eb;border:none;border-radius:8px;font-size:12px;color:#fff;cursor:pointer;white-space:nowrap;font-weight:600;">새 대화 시작</button>'
    + '</div>';

  var messages = document.createElement('div');
  messages.className = 'acp-messages';
  messages.id = 'acp-messages';

  var inputWrap = document.createElement('div');
  inputWrap.className = 'acp-input-wrap';
  inputWrap.innerHTML = '<div class="acp-input-row">'
    + '<textarea class="acp-input" id="acp-input" rows="1" placeholder="자산에 대해 무엇이든 물어보세요..."></textarea>'
    + '<button class="acp-send-btn" id="acp-send" title="전송" style="width:auto;padding:0 18px;gap:6px;font-size:13px;font-weight:700;letter-spacing:.01em;">'
    + '<svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
    + '<span>전송</span>'
    + '</button>'
    + '</div>';

  center.appendChild(chatHeader);
  center.appendChild(messages);
  center.appendChild(inputWrap);

  // ── 우측 패널 ─────────────────────────────────────────────────
  var rightPanel = document.createElement('div');
  rightPanel.className = 'acp-right';
  rightPanel.innerHTML = '<div class="acp-right-head">멀티 에이전트</div>';

  var agentList = document.createElement('div');
  agentList.className = 'acp-agent-list';
  agentList.id = 'acp-agent-list';

  AGENTS.forEach(function (ag) {
    var card = document.createElement('div');
    card.className = 'acp-agent-card';
    card.id = 'acp-agent-' + ag.id;
    var statusHtml = ag.live
      ? '<div class="acp-agent-status running"><span class="acp-live-dot"></span>' + ag.status + '</div>'
      : '<div class="acp-agent-status">' + ag.status + '</div>';
    card.innerHTML = '<span class="acp-agent-icon">' + ag.icon + '</span>'
      + '<div style="flex:1;min-width:0;"><div class="acp-agent-name">' + ag.name + '</div>' + statusHtml + '</div>'
      + '<span class="acp-agent-cnt" id="acp-cnt-' + ag.id + '" style="margin-left:auto;font-size:11px;font-weight:700;color:#9ca3af;background:#f3f4f6;border-radius:10px;padding:2px 7px;flex-shrink:0;">—</span>';
    agentList.appendChild(card);
  });
  rightPanel.appendChild(agentList);

  var resultSection = document.createElement('div');
  resultSection.className = 'acp-result-section';
  resultSection.id = 'acp-result-section';
  resultSection.innerHTML = '<div class="acp-result-head">📊 AI 요약</div>'
    + '<div class="acp-result-stat"><span class="acp-result-label">조회 건수</span><span class="acp-result-val" id="acp-stat-count">—</span></div>'
    + '<div class="acp-result-stat"><span class="acp-result-label">이상 감지</span><span class="acp-result-val" style="color:#ef4444;">2건</span></div>'
    + '<div class="acp-result-stat"><span class="acp-result-label">신뢰도</span><span class="acp-result-val" id="acp-stat-conf">—</span></div>'
    + '<div class="acp-result-stat"><span class="acp-result-label">마지막 쿼리</span><span class="acp-result-val" id="acp-stat-query" style="font-size:11px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">—</span></div>';
  rightPanel.appendChild(resultSection);

  var relatedSection = document.createElement('div');
  relatedSection.className = 'acp-result-section';
  relatedSection.id = 'acp-related-assets';
  relatedSection.innerHTML = '<div class="acp-result-head">📌 관련 자산</div>'
    + '<div style="font-size:12px;color:#9ca3af;padding:4px 0;" id="acp-related-list">질문 후 관련 자산이 표시됩니다.</div>';
  rightPanel.appendChild(relatedSection);

  var actionSection = document.createElement('div');
  actionSection.className = 'acp-result-section';
  actionSection.id = 'acp-action-card';
  actionSection.innerHTML = '<div class="acp-result-head">💡 추천 조치</div>'
    + '<div style="font-size:12px;color:#9ca3af;padding:4px 0;" id="acp-action-list">AI 분석 후 추천 조치가 표시됩니다.</div>';
  rightPanel.appendChild(actionSection);

  // ── DOM 조립 ─────────────────────────────────────────────────
  root.appendChild(leftPanel);
  root.appendChild(center);
  root.appendChild(rightPanel);

  var wrapper = document.createElement('div');
  wrapper.className = 'asis-page';
  wrapper.style.cssText = 'display:flex;flex-direction:column;height:100%;padding:0;';

  var pageHeader = document.createElement('div');
  pageHeader.style.cssText = 'padding:20px 24px 16px;flex-shrink:0;background:#fff;border-bottom:1px solid #E5E7EB;';
  pageHeader.innerHTML = '<h2 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;">AI Copilot</h2>'
    + '<p style="font-size:14px;color:#6B7280;margin:0;">자산 데이터를 자연어로 질문하고 AI의 분석 결과를 즉시 확인합니다.</p>';

  var contentArea = document.createElement('div');
  contentArea.style.cssText = 'flex:1;min-height:0;padding:8px 16px 16px;display:flex;flex-direction:column;background:#F3F4F6;';

  root.style.cssText = 'flex:1;min-height:0;';

  contentArea.appendChild(root);
  wrapper.appendChild(pageHeader);
  wrapper.appendChild(contentArea);
  el.appendChild(wrapper);

  // ── 미리 로드된 대화 2쌍 렌더 ────────────────────────────────
  function appendUserMsg(text) {
    var wrap = document.createElement('div');
    wrap.className = 'acp-msg user';
    wrap.innerHTML = '<div class="acp-bubble-user">' + text + '</div>';
    messages.appendChild(wrap);
  }

  function appendAiMsg(answer) {
    var wrap = document.createElement('div');
    wrap.className = 'acp-msg ai';
    wrap.innerHTML = buildAiBubble(answer);
    messages.appendChild(wrap);
    bindToggle(wrap);
    bindFeedback(wrap);
  }

  // 빈 채팅 초기 상태
  var welcomeEl = document.createElement('div');
  welcomeEl.style.cssText = 'text-align:center;padding:40px 20px;color:#9CA3AF;';
  welcomeEl.innerHTML = '<div style="font-size:32px;margin-bottom:12px;">💬</div>'
    + '<div style="font-size:15px;font-weight:600;color:#374151;margin-bottom:6px;">자산 AI Copilot에 오신 것을 환영합니다</div>'
    + '<div style="font-size:13px;color:#9CA3AF;">왼쪽 추천 질문을 클릭하거나<br>아래 입력창에 자유롭게 질문하세요.</div>';
  messages.appendChild(welcomeEl);

  // ── 추론 토글 바인딩 ────────────────────────────────────────
  function bindToggle(wrap) {
    var togBtn = wrap.querySelector('.acp-reasoning-toggle');
    if (!togBtn) return;
    var bodyId = togBtn.id.replace('acp-tog-', 'acp-body-');
    var body = document.getElementById(bodyId);
    togBtn.addEventListener('click', function () {
      if (!body) return;
      var open = body.classList.toggle('open');
      togBtn.textContent = (open ? '▼' : '▶') + ' 추론 과정 보기';
    });
  }

  // ── 피드백 버튼 바인딩 ──────────────────────────────────────
  function bindFeedback(wrap) {
    wrap.querySelectorAll('.acp-fb-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.acp-fb-btn').forEach(function (b) {
          b.style.background = '';
          b.style.borderColor = '';
          b.style.color = '';
        });
        btn.style.background = '#eff6ff';
        btn.style.borderColor = '#93c5fd';
        btn.style.color = '#2563eb';
      });
    });
  }

  // ── 에이전트 상태 업데이트 헬퍼 ─────────────────────────────
  function setAgentStatus(id, status, running) {
    var card = document.getElementById('acp-agent-' + id);
    if (!card) return;
    var statusEl = card.querySelector('.acp-agent-status');
    if (!statusEl) return;
    if (running) {
      statusEl.className = 'acp-agent-status running';
      statusEl.innerHTML = '<span class="acp-live-dot"></span>' + status;
    } else {
      statusEl.className = 'acp-agent-status';
      statusEl.textContent = status;
    }
  }

  function resetAgents() {
    setAgentStatus('search',   '대기 중', false);
    setAgentStatus('analyze',  '대기 중', false);
    setAgentStatus('generate', '대기 중', false);
  }

  // ── 우측 결과 업데이트 헬퍼 ──────────────────────────────────
  function updateResultSection(count, label) {
    var statCount = document.getElementById('acp-stat-count');
    if (statCount) statCount.textContent = count;
    var statQuery = document.getElementById('acp-stat-query');
    if (statQuery) statQuery.textContent = label;
  }

  function updateRightPanel(answer, q) {
    // 신뢰도 업데이트
    var statConf = document.getElementById('acp-stat-conf');
    if (statConf) {
      var confColors = { excellent: '#15803d', good: '#1d4ed8', moderate: '#b45309', bad: '#b91c1c' };
      statConf.textContent = answer.confLabel;
      statConf.style.color = confColors[answer.confidence] || '#374151';
    }

    // 조회 건수 업데이트
    var statCount = document.getElementById('acp-stat-count');
    if (statCount) {
      var cnt = answer.citations.length + answer.moreCount;
      statCount.textContent = cnt ? cnt + '건' : '—';
    }

    // 마지막 쿼리 업데이트
    var statQuery = document.getElementById('acp-stat-query');
    if (statQuery) {
      statQuery.textContent = q.substring(0, 10) + (q.length > 10 ? '…' : '');
    }

    // 관련 자산 업데이트
    var relatedList = document.getElementById('acp-related-list');
    if (relatedList) {
      if (answer.citations && answer.citations.length) {
        relatedList.innerHTML = answer.citations.map(function (c) {
          return '<div style="padding:4px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-weight:600;">'
            + c + ' <span style="font-size:11px;color:#9ca3af;font-weight:400;">↗ 상세보기</span></div>';
        }).join('') + (answer.moreCount > 0 ? '<div style="padding:4px 0;color:#9ca3af;font-size:11px;">+' + answer.moreCount + '건 더 있음</div>' : '');
      } else {
        relatedList.innerHTML = '<div style="font-size:12px;color:#9ca3af;padding:4px 0;">직접 인용 자산 없음</div>';
      }
    }

    // 추천 조치 업데이트
    var actionList = document.getElementById('acp-action-list');
    if (actionList) {
      var actions = {
        excellent: ['✅ 정기 보고서에 포함 권장', '📋 부서별 현황 추가 조회'],
        good: ['🔍 상세 조회 추가 진행', '📊 트렌드 분석 검토'],
        moderate: ['⚠️ 담당자 확인 필요', '📝 수동 검증 권장'],
        bad: ['🚨 즉시 담당자 보고', '🔒 시스템 점검 요청']
      };
      var actionItems = actions[answer.confidence] || actions['good'];
      actionList.innerHTML = actionItems.map(function (a) {
        return '<div style="padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:#374151;">' + a + '</div>';
      }).join('');
    }

    // 에이전트 처리 건수 배지 업데이트
    var totalCnt = answer.citations.length + answer.moreCount;
    var cntSearch  = document.getElementById('acp-cnt-search');
    var cntAnalyze = document.getElementById('acp-cnt-analyze');
    var cntGenerate = document.getElementById('acp-cnt-generate');
    if (cntSearch)   cntSearch.textContent   = totalCnt ? totalCnt + '건' : '—';
    if (cntAnalyze)  cntAnalyze.textContent  = totalCnt ? totalCnt + '건' : '—';
    if (cntGenerate) cntGenerate.textContent = '1건';
  }

  // ── 질문 처리 시뮬레이션 ─────────────────────────────────────
  var _processing = false;

  function processQuestion(q) {
    if (_processing) return;
    var answer = MOCK_ANSWERS[q];
    if (!answer) {
      answer = {
        text: '"' + q + '" 에 대한 정보를 찾는 중 입니다. 현재 데모에서는 지원하지 않는 질문입니다.',
        citations: [],
        moreCount: 0,
        confidence: 'moderate',
        confLabel: 'MODERATE',
        confDetail: '데모 응답',
        steps: [{ text: '자산조회 에이전트 — 검색 시도', time: '0.10s' }],
        table: null
      };
    }

    _processing = true;

    // 1. 사용자 메시지 추가
    appendUserMsg(q);
    messages.scrollTop = messages.scrollHeight;

    // 2. 스피너 표시
    var spinnerWrap = document.createElement('div');
    spinnerWrap.className = 'acp-msg ai';
    spinnerWrap.innerHTML = '<div class="acp-typing"><span class="acp-spin"></span>처리 중...</div>';
    messages.appendChild(spinnerWrap);
    messages.scrollTop = messages.scrollHeight;

    // 3. 에이전트 시퀀스: 0.6s 간격 진행중 → 완료
    resetAgents();
    setAgentStatus('search', '진행중...', true);
    updateResultSection('조회 중...', q.substring(0, 8) + '…');

    setTimeout(function () {
      setAgentStatus('search',  '완료', false);
      setAgentStatus('analyze', '진행중...', true);
    }, 600);

    setTimeout(function () {
      setAgentStatus('analyze',  '완료', false);
      setAgentStatus('generate', '진행중...', true);
    }, 1200);

    setTimeout(function () {
      setAgentStatus('generate', '완료', false);

      // 4. 스피너 제거 후 AI 버블 추가
      spinnerWrap.remove();
      appendAiMsg(answer);
      messages.scrollTop = messages.scrollHeight;

      // 결과 업데이트
      var cnt = answer.citations.length + answer.moreCount || '—';
      updateResultSection(typeof cnt === 'number' ? cnt + '건' : cnt, q.substring(0, 8) + '…');

      // 우측 패널 전체 업데이트
      updateRightPanel(answer, q);

      _processing = false;
    }, 1800);
  }

  // ── 추천 질문 클릭 ──────────────────────────────────────────
  function bindSuggestClicks(container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.acp-suggest-btn');
      if (!btn || _processing) return;
      var q = btn.dataset.q || btn.textContent.trim();
      var inputEl = document.getElementById('acp-input');
      if (inputEl) inputEl.value = q;
      setTimeout(function () { processQuestion(q); }, 300);
    });
  }

  bindSuggestClicks(suggestList);
  bindSuggestClicks(freqList);

  // ── 입력창 전송 ──────────────────────────────────────────────
  var sendBtn = document.getElementById('acp-send');
  var inputEl = document.getElementById('acp-input');

  function handleSend() {
    if (!inputEl || _processing) return;
    var q = inputEl.value.trim();
    if (!q) return;
    inputEl.value = '';
    processQuestion(q);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (inputEl) {
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
};
