// 고정자산관리시스템 (시연용) - 화면 동작
// data.js 가 먼저 읽혀서 window.APP_DATA 에 자산 목록(assets)과 대시보드 요약(dashboard)이 들어 있습니다.

(function () {
  var assets = window.APP_DATA.assets;
  var DASH = window.APP_DATA.dashboard;
  function won(n) { return n.toLocaleString("ko-KR") + "원"; }

  var navItems = document.querySelectorAll(".nav-item");
  var tabs = document.querySelectorAll(".tab");
  var soonTitle = document.getElementById("soon-title");
  var sectionIds = ["dashboard", "list", "detail", "soon", "ai-agent"];

  // ===== 차트 공용 툴팁 =====
  var _tipEl = null;
  function _tip() { return _tipEl || (_tipEl = document.getElementById('chart-tooltip')); }
  function showTip(cx, cy, html) {
    var t = _tip(); if (!t) return;
    t.innerHTML = html;
    t.classList.add('visible');
    var W = window.innerWidth, H = window.innerHeight;
    var tw = t.offsetWidth || 160, th = t.offsetHeight || 56;
    var x = cx + 14, y = cy - th - 10;
    if (x + tw > W - 8) x = cx - tw - 14;
    if (y < 8) y = cy + 16;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  function hideTip() { var t = _tip(); if (t) t.classList.remove('visible'); }

  // ===== 화면(섹션) 보이기/숨기기 =====
  function showSection(name) {
    sectionIds.forEach(function (k) {
      document.getElementById("view-" + k).classList.toggle("active", k === name);
    });
    var contentEl = document.querySelector('.content');
    if (contentEl) contentEl.scrollTop = 0;
    if (name === 'dashboard') triggerDashboardAnimations();
    if (name === 'ai-agent') triggerAiAgentAnimations();
  }
  function activateSidebar(view) {
    navItems.forEach(function (b) {
      var match = (view === "soon")
        ? (b.dataset.view === "soon" && b.dataset.title === _soonTitle)
        : (b.dataset.view === view);
      b.classList.toggle("active", match);
    });
  }
  function activateTab(view) {
    // "고정자산관리시스템" 탭을 항상 활성화 상태로 고정
    tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.view === "dashboard"); });
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
    if (view === "ai-agent") {
      showSection("ai-agent");
      activateSidebar("ai-agent");
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
      // 클릭한 탭을 직접 활성화 (navigate/_renderView가 항상 "고정자산관리시스템"으로 초기화하므로 마지막에 덮어쓴다)
      tabs.forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active");
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
      ' stroke-dasharray="0 ' + c.toFixed(2) + '"' +
      ' data-len="' + len.toFixed(2) + '" data-circ="' + c.toFixed(2) + '"' +
      ' transform="rotate(-90 28 28)"/></svg>';
  }

  function renderKpis() {
    document.getElementById("kpi-row").innerHTML = DASH.kpis.map(function (k, i) {
      var bi = k.badgeIcon ? icon(k.badgeIcon) : "";
      var main = '<div class="kpi-main' + (k.gauge ? " with-gauge" : "") + '">' +
        (k.gauge ? gaugeSvg(k.gauge.pct, k.gauge.color) : "") +
        '<span class="kpi-value">' + k.value + (k.unit ? '<span class="u">' + k.unit + '</span>' : "") + '</span></div>';
      return '<div class="kpi-card" style="--card-delay:' + (0.08 + i * 0.04).toFixed(2) + 's">' +
        '<div class="kpi-label">' + k.label + '</div>' + main +
        '<span class="kpi-badge ' + k.tone + '">' + bi + k.badge + '</span></div>';
    }).join("");
    // KPI 카드 hover: 호버된 카드 확대, 나머지 축소 (JS 이벤트 방식 — 브라우저 호환)
    var kpiCards = document.querySelectorAll('#kpi-row .kpi-card');
    kpiCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        kpiCards.forEach(function (c) { if (c !== card) c.classList.add('kpi-dimmed'); });
      });
      card.addEventListener('mouseleave', function () {
        kpiCards.forEach(function (c) { c.classList.remove('kpi-dimmed'); });
      });
    });
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
        '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 84 84)"' +
        ' class="donut-arc" data-key="' + s.key + '" data-label="' + s.label +
        '" data-pct="' + s.pct + '" data-color="' + s.color + '" data-note="' + (s.note || '') + '"' +
        ' style="cursor:pointer;transition:opacity .15s"></circle>';
      offset += len; return a;
    }).join("");
    // 중앙 텍스트를 SVG 내부 <text>로 렌더링 → 도넛 축소 시 텍스트도 함께 축소됨
    document.getElementById("risk-donut").innerHTML =
      '<svg viewBox="0 0 168 168" width="100%" height="100%">' + arcs +
      '<text x="84" y="72" text-anchor="middle" font-size="11" fill="#9CA3AF">Total</text>' +
      '<text x="84" y="93" text-anchor="middle" font-size="20" font-weight="800" fill="#002B6C">' + r.centerTotal + '</text>' +
      '<text x="84" y="108" text-anchor="middle" font-size="9.5" fill="#6B7280">' + r.centerSub + '</text>' +
      '</svg>';
    // 도넛 arc 마우스오버 툴팁
    var svg = document.querySelector('#risk-donut svg');
    svg.addEventListener('mousemove', function (e) {
      var arc = e.target.classList && e.target.classList.contains('donut-arc') ? e.target : null;
      if (!arc) { hideTip(); return; }
      var note = arc.getAttribute('data-note');
      var html = '<div class="ctt-title">' + arc.getAttribute('data-key') +
        (note ? ' <span style="font-weight:400;font-size:11px;opacity:.75">(' + note + ')</span>' : '') + '</div>' +
        '<div class="ctt-row"><span class="ctt-dot" style="background:' + arc.getAttribute('data-color') + '"></span>' +
        '<span class="ctt-val">' + arc.getAttribute('data-label') + ' (' + arc.getAttribute('data-pct') + ')</span></div>';
      showTip(e.clientX, e.clientY, html);
    });
    svg.addEventListener('mouseleave', hideTip);
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
      return '<li style="--dot:' + row.color + '"><div class="repl-card" style="--dot:' + row.color + '"' +
        ' data-label="' + row.label + '" data-value="' + row.value +
        '" data-count="' + row.count + '" data-color="' + row.color + '">' +
        '<span class="r-label">' + row.label + '</span>' +
        '<span class="r-right"><span class="r-value">' + row.value + '</span>' +
        '<span class="r-count">' + row.count + '</span></span></div></li>';
    }).join("");
    document.getElementById("repl-total").innerHTML =
      '<div class="rt-main">총 교체 권고 자산 <b>' + t.totalCount + '</b></div>' +
      '<div class="rt-sub">(자산 가치 <b>' + t.totalValue + '</b> 억원)</div>';
    // 타임라인 카드 마우스오버 툴팁
    document.querySelectorAll('#repl-timeline .repl-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var html = '<div class="ctt-title">' + card.getAttribute('data-label') + '</div>' +
          '<div class="ctt-row"><span class="ctt-dot" style="background:' + card.getAttribute('data-color') + '"></span>' +
          '<span class="ctt-val">' + card.getAttribute('data-value') + ' &nbsp;/&nbsp; ' + card.getAttribute('data-count') + '</span></div>';
        showTip(e.clientX, e.clientY, html);
      });
      card.addEventListener('mouseleave', hideTip);
    });
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
    var activeIdx = -1;

    var mapImgHtml = '<img class="map-bg-img" src="images/korea-map.png" alt="한국 지도">';

    // 도(道) 별 투명 SVG 히트 영역 — 지도 이미지 위에 겹쳐 마우스오버 감지용
    var svgPaths = PROVINCES.map(function(p) {
      return '<path data-r="'+p.r+'" d="'+p.d+'" fill="'+p.fill+'" class="prov-hit"/>';
    }).join('');
    var svgSIslands = S_ISLANDS.map(function(c) {
      return '<circle data-r="'+c.ri+'" cx="'+c.cx+'" cy="'+c.cy+'" r="'+c.r+'" class="prov-hit"/>';
    }).join('');
    var mapSvgHtml = '<svg class="map-overlay-svg" viewBox="0 0 480 580" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      svgPaths + svgSIslands + '</svg>';

    // 핀 아이콘
    var pinIco = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8z" fill="currentColor"/><circle cx="12" cy="10" r="3.5" fill="#fff" opacity=".85"/></svg>';

    // 지역 마커 (말풍선 + 핀) 조립
    var markersHtml = regions.map(function(r, i) {
      var rows = r.detail.map(function(d) {
        return '<div class="cb-row"><span>'+d[0]+'</span><b>'+d[1]+'</b></div>';
      }).join('');
      var expExtra = (r.expDir==='left' ? ' exp-dir-left' : '') + (r.expAbove ? ' exp-above' : '');
      return '<div class="region-marker dir-'+r.dir+'" data-i="'+i+'" style="left:'+r.x+'%;top:'+r.y+'%">' +
        '<div class="callout callout-exp'+expExtra+'" id="callout-exp-'+i+'">' +
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

    document.getElementById('map-box').innerHTML = mapImgHtml + mapSvgHtml + markersHtml;

    var hideTimer = null;

    function setActive(idx) {
      activeIdx = idx;
      regions.forEach(function(_, i) {
        var exp = document.getElementById('callout-exp-'+i);
        var cmp = document.getElementById('callout-cmp-'+i);
        if (exp) exp.classList.toggle('is-active', i === idx);
        if (cmp) cmp.style.display = (i === idx) ? 'none' : 'flex';
      });
    }

    function showRegion(idx) {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      setActive(idx);
    }

    function hideRegionDelayed() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(function() {
        hideTimer = null;
        setActive(-1);
      }, 500);
    }

    document.querySelectorAll('.region-marker').forEach(function(m) {
      m.addEventListener('mouseenter', function() { showRegion(+m.dataset.i); });
      m.addEventListener('mouseleave', function() { hideRegionDelayed(); });
    });

    document.querySelectorAll('.prov-hit').forEach(function(p) {
      p.addEventListener('mouseenter', function() { showRegion(+p.dataset.r); });
      p.addEventListener('mouseleave', function() { hideRegionDelayed(); });
    });

    setActive(-1);
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
      return '<div class="ab-row" data-label="' + b.label + '" data-pct="' + b.pct +
        '" data-count="' + (b.count || '') + '" data-color="' + b.color + '">' +
        '<div class="ab-top"><span class="ab-label">' + b.label +
        '</span><span class="ab-pct">' + b.pct + '%</span></div>' +
        '<div class="ab-track"><div class="ab-fill" data-pct="' + b.pct + '" style="width:0;background:' + b.color + '"></div></div></div>';
    }).join("");
    document.getElementById("aging-stats").innerHTML = a.stats.map(function (s) {
      return '<div class="as-row"><span class="as-label">' + s[0] + '</span><span class="as-val">' + s[1] + '</span></div>';
    }).join("");
    // 노후도 막대 행 마우스오버 툴팁
    document.querySelectorAll('#aging-bars .ab-row').forEach(function (row) {
      row.addEventListener('mousemove', function (e) {
        var html = '<div class="ctt-title">' + row.getAttribute('data-label') + '</div>' +
          '<div class="ctt-row"><span class="ctt-dot" style="background:' + row.getAttribute('data-color') + '"></span>' +
          '<span class="ctt-val">' + row.getAttribute('data-pct') + '%' +
          (row.getAttribute('data-count') ? ' &nbsp;/ ' + row.getAttribute('data-count') : '') + '</span></div>';
        showTip(e.clientX, e.clientY, html);
      });
      row.addEventListener('mouseleave', hideTip);
    });
  }

  // ===== 대시보드 진입 애니메이션 트리거 =====
  function triggerDashboardAnimations() {
    // ① KPI 게이지 원호: 0 리셋 → 성장
    var gauges = document.querySelectorAll('.kpi-gauge circle[data-len]');
    gauges.forEach(function(el) {
      el.style.transition = 'none';
      el.style.strokeDasharray = '0 ' + el.dataset.circ;
    });
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      gauges.forEach(function(el) {
        el.style.transition = '';
        var len = parseFloat(el.dataset.len), circ = parseFloat(el.dataset.circ);
        el.style.strokeDasharray = len + ' ' + (circ - len);
      });
    }); });

    // ② KPI 숫자 카운터 (0 → 최종값)
    setTimeout(function() {
      document.querySelectorAll('.kpi-value').forEach(function(el) {
        var tn = el.childNodes[0];
        if (!tn || tn.nodeType !== 3) return;
        var raw = tn.textContent.trim();
        var ns = raw.replace(/,/g, '');
        var target = parseFloat(ns);
        if (isNaN(target) || target <= 0) return;
        var dec = ns.indexOf('.') > -1 ? ns.split('.')[1].length : 0;
        var t0 = performance.now();
        (function tick(now) {
          var p = Math.min((now - t0) / 700, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          tn.textContent = dec > 0
            ? (ease * target).toFixed(dec)
            : Math.round(ease * target).toLocaleString('ko-KR');
          if (p < 1) requestAnimationFrame(tick); else tn.textContent = raw;
        })(t0);
      });
    }, 160);

    // ③ Aging 바: 0 리셋 → 성장
    setTimeout(function() {
      var fills = document.querySelectorAll('#aging-bars .ab-fill[data-pct]');
      fills.forEach(function(el) { el.style.transition = 'none'; el.style.width = '0'; });
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        fills.forEach(function(el) { el.style.transition = ''; el.style.width = el.dataset.pct + '%'; });
      }); });
    }, 560);
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

    applyFilter = window._assetApplyFilter = function () {
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

    // 감가상각 계산
    var lifeMap = { '노트북':5,'모니터':5,'서버':7,'복합기':5,'책상':10,'의자':10,'차량':10,'에어컨':10,'프로젝터':5,'기타':5 };
    var life = lifeMap[a.category] || 5;
    var residual = Math.round(a.price * 0.1);
    var annualDep = Math.round((a.price - residual) / life);
    var acqYear = a.acquireDate ? parseInt(a.acquireDate.slice(0,4)) : new Date().getFullYear();
    var usedYears = Math.max(0, new Date().getFullYear() - acqYear);
    var depYears = Math.min(usedYears, life);
    var bookValue = Math.max(residual, a.price - annualDep * depYears);
    var depRate = Math.min(100, Math.round(depYears / life * 100));
    var isDanger = depRate >= 80;

    // 담당자 연락처
    var contactMap = {
      '노트북':['IT자산관리팀','김태현','02-1234-5678'],
      '모니터':['IT자산관리팀','김태현','02-1234-5678'],
      '서버':['IT인프라팀','이승준','02-1234-5679'],
      '복합기':['IT자산관리팀','김태현','02-1234-5678'],
      '프로젝터':['IT자산관리팀','김태현','02-1234-5678'],
      '차량':['차량관리팀','박성민','02-1234-5680'],
      '책상':['총무팀','최지연','02-1234-5681'],
      '의자':['총무팀','최지연','02-1234-5681'],
      '에어컨':['총무팀','최지연','02-1234-5681'],
      '기타':['총무팀','최지연','02-1234-5681']
    };
    var ct = contactMap[a.category] || ['총무팀','최지연','02-1234-5681'];

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

      '<div class="dep-card">' +
        '<h3>감가상각 정보</h3>' +
        '<div class="dep-grid">' +
          '<div class="dep-item"><span class="di-label">내용연수</span><span class="di-value">' + life + '년</span></div>' +
          '<div class="dep-item"><span class="di-label">사용연수</span><span class="di-value">' + usedYears + '년</span></div>' +
          '<div class="dep-item"><span class="di-label">잔여연수</span><span class="di-value">' + Math.max(0, life - usedYears) + '년</span></div>' +
          '<div class="dep-item"><span class="di-label">연간 감가상각액</span><span class="di-value">' + won(annualDep) + '</span></div>' +
          '<div class="dep-item"><span class="di-label">잔존가액</span><span class="di-value">' + won(residual) + '</span></div>' +
          '<div class="dep-item"><span class="di-label">현재 장부가</span><span class="di-value highlight">' + won(bookValue) + '</span></div>' +
        '</div>' +
        '<div class="dep-gauge-wrap">' +
          '<div class="dep-gauge-label"><span>감가상각 진행률</span><span>' + depRate + '%</span></div>' +
          '<div class="dep-gauge-track"><div class="dep-gauge-fill' + (isDanger ? ' danger' : '') + '" style="width:' + depRate + '%"></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="contact-card">' +
        '<div class="contact-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
        '<div class="contact-info">' +
          '<div class="ci-team">' + ct[0] + ' · 자산담당자</div>' +
          '<div class="ci-name">' + ct[1] + '</div>' +
          '<div class="ci-phone">' + ct[2] + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="attach-card">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>' +
        '<div class="ac-title">첨부파일</div>' +
        '<div class="ac-sub">사진, 구매 영수증, 보증서 등 파일을 첨부할 수 있습니다<br>(시연용 프로토타입 — 파일 업로드 기능은 추후 추가 예정)</div>' +
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

  // ===== AI Agent =====
  var AI = window.APP_DATA.aiAgent;
  var _aiSeq = null;          // 현재 진행중인 setTimeout id 묶음
  var _aiCurrentScript = null; // 현재 답변 카드의 스크립트

  function renderAgentInit() {
    // 추천 질문
    document.getElementById('suggest-list').innerHTML = AI.suggestions.map(function (s, i) {
      return '<li class="suggest-item" data-idx="' + i + '" onclick="askAgent(this.dataset.q)" data-q="' + s.text.replace(/"/g, '&quot;') + '">' +
        '<span class="s-ico">' + s.icon + '</span><span class="s-text">' + s.text + '</span></li>';
    }).join('');
    // 즐겨찾는 분석
    document.getElementById('fav-list').innerHTML = AI.favorites.map(function (f) {
      return '<li class="fav-item">✓ ' + f.text + '</li>';
    }).join('');
    // 분석 단계 6개 (모두 비활성)
    document.getElementById('step-list').innerHTML = AI.steps.map(function (st, i) {
      return '<li class="step-item" data-step="' + (i + 1) + '">' +
        '<span class="step-num">' + (i + 1) + '</span>' +
        '<div class="step-meta"><div class="step-title">' + st.title + '</div>' +
        '<div class="step-sub">' + st.sub + '</div></div></li>';
    }).join('');
    // 채팅 본문은 비워두고, 화면 진입 시 triggerAiAgentAnimations에서 인사 메시지를 fade-in으로 추가
    document.getElementById('ai-chat-body').innerHTML = '';
    resetAgentRight();
  }

  function _appendGreetingBubble() {
    var body = document.getElementById('ai-chat-body');
    if (!body) return;
    // 이미 인사 메시지가 있으면 건너뜀 (중복 방지)
    if (body.querySelector('.msg.agent.greeting')) return;
    var div = document.createElement('div');
    div.className = 'msg agent greeting anim-pop';
    div.innerHTML = '<div class="msg-bubble">안녕하세요. <b>고정자산관리 AI Agent</b>입니다.<br>' +
      '자산 현황·장애·이력·계약·점검 기준을 종합 분석하여 <b>교체 우선순위와 조치안까지</b> 함께 제시합니다.<br>' +
      '좌측 추천 질문을 클릭하거나 자연어로 직접 물어보세요.</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function triggerAiAgentAnimations() {
    // 진입할 때마다 카드들이 새로 등장하도록 view 안의 anim 클래스를 강제로 재시작
    var view = document.getElementById('view-ai-agent');
    if (!view) return;
    // 채팅 본문에 진행 중인 분석이 없다면(=새 진입) 인사 메시지를 fade-in으로 추가
    var body = document.getElementById('ai-chat-body');
    var hasOngoing = body && (body.querySelector('.msg.user') || body.querySelector('.msg.agent.answer') || body.querySelector('.msg.thinking'));
    if (!hasOngoing) {
      // 본문을 비우고 약 0.55초 후 인사 메시지 등장 (우측 패널 등장 직후 자연스럽게)
      body.innerHTML = '';
      setTimeout(_appendGreetingBubble, 550);
    }
    // 추천/즐겨찾기 항목 stagger 등장을 위해 ready 클래스 재토글
    view.classList.remove('anim-on');
    // reflow → 클래스 재부착으로 키프레임 재시작
    void view.offsetWidth;
    view.classList.add('anim-on');
  }

  function resetAgentRight() {
    // 우측 단계 카드 초기화
    Array.prototype.forEach.call(document.querySelectorAll('#step-list .step-item'), function (el) {
      el.classList.remove('active');
      el.classList.remove('loading');
    });
    document.getElementById('related-empty').style.display = '';
    document.getElementById('related-chips').style.display = 'none';
    document.getElementById('related-chips').innerHTML = '';
    document.getElementById('risk-mini-row').style.display = 'none';
    document.getElementById('risk-mini-row').innerHTML = '';
    document.getElementById('cost-value').textContent = '- 원';
    document.getElementById('cost-sub').textContent = '분석 시 자동으로 채워집니다';
    document.getElementById('ai-cost-card').classList.remove('highlight');
    document.getElementById('actions-empty').style.display = '';
    document.getElementById('action-list').style.display = 'none';
    document.getElementById('action-list').innerHTML = '';
    document.getElementById('ai-right').classList.remove('detail-mode');
  }

  function clearAgentTimers() {
    if (_aiSeq) { _aiSeq.forEach(function (t) { clearTimeout(t); }); _aiSeq = null; }
  }

  function _appendUserBubble(text) {
    var body = document.getElementById('ai-chat-body');
    var div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML = '<div class="msg-bubble">' + escapeHtml(text) + '</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function _appendThinkingBubble() {
    var body = document.getElementById('ai-chat-body');
    var div = document.createElement('div');
    div.className = 'msg agent thinking';
    div.id = 'msg-thinking';
    div.innerHTML = '<div class="msg-bubble thinking-bubble">' +
      '<span class="thinking-label">분석중<span class="dots"><i>.</i><i>.</i><i>.</i></span></span>' +
      '<span class="thinking-step" id="thinking-step"></span></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function _setThinkingStep(text) {
    var el = document.getElementById('thinking-step');
    if (el) el.textContent = text;
  }

  function _removeThinkingBubble() {
    var el = document.getElementById('msg-thinking');
    if (el) el.remove();
  }

  function _highlightSuggestion(question) {
    Array.prototype.forEach.call(document.querySelectorAll('.suggest-item'), function (el) {
      el.classList.toggle('selected', el.dataset.q === question);
    });
  }

  function _activateStep(n) {
    // 이전 loading 단계를 완료(active만) 상태로 전환
    Array.prototype.forEach.call(document.querySelectorAll('#step-list .step-item.loading'), function (el) {
      el.classList.remove('loading');
    });
    var el = document.querySelector('#step-list .step-item[data-step="' + n + '"]');
    if (el) {
      el.classList.add('active');
      el.classList.add('loading');
    }
  }

  function _renderAnswerCard(script) {
    var assetsHtml = script.resultType === 'pc'
      ? _renderPcTable(script.assets)
      : _renderVehicleTable(script.assets);

    var btnsHtml = script.buttons.map(function (b) {
      var cls = b.style === 'primary' ? 'btn-answer-primary' : 'btn-answer-outline';
      return '<button class="' + cls + '" onclick="aiAnswerAction(\'' + b.action + '\')">' + b.label + '</button>';
    }).join('');

    var body = document.getElementById('ai-chat-body');
    var div = document.createElement('div');
    div.className = 'msg agent answer';
    div.innerHTML = '<div class="msg-bubble answer-bubble">' +
      '<div class="answer-intro">' + script.intro + '</div>' +
      '<div class="answer-meta">' + script.meta + '</div>' +
      assetsHtml +
      '<div class="answer-action-text">조치 안내: ' + script.actionText + '</div>' +
      '<div class="answer-actions">' + btnsHtml + '</div>' +
    '</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function _renderPcTable(list) {
    var rows = list.map(function (a) {
      return '<tr data-asset-id="' + a.id + '" onclick="openAiDetail(\'' + a.id + '\')">' +
        '<td>' + a.id + '</td>' +
        '<td>' + a.name + '</td>' +
        '<td>' + a.usedYears + '년</td>' +
        '<td>' + a.department + '</td>' +
        '<td><span class="tag-badge ' + a.statusTone + '">' + a.status + '</span></td>' +
      '</tr>';
    }).join('');
    return '<div class="answer-table-wrap"><table class="answer-table">' +
      '<thead><tr><th>자산번호</th><th>자산명</th><th>사용연수</th><th>부서</th><th>상태</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function _renderVehicleTable(list) {
    var rows = list.map(function (a) {
      return '<tr data-asset-id="' + a.id + '" onclick="openAiDetail(\'' + a.id + '\')">' +
        '<td>' + a.vehicleNo + '</td>' +
        '<td>' + a.model + '</td>' +
        '<td>' + a.insurance.company + '</td>' +
        '<td>' + a.insurance.endDate + '</td>' +
        '<td><span class="tag-badge ' + a.statusTone + '">D-' + a.dDay + '</span></td>' +
        '<td>' + a.department + '</td>' +
      '</tr>';
    }).join('');
    return '<div class="answer-table-wrap"><table class="answer-table">' +
      '<thead><tr><th>차량번호</th><th>차종</th><th>보험사</th><th>만료일</th><th>D-day</th><th>부서</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function _renderRightAfterAnswer(script) {
    // 관련 자산 칩
    var chips = document.getElementById('related-chips');
    chips.innerHTML = script.relatedChips.map(function (c) {
      return '<span class="related-chip">' + c.label + ' <b>' + c.count + '</b></span>';
    }).join('');
    document.getElementById('related-empty').style.display = 'none';
    chips.style.display = '';
    // 위험도 분포
    var risk = document.getElementById('risk-mini-row');
    var rd = script.riskDist;
    risk.innerHTML =
      '<span class="risk-mini-badge red">HIGH ' + rd.high + '</span>' +
      '<span class="risk-mini-badge amber">MEDIUM ' + rd.medium + '</span>' +
      '<span class="risk-mini-badge blue">LOW ' + rd.low + '</span>';
    risk.style.display = '';
    // 영향 비용
    document.getElementById('cost-value').textContent = script.cost.value;
    document.getElementById('cost-sub').textContent = script.cost.sub;
    document.getElementById('ai-cost-card').classList.add('highlight');
    // 추천 조치
    var al = document.getElementById('action-list');
    al.innerHTML = script.actions.map(function (a) {
      return '<li><span class="ac-check">☐</span> ' + a + '</li>';
    }).join('');
    document.getElementById('actions-empty').style.display = 'none';
    al.style.display = '';
  }

  function askAgent(question) {
    if (!question || !AI.scripts[question]) {
      // 매칭 안 되는 질문 — 기본 응답
      _appendUserBubble(question || '');
      var body = document.getElementById('ai-chat-body');
      var div = document.createElement('div');
      div.className = 'msg agent';
      div.innerHTML = '<div class="msg-bubble">해당 질의를 분석하려면 데이터셋이 더 필요합니다. 좌측 추천 질문을 이용해 주세요.</div>';
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      document.getElementById('ai-chat-text').value = '';
      return;
    }
    clearAgentTimers();
    var script = AI.scripts[question];
    _aiCurrentScript = script;
    _highlightSuggestion(question);
    document.getElementById('ai-chat-text').value = '';

    // 단계 카드 + 우측 결과 초기화
    resetAgentRight();
    // 진행 중인 분析중 인디케이터만 제거 (이전 답변 유지)
    _removeThinkingBubble();
    // 0ms: 사용자 버블 + 분석중 인디케이터 + 단계1 활성
    _appendUserBubble(question);
    _appendThinkingBubble();
    _activateStep(1);

    var t = [];
    t.push(setTimeout(function () { _setThinkingStep(script.thinkingSteps[0]); _activateStep(2); }, 350));
    t.push(setTimeout(function () { _activateStep(3); }, 700));
    t.push(setTimeout(function () { _setThinkingStep(script.thinkingSteps[1]); _activateStep(4); }, 1050));
    t.push(setTimeout(function () { _activateStep(5); }, 1400));
    t.push(setTimeout(function () { _activateStep(6); }, 1750));
    t.push(setTimeout(function () {
      _removeThinkingBubble();
      _renderAnswerCard(script);
      _renderRightAfterAnswer(script);
      // 마지막 단계 로딩 스피너 제거 (모든 단계 완료 상태로)
      Array.prototype.forEach.call(document.querySelectorAll('#step-list .step-item.loading'), function (el) {
        el.classList.remove('loading');
      });
      _aiSeq = null;
    }, 2100));
    _aiSeq = t;
  }

  function openAiDetail(assetId) {
    if (!_aiCurrentScript) return;
    var asset = _aiCurrentScript.assets.find(function (a) { return a.id === assetId; });
    if (!asset) return;
    // 행 선택 강조
    Array.prototype.forEach.call(document.querySelectorAll('.answer-table tbody tr'), function (tr) {
      tr.classList.toggle('row-selected', tr.dataset.assetId === assetId);
    });
    // 우측 상세 패널 렌더
    var html = '<button class="detail-back" onclick="closeAiDetail()">← 분석 결과로 돌아가기</button>' +
      '<div class="detail-head">' +
        '<div class="detail-id">' + asset.id + '</div>' +
        '<div class="detail-name">' + asset.name + '</div>' +
        '<span class="tag-badge ' + asset.statusTone + '">' + asset.status + '</span>' +
      '</div>';

    if (_aiCurrentScript.resultType === 'pc') {
      var life = 5, used = asset.usedYears, depRate = Math.min(100, Math.round(used / life * 100));
      var isDanger = used >= life;
      html += '<div class="detail-section"><div class="detail-section-title">기본 정보</div>' +
        _detailRow('분류', asset.category) + _detailRow('모델', asset.model) +
        _detailRow('사용부서', asset.department) + _detailRow('사용자', asset.owner) +
        _detailRow('위치', asset.location) +
        _detailRow('취득일', asset.acquireDate + ' (사용 ' + used + '년)') +
        _detailRow('취득금액', asset.price.toLocaleString('ko-KR') + ' 원') +
      '</div>' +
      '<div class="detail-section"><div class="detail-section-title">감가상각 진행률</div>' +
        '<div class="dep-gauge-wrap">' +
          '<div class="dep-gauge-label"><span>내용연수 ' + life + '년 · 잔여 ' + (life - used).toFixed(1) + '년</span><span>' + depRate + '%</span></div>' +
          '<div class="dep-gauge-track"><div class="dep-gauge-fill' + (isDanger ? ' danger' : '') + '" style="width:' + depRate + '%"></div></div>' +
        '</div></div>';
    } else {
      var ins = asset.insurance;
      var dDayTone = asset.dDay <= 7 ? 'danger' : (asset.dDay <= 14 ? '' : '');
      var dDayPct = Math.max(0, Math.min(100, (asset.dDay / 365) * 100));
      html += '<div class="detail-section"><div class="detail-section-title">자산 정보</div>' +
        _detailRow('차량번호', asset.vehicleNo) + _detailRow('차종', asset.model) +
        _detailRow('사용부서', asset.department) + _detailRow('차량 담당', asset.owner) +
        _detailRow('위치', asset.location) + _detailRow('취득일', asset.acquireDate) +
        _detailRow('취득금액', asset.price.toLocaleString('ko-KR') + ' 원') +
      '</div>' +
      '<div class="detail-section"><div class="detail-section-title">보험 계약</div>' +
        _detailRow('보험사', ins.company) + _detailRow('증권번호', ins.policyNo) +
        _detailRow('보장 범위', ins.coverage) +
        _detailRow('시작일', ins.startDate) +
        _detailRow('만료일', ins.endDate + ' (D-' + asset.dDay + ')') +
        _detailRow('연간 보험료', ins.annualPremium.toLocaleString('ko-KR') + ' 원') +
        _detailRow('자동 갱신', ins.autoRenew ? '☑ 설정됨' : '☐ 미설정 ⚠') +
        '<div class="dep-gauge-wrap" style="margin-top:10px">' +
          '<div class="dep-gauge-label"><span>보험 잔여일</span><span>D-' + asset.dDay + '</span></div>' +
          '<div class="dep-gauge-track"><div class="dep-gauge-fill ' + dDayTone + '" style="width:' + dDayPct + '%"></div></div>' +
        '</div></div>';
    }

    // 최근 이력
    html += '<div class="detail-section"><div class="detail-section-title">최근 이력</div>' +
      '<ul class="detail-timeline">' +
      asset.history.slice().reverse().map(function (h) {
        return '<li><span class="dt-date">' + h.date + '</span> · <b>' + h.type + '</b> · ' + h.detail + '</li>';
      }).join('') +
      '</ul></div>';

    // AI 진단
    html += '<div class="detail-ai-note"><div class="ain-title">🤖 AI 진단</div>' +
      '<div class="ain-body">' + asset.aiNote + '</div></div>';

    // 액션 버튼
    var actionBtns = _aiCurrentScript.resultType === 'pc'
      ? '<button class="btn-answer-outline" onclick="aiAnswerAction(\'history\')">📑 원장관리에서 자세히 보기</button>' +
        '<button class="btn-answer-primary" onclick="aiAnswerAction(\'itsm\')">🛠 ITSM 조치 등록</button>'
      : '<button class="btn-answer-outline" onclick="aiAnswerAction(\'history\')">📑 차량 자산상세 보기</button>' +
        '<button class="btn-answer-primary" onclick="aiAnswerAction(\'approval\')">📝 전자결재 갱신 상신</button>';
    html += '<div class="detail-actions">' + actionBtns + '</div>';

    document.getElementById('ai-right-detail').innerHTML = html;
    document.getElementById('ai-right').classList.add('detail-mode');
  }

  function _detailRow(label, value) {
    return '<div class="detail-row"><span class="dr-label">' + label + '</span>' +
      '<span class="dr-value">' + value + '</span></div>';
  }

  function closeAiDetail() {
    document.getElementById('ai-right').classList.remove('detail-mode');
    Array.prototype.forEach.call(document.querySelectorAll('.answer-table tbody tr'), function (tr) {
      tr.classList.remove('row-selected');
    });
  }

  function resetAgent() {
    clearAgentTimers();
    _aiCurrentScript = null;
    Array.prototype.forEach.call(document.querySelectorAll('.suggest-item'), function (el) {
      el.classList.remove('selected');
    });
    renderAgentInit();
    // 인사 메시지 fade-in 재등장
    setTimeout(_appendGreetingBubble, 200);
  }

  function submitAgentInput(e) {
    e.preventDefault();
    var v = document.getElementById('ai-chat-text').value.trim();
    if (!v) return false;
    askAgent(v);
    return false;
  }

  function aiAnswerAction(action) {
    var msgMap = {
      'history':  '시연용 프로토타입입니다. 자산이력 화면은 원장관리에서 확인할 수 있습니다.',
      'itsm':     '시연용 프로토타입입니다. ITSM 조치 등록 화면은 별도 시스템 연계 예정입니다.',
      'approval': '시연용 프로토타입입니다. 전자결재 갱신 상신 화면은 별도 시스템 연계 예정입니다.'
    };
    alert(msgMap[action] || '시연용 프로토타입입니다.');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  // ESC 키로 자산 상세 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('ai-right') &&
        document.getElementById('ai-right').classList.contains('detail-mode')) {
      closeAiDetail();
    }
  });

  // 전역 노출 (onclick 핸들러용)
  window.askAgent = askAgent;
  window.openAiDetail = openAiDetail;
  window.closeAiDetail = closeAiDetail;
  window.resetAgent = resetAgent;
  window.submitAgentInput = submitAgentInput;
  window.aiAnswerAction = aiAnswerAction;

  // ===== 시작 =====
  renderDashboard();
  renderListView();
  renderAgentInit();
  // 해시가 있으면 그 화면으로, 없으면 대시보드를 기본으로
  if (location.hash && location.hash.length > 2) {
    _renderView(location.hash);
  } else {
    history.replaceState(null, "", "#/dashboard"); // hashchange 없이 URL만 교체
    _renderView("#/dashboard");
  }
})();

