// ===== AI 결재함 화면 =====
window.renderAiphApproval = function () {
  var el = document.getElementById("view-aiph-approval");
  if (!el) return;

  // ===== 상세 패널 데이터 =====
  var DETAIL_DATA = [
    {
      title: "자산폐기 승인",
      agent: "자산수명 평가 에이전트",
      agentDesc: "자산 내용연수·상태 데이터를 분석해 폐기 적정성을 자동 판단하는 에이전트",
      confidence: 94,
      grounds: [
        "해당 자산 12대의 평균 사용연수: 6.2년 (내용연수 5년 초과)",
        "최근 수리비 합계: 3,840,000원 (취득가 대비 38.4% 도달)",
        "잔존가치 평가: 장부가액 0원, 감가상각 완료 자산 9대 포함",
        "동일 모델 시장가격: 평균 45,000원/대 (실질 경제적 가치 미미)",
        "운영팀 상태 보고: '수리 불가' 판정 3대, '간헐적 오류' 판정 9대",
        "폐기 처리 예상 절감액: 연간 유지비용 1,560,000원 회수 가능"
      ],
      assets: ["AST-PC-0041", "AST-PC-0042", "AST-PC-0047", "AST-PC-0051"]
    },
    {
      title: "이상탐지 대응",
      agent: "이상탐지 에이전트",
      agentDesc: "실시간 자산 데이터 모니터링으로 이상 패턴·위험 징후를 자동 탐지하는 에이전트",
      confidence: 87,
      grounds: [
        "부산지점 차량 3대 보험 만료일: 2026-06-14 (D-2, 긴급)",
        "보험 미갱신 시 법적 운행 불가 및 과태료 발생 가능성",
        "자산관리 시스템 내 자동 알림 발송 실패(이메일 서버 오류) 감지",
        "담당자 수동 알림 미발송 확인 (담당자 휴가 중)",
        "긴급 갱신 처리 시 예상 보험료: 1,840,000원 (예산 내 처리 가능)"
      ],
      assets: ["AST-VH-0012", "AST-VH-0013", "AST-VH-0015"]
    },
    {
      title: "대량 이전 승인",
      agent: "자산이동 에이전트",
      agentDesc: "자산 이동·재배치 요청의 타당성을 검토하고 최적 이동 경로를 제안하는 에이전트",
      confidence: 91,
      grounds: [
        "대전센터 서버장비 8식: 현 위치 공간 활용률 92% 초과 (이전 필요)",
        "광주지점 IT 인프라 확충 계획과 일치 (2026 Q3 계획 반영)",
        "자산 이동 비용 견적: 2,300,000원 (예산 배정 확인 완료)",
        "이동 대상 장비 감가상각 잔여 연수: 평균 2.8년 (이동 후 활용 가치 충분)",
        "광주지점 현재 IT 자산 부족률: 요구 대비 67% 수준"
      ],
      assets: ["AST-SV-0031", "AST-SV-0032", "AST-SV-0033", "AST-SV-0034"]
    },
    {
      title: "취득 예산 검토",
      agent: "예산분석 에이전트",
      agentDesc: "자산 취득 예산의 적정성·우선순위를 분석하고 집행 계획을 검토하는 에이전트",
      confidence: 82,
      grounds: [
        "2026년 3분기 IT자산 취득 예산 6.2억: 전분기 실적 대비 +18.3%",
        "취득 항목 검토: 노트북 45대(2.1억), 서버 3식(2.8억), 네트워크 장비(1.3억)",
        "우선순위 분석: 서버 3식은 노후화 위험도 '높음' 자산 대체 목적 확인",
        "예산 집행 적정성: 유사 규모 기관 평균 대비 12% 하회 (효율적)",
        "분기 내 집행 가능성: 발주~납품 리드타임 고려 시 9월 말 완료 예상"
      ],
      assets: []
    },
    {
      title: "리포트 자동발송",
      agent: "자동리포트 에이전트",
      agentDesc: "월간·분기 자산현황 보고서를 자동 생성하고 구독자에게 발송하는 에이전트",
      confidence: 98,
      grounds: [
        "월간 자산현황 보고서 자동 생성 완료 (2026년 5월분, 총 24페이지)",
        "구독자 명단 최신화 확인: 12명 (변경 사항 없음)",
        "보고서 내용 검토: 데이터 정합성 100%, 오류 항목 없음",
        "첨부 파일 크기: 2.3MB (발송 한도 10MB 이내)",
        "발송 이력: 최근 6개월 연속 성공, 미수신 신고 없음"
      ],
      assets: []
    },
    {
      title: "긴급 재고조사",
      agent: "현황분석 에이전트",
      agentDesc: "자산 현황 데이터 불일치를 탐지하고 실사 지시 및 후속 조치를 제안하는 에이전트",
      confidence: 89,
      grounds: [
        "미파악 자산 17건: 시스템 등록 자산이나 위치 미확인 상태 6개월 이상",
        "대상 자산 추정 가치: 약 1.2억원 (분실·도난 가능성 배제 불가)",
        "최근 실사 미실시 부서: 디지털혁신부(4건), 영업지원부(7건), 기타(6건)",
        "감사 지적 위험: 다음 정기감사(2026-09) 전 해소 필요",
        "현장 실사 예상 소요: 3일 (담당 인력 2명 배정 필요)"
      ],
      assets: ["AST-ETC-0088", "AST-ETC-0089", "AST-ETC-0091"]
    }
  ];

  var HISTORY_ROWS = [
    { dt: "2026-06-12 09:15", type: "자산폐기", agent: "자산수명 평가", result: "승인", handler: "김재무", note: "정책 부합" },
    { dt: "2026-06-11 17:30", type: "예산 검토", agent: "예산분석", result: "반려", handler: "이총무", note: "예산 한도 초과" },
    { dt: "2026-06-11 14:22", type: "이상탐지", agent: "이상탐지", result: "승인", handler: "박IT", note: "즉시 조치 완료" },
    { dt: "2026-06-10 11:05", type: "대량 이전", agent: "자산이동", result: "승인", handler: "김재무", note: "물류 일정 확정" },
    { dt: "2026-06-10 09:48", type: "리포트 발송", agent: "자동리포트", result: "승인", handler: "시스템", note: "자동 승인" },
    { dt: "2026-06-09 16:33", type: "자산폐기", agent: "자산수명 평가", result: "반려", handler: "이총무", note: "추가 실사 필요" },
    { dt: "2026-06-08 13:20", type: "긴급 실사", agent: "현황분석", result: "승인", handler: "박IT", note: "3일 내 완료 지시" },
    { dt: "2026-06-07 10:55", type: "취득 승인", agent: "예산분석", result: "승인", handler: "김재무", note: "Q2 예산 집행" }
  ];

  // ===== HTML 생성 =====
  var activeRow = -1;

  function buildRows() {
    var ROWS = [
      { type: "자산폐기 승인", agent: "자산수명 평가 에이전트", summary: "서울 본사 PC 12대 내용연수 초과 폐기 요청", risk: "high", time: "10:32", sla: "D-0" },
      { type: "이상탐지 대응", agent: "이상탐지 에이전트", summary: "부산지점 차량 3대 보험만료 임박 자동 알림", risk: "mid", time: "11:05", sla: "D-1" },
      { type: "대량 이전 승인", agent: "자산이동 에이전트", summary: "대전센터 → 광주지점 서버장비 8식 이동 요청", risk: "high", time: "13:20", sla: "D-0" },
      { type: "취득 예산 검토", agent: "예산분석 에이전트", summary: "2026년 3분기 IT자산 취득 예산 6.2억 승인 요청", risk: "mid", time: "14:10", sla: "D-2" },
      { type: "리포트 자동발송", agent: "자동리포트 에이전트", summary: "월간 자산현황 보고서 이메일 발송 최종 확인", risk: "low", time: "15:00", sla: "D-3" },
      { type: "긴급 재고조사", agent: "현황분석 에이전트", summary: "미파악 자산 17건 현장 실사 지시 요청", risk: "high", time: "15:42", sla: "D-0" }
    ];
    var riskMap = { high: '<span style="color:#DC2626;font-weight:600;">🔴 높음</span>', mid: '<span style="color:#D97706;font-weight:600;">🟡 중간</span>', low: '<span style="color:#16A34A;font-weight:600;">🟢 낮음</span>' };
    var slaStyle = function(s) { return s === "D-0" ? "color:#DC2626;font-weight:700;" : ""; };
    var html = "";
    for (var i = 0; i < ROWS.length; i++) {
      var r = ROWS[i];
      html += '<tr class="approval-row" data-idx="' + i + '" style="cursor:pointer;">' +
        '<td>' + r.type + '</td>' +
        '<td><span style="font-size:12px;color:#6B7280;">' + r.agent + '</span></td>' +
        '<td style="max-width:240px;">' + r.summary + '</td>' +
        '<td>' + riskMap[r.risk] + '</td>' +
        '<td style="color:#6B7280;">' + r.time + '</td>' +
        '<td style="' + slaStyle(r.sla) + '">' + r.sla + '</td>' +
        '<td><button class="review-btn" data-idx="' + i + '" style="padding:4px 12px;border:1px solid #3B82F6;border-radius:6px;background:#EFF6FF;color:#1D4ED8;font-size:12px;cursor:pointer;">검토</button></td>' +
        '</tr>';
    }
    return html;
  }

  function buildDetailPanel(idx) {
    var d = DETAIL_DATA[idx];
    var confColor = d.confidence >= 94 ? "#16A34A" : d.confidence >= 70 ? "#D97706" : "#DC2626";
    var confBg = d.confidence >= 94 ? "#F0FDF4" : d.confidence >= 70 ? "#FFFBEB" : "#FEF2F2";
    var groundsHtml = "";
    for (var i = 0; i < d.grounds.length; i++) {
      groundsHtml += '<li style="margin-bottom:6px;line-height:1.5;color:#374151;">• ' + d.grounds[i] + '</li>';
    }
    var assetsHtml = "";
    for (var j = 0; j < d.assets.length; j++) {
      assetsHtml += '<span style="display:inline-block;padding:3px 10px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:20px;font-size:12px;color:#1D4ED8;margin:2px 4px 2px 0;">' + d.assets[j] + '</span>';
    }
    if (!assetsHtml) assetsHtml = '<span style="color:#9CA3AF;font-size:12px;">해당 없음</span>';

    return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
      '<div style="font-size:15px;font-weight:700;color:#111827;">AI 분석 상세</div>' +
      '<button id="close-detail-panel" style="background:none;border:none;font-size:18px;cursor:pointer;color:#6B7280;line-height:1;">✕</button>' +
      '</div>' +
      '<div style="background:#F8FAFC;border-radius:8px;padding:12px 14px;margin-bottom:16px;">' +
      '<div style="font-size:13px;font-weight:700;color:#1E293B;margin-bottom:4px;">🤖 ' + d.agent + '</div>' +
      '<div style="font-size:12px;color:#6B7280;">' + d.agentDesc + '</div>' +
      '</div>' +
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">📋 분석 근거</div>' +
      '<ul style="list-style:none;padding:0;margin:0;font-size:13px;">' + groundsHtml + '</ul>' +
      '</div>' +
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">신뢰도</div>' +
      '<span style="display:inline-block;padding:5px 14px;background:' + confBg + ';border:1px solid ' + confColor + ';border-radius:6px;font-size:13px;font-weight:700;color:' + confColor + ';">CONFIDENCE: ' + d.confidence + '%</span>' +
      '</div>' +
      (d.assets.length > 0 ? '<div style="margin-bottom:20px;"><div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;">관련 자산</div>' + assetsHtml + '</div>' : '') +
      '<div style="display:flex;gap:10px;margin-top:8px;">' +
      '<button id="btn-approve" style="flex:1;padding:10px;background:#16A34A;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">✅ 승인</button>' +
      '<button id="btn-reject" style="flex:1;padding:10px;background:#DC2626;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">❌ 반려</button>' +
      '</div>';
  }

  function buildHistoryRows() {
    var html = "";
    for (var i = 0; i < HISTORY_ROWS.length; i++) {
      var r = HISTORY_ROWS[i];
      var rColor = r.result === "승인" ? "#16A34A" : "#DC2626";
      var rBg = r.result === "승인" ? "#F0FDF4" : "#FEF2F2";
      html += '<tr>' +
        '<td style="color:#6B7280;font-size:12px;">' + r.dt + '</td>' +
        '<td>' + r.type + '</td>' +
        '<td style="font-size:12px;color:#6B7280;">' + r.agent + '</td>' +
        '<td><span style="display:inline-block;padding:2px 10px;background:' + rBg + ';color:' + rColor + ';border-radius:12px;font-size:12px;font-weight:600;">' + r.result + '</span></td>' +
        '<td>' + r.handler + '</td>' +
        '<td style="font-size:12px;color:#9CA3AF;">' + r.note + '</td>' +
        '</tr>';
    }
    return html;
  }

  el.innerHTML =
    '<div class="asis-page">' +
      // 헤더
      '<div style="margin-bottom:24px;">' +
        '<h2 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;">AI 결재함</h2>' +
        '<p style="font-size:14px;color:#6B7280;margin:0;">AI 에이전트가 요청한 처리 건을 검토하고 승인 또는 반려합니다.</p>' +
      '</div>' +
      // KPI 행
      '<div class="asis-kpi-row" style="margin-bottom:24px;">' +
        '<div class="asis-kpi-card accent-red"><div class="asis-kpi-label">결재 대기</div><div class="asis-kpi-value">3건</div><div class="asis-kpi-sub">즉시 검토 필요</div></div>' +
        '<div class="asis-kpi-card accent-green"><div class="asis-kpi-label">오늘 처리</div><div class="asis-kpi-value">5건</div><div class="asis-kpi-sub">평균 2.3시간 소요</div></div>' +
        '<div class="asis-kpi-card accent-orange"><div class="asis-kpi-label">SLA 초과</div><div class="asis-kpi-value">0건</div><div class="asis-kpi-sub">정상 범위</div></div>' +
        '<div class="asis-kpi-card accent-blue"><div class="asis-kpi-label">이번 달 누적</div><div class="asis-kpi-value">47건</div><div class="asis-kpi-sub">전월 대비 +12%</div></div>' +
      '</div>' +
      // 2열 레이아웃
      '<div style="display:flex;gap:20px;margin-bottom:28px;align-items:flex-start;">' +
        // 좌측: 결재 목록
        '<div class="asis-panel" style="flex:1.5;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
            '<div style="font-size:15px;font-weight:700;color:#111827;">결재 대기 목록</div>' +
            '<span style="font-size:12px;color:#6B7280;">행을 클릭하면 상세 분석을 볼 수 있습니다</span>' +
          '</div>' +
          '<div style="overflow-x:auto;">' +
            '<table class="asis-table" id="approval-table">' +
              '<thead><tr>' +
                '<th>유형</th><th>AI 에이전트</th><th>요청 요약</th><th>리스크</th><th>요청 시각</th><th>SLA</th><th>검토</th>' +
              '</tr></thead>' +
              '<tbody id="approval-tbody">' + buildRows() + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
        // 우측: 상세 패널
        '<div id="approval-detail-panel" class="asis-panel" style="flex:1;min-width:280px;display:none;">' +
          '<div id="approval-detail-content"></div>' +
        '</div>' +
      '</div>' +
      // 처리 이력
      '<div class="asis-panel">' +
        '<div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:14px;">처리 이력 <span style="font-size:13px;font-weight:400;color:#6B7280;">(최근 30건)</span></div>' +
        '<div style="overflow-x:auto;">' +
          '<table class="asis-table">' +
            '<thead><tr><th>처리일시</th><th>유형</th><th>AI 에이전트</th><th>결과</th><th>처리자</th><th>비고</th></tr></thead>' +
            '<tbody>' + buildHistoryRows() + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';

  // ===== 이벤트 바인딩 =====
  function openDetail(idx) {
    activeRow = idx;
    // 행 강조
    var rows = el.querySelectorAll(".approval-row");
    for (var i = 0; i < rows.length; i++) {
      rows[i].style.background = (parseInt(rows[i].getAttribute("data-idx")) === idx) ? "#EFF6FF" : "";
    }
    var panel = document.getElementById("approval-detail-panel");
    var content = document.getElementById("approval-detail-content");
    content.innerHTML = buildDetailPanel(idx);
    panel.style.display = "block";

    // 닫기 버튼
    var closeBtn = document.getElementById("close-detail-panel");
    if (closeBtn) closeBtn.addEventListener("click", function() {
      panel.style.display = "none";
      activeRow = -1;
      var rs = el.querySelectorAll(".approval-row");
      for (var j = 0; j < rs.length; j++) rs[j].style.background = "";
    });
    // 승인
    var approveBtn = document.getElementById("btn-approve");
    if (approveBtn) approveBtn.addEventListener("click", function() {
      alert("승인 처리되었습니다.");
      panel.style.display = "none";
      activeRow = -1;
      var rs = el.querySelectorAll(".approval-row");
      for (var j = 0; j < rs.length; j++) rs[j].style.background = "";
    });
    // 반려
    var rejectBtn = document.getElementById("btn-reject");
    if (rejectBtn) rejectBtn.addEventListener("click", function() {
      alert("반려 처리되었습니다.");
      panel.style.display = "none";
      activeRow = -1;
      var rs = el.querySelectorAll(".approval-row");
      for (var j = 0; j < rs.length; j++) rs[j].style.background = "";
    });
  }

  // 행 클릭
  var rows = el.querySelectorAll(".approval-row");
  for (var i = 0; i < rows.length; i++) {
    (function(idx) {
      rows[idx].addEventListener("click", function(e) {
        if (e.target.classList.contains("review-btn")) return;
        openDetail(idx);
      });
    })(i);
  }
  // 검토 버튼 클릭
  var reviewBtns = el.querySelectorAll(".review-btn");
  for (var k = 0; k < reviewBtns.length; k++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        openDetail(parseInt(btn.getAttribute("data-idx")));
      });
    })(reviewBtns[k]);
  }
};
