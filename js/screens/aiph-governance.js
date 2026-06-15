// ===== 거버넌스 화면 =====
window.renderAiphGovernance = function () {
  var el = document.getElementById("view-aiph-governance");
  if (!el) return;

  // ===== 역할 매트릭스 데이터 =====
  var ROLES = ["현업담당자", "AI 운영자", "관리자·감사"];
  var PERMS = [
    { feature: "AI Copilot 질의",      desc: "질문 입력 및 AI 응답 조회",          vals: [true,  true,  true] },
    { feature: "이상탐지 알림 수신",    desc: "탐지된 이상 항목 열람",              vals: [true,  true,  true] },
    { feature: "결재 요청 승인·반려",   desc: "AI 에이전트 결재 요청 처리",         vals: [false, true,  true] },
    { feature: "자동 리포트 열람",       desc: "생성된 보고서 다운로드·공유",        vals: [true,  true,  true] },
    { feature: "에이전트 빌더 편집",    desc: "플로우 작성·수정·배포",              vals: [false, true,  false] },
    { feature: "지식베이스 문서 업로드", desc: "참조 문서 등록·갱신",               vals: [false, true,  true] },
    { feature: "평가·품질 테스트 실행", desc: "테스트 케이스 실행·결과 조회",       vals: [false, true,  true] },
    { feature: "모니터링 대시보드",      desc: "에이전트 운영 현황 전체 조회",       vals: [false, true,  true] },
    { feature: "역할·권한 관리",         desc: "사용자 역할 지정·변경",              vals: [false, false, true] },
    { feature: "감사 로그 열람",          desc: "전체 이용 이력·변경 로그 조회",     vals: [false, false, true] }
  ];

  var AUDIT_LOGS = [
    { ts: "2026-06-12 15:42", user: "박IT (AI운영자)",     action: "에이전트 배포",   target: "이상탐지 에이전트 v2.3", result: "성공" },
    { ts: "2026-06-12 14:10", user: "이총무 (관리자)",     action: "권한 변경",        target: "김재무 → AI운영자 승격", result: "성공" },
    { ts: "2026-06-12 13:20", user: "박IT (AI운영자)",     action: "결재 승인",        target: "대량 이전 승인 RPT-059", result: "성공" },
    { ts: "2026-06-12 11:05", user: "김재무 (현업담당자)", action: "Copilot 질의",    target: "서울 유휴 자산 현황",     result: "성공" },
    { ts: "2026-06-12 10:32", user: "박IT (AI운영자)",     action: "결재 반려",        target: "자산폐기 승인 TC-001",   result: "성공" },
    { ts: "2026-06-11 17:30", user: "이총무 (관리자)",     action: "감사 로그 조회",   target: "2026년 6월 전체",        result: "성공" },
    { ts: "2026-06-11 16:00", user: "박IT (AI운영자)",     action: "지식베이스 업로드", target: "KB-AI-002 신규 등록",   result: "성공" },
    { ts: "2026-06-11 09:48", user: "박IT (AI운영자)",     action: "스케줄 수정",      target: "월간보고서 발송 시각 변경", result: "성공" }
  ];

  var POLICIES = [
    { id: "POL-001", name: "개인정보 비노출 가드레일",   desc: "AI 응답에 직원 개인정보(주민번호·연락처) 포함 시 자동 마스킹", status: "활성", triggered: 3 },
    { id: "POL-002", name: "예산 한도 초과 차단",         desc: "단일 결재 건 5억 초과 시 AI 자동 승인 불가, 관리자 수동 검토", status: "활성", triggered: 1 },
    { id: "POL-003", name: "응답 신뢰도 하한선",          desc: "신뢰도 70% 미만 응답은 사용자에게 '검토 필요' 경고 표시",    status: "활성", triggered: 12 },
    { id: "POL-004", name: "외부 데이터 참조 제한",       desc: "지식베이스 외부 URL 직접 참조 차단 (내부 문서만 허용)",      status: "활성", triggered: 0 },
    { id: "POL-005", name: "폐기·이전 금액 상한 자동승인", desc: "1,000만 원 이하 소액 폐기·이전은 AI 자동 결재 허용",        status: "비활성", triggered: 0 }
  ];

  function buildPermMatrix() {
    var html = "<table class='asis-table'><thead><tr><th>기능</th><th>설명</th>";
    for (var r = 0; r < ROLES.length; r++) html += "<th style='text-align:center;'>" + ROLES[r] + "</th>";
    html += "</tr></thead><tbody>";
    for (var i = 0; i < PERMS.length; i++) {
      var p = PERMS[i];
      html += "<tr><td style='font-weight:500;'>" + p.feature + "</td><td style='font-size:12px;color:#6B7280;'>" + p.desc + "</td>";
      for (var j = 0; j < p.vals.length; j++) {
        html += "<td style='text-align:center;font-size:16px;'>" + (p.vals[j] ? "<span style='color:#16A34A;'>✓</span>" : "<span style='color:#E5E7EB;'>—</span>") + "</td>";
      }
      html += "</tr>";
    }
    return html + "</tbody></table>";
  }

  function buildAuditRows() {
    var html = "";
    for (var i = 0; i < AUDIT_LOGS.length; i++) {
      var a = AUDIT_LOGS[i];
      html += "<tr>" +
        "<td style='font-size:12px;color:#6B7280;white-space:nowrap;'>" + a.ts + "</td>" +
        "<td style='font-size:13px;'>" + a.user + "</td>" +
        "<td><span style='display:inline-block;padding:2px 9px;background:#EFF6FF;color:#1D4ED8;border-radius:12px;font-size:11px;font-weight:600;'>" + a.action + "</span></td>" +
        "<td style='font-size:12px;color:#374151;'>" + a.target + "</td>" +
        "<td><span style='color:#15803D;font-size:12px;font-weight:600;'>● " + a.result + "</span></td>" +
      "</tr>";
    }
    return html;
  }

  function buildPolicyRows() {
    var html = "";
    for (var i = 0; i < POLICIES.length; i++) {
      var p = POLICIES[i];
      var active = p.status === "활성";
      html += "<tr>" +
        "<td style='font-size:11px;color:#9CA3AF;'>" + p.id + "</td>" +
        "<td style='font-weight:500;'>" + p.name + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + p.desc + "</td>" +
        "<td style='text-align:center;'>" +
          "<div style='display:flex;align-items:center;justify-content:center;'>" +
            "<span style='display:inline-block;width:36px;height:20px;background:" + (active ? "#16A34A" : "#9CA3AF") + ";border-radius:10px;position:relative;cursor:pointer;'>" +
              "<span style='position:absolute;top:3px;" + (active ? "right:3px" : "left:3px") + ";width:14px;height:14px;background:#fff;border-radius:50%;'></span>" +
            "</span>" +
          "</div>" +
        "</td>" +
        "<td style='text-align:center;font-size:13px;" + (p.triggered > 0 ? "font-weight:600;color:#DC2626;" : "color:#9CA3AF;") + "'>" + p.triggered + "회</td>" +
        "<td><button onclick=\"alert('정책을 편집합니다.')\" style='padding:3px 10px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>편집</button></td>" +
      "</tr>";
    }
    return html;
  }

  el.innerHTML =
    "<div class='asis-page'>" +
      // 헤더
      "<div style='margin-bottom:24px;'>" +
        "<h2 style='font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;'>거버넌스</h2>" +
        "<p style='font-size:14px;color:#6B7280;margin:0;'>AI 에이전트 사용 정책·역할 권한·감사 로그를 관리합니다.</p>" +
      "</div>" +
      // KPI 행
      "<div class='asis-kpi-row' style='margin-bottom:24px;'>" +
        "<div class='asis-kpi-card accent-blue'><div class='asis-kpi-label'>등록 사용자</div><div class='asis-kpi-value'>28명</div><div class='asis-kpi-sub'>3개 역할 그룹</div></div>" +
        "<div class='asis-kpi-card accent-green'><div class='asis-kpi-label'>활성 정책</div><div class='asis-kpi-value'>4건</div><div class='asis-kpi-sub'>가드레일 5건 중</div></div>" +
        "<div class='asis-kpi-card accent-orange'><div class='asis-kpi-label'>이번 달 트리거</div><div class='asis-kpi-value'>16회</div><div class='asis-kpi-sub'>가드레일 작동 합계</div></div>" +
        "<div class='asis-kpi-card accent-red'><div class='asis-kpi-label'>감사 로그</div><div class='asis-kpi-value'>247건</div><div class='asis-kpi-sub'>이번 달 전체 이력</div></div>" +
      "</div>" +
      // 역할·권한 매트릭스
      "<div class='asis-panel' style='margin-bottom:24px;'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>역할·권한 매트릭스</div>" +
          "<button onclick=\"alert('역할을 편집합니다.')\" style='padding:6px 14px;background:#3B82F6;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;'>역할 관리</button>" +
        "</div>" +
        // 역할 설명 카드
        "<div style='display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;'>" +
          "<div style='padding:12px 14px;background:#EFF6FF;border-radius:8px;border-left:3px solid #3B82F6;'>" +
            "<div style='font-size:13px;font-weight:700;color:#1D4ED8;margin-bottom:4px;'>현업담당자</div>" +
            "<div style='font-size:12px;color:#6B7280;'>자산관리 업무 담당자. AI 질의·알림 수신·보고서 열람 가능.</div>" +
            "<div style='font-size:12px;color:#3B82F6;margin-top:6px;font-weight:600;'>18명</div>" +
          "</div>" +
          "<div style='padding:12px 14px;background:#F0FDF4;border-radius:8px;border-left:3px solid #16A34A;'>" +
            "<div style='font-size:13px;font-weight:700;color:#15803D;margin-bottom:4px;'>AI 운영자</div>" +
            "<div style='font-size:12px;color:#6B7280;'>AI 에이전트 운영·결재 처리·빌더 편집·지식베이스 관리 가능.</div>" +
            "<div style='font-size:12px;color:#16A34A;margin-top:6px;font-weight:600;'>8명</div>" +
          "</div>" +
          "<div style='padding:12px 14px;background:#FDF4FF;border-radius:8px;border-left:3px solid #9333EA;'>" +
            "<div style='font-size:13px;font-weight:700;color:#7C3AED;margin-bottom:4px;'>관리자·감사</div>" +
            "<div style='font-size:12px;color:#6B7280;'>전체 권한 + 역할 관리 + 감사 로그 조회. 거버넌스 총괄.</div>" +
            "<div style='font-size:12px;color:#9333EA;margin-top:6px;font-weight:600;'>2명</div>" +
          "</div>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" + buildPermMatrix() + "</div>" +
      "</div>" +
      // 가드레일 정책
      "<div class='asis-panel' style='margin-bottom:24px;'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>가드레일 정책</div>" +
          "<button onclick=\"alert('새 정책을 추가합니다.')\" style='padding:6px 14px;background:#7C3AED;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;'>+ 정책 추가</button>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>ID</th><th>정책명</th><th>설명</th><th>활성화</th><th>트리거 횟수</th><th>관리</th></tr></thead>" +
            "<tbody>" + buildPolicyRows() + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
      // 감사 로그
      "<div class='asis-panel'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>감사 로그</div>" +
          "<div style='display:flex;gap:8px;'>" +
            "<input type='text' placeholder='사용자·액션 검색…' style='padding:5px 10px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;width:160px;'>" +
            "<select style='padding:5px 10px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;'><option>전체 역할</option><option>현업담당자</option><option>AI 운영자</option><option>관리자·감사</option></select>" +
            "<button onclick=\"alert('감사 로그를 내보냅니다.')\" style='padding:5px 12px;border:1px solid #E2E8F0;border-radius:6px;background:#F8FAFC;font-size:12px;cursor:pointer;'>📥 내보내기</button>" +
          "</div>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>일시</th><th>사용자</th><th>액션</th><th>대상</th><th>결과</th></tr></thead>" +
            "<tbody>" + buildAuditRows() + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
    "</div>";
};
