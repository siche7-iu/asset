// ===== 지식베이스 화면 =====
window.renderAiphKb = function () {
  var el = document.getElementById("view-aiph-kb");
  if (!el) return;

  // ===== 데이터 =====
  var CATEGORIES = ["전체", "자산관리 정책", "회계·감가상각", "법령·기준", "운용 절차", "AI 프롬프트"];

  var DOCS = [
    { id: "KB-POL-001", title: "고정자산 관리 내규 v3.2", cat: "자산관리 정책", size: "1.2MB", format: "PDF", updated: "2026-03-15", used: 142, status: "최신", tags: ["취득","폐기","이전"] },
    { id: "KB-ACC-001", title: "감가상각 산정 기준표 (2026년)", cat: "회계·감가상각", size: "0.4MB", format: "XLSX", updated: "2026-01-01", used: 89, status: "최신", tags: ["감가상각","내용연수"] },
    { id: "KB-LAW-001", title: "공유재산 및 물품 관리법 전문", cat: "법령·기준", size: "0.9MB", format: "PDF", updated: "2025-11-01", used: 56, status: "최신", tags: ["법령","공유재산"] },
    { id: "KB-POL-002", title: "자산 실사 지침 (2026년 개정)", cat: "자산관리 정책", size: "0.6MB", format: "PDF", updated: "2026-02-10", used: 73, status: "최신", tags: ["실사","점검"] },
    { id: "KB-PRO-001", title: "자산 취득 업무 처리 절차서", cat: "운용 절차", size: "0.8MB", format: "DOCX", updated: "2025-09-20", used: 61, status: "갱신필요", tags: ["취득","절차"] },
    { id: "KB-AI-001", title: "자산현황 일일보고 시스템 프롬프트", cat: "AI 프롬프트", size: "0.1MB", format: "TXT", updated: "2026-05-01", used: 312, status: "최신", tags: ["AI","보고서"] },
    { id: "KB-ACC-002", title: "취득원가 산정 기준 (부대비용 포함)", cat: "회계·감가상각", size: "0.3MB", format: "PDF", updated: "2025-12-15", used: 44, status: "최신", tags: ["취득원가","회계"] },
    { id: "KB-AI-002", title: "이상탐지 판단 기준 프롬프트 v2", cat: "AI 프롬프트", size: "0.1MB", format: "TXT", updated: "2026-04-20", used: 278, status: "최신", tags: ["AI","이상탐지"] },
    { id: "KB-PRO-002", title: "자산 폐기 승인 처리 절차서", cat: "운용 절차", size: "0.5MB", format: "DOCX", updated: "2025-08-01", used: 38, status: "갱신필요", tags: ["폐기","절차"] },
    { id: "KB-LAW-002", title: "국유재산법 시행령", cat: "법령·기준", size: "1.1MB", format: "PDF", updated: "2025-06-01", used: 29, status: "최신", tags: ["법령","국유재산"] }
  ];

  var FORMAT_ICON = { "PDF": "📄", "XLSX": "📊", "DOCX": "📝", "TXT": "📋" };
  var STATUS_STYLE = { "최신": "background:#F0FDF4;color:#15803D;", "갱신필요": "background:#FFFBEB;color:#B45309;" };

  function buildDocRows(filterCat) {
    var html = "";
    for (var i = 0; i < DOCS.length; i++) {
      var d = DOCS[i];
      if (filterCat && filterCat !== "전체" && d.cat !== filterCat) continue;
      var tagHtml = "";
      for (var t = 0; t < d.tags.length; t++) {
        tagHtml += "<span style='display:inline-block;padding:1px 7px;background:#F1F5F9;border-radius:10px;font-size:11px;color:#6B7280;margin:0 2px;'>#" + d.tags[t] + "</span>";
      }
      html += "<tr>" +
        "<td style='font-size:11px;color:#9CA3AF;'>" + d.id + "</td>" +
        "<td>" +
          "<div style='font-weight:500;margin-bottom:3px;'>" + FORMAT_ICON[d.format] + " " + d.title + "</div>" +
          "<div>" + tagHtml + "</div>" +
        "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + d.cat + "</td>" +
        "<td style='font-size:12px;text-align:center;'>" + d.format + "</td>" +
        "<td style='font-size:12px;color:#6B7280;text-align:center;'>" + d.size + "</td>" +
        "<td style='font-size:12px;color:#6B7280;'>" + d.updated + "</td>" +
        "<td style='text-align:center;font-size:13px;font-weight:600;color:#3B82F6;'>" + d.used + "</td>" +
        "<td><span style='display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:600;" + (STATUS_STYLE[d.status] || "") + "'>" + d.status + "</span></td>" +
        "<td>" +
          "<button onclick=\"alert('문서를 미리봅니다.')\" style='padding:3px 8px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;margin-right:4px;'>보기</button>" +
          "<button onclick=\"alert('문서를 갱신합니다.')\" style='padding:3px 8px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>갱신</button>" +
        "</td>" +
      "</tr>";
    }
    return html;
  }

  var activeCat = "전체";

  function buildCatTabs() {
    var html = "";
    for (var i = 0; i < CATEGORIES.length; i++) {
      html += "<button class='asis-tab kb-cat-tab" + (CATEGORIES[i] === activeCat ? " active" : "") + "' data-cat='" + CATEGORIES[i] + "'>" + CATEGORIES[i] + "</button>";
    }
    return html;
  }

  el.innerHTML =
    "<div class='asis-page'>" +
      // 헤더
      "<div style='margin-bottom:24px;'>" +
        "<h2 style='font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;'>지식베이스</h2>" +
        "<p style='font-size:14px;color:#6B7280;margin:0;'>AI 에이전트가 참조하는 문서·정책·기준·프롬프트를 관리합니다.</p>" +
      "</div>" +
      // KPI 행
      "<div class='asis-kpi-row' style='margin-bottom:24px;'>" +
        "<div class='asis-kpi-card accent-blue'><div class='asis-kpi-label'>전체 문서</div><div class='asis-kpi-value'>10건</div><div class='asis-kpi-sub'>5개 카테고리</div></div>" +
        "<div class='asis-kpi-card accent-green'><div class='asis-kpi-label'>이번 달 조회</div><div class='asis-kpi-value'>1,082회</div><div class='asis-kpi-sub'>전월 대비 +23%</div></div>" +
        "<div class='asis-kpi-card accent-orange'><div class='asis-kpi-label'>갱신 필요</div><div class='asis-kpi-value'>2건</div><div class='asis-kpi-sub'>6개월 이상 미갱신</div></div>" +
        "<div class='asis-kpi-card accent-red'><div class='asis-kpi-label'>AI 프롬프트</div><div class='asis-kpi-value'>2건</div><div class='asis-kpi-sub'>평균 참조 295회</div></div>" +
      "</div>" +
      // 상단: 검색 + 업로드
      "<div class='asis-panel' style='margin-bottom:20px;'>" +
        "<div style='display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 16px;'>" +
          "<input id='kb-search' type='text' placeholder='문서명, 태그로 검색…' style='flex:1;min-width:200px;padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;font-size:13px;'>" +
          "<select id='kb-format-filter' style='padding:8px 10px;border:1px solid #E2E8F0;border-radius:8px;font-size:13px;'><option value=''>전체 형식</option><option>PDF</option><option>XLSX</option><option>DOCX</option><option>TXT</option></select>" +
          "<button onclick=\"alert('문서 업로드 기능을 엽니다. (시연 프로토타입)')\" style='padding:8px 16px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;'>📤 문서 업로드</button>" +
          "<button onclick=\"alert('AI 프롬프트 편집기를 엽니다.')\" style='padding:8px 16px;background:#7C3AED;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;'>🤖 프롬프트 편집</button>" +
        "</div>" +
      "</div>" +
      // 카테고리 탭 + 문서 목록
      "<div class='asis-panel'>" +
        "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding:14px 16px 0;'>" +
          "<div class='asis-tabs' id='kb-cat-tabs'>" + buildCatTabs() + "</div>" +
          "<span style='font-size:12px;color:#9CA3AF;' id='kb-doc-count'>전체 10건</span>" +
        "</div>" +
        "<div style='overflow-x:auto;padding:0 16px 14px;'>" +
          "<table class='asis-table' id='kb-doc-table'>" +
            "<thead><tr><th>ID</th><th>문서명 / 태그</th><th>카테고리</th><th>형식</th><th>크기</th><th>최종 갱신</th><th>AI 참조 수</th><th>상태</th><th>관리</th></tr></thead>" +
            "<tbody id='kb-doc-tbody'>" + buildDocRows("전체") + "</tbody>" +
          "</table>" +
        "</div>" +
      "</div>" +
      // 하단: 벡터 임베딩 현황
      "<div class='asis-panel' style='margin-top:20px;'>" +
        "<div style='padding:16px 16px 0;'>" +
        "<div style='font-size:15px;font-weight:700;color:#111827;margin-bottom:14px;'>RAG 임베딩 현황</div>" +
        "<div style='display:grid;grid-template-columns:repeat(3,1fr);gap:14px;'>" +
          "<div style='background:#F8FAFC;border-radius:10px;padding:14px 16px;'>" +
            "<div style='font-size:12px;color:#6B7280;margin-bottom:6px;'>벡터 DB</div>" +
            "<div style='font-size:15px;font-weight:700;color:#111827;'>Pinecone</div>" +
            "<div style='font-size:12px;color:#6B7280;margin-top:4px;'>총 48,203 청크</div>" +
          "</div>" +
          "<div style='background:#F8FAFC;border-radius:10px;padding:14px 16px;'>" +
            "<div style='font-size:12px;color:#6B7280;margin-bottom:6px;'>임베딩 모델</div>" +
            "<div style='font-size:15px;font-weight:700;color:#111827;'>text-embedding-3-small</div>" +
            "<div style='font-size:12px;color:#6B7280;margin-top:4px;'>1536차원 · 비용 $0.02/1K</div>" +
          "</div>" +
          "<div style='background:#F8FAFC;border-radius:10px;padding:14px 16px;'>" +
            "<div style='font-size:12px;color:#6B7280;margin-bottom:6px;'>마지막 인덱싱</div>" +
            "<div style='font-size:15px;font-weight:700;color:#111827;'>2026-06-12 03:00</div>" +
            "<div style='font-size:12px;color:#16A34A;margin-top:4px;'>● 정상 완료</div>" +
          "</div>" +
        "</div>" +
        // 임베딩 상태 테이블
        "<div style='overflow-x:auto;margin-top:16px;padding-bottom:2px;'>" +
          "<table class='asis-table'>" +
            "<thead><tr><th>문서 ID</th><th>문서명</th><th>청크 수</th><th>인덱싱 일시</th><th>상태</th></tr></thead>" +
            "<tbody>" +
              "<tr><td style='font-size:11px;color:#9CA3AF;'>KB-AI-001</td><td>자산현황 일일보고 시스템 프롬프트</td><td>12청크</td><td>2026-06-12 03:00</td><td><span style='color:#15803D;font-size:12px;font-weight:600;'>● 완료</span></td></tr>" +
              "<tr><td style='font-size:11px;color:#9CA3AF;'>KB-POL-001</td><td>고정자산 관리 내규 v3.2</td><td>284청크</td><td>2026-06-12 03:00</td><td><span style='color:#15803D;font-size:12px;font-weight:600;'>● 완료</span></td></tr>" +
              "<tr><td style='font-size:11px;color:#9CA3AF;'>KB-LAW-001</td><td>공유재산 및 물품 관리법 전문</td><td>196청크</td><td>2026-06-12 03:00</td><td><span style='color:#15803D;font-size:12px;font-weight:600;'>● 완료</span></td></tr>" +
              "<tr><td style='font-size:11px;color:#9CA3AF;'>KB-PRO-001</td><td>자산 취득 업무 처리 절차서</td><td>87청크</td><td>2026-03-01 02:00</td><td><span style='color:#B45309;font-size:12px;font-weight:600;'>⚠ 갱신필요</span></td></tr>" +
            "</tbody>" +
          "</table>" +
        "</div>" +
        "</div>" +
      "</div>" +
    "</div>";

  // ===== 카테고리 탭 이벤트 =====
  var catTabs = el.querySelectorAll(".kb-cat-tab");
  for (var i = 0; i < catTabs.length; i++) {
    (function(tab) {
      tab.addEventListener("click", function() {
        activeCat = tab.getAttribute("data-cat");
        for (var j = 0; j < catTabs.length; j++) catTabs[j].classList.remove("active");
        tab.classList.add("active");
        var tbody = document.getElementById("kb-doc-tbody");
        if (tbody) tbody.innerHTML = buildDocRows(activeCat);
        var cnt = document.getElementById("kb-doc-count");
        if (cnt) {
          var n = el.querySelectorAll("#kb-doc-tbody tr").length;
          cnt.textContent = (activeCat === "전체" ? "전체 " : activeCat + " ") + n + "건";
        }
      });
    })(catTabs[i]);
  }

  // ===== 검색 이벤트 =====
  var searchInput = document.getElementById("kb-search");
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      var q = searchInput.value.toLowerCase();
      var tbody = document.getElementById("kb-doc-tbody");
      if (!tbody) return;
      var rows = "";
      for (var i = 0; i < DOCS.length; i++) {
        var d = DOCS[i];
        var match = d.title.toLowerCase().indexOf(q) >= 0 || d.tags.join(" ").toLowerCase().indexOf(q) >= 0;
        if (!q || match) {
          var tagHtml = "";
          for (var t = 0; t < d.tags.length; t++) {
            tagHtml += "<span style='display:inline-block;padding:1px 7px;background:#F1F5F9;border-radius:10px;font-size:11px;color:#6B7280;margin:0 2px;'>#" + d.tags[t] + "</span>";
          }
          var STATUS_STYLE_LOC = { "최신": "background:#F0FDF4;color:#15803D;", "갱신필요": "background:#FFFBEB;color:#B45309;" };
          rows += "<tr>" +
            "<td style='font-size:11px;color:#9CA3AF;'>" + d.id + "</td>" +
            "<td><div style='font-weight:500;margin-bottom:3px;'>" + (FORMAT_ICON[d.format] || "📄") + " " + d.title + "</div><div>" + tagHtml + "</div></td>" +
            "<td style='font-size:12px;color:#6B7280;'>" + d.cat + "</td>" +
            "<td style='font-size:12px;text-align:center;'>" + d.format + "</td>" +
            "<td style='font-size:12px;color:#6B7280;text-align:center;'>" + d.size + "</td>" +
            "<td style='font-size:12px;color:#6B7280;'>" + d.updated + "</td>" +
            "<td style='text-align:center;font-size:13px;font-weight:600;color:#3B82F6;'>" + d.used + "</td>" +
            "<td><span style='display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:600;" + (STATUS_STYLE_LOC[d.status] || "") + "'>" + d.status + "</span></td>" +
            "<td><button onclick=\"alert('문서를 미리봅니다.')\" style='padding:3px 8px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;margin-right:4px;'>보기</button><button onclick=\"alert('문서를 갱신합니다.')\" style='padding:3px 8px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;'>갱신</button></td>" +
            "</tr>";
        }
      }
      tbody.innerHTML = rows;
    });
  }
};
