// 고정자산관리시스템 (시연용) - 화면 동작
// data.js 가 먼저 읽혀서 window.APP_DATA 에 자산 목록(assets)과 대시보드 요약(dashboard)이 들어 있습니다.

// ── 인트로 오버레이 ──────────────────────────────────────────────
// INTRO_ENABLED: 인트로 화면 사용 여부 스위치.
//   false → 사이트 진입 시 대시보드가 바로 보임(현재 기본값).
//   true  → 진입 시 인트로 오버레이를 먼저 보여주고, 클릭하면 대시보드로 전환.
//   (인트로 화면 HTML/CSS/JS는 그대로 보존돼 있어, 이 값만 true로 바꾸면 즉시 부활)
var INTRO_ENABLED = false;
(function () {
  var overlay = document.getElementById('intro-overlay');
  var block   = overlay && overlay.querySelector('.intro-block');
  if (!overlay || !block) return;

  // 인트로 비활성: 오버레이를 숨기고 평소처럼 대시보드가 보이도록 둔다.
  if (!INTRO_ENABLED) {
    window._introActive = false;
    overlay.style.display = 'none';
    return;
  }

  // intro가 있는 동안 대시보드를 완전히 숨겨둠 (display:none 상태 유지)
  window._introActive = true;
  var dashView = document.getElementById('view-dashboard');
  if (dashView) dashView.classList.remove('active');

  function dismiss() {
    overlay.classList.add('hiding');
    overlay.addEventListener('animationend', function () { overlay.style.display = 'none'; }, { once: true });
  }

  block.addEventListener('click', function () {
    window._introActive = false;
    dismiss();
    // 페이드아웃(0.9s) 완료 후 → 빈 화면에서 대시보드 애니메이션 시작
    setTimeout(function () {
      if (typeof triggerDashboardAnimations === 'function') triggerDashboardAnimations();
    }, 900);
  });
})();

