// 고정자산관리시스템 (시연용) - 화면 동작
// data.js 가 먼저 읽혀서 window.APP_DATA.assets 에 자산 목록이 들어 있습니다.

(function () {
  var assets = window.APP_DATA.assets;
  function won(n) { return n.toLocaleString("ko-KR") + "원"; }

  var pageTitle = document.getElementById("page-title");
  var navItems = document.querySelectorAll(".nav-item");
  var sectionIds = ["dashboard", "list", "detail", "soon"];

  // 화면(섹션) 보이기/숨기기
  function showSection(name) {
    sectionIds.forEach(function (k) {
      document.getElementById("view-" + k).classList.toggle("active", k === name);
    });
    document.querySelector(".content").scrollTo(0, 0);
    window.scrollTo(0, 0);
  }
  function clearActiveNav() { navItems.forEach(function (b) { b.classList.remove("active"); }); }
  function activateNav(view) {
    clearActiveNav();
    for (var i = 0; i < navItems.length; i++) {
      if (navItems[i].dataset.view === view) { navItems[i].classList.add("active"); break; }
    }
  }

  // 사이드바 메뉴 클릭
  navItems.forEach(function (b) {
    b.addEventListener("click", function () {
      var view = b.dataset.view;
      var title = b.dataset.title;
      clearActiveNav();
      b.classList.add("active");
      pageTitle.textContent = title;
      if (view === "soon") {
        document.getElementById("soon-title").textContent = title + " — 준비 중인 화면입니다";
        showSection("soon");
      } else {
        showSection(view);
      }
    });
  });

  // 묶어서 개수 세기 (많은 순)
  function groupCount(arr, keyFn) {
    var map = {};
    arr.forEach(function (x) { var k = keyFn(x); map[k] = (map[k] || 0) + 1; });
    return Object.keys(map).map(function (k) { return [k, map[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
  }

  // ===== 대시보드 =====
  function renderDashboard() {
    var total = assets.length;
    var totalPrice = assets.reduce(function (s, a) { return s + a.price; }, 0);
    var inUse = assets.filter(function (a) { return a.status === "사용중"; }).length;
    var idle = assets.filter(function (a) { return a.status === "유휴"; }).length;
    var repair = assets.filter(function (a) { return a.status === "수리중"; }).length;
    var dispose = assets.filter(function (a) { return a.status === "폐기예정"; }).length;
    var newThisYear = assets.filter(function (a) { return a.acquireDate.indexOf("2025") === 0; }).length;

    document.getElementById("stat-total").textContent = total.toLocaleString("ko-KR") + "개";
    document.getElementById("stat-price").textContent = won(totalPrice);
    document.getElementById("stat-inuse").textContent = inUse + "개";
    document.getElementById("stat-idle").textContent = idle + "개";
    document.getElementById("stat-repair").textContent = repair + "개";
    document.getElementById("stat-dispose").textContent = dispose + "개";
    document.getElementById("trend-total").textContent = "▲ 올해 신규 " + newThisYear + "건";
    document.getElementById("rate-inuse").textContent = "가동률 " + (inUse / total * 100).toFixed(1) + "%";

    renderBarChart(document.getElementById("chart-category"), groupCount(assets, function (a) { return a.category; }));
    renderDonut(document.getElementById("chart-status"), groupCount(assets, function (a) { return a.status; }));
    renderBarChart(document.getElementById("chart-department"), groupCount(assets, function (a) { return a.department; }));

    var recent = assets.slice().sort(function (a, b) { return a.acquireDate < b.acquireDate ? 1 : -1; }).slice(0, 6);
    document.getElementById("recent-body").innerHTML = recent.map(function (a) {
      return "<tr><td>" + a.id + "</td><td>" + a.name + "</td><td>" + a.category + "</td><td>" + a.acquireDate + "</td></tr>";
    }).join("");
  }

  function renderBarChart(container, data) {
    var max = Math.max.apply(null, data.map(function (d) { return d[1]; }));
    container.innerHTML = data.map(function (d) {
      var width = (d[1] / max * 100).toFixed(1);
      return '<div class="bar-row"><span class="bar-label">' + d[0] + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + width + '%"></span></span>' +
        '<span class="bar-value">' + d[1] + '</span></div>';
    }).join("");
  }

  // 상태별 색 (DESIGN.md 규칙)
  var STATUS_COLORS = { "사용중": "#16A34A", "유휴": "#7C3AED", "수리중": "#2563EB", "폐기예정": "#DC2626" };

  function renderDonut(container, data) {
    var total = data.reduce(function (s, d) { return s + d[1]; }, 0);
    var r = 60, circ = 2 * Math.PI * r, offset = 0;
    var segs = data.map(function (d) {
      var len = circ * (d[1] / total);
      var color = STATUS_COLORS[d[0]] || "#94A3B8";
      var seg = '<circle r="' + r + '" cx="80" cy="80" fill="none" stroke="' + color +
        '" stroke-width="24" stroke-dasharray="' + len + ' ' + (circ - len) +
        '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 80 80)"></circle>';
      offset += len;
      return seg;
    }).join("");
    var legend = data.map(function (d) {
      return '<li><span class="dot" style="background:' + (STATUS_COLORS[d[0]] || "#94A3B8") +
        '"></span>' + d[0] + ' <b>' + d[1] + '개</b></li>';
    }).join("");
    container.innerHTML =
      '<svg viewBox="0 0 160 160" width="160" height="160">' + segs +
      '<text x="80" y="78" text-anchor="middle" class="donut-num">' + total + '</text>' +
      '<text x="80" y="98" text-anchor="middle" class="donut-cap">전체</text></svg>' +
      '<ul class="legend">' + legend + '</ul>';
  }

  // ===== 원장관리 (목록/검색) =====
  var applyFilter; // 외부(상단 검색)에서도 호출

  function renderList() {
    var select = document.getElementById("filter-category");
    var cats = [];
    assets.forEach(function (a) { if (cats.indexOf(a.category) === -1) cats.push(a.category); });
    select.innerHTML = '<option value="">전체 분류</option>' +
      cats.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("");

    var searchInput = document.getElementById("search-input");

    applyFilter = function () {
      var q = searchInput.value.trim();
      var cat = select.value;
      var filtered = assets.filter(function (a) {
        var matchQ = !q || a.name.indexOf(q) > -1 || a.id.indexOf(q) > -1 ||
          a.owner.indexOf(q) > -1 || a.department.indexOf(q) > -1;
        var matchCat = !cat || a.category === cat;
        return matchQ && matchCat;
      });
      drawTable(filtered);
    };

    searchInput.addEventListener("input", applyFilter);
    select.addEventListener("change", applyFilter);
    drawTable(assets);
  }

  function statusBadge(s) {
    var cls = { "사용중": "ok", "유휴": "idle", "수리중": "info", "폐기예정": "danger" }[s] || "";
    return '<span class="badge ' + cls + '">' + s + '</span>';
  }

  function drawTable(rows) {
    var tbody = document.getElementById("list-body");
    document.getElementById("list-count").textContent = rows.length;
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">검색 결과가 없습니다.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function (a) {
      return '<tr data-id="' + a.id + '"><td>' + a.id + '</td><td>' + a.name + '</td><td>' + a.category +
        '</td><td>' + a.department + '</td><td>' + a.owner + '</td><td>' + won(a.price) +
        '</td><td>' + statusBadge(a.status) + '</td></tr>';
    }).join("");
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.addEventListener("click", function () { openDetail(tr.dataset.id); });
    });
  }

  // ===== 자산 상세 / 이력 =====
  function field(label, val) {
    return '<div class="field"><span class="f-label">' + label + '</span><span class="f-value">' + val + '</span></div>';
  }

  function openDetail(id) {
    var a = null;
    for (var i = 0; i < assets.length; i++) { if (assets[i].id === id) { a = assets[i]; break; } }
    if (!a) return;

    var historyHtml = a.history.slice().reverse().map(function (h) {
      return '<li><span class="t-date">' + h.date + '</span><span class="t-type">' + h.type + '</span>' +
        '<span class="t-detail">' + h.detail + '</span></li>';
    }).join("");

    document.getElementById("detail-content").innerHTML =
      '<div class="detail-head"><h2>' + a.name + ' ' + statusBadge(a.status) + '</h2>' +
      '<p class="muted">' + a.id + ' · ' + a.category + '</p></div>' +
      '<div class="detail-grid">' +
        field("자산번호", a.id) + field("자산명", a.name) +
        field("분류", a.category) + field("모델", a.model) +
        field("사용부서", a.department) + field("사용자", a.owner) +
        field("위치", a.location) + field("상태", a.status) +
        field("취득일", a.acquireDate) + field("취득금액", won(a.price)) +
      '</div>' +
      '<h3 class="section-title">변경 이력</h3>' +
      '<ul class="timeline">' + historyHtml + '</ul>';

    activateNav("list");
    pageTitle.textContent = "원장관리 › 자산 상세";
    showSection("detail");
  }

  document.getElementById("detail-back").addEventListener("click", function () {
    activateNav("list");
    pageTitle.textContent = "원장관리";
    showSection("list");
  });

  // 상단 통합 검색 → 원장관리로 이동해서 검색
  document.getElementById("top-search").addEventListener("input", function () {
    activateNav("list");
    pageTitle.textContent = "원장관리";
    document.getElementById("search-input").value = this.value;
    applyFilter();
    showSection("list");
  });

  // '자산 등록' 버튼 (시연용 안내)
  document.getElementById("btn-register").addEventListener("click", function () {
    alert("시연용 프로토타입입니다.\n'자산 등록' 화면은 다음 단계에서 추가할 수 있습니다.");
  });

  // ===== 시작 =====
  renderDashboard();
  renderList();
  showSection("dashboard");
})();