// ===== 알림 팝업 =====
(function () {
  var btnNotify = document.getElementById('btn-notify');
  var popup     = document.getElementById('notify-popup');
  var badge     = document.getElementById('notify-badge');
  if (!btnNotify || !popup) return;

  var count = 3;

  function updateBadge() {
    if (!badge) return;
    if (count <= 0) { badge.hidden = true; }
    else { badge.hidden = false; badge.textContent = count; }
  }

  // 팝업 열기 / 닫기 (내 업무 현황 팝업은 함께 닫음)
  btnNotify.addEventListener('click', function (e) {
    e.stopPropagation();
    var myworkPopup = document.getElementById('mywork-popup');
    if (myworkPopup) myworkPopup.hidden = true;
    popup.hidden = !popup.hidden;
  });

  // 팝업 바깥 클릭 → 닫기
  document.addEventListener('click', function (e) {
    if (!popup.hidden && !popup.contains(e.target) && e.target !== btnNotify) {
      popup.hidden = true;
    }
  });

  // 팝업 내부 버튼 처리
  popup.addEventListener('click', function (e) {
    e.stopPropagation();

    // 해제 / 지우기
    var actBtn = e.target.closest('.np-act-btn');
    if (actBtn) {
      var idx    = actBtn.dataset.idx;
      var action = actBtn.dataset.action;
      var item   = document.getElementById('np-item-' + idx);
      if (action === 'delete') {
        var div = document.getElementById('np-div-' + idx);
        if (div) div.remove();
        if (item) item.remove();
        count = Math.max(0, count - 1);
        updateBadge();
      } else if (action === 'dismiss') {
        if (item) {
          item.classList.remove('np-item-focused');
          var btnsRow = item.querySelector('.np-item-btns');
          if (btnsRow) btnsRow.remove();
        }
        count = Math.max(0, count - 1);
        updateBadge();
      }
      return;
    }

    // 더보기 → 해당 항목 이동
    var moreBtn = e.target.closest('.np-more-btn');
    if (moreBtn) {
      popup.hidden = true;
      location.hash = '#/list';
      return;
    }

    // 전체 알림 보기 → 닫기
    if (e.target.closest('.np-view-all')) {
      popup.hidden = true;
      return;
    }

    // 알림 항목 클릭 → 해당 화면으로 이동 + 읽음 처리
    var npItem = e.target.closest('.np-item[data-nav]');
    if (npItem && !e.target.closest('button')) {
      var nav = npItem.getAttribute('data-nav');
      npItem.classList.add('np-item-read');
      npItem.classList.remove('np-item-focused');
      var btns = npItem.querySelector('.np-item-btns');
      if (btns) btns.remove();
      count = Math.max(0, count - 1);
      updateBadge();
      popup.hidden = true;
      location.hash = '#' + nav;
    }
  });

  // 모두 지우기
  var clearAllBtn = document.getElementById('np-clear-all');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var body = document.getElementById('np-body');
      if (body) body.innerHTML = '<div class="np-empty">새 알림이 없습니다</div>';
      count = 0;
      updateBadge();
    });
  }
})();

