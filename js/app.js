// 고정자산관리시스템 (시연용) - 화면 동작
// data.js 가 먼저 읽혀서 window.APP_DATA 에 자산 목록(assets)과 대시보드 요약(dashboard)이 들어 있습니다.

(function () {
  var assets = window.APP_DATA.assets;
  var DASH = window.APP_DATA.dashboard;
  function won(n) { return n.toLocaleString("ko-KR") + "원"; }

  var navItems = document.querySelectorAll(".nav-item");
  var tabs = document.querySelectorAll(".tab");
  var soonTitle = document.getElementById("soon-title");
  var sectionIds = ["dashboard", "list", "detail", "soon"];

  // ===== 화면(섹션) 보이기/숨기기 =====
  function showSection(name) {
    sectionIds.forEach(function (k) {
      document.getElementById("view-" + k).classList.toggle("active", k === name);
    });
    window.scrollTo(0, 0);
  }
  function activateSidebar(view) {
    navItems.forEach(function (b) { b.classList.toggle("active", b.dataset.view === view); });
  }
  function activateTab(view) {
    tabs.forEach(function (t) { t.classList.toggle("active", view === "dashboard" && t.dataset.view === "dashboard"); });
  }

  // ===== URL 해시 라우팅 =====
  // file:// 환경에서 동작하도록 history.pushState 대신 location.hash(#/...) 사용
  var _soonTitle = "";
  var _skipHashChange = false;  // navigate() 직후 hashchange 이벤트 무시용

  // URL 해시를 업데이트한다 (렌더는 _renderView 가 담당)
  function navigate(view, opts) {
    opts = opts || {};
    var hashPath;
    if (view === "detail" && opts.id) {
      hashPath = "/detail/" + encodeURIComponent(opts.id);
    } else if (view === "soon") {
      _soonTitle = opts.title || "";
      hashPath = "/soon";
    } else {
      hashPath = "/" + (view || "dashboard");
    }
    if (location.hash !== "#" + hashPath) {
      _skipHashChange = true;
      location.hash = hashPath;   // URL 표시창 갱신
    }
  }

  // 해시를 읽어 화면·사이드바·탭을 전환한다
  function _renderView(hash) {
    var part = (hash || "").replace(/^#\//, "");
    var segs = part.split("/");
    var view = segs[0] || "dashboard";

    if (view === "detail") {
      var id = decodeURIComponent(segs.slice(1).join("/") || "");
      if (id) { openDetail(id); return; }
      view = "list";  // id 없으면 목록으로
    }
    if (view === "soon") {
      soonTitle.textContent = (_soonTitle || "준비 중인 화면") + " — 준비 중인 화면입니다";
      showSection("soon");
      activateSidebar("soon");
      activateTab(null);
      return;
    }
    showSection(view);
    activateSidebar(view);
    activateTab(view);
  }

  // 브라우저 뒤로/앞으로 버튼 지원
  window.addEventListener("hashchange", function () {
    if (_skipHashChange) { _skipHashChange = false; return; }
    _renderView(location.hash);
  });

  // 사이드바 메뉴 클릭
  navItems.forEach(function (b) {
    b.addEventListener("click", function () {
      var view = b.dataset.view, title = b.dataset.title;
      navigate(view, { title: title });
      _renderView(location.hash);
    });
  });

  // 헤더 탭 클릭
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var view = t.dataset.view, title = t.dataset.title;
      if (view === "soon") { navigate("soon", { title: title }); }
      else { navigate("dashboard"); }
      _renderView(location.hash);
    });
  });

  // ===== 작은 아이콘(인라인 SVG) =====
  function icon(name) {
    var s = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">';
    if (name === "trend")  return s + '<path d="M3 17l6-6 4 4 7-7"/><path d="M21 8v4h-4"/></svg>';
    if (name === "clock")  return s + '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    if (name === "check")  return s + '<path d="M20 6L9 17l-5-5"/></svg>';
    if (name === "warn")   return s + '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.4v.2"/></svg>';
    return "";
  }

  // ===== 대시보드 =====
  function renderDashboard() {
    document.getElementById("ai-time").textContent = "시스템 분석 완료 (" + DASH.asOf + " 기준)";
    document.getElementById("ai-insight").textContent = DASH.insight;
    renderKpis();
    renderRiskDonut();
    renderTimeline();
    renderMap();
    renderList3("top5-list", DASH.top5, top5Row);
    renderList3("issue-list", DASH.issues, issueRow);
    renderList3("sched-list", DASH.schedule, schedRow);
    renderAging();
  }

  function gaugeSvg(pct, color) {
    var r = 24, c = 2 * Math.PI * r, len = c * pct / 100;
    return '<svg class="kpi-gauge" viewBox="0 0 56 56">' +
      '<circle cx="28" cy="28" r="24" fill="none" stroke="#EEF1F5" stroke-width="6"/>' +
      '<circle cx="28" cy="28" r="24" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="round"' +
      ' stroke-dasharray="' + len + ' ' + (c - len) + '" transform="rotate(-90 28 28)"/></svg>';
  }

  function renderKpis() {
    document.getElementById("kpi-row").innerHTML = DASH.kpis.map(function (k) {
      var bi = k.badgeIcon ? icon(k.badgeIcon) : "";
      var main = '<div class="kpi-main' + (k.gauge ? " with-gauge" : "") + '">' +
        (k.gauge ? gaugeSvg(k.gauge.pct, k.gauge.color) : "") +
        '<span class="kpi-value">' + k.value + (k.unit ? '<span class="u">' + k.unit + '</span>' : "") + '</span></div>';
      return '<div class="kpi-card"><div class="kpi-label">' + k.label + '</div>' + main +
        '<span class="kpi-badge ' + k.tone + '">' + bi + k.badge + '</span></div>';
    }).join("");
  }

  function renderRiskDonut() {
    var r = DASH.risk;
    var segs = r.segments.filter(function (s) { return s.count > 0; });
    var total = segs.reduce(function (s, d) { return s + d.count; }, 0);
    var R = 68, circ = 2 * Math.PI * R, offset = 0;
    var arcs = segs.map(function (s) {
      var len = circ * (s.count / total);
      var a = '<circle r="' + R + '" cx="84" cy="84" fill="none" stroke="' + s.color +
        '" stroke-width="26" stroke-dasharray="' + len + ' ' + (circ - len) +
        '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 84 84)"></circle>';
      offset += len; return a;
    }).join("");
    document.getElementById("risk-donut").innerHTML =
      '<svg viewBox="0 0 168 168" width="168" height="168">' + arcs + '</svg>' +
      '<div class="center"><span class="c-cap">Total</span><span class="c-total">' + r.centerTotal +
      '</span><span class="c-sub">' + r.centerSub + '</span></div>';
    document.getElementById("risk-legend").innerHTML = r.segments.map(function (s) {
      return '<li><span class="sq" style="background:' + s.color + '"></span><div>' +
        '<div class="lg-key"><b>' + s.key + '</b> <span>' + (s.note ? "(" + s.note + ")" : "") + '</span></div>' +
        '<div class="lg-val">' + s.label + ' (' + s.pct + ')</div></div></li>';
    }).join("");
    document.getElementById("risk-formula").textContent = r.formula;
  }

  function renderTimeline() {
    var t = DASH.timeline;
    document.getElementById("repl-timeline").innerHTML = t.rows.map(function (row) {
      return '<li style="--dot:' + row.color + '"><div class="repl-card" style="--dot:' + row.color + '">' +
        '<span class="r-label">' + row.label + '</span>' +
        '<span class="r-right"><span class="r-value">' + row.value + '</span>' +
        '<span class="r-count">' + row.count + '</span></span></div></li>';
    }).join("");
    document.getElementById("repl-total").innerHTML =
      '<div class="rt-main">총 교체 권고 자산 <b>' + t.totalCount + '</b></div>' +
      '<div class="rt-sub">(자산 가치 <b>' + t.totalValue + '</b> 억원)</div>';
  }

  // ===== 지역별 관리 현황 (코로플레스 지도 + 말풍선) =====
  // 도·광역시 SVG 경로 (viewBox 0 0 480 580, 근사값)
  // r: DASH.regions 인덱스 (0=서울, 1=강원, 2=경상, 3=전라, 4=제주)
  var PROVINCES = [
    { id:'gyeonggi', r:0, fill:'#1D4ED8',
      d:'M108,120 L155,82 L200,68 L242,76 L268,98 L275,132 L268,172 L238,198 L205,215 L172,210 L142,196 L118,178 L100,155 L102,132 Z' },
    { id:'seoul', r:0, fill:'#1E3A8A',
      d:'M188,130 L205,122 L220,132 L218,152 L200,162 L183,154 Z' },
    { id:'gangwon', r:1, fill:'#1E40AF',
      d:'M242,76 L268,42 L308,22 L368,26 L425,58 L445,105 L442,158 L418,188 L382,205 L342,212 L298,202 L268,172 L275,132 L268,98 Z' },
    { id:'chungbuk', r:0, fill:'#3B82F6',
      d:'M205,215 L238,198 L268,172 L298,202 L322,218 L320,262 L294,278 L262,282 L232,268 L215,248 Z' },
    { id:'chungnam', r:0, fill:'#60A5FA',
      d:'M100,212 L118,198 L142,196 L172,210 L205,215 L215,248 L208,278 L188,298 L158,308 L126,300 L100,280 L88,255 L90,228 Z' },
    { id:'jeonbuk', r:3, fill:'#93C5FD',
      d:'M90,288 L126,302 L158,308 L188,300 L215,312 L228,335 L222,368 L195,384 L162,390 L128,380 L100,362 L86,338 Z' },
    { id:'jeonnam', r:3, fill:'#BAD6F7',
      d:'M86,340 L100,365 L128,382 L162,392 L195,386 L220,402 L225,438 L208,462 L176,472 L144,464 L110,448 L86,418 L74,388 Z' },
    { id:'gyeongbuk', r:2, fill:'#2563EB',
      d:'M298,202 L342,212 L382,205 L418,188 L440,218 L445,268 L428,308 L402,330 L368,344 L334,332 L308,312 L298,278 L320,262 L322,218 Z' },
    { id:'gyeongnam', r:2, fill:'#3B82F6',
      d:'M222,370 L255,358 L292,348 L334,335 L368,345 L402,332 L428,362 L422,402 L395,428 L358,440 L318,438 L280,422 L252,404 L228,382 Z' },
    { id:'jeju', r:4, fill:'#DBEAFE',
      d:'M145,515 L178,507 L215,508 L238,520 L230,538 L200,545 L165,542 L143,528 Z' }
  ];
  var W_ISLANDS = [
    {cx:68,cy:198,r:9},{cx:55,cy:213,r:6},{cx:60,cy:232,r:8},
    {cx:72,cy:252,r:5},{cx:48,cy:245,r:4},{cx:52,cy:268,r:6},{cx:60,cy:285,r:5}
  ];
  var S_ISLANDS = [
    {cx:225,cy:445,r:7,ri:3},{cx:248,cy:455,r:5,ri:3},{cx:268,cy:450,r:6,ri:2},
    {cx:295,cy:458,r:5,ri:2},{cx:318,cy:450,r:4,ri:2},{cx:338,cy:442,r:6,ri:2}
  ];
  var ACTIVE_FILLS = ['#1E3A8A','#172554','#1D4ED8','#60A5FA','#BFDBFE'];

  function renderMap() {
    var regions = DASH.regions;
    var activeIdx = 0;
    regions.forEach(function(r, i) { if (r.active) activeIdx = i; });

    // 코로플레스 SVG 조립
    var svgPaths = PROVINCES.map(function(p) {
      return '<path id="prov-'+p.id+'" data-r="'+p.r+'" d="'+p.d+'"' +
        ' fill="'+p.fill+'" stroke="#fff" stroke-width="1.5" style="cursor:pointer;transition:filter .15s"/>';
    }).join('');
    W_ISLANDS.forEach(function(i) {
      svgPaths += '<circle cx="'+i.cx+'" cy="'+i.cy+'" r="'+i.r+'" fill="#60A5FA" stroke="#fff" stroke-width="1"/>';
    });
    S_ISLANDS.forEach(function(i) {
      svgPaths += '<circle cx="'+i.cx+'" cy="'+i.cy+'" r="'+i.r+'" fill="'+(i.ri===3?'#93C5FD':'#3B82F6')+'" stroke="#fff" stroke-width="1"/>';
    });
    var svgHtml = '<svg viewBox="0 0 480 580" style="display:block;width:100%;height:auto">' + svgPaths + '</svg>';

    // 핀 아이콘
    var pinIco = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8z" fill="currentColor"/><circle cx="12" cy="10" r="3.5" fill="#fff" opacity=".85"/></svg>';

    // 지역 마커 (말풍선 + 핀) 조립
    var markersHtml = regions.map(function(r, i) {
      var rows = r.detail.map(function(d) {
        return '<div class="cb-row"><span>'+d[0]+'</span><b>'+d[1]+'</b></div>';
      }).join('');
      return '<div class="region-marker" data-i="'+i+'" style="left:'+r.x+'%;top:'+r.y+'%">' +
        '<div class="callout callout-exp" id="callout-exp-'+i+'">' +
          '<div class="cb-name">'+r.name+'</div>' +
          '<div class="cb-num">'+r.count+'</div>' +
          '<div class="cb-div"></div>' + rows +
        '</div>' +
        '<div class="callout callout-cmp" id="callout-cmp-'+i+'">' +
          '<div class="cb-name">'+r.name+'</div>' +
          '<div class="cb-num">'+r.count+'</div>' +
        '</div>' +
        '<div class="cb-pin">'+pinIco+'</div>' +
      '</div>';
    }).join('');

    document.getElementById('map-box').innerHTML = svgHtml + markersHtml;

    function setActive(idx) {
      activeIdx = idx;
      regions.forEach(function(_, i) {
        var exp = document.getElementById('callout-exp-'+i);
        var cmp = document.getElementById('callout-cmp-'+i);
        if (exp) exp.style.display = (i===idx) ? 'block' : 'none';
        if (cmp) cmp.style.display = (i===idx) ? 'none' : 'flex';
      });
      document.querySelectorAll('#map-box path[data-r]').forEach(function(el) {
        var ri = +el.getAttribute('data-r');
        var prov = null;
        PROVINCES.forEach(function(p) { if ('prov-'+p.id === el.id) prov = p; });
        if (!prov) return;
        el.setAttribute('fill', ri===idx ? ACTIVE_FILLS[ri] : prov.fill);
      });
    }

    document.querySelectorAll('.region-marker').forEach(function(m) {
      m.addEventListener('click', function() { setActive(+m.dataset.i); });
    });
    document.querySelectorAll('#map-box path[data-r]').forEach(function(el) {
      el.addEventListener('click', function() { setActive(+el.getAttribute('data-r')); });
    });

    setActive(activeIdx);
  }

  function top5Row(r) {
    return '<li><div><div class="rk-title">' + r.title + '</div><div class="rk-sub">' + r.sub + '</div></div>' +
      '<span class="tag-badge ' + r.tone + '">' + r.badge + '</span></li>';
  }
  function issueRow(r) {
    return '<li><span class="is-time">' + r.time + '</span><div><div class="is-title">' + r.title +
      '</div><div class="is-sub">' + r.sub + '</div></div></li>';
  }
  function schedRow(r) {
    return '<li><div class="sc-top"><span class="sc-tag">' + r.tag + '</span><span class="sc-date">' + r.date +
      '</span></div><div class="sc-title">' + r.title + '</div><div class="sc-sub">' + r.sub + '</div></li>';
  }
  function renderList3(id, rows, rowFn) {
    document.getElementById(id).innerHTML = rows.map(rowFn).join("");
  }

  function renderAging() {
    var a = DASH.aging;
    document.getElementById("aging-bars").innerHTML = a.bars.map(function (b) {
      return '<div class="ab-row"><div class="ab-top"><span class="ab-label">' + b.label +
        '</span><span class="ab-pct">' + b.pct + '%</span></div>' +
        '<div class="ab-track"><div class="ab-fill" style="width:' + b.pct + '%;background:' + b.color + '"></div></div></div>';
    }).join("");
    document.getElementById("aging-stats").innerHTML = a.stats.map(function (s) {
      return '<div class="as-row"><span class="as-label">' + s[0] + '</span><span class="as-val">' + s[1] + '</span></div>';
    }).join("");
  }

  // ===== 원장관리 (목록/검색) =====
  var applyFilter;

  function renderListView() {
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
      tr.addEventListener("click", function () {
        navigate("detail", { id: tr.dataset.id });
        _renderView(location.hash);
      });
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

    activateSidebar("list");
    activateTab(null);
    showSection("detail");
  }

  document.getElementById("detail-back").addEventListener("click", function () {
    navigate("list");
    _renderView(location.hash);
  });

  // 상단 버튼 / 떠있는 버튼 (시연용 안내)
  document.getElementById("btn-report").addEventListener("click", function () {
    alert("시연용 프로토타입입니다.\n'리포트 생성' 기능은 다음 단계에서 추가할 수 있습니다.");
  });
  document.getElementById("btn-insight").addEventListener("click", function () {
    alert("AI 인사이트 상세 분석 화면은 시연용 프로토타입에서 준비 중입니다.");
  });
  document.getElementById("fab-ai").addEventListener("click", function () {
    alert("AI 도우미는 시연용 프로토타입에서 준비 중입니다.");
  });

  // ===== 시작 =====
  renderDashboard();
  renderListView();
  // 해시가 있으면 그 화면으로, 없으면 대시보드를 기본으로
  if (location.hash && location.hash.length > 2) {
    _renderView(location.hash);
  } else {
    history.replaceState(null, "", "#/dashboard"); // hashchange 없이 URL만 교체
    _renderView("#/dashboard");
  }
})();