(async function () {
  // Supabase에서 자산 데이터 로드 — 실패 시 로컬 샘플 데이터로 자동 폴백
  var assets = window.APP_DATA.assets;  // 기본값: 로컬 샘플 데이터
  var _dbSource = 'local';
  try {
    var loaded = await window.DB.loadAssets();
    if (loaded && loaded.length > 0) {
      assets = loaded;
      window.APP_DATA.assets = assets;
      _dbSource = 'supabase';
    }
  } catch (e) {
    console.warn('[DB] Supabase 로드 실패, 로컬 데이터 사용:', e.message);
  } finally {
    var _dbOverlay = document.getElementById('db-loading');
    if (_dbOverlay) _dbOverlay.hidden = true;
  }
  var DASH = window.APP_DATA.dashboard;
  function won(n) { return n.toLocaleString("ko-KR") + "원"; }

  var navItems = document.querySelectorAll(".nav-item");
  var tabs = document.querySelectorAll(".tab");
  var soonTitle = document.getElementById("soon-title");
  var sectionIds = ["dashboard", "list", "detail", "soon", "ai-agent", "report"];

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
      // intro가 활성 중이면 dashboard는 active를 주지 않음 (intro 클릭 시 직접 처리)
      var isActive = k === name;
      if (isActive && k === 'dashboard' && window._introActive) isActive = false;
      document.getElementById("view-" + k).classList.toggle("active", isActive);
    });
    var contentEl = document.querySelector('.content');
    if (contentEl) contentEl.scrollTop = 0;
    if (name === 'dashboard' && !window._introActive) triggerDashboardAnimations();
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
    if (view === "report") {
      showSection("report");
      activateSidebar("ai-agent");
      activateTab(null);
      renderReportPage();
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

  // 로고(브랜드) 클릭 → 대시보드 이동 or 새로고침
  var brandEl = document.querySelector('.brand');
  if (brandEl) {
    brandEl.style.cursor = 'pointer';
    brandEl.addEventListener('click', function () {
      if (window._projectMode) { exitProjectMode(); return; }
      var cur = (location.hash || '').replace(/^#\//, '').split('/')[0] || 'dashboard';
      if (cur === 'dashboard') {
        // 이미 대시보드: DOM 전체 재렌더 → 스크롤 맨 위 → 진입 애니메이션 재실행
        renderDashboard();
        var contentEl = document.querySelector('.content');
        if (contentEl) contentEl.scrollTop = 0;
        triggerDashboardAnimations();
      } else {
        navigate('dashboard');
        _renderView(location.hash);
      }
    });
  }

  // ===== 비밀 버튼 → 프로젝트 관리 모드 =====
  // 보안 메모: 비밀번호 평문을 소스에 두지 않는다.
  //  - 비밀번호 자체 대신 SHA-256 해시값(PW_HASH)만 저장한다.
  //  - 입력값을 같은 방식(SALT+입력)으로 해시해 비교하므로, 소스/개발자도구에는
  //    의미 없는 64자리 해시만 노출된다. (단방향이라 역산으로 원문 복구 불가)
  //  - 서버·인터넷 없이 file:// 더블클릭 환경에서도 동작하도록 외부 라이브러리·
  //    crypto.subtle 의존 없이 순수 JS SHA-256을 사용한다.
  //  ※ 비밀번호를 바꾸려면: HASHGEN.md의 안내대로 새 해시를 생성해 PW_HASH만 교체.
  var PW_SALT = "nh-fams-proj::";
  var PW_HASH = "0be5e5c74b01a0c0f5cc881ffb74b8e6a0b52b99958c846f1d65b590b9493d23";

  // 순수 JS SHA-256 (외부 의존 없음, 표준 SHA-256과 동일 결과)
  function sha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), result = '', words = [];
    var asciiBitLength = ascii.length * 8;
    var hash = sha256.h = sha256.h || [], k = sha256.k = sha256.k || [];
    var primeCounter = k.length, isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (var i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength);
    for (var j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (var i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (var i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
    }
    for (var i = 0; i < 8; i++) {
      for (var j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  var secretBtn = document.getElementById('secret-ver');
  var pwModal = document.getElementById('pw-modal');
  var pwInput = document.getElementById('pw-input');
  var pwError = document.getElementById('pw-error');
  var projectNav = document.getElementById('project-nav');
  var mainNav = document.getElementById('nav');

  function openPwModal() {
    if (!pwModal) return;
    pwError.hidden = true;
    pwInput.value = '';
    pwModal.classList.add('open');
    setTimeout(function () { pwInput.focus(); }, 50);
  }
  function closePwModal() {
    if (!pwModal) return;
    pwModal.classList.remove('open');
    pwInput.value = '';
    pwError.hidden = true;
    var d = pwModal.querySelector('.modal-dialog');
    if (d) d.classList.remove('shake');
  }
  function submitPw() {
    if (sha256(PW_SALT + pwInput.value.trim()) === PW_HASH) {
      closePwModal();
      enterProjectMode();
    } else {
      pwError.hidden = false;
      var d = pwModal.querySelector('.modal-dialog');
      if (d) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); }
      pwInput.value = '';
      pwInput.focus();
    }
  }
  function enterProjectMode() {
    window._projectMode = true;
    document.body.classList.add('proj-mode');
    if (mainNav) mainNav.hidden = true;
    if (projectNav) projectNav.hidden = false;
    sectionIds.forEach(function (k) {
      var el = document.getElementById('view-' + k);
      if (el) el.classList.remove('active');
    });
    var pv = document.getElementById('view-project');
    if (pv) pv.classList.add('active');
    var c = document.querySelector('.content');
    if (c) c.scrollTop = 0;
    // 비밀번호 인증 후 이미지 경로 주입 (HTML 소스에는 src="" — 크롤러에 URL 미노출)
    document.querySelectorAll('.pj-shot-img[data-pskey]').forEach(function (img) {
      var path = 'images/proj-screens/' + img.dataset.pskey + '.png';
      img.src = path;
      var btn = img.closest('.pj-shot');
      if (btn) btn.dataset.full = path;
    });
    // 첫 진입: 첫 메뉴 활성 표시
    if (projectNav) {
      var links = projectNav.querySelectorAll('.pj-link');
      links.forEach(function (a, i) { a.classList.toggle('active', i === 0); });
    }
  }
  function exitProjectMode() {
    window._projectMode = false;
    document.body.classList.remove('proj-mode');
    var pv = document.getElementById('view-project');
    if (pv) pv.classList.remove('active');
    if (projectNav) projectNav.hidden = true;
    if (mainNav) mainNav.hidden = false;
    navigate('dashboard');
    _renderView(location.hash);
  }
  function showProjectSection(id, clickedEl) {
    if (!id || !projectNav) return;
    projectNav.querySelectorAll('.pj-link').forEach(function (a) {
      // clickedEl이 주어지면 해당 요소만 active, 아니면 data-pj 기준
      a.classList.toggle('active', clickedEl ? a === clickedEl : a.dataset.pj === id);
    });
    var sec = document.getElementById(id);
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (secretBtn) {
    secretBtn.addEventListener('click', function () {
      if (window._projectMode) exitProjectMode();
      else openPwModal();
    });
  }
  if (pwModal) {
    pwModal.addEventListener('click', function (e) { if (e.target === pwModal) closePwModal(); });
    var pwCloseBtn = document.getElementById('pw-close');
    var pwCancelBtn = document.getElementById('pw-cancel');
    var pwOkBtn = document.getElementById('pw-ok');
    if (pwCloseBtn) pwCloseBtn.addEventListener('click', closePwModal);
    if (pwCancelBtn) pwCancelBtn.addEventListener('click', closePwModal);
    if (pwOkBtn) pwOkBtn.addEventListener('click', submitPw);
    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitPw(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pwModal.classList.contains('open')) closePwModal();
    });
  }
  if (projectNav) {
    projectNav.querySelectorAll('.pj-group-head').forEach(function (h) {
      h.addEventListener('click', function () { h.parentElement.classList.toggle('collapsed'); });
    });
    projectNav.querySelectorAll('.pj-link').forEach(function (a) {
      a.addEventListener('click', function () {
        // As-Is 상위 링크는 하위 트리도 펼침/접힘
        if (a.classList.contains('pj-link-parent')) {
          var sg = a.closest('.pj-subgroup');
          if (sg) sg.classList.toggle('open');
        }
        showProjectSection(a.dataset.pj, a);
        // data-anchor 속성이 있으면 해당 차트 카드로 추가 스크롤
        if (a.dataset.anchor) {
          setTimeout(function () {
            var el = document.getElementById(a.dataset.anchor);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 350);
        }
      });
    });
  }

  // ===== 적응형 디자인 — 모바일 인증 + 드로어 =====
  // sha256·PW_HASH·PW_SALT·enterProjectMode 가 이 IIFE 스코프 안에 있어 그대로 사용
  (function () {
    if (!document.body.classList.contains('is-mobile')) return;

    var mPwInput       = document.getElementById('m-pw-input');
    var mPwError       = document.getElementById('m-pw-error');
    var mPwOk          = document.getElementById('m-pw-ok');
    var mHamburger     = document.getElementById('m-hamburger');
    var mDrawerOverlay = document.getElementById('m-drawer-overlay');
    var mTopbarExit    = document.getElementById('m-topbar-exit');
    var mAuthScreen    = document.getElementById('mobile-auth-screen');
    var sidebar        = document.getElementById('sidebar');

    // ── 인증 처리 ──
    function mobileAuthSubmit() {
      if (!mPwInput) return;
      if (mPwError) mPwError.hidden = true;
      var val = mPwInput.value.trim();
      if (sha256(PW_SALT + val) === PW_HASH) {
        if (mAuthScreen) mAuthScreen.style.display = 'none';
        document.body.classList.add('m-authed');
        enterProjectMode();
        if (mPwInput) mPwInput.value = '';
      } else {
        if (mPwError) {
          mPwError.hidden = false;
          // 오류 텍스트 흔들림 재실행
          mPwError.style.animation = 'none';
          void mPwError.offsetWidth;
          mPwError.style.animation = '';
        }
        if (mPwInput) { mPwInput.value = ''; mPwInput.focus(); }
      }
    }

    if (mPwOk)    mPwOk.addEventListener('click', mobileAuthSubmit);
    if (mPwInput) {
      mPwInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); mobileAuthSubmit(); }
        if (mPwError && !mPwError.hidden) mPwError.hidden = true;
      });
    }

    // ── 드로어 열기/닫기 ──
    function openDrawer() {
      if (sidebar)        sidebar.classList.add('drawer-open');
      if (mDrawerOverlay) mDrawerOverlay.classList.add('visible');
    }
    function closeDrawer() {
      if (sidebar)        sidebar.classList.remove('drawer-open');
      if (mDrawerOverlay) mDrawerOverlay.classList.remove('visible');
    }

    // 햄버거 버튼
    if (mHamburger) mHamburger.addEventListener('click', function () {
      if (sidebar && sidebar.classList.contains('drawer-open')) closeDrawer();
      else openDrawer();
    });

    // 드로어 오버레이 → 닫기
    if (mDrawerOverlay) mDrawerOverlay.addEventListener('click', closeDrawer);

    // 프로젝트 네비 링크 클릭 → 150ms 후 드로어 닫기 (스크롤 시작 후 닫힘)
    var pjNav = document.getElementById('project-nav');
    if (pjNav) {
      pjNav.addEventListener('click', function (e) {
        if (e.target.closest('.pj-link')) setTimeout(closeDrawer, 150);
      });
    }

    // 나가기 → 페이지 새로고침으로 인증 초기화
    if (mTopbarExit) mTopbarExit.addEventListener('click', function () {
      location.reload();
    });
  })();

  // ===== 화면 디자인 라이트박스 (크게 보기) =====
  var lightbox = document.getElementById('pj-lightbox');
  var lightboxImg = document.getElementById('pj-lightbox-img');
  var lightboxClose = document.getElementById('pj-lightbox-close');
  function openLightbox(src, alt) {
    if (!lightbox || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
  }
  document.querySelectorAll('.pj-shot').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      openLightbox(btn.dataset.full, img ? img.alt : '');
    });
  });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) { if (e.target !== lightboxImg) closeLightbox(); });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });
  }

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
    attachEllipsisTips();
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
      // expAdjust: 오른쪽으로 N px 이동 → right = calc(100% + (6-N)px)
      var expRightOverride = (r.expDir==='left' && r.expAdjust)
        ? ' style="right: calc(100% + ' + (6 - r.expAdjust) + 'px) !important"' : '';
      return '<div class="region-marker dir-'+r.dir+'" data-i="'+i+'" style="left:'+r.x+'%;top:'+r.y+'%">' +
        '<div class="callout callout-exp'+expExtra+'"' + expRightOverride + ' id="callout-exp-'+i+'">' +
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
        var marker = document.querySelector('.region-marker[data-i="'+i+'"]');
        if (exp) exp.classList.toggle('is-active', i === idx);
        if (cmp) cmp.style.display = (i === idx) ? 'none' : 'flex';
        if (marker) { marker.style.zIndex = (i === idx) ? '20' : '10'; marker.classList.toggle('is-active', i === idx); }
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
  function attachEllipsisTips() {
    var sel = '#top5-list .rk-title, #top5-list .rk-sub,' +
              '#issue-list .is-title, #issue-list .is-sub,' +
              '#sched-list .sc-title, #sched-list .sc-sub';
    document.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        if (el.scrollWidth > el.clientWidth) showTip(e.clientX, e.clientY, el.textContent);
      });
      el.addEventListener('mousemove', function (e) {
        if (el.scrollWidth > el.clientWidth) showTip(e.clientX, e.clientY, el.textContent);
      });
      el.addEventListener('mouseleave', hideTip);
    });
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
  window.triggerDashboardAnimations = triggerDashboardAnimations;
  function triggerDashboardAnimations() {
    // CSS 애니메이션 리셋: active 클래스를 잠깐 제거 → reflow → 다시 추가
    var dashView = document.getElementById('view-dashboard');
    dashView.classList.remove('active');
    void dashView.offsetWidth; // 강제 reflow (애니메이션 초기화)
    dashView.classList.add('active');

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
    // 입력창 자동 타이핑 리스너 연결
    setupAutoType();
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
      '<div class="answer-actions">' +
        btnsHtml +
        '<button class="btn-report-draft" onclick="showReportDraft(\'' + script.resultType + '\')">📄 보고서 작성</button>' +
      '</div>' +
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

  function _findMatchingScript(question) {
    if (!question) return null;
    var keys = Object.keys(AI.scripts);

    // 1단계: 완전 일치
    if (AI.scripts[question]) return { script: AI.scripts[question], key: question };

    // 정규화: 공백 전부 제거 + 소문자
    var norm = function(s) { return s.replace(/\s+/g, '').toLowerCase(); };
    var normQ = norm(question);

    // 2단계: 공백 제거 후 완전 일치 (띄어쓰기 오류 처리)
    for (var i = 0; i < keys.length; i++) {
      if (norm(keys[i]) === normQ) return { script: AI.scripts[keys[i]], key: keys[i] };
    }

    // 3단계: 키워드 포함 스코어링 (오타·부분 입력 처리)
    // 각 스크립트 키의 단어들이 정규화된 입력 안에 몇 개나 포함되는지 비율 계산
    var getWords = function(s) {
      return s.toLowerCase().split(/\s+/).filter(function(w) { return w.length >= 2; });
    };
    var bestScore = 0, bestKey = null;
    for (var j = 0; j < keys.length; j++) {
      var kWords = getWords(keys[j]);
      var matched = 0;
      for (var k = 0; k < kWords.length; k++) {
        if (normQ.indexOf(norm(kWords[k])) !== -1) matched++;
      }
      var score = kWords.length > 0 ? matched / kWords.length : 0;
      if (score > bestScore) { bestScore = score; bestKey = keys[j]; }
    }

    // 키워드 20% 이상 포함 시 매칭
    if (bestScore >= 0.2 && bestKey) return { script: AI.scripts[bestKey], key: bestKey };
    return null;
  }

  function askAgent(question) {
    var matched = _findMatchingScript((question || '').trim());
    if (!question || !matched) {
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
    var script = matched.script;
    _aiCurrentScript = script;
    _highlightSuggestion(matched.key);
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

  // ===== AI Agent 입력창 자동 타이핑 =====
  var _autoTypeQuery = '본점영업부에서 보험 만료 예정인 차량 목록 조회해줘';
  var _autoTypeUsed  = false;   // 한 세션에서 한 번만 작동

  function setupAutoType() {
    var inp = document.getElementById('ai-chat-text');
    if (!inp || inp._autoTypeBound) return;
    inp._autoTypeBound = true;

    inp.addEventListener('click', function onInputClick() {
      if (_autoTypeUsed) return;
      if (inp.value.trim()) return;   // 이미 타이핑된 내용 있으면 건드리지 않음
      _autoTypeUsed = true;
      inp.removeEventListener('click', onInputClick);

      inp.readOnly = true;
      inp.style.caretColor = 'transparent';   // 커서 깜빡임 숨김

      var text = _autoTypeQuery;
      var i = 0;
      // 글자마다 35~65ms 사이 랜덤 딜레이 → 자연스러운 타이핑
      function typeNext() {
        if (i >= text.length) {
          inp.readOnly = false;
          inp.style.caretColor = '';
          // 타이핑 완료 후 350ms 뒤 자동 전송
          setTimeout(function () {
            inp.readOnly = false;
            askAgent(inp.value.trim());
            inp.value = '';
          }, 350);
          return;
        }
        inp.value += text[i++];
        var delay = 35 + Math.floor(Math.sin(i * 7.3) * 15 + 15);  // 35~65ms 패턴
        setTimeout(typeNext, delay);
      }
      setTimeout(typeNext, 120);   // 클릭 후 약간의 준비 시간
    });
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

  // ===== 보고서 화면 =====
  var _reportContext = 'vehicle';

  function showReportDraft(resultType) {
    _reportContext = resultType || 'vehicle';
    navigate('report');
    _renderView('#/report');
  }

  var _reportTypeMap = {
    vehicle: [
      { id: 'vehicle-ins', icon: '🛡', title: '차량 보험 만료 현황 보고서', sub: '만료 임박 차량 현황 + 갱신 우선순위 분석' },
      { id: 'budget',      icon: '💰', title: '분기 교체 예산 보고서',     sub: '2026년 2분기 예상 교체비용 산출 + 예산 영향 분석' },
      { id: 'fault',       icon: '⚠',  title: '반복 장애 자산 보고서',     sub: '최근 6개월 장애 3회 이상 자산 + 근본원인 분석' },
      { id: 'audit',       icon: '🔍', title: '감사 대응 점검누락 보고서', sub: '정기점검일 실시·증빙 누락 자산 + 보험 조회' }
    ],
    pc: [
      { id: 'aging',  icon: '🔄', title: '노후 자산 현황 보고서',     sub: '5년 이상 자산 운용·자산별 분류 + 교체 우선순위' },
      { id: 'budget', icon: '💰', title: '분기 교체 예산 보고서',     sub: '2026년 2분기 예상 교체비용 산출 + 예산 영향 분석' },
      { id: 'fault',  icon: '⚠',  title: '반복 장애 자산 보고서',     sub: '최근 6개월 장애 3회 이상 자산 + 근본원인 분석' },
      { id: 'audit',  icon: '🔍', title: '감사 대응 점검누락 보고서', sub: '정기점검일 실시·증빙 누락 자산 + 보험 조회' }
    ]
  };

  var _selectedReportType = null;

  function renderReportPage() {
    var types = _reportTypeMap[_reportContext] || _reportTypeMap.vehicle;
    _selectedReportType = types[0].id;
    var cardsHtml = types.map(function(t, i) {
      return '<div class="report-type-card' + (i === 0 ? ' active' : '') + '" data-report-id="' + t.id + '" onclick="selectReportType(\'' + t.id + '\')">' +
        '<div class="rtc-icon">' + t.icon + '</div>' +
        '<div class="rtc-title">' + t.title + '</div>' +
        '<div class="rtc-sub">' + t.sub + '</div>' +
      '</div>';
    }).join('');
    document.getElementById('report-type-cards').innerHTML = cardsHtml;
    document.getElementById('report-content-area').innerHTML =
      '<div class="report-loading"><div class="report-loading-spin"></div><span>AI Agent가 보고서를 작성하고 있습니다...</span></div>';
    setTimeout(function() { renderReportContent(_selectedReportType); }, 1800);
  }

  function selectReportType(typeId) {
    _selectedReportType = typeId;
    Array.prototype.forEach.call(document.querySelectorAll('.report-type-card'), function(c) {
      c.classList.toggle('active', c.dataset.reportId === typeId);
    });
    document.getElementById('report-content-area').innerHTML =
      '<div class="report-loading"><div class="report-loading-spin"></div><span>AI Agent가 보고서를 작성하고 있습니다...</span></div>';
    setTimeout(function() { renderReportContent(typeId); }, 1500);
  }

  function renderReportContent(typeId) {
    var html = '';
    if (typeId === 'vehicle-ins') html = _buildVehicleInsReport();
    else if (typeId === 'aging')   html = _buildAgingReport();
    else                           html = _buildGenericReport(typeId);
    document.getElementById('report-content-area').innerHTML = html;
  }

  function _rdToolbar() {
    return '<div class="rd-toolbar">' +
      '<div class="rd-tab active">Agent 자동 작성</div><div class="rd-tab">수정</div>' +
      '<div class="rd-toolbar-right">' +
        '<button class="btn-answer-outline">✏ 편집</button>' +
        '<button class="btn-answer-outline">🖨 PDF</button>' +
        '<button class="btn-answer-primary">📨 전자결재 상신</button>' +
      '</div></div>' +
      '<div class="rd-meta"><span>📅 보고일자 2026-06-01</span><span>✍ 작성인 AI Agent (담당자: 정보부-상)</span></div>';
  }

  function _buildVehicleInsReport() {
    var scriptData = window.APP_DATA.aiAgent.scripts['본점영업부에서 보험 만료 예정인 차량 목록 조회해줘'];
    var vehicles = (scriptData && scriptData.assets) ? scriptData.assets : [];
    var totalPremium = vehicles.reduce(function(s, v) { return s + v.insurance.annualPremium; }, 0);
    var manualRenew  = vehicles.filter(function(v) { return !v.insurance.autoRenew; }).length;
    var urgent       = vehicles.filter(function(v) { return v.dDay <= 7; }).length;

    var tableRows = vehicles.map(function(v) {
      var autoHtml = v.insurance.autoRenew
        ? '<span class="tag-badge green">자동갱신</span>'
        : '<span class="tag-badge red">미설정 ⚠</span>';
      return '<tr>' +
        '<td>' + v.id + '</td>' +
        '<td>' + v.name + '<br><small class="text-muted">' + v.model + '</small></td>' +
        '<td>' + v.vehicleNo + '</td>' +
        '<td>' + v.insurance.company + '</td>' +
        '<td>' + v.insurance.endDate + '</td>' +
        '<td><span class="tag-badge ' + v.statusTone + '">D-' + v.dDay + '</span></td>' +
        '<td>' + autoHtml + '</td>' +
        '<td class="text-right">' + (v.insurance.annualPremium / 10000).toLocaleString('ko-KR') + '만원</td>' +
      '</tr>';
    }).join('');

    var priorityItems = vehicles.filter(function(v) { return !v.insurance.autoRenew; }).map(function(v, i) {
      return '<li><b>' + (i + 1) + '순위:</b> ' + v.id + ' ' + v.name +
        ' — D-' + v.dDay + ' 이내 ' + v.insurance.company + ' 갱신 처리 필요 (담당: ' + v.owner + ')</li>';
    }).join('') +
    '<li><b>' + (manualRenew + 1) + '순위:</b> AST-2022-0220 임원차량 1호 — 자동갱신 설정이나 보장 범위(대물 10억·자차·자손) 적정성 재검토 권고</li>';

    return '<div class="report-doc">' +
      _rdToolbar() +
      '<h2 class="rd-title">차량 보험 만료 현황 보고서</h2>' +
      '<p class="rd-desc">본 보고서는 본점영업부 소속 차량 ' + vehicles.length + '대를 대상으로 보험 만료 현황 및 갱신 우선순위를 분석한 결과이다.</p>' +
      '<div class="rd-kpi-row">' +
        '<div class="rd-kpi"><div class="rd-kpi-num">' + vehicles.length + '건</div><div class="rd-kpi-label">만료 임박 차량</div></div>' +
        '<div class="rd-kpi"><div class="rd-kpi-num">' + manualRenew + '건</div><div class="rd-kpi-label">수동 갱신 필요</div></div>' +
        '<div class="rd-kpi"><div class="rd-kpi-num">' + (totalPremium / 10000).toLocaleString('ko-KR') + '만원</div><div class="rd-kpi-label">연간 보험료 합계</div></div>' +
        '<div class="rd-kpi"><div class="rd-kpi-num">' + urgent + '건</div><div class="rd-kpi-label">D-7 이내 긴급</div></div>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">1. 요약</div>' +
        '<p>전체 차량 ' + vehicles.length + '대 중 보험 만료 임박 차량이 ' + vehicles.length + '건이며, 이 중 <b>' + manualRenew + '건</b>은 자동 갱신이 미설정되어 있어 보험 공백 발생 위험이 있음.</p>' +
        '<p>특히 <b>AST-2021-0205(영업차량 3호)</b>는 D-7 이내로 즉시 갱신 처리가 필요하며, <b>AST-2022-0118(영업차량 1호)</b>는 D-12로 긴급 조치 대상임.</p>' +
        '<p>자동 갱신 설정 차량 4건은 갱신 보험료 확인 후 정상 처리 가능하나, 임원차량(G80)의 경우 보장 범위 재검토를 권고함.</p>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">2. 주요 현황</div>' +
        '<div class="rd-table-wrap"><table class="rd-table">' +
          '<thead><tr><th>자산번호</th><th>차명</th><th>차량번호</th><th>보험사</th><th>만료일</th><th>D-day</th><th>자동갱신</th><th>연간보험료</th></tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table></div>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">3. 위험 분석</div>' +
        '<ul class="rd-list">' +
          '<li><b>보험 공백 위험 2건:</b> AST-2021-0205(D-7), AST-2022-0118(D-12) — 자동갱신 미설정, 만료 시 사고 발생 시 보상 불가 위험</li>' +
          '<li><b>임원차량(제네시스 G80):</b> 자동갱신 설정되어 있으나 보장 범위(대물 10억·자차·자손) 재검토 및 갱신 보험료 협의 필요</li>' +
          '<li><b>리스차량(카니발 KA4):</b> 리스 계약 종료일과 보험 갱신 시점 불일치 가능성 — 리스사 별도 확인 필요</li>' +
          '<li><b>전사 현황:</b> 차량 보험 자동갱신 미설정 비율 33.3% — 전 차량 자동갱신 일괄 점검 권고</li>' +
        '</ul>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">4. 예산 영향</div>' +
        '<p>2026년 상반기 만료 차량 보험료 합계: <b>' + (totalPremium / 10000).toLocaleString('ko-KR') + '만원/년</b></p>' +
        '<p>전년 대비 보험료 변동폭: 평균 +3~5% 예상 (손해율 상승 및 물가 반영). 예상 증가액 약 <b>27~45만원</b></p>' +
        '<p>임원차량 재협상 또는 보장 범위 조정 시 연간 약 <b>30~50만원</b> 절감 가능.</p>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">5. 우선 조치 대상</div>' +
        '<ul class="rd-list rd-priority">' + priorityItems + '</ul>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">6. 결론 및 권고</div>' +
        '<ul class="rd-list">' +
          '<li>D-7 이내 만료 차량(영업차량 3호)에 대한 <b>즉각적인 보험 갱신 처리</b>가 필요함</li>' +
          '<li>자동갱신 미설정 차량(D-7, D-12) 담당자에게 <b>금일 내 처리 요청</b> 필요</li>' +
          '<li>전 차량에 대해 자동갱신 설정을 일괄 점검하고, 미설정 차량 관리 체계 구축 권고</li>' +
          '<li>분기별 정기 보험 만료 현황 보고 체계 수립 및 전자결재 시스템 연계 검토</li>' +
        '</ul>' +
      '</div>' +
      '<div class="rd-footer">※ 본 보고서는 당행 자산관리시스템의 데이터를 기반으로 AI Agent가 자동 작성하였으며, 참고 데이터는 시연용 샘플이므로 실제 데이터와 다를 수 있습니다.</div>' +
    '</div>';
  }

  function _buildAgingReport() {
    return '<div class="report-doc">' +
      _rdToolbar() +
      '<h2 class="rd-title">노후 자산 현황 보고서</h2>' +
      '<p class="rd-desc">본 보고서는 당행 자산 고정자산 1,247건을 대상으로 사용연도 5년 이상 노후 자산 187건의 현황과 교체 우선순위를 분석한 결과이다.</p>' +
      '<div class="rd-kpi-row">' +
        '<div class="rd-kpi"><div class="rd-kpi-num">187건</div><div class="rd-kpi-label">노후 자산 수</div></div>' +
        '<div class="rd-kpi"><div class="rd-kpi-num">15.0%</div><div class="rd-kpi-label">전체 대비 비율</div></div>' +
        '<div class="rd-kpi"><div class="rd-kpi-num">12.4억원</div><div class="rd-kpi-label">예상 교체비(총)</div></div>' +
        '<div class="rd-kpi"><div class="rd-kpi-num">42건</div><div class="rd-kpi-label">2분기 시사 최적</div></div>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">1. 요약</div>' +
        '<p>전체 자산 1,247건 중 노후 자산 187건(15.0%) 식별. 노후 자산 중 즉시 교체 권고는 42건(PC·복사기 86건, 모니터링 59건). 유형별로는 PC·노트북·ATM 순으로 노후 비율이 높음.</p>' +
      '</div>' +
      '<div class="rd-section"><div class="rd-section-title">2. 주요 현황</div>' +
        '<div class="rd-table-wrap"><table class="rd-table">' +
          '<thead><tr><th>유형</th><th>총 자산</th><th>노후 자산</th><th>비율</th><th>예상 교체비</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>PC</td><td>312</td><td>61</td><td>19.6%</td><td>9,150만원</td></tr>' +
            '<tr><td>노트북</td><td>184</td><td>38</td><td>20.7%</td><td>6,840만원</td></tr>' +
            '<tr><td>복사기</td><td>92</td><td>22</td><td>23.9%</td><td>7,700만원</td></tr>' +
            '<tr><td>ATM</td><td>78</td><td>14</td><td>17.9%</td><td>6.3억원</td></tr>' +
            '<tr><td>대형목적장비</td><td>104</td><td>18</td><td>17.3%</td><td>8,100만원</td></tr>' +
          '</tbody>' +
        '</table></div>' +
      '</div>' +
      '<div class="rd-footer">※ 본 보고서는 시연용 샘플 데이터 기반으로 자동 작성되었습니다.</div>' +
    '</div>';
  }

  function _buildGenericReport(typeId) {
    var titles = { budget: '분기 교체 예산 보고서', fault: '반복 장애 자산 보고서', audit: '감사 대응 점검누락 보고서' };
    return '<div class="report-doc">' +
      _rdToolbar() +
      '<h2 class="rd-title">' + (titles[typeId] || '보고서') + '</h2>' +
      '<div class="rd-section" style="padding:40px 0;text-align:center;color:#9CA3AF;">' +
        '<div style="font-size:40px;margin-bottom:12px;">🚧</div>' +
        '<div>해당 보고서 유형은 시연 프로토타입에서 준비 중입니다.</div>' +
      '</div>' +
    '</div>';
  }

  // 전역 노출 (onclick 핸들러용)
  window.askAgent = askAgent;
  window.openAiDetail = openAiDetail;
  window.closeAiDetail = closeAiDetail;
  window.resetAgent = resetAgent;
  window.submitAgentInput = submitAgentInput;
  window.aiAnswerAction = aiAnswerAction;
  window.showReportDraft = showReportDraft;
  window.selectReportType = selectReportType;
  window.renderReportPage = renderReportPage;

  // ===== 시작 =====
  renderDashboard();
  renderListView();
  renderAgentInit();
  // DB 연결 상태 토스트
  setTimeout(function () {
    var msg = _dbSource === 'supabase'
      ? '🟢 Supabase DB 연결됨 · 자산 ' + assets.length + '건 로드'
      : '🟡 오프라인 모드 · 로컬 샘플 데이터 사용 중';
    showDbToast(msg, _dbSource === 'supabase' ? 'ok' : 'warn');
  }, 400);
  // 해시가 있으면 그 화면으로, 없으면 대시보드를 기본으로
  if (location.hash && location.hash.length > 2) {
    _renderView(location.hash);
  } else {
    history.replaceState(null, "", "#/dashboard"); // hashchange 없이 URL만 교체
    _renderView("#/dashboard");
  }
})().catch(function (e) {
  console.error('[App] 초기화 오류:', e);
  var el = document.getElementById('db-loading');
  if (el) el.hidden = true;
});

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
  // Supabase에 비동기 저장 (실패해도 화면에는 이미 반영됨)
  if (window.DB && window.DB.insertAsset) {
    window.DB.insertAsset(newAsset).catch(function (e) {
      console.warn('[DB] 자산 등록 저장 실패 (화면에는 표시됨):', e.message);
    });
  }
}

// ===== 사이드바 토글 =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ===== DB 연결 상태 토스트 =====
function showDbToast(msg, tone) {
  var t = document.getElementById('db-toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'db-toast db-toast-' + (tone || 'ok') + ' db-toast-in';
  clearTimeout(t._timer);
  t._timer = setTimeout(function () {
    t.classList.remove('db-toast-in');
    t.classList.add('db-toast-out');
  }, 3000);
}

// ===== Markdown 렌더러 (인터뷰 질의서) =====
var _mdIqCache = null;
var _mdProposalCache = null;

function renderMarkdown(md) {
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function inline(s) {
    s = escHtml(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  var lines = md.split('\n');
  var html = '';
  var i = 0;

  while (i < lines.length) {
    var line = lines[i];

    // 코드 블록 (``` ... ```)
    if (line.startsWith('```')) {
      var lang = escHtml(line.slice(3).trim());
      i++;
      var code = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(escHtml(lines[i]));
        i++;
      }
      html += '<pre class="md-pre"><code' + (lang ? ' class="lang-' + lang + '"' : '') + '>' + code.join('\n') + '</code></pre>\n';
      i++;
      continue;
    }

    // 헤더 (# ~ ######)
    var hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      var lv = Math.min(hm[1].length + 1, 6); // # → h2, ## → h3 (h1은 문서 제목용으로 비워둠)
      html += '<h' + lv + ' class="md-h md-h' + lv + '">' + inline(hm[2]) + '</h' + lv + '>\n';
      i++;
      continue;
    }

    // 수평선 (--- 또는 ***)
    if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) {
      html += '<hr class="md-hr">\n';
      i++;
      continue;
    }

    // 블록쿼트 (> ...)
    if (line.startsWith('>')) {
      html += '<blockquote class="md-bq">';
      while (i < lines.length && lines[i].startsWith('>')) {
        var bline = lines[i].slice(1).trim();
        if (bline) html += '<p>' + inline(bline) + '</p>';
        i++;
      }
      html += '</blockquote>\n';
      continue;
    }

    // 테이블 (| col | ...)
    if (line.startsWith('|')) {
      var rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i]);
        i++;
      }
      // 구분선 행 필터: |---|:---:|---| 패턴 (한글·영문·숫자 없는 행)
      var isSep = function(r) { return /^\|[\s\-:|]+\|$/.test(r) && !/[가-힣a-zA-Z0-9]/.test(r); };
      var dataRows = rows.filter(function(r) { return !isSep(r); });
      if (dataRows.length === 0) { continue; }
      html += '<table class="md-table"><thead><tr>';
      dataRows[0].split('|').slice(1, -1).forEach(function(c) {
        html += '<th>' + inline(c.trim()) + '</th>';
      });
      html += '</tr></thead><tbody>';
      for (var j = 1; j < dataRows.length; j++) {
        html += '<tr>';
        dataRows[j].split('|').slice(1, -1).forEach(function(c) {
          html += '<td>' + inline(c.trim()) + '</td>';
        });
        html += '</tr>';
      }
      html += '</tbody></table>\n';
      continue;
    }

    // 순서 없는 목록 (- 또는 *)
    if (/^[-*]\s/.test(line)) {
      html += '<ul class="md-ul">';
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        html += '<li>' + inline(lines[i].replace(/^[-*]\s+/, '')) + '</li>';
        i++;
      }
      html += '</ul>\n';
      continue;
    }

    // 순서 있는 목록 (1. 2. 3.)
    if (/^\d+\.\s/.test(line)) {
      html += '<ol class="md-ol">';
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        html += '<li>' + inline(lines[i].replace(/^\d+\.\s+/, '')) + '</li>';
        i++;
      }
      html += '</ol>\n';
      continue;
    }

    // 빈 줄
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 단락
    html += '<p class="md-p">' + inline(line) + '</p>\n';
    i++;
  }

  return html;
}