// ===== 내 업무 현황 팝업 =====
(function () {
  var btnMywork    = document.getElementById('btn-mywork');
  var myworkPopup  = document.getElementById('mywork-popup');
  var notifyPopup  = document.getElementById('notify-popup');

  if (!btnMywork || !myworkPopup) return;

  btnMywork.addEventListener('click', function (e) {
    e.stopPropagation();
    var isHidden = myworkPopup.hidden;
    if (notifyPopup) notifyPopup.hidden = true;
    myworkPopup.hidden = !isHidden;
  });

  document.addEventListener('click', function (e) {
    if (!myworkPopup.hidden && !myworkPopup.contains(e.target) && e.target !== btnMywork) {
      myworkPopup.hidden = true;
    }
  });
})();

// ===== 마이페이지 (아바타) =====
(function () {
  var btnAvatar = document.getElementById('btn-avatar');
  if (!btnAvatar) return;
  btnAvatar.addEventListener('click', function () {
    alert('마이페이지 준비 중입니다.');
  });
})();

// ===== 자산 등록 모달 =====
function openRegisterModal() {
  document.getElementById('register-modal').classList.add('open');
  document.getElementById('reg-name').focus();
}
function closeRegisterModal() {
  var modal = document.getElementById('register-modal');
  modal.classList.remove('open');
  ['reg-name','reg-model','reg-owner','reg-location','reg-date','reg-price'].forEach(function(id) {
    document.getElementById(id).value = '';
    document.getElementById(id).style.borderColor = '';
  });
  ['reg-category','reg-department','reg-status'].forEach(function(id) {
    document.getElementById(id).selectedIndex = 0;
    document.getElementById(id).style.borderColor = '';
  });
}
function saveNewAsset() {
  var name = document.getElementById('reg-name').value.trim();
  var category = document.getElementById('reg-category').value;
  var dept = document.getElementById('reg-department').value;
  var valid = true;
  [['reg-name', name], ['reg-category', category], ['reg-department', dept]].forEach(function(pair) {
    var el = document.getElementById(pair[0]);
    if (!pair[1]) { el.style.borderColor = '#EF4444'; valid = false; }
    else { el.style.borderColor = ''; }
  });
  if (!valid) return;
  var assets = window.APP_DATA.assets;
  var lastNum = assets.reduce(function(max, a) {
    var m = a.id.match(/AST-\d{4}-(\d+)/);
    return m ? Math.max(max, parseInt(m[1])) : max;
  }, 0);
  var year = new Date().getFullYear();
  var newId = 'AST-' + year + '-' + String(lastNum + 1).padStart(4, '0');
  var newAsset = {
    id: newId,
    name: name,
    category: category,
    model: document.getElementById('reg-model').value.trim() || '-',
    department: dept,
    owner: document.getElementById('reg-owner').value.trim() || '-',
    location: document.getElementById('reg-location').value.trim() || '-',
    status: document.getElementById('reg-status').value,
    acquireDate: document.getElementById('reg-date').value || new Date().toISOString().slice(0,10),
    price: parseInt(document.getElementById('reg-price').value) || 0,
    history: [{ date: new Date().toISOString().slice(0,10), type: '등록', detail: '자산 신규 등록' }]
  };
  assets.unshift(newAsset);
  closeRegisterModal();
  location.hash = '#/list';
  if (window._assetApplyFilter) { window._assetApplyFilter(); }
}

// ===== 사이드바 토글 =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}
