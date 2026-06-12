// ===== 평가·품질 화면 =====
window.renderAiphEval = function () {
  var el = document.getElementById("view-aiph-eval");
  if (!el) return;

  // ===== 데이터 =====
  var AGENTS = [
    { name: "자동리포트 에이전트", accuracy: 96, faithfulness: 98, relevance: 94, latency: "1.2s", tests: 42, passed: 41, grade: "A" },
    { name: "이상탐지 에이전트",   accuracy: 91, faithfulness: 93, relevance: 89, latency: "0.8s", tests: 38, passed: 35, grade: "B+" },
    { name: "현황분석 에이전트",   accuracy: 88, faithfulness: 90, relevance: 87, latency: "2.1s", tests: 30, passed: 26, grade: "B" },
    { name: "예산분석 에이전트",   accuracy: 94, faithfulness: 95, relevance: 92, latency: "1.6s", tests: 25, passed: 24, grade: "A-" },
    { name: "자산이동 에이전트",   accuracy: 85, faithfulness: 88, relevance: 83, latency: "1.9s", tests: 20, passed: 17, grade: "B-" }
  ];

  var TEST_CASES = [
    { id: "TC-001", agent: "자동리포트 에이전트", scenario: "서울 본사 6월 자산현황 요약 요청", expected: "자산 총계·부서별 분포 포함 요약", result: "pass", score: 97, run: "06-12 09:00" },
    { id: "TC-002", agent: "이상탐지 에이전트",   scenario: "내용연수 초과 자산 탐지",           expected: "6년 이상 PC 12대 식별",           result: "pass", score: 93, run: "06-12 09:00" },
    { id: "TC-003", agent: "현황분석 에이전트",   scenario: "미파악 자산 원인 분석",             expected: "부서·담당자 특정 및 실사 지시",   result: "fail", score: 71, run: "06-12 09:00" },
    { id: "TC-004", agent: "예산분석 에이전트",   scenario: "Q3 IT 자산 취득 예산 타당성 검토", expected: "전분기 대비 증감·우선순위 분석",   result: "pass", score: 95, run: "06-11 18:00" },
    { id: "TC-005", agent: "자동리포트 에이전트", scenario: "이상 자산 요약 포함 주간 리포트",   expected: "이상 항목 하이라이트 포함",         result: "pass", score: 98, run: "06-11 09:00" },
    { id: "TC-006", agent: "자산이동 에이전트",   scenario: "대전→광주 이전 비용·일정 분석",    expected: "물류 비용 견적 및 일정 제안",       result: "warn", score: 82, run: "06-10 14:00" },
    { id: "TC-007", agent: "이상탐지 에이전트",   scenario: "보험 만료 임박 자산 목록 추출",     expected: "D-7 이내 보험 만료 자산 전체",     result: "pass", score: 91, run: "06-10 09:00" },
    { id: "TC-008", agent: "현황분석 에이전트",   scenario: "감가상각 완료 자산 처리 방안 제안", expected: "폐기·매각·재활용 옵션 비교",         result: "fail", score: 68, run: "06-09 15:00" }
  ];

  var GRADE_COLOR = { "A": "#15803D", "A-": "#16A34A", "B+": "#2563EB", "B": "#3B82F6", "B-": "#D97706" };
  var GRADE_BG =    { "A": "#F0FDF4", "A-": "#F0FDF4", "B+": "#EFF6FF", "B": "#EFF6FF", "B-": "#FFFBEB" };
  var RESULT_CONF = { "pass": "#F0FDF4|#15803D|✅ 통과", "fail": "#FEF2F2|#DC2626|❌ 실패", "warn": "#FFFBEB|#B45309|⚠ 주의" };

  function chip(text, bg, color) {
    return "<span style='display:inline-block;padding:2px 9px;background:" + bg + ";color:" + color + ";border-radius:12px;font-size:11px;font-weight:600;'>" + text + "</span>";
  }
  function scoreBar(v) {
    var c = v >= 90 ? "#16A34A" : v >= 80 ? "#2563EB" : "#DC2626";
    return "<div style='display:flex;align-items:center;gap:6px;'>" +
      "<div style='flex:1;height:6px;background:#F1F5F9;border-radius:3px;overflow:hidden;'>" +
        "<div style='width:" + v + "%;height:100%;background:" + c + ";border-radius:3px;'></div>" +
      "</div>" +
      "<span style='font-size:12px;font-weight:600;color:" + c + ";min-width:28px;'>" + v + "</span>" +
    "</div>";
  }

  function buildAgentRows() {
    var html = "";
    for (var i = 0; i < AGENTS.length; i++) {
      var a = AGENTS[i];
      var passRate = Math.round(a.passed / a.tests * 100);
      html += "<tr>" +
        "<td style='font-weight:500;'>" + a.name + "</td>" +
        "<td>" + scoreBar(a.accuracy) + "</td>" +
        "<td>" + scoreBar(a.faithfulness) + "</td>" +
        "<td>" + scoreBar(a.relevance) + "</td>" +
        "<td style='text-align:center;color:#6B7280;font-size:13px;'>" + a.latency + "</td>" +
        "<td style='text-align:center;font-size:13px;'><span style='color:#15803D;font-weight:600;'>" + a.passed + "</span>/" + a.tests + " <span style='font-size:11px;color:#9CA3AF;'>(" + passRate + "%)</span></td>" +
        "<td style='text-align:center;'><span style='display:inline-block;padding:3px 12px;background:" + (GRADE_BG[a.grade]||"#F1F5F9") + ";color:" + (GRADE_COLOR[a.grade]||"#374151") + ";border-radius:8px;font-size:14px;font-weight:700;'>" + a.grade + "</span></td>" +
        "<td><button onclick=\"alert('테스트를 재실행합니다.')\" style='padding:3px 10px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>재실행</button></td>" +
      "</tr>";
    }
    return html;
  }

  function buildTestRows() {
    var html = "";
    for (var i = 0; i < TEST_CASES.length; i++) {
      var t = TEST_CASES[i];
      var rc = (RESULT_CONF[t.result] || "#F1F5F9|#374151|—").split("|");
      html += "<tr" + (t.result === "fail" ? " style='background:#FFF8F8;'" : "") + ">" +
        "<td style='font-size:11px;color:#9CA3AF;'>" + t.id + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + t.agent + "</td>" +
        "<td>" + t.scenario + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + t.expected + "</td>" +
        "<td>" + chip(rc[2], rc[0], rc[1]) + "</td>" +
        "<td>" + scoreBar(t.score) + "</td>" +
        "<td style='font-size:11px;color:#9CA3AF;'>" + t.run + "</td>" +
        "<td><button onclick=\"alert('테스트 상세 로그를 봅니다.')\" style='padding:3px 10px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>로그</button></td>" +
      "</tr>";
    }
    return html;
  }

  // ===== 레이더 차트 (Chart.js radar) =====
  var RADAR_LABELS = ["정확도", "충실도", "관련성", "응답속도", "일관성"];

  el.innerHTML =
    "<div class='asis-page'>" +
      // 헤더
      "<div style='margin-bottom:24px;'>" +
        "<h2 style='font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;'>평가·품질</h2>" +
        "<p style='font-size:14px;color:#6B7280;margin:0;'>AI 에이전트의 응답 품질을 지속적으로 측정하고 개선합니다.</p>" +
      "</div>" +
      // KPI 행
      "<div class='asis-kpi-row' style='margin-bottom:24px;'>" +
        "<div class='asis-kpi-card accent-green'><div class='asis-kpi-label'>평균 정확도</div><div class='asis-kpi-value'>91%</div><div class='asis-kpi-sub'>전주 대비 +2.1%p</div></div>" +
        "<div class='asis-kpi-card accent-blue'><div class='asis-kpi-label'>테스트 통과율</div><div class='asis-kpi-value'>87.6%</div><div class='asis-kpi-sub'>155건 중 136건 통과</div></div>" +
        "<div class='asis-kpi-card accent-orange'><div class='asis-kpi-label'>주의 항목</div><div class='asis-kpi-value'>12건</div><div class='asis-kpi-sub'>점수 80 미만</div></div>" +
        "<div class='asis-kpi-card accent-red'><div class='asis-kpi-label'>실패 항목</div><div class='asis-kpi-value'>7건</div><div class='asis-kpi-sub'>즉시 개선 필요</div></div>" +
      "</div>" +
      // 2열: 레이더 차트 + 에이전트 등급
      "<div style='display:flex;gap:20px;margin-bottom:24px;align-items:flex-start;'>" +
        "<div class='asis-panel' style='flex:1;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;margin-bottom:14px;'>에이전트별 품질 레이더</div>" +
          "<canvas id='eval-radar-chart' style='max-height:280px;'></canvas>" +
        "</div>" +
        "<div class='asis-panel' style='width:300px;flex-shrink:0;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;margin-bottom:14px;'>평가 기준 안내</div>" +
          "<div style='display:flex;flex-direction:column;gap:10px;font-size:13px;'>" +
            "<div style='padding:10px 12px;background:#F0FDF4;border-radius:8px;border-left:3px solid #16A34A;'><div style='font-weight:600;color:#15803D;margin-bottom:3px;'>정확도 (Accuracy)</div><div style='color:#6B7280;'>AI 응답이 실제 자산 데이터와 일치하는 비율</div></div>" +
            "<div style='padding:10px 12px;background:#EFF6FF;border-radius:8px;border-left:3px solid #3B82F6;'><div style='font-weight:600;color:#1D4ED8;margin-bottom:3px;'>충실도 (Faithfulness)</div><div style='color:#6B7280;'>지식베이스·출처 문서를 벗어나지 않는 정도</div></div>" +
            "<div style='padding:10px 12px;background:#FDF4FF;border-radius:8px;border-left:3px solid #9333EA;'><div style='font-weight:600;color:#7C3AED;margin-bottom:3px;'>관련성 (Relevance)</div><div style='color:#6B7280;'>질문 의도에 맞는 답변을 제공하는 정도</div></div>" +
            "<div style='padding:10px 12px;background:#FFF7ED;border-radius:8px;border-left:3px solid #EA580C;'><div style='font-weight:600;color:#C2410C;margin-bottom:3px;'>종합 등급 기준</div><div style='color:#6B7280;'>A: 95+ · A-: 90+ · B+: 85+ · B: 80+ · B-: 70+</div></div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      // 에이전트별 성적표
      "<div class='asis-panel' style='margin-bottom:24px;'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>에이전트별 성적표</div>" +
          "<button onclick=\"alert('전체 테스트를 재실행합니다.')\" style='padding:6px 14px;background:#3B82F6;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;'>▶ 전체 테스트 실행</button>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>에이전트</th><th>정확도</th><th>충실도</th><th>관련성</th><th>응답속도</th><th>통과/전체</th><th>등급</th><th>관리</th></tr></thead>" +
            "<tbody>" + buildAgentRows() + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
      // 테스트 케이스 목록
      "<div class='asis-panel'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>테스트 케이스 이력</div>" +
          "<div style='display:flex;gap:8px;'>" +
            "<select style='padding:5px 10px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;'><option>전체 결과</option><option>통과</option><option>실패</option><option>주의</option></select>" +
            "<button onclick=\"alert('테스트 케이스를 추가합니다.')\" style='padding:5px 12px;background:#7C3AED;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;'>+ 케이스 추가</button>" +
          "</div>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>ID</th><th>에이전트</th><th>테스트 시나리오</th><th>기대 결과</th><th>판정</th><th>점수</th><th>실행 시각</th><th>로그</th></tr></thead>" +
            "<tbody>" + buildTestRows() + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
    "</div>";

  // ===== Chart.js 레이더 차트 =====
  var canvas = document.getElementById("eval-radar-chart");
  if (canvas && window.Chart) {
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas, {
      type: "radar",
      data: {
        labels: RADAR_LABELS,
        datasets: [
          { label: "자동리포트", data: [96, 98, 94, 88, 95], borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.1)", pointBackgroundColor: "#3B82F6" },
          { label: "이상탐지",   data: [91, 93, 89, 92, 90], borderColor: "#16A34A", backgroundColor: "rgba(22,163,74,0.1)",  pointBackgroundColor: "#16A34A" },
          { label: "현황분석",   data: [88, 90, 87, 80, 85], borderColor: "#EA580C", backgroundColor: "rgba(234,88,12,0.1)",  pointBackgroundColor: "#EA580C" }
        ]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 60, max: 100,
            ticks: { stepSize: 10, font: { size: 11 } },
            pointLabels: { font: { size: 12 } },
            grid: { color: "#F1F5F9" }
          }
        },
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 12 } } },
          tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ": " + ctx.parsed.r; } } }
        }
      }
    });
  }
};