function toggleProposalMd() {
  var viewer = document.getElementById('proposal-md-viewer');
  var btn = document.getElementById('btn-proposal-md-toggle');
  if (!viewer) return;

  if (viewer.style.display !== 'none') {
    viewer.style.display = 'none';
    if (btn) btn.textContent = '📄 전체 분석 보기 (제안서_Asis_정리.md)';
    return;
  }

  if (btn) btn.textContent = '📄 전체 분석 접기';

  if (_mdProposalCache) {
    viewer.style.display = '';
    return;
  }

  var content = document.getElementById('proposal-md-content');
  if (!content) return;

  if (location.protocol === 'file:') {
    content.innerHTML = '<div class="md-file-notice">⚠️ 로컬 파일(file://)로 열었을 때는 보안 제한으로 파일을 직접 읽을 수 없습니다.<br>배포 버전에서 확인해 주세요: <a href="https://atg-asset.vercel.app" target="_blank" rel="noopener">🔗 atg-asset.vercel.app</a></div>';
    viewer.style.display = '';
    return;
  }

  content.innerHTML = '<div class="md-loading">로딩 중…</div>';
  viewer.style.display = '';

  fetch('제안서_Asis_정리.md')
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function(text) {
      _mdProposalCache = text;
      content.innerHTML = renderMarkdown(text);
    })
    .catch(function(err) {
      content.innerHTML = '<div class="md-error">파일을 불러오지 못했습니다: ' + err.message + '</div>';
    });
}

