// ===== 자동 리포트 화면 =====
window.renderAiphReport = function () {
  var el = document.getElementById("view-aiph-report");
  if (!el) return;

  // ===== 데이터 =====
  var REPORTS = [
    { id: "RPT-2026-060", name: "자산현황 일일보고 (6월 12일)", type: "일일", status: "발송완료", agent: "자동리포트 에이전트", recipients: 12, generated: "06-12 09:00", sent: "06-12 09:02", size: "1.8MB" },
    { id: "RPT-2026-059", name: "이상탐지 주간 요약 (6월 2주)", type: "주간", status: "발송완료", agent: "이상탐지 에이전트", recipients: 7, generated: "06-10 18:00", sent: "06-10 18:03", size: "2.4MB" },
    { id: "RPT-2026-058", name: "자산현황 일일보고 (6월 11일)", type: "일일", status: "발송완료", agent: "자동리포트 에이전트", recipients: 12, generated: "06-11 09:00", sent: "06-11 09:02", size: "1.7MB" },
    { id: "RPT-2026-057", name: "월간 자산 종합보고서 (5월)", type: "월간", status: "결재대기", agent: "자동리포트 에이전트", recipients: 18, generated: "06-01 08:00", sent: "—", size: "5.2MB" },
    { id: "RPT-2026-056", name: "노후 자산 위험 분석 보고서", type: "수시", status: "발송완료", agent: "현황분석 에이전트", recipients: 5, generated: "05-30 14:22", sent: "05-30 14:25", size: "3.1MB" },
    { id: "RPT-2026-055", name: "자산현황 일일보고 (6월 10일)", type: "일일", status: "발송완료", agent: "자동리포트 에이전트", recipients: 12, generated: "06-10 09:00", sent: "06-10 09:01", size: "1.9MB" },
    { id: "RPT-2026-054", name: "취득 예산 집행 현황 (Q2)", type: "수시", status: "발송완료", agent: "예산분석 에이전트", recipients: 9, generated: "06-07 11:00", sent: "06-07 11:04", size: "2.8MB" },
    { id: "RPT-2026-053", name: "이상탐지 주간 요약 (6월 1주)", type: "주간", status: "발송완료", agent: "이상탐지 에이전트", recipients: 7, generated: "06-03 18:00", sent: "06-03 18:02", size: "2.2MB" }
  ];

  var SCHEDULES = [
    { name: "자산현황 일일보고", cycle: "매일 09:00", agent: "자동리포트 에이전트", recipients: 12, active: true, next: "내일 09:00" },
    { name: "이상탐지 주간 요약", cycle: "매주 월요일 18:00", agent: "이상탐지 에이전트", recipients: 7, active: true, next: "06-16 18:00" },
    { name: "월간 자산 종합보고서", cycle: "매월 1일 08:00", agent: "자동리포트 에이전트", recipients: 18, active: true, next: "07-01 08:00" },
    { name: "분기별 예산 집행 현황", cycle: "분기 말 11:00", agent: "예산분석 에이전트", recipients: 9, active: true, next: "2026-06-30" },
    { name: "노후 자산 긴급 알림", cycle: "조건 트리거", agent: "현황분석 에이전트", recipients: 5, active: false, next: "이상 탐지 시" }
  ];

  var TYPE_COLOR = { "일일": "#EFF6FF|#1D4ED8", "주간": "#F0FDF4|#15803D", "월간": "#FDF4FF|#7C3AED", "수시": "#FFF7ED|#C2410C" };
  var STATUS_COLOR = { "발송완료": "#F0FDF4|#15803D", "결재대기": "#FFFBEB|#B45309", "오류": "#FEF2F2|#DC2626" };

  function chipStyle(map, key) {
    var p = (map[key] || "#F1F5F9|#374151").split("|");
    return "display:inline-block;padding:2px 10px;background:" + p[0] + ";color:" + p[1] + ";border-radius:12px;font-size:11px;font-weight:600;";
  }

  function buildReportRows() {
    var html = "";
    for (var i = 0; i < REPORTS.length; i++) {
      var r = REPORTS[i];
      html += "<tr>" +
        "<td style='font-size:12px;color:#6B7280;'>" + r.id + "</td>" +
        "<td style='font-weight:500;'>" + r.name + "</td>" +
        "<td><span style='" + chipStyle(TYPE_COLOR, r.type) + "'>" + r.type + "</span></td>" +
        "<td><span style='" + chipStyle(STATUS_COLOR, r.status) + "'>" + r.status + "</span></td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + r.agent + "</td>" +
        "<td style='text-align:center;'>" + r.recipients + "명</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + r.generated + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + r.sent + "</td>" +
        "<td><button onclick=\"alert('보고서를 다운로드합니다.')\" style='padding:3px 10px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>📄 보기</button></td>" +
        "</tr>";
    }
    return html;
  }

  function buildScheduleRows() {
    var html = "";
    for (var i = 0; i < SCHEDULES.length; i++) {
      var s = SCHEDULES[i];
      var toggleBg = s.active ? "#16A34A" : "#9CA3AF";
      html += "<tr>" +
        "<td style='font-weight:500;'>" + s.name + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + s.cycle + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + s.agent + "</td>" +
        "<td style='text-align:center;'>" + s.recipients + "명</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + s.next + "</td>" +
        "<td style='text-align:center;'><span style='display:inline-block;width:36px;height:20px;background:" + toggleBg + ";border-radius:10px;position:relative;cursor:pointer;'><span style='position:absolute;top:3px;" + (s.active ? "right:3px" : "left:3px") + ";width:14px;height:14px;background:#fff;border-radius:50%;'></span></span></td>" +
        "<td><button onclick=\"alert('스케줄 설정을 수정합니다.')\" style='padding:3px 10px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>설정</button></td>" +
        "</tr>";
    }
    return html;
  }

  // ===== Chart.js 월별 발송 건수 바 차트 =====
  var MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월(진행)"];
  var MONTHLY_CNT = [42, 38, 45, 51, 60, 27];

  el.innerHTML =
    "<div class='asis-page'>" +
      // 헤더
      "<div style='margin-bottom:24px;'>" +
        "<h2 style='font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;'>자동 리포트</h2>" +
        "<p style='font-size:14px;color:#6B7280;margin:0;'>AI 에이전트가 자동 생성·발송하는 보고서를 관리합니다.</p>" +
      "</div>" +
      // KPI 행
      "<div class='asis-kpi-row' style='margin-bottom:24px;'>" +
        "<div class='asis-kpi-card accent-blue'><div class='asis-kpi-label'>이번 달 발송</div><div class='asis-kpi-value'>27건</div><div class='asis-kpi-sub'>전월 60건 대비 진행 중</div></div>" +
        "<div class='asis-kpi-card accent-green'><div class='asis-kpi-label'>발송 성공률</div><div class='asis-kpi-value'>99.4%</div><div class='asis-kpi-sub'>최근 3개월 평균</div></div>" +
        "<div class='asis-kpi-card accent-orange'><div class='asis-kpi-label'>결재 대기</div><div class='asis-kpi-value'>1건</div><div class='asis-kpi-sub'>월간 종합보고서</div></div>" +
        "<div class='asis-kpi-card accent-red'><div class='asis-kpi-label'>오류 발생</div><div class='asis-kpi-value'>0건</div><div class='asis-kpi-sub'>이번 달 오류 없음</div></div>" +
      "</div>" +
      // 2열: 차트 + 스케줄 현황
      "<div style='display:flex;gap:20px;margin-bottom:24px;align-items:flex-start;'>" +
        // 월별 발송 추이 차트
        "<div class='asis-panel' style='flex:1;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;margin-bottom:14px;'>월별 리포트 발송 추이</div>" +
          "<canvas id='report-monthly-chart' style='max-height:200px;'></canvas>" +
        "</div>" +
        // 유형별 현황
        "<div class='asis-panel' style='width:260px;flex-shrink:0;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;margin-bottom:14px;'>유형별 현황</div>" +
          "<div style='display:flex;flex-direction:column;gap:10px;'>" +
            "<div style='display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#EFF6FF;border-radius:8px;'><span style='font-size:13px;font-weight:600;color:#1D4ED8;'>일일</span><span style='font-size:18px;font-weight:700;color:#1D4ED8;'>15건</span></div>" +
            "<div style='display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#F0FDF4;border-radius:8px;'><span style='font-size:13px;font-weight:600;color:#15803D;'>주간</span><span style='font-size:18px;font-weight:700;color:#15803D;'>6건</span></div>" +
            "<div style='display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#FDF4FF;border-radius:8px;'><span style='font-size:13px;font-weight:600;color:#7C3AED;'>월간</span><span style='font-size:18px;font-weight:700;color:#7C3AED;'>1건</span></div>" +
            "<div style='display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#FFF7ED;border-radius:8px;'><span style='font-size:13px;font-weight:600;color:#C2410C;'>수시</span><span style='font-size:18px;font-weight:700;color:#C2410C;'>5건</span></div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      // 스케줄 설정
      "<div class='asis-panel' style='margin-bottom:24px;'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>발송 스케줄 설정</div>" +
          "<button onclick=\"alert('새 스케줄을 추가합니다.')\" style='padding:6px 14px;background:#3B82F6;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;'>+ 새 스케줄</button>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>보고서명</th><th>주기</th><th>담당 에이전트</th><th>수신자</th><th>다음 발송</th><th>활성화</th><th>관리</th></tr></thead>" +
            "<tbody>" + buildScheduleRows() + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
      // 발송 이력
      "<div class='asis-panel'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
          "<div style='font-size:15px;font-weight:700;color:#111827;'>발송 이력</div>" +
          "<div style='display:flex;gap:8px;'>" +
            "<select style='padding:5px 10px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;'><option>전체 유형</option><option>일일</option><option>주간</option><option>월간</option><option>수시</option></select>" +
            "<button onclick=\"alert('CSV로 내보냅니다.')\" style='padding:5px 12px;border:1px solid #E2E8F0;border-radius:6px;background:#F8FAFC;font-size:12px;cursor:pointer;'>📥 내보내기</button>" +
          "</div>" +
        "</div>" +
        "<div style='overflow-x:auto;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>보고서 ID</th><th>보고서명</th><th>유형</th><th>상태</th><th>에이전트</th><th>수신자</th><th>생성시각</th><th>발송시각</th><th>열기</th></tr></thead>" +
            "<tbody>" + buildReportRows() + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
    "</div>";

  // ===== Chart.js 바 차트 =====
  var canvas = document.getElementById("report-monthly-chart");
  if (canvas && window.Chart) {
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas, {
      type: "bar",
      data: {
        labels: MONTHS,
        datasets: [{
          label: "발송 건수",
          data: MONTHLY_CNT,
          backgroundColor: ["#93C5FD","#93C5FD","#93C5FD","#93C5FD","#93C5FD","#3B82F6"],
          borderRadius: 5,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ctx.parsed.y + "건"; } } } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 10 }, grid: { color: "#F1F5F9" } },
          x: { grid: { display: false } }
        }
      }
    });
  }
};
