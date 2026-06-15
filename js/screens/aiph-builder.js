// ===== 에이전트 빌더 화면 =====
window.renderAiphBuilder = function () {
  var el = document.getElementById("view-aiph-builder");
  if (!el) return;

  // ===== 플로우 데이터 =====
  var FLOWS = [
    "자산현황 일일보고",
    "이상탐지 알림",
    "폐기승인 워크플로우",
    "예산분석 리포트",
    "긴급 재고조사",
    "불용예산 탐지·재배분 요청",
    "결산 잔액대사 자동 검증",
    "리스 만기 알림 및 분석",
    "부가세 신고 자료 검증",
    "재물조사 이상 원장 정리",
    "주석공시 데이터 자동 검증",
    "시설물 점검 일정 AI 알림"
  ];

  // ===== 노드별 속성 패널 정의 =====
  var NODE_PROPS = {
    trigger: {
      label: "⏰ 스케줄 트리거",
      fields:
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">실행 주기</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">' +
        '<option selected>매일</option><option>매주</option><option>매월</option><option>커스텀</option></select></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">실행 시간</label>' +
        '<input type="time" value="08:50" style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">타임존</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option selected>Asia/Seoul</option></select></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;"><label style="font-size:12px;color:#6B7280;">활성화</label>' +
        '<input type="checkbox" checked style="width:16px;height:16px;"></div>' +
        '<div style="margin-top:16px;border-top:1px solid #F1F5F9;padding-top:12px;"><div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px;">출력 변수</div>' +
        '<div style="font-size:12px;color:#6B7280;line-height:1.8;">• trigger_time <span style="color:#9CA3AF;">(자동 생성)</span><br>• job_id <span style="color:#9CA3AF;">(자동 생성)</span></div></div>'
    },
    query: {
      label: "🗄️ 자산 데이터 조회",
      fields:
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">데이터 소스</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option selected>고정자산 DB</option><option>Excel 임포트</option></select></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">조회 범위</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option selected>전체 자산</option><option>활성 자산만</option><option>부서별</option></select></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">타임아웃 (초)</label>' +
        '<input type="number" value="30" style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">' +
        '<div style="margin-top:16px;border-top:1px solid #F1F5F9;padding-top:12px;"><div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px;">출력 변수</div>' +
        '<div style="font-size:12px;color:#6B7280;line-height:1.8;">• asset_list[] <span style="color:#9CA3AF;">(배열)</span><br>• total_count <span style="color:#9CA3AF;">(정수)</span></div></div>'
    },
    analyze: {
      label: "📈 집계·분석",
      fields:
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">분석 유형</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option selected>요약 집계</option><option>이상탐지</option><option>추세 분석</option></select></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">이상 판정 기준</label>' +
        '<input type="text" value="내용연수 초과 또는 수리비 &gt;30%" style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"></div>' +
        '<div style="margin-top:16px;border-top:1px solid #F1F5F9;padding-top:12px;"><div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px;">분기 출력</div>' +
        '<div style="font-size:12px;color:#6B7280;line-height:1.8;">• 이상 없음 → LLM 요약 경로<br>• 이상 탐지 → 이메일 발송 경로</div></div>'
    },
    llm: {
      label: "💬 LLM 요약 생성",
      fields:
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">모델</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option selected>claude-sonnet-4-6</option><option>claude-haiku-4-5</option></select></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">시스템 프롬프트</label>' +
        '<textarea style="width:100%;height:80px;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;resize:vertical;">당신은 NH 고정자산관리 전문가입니다. 자산 현황 데이터를 바탕으로 간결한 일일 요약 보고서를 작성하세요.</textarea></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">최대 토큰</label>' +
        '<input type="number" value="1024" style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"></div>'
    },
    email: {
      label: "📧 이메일 발송",
      fields:
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">수신자 그룹</label>' +
        '<select style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option selected>자산관리팀 전체</option><option>관리자만</option><option>커스텀 목록</option></select></div>' +
        '<div style="margin-bottom:14px;"><label style="font-size:12px;color:#6B7280;display:block;margin-bottom:4px;">제목 템플릿</label>' +
        '<input type="text" value="[NH 고정자산] {{date}} 자산현황 일일보고" style="width:100%;padding:6px 8px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><label style="font-size:12px;color:#6B7280;">HTML 포맷</label>' +
        '<input type="checkbox" checked style="width:16px;height:16px;"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;"><label style="font-size:12px;color:#6B7280;">PDF 첨부</label>' +
        '<input type="checkbox" style="width:16px;height:16px;"></div>'
    }
  };

  // ===== SVG 플로우 다이어그램 =====
  var CANVAS_SVG =
    '<svg width="100%" height="100%" viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg">' +
      // 마커 정의
      '<defs>' +
        '<marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">' +
          '<polygon points="0 0, 8 3, 0 6" fill="#3B82F6"/>' +
        '</marker>' +
        '<marker id="arrowGray" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">' +
          '<polygon points="0 0, 8 3, 0 6" fill="#94A3B8"/>' +
        '</marker>' +
      '</defs>' +
      // 화살표 연결선
      // 1→2 트리거→데이터조회
      '<line x1="170" y1="185" x2="238" y2="185" stroke="#3B82F6" stroke-width="2" marker-end="url(#arrowBlue)"/>' +
      // 2→3 데이터조회→집계분석
      '<line x1="370" y1="185" x2="428" y2="185" stroke="#3B82F6" stroke-width="2" marker-end="url(#arrowBlue)"/>' +
      // 3→4 집계분석→LLM (분기: 이상없음)
      '<line x1="455" y1="160" x2="455" y2="120" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowGray)"/>' +
      '<line x1="455" y1="120" x2="558" y2="80" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowGray)"/>' +
      // 3→5 집계분석→이메일 (분기: 이상탐지)
      '<line x1="455" y1="210" x2="455" y2="270" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowGray)"/>' +
      '<line x1="455" y1="270" x2="558" y2="300" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowGray)"/>' +
      // 4→5 LLM→이메일
      '<line x1="625" y1="100" x2="625" y2="278" stroke="#3B82F6" stroke-width="2" marker-end="url(#arrowBlue)"/>' +
      // 분기 라벨
      '<text x="460" y="108" font-size="10" fill="#6B7280">이상 없음</text>' +
      '<text x="460" y="264" font-size="10" fill="#6B7280">이상 탐지</text>' +

      // 노드 1: 스케줄 트리거
      '<rect data-node="trigger" x="40" y="160" width="130" height="50" rx="8" fill="#EEF2FF" stroke="#4F46E5" stroke-width="2" style="cursor:pointer;"/>' +
      '<text x="105" y="182" text-anchor="middle" font-size="12" font-weight="600" fill="#3730A3" style="pointer-events:none;">⏰ 스케줄 트리거</text>' +
      '<text x="105" y="198" text-anchor="middle" font-size="10" fill="#6366F1" style="pointer-events:none;">매일 08:50</text>' +

      // 노드 2: 자산 데이터 조회
      '<rect data-node="query" x="240" y="160" width="130" height="50" rx="8" fill="#F0FDF4" stroke="#16A34A" stroke-width="2" style="cursor:pointer;"/>' +
      '<text x="305" y="182" text-anchor="middle" font-size="12" font-weight="600" fill="#166534" style="pointer-events:none;">🗄️ 자산 데이터 조회</text>' +
      '<text x="305" y="198" text-anchor="middle" font-size="10" fill="#4ADE80" style="pointer-events:none;">전체 자산</text>' +

      // 노드 3: 집계·분석 (마름모)
      '<polygon data-node="analyze" points="455,155 510,185 455,215 400,185" fill="#FFF7ED" stroke="#EA580C" stroke-width="2" style="cursor:pointer;"/>' +
      '<text x="455" y="181" text-anchor="middle" font-size="11" font-weight="600" fill="#C2410C" style="pointer-events:none;">📈 집계·분석</text>' +
      '<text x="455" y="196" text-anchor="middle" font-size="10" fill="#FB923C" style="pointer-events:none;">분기 판단</text>' +

      // 노드 4: LLM 요약 생성
      '<rect data-node="llm" x="560" y="50" width="130" height="50" rx="8" fill="#FDF4FF" stroke="#9333EA" stroke-width="2" style="cursor:pointer;"/>' +
      '<text x="625" y="72" text-anchor="middle" font-size="12" font-weight="600" fill="#7E22CE" style="pointer-events:none;">💬 LLM 요약 생성</text>' +
      '<text x="625" y="88" text-anchor="middle" font-size="10" fill="#A855F7" style="pointer-events:none;">claude-sonnet</text>' +

      // 노드 5: 이메일 발송
      '<rect data-node="email" x="560" y="280" width="130" height="50" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="2" style="cursor:pointer;"/>' +
      '<text x="625" y="302" text-anchor="middle" font-size="12" font-weight="600" fill="#1D4ED8" style="pointer-events:none;">📧 이메일 발송</text>' +
      '<text x="625" y="318" text-anchor="middle" font-size="10" fill="#60A5FA" style="pointer-events:none;">09:00 예약</text>' +
    '</svg>';

  // ===== 에이전트 카드 데이터 =====
  var AGENT_CARDS = [
    { icon: "🤖", name: "자산현황 에이전트", color: "#EEF2FF", tc: "#3730A3", statusDot: "#16A34A", status: "● 실행중", l1: "마지막 실행: 오늘 09:00", l2: "다음 실행: 오늘 18:00", l3: "성공률 99.2%" },
    { icon: "🔍", name: "이상탐지 에이전트", color: "#FFF7ED", tc: "#C2410C", statusDot: "#EA580C", status: "● 감시중", l1: "오늘 탐지: 5건", l2: "대기 결재: 2건", l3: "응답시간 0.8초" },
    { icon: "📊", name: "자동리포트 에이전트", color: "#F0FDF4", tc: "#166534", statusDot: "#9CA3AF", status: "● 대기", l1: "다음 발송: 금요일 17:00", l2: "구독자: 12명", l3: "최근 오류: 없음" },
    { icon: "✅", name: "결재처리 에이전트", color: "#FDF4FF", tc: "#7E22CE", statusDot: "#16A34A", status: "● 실행중", l1: "대기 건수: 3건", l2: "평균 처리: 2.3시간", l3: "SLA 초과: 0건" }
  ];

  function buildAgentCards() {
    var html = "";
    for (var i = 0; i < AGENT_CARDS.length; i++) {
      var c = AGENT_CARDS[i];
      html +=
        '<div style="display:inline-block;vertical-align:top;min-width:200px;max-width:220px;background:' + c.color + ';border-radius:12px;padding:14px 16px;margin-right:12px;border:1px solid rgba(0,0,0,0.06);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
            '<span style="font-size:14px;font-weight:700;color:' + c.tc + ';">' + c.icon + ' ' + c.name + '</span>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:600;color:' + c.statusDot + ';margin-bottom:8px;">' + c.status + '</div>' +
          '<div style="font-size:12px;color:#6B7280;line-height:1.7;">' + c.l1 + '<br>' + c.l2 + '<br>' + c.l3 + '</div>' +
          '<div style="margin-top:10px;"><span style="font-size:11px;color:#3B82F6;cursor:pointer;text-decoration:underline;" class="agent-edit-link" data-flow="' + i + '">편집</span></div>' +
        '</div>';
    }
    return html;
  }

  function buildPropPanel(nodeKey) {
    var np = NODE_PROPS[nodeKey] || NODE_PROPS["trigger"];
    return '<div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #F1F5F9;">' + np.label + '</div>' +
      np.fields +
      '<div style="display:flex;gap:8px;margin-top:20px;">' +
        '<button onclick="alert(\'적용되었습니다.\')" style="flex:1;padding:8px;background:#3B82F6;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">적용</button>' +
        '<button onclick="alert(\'초기화되었습니다.\')" style="flex:1;padding:8px;background:#F1F5F9;color:#64748B;border:none;border-radius:6px;font-size:13px;cursor:pointer;">초기화</button>' +
      '</div>';
  }

  function buildPaletteSection(title, items) {
    var html = '<div style="font-size:11px;font-weight:700;color:#9CA3AF;margin:12px 0 6px;text-transform:uppercase;letter-spacing:.05em;">' + title + '</div>';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="palette-item" style="padding:8px 10px;border-radius:6px;font-size:12px;color:#374151;cursor:grab;display:flex;align-items:center;gap:8px;">' + items[i] + '</div>';
    }
    return html;
  }

  // ===== 드롭다운 빌드 =====
  var flowOptions = "";
  for (var fi = 0; fi < FLOWS.length; fi++) {
    flowOptions += '<option value="' + fi + '"' + (fi === 0 ? ' selected' : '') + '>' + FLOWS[fi] + '</option>';
  }

  el.innerHTML =
    '<div class="asis-page">' +
      // 헤더
      '<div style="margin-bottom:16px;">' +
        '<h2 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;">에이전트 빌더</h2>' +
        '<p style="font-size:14px;color:#6B7280;margin:0;">AI 에이전트 플로우를 시각적으로 설계하세요.</p>' +
      '</div>' +
      // 액션 바
      '<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<label style="font-size:13px;color:#6B7280;font-weight:600;">📋 플로우 목록</label>' +
          '<select id="flow-select" style="padding:6px 10px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;background:#fff;">' + flowOptions + '</select>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button onclick="alert(\'새 에이전트 빌더가 열립니다. (시연 프로토타입)\')" style="padding:7px 16px;background:#3B82F6;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;">+ 새 에이전트</button>' +
          '<button onclick="alert(\'플로우가 저장되었습니다.\')" style="padding:7px 16px;background:#16A34A;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;">💾 저장</button>' +
          '<button onclick="alert(\'에이전트가 배포되었습니다.\')" style="padding:7px 16px;background:#7C3AED;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;">🚀 배포</button>' +
        '</div>' +
      '</div>' +
      // 활성 에이전트 카드 띠
      '<div class="asis-panel" style="margin-bottom:20px;">' +
        '<div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px;">활성 에이전트</div>' +
        '<div style="overflow-x:auto;white-space:nowrap;padding-bottom:4px;">' +
          buildAgentCards() +
        '</div>' +
      '</div>' +
      // 3열 메인 영역
      '<div style="display:flex;gap:16px;align-items:flex-start;">' +
        // 블록 팔레트
        '<div class="asis-panel" style="width:220px;flex-shrink:0;">' +
          '<div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:4px;">블록 팔레트</div>' +
          buildPaletteSection("🔍 트리거", ["⏰ 스케줄 트리거", "🔔 이벤트 트리거", "📥 API 입력"]) +
          buildPaletteSection("📊 데이터", ["🗄️ 자산 조회", "📈 집계 분석", "🔍 이상탐지"]) +
          buildPaletteSection("🤖 AI", ["💬 LLM 응답 생성", "🧠 RAG 검색", "📝 요약 생성"]) +
          buildPaletteSection("⚙️ 액션", ["📧 이메일 발송", "✅ 결재 요청", "💾 데이터 저장"]) +
        '</div>' +
        // 캔버스
        '<div style="flex:1;">' +
          '<div class="asis-panel" style="padding:0;overflow:hidden;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #F1F5F9;">' +
              '<div id="canvas-title" style="font-size:14px;font-weight:700;color:#111827;">자산현황 일일보고 플로우</div>' +
              '<span style="padding:3px 10px;background:#EFF6FF;color:#1D4ED8;border-radius:12px;font-size:11px;font-weight:600;">편집 모드</span>' +
            '</div>' +
            '<div id="flow-canvas" style="height:420px;background:#FAFAFA;background-image:radial-gradient(circle, #CBD5E1 1px, transparent 1px);background-size:24px 24px;border-radius:0 0 12px 12px;padding:8px;">' +
              CANVAS_SVG +
            '</div>' +
          '</div>' +
        '</div>' +
        // 속성 패널
        '<div class="asis-panel" style="width:260px;flex-shrink:0;">' +
          '<div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:4px;">속성</div>' +
          '<div style="font-size:11px;color:#9CA3AF;margin-bottom:14px;">노드를 클릭하면 편집할 수 있습니다</div>' +
          '<div id="prop-panel-content">' + buildPropPanel("trigger") + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // ===== 이벤트 바인딩 =====

  // 팔레트 아이템 hover
  var paletteItems = el.querySelectorAll(".palette-item");
  for (var pi = 0; pi < paletteItems.length; pi++) {
    (function(item) {
      item.addEventListener("mouseenter", function() { item.style.background = "#F1F5F9"; });
      item.addEventListener("mouseleave", function() { item.style.background = ""; });
      item.addEventListener("click", function() { alert("블록을 캔버스로 드래그하여 추가할 수 있습니다. (시연 프로토타입)"); });
    })(paletteItems[pi]);
  }

  // SVG 노드 클릭 → 속성 패널 전환
  var svgEl = el.querySelector("#flow-canvas svg");
  if (svgEl) {
    svgEl.addEventListener("click", function(e) {
      var target = e.target;
      var nodeKey = null;
      // rect, polygon에 data-node 지정됨
      if (target.getAttribute("data-node")) nodeKey = target.getAttribute("data-node");
      // 텍스트 클릭 시 부모에서 찾기
      if (!nodeKey && target.parentElement) nodeKey = target.parentElement.getAttribute("data-node");
      if (!nodeKey) return;
      var propContent = document.getElementById("prop-panel-content");
      if (propContent) propContent.innerHTML = buildPropPanel(nodeKey);
    });
  }

  // 플로우 드롭다운 변경 → 캔버스 제목 변경
  var flowSelect = document.getElementById("flow-select");
  if (flowSelect) {
    flowSelect.addEventListener("change", function() {
      var title = document.getElementById("canvas-title");
      if (title) title.textContent = FLOWS[parseInt(flowSelect.value)] + " 플로우";
    });
  }

  // 에이전트 카드 편집 링크 → 드롭다운 연동
  var editLinks = el.querySelectorAll(".agent-edit-link");
  for (var ei = 0; ei < editLinks.length; ei++) {
    (function(link) {
      link.addEventListener("click", function() {
        var idx = parseInt(link.getAttribute("data-flow"));
        if (flowSelect) {
          flowSelect.value = idx;
          var title = document.getElementById("canvas-title");
          if (title) title.textContent = FLOWS[idx] + " 플로우";
        }
      });
    })(editLinks[ei]);
  }
};