function toggleInterviewMd() {
  var viewer = document.getElementById('iq-md-viewer');
  var btn = document.getElementById('btn-iq-md-toggle');
  if (!viewer) return;

  // 이미 열려 있으면 닫기
  if (viewer.style.display !== 'none') {
    viewer.style.display = 'none';
    if (btn) btn.textContent = '📄 전체 질의서 보기 (요건정의_인터뷰질의서.md)';
    return;
  }

  if (btn) btn.textContent = '📄 전체 질의서 접기';

  // 이미 캐시됨 → 바로 표시
  if (_mdIqCache) {
    viewer.style.display = '';
    return;
  }

  var content = document.getElementById('iq-md-content');
  if (!content) return;

  // file:// 환경: fetch CORS 제한 → 안내 메시지
  if (location.protocol === 'file:') {
    content.innerHTML = '<div class="md-file-notice">⚠️ 로컬 파일(file://)로 열었을 때는 보안 제한으로 파일을 직접 읽을 수 없습니다.<br>배포 버전에서 확인해 주세요: <a href="https://atg-asset.vercel.app" target="_blank" rel="noopener">🔗 atg-asset.vercel.app</a></div>';
    viewer.style.display = '';
    return;
  }

  // fetch로 .md 파일 로드
  content.innerHTML = '<div class="md-loading">로딩 중…</div>';
  viewer.style.display = '';

  fetch('요건정의_인터뷰질의서.md')
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function(text) {
      _mdIqCache = text;
      content.innerHTML = renderMarkdown(text);
    })
    .catch(function(err) {
      content.innerHTML = '<div class="md-error">파일을 불러오지 못했습니다: ' + err.message + '</div>';
    });
}
