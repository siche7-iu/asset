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

(function () {
  var assets = window.APP_DATA.assets;
  var _dbOverlay = document.getElementById('db-loading');
  if (_dbOverlay) _dbOverlay.hidden = true;
  var DASH = window.APP_DATA.dashboard;
  function won(n) { return n.toLocaleString("ko-KR") + "원"; }
  var _lifeMap = { '노트북':5,'모니터':5,'서버':7,'복합기':5,'책상':10,'의자':10,'차량':10,'에어컨':10,'프로젝터':5,'기타':5 };

  var navItems = document.querySelectorAll(".nav-item");
  var tabs = document.querySelectorAll(".tab");
  var soonTitle = document.getElementById("soon-title");
  var sectionIds = ["dashboard", "list", "detail", "soon", "ai-agent", "report",
    "asis-gis", "asis-lifecycle", "asis-report",
    "asis-vehicle", "asis-acquire", "asis-closing",
    "asis-prop-lifecycle", "asis-prop-operation", "asis-prop-lease",
    "asis-prop-extract", "asis-prop-contract",
    "aiph-copilot", "aiph-anomaly", "aiph-monitor",
    "aiph-approval", "aiph-builder",
    "aiph-report", "aiph-kb"
  ];

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
    if (view.startsWith("asis-")) {
      showSection(view);
      activateSidebar(view);
      activateTab(null);
      var el = document.getElementById("view-" + view);
      if (el && !el.dataset.rendered) {
        el.dataset.rendered = "1";
        var _fnMap = {
          "asis-gis": window.renderAsisGis,
          "asis-lifecycle": window.renderAsisLifecycle,
          "asis-report": window.renderAsisReport,
          "asis-vehicle": window.renderAsisVehicle,
          "asis-acquire": window.renderAsisAcquire,
          "asis-closing": window.renderAsisClosing,
          "asis-prop-lifecycle": window.renderAsisPropLifecycle,
          "asis-prop-operation": window.renderAsisPropOperation,
          "asis-prop-lease": window.renderAsisPropLease,
          "asis-prop-extract": window.renderAsisPropExtract,
          "asis-prop-contract": window.renderAsisPropContract
        };
        var fn = _fnMap[view];
        if (typeof fn === "function") fn();
      }
      return;
    }
    if (view.startsWith("aiph-")) {
      showSection(view);
      activateSidebar(view);
      activateTab(null);
      var el = document.getElementById("view-" + view);
      if (el && !el.dataset.rendered) {
        el.dataset.rendered = "1";
        var _aiphMap = {
          "aiph-copilot": window.renderAiphCopilot,
          "aiph-anomaly": window.renderAiphAnomaly,
          "aiph-monitor": window.renderAiphMonitor,
          "aiph-approval": window.renderAiphApproval,
          "aiph-builder": window.renderAiphBuilder,
          "aiph-report": window.renderAiphReport,
          "aiph-kb": window.renderAiphKb
        };
        var fn = _aiphMap[view];
        if (typeof fn === "function") fn();
      }
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
    buildReqSection();
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
      else enterProjectMode();
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

  // ===== 사이트 진입 인증 (데스크탑 전용) =====
  (function () {
    if (document.body.classList.contains('is-mobile')) return;
    var saOverlay = document.getElementById('site-auth-overlay');
    var saInput   = document.getElementById('site-auth-input');
    var saError   = document.getElementById('site-auth-error');
    var saOkBtn   = document.getElementById('site-auth-ok');
    if (!saOverlay) return;

    function saSubmit() {
      if (!saInput) return;
      var val = saInput.value.trim();
      if (sha256(PW_SALT + val) === PW_HASH) {
        saOverlay.classList.add('hidden');
        saInput.value = '';
        navigate('dashboard');
        _renderView(location.hash);
      } else {
        if (saError) saError.hidden = false;
        var card = saOverlay.querySelector('.site-auth-card');
        if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
        saInput.value = '';
        saInput.focus();
      }
    }

    if (saOkBtn) saOkBtn.addEventListener('click', saSubmit);
    if (saInput) {
      saInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); saSubmit(); }
        if (saError && !saError.hidden) saError.hidden = true;
      });
    }
    setTimeout(function () { if (saInput) saInput.focus(); }, 120);
  })();

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
    var _gc = 0; // gauge counter (클로저)
    document.getElementById("kpi-row").innerHTML = DASH.kpis.map(function (k, i) {
      var bi = k.badgeIcon ? icon(k.badgeIcon) : "";
      var gaugeHtml = '';
      if (k.gauge) {
        var gIdx = _gc++;
        gaugeHtml = gaugeSvg(k.gauge.pct, k.gauge.color) +
          '<canvas class="kpi-gauge-canvas" id="kpi-canvas-' + gIdx + '" width="56" height="56" style="display:none"></canvas>';
      }
      var main = '<div class="kpi-main' + (k.gauge ? " with-gauge" : "") + '">' +
        gaugeHtml +
        '<span class="kpi-value">' + k.value + (k.unit ? '<span class="u">' + k.unit + '</span>' : "") + '</span></div>';
      return '<div class="kpi-card" style="--card-delay:' + (0.08 + i * 0.04).toFixed(2) + 's">' +
        '<div class="kpi-label">' + k.label + '</div>' + main +
        '<span class="kpi-badge ' + k.tone + '">' + bi + k.badge + '</span></div>';
    }).join("");
    var kpiCards = document.querySelectorAll('#kpi-row .kpi-card');
    kpiCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        kpiCards.forEach(function (c) { if (c !== card) c.classList.add('kpi-dimmed'); });
      });
      card.addEventListener('mouseleave', function () {
        kpiCards.forEach(function (c) { c.classList.remove('kpi-dimmed'); });
      });
    });
    // KPI 게이지 토글 리스너 (1회만 등록)
    var kpiCb = document.getElementById('kpi-chart-cb');
    if (kpiCb && !kpiCb._kpiInit) {
      kpiCb._kpiInit = true;
      kpiCb.addEventListener('change', function () {
        var svgs = document.querySelectorAll('#kpi-row .kpi-gauge');
        var canvases = document.querySelectorAll('#kpi-row .kpi-gauge-canvas');
        var gaugeKpis = DASH.kpis.filter(function (k) { return k.gauge; });
        if (this.checked) {
          svgs.forEach(function (el) { el.style.display = 'none'; });
          _kpiChartInstances.forEach(function (c) { if (c) c.destroy(); });
          _kpiChartInstances = [];
          canvases.forEach(function (el, i) {
            el.style.display = 'block';
            var gk = gaugeKpis[i];
            if (!gk) return;
            _kpiChartInstances[i] = new Chart(el, {
              type: 'doughnut',
              data: {
                datasets: [{
                  data: [gk.gauge.pct, 100 - gk.gauge.pct],
                  backgroundColor: [gk.gauge.color, '#EEF1F5'],
                  borderWidth: 0, hoverOffset: 0
                }]
              },
              options: {
                cutout: '72%', rotation: -90, circumference: 360,
                responsive: false,
                animation: { animateRotate: true, duration: 800 },
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
              }
            });
          });
        } else {
          svgs.forEach(function (el) { el.style.display = ''; });
          canvases.forEach(function (el) { el.style.display = 'none'; });
          _kpiChartInstances.forEach(function (c) { if (c) c.destroy(); });
          _kpiChartInstances = [];
        }
      });
    }
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
    // 노후 위험도 토글 리스너 (1회만 등록)
    var riskCb = document.getElementById('risk-chart-cb');
    if (riskCb && !riskCb._riskInit) {
      riskCb._riskInit = true;
      riskCb.addEventListener('change', function () {
        var svgWrap   = document.getElementById('risk-svg-wrap');
        var chartWrap = document.getElementById('risk-chart-wrap');
        if (this.checked) {
          svgWrap.style.display   = 'none';
          chartWrap.style.display = '';
          if (_riskChartInstance) { _riskChartInstance.destroy(); _riskChartInstance = null; }
          // 범례 (SVG 버전과 동일)
          document.getElementById('risk-legend-chart').innerHTML =
            r.segments.map(function (s) {
              return '<li><span class="sq" style="background:' + s.color + '"></span><div>' +
                '<div class="lg-key"><b>' + s.key + '</b> <span>' + (s.note ? '(' + s.note + ')' : '') + '</span></div>' +
                '<div class="lg-val">' + s.label + ' (' + s.pct + ')</div></div></li>';
            }).join('');
          // Chart.js 도넛
          var segs = r.segments.filter(function (s) { return s.count > 0; });
          var rCanvas = document.getElementById('risk-chart-canvas');
          // 중앙 텍스트 플러그인 (afterDraw 훅)
          var centerTextPlugin = {
            id: 'riskCenter',
            afterDraw: function (chart) {
              var ctx = chart.ctx;
              var cx = chart.chartArea ? (chart.chartArea.left + chart.chartArea.right) / 2 : chart.width / 2;
              var cy = chart.chartArea ? (chart.chartArea.top + chart.chartArea.bottom) / 2 : chart.height / 2;
              ctx.save();
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.fillStyle = '#9CA3AF'; ctx.font = '11px Pretendard,sans-serif';
              ctx.fillText('Total', cx, cy - 18);
              ctx.fillStyle = '#002B6C'; ctx.font = 'bold 18px Pretendard,sans-serif';
              ctx.fillText(r.centerTotal, cx, cy + 1);
              ctx.fillStyle = '#6B7280'; ctx.font = '9px Pretendard,sans-serif';
              ctx.fillText(r.centerSub, cx, cy + 18);
              ctx.restore();
            }
          };
          _riskChartInstance = new Chart(rCanvas, {
            type: 'doughnut',
            data: {
              labels: segs.map(function (s) { return s.key; }),
              datasets: [{
                data: segs.map(function (s) { return s.count; }),
                backgroundColor: segs.map(function (s) { return s.color; }),
                borderWidth: 3, borderColor: '#ffffff',
                hoverOffset: 0, hoverBorderWidth: 3
              }]
            },
            options: {
              cutout: '62%',
              responsive: true, maintainAspectRatio: true,
              animation: { animateRotate: true, duration: 800 },
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false }  // 기본 툴팁 끄고 커스텀 showTip 사용
              }
            },
            plugins: [centerTextPlugin]
          });
          // 커스텀 hover 툴팁 (SVG 버전과 동일한 showTip)
          rCanvas.addEventListener('mousemove', function (e) {
            if (!_riskChartInstance) return;
            var els = _riskChartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
            if (!els.length) { hideTip(); return; }
            var s = segs[els[0].index];
            var html = '<div class="ctt-title">' + s.key +
              (s.note ? ' <span style="font-weight:400;font-size:11px;opacity:.75">(' + s.note + ')</span>' : '') + '</div>' +
              '<div class="ctt-row"><span class="ctt-dot" style="background:' + s.color + '"></span>' +
              '<span class="ctt-val">' + s.label + ' (' + s.pct + ')</span></div>';
            showTip(e.clientX, e.clientY, html);
          });
          rCanvas.addEventListener('mouseleave', hideTip);
        } else {
          svgWrap.style.display   = '';
          chartWrap.style.display = 'none';
          if (_riskChartInstance) { _riskChartInstance.destroy(); _riskChartInstance = null; }
        }
      });
    }
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

  // ===== 지역별 관리 현황 — SVG 이미지 지도 (기본 모드) =====
  // viewBox 0 0 480 580, r: DASH.regions 인덱스 (0=서울·수도권, 1=강원, 2=경상, 3=전라, 4=제주)
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
  var S_ISLANDS = [
    {cx:225,cy:445,r:7,ri:3},{cx:248,cy:455,r:5,ri:3},{cx:268,cy:450,r:6,ri:2},
    {cx:295,cy:458,r:5,ri:2},{cx:318,cy:450,r:4,ri:2},{cx:338,cy:442,r:6,ri:2}
  ];

  function renderMapSvg() {
    var regions = DASH.regions;
    var svgEl = document.getElementById('map-box-svg');
    if (!svgEl) return;
    var activeIdx = -1;
    var mapImgHtml = '<img class="map-bg-img" src="images/korea-map.png" alt="한국 지도">';
    var svgPaths = PROVINCES.map(function(p) {
      return '<path data-r="'+p.r+'" d="'+p.d+'" fill="'+p.fill+'" class="prov-hit"/>';
    }).join('');
    var svgSIslands = S_ISLANDS.map(function(c) {
      return '<circle data-r="'+c.ri+'" cx="'+c.cx+'" cy="'+c.cy+'" r="'+c.r+'" class="prov-hit"/>';
    }).join('');
    var mapSvgHtml = '<svg class="map-overlay-svg" viewBox="0 0 480 580" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      svgPaths + svgSIslands + '</svg>';
    var pinIco = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8z" fill="currentColor"/><circle cx="12" cy="10" r="3.5" fill="#fff" opacity=".85"/></svg>';
    var markersHtml = regions.map(function(r, i) {
      var rows = r.detail.map(function(d) {
        return '<div class="cb-row"><span>'+d[0]+'</span><b>'+d[1]+'</b></div>';
      }).join('');
      var expExtra = (r.expDir==='left' ? ' exp-dir-left' : '') + (r.expAbove ? ' exp-above' : '');
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
    svgEl.innerHTML = mapImgHtml + mapSvgHtml + markersHtml;
    var hideTimer = null;
    function setActive(idx) {
      activeIdx = idx;
      regions.forEach(function(_, i) {
        var exp = document.getElementById('callout-exp-'+i);
        var cmp = document.getElementById('callout-cmp-'+i);
        var marker = svgEl.querySelector('.region-marker[data-i="'+i+'"]');
        if (exp) exp.classList.toggle('is-active', i === idx);
        if (cmp) cmp.style.display = (i === idx) ? 'none' : 'flex';
        if (marker) { marker.style.zIndex = (i === idx) ? '20' : '10'; marker.classList.toggle('is-active', i === idx); }
      });
    }
    function showRegion(idx) { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } setActive(idx); }
    function hideRegionDelayed() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(function() { hideTimer = null; setActive(-1); }, 500);
    }
    svgEl.querySelectorAll('.region-marker').forEach(function(m) {
      m.addEventListener('mouseenter', function() { showRegion(+m.dataset.i); });
      m.addEventListener('mouseleave', function() { hideRegionDelayed(); });
    });
    svgEl.querySelectorAll('.prov-hit').forEach(function(p) {
      p.addEventListener('mouseenter', function() { showRegion(+p.dataset.r); });
      p.addEventListener('mouseleave', function() { hideRegionDelayed(); });
    });
    setActive(-1);
  }

  // ===== 지역별 관리 현황 — Leaflet + TopoJSON (상세 모드) =====
  // KOSTAT 시도코드(앞 2자리) → 6개 권역 인덱스
  // 0=수도권, 1=충청권, 2=호남권, 3=영남권, 4=강원권, 5=제주권
  var REGION_CODE_MAP = {
    '11':0, '23':0, '31':0,
    '25':1, '29':1, '33':1, '34':1,
    '24':2, '35':2, '36':2,
    '21':3, '22':3, '26':3, '37':3, '38':3,
    '32':4,
    '39':5
  };
  var REGION_FILL  = ['#1E3A8A','#2563EB','#3B82F6','#1D4ED8','#1E40AF','#93C5FD'];
  var REGION_HOVER = ['#172554','#1D4ED8','#2563EB','#1E3A8A','#172554','#60A5FA'];
  // Leaflet 전용 6권역 데이터 (SVG 이미지 지도 regions와 독립)
  var LEAFLET_REGIONS = [
    { name:'수도권', count:'3,218', lat:37.56, lng:126.98,
      detail:[['고위험 자산','10개 [HIGH]'],['점검 예정','31개 (7일 이내 5개)'],
              ['계약 만료 임박','4개'],['노후 자산(8년+)','720개'],['유지보수 가동률','97.8%']] },
    { name:'충청권', count:'980',   lat:36.37, lng:127.38,
      detail:[['고위험 자산','5개 [HIGH]'],['점검 예정','12개 (7일 이내 2개)'],
              ['계약 만료 임박','2개'],['노후 자산(8년+)','215개'],['유지보수 가동률','96.5%']] },
    { name:'호남권', count:'1,587', lat:35.10, lng:126.90,
      detail:[['고위험 자산','7개 [HIGH]'],['점검 예정','21개 (7일 이내 4개)'],
              ['계약 만료 임박','3개'],['노후 자산(8년+)','312개'],['유지보수 가동률','97.4%']] },
    { name:'영남권', count:'2,193', lat:35.53, lng:128.62,
      detail:[['고위험 자산','11개 [HIGH]'],['점검 예정','29개 (7일 이내 5개)'],
              ['계약 만료 임박','4개'],['노후 자산(8년+)','498개'],['유지보수 가동률','98.0%']] },
    { name:'강원권', count:'1,124', lat:37.75, lng:128.10,
      detail:[['고위험 자산','8개 [HIGH]'],['점검 예정','14개 (7일 이내 3개)'],
              ['계약 만료 임박','2개'],['노후 자산(8년+)','286개'],['유지보수 가동률','96.1%']] },
    { name:'제주권', count:'412',   lat:33.44, lng:126.53,
      detail:[['고위험 자산','4개 [HIGH]'],['점검 예정','6개 (7일 이내 1개)'],
              ['계약 만료 임박','1개'],['노후 자산(8년+)','115개'],['유지보수 가동률','95.6%']] }
  ];
  var _kpiChartInstances = [];
  var _riskChartInstance = null;
  var _leafletMap = null;
  var _geoLayerBounds = null;

  function renderMap() {
    var regions = DASH.regions;

    // 기본: SVG 이미지 지도 렌더링
    renderMapSvg();

    // 토글 스위치 리스너 (중복 등록 방지)
    var cb = document.getElementById('map-mode-cb');
    if (!cb || cb._mapListenerAdded) return;
    cb._mapListenerAdded = true;

    cb.addEventListener('change', function() {
      var svgBox = document.getElementById('map-box-svg');
      var lfBox  = document.getElementById('map-box');
      if (this.checked) {
        svgBox.style.display = 'none';
        lfBox.style.display  = '';
        if (_leafletMap) {
          _leafletMap.invalidateSize({ animate: false });
          if (_geoLayerBounds) _leafletMap.fitBounds(_geoLayerBounds, { padding: [10, 10], animate: false });
        } else {
          var parentCard = lfBox.closest('.dr-map-card');
          var rect = parentCard ? parentCard.getBoundingClientRect() : null;
          var mapSize = rect ? Math.min(rect.width - 10, rect.height - 10) : 0;
          if (mapSize >= 50) {
            lfBox.style.width    = mapSize + 'px';
            lfBox.style.height   = mapSize + 'px';
            lfBox.style.overflow = 'hidden';
          }
          _initLeafletMap(lfBox, regions);
        }
      } else {
        lfBox.style.display  = 'none';
        svgBox.style.display = '';
      }
    });
  }

  function _initLeafletMap(mapEl, regions) {
    if (_leafletMap) return;  // 지연 중 재진입 방지
    var regions = LEAFLET_REGIONS;  // 6권역 데이터로 교체

    var topo = window.MUNICIPALITIES_TOPO;
    if (!topo) return;

    // 크기 재확인 (대시보드 패널이 visible 상태에서 다시 계산)
    var parentCard = mapEl.closest('.dr-map-card') || mapEl.parentElement;
    var rect = parentCard ? parentCard.getBoundingClientRect() : null;
    var mapSize = rect ? Math.min(rect.width - 10, rect.height - 10) : 0;
    if (mapSize >= 50) {
      mapEl.style.width  = mapSize + 'px';
      mapEl.style.height = mapSize + 'px';
    }

    // TopoJSON → GeoJSON 변환
    var objKey = Object.keys(topo.objects)[0];
    var geojson = topojson.feature(topo, topo.objects[objKey]);

    // 6개 권역별 merged polygon 생성 (topojson.merge로 내부 경계 완전 제거 → 깨진 조각 없음)
    var allGeom = topo.objects[objKey].geometries;
    var regionFeatures = LEAFLET_REGIONS.map(function(r, i) {
      var group = allGeom.filter(function(g) {
        return REGION_CODE_MAP[(g.properties.code || '').substring(0, 2)] === i;
      });
      var merged = topojson.merge(topo, group);
      return { type: 'Feature', geometry: merged, properties: { ri: i } };
    });
    var regionGeojson = { type: 'FeatureCollection', features: regionFeatures };

    // Leaflet 지도 초기화 (타일 없음 — 순수 벡터, 오프라인 동작)
    _leafletMap = L.map(mapEl, {
      zoomControl:        false,  // 아래에서 position 지정해 직접 추가
      attributionControl: false,
      scrollWheelZoom:    true,
      doubleClickZoom:    true,
      dragging:           true,
      touchZoom:          true,
      boxZoom:            false,
      keyboard:           true
    });
    // 좌표계(CRS 투영 행렬) 확정 — GeoJSON 추가 전에 반드시 setView 호출
    _leafletMap.setView([36.5, 127.5], 7);
    // 줌 컨트롤 (+/- 버튼)
    L.control.zoom({ position: 'topright' }).addTo(_leafletMap);
    // 축척 바 (거리 기준, 미터법만)
    L.control.scale({ position: 'bottomright', imperial: false, maxWidth: 80 }).addTo(_leafletMap);

    // 줌 레벨에 따른 폴리곤 스타일 계산
    function getStyle(ri, hovered) {
      var z = _leafletMap.getZoom();
      var hasBorder = z >= 9;
      return {
        color:        hasBorder ? '#ffffff' : 'transparent',
        weight:       hasBorder ? (z >= 11 ? 0.8 : 0.5) : 0,
        smoothFactor: z >= 11 ? 1.0 : 2.0,
        fillColor:    ri !== undefined
                        ? (hovered ? (REGION_HOVER[ri] || REGION_FILL[ri]) : REGION_FILL[ri])
                        : '#D1D5DB',
        fillOpacity:  hovered ? 1.0 : 0.85
      };
    }

    // 툴팁 div (Leaflet sticky tooltip 대신 직접 생성 — 스타일 제어 용이)
    var ttEl = document.createElement('div');
    ttEl.className = 'map-lf-tooltip';
    ttEl.style.display = 'none';
    document.body.appendChild(ttEl);

    function showTip(e, rIdx) {
      var r = regions[rIdx];
      var rows = r.detail.map(function(d){
        return '<div class="cb-row"><span>'+d[0]+'</span><b>'+d[1]+'</b></div>';
      }).join('');
      ttEl.innerHTML =
        '<div class="cb-name">'+r.name+'</div>'+
        '<div class="cb-num">'+r.count+'개</div>'+
        '<div class="cb-div"></div>'+rows;
      ttEl.style.display = 'block';
      moveTip(e);
    }
    function moveTip(e) {
      var orig = e.originalEvent || e;
      var x = orig.clientX, y = orig.clientY;
      var tw = ttEl.offsetWidth || 200, th = ttEl.offsetHeight || 160;
      var vw = window.innerWidth, vh = window.innerHeight;
      var left = (x + 14 + tw > vw) ? (x - tw - 14) : (x + 14);
      var top  = (y - 14 - th < 0)  ? (y + 14)       : (y - 14 - th);
      ttEl.style.left = left + 'px';
      ttEl.style.top  = top  + 'px';
    }
    function hideTip() { ttEl.style.display = 'none'; }

    // ── 권역 레이어 (zoom < 9, 기본) — 6개 merged polygon, 조각 없는 깔끔한 형태
    var _regionLayer = L.geoJSON(regionGeojson, {
      style: function(feat) {
        var ri = feat.properties.ri;
        return { color:'#ffffff', weight:1.2, smoothFactor:1.5,
                 fillColor:REGION_FILL[ri], fillOpacity:0.87 };
      },
      onEachFeature: function(feat, layer) {
        var ri = feat.properties.ri;
        layer.on({
          mouseover: function(e) {
            layer.setStyle({ fillColor:REGION_HOVER[ri], fillOpacity:1 });
            showTip(e, ri);
          },
          mousemove: function(e) { moveTip(e); },
          mouseout:  function()  {
            layer.setStyle({ fillColor:REGION_FILL[ri], fillOpacity:0.87 });
            hideTip();
          }
        });
      }
    }).addTo(_leafletMap);

    // ── 시군구 레이어 (zoom ≥ 9, 확대 시) — 228개 상세 폴리곤, 처음엔 숨김
    var geoLayer = L.geoJSON(geojson, {
      style: function(feat) {
        var prefix = (feat.properties.code||'').substring(0,2);
        var ri = REGION_CODE_MAP[prefix];
        return getStyle(ri, false);
      },
      onEachFeature: function(feat, layer) {
        var prefix = (feat.properties.code||'').substring(0,2);
        var ri = REGION_CODE_MAP[prefix];
        if (ri === undefined) return;
        layer.on({
          mouseover: function(e) {
            layer.setStyle(getStyle(ri, true));
            showTip(e, ri);
          },
          mousemove: function(e) { moveTip(e); },
          mouseout:  function()  {
            layer.setStyle(getStyle(ri, false));
            hideTip();
          }
        });
      }
    }); // addTo 없음 — zoom 9 이상일 때만 추가

    // 줌에 따라 레이어 전환 (zoom < 9: 권역 덩어리, zoom ≥ 9: 시군구 상세)
    _leafletMap.on('zoomend', function() {
      var z = _leafletMap.getZoom();
      if (z >= 9) {
        if (_leafletMap.hasLayer(_regionLayer)) _leafletMap.removeLayer(_regionLayer);
        if (!_leafletMap.hasLayer(geoLayer))    geoLayer.addTo(_leafletMap);
        geoLayer.eachLayer(function(lyr) {
          if (!lyr.feature) return;
          var ri = REGION_CODE_MAP[(lyr.feature.properties.code||'').substring(0,2)];
          lyr.setStyle(getStyle(ri, false));
        });
      } else {
        if (_leafletMap.hasLayer(geoLayer))      _leafletMap.removeLayer(geoLayer);
        if (!_leafletMap.hasLayer(_regionLayer)) _regionLayer.addTo(_leafletMap);
      }
    });

    // 홈(전체보기) 커스텀 컨트롤
    var HomeControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function() {
        var c = L.DomUtil.create('div', 'leaflet-bar leaflet-control lf-home-ctrl');
        var a = L.DomUtil.create('a', 'lf-home-btn', c);
        a.title = '전체 보기';
        a.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z" fill="currentColor"/></svg>';
        L.DomEvent.on(a, 'click', function(e) {
          L.DomEvent.stop(e);
          if (_geoLayerBounds) _leafletMap.fitBounds(_geoLayerBounds, { padding: [10, 10], animate: true });
          else _leafletMap.setView([36.5, 127.5], 7, { animate: true });
        });
        return c;
      }
    });
    new HomeControl().addTo(_leafletMap);

    // 6개 권역 핀 마커 + 컴팩트 배지 (항상 표시)
    var pinSvg = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8z" fill="currentColor"/><circle cx="12" cy="10" r="3.5" fill="#fff" opacity=".85"/></svg>';
    regions.forEach(function(r, i) {
      var fill = REGION_FILL[i] || '#2563EB';
      var icon = L.divIcon({
        className: '',
        html: '<div class="lf-rpin" style="--rc:'+fill+'">' +
              '  <div class="lf-rcmp"><span class="lf-rname">'+r.name+'</span><span class="lf-rnum">'+r.count+'</span></div>' +
              '  <div class="lf-rico">'+pinSvg+'</div>' +
              '</div>',
        iconSize:   [0, 0],
        iconAnchor: [0, 0]
      });
      var mk = L.marker([r.lat, r.lng], { icon: icon, interactive: true }).addTo(_leafletMap);
      mk.on('mouseover', function(e) { showTip(e, i); });
      mk.on('mousemove', function(e) { moveTip(e); });
      mk.on('mouseout',  function()  { hideTip(); });
    });

    // 권역 레이어 기준으로 fitBounds (merged 폴리곤이 실제 표시 기준)
    var geoBounds = _regionLayer.getBounds();
    _geoLayerBounds = geoBounds.isValid() ? geoBounds : null;
    if (geoBounds.isValid()) {
      _leafletMap.fitBounds(geoBounds, { padding: [10, 10], animate: false });
    }

    // 레이아웃 확정 후 한 번 더 보정 (rAF + 150ms)
    requestAnimationFrame(function() {
      setTimeout(function() {
        if (!_leafletMap) return;
        _leafletMap.invalidateSize({ animate: false });
        if (geoBounds.isValid()) {
          _leafletMap.fitBounds(geoBounds, { padding: [10, 10], animate: false });
        }
      }, 150);
    });
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
    var life = _lifeMap[a.category] || 5;
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
      var life = _lifeMap[asset.category] || 5, used = asset.usedYears, depRate = Math.min(100, Math.round(used / life * 100));
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

  // ===== As-is → To-be 서브메뉴 토글 =====
  window.toggleAsisMenu = function () {
    var items = document.getElementById('nav-asis-items');
    var caret = document.getElementById('nav-asis-caret');
    if (!items) return;
    var open = items.classList.toggle('open');
    if (caret) caret.textContent = open ? '▾' : '▸';
  };

  // ===== AI Agent 예상안 서브메뉴 토글 =====
  window.toggleAiphMenu = function () {
    var items = document.getElementById('nav-aiph-items');
    var caret = document.getElementById('nav-aiph-caret');
    if (!items) return;
    var open = items.classList.toggle('open');
    if (caret) caret.textContent = open ? '▾' : '▸';
  };

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
var _mdQna1Cache = null;
var _mdReqCache = null;
var _mdReqCallbacks = [];

// 출처 풀 설명 (마우스오버 툴팁 — 모든 항목)
var REQ_SRC_TIPS = {
  'NH-DSH-001': 'RFP 공통 사항 — 통합 대시보드 신규 구축 / RFP 실시간 자산 관제 — 자산 현황판 요청 / 제안서 §1.1.1 사용자 중심 UI/UX (p1~11): p11에 통계 리포트 대시보드 화면 구성 포함',
  'NH-DSH-002': '제안서 §1.1.1 사용자 중심 UI/UX (p8): Hyper-personalized UX — 사용자별 맞춤 위젯·필터·레이아웃 설정이 가능한 개인화 대시보드 제안',
  'NH-DSH-003': 'RFP 실시간 자산 관제 — 점포·부동산·차량 GIS 시각화 명시 / 제안서 §1.1.1 사용자 중심 UI/UX (p9): 지도 기반 자산 위치·현황 시각화 화면',
  'NH-DSH-004': 'RFP 실시간 자산 관제 — 핵심 자산 상태 시각화 명시 / 제안서 §1.2.1 핵심 자산 상태 시각화 및 관제 시스템 구축 (p18~22): LightGBM 기반 자산 상태·이상 징후 모니터링 포함',
  'NH-DSH-005': '제안서 §1.1.1 사용자 중심 UI/UX (p11): 조직(본부·지역·부서)별 자산 보유 현황 비교 현황판, 임원 보고용 차트·표 포함',
  'NH-DSH-006': 'RFP 실시간 자산 관제 — 급변 시 긴급 보고·알림 명시 / 제안서 §1.2.2 실시간 알림 및 보고 체계 구축 (p23~24): AI 기반 알림·이상 탐지 및 긴급 보고 자동화 포함',
  'NH-AST-001': 'RFP 공통 사항 — 업무 Pain-Point 해소·프로세스 재설계 / RFP 자산별 프로세스(신청·검증) 개선 — 신청 현황판·요건 검증 명시 / 제안서 §1.1.2 업무 Pain-Point 해소 (p12~13): 자산 취득 프로세스 포함 / §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 신청→현장검증→결재→자산등록 4단계 워크플로우',
  'NH-AST-002': '제안서 §1.1.1 사용자 중심 UI/UX (p3): 6대 UX 적용방안 중 "스마트 데이터 그리드" 명시 — 다중 필터·정렬·엑셀 내보내기를 지원하는 자산 목록 조회 화면',
  'NH-AST-003': '제안서 §1.1.2 업무 Pain-Point 해소 (p12~13): 이관·소유 변경 Pain-Point 재설계 / §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 이관 신청→검증→승인 워크플로우 포함',
  'NH-AST-004': '제안서 §1.1.2 업무 Pain-Point 해소 (p12~13): 처분·폐기(매각·기증·폐기 구분) Pain-Point 재설계 / §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 처분 결재 워크플로우 포함',
  'NH-AST-005': 'RFP 공통 사항 — 업무 Pain-Point 해소·프로세스 재설계(감가상각 처리 자동화 포함) / 제안서 §1.1.2 업무 Pain-Point 해소 (p12~13): 감가상각 처리 자동화 포함 / §1.5.2 자산 전 Life-Cycle별 관리 체계 구축 (p45~51): 정액·정률법 자동 계산 및 회계 연동',
  'NH-AST-006': 'RFP 데이터 연동·최신화 — 자산별 디지털 이력서 생성 명시 / 제안서 §1.5.3 자산별 디지털 이력서 생성 (p52~53): 취득~처분까지 전 생애 이벤트를 타임라인으로 통합 관리',
  'NH-AST-007': '제안서 §1.1.1 사용자 중심 UI/UX (p10): 생애주기 모니터링 개요 화면 / §1.5.2 자산 전 Life-Cycle별 관리 체계 구축 (p45~51): 생애주기 단계별 관리 및 IoT·센서 데이터 연동 실시간 자산 상태 추적',
  'NH-AST-008': 'RFP 공통 사항 — 업무 Pain-Point 해소·프로세스 재설계(재물조사 개선 포함) / As-Is 현행: 재물조사 메뉴 → 모바일·RFID 스캔 기반으로 개선',
  'NH-BUD-001': 'RFP 예산·회계결산 고도화 — 예산 편성-배정-집행 단계별 종합현황판 명시 / 제안서 §1.3.1 예산 관리 프로세스 개선 및 전용 화면 신설 (p25~28): 편성·집행·잔액을 시각화하는 전용 관제 화면 신설',
  'NH-BUD-002': '제안서 §1.3.1 예산 관리 프로세스 개선 및 전용 화면 신설 (p25~28): 연간 예산 편성·중기 계획·배정·조정 프로세스를 통합 관리하는 화면 구성',
  'NH-BUD-003': '제안서 §1.3.1 예산 관리 프로세스 개선 및 전용 화면 신설 (p25~28): 예산 집행 실적 추적, 잔액 경보, 비목별·부서별 집행 현황 분석 포함',
  'NH-BUD-004': 'RFP 예산·회계결산 고도화 — AI 예측(불용예산 사전 탐지·재배분) 명시 / 제안서 §1.3.2 불용예산 사전 탐지·예측 (p29~31): LightGBM ML 모델로 불용예산 조기 탐지 및 경보 발령',
  'NH-BUD-005': 'As-Is 현행 화면 결산전 수행작업 [GS9005] → 수작업 체크리스트를 시스템화, 미완료 항목 차단·자동 검증으로 마감 오류 방지',
  'NH-BUD-006': 'RFP 예산·회계결산 고도화 — 주석 검증·디지털 이력, 분기·연도별 재무제표 주석 공시 명시 / 제안서 §1.3.3 외부 감사 대응자료 및 디지털 이력 관리 (p32~34): 외부감사 제출 자료 자동 생성 및 포맷 변환',
  'NH-BUD-007': 'As-Is 현행 화면: 전표대장 [GS1B01] · 재무상태표 [GS1005] → ERP 전표와 자산 원장 간 실시간 대사·조회로 개선',
  'NH-WKF-001': '제안서 §1.1.2 업무 Pain-Point 해소 (p12~13): 자산 취득 프로세스 Pain-Point 재설계 / §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 신청→현장검증→결재→자산등록 4단계 워크플로우',
  'NH-WKF-002': '제안서 §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 차량 리스 신청 전용 화면·워크플로우 / §1.4.2 수집 데이터 활용 취급 적정 여부 검토 (p38~40): 차량 리스 계약 자동 검증(보험 만기·차량 등록 갱신 포함)',
  'NH-WKF-003': '제안서 §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 부동산(사택·합숙소) 신청 전용 화면·워크플로우 / §1.4.2 수집 데이터 활용 취급 적정 여부 검토 (p38~40): 임차 계약 자동 검증(시세 API·계약 만기 경보)',
  'NH-WKF-004': '제안서 §1.1.2 업무 Pain-Point 해소 (p12~13): 처분·이관 Pain-Point 재설계 / §1.4.1 업무별 관리 프로세스 개선 및 전용 화면 신설 (p35~37): 처분·이관 결재 워크플로우 — 다단계 승인·반려 처리',
  'NH-WKF-005': '제안서 §1.1.2 업무 Pain-Point 해소 (p12~13) · §1.4.1 업무별 관리 프로세스 개선 (p35~37): 신청 건별 단계 상태(접수→검증중→승인→완료) 실시간 추적 현황판',
  'NH-WKF-006': 'As-Is 현행 화면 결재 관리 [RT1005] → 기안·상신·결재·반려·재기안 전자결재 프로세스 고도화',
  'NH-WKF-007': 'RFP 업무지원 프로세스 — 단계별 체크리스트(미이행 시 다음단계 제어) 명시 / 제안서 §1.6.2 사용자 기반 업무 체크리스트 및 템플릿 (p57): 체크리스트 미이행 시 다음 단계 진입 차단 구현',
  'NH-AI-001': 'RFP 실시간 자산 관제 — LLM 생성형 AI 질의응답 명시 / 제안서 §1.2.1 핵심 자산 상태 시각화 및 관제 (p18~22): EXAONE 기반 AI Agent 자연어 질의 / §1.2.2 실시간 알림 및 보고 체계 (p23~24): AI 기반 분석 보고서 자동화',
  'NH-AI-002': '제안서 §1.2.1 핵심 자산 상태 시각화 및 관제 시스템 구축 (p18~22): LightGBM 모델로 자산별 노후 진행률·교체 시기 예측 및 조기 경보 발령',
  'NH-AI-003': '제안서 §1.3.2 불용예산 사전 탐지·예측 (p29~31): AI 모델로 불용예산 발생 가능성 사전 탐지 및 잔여 예산 재배분 추천',
  'NH-AI-004': '제안서 §1.2.2 실시간 알림 및 보고 체계 (p23~24): AI 인사이트 기반 현황 보고 / §1.3.3 외부 감사 대응자료 및 디지털 이력 관리 (p32~34): LLM이 자산·예산 현황 분석 보고서 초안 자동 생성',
  'NH-RPT-001': '제안서 §1.1.1 사용자 중심 UI/UX (p11): 통계 리포트 대시보드 화면 구성 / §1.3.3 외부 감사 대응자료 및 디지털 이력 관리 (p32~34): 자산 취득·운용·처분 현황을 기간별·유형별로 집계한 표준 리포트 포함',
  'NH-RPT-002': '제안서 §1.1.1 사용자 중심 UI/UX (p11): 본부·사업소·팀 단위 자산 보유 현황 비교, 임원 보고용 차트·표 포함',
  'NH-RPT-003': '제안서 §1.5.2 자산 전 Life-Cycle별 관리 체계 구축 (p45~51): 내용연수 변경 시나리오별 잔존가액·비용 영향 시뮬레이션 리포트 포함 / RFP 데이터 연동·최신화 — 자산 전 생애주기 관리 명시',
  'NH-EXT-001': 'RFP 데이터 연동·최신화 — 국토부 등 외부 API 연동 명시 / 제안서 §1.4.2 수집 데이터 활용 취급 적정 여부 검토 (p38~40): 시세 API 기반 임차 적정 여부 검토 / §1.5.1 외부 데이터 연동 및 최신화 (p41~44): 한국부동산원·KB부동산 API로 건물·토지 시세 자동 조회',
  'NH-EXT-002': 'RFP 데이터 연동·최신화 — 외부 API 연동 명시 / 제안서 §1.4.2 수집 데이터 활용 취급 적정 여부 검토 (p38~40): 차량·부동산 신청 시 지도 API로 위치 검증 / §1.5.1 외부 데이터 연동 및 최신화 (p41~44): 카카오·네이버 지도 API로 자산 위치 시각화·주소→좌표 자동 변환',
  'NH-EXT-003': 'RFP 데이터 연동·최신화 — 외부 API 연동 명시 / 제안서 §1.4.2 수집 데이터 활용 취급 적정 여부 검토 (p38~40): 인사DB 연동으로 신청자 자격 자동 검증 / §1.5.1 외부 데이터 연동 및 최신화 (p41~44): HRIS 연동으로 부서 이동 시 자산 소유권 자동 이관',
  'NH-EXT-004': 'RFP 데이터 연동·최신화 — 외부 시스템 연동 명시 / 제안서 §1.5.1 외부 데이터 연동 및 최신화 (p41~44): GSE(회계)·MCA(원가)·MFT(세금계산서) ERP와 자산 원장 실시간 연동, 이중 입력 제거',
  'NH-EXT-005': 'RFP 데이터 연동·최신화 — 오류 데이터 자동 보정·주소 표준화 명시 / 제안서 §1.5.1 외부 데이터 연동 및 최신화 (p41~44): 행정안전부 도로명주소 API로 자산 소재지 표준화(구 주소·도로명 혼용 해소)',
  'NH-SYS-001': '제안서 §1.1.1 사용자 중심 UI/UX (p3): 6대 UX 적용방안 중 "역할별 맞춤 화면" 명시 — 담당자·관리자·임원별 화면·기능 노출 차등(RBAC)',
  'NH-SYS-002': 'As-Is 현행 화면 공통코드 관리 [SY1001] → 자산 분류·상태·부서 코드 체계를 시스템화, 코드 추가·변경 UI로 개선',
  'NH-SYS-003': 'RFP 업무지원 프로세스 — 단계별 체크리스트·템플릿 신설 명시 / 제안서 §1.6.1 업무 지원 프로세스 신설 (p55~56): 업무 매뉴얼·프로세스 도식화 / §1.6.2 사용자 기반 업무 체크리스트 및 템플릿 (p57): 템플릿 등록·수정 및 필수 항목 차단 기능',
  'NH-UX-001': 'RFP 공통 사항 — 당행 표준 웹브라우저(MS Edge) 전환·신기술 기반 사용환경 고도화 명시 / 제안서 §1.1.3 표준화 UI / WebSquare 도입 (p14~15): WebSquare 기반 UI 컴포넌트 설계 가이드 및 디자인 시스템',
  'NH-UX-002': '제안서 §1.1.3 표준화 UI / WebSquare 도입 (p14~15): WebSquare5 기반 공통 컴포넌트(그리드·탭·모달·폼) 라이브러리 — 개발사 재사용 가능 구조',
  'NH-UX-003': '제안서 §1.1.1 사용자 중심 UI/UX (p3): 4대 UX 설계 원칙 중 "Accessibility" 명시 — WCAG 2.1 AA 수준 준수, 키보드 내비게이션·스크린 리더 지원'
};

// 요구사항 데이터 (51건)
var REQ_DATA = [
  // NH-DSH 대시보드·관제 (6건)
  {id:'NH-DSH-001',name:'통합 대시보드 메인',cat:'DSH',catName:'대시보드·관제',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 공통 사항·실시간 자산 관제 / 제안서 §1.1.1 (p1~11)',user:'전체 사용자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['로그인 후 첫 진입 화면으로, 전체 자산 현황을 한 눈에 파악할 수 있어야 한다','KPI 지표를 카드 형태로 표시한다: 총 자산 수, 총 취득원가(억원), 유형별 자산 수(부동산·차량·전산기기·일반), 이번 달 변동 건수','자산 상태 분포(사용중·유휴·수리중·폐기예정)를 차트로 시각화한다','교체·내용연수 도래 자산을 타임라인으로 표시한다','최근 이슈·알림 목록(상위 5건)을 표시한다'],
    extReqs:['KPI 카드에 전월 대비 증감(▲/▼ + 수치)을 표시해 트렌드를 즉시 파악하게 한다','대시보드 진입 시 애니메이션으로 수치가 카운팅되어 "살아있는 데이터" 느낌을 준다','화면 상단에 "오늘 할 일" 요약(결재 대기 N건, 만기 임박 N건, 점검 예정 N건)을 배치한다','관리자 계정은 "전체 조직 보기", 실무자 계정은 "내 담당 자산 보기"로 기본 필터가 다르게 적용된다'],
    tbd:['KPI 항목의 정확한 명칭·계산 기준(예: 총 자산 수 = 폐기 포함 여부)','역할별 노출 데이터 범위 (전사 vs 본부 vs 팀 단위)']},
  {id:'NH-DSH-002',name:'개인화 대시보드',cat:'DSH',catName:'대시보드·관제',pri:'Should',type:'신규',stage:'1차',star:false,src:'제안서 §1.1.1 (p8)',user:'전체 사용자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['로그인 사용자의 역할(담당자·관리자·결재권자·조회전용)에 따라 대시보드 구성이 달라진다','"내 업무 현황" 패널: 결재 대기, 처리 완료, 기한 초과 건수 표시','"내 담당 자산" 빠른 접근 목록을 배치한다'],
    extReqs:['사용자가 자주 쓰는 메뉴 상위 3개를 "즐겨찾기"로 사이드바 상단에 자동 노출한다','마지막으로 조회한 자산 3건을 "최근 본 자산"으로 표시해 재접근을 빠르게 한다','알림은 "읽음/안읽음" 상태를 관리하고, 클릭 시 해당 화면으로 바로 이동한다'],
    tbd:['개인화 설정을 사용자가 직접 수정할 수 있게 할지 여부']},
  {id:'NH-DSH-003',name:'지역별 GIS 자산 지도',cat:'DSH',catName:'대시보드·관제',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 실시간 자산 관제 / 제안서 §1.1.1 (p9)',user:'관리자, 현황 담당자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['전국 지도에 자산 보유 지역을 핀·마커로 표시한다','핀 클릭(또는 호버) 시 해당 지역 자산 요약(수량·금액·주요 이슈) 팝업을 표시한다','자산 유형(부동산·차량·전산기기)으로 필터링하면 해당 유형만 지도에 표시된다','점포·지역 단위로 드릴다운(전국→권역→시도→시군구) 가능하다'],
    extReqs:['지역별 자산 집중도를 색상 농도(히트맵)로 표현해 한 눈에 분포를 파악하게 한다','보험 만기·내용연수 초과 자산이 있는 지역 핀은 빨간색으로 강조한다','지도와 연동된 자산 목록이 우측 패널에 동시에 표시된다'],
    tbd:['제안서 p9는 "서울 구(區) 단위" 상세 지도를 제시 — 전국 권역 vs 서울 상세 단위 범위 협의 필요','지도 API 선택(카카오·네이버·공공 API) 및 라이선스 비용']},
  {id:'NH-DSH-004',name:'실시간 자산 상태 관제',cat:'DSH',catName:'대시보드·관제',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 실시간 자산 관제 / 제안서 §1.2.1 (p18~22)',user:'관리자, 현황 담당자',asIs:'자산별 상세현황[LH1005] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 상태(사용중·유휴·수리중·폐기예정)가 변경되면 대시보드에 즉시 반영된다','상태별 자산 수와 비율을 도넛 차트로 표시한다','비정상 상태(수리중·폐기예정) 자산은 목록으로 별도 표시하고 클릭 시 상세로 이동한다'],
    extReqs:['지정 기간(예: 30일) 이상 상태 변화 없는 자산을 "관리 공백 의심"으로 자동 표시한다','자산 상태 변경 이력을 타임라인으로 조회할 수 있다','임계치 초과(예: 유휴 자산이 전체의 20% 이상) 시 자동 알림을 발송한다 ★'],
    tbd:['실시간 반영 주기(즉시 vs 배치 주기) — 시스템 연동 방식에 따라 결정']},
  {id:'NH-DSH-005',name:'조직별·유형별 비교 현황판',cat:'DSH',catName:'대시보드·관제',pri:'Should',type:'신규',stage:'1차',star:false,src:'제안서 §1.1.1 (p11)',user:'관리자, 임원',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['조직(본부·부서·지역 단위)별 자산 보유 현황을 막대 그래프로 비교한다','자산 유형별(부동산·차량·전산기기·일반) 보유 비율을 시각화한다','특정 기간을 선택해 해당 시점의 현황을 조회할 수 있다(시점 조회)'],
    extReqs:['조직별 자산 순위 테이블을 제공하고 정렬 기준(금액·수량·노후도)을 변경할 수 있다','전기 대비 증감을 색상(증가=파랑, 감소=빨강)으로 직관적으로 표현한다'],
    tbd:[]},
  {id:'NH-DSH-006',name:'알림·긴급 보고 센터',cat:'DSH',catName:'대시보드·관제',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 실시간 자산 관제 / 제안서 §1.2.2 (p23~24)',user:'전체 사용자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['알림은 화면 우상단 벨 아이콘에 미읽음 건수 배지로 표시한다','알림 유형: 결재 대기, 보험 만기, 내용연수 초과, 점검 예정, 계약 갱신, AI 이상 감지','알림 클릭 시 해당 자산 상세 또는 관련 업무 화면으로 바로 이동한다','전체 알림 목록 화면에서 읽음 처리·삭제가 가능하다'],
    extReqs:['알림 수신 범위를 역할별로 설정한다(예: 보험 만기 알림은 자산 담당자와 관리자에게만)','긴급도에 따라 알림 등급을 구분한다(정보/경고/긴급), 긴급은 팝업 형태로도 표시 ★','알림 발생일 기준 일정 기간(예: 7일) 후 미처리 건은 상위 관리자에게 자동 에스컬레이션 ★'],
    tbd:['이메일·SMS 등 시스템 외부 알림 채널 포함 여부']},
  // NH-AST 자산 원장·생애주기 (10건)
  {id:'NH-AST-001',name:'자산 등록(취득)',cat:'AST',catName:'자산 원장·생애주기',pri:'Must',type:'개선',stage:'1차',star:false,src:'RFP 공통 사항·자산별 프로세스 / 제안서 §1.1.2·§1.4.1',user:'자산 등록 담당자',asIs:'일반자산 취득[W2HK] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['등록 항목: 자산명, 자산 유형, 취득일, 취득원가, 담당 부서, 담당자, 위치, 감가상각 방법, 내용연수, 첨부파일','필수 항목 미입력 시 저장을 차단하고 해당 항목을 빨간색으로 강조한다','저장 전 미리보기(등록될 자산 정보 요약)를 제공한다','첨부파일(계약서·검수서·영수증 등)을 복수 업로드할 수 있다'],
    extReqs:['유사 자산명 자동완성으로 오타·중복 등록을 예방한다','자산 코드는 규칙(유형코드+연도+일련번호)에 따라 시스템이 자동 채번한다','동일 위치·동일 부서에 유사 자산이 이미 있으면 "중복 의심" 경고를 표시한다 ★','Excel 양식으로 다건 일괄 등록 기능을 제공한다(★ 이관 시기 등 대량 등록 대응)','취득 원가에서 구성요소(본체·설치비·운반비)를 분리해 입력할 수 있다(NH-EXT-001 연동)'],
    tbd:['자산 코드 채번 규칙 확정 (현행 코드 체계 승계 여부)','일괄 등록 시 검증 오류 처리 방식']},
  {id:'NH-AST-002',name:'자산 조회·검색',cat:'AST',catName:'자산 원장·생애주기',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.1 (p3)',user:'전체 사용자',asIs:'자산별 상세현황[LH1005] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산명, 자산번호, 담당자, 부서, 위치, 상태로 검색·필터링할 수 있다','검색 결과를 표(그리드)로 표시하고 각 행 클릭 시 상세 화면으로 이동한다','검색 결과를 Excel로 내보내기(Export)할 수 있다'],
    extReqs:['최근 검색어 5개를 자동 저장해 재검색을 빠르게 한다','자주 쓰는 검색 조건(예: "내 부서 자산 중 수리중 상태")을 즐겨찾기로 저장할 수 있다 ★','전체 텍스트 검색(자산명·위치·담당자 동시 검색)을 지원한다','그리드 컬럼의 순서·표시 여부를 사용자가 직접 조정할 수 있다 ★'],
    tbd:[]},
  {id:'NH-AST-003',name:'자산 이관·변경',cat:'AST',catName:'자산 원장·생애주기',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.2 (p12~13)·§1.4.1 (p35~37)',user:'자산 담당자, 승인권자',asIs:'이관등록[W3I05·W3I06] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['이관 신청(발신 부서) → 이관 승인(수신 부서·관리자) → 시스템 반영 단계로 처리한다','이관 신청 시 자산 목록 선택, 이관 사유, 이관 일자, 수신 부서·담당자를 입력한다','Excel 업로드로 다건 일괄 이관 신청이 가능하다','이관 완료 후 해당 자산의 이력에 이관 기록이 자동 추가된다'],
    extReqs:['이관 신청 시 수신 부서의 "현재 자산 보유 현황"을 즉시 조회할 수 있다','이관 후 위치 정보(GIS)가 자동 갱신된다(NH-DSH-003 연동)'],
    tbd:[]},
  {id:'NH-AST-004',name:'자산 처분·폐기',cat:'AST',catName:'자산 원장·생애주기',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.2 (p12~13)·§1.4.1 (p35~37)',user:'자산 담당자, 승인권자',asIs:'일반자산 처분/처분취소 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['처분 유형(매각·폐기·기부·교환)을 선택하고 처분 일자·금액·사유를 입력한다','처분 완료 시 해당 자산은 "폐기 완료" 상태로 전환되고 원장에서 논리적 삭제(이력 보존)된다','처분으로 발생하는 손익(매각가액 - 장부가액)을 시스템이 자동 계산해 표시한다','처분 취소 기능을 제공하되, 회계 연동 후에는 취소 불가 처리한다'],
    extReqs:['내용연수 초과 자산 목록을 대시보드에서 직접 선택해 폐기 신청으로 연결하는 흐름을 제공한다','폐기 전 "유사 자산 활용 가능 부서" 안내를 AI가 제안한다(★ 불필요한 신규 취득 방지)'],
    tbd:[]},
  {id:'NH-AST-005',name:'감가상각 관리',cat:'AST',catName:'자산 원장·생애주기',pri:'Must',type:'개선',stage:'1차',star:false,src:'RFP 공통 사항 / 제안서 §1.1.2·§1.5.2 (p45~51)',user:'회계·결산 담당자',asIs:'기존 감가상각 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 등록 시 선택한 감가상각 방법(정액법·정율법)과 내용연수에 따라 월별 감가상각액을 자동 계산한다','자산 상세 화면에서 감가상각 현황(취득원가·누계상각액·잔존가액·장부가액)을 시각화한다','회계연도 마감 시 일괄 감가상각 배치 처리 기능을 제공한다'],
    extReqs:['자산 상세에서 "내용연수 변경 시 잔여 감가상각 시뮬레이션" 기능을 제공한다 ★','자산별 감가상각 진행률을 게이지 바로 시각화한다(현재 몇 %가 상각됐는지)'],
    tbd:['K-IFRS vs 세무 기준 복수 감가상각 장부 지원 여부 (→ NH-AST-010으로 분리)','잔존가치율 설정 기준']},
  {id:'NH-AST-006',name:'자산 디지털 이력서',cat:'AST',catName:'자산 원장·생애주기',pri:'Should',type:'신규',stage:'2차',star:false,src:'RFP 데이터 연동·최신화 / 제안서 §1.5.3 (p52~53)',user:'담당자, 관리자, 감사',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 하나의 전체 이력(취득→이관→수리→감가상각→처분)을 한 화면에서 타임라인으로 조회한다','각 이력 항목에 담당자, 일자, 첨부 문서 링크가 포함된다','디지털 이력서를 PDF로 출력할 수 있다'],
    extReqs:['신규 취득 시 취득원가·구성요소·국고보조금 정보를 자동 계산해 이력서 첫 항목으로 등록한다','이력에 사진(현장 촬영)을 첨부할 수 있다 ★'],
    tbd:[]},
  {id:'NH-AST-007',name:'생애주기 실시간 모니터링',cat:'AST',catName:'자산 원장·생애주기',pri:'Should',type:'신규',stage:'2차',star:false,src:'제안서 §1.1.1 (p10)·§1.5.2 (p45~51)',user:'관리자, 자산 담당자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 유형별(부동산·차량·전산기기) 생애주기 단계(취득→운영→유지보수→처분)를 시각화한다','현재 어느 단계에 있는지, 다음 예정 이벤트(점검·보험 갱신·내용연수 도래)를 표시한다'],
    extReqs:['생애주기 단계별로 "이 시점에 해야 할 일" 체크리스트가 자동으로 생성된다 ★','전체 자산의 생애주기 단계 분포를 한 화면에서 파악할 수 있다'],
    tbd:[]},
  {id:'NH-AST-008',name:'재물조사 관리',cat:'AST',catName:'자산 원장·생애주기',pri:'Must',type:'개선',stage:'2차',star:false,src:'RFP 공통 사항 / As-Is 재물조사 메뉴',user:'재물조사 담당자, 현장 직원',asIs:'재물조사 메뉴 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['재물조사 계획을 등록하고(기간·담당 부서·조사 범위) 진행 상황을 추적한다','조사 결과를 입력하면 장부와 실물의 일치·불일치를 자동으로 비교해준다','불일치 자산(장부 있음·실물 없음 / 실물 있음·장부 없음)을 별도 목록으로 표시한다'],
    extReqs:['모바일 환경에서 QR코드·바코드를 스캔해 현장에서 직접 확인 처리를 할 수 있다 ★','재물조사 결과 불일치 건은 자동으로 이관·등록·폐기 신청으로 연결되는 흐름을 제공한다'],
    tbd:['모바일 재물조사 범위(완전한 모바일앱 vs 반응형 웹) 협의 필요']},
  {id:'NH-AST-009',name:'건설중인 자산(CIP) 관리',cat:'AST',catName:'자산 원장·생애주기',pri:'Should',type:'신규',stage:'2차',star:true,src:'글로벌 벤치마킹(선제 제안)',srcTip:'RFP·제안서 미명시. SAP·Oracle 등 글로벌 자산관리 표준 기능. 건설 공사 자산의 자본화 前 단계 추적 관리 — 도입 선제 제안',user:'재무·회계 담당자',asIs:'없음 또는 수기(Excel)',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['건물 신축·대형 설비 구축 시 공사 진행 중 투입 비용(설계비·기성금 등)을 단계별로 등록한다','공사 완료 시 CIP → 정식 자산으로 자동 전환하고 감가상각을 시작한다','CIP 전체 현황(진행 중 프로젝트·누적 투입 금액)을 대시보드에서 조회할 수 있다'],
    extReqs:[],
    tbd:['NH 환경에서 CIP에 해당하는 자산 규모와 현행 처리 방식 파악 후 우선순위 재조정']},
  {id:'NH-AST-010',name:'자산 복수 감가상각 장부',cat:'AST',catName:'자산 원장·생애주기',pri:'Could',type:'신규',stage:'2차',star:true,src:'글로벌 벤치마킹(선제 제안)',srcTip:'RFP·제안서 미명시. IFRS·K-GAAP 혼용 시 장부별 상각 기준 차이 대응. Excel 병행 리스크 해소 목적으로 선제 제안',user:'회계 담당자',asIs:'Excel 병행 관리',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['하나의 자산에 대해 K-IFRS(재무 회계) 기준과 세무(법인세) 기준의 감가상각을 동시에 별도 장부로 관리한다','기준별로 내용연수·상각 방법·잔존가치율을 다르게 설정할 수 있다','자산 상세 화면에서 두 장부의 감가상각 현황을 나란히 비교 조회한다','결산 시 기준별로 감가상각액·장부가액을 각각 집계해 산출한다'],
    extReqs:['두 장부 간 일시적 차이(세무조정 대상 금액)를 자동으로 계산해 표시한다 ★','향후 관리 회계 등 제3의 기준 장부를 추가할 수 있도록 장부 구조를 확장 가능하게 설계한다'],
    tbd:['NH가 실제로 복수 감가상각 장부를 운영하는지, 현행 Excel 병행 관리 범위 파악 후 우선순위 재조정']},
  // NH-BUD 예산·결산·회계 (7건)
  {id:'NH-BUD-001',name:'예산 종합현황판',cat:'BUD',catName:'예산·결산·회계',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 예산·회계결산 고도화 / 제안서 §1.3.1 (p25~28)',user:'예산 담당자, 관리자, 임원',asIs:'고정투자예산(폼) → 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['예산의 편성→배정→조정→집행→잔액 단계를 한 화면에서 흐름으로 시각화한다','KPI: 총 예산액, 집행액, 잔액, 집행률(%)을 카드로 표시한다','부서별·항목별 예산 현황을 트리 구조로 펼쳐볼 수 있다','기준 연도를 선택해 전년도 예산과 현재를 비교할 수 있다'],
    extReqs:['집행률이 기준치(예: 50%) 미달인 부서는 자동으로 강조 표시한다','분기별 예산 소진 추이를 꺾은선 그래프로 표시해 연말 불용 가능성을 조기에 파악하게 한다 ★'],
    tbd:[]},
  {id:'NH-BUD-002',name:'예산 편성·배정·조정',cat:'BUD',catName:'예산·결산·회계',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.3.1 (p25~28)',user:'예산 담당자, 관리자',asIs:'고정투자예산 폼 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['예산 편성: 항목별 요구액 입력 → 상위 검토 → 확정 단계로 처리한다','예산 배정: 확정 예산을 부서·사업별로 배분하고 이력을 관리한다','예산 조정: 예산 조정 요청(사유·금액 입력) → 승인 → 재배정 흐름으로 처리한다'],
    extReqs:['편성 시 전년도 실적을 자동으로 불러와 참고값으로 표시한다','예산 배정 단계에서 각 부서의 "배정 수락·확인" 절차를 넣어 이견을 사전 차단한다 ★'],
    tbd:['예산 체계 단위(본부/부서/팀/항목) 확정 필요']},
  {id:'NH-BUD-003',name:'예산 집행·실적 관리',cat:'BUD',catName:'예산·결산·회계',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.3.1 (p25~28)',user:'자산 담당자, 예산 담당자',asIs:'기존 예산 폼 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 취득·수리 등 지출 발생 시 해당 예산 항목에서 자동으로 차감·기록된다','예산 초과 집행 시 경고를 표시하고 승인 없이 진행되지 않도록 한다','집행 내역(일자·금액·내용·담당자)을 조회할 수 있다'],
    extReqs:[],
    tbd:[]},
  {id:'NH-BUD-004',name:'불용예산 조기 경보',cat:'BUD',catName:'예산·결산·회계',pri:'Should',type:'신규',stage:'2차',star:false,src:'RFP 예산·회계결산 고도화 / 제안서 §1.3.2 (p29~31)',user:'예산 담당자, 관리자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['과거 집행 패턴을 분석해 "이 예산 항목은 연말에 불용이 발생할 가능성이 높다"는 예측 결과를 화면에 표시한다','불용 가능성이 높은 항목을 빨간색으로 강조하고 "지금 조치가 필요한 이유"를 텍스트로 설명한다','불용 예상 금액을 타 항목으로 재배분하는 제안을 화면에서 바로 신청할 수 있다'],
    extReqs:[],
    tbd:['AI 예측 모델의 학습 데이터 기간·정확도 목표 설정 (개발사 협의)']},
  {id:'NH-BUD-005',name:'결산 마감 체크리스트',cat:'BUD',catName:'예산·결산·회계',pri:'Must',type:'개선',stage:'1차',star:false,src:'As-Is 결산전 수행작업[GS9005]',user:'회계·결산 담당자',asIs:'결산전 수행작업[GS9005] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['결산 마감 전 수행해야 할 항목(감가상각 처리·리스 마감·이수증 확인 등)을 체크리스트로 표시한다','각 항목의 완료 여부를 실시간으로 체크하고 미완료 항목이 있으면 마감 버튼이 비활성화된다','체크리스트 완료 이력(처리자·처리일시)을 보관한다'],
    extReqs:['담당자별로 체크리스트를 분배하고 완료 현황을 한 화면에서 관리자가 모니터링할 수 있다 ★'],
    tbd:[]},
  {id:'NH-BUD-006',name:'외부 감사자료 자동 생성',cat:'BUD',catName:'예산·결산·회계',pri:'Must',type:'개선',stage:'2차',star:false,src:'RFP 예산·회계결산 고도화 / 제안서 §1.3.3 (p32~34)',user:'회계·감사 담당자',asIs:'수작업 → 자동화',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['외부 감사(주석 공시·연결 결산) 대응 자료를 시스템 데이터로 자동 생성한다','자동 생성된 자료의 수치를 검증(이전 기간 대비 이상치 감지)하고 이상 항목을 강조한다','생성된 자료를 Excel·PDF 형태로 출력한다'],
    extReqs:[],
    tbd:['제출해야 하는 외부 감사자료의 정확한 서식·항목 목록 파악 필요']},
  {id:'NH-BUD-007',name:'전표·회계 연동 조회',cat:'BUD',catName:'예산·결산·회계',pri:'Must',type:'개선',stage:'1차',star:false,src:'As-Is 전표대장[GS1B01]·B/S[GS1005]',user:'회계 담당자',asIs:'전표대장·B/S 폼 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 취득·처분·감가상각으로 생성된 회계 전표를 시스템 화면에서 직접 조회한다(NH-EXT-004 연동)','전표 대장: 기간·계정과목·부서·전표 유형으로 검색하고 차변·대변 합계를 표시한다','재무상태표(B/S) 잔액을 ERP 데이터 기준으로 조회하고 자산 계정별 잔액을 확인한다','조회한 전표·B/S 데이터를 Excel로 내보낼 수 있다'],
    extReqs:['전표 한 건을 클릭하면 그 전표를 발생시킨 원천 자산·거래로 역추적(드릴다운)할 수 있다 ★','자산 원장 금액과 회계 전표 금액의 불일치를 자동으로 검출해 강조 표시한다 ★'],
    tbd:['ERP(전표대장·B/S) 연동 방식·조회 권한 범위 확정 필요']},
  // NH-WKF 신청·검증·승인 (7건)
  {id:'NH-WKF-001',name:'자산 취득 신청→승인 프로세스',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.2 (p12~13)·§1.4.1 (p35~37)',user:'신청자, 검토자, 승인권자',asIs:'수기·이메일 → 시스템화',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 취득 신청 폼: 자산명·유형·수량·예산 항목·취득 사유·첨부 견적서','결재 라인을 자동으로 불러오고(인사DB 연동), 현재 어느 단계에서 대기 중인지 시각화한다','각 단계별 처리자는 시스템 내에서 승인·반려·의견 첨부를 처리한다','반려 시 신청자에게 사유와 함께 즉시 알림이 발송된다'],
    extReqs:['전체 신청 현황을 칸반 보드(단계별 컬럼)로 시각화한다(수요발생→검토→승인→완료) ★','특정 기간 이상(예: 3일) 처리가 없으면 처리 담당자에게 독촉 알림을 자동 발송한다'],
    tbd:[]},
  {id:'NH-WKF-002',name:'차량 리스 신청·검증',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.4.1 (p35~37)·§1.4.2 (p38~40)',user:'차량 신청자, 검증 담당자',asIs:'차량 리스 계약[LS2010·LS2012] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['차량 리스 신청 시: 신청자 정보, 차량 용도, 출퇴근 거리, 배정 기관 자동 입력','지도 API로 출퇴근 거리를 자동 계산하고 지원 요건 충족 여부를 즉시 표시한다','계약 기간·월 임차료·보험 정보를 등록하고 만기 알림을 자동 설정한다'],
    extReqs:['인사DB와 연동해 신청자의 직급·근속연수 기반 차량 등급 자격을 자동으로 검증한다 ★','차량 운행기록부(NH-SYS 연동)를 계약과 연결해 연간 사용 실적을 리스 갱신 시 참조한다 ★'],
    tbd:[]},
  {id:'NH-WKF-003',name:'부동산(사택·합숙소) 신청·검증',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.4.1 (p35~37)·§1.4.2 (p38~40)',user:'부동산 신청자, 검증 담당자',asIs:'부동산 리스(임차) 계약[LS1010] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['부동산 임차 신청 시: 소재지, 면적, 임차료, 부양가족 수 입력','한국부동산원 API로 해당 지역 시세를 자동 조회하고 적정 임차료 범위를 표시한다','인사DB 부양가족 수로 면적 기준 충족 여부를 자동 계산한다'],
    extReqs:['행정안전부 주소 API로 입력 주소를 표준화하고 지도에 위치를 표시한다','임차 계약 만기 90일·30일·7일 전에 자동 알림을 발송한다 ★'],
    tbd:[]},
  {id:'NH-WKF-004',name:'자산 처분·이관 승인',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.2 (p12~13)·§1.4.1 (p35~37)',user:'처분 신청자, 승인권자',asIs:'결재 관리[RT1005] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 처분(매각·폐기·기부) 및 이관(부서 간 이동) 신청을 결재 라인에 따라 승인 처리한다(NH-AST-003·004 연동)','처분·이관 신청 시 대상 자산 목록, 사유, 일자, 잔존 장부가액·예상 손익을 함께 표시해 승인권자의 판단을 돕는다','각 단계별 처리자는 승인·반려·의견 첨부를 처리하고, 현재 결재 진행 단계를 시각화한다','반려 시 신청자에게 사유와 함께 즉시 알림을 발송한다'],
    extReqs:['고액 자산(기준 금액 초과)은 결재 단계를 자동으로 한 단계 상향한다 ★','처분·이관 승인 완료 시 해당 자산 상태·위치·담당자 정보가 자동으로 갱신된다(NH-DSH-003 연동)'],
    tbd:[]},
  {id:'NH-WKF-005',name:'단계별 진행 현황판',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'신규',stage:'1차',star:false,src:'제안서 §1.1.2 (p12~13)·§1.4.1 (p35~37)',user:'담당자, 관리자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['신청·승인이 필요한 모든 업무(취득·이관·처분·리스·예산 조정)의 전체 현황을 한 화면에서 관리자가 조회한다','각 건의 현재 단계, 담당자, 경과 일수, 처리 기한을 표시한다','기한 초과 건은 빨간색으로 강조하고 상위 관리자에게 에스컬레이션 버튼을 제공한다'],
    extReqs:['처리 소요 시간(평균·최장·최단)을 통계로 제공해 병목 단계를 식별하게 한다 ★'],
    tbd:[]},
  {id:'NH-WKF-006',name:'결재 관리',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'개선',stage:'1차',star:false,src:'As-Is 결재 관리[RT1005]',user:'결재 담당자',asIs:'결재 관리[RT1005] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['모든 업무(취득·이관·처분·리스·예산 조정)의 결재 문서를 한 곳에서 통합 관리한다','"내가 결재할 문서", "내가 상신한 문서", "결재 완료 문서"를 탭으로 구분해 조회한다','결재선(상신→검토→승인)을 표시하고, 각 단계에서 승인·반려·전결·대결을 처리한다','결재 의견과 첨부 문서를 단계별로 남기고 결재 이력을 보관한다'],
    extReqs:['결재권자 부재 시 대결자(위임 결재자)를 지정해 결재 지연을 방지한다 ★','결재 처리 시 모바일 알림으로 즉시 통지하고 간편 승인을 지원한다 ★'],
    tbd:[]},
  {id:'NH-WKF-007',name:'체크리스트 미이행 단계 잠금',cat:'WKF',catName:'신청·검증·승인',pri:'Must',type:'신규',stage:'1차',star:true,src:'RFP 업무지원 프로세스 / 제안서 §1.6.2 (p57)',user:'모든 업무 처리자',asIs:'없음(수기 체크)',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['각 업무 단계에 필수 체크리스트 항목을 설정할 수 있다','체크리스트 미완료 항목이 있으면 다음 단계 진행 버튼이 비활성화된다','관리자 권한으로 예외적으로 잠금을 해제하고 사유를 기록할 수 있다'],
    extReqs:[],
    tbd:[]},
  // NH-AI AI·자동화 (4건)
  {id:'NH-AI-001',name:'AI Agent 자연어 질의응답',cat:'AI',catName:'AI·자동화',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 실시간 자산 관제 / 제안서 §1.2.1 (p18~22)·§1.2.2 (p23~24)',user:'전체 사용자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자연어(한국어)로 자산 관련 질의를 입력하면 시스템이 자산 DB를 조회해 답변을 제공한다','예시 질의: "본점영업부에서 노후 PC 목록을 알려줘", "이번 달 보험 만기 차량이 있어?"','답변에는 자산 목록·차트·영향 금액 등 시각화 정보를 함께 제공한다','추천 질문(Suggested Questions)을 화면에 제공해 처음 사용자도 쉽게 활용하게 한다'],
    extReqs:['AI Agent의 분석 결과에서 바로 "보고서 생성", "조치 신청"으로 연결되는 액션 버튼을 제공한다','오타·띄어쓰기 오류 입력도 퍼지 매칭으로 정상 처리한다','대화 이력을 저장해 이전 맥락을 이어서 질의할 수 있다 ★'],
    tbd:[]},
  {id:'NH-AI-002',name:'노후·교체 시기 AI 예측',cat:'AI',catName:'AI·자동화',pri:'Should',type:'신규',stage:'2차',star:false,src:'제안서 §1.2.1 (p18~22)',user:'자산 관리자',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['자산의 취득일·내용연수·수리 이력·사용 강도를 기반으로 교체 권고 시점을 예측한다','예측 결과를 대시보드의 "교체 시기 도래" 타임라인에 반영한다','예측 근거를 텍스트로 설명하고 신뢰도 점수를 함께 표시한다 ★'],
    extReqs:[],
    tbd:[]},
  {id:'NH-AI-003',name:'불용예산 사전 탐지 AI',cat:'AI',catName:'AI·자동화',pri:'Should',type:'신규',stage:'2차',star:false,src:'제안서 §1.3.2 (p29~31)',user:'예산 담당자',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['과거 예산 집행 패턴을 학습해 연말에 불용(미집행)이 발생할 가능성이 높은 예산 항목을 사전에 탐지한다(NH-BUD-004 화면 연동)','항목별 불용 위험도를 점수·등급으로 산출하고 위험 높은 항목을 목록 상단에 노출한다','탐지 근거(집행 속도 둔화·전년 동기 대비 등)를 텍스트로 함께 설명한다'],
    extReqs:['탐지된 불용 예상 금액을 다른 시급한 항목으로 재배분하는 제안을 자동 생성한다 ★','분기별로 탐지 정확도를 자체 평가해 모델을 재학습한다 ★'],
    tbd:['AI 예측 모델의 학습 데이터 기간·정확도 목표 설정 (개발사 협의)']},
  {id:'NH-AI-004',name:'AI 자동 보고서 초안 생성',cat:'AI',catName:'AI·자동화',pri:'Should',type:'신규',stage:'2차',star:false,src:'제안서 §1.2.2 (p23~24)·§1.3.3 (p32~34)',user:'담당자, 관리자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['AI Agent 분석 결과나 자산·예산 현황을 바탕으로 보고서 초안을 자동으로 작성한다(NH-AI-001·NH-RPT-001 연동)','보고서 구성(요약·현황표·분석·예산 영향·조치 권고·결론)을 자동으로 채운다','생성된 초안은 사용자가 화면에서 수정한 뒤 확정·출력할 수 있다'],
    extReqs:['임원 보고용 요약 섹션(핵심 수치 3~5개 + 인사이트 한 줄)을 자동 생성한다 ★','보고서에 사용된 수치의 출처(자산 ID·전표 번호)를 자동으로 각주로 표기한다 ★'],
    tbd:['자동 생성 보고서의 사실 정확성 검증(환각 방지) 방안 — 개발사 협의']},
  // NH-RPT 리포트·보고서 (4건)
  {id:'NH-RPT-001',name:'자산 현황 리포트',cat:'RPT',catName:'리포트·보고서',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.1 (p11)·§1.3.3 (p32~34)',user:'담당자, 관리자, 임원',asIs:'기존 현황 화면 → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 현황 리포트 유형: 전체 자산 목록, 유형별 현황, 부서별 현황, 취득·처분 내역','기간·부서·유형 조건을 선택해 리포트를 생성한다','Excel·PDF 출력을 지원한다'],
    extReqs:['AI Agent 답변 결과에서 "보고서 작성" 버튼으로 자동으로 리포트 초안을 생성한다','리포트에 임원 보고용 요약 섹션(핵심 수치 3~5개 + 인사이트 한 줄)을 자동 생성한다 ★'],
    tbd:[]},
  {id:'NH-RPT-002',name:'조직별 자산 비교 리포트',cat:'RPT',catName:'리포트·보고서',pri:'Must',type:'신규',stage:'1차',star:false,src:'제안서 §1.1.1 (p11)',user:'관리자, 임원',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['본부·부서·지역 등 조직 단위별로 자산 보유 현황(수량·금액·유형 구성)을 비교하는 리포트를 생성한다','비교 기준(금액·수량·노후도·집행률)을 선택해 조직 순위 표와 막대 그래프로 표시한다','특정 시점·기간을 선택해 해당 시점의 조직별 현황을 비교한다(NH-DSH-005 데이터 연동)','Excel·PDF 출력을 지원한다'],
    extReqs:['전기 대비 증감을 색상(증가=파랑, 감소=빨강)으로 표현하고 변동 폭 상위 조직을 자동 강조한다 ★','조직별 1인당 자산액·노후 자산 비율 등 파생 지표를 함께 산출한다 ★'],
    tbd:[]},
  {id:'NH-RPT-003',name:'감가상각 시뮬레이션 리포트',cat:'RPT',catName:'리포트·보고서',pri:'Should',type:'신규',stage:'2차',star:false,src:'제안서 §1.5.2 (p45~51)',user:'회계 담당자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['특정 자산의 내용연수 변경·잔존가치율 조정 시 향후 n년간 감가상각액 변화를 시뮬레이션한다','복수 시나리오(정액법 vs 정율법)를 비교해 표·그래프로 보여준다'],
    extReqs:[],
    tbd:[]},
  {id:'NH-RPT-004',name:'사용자 정의형 데이터 추출',cat:'RPT',catName:'리포트·보고서',pri:'Could',type:'신규',stage:'2차',star:true,src:'제안서 1.5.4(선제 제안)',srcTip:'제안서 1.5.4에 짧은 언급만 있고 요건 미정의. 담당자 자율 데이터 추출 수요를 블루비가 구체화한 항목',user:'담당자, 분석팀',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['사용자가 추출할 항목(컬럼)·조건(필터)·정렬 기준을 화면에서 직접 선택해 자유롭게 데이터를 추출한다','정형 리포트로 제공되지 않는 비정형 조회 요구를 코드 수정 없이 화면 설정만으로 대응한다','추출 결과를 Excel·CSV로 내려받는다'],
    extReqs:['자주 쓰는 추출 조건을 "내 쿼리"로 저장하고 재실행할 수 있다 ★','추출 조건을 정기(매월·매주) 자동 실행으로 예약하고 결과를 메일로 받는다 ★'],
    tbd:['사용자에게 노출할 추출 가능 데이터 범위·권한 통제 방안 협의 필요']},
  // NH-EXT 외부 시스템 연동 (5건)
  {id:'NH-EXT-001',name:'부동산 시세 API 연동',cat:'EXT',catName:'외부 시스템 연동',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 데이터 연동·최신화 / 제안서 §1.4.2·§1.5.1 (p41~44)',user:'자동(백그라운드)',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['부동산 임차 신청 시 주소를 입력하면 해당 지역 시세(전세·월세)를 한국부동산원 API로 자동 조회한다','조회된 시세는 화면에 "기준 시세 n억~n억(조회일: YYYY-MM-DD)" 형태로 표시한다','시세 조회 실패 시 "수동 입력" 모드로 전환하고 이유를 표시한다'],
    extReqs:[],
    tbd:[]},
  {id:'NH-EXT-002',name:'지도 API 연동(카카오·네이버)',cat:'EXT',catName:'외부 시스템 연동',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 데이터 연동·최신화 / 제안서 §1.4.2·§1.5.1 (p41~44)',user:'자동(신청 시)',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['자산 등록·신청 시 주소를 입력하면 카카오·네이버 지도 API로 위도·경도 좌표를 자동 변환한다','대시보드 지역별 관리 현황 지도 및 자산 상세 화면에 해당 자산의 위치를 지도 핀으로 표시한다','건물·토지 자산은 지번 주소와 도로명 주소 중 하나만 입력해도 나머지를 자동으로 채운다 ★'],
    extReqs:[],
    tbd:[]},
  {id:'NH-EXT-003',name:'인사 DB 연동',cat:'EXT',catName:'외부 시스템 연동',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 데이터 연동·최신화 / 제안서 §1.4.2·§1.5.1 (p41~44)',user:'자동(신청 시)',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['자산 신청 시 신청자의 직급·부서·부양가족 수·근무지를 인사DB에서 자동으로 불러온다','결재 라인을 인사DB 조직도를 기반으로 자동 구성한다','인사 변동(이동·퇴직) 시 해당 직원 담당 자산을 "담당자 공석" 상태로 자동 전환하고 알림을 발송한다 ★'],
    extReqs:[],
    tbd:[]},
  {id:'NH-EXT-004',name:'ERP·회계 시스템 연동',cat:'EXT',catName:'외부 시스템 연동',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 데이터 연동·최신화 / 제안서 §1.5.1 (p41~44)',user:'회계 담당자',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['자산 취득·처분·감가상각 처리 결과가 ERP 회계 시스템에 자동으로 전표로 생성된다','연동 결과(성공/실패)를 화면에서 조회할 수 있고 실패 건은 재처리할 수 있다','전표 대장·B/S 잔액을 ERP 데이터를 기반으로 조회한다'],
    extReqs:[],
    tbd:[]},
  {id:'NH-EXT-005',name:'주소 표준화 API',cat:'EXT',catName:'외부 시스템 연동',pri:'Should',type:'신규',stage:'2차',star:false,src:'RFP 데이터 연동·최신화 / 제안서 §1.5.1 (p41~44)',user:'자동',asIs:'없음 — 신규',by:'개발사 전담',
    basicReqs:['자산 등록 시 입력한 주소를 행정안전부 도로명주소 API로 검증하고 표준 형식으로 저장한다','주소 자동완성(드롭다운 검색) 기능을 자산 등록·이관 등 주소 입력 화면에 공통 적용한다','구 주소(지번)·도로명 주소가 혼재된 기존 데이터를 일괄 표준화하는 관리자 배치 도구를 제공한다 ★'],
    extReqs:[],
    tbd:[]},
  // NH-SYS 시스템 공통·관리 (4건)
  {id:'NH-SYS-001',name:'권한·역할 관리',cat:'SYS',catName:'시스템 공통·관리',pri:'Must',type:'개선',stage:'1차',star:false,src:'제안서 §1.1.1 (p3)',user:'시스템 관리자',asIs:'권한그룹 관리[SY2002] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['역할별 권한 설정: 조회 전용 / 등록·수정 / 승인·결재 / 관리자','권한이 없는 메뉴·버튼은 화면에서 비활성화 또는 미표시 처리한다','권한 변경 이력을 감사 로그로 보관한다'],
    extReqs:['부서별·자산 유형별로 세분화된 접근 권한을 설정할 수 있다(예: A 부서는 차량 데이터만 조회)'],
    tbd:[]},
  {id:'NH-SYS-002',name:'공통코드 관리',cat:'SYS',catName:'시스템 공통·관리',pri:'Must',type:'개선',stage:'1차',star:false,src:'As-Is 공통코드 관리[SY1001]',user:'시스템 관리자',asIs:'공통코드 관리[SY1001] → 개선',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 분류·상태·부서·위치 등 시스템 전반에서 사용하는 코드 값을 단일 화면에서 관리한다','코드 그룹별로 코드 추가·수정·삭제(논리 삭제)·순서 조정이 가능하다','코드 변경 시 해당 코드를 참조하는 기존 데이터에는 영향을 주지 않도록 이전 값을 보존한다','코드표는 엑셀 내려받기를 지원한다'],
    extReqs:['다국어 코드 레이블(한국어·영문)을 함께 관리해 향후 해외 법인 확장에 대비한다'],
    tbd:[]},
  {id:'NH-SYS-003',name:'업무 체크리스트·템플릿 관리',cat:'SYS',catName:'시스템 공통·관리',pri:'Should',type:'신규',stage:'2차',star:false,src:'RFP 업무지원 프로세스 / 제안서 §1.6.1·§1.6.2',user:'시스템 관리자, 담당자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['업무 유형별(취득·이관·계약·점검) 체크리스트를 관리자가 등록·수정할 수 있다','각 업무 항목(계약서·지급의뢰서 등)의 표준 템플릿 양식을 시스템에서 다운로드할 수 있다','체크리스트 항목을 수행 필수/선택으로 구분하고, 필수 항목 미완료 시 다음 단계 진행을 차단한다(NH-WKF-007 연동)'],
    extReqs:[],
    tbd:[]},
  {id:'NH-SYS-004',name:'시스템 이력·감사 로그',cat:'SYS',catName:'시스템 공통·관리',pri:'Must',type:'신규',stage:'1차',star:true,src:'블루비 선제 제안 — RFP·제안서 미명시',srcTip:'RFP·제안서 미명시. 전자금융감독규정 등 금융권 내부통제 요건 상 필수 — 감사 대응을 위해 블루비가 선제 제안',user:'감사 담당자, 관리자',asIs:'없음 또는 미흡',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['자산 등록·수정·삭제·권한 변경 등 모든 데이터 변경 이벤트에 대해 "누가·언제·무엇을·어떻게 바꿨는지"를 기록한다','감사 로그는 수정·삭제가 불가능하다(Immutable)','기간·사용자·이벤트 유형으로 감사 로그를 검색할 수 있다'],
    extReqs:[],
    tbd:[]},
  // NH-UX UI/UX 표준 (3건)
  {id:'NH-UX-001',name:'전체 디자인 시스템·가이드',cat:'UI',catName:'UI/UX 표준',pri:'Must',type:'신규',stage:'1차',star:false,src:'RFP 공통 사항 (UI/UX 표준화) / 제안서 §1.1.3 (p14~15)',user:'개발사, 유지보수 팀',asIs:'없음 — 신규',by:'블루비 전담 산출',
    basicReqs:['색상·서체·간격·아이콘·그리드를 정의한 디자인 가이드를 Figma로 작성하고 개발사에 전달한다','버튼·입력 필드·카드·테이블·모달·알림 등 공통 컴포넌트의 사용 규칙을 정의한다','MS Edge(표준 브라우저) 기준으로 검증하고, 1920×1080 해상도를 기본 해상도로 설정한다'],
    extReqs:['다크모드 대응을 디자인 시스템 단계부터 고려한다(토큰 기반 색상 관리) ★','컴포넌트마다 "사용 가능" / "비활성" / "오류" 상태별 디자인을 모두 정의한다'],
    tbd:[]},
  {id:'NH-UX-002',name:'공통 컴포넌트 라이브러리',cat:'UI',catName:'UI/UX 표준',pri:'Must',type:'신규',stage:'1차',star:false,src:'제안서 §1.1.3 (p14~15)',user:'개발사, 유지보수 팀',asIs:'없음 — 신규',by:'블루비 전담 산출',
    basicReqs:['버튼·입력 필드·드롭다운·날짜 선택·테이블(그리드)·모달·탭·알림 등 공통 UI 컴포넌트를 라이브러리로 표준화한다(NH-UX-001 디자인 시스템 기반)','각 컴포넌트는 WebSquare 표준 컴포넌트로 구현되어 전 화면에서 재사용된다','컴포넌트별 사용 가이드(속성·이벤트·예시)를 문서화해 개발사·유지보수 팀에 제공한다'],
    extReqs:['스마트 데이터 그리드(정렬·필터·컬럼 조정·Excel 내보내기)를 공통 컴포넌트로 제공해 전 목록 화면에서 동일하게 동작하게 한다 ★','컴포넌트 변경 시 영향 받는 화면을 추적할 수 있도록 컴포넌트-화면 사용 관계를 관리한다 ★'],
    tbd:[]},
  {id:'NH-UX-003',name:'접근성(웹 표준) 준수',cat:'UI',catName:'UI/UX 표준',pri:'Should',type:'신규',stage:'1차',star:true,src:'제안서 §1.1.1 (p3)',user:'전체 사용자',asIs:'없음 — 신규',by:'블루비 설계 / 천명소프트 구현',
    basicReqs:['WCAG 2.1 AA 수준의 접근성을 준수한다(색상 대비·키보드 탐색·스크린 리더 지원)','주요 화면에 대한 접근성 점검 체크리스트를 작성하고 검수에 포함한다'],
    extReqs:[],
    tbd:[]}
];

var _showDevReqs = false;
var _reqFilter = { cat: 'ALL', pri: 'ALL', stage: 'ALL', type: 'ALL' };
var _reqBuilt = false;

function buildReqSection() {
  if (_reqBuilt) return;
  _reqBuilt = true;
  // 편집 모달 바깥 클릭 시 닫기 (한 번만 등록)
  var _reqModal = document.getElementById('req-edit-modal');
  if (_reqModal) {
    _reqModal.addEventListener('click', function(e) {
      if (e.target === this) closeReqEditModal();
    });
  }
  var _catCounts = {};
  REQ_DATA.forEach(function(r) { _catCounts[r.cat] = (_catCounts[r.cat] || 0) + 1; });
  var catData = [
    {k:'ALL',label:'전체',count:REQ_DATA.length},
    {k:'DSH',label:'DSH',count:_catCounts['DSH']||0},
    {k:'AST',label:'AST',count:_catCounts['AST']||0},
    {k:'BUD',label:'BUD',count:_catCounts['BUD']||0},
    {k:'WKF',label:'WKF',count:_catCounts['WKF']||0},
    {k:'AI',label:'AI',count:_catCounts['AI']||0},
    {k:'RPT',label:'RPT',count:4},
    {k:'EXT',label:'EXT',count:5},
    {k:'SYS',label:'SYS',count:4},
    {k:'UI',label:'UX',count:3}
  ];
  var catTabs = document.getElementById('req-cat-tabs');
  if (catTabs) {
    catTabs.innerHTML = catData.map(function(c) {
      return '<button class="req-cat-btn' + (c.k === 'ALL' ? ' active' : '') + '" data-cat="' + c.k + '">' +
        c.label + ' <span style="opacity:.65">(' + c.count + ')</span></button>';
    }).join('');
    catTabs.addEventListener('click', function(e) {
      var btn = e.target.closest('.req-cat-btn');
      if (!btn) return;
      catTabs.querySelectorAll('.req-cat-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _reqFilter.cat = btn.dataset.cat;
      _clearStatActive();
      _applyReqFilter();
    });
  }
  var priChips = document.getElementById('req-priority-chips');
  if (priChips) {
    var priData = [
      {k:'ALL',label:'전체',cls:''},
      {k:'Must',label:'Must',cls:'must-chip'},
      {k:'Should',label:'Should',cls:'should-chip'},
      {k:'Could',label:'Could',cls:'could-chip'}
    ];
    priChips.innerHTML = priData.map(function(p) {
      return '<button class="req-chip ' + p.cls + (p.k === 'ALL' ? ' active' : '') + '" data-filter="pri" data-val="' + p.k + '">' + p.label + '</button>';
    }).join('');
    priChips.addEventListener('click', function(e) {
      var btn = e.target.closest('.req-chip');
      if (!btn) return;
      priChips.querySelectorAll('.req-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _reqFilter.pri = btn.dataset.val;
      _clearStatActive();
      _applyReqFilter();
    });
  }
  var stgChips = document.getElementById('req-stage-chips');
  if (stgChips) {
    var stgData = [
      {k:'ALL',label:'전체',cls:''},
      {k:'1차',label:'1차',cls:'s1-chip'},
      {k:'2차',label:'2차',cls:'s2-chip'}
    ];
    stgChips.innerHTML = stgData.map(function(s) {
      return '<button class="req-chip ' + s.cls + (s.k === 'ALL' ? ' active' : '') + '" data-filter="stage" data-val="' + s.k + '">' + s.label + '</button>';
    }).join('');
    stgChips.addEventListener('click', function(e) {
      var btn = e.target.closest('.req-chip');
      if (!btn) return;
      stgChips.querySelectorAll('.req-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _reqFilter.stage = btn.dataset.val;
      _clearStatActive();
      _applyReqFilter();
    });
  }
  var typeChips = document.getElementById('req-type-chips');
  if (typeChips) {
    var typeData = [
      {k:'ALL',label:'전체',cls:''},
      {k:'신규',label:'신규',cls:'new-chip'},
      {k:'개선',label:'개선',cls:'imp-chip'}
    ];
    typeChips.innerHTML = typeData.map(function(t) {
      return '<button class="req-chip ' + t.cls + (t.k === 'ALL' ? ' active' : '') + '" data-filter="type" data-val="' + t.k + '">' + t.label + '</button>';
    }).join('');
    typeChips.addEventListener('click', function(e) {
      var btn = e.target.closest('.req-chip');
      if (!btn) return;
      typeChips.querySelectorAll('.req-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _reqFilter.type = btn.dataset.val;
      _clearStatActive();
      _applyReqFilter();
    });
  }
  // stat 카드 클릭 → 필터 활성화
  var statsRow = document.getElementById('req-stats-row');
  if (statsRow) {
    statsRow.addEventListener('click', function(e) {
      var card = e.target.closest('.stat-btn');
      if (!card) return;
      var action = card.dataset.stat;
      // 모든 stat 카드 active 해제 후 클릭된 것만 활성
      statsRow.querySelectorAll('.stat-btn').forEach(function(c) { c.classList.remove('stat-active'); });
      card.classList.add('stat-active');
      // 필터 초기화 후 해당 필터만 적용
      _reqFilter = { cat: 'ALL', pri: 'ALL', stage: 'ALL', type: 'ALL' };
      if (action !== 'reset') {
        var parts = action.split(':');
        if (parts[0] === 'pri')   _reqFilter.pri   = parts[1];
        if (parts[0] === 'stage') _reqFilter.stage = parts[1];
        if (parts[0] === 'type')  _reqFilter.type  = parts[1];
      }
      // 칩 UI 동기화
      _syncChipsToFilter();
      _applyReqFilter();
      // 그리드로 스크롤
      var tableWrap = document.getElementById('req-table-wrap');
      if (tableWrap) tableWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  var tbody = document.getElementById('req-tbody');
  if (tbody) {
    var rows = '';
    REQ_DATA.forEach(function(r) {
      var priBadge = r.pri === 'Must' ? '<span class="badge-must">Must</span>'
        : r.pri === 'Should' ? '<span class="badge-should">Should</span>'
        : '<span class="badge-could">Could</span>';
      var typeBadge = r.type === '신규' ? '<span class="badge-new">신규</span>' : '<span class="badge-imp">개선</span>';
      var stgBadge = r.stage === '1차' ? '<span class="badge-s1">1차</span>' : '<span class="badge-s2">2차</span>';
      var starHtml = r.star ? '<span class="req-star" title="고객 미명시 확장·예측 제안">★</span>' : '';
      var isPre = r.src && r.src.indexOf('선제 제안') !== -1;
      var tip = r.srcTip || REQ_SRC_TIPS[r.id] || '';
      var srcDisplay = r.src.replace(/§/g, '');
      var srcCell = tip
        ? '<td class="req-src-cell req-src-tip" data-tip="' + tip + '">' + srcDisplay + (isPre ? ' <span class="req-tip-icon">?</span>' : '') + '</td>'
        : '<td class="req-src-cell">' + srcDisplay + '</td>';
      rows += '<tr class="req-data-row' + (isPre ? ' req-row-pre' : '') + '" data-rid="' + r.id + '" data-cat="' + r.cat + '" data-pri="' + r.pri + '" data-stage="' + r.stage + '" data-type="' + r.type + '" data-by="' + r.by + '">' +
        '<td><span class="req-id-cell">' + r.id + '</span><button class="req-edit-btn" onclick="openReqEditModal(\'' + r.id + '\')" title="수정">✏</button></td>' +
        '<td><span class="req-name-cell" title="클릭하면 상세 정의서로 이동">' + r.name + starHtml + '</span></td>' +
        '<td>' + priBadge + '</td>' +
        '<td>' + typeBadge + '</td>' +
        '<td>' + stgBadge + '</td>' +
        srcCell +
        '<td class="req-user-cell">' + r.user + '</td>' +
        '<td class="req-asis-cell">' + r.asIs + '</td>' +
        '<td class="req-by-cell">' + r.by + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = rows;

    // 출처 툴팁
    var tipEl = document.getElementById('req-tip');
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.id = 'req-tip';
      document.body.appendChild(tipEl);
    }
    tbody.addEventListener('mouseover', function(e) {
      var cell = e.target.closest('.req-src-tip');
      if (!cell) return;
      tipEl.innerHTML = formatSrcTip(cell.dataset.tip);
      tipEl.style.display = 'block';
    });
    tbody.addEventListener('mousemove', function(e) {
      var cell = e.target.closest('.req-src-tip');
      if (!cell) { tipEl.style.display = 'none'; return; }
      var tw = tipEl.offsetWidth || 360, th = tipEl.offsetHeight || 100;
      var x = e.clientX + 14, y = e.clientY - 12;
      if (x + tw + 8 > window.innerWidth) x = e.clientX - tw - 8;
      if (y + th + 8 > window.innerHeight) y = e.clientY - th - 8;
      tipEl.style.left = x + 'px';
      tipEl.style.top = y + 'px';
    });
    tbody.addEventListener('mouseout', function(e) {
      if (!e.relatedTarget || !e.relatedTarget.closest('.req-src-tip')) tipEl.style.display = 'none';
    });

    // 기능명 클릭 → MD 뷰어 열기 + 해당 섹션으로 스크롤
    tbody.addEventListener('click', function(e) {
      var nameSpan = e.target.closest('.req-name-cell');
      if (!nameSpan) return;
      var tr = nameSpan.closest('tr[data-rid]');
      if (!tr) return;
      var rid = tr.dataset.rid;

      function scrollToAnchor() {
        var anchor = document.getElementById('req-anchor-' + rid);
        if (!anchor) return;
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        anchor.classList.remove('req-anchor-flash');
        void anchor.offsetWidth;
        anchor.classList.add('req-anchor-flash');
        setTimeout(function() { anchor.classList.remove('req-anchor-flash'); }, 2500);
      }

      var viewer = document.getElementById('req-md-viewer');
      var isOpen = viewer && viewer.style.display !== 'none';

      if (!isOpen) toggleReqMd();
      setTimeout(scrollToAnchor, 80);
    });
  }
}


function _clearStatActive() {
  var row = document.getElementById('req-stats-row');
  if (row) row.querySelectorAll('.stat-btn').forEach(function(c) { c.classList.remove('stat-active'); });
}

function _syncChipsToFilter() {
  var f = _reqFilter;
  var catTabs = document.getElementById('req-cat-tabs');
  if (catTabs) catTabs.querySelectorAll('.req-cat-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.cat === f.cat);
  });
  var priChips = document.getElementById('req-priority-chips');
  if (priChips) priChips.querySelectorAll('.req-chip').forEach(function(b) {
    b.classList.toggle('active', b.dataset.val === f.pri);
  });
  var stgChips = document.getElementById('req-stage-chips');
  if (stgChips) stgChips.querySelectorAll('.req-chip').forEach(function(b) {
    b.classList.toggle('active', b.dataset.val === f.stage);
  });
  var typeChips = document.getElementById('req-type-chips');
  if (typeChips) typeChips.querySelectorAll('.req-chip').forEach(function(b) {
    b.classList.toggle('active', b.dataset.val === f.type);
  });
}

function _applyReqFilter() {
  var f = _reqFilter;
  var tbody = document.getElementById('req-tbody');
  if (!tbody) return;
  var dataRows = tbody.querySelectorAll('.req-data-row');
  var visible = 0;
  dataRows.forEach(function(tr) {
    var catOk  = f.cat   === 'ALL' || tr.dataset.cat   === f.cat;
    var priOk  = f.pri   === 'ALL' || tr.dataset.pri   === f.pri;
    var stgOk  = f.stage === 'ALL' || tr.dataset.stage === f.stage;
    var typOk  = f.type  === 'ALL' || tr.dataset.type  === f.type;
    var byOk   = _showDevReqs || tr.dataset.by !== '개발사 전담';
    var show   = catOk && priOk && stgOk && typOk && byOk;
    tr.classList.toggle('req-hidden', !show);
    if (show) visible++;
  });
  var label = document.getElementById('req-count-label');
  if (label) label.textContent = visible + '건 표시';
}

function toggleDevReqs() {
  _showDevReqs = !_showDevReqs;
  var btn = document.getElementById('btn-dev-reqs-toggle');
  if (btn) btn.textContent = _showDevReqs ? '개발사 업무닫기' : '개발사 업무보기';
  _applyReqFilter();
}

function buildReqMdHtml() {
  var catOrder = ['DSH','AST','BUD','WKF','AI','RPT','EXT','SYS','UI','UX'];
  var catGroups = {};
  REQ_DATA.forEach(function(r) {
    if (!catGroups[r.cat]) catGroups[r.cat] = [];
    catGroups[r.cat].push(r);
  });
  var html = '';
  catOrder.forEach(function(cat) {
    var items = catGroups[cat];
    if (!items || !items.length) return;
    html += '<h2>' + items[0].catName + '</h2>\n';
    items.forEach(function(r) {
      var starHtml = r.star ? ' <span class="req-star">★</span>' : '';
      html += '<h3 id="req-anchor-' + r.id + '">' + r.id + ' ' + r.name + starHtml + '</h3>\n';
      html += '<table><thead><tr><th>항목</th><th>내용</th></tr></thead><tbody>';
      html += '<tr><td>우선순위</td><td><strong>' + r.pri + '</strong></td></tr>';
      html += '<tr><td>오픈 단계</td><td>' + r.stage + '</td></tr>';
      html += '<tr><td>분류</td><td>' + r.type + '</td></tr>';
      html += '<tr><td>출처</td><td>' + formatSrcTip(r.srcTip || r.src || '') + '</td></tr>';
      html += '<tr><td>주요 사용자</td><td>' + (r.user || '') + '</td></tr>';
      html += '<tr><td>As-Is 대응</td><td>' + (r.asIs || '') + '</td></tr>';
      html += '<tr><td>담당</td><td>' + (r.by || '') + '</td></tr>';
      html += '</tbody></table>\n';
      if (r.basicReqs && r.basicReqs.length) {
        html += '<p><strong>기본 요건</strong></p>\n<ul>';
        r.basicReqs.forEach(function(req) { html += '<li>' + req + '</li>'; });
        html += '</ul>\n';
      }
      if (r.extReqs && r.extReqs.length) {
        html += '<p><strong>확장·예측 요건 ★</strong></p>\n<ul>';
        r.extReqs.forEach(function(req) { html += '<li>' + req + '</li>'; });
        html += '</ul>\n';
      }
      if (r.tbd && r.tbd.length) {
        html += '<p><strong>TBD / 협의 필요</strong></p>\n<ul>';
        r.tbd.forEach(function(req) { html += '<li>' + req + '</li>'; });
        html += '</ul>\n';
      }
    });
  });
  return html;
}

function toggleReqMd() {
  var viewer = document.getElementById('req-md-viewer');
  var btn = document.getElementById('btn-req-md-toggle');
  if (!viewer) return;
  if (viewer.style.display !== 'none') {
    viewer.style.display = 'none';
    if (btn) btn.textContent = '📄 전체 요구사항 보기';
    return;
  }
  var content = document.getElementById('req-md-content');
  if (content && !content.innerHTML) {
    content.innerHTML = buildReqMdHtml();
    _mdReqCache = true;
  }
  viewer.style.display = '';
  if (btn) btn.textContent = '📄 전체 요구사항 접기';
  var cbs = _mdReqCallbacks.splice(0);
  cbs.forEach(function(cb) { cb(); });
}

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
      var htext = hm[2];
      // NH-XXX-NNN 패턴이 있으면 앵커 ID 부여 (기능명 클릭 스크롤 대상)
      var anchorM = htext.match(/^(NH-[A-Z]+-\d+)/);
      var anchorAttr = anchorM ? ' id="req-anchor-' + anchorM[1] + '"' : '';
      html += '<h' + lv + anchorAttr + ' class="md-h md-h' + lv + '">' + inline(htext) + '</h' + lv + '>\n';
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

// 요구사항 MD 뷰어 렌더링 후 출처 셀을 REQ_SRC_TIPS 전체 내용으로 교체
// REQ_SRC_TIPS에 없는 항목은 셀 원문(textContent)을 formatSrcTip()으로 처리해 § 제거
function postProcessReqMdSrc(container) {
  var anchors = container.querySelectorAll('[id^="req-anchor-NH-"]');
  anchors.forEach(function(h) {
    var id = h.id.replace('req-anchor-', '');
    var tip = (typeof REQ_SRC_TIPS !== 'undefined') ? REQ_SRC_TIPS[id] : null;
    var el = h.nextElementSibling;
    while (el) {
      if (/^H[1-6]$/.test(el.tagName)) break;
      if (el.tagName === 'TABLE') {
        el.querySelectorAll('tbody tr').forEach(function(tr) {
          var tds = tr.querySelectorAll('td');
          if (tds.length >= 2 && tds[0].textContent.trim() === '출처') {
            var raw = tip || tds[1].textContent.trim();
            tds[1].innerHTML = formatSrcTip(raw);
            tds[1].classList.add('req-md-src');
          }
        });
        break;
      }
      el = el.nextElementSibling;
    }
  });
}

// 출처 툴팁 HTML 포맷터
// "RFP X — Y / 제안서 §1.1.1 Z / §1.1.2 W" 형식을 구조화된 HTML로 변환
// 섹션(src-grp)으로 묶어 제목-목록 간격을 좁히고, 섹션 간 여백을 크게 유지
function formatSrcTip(raw) {
  if (!raw) return '';
  // § 기호를 포함해 HTML 이스케이프 처리
  function esc(s) {
    return String(s).replace(/§/g, '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  var segs = raw.split(' / ');

  // 세그먼트를 그룹(헤더 + 불릿 배열)으로 수집 — 단일 세그먼트도 동일 처리
  var groups = [];
  var cur = null;
  segs.forEach(function(seg) {
    seg = seg.trim();
    if (!seg) return;
    if (/^RFP /.test(seg)) {
      var di = seg.indexOf(' — ');
      if (di !== -1) {
        cur = {hdr: esc(seg.slice(0, di)), bullets: [esc(seg.slice(di + 3))]};
      } else {
        cur = {hdr: esc(seg), bullets: []};
      }
      groups.push(cur);
    } else if (/^제안서/.test(seg)) {
      if (cur && cur.isProposal) {
        cur.bullets.push(esc(seg.replace(/^제안서 §?/, '')));
      } else {
        cur = {hdr: '제안서', bullets: [esc(seg.replace(/^제안서 §?/, ''))], isProposal: true};
        groups.push(cur);
      }
    } else if (/^§/.test(seg)) {
      if (cur && cur.isProposal) {
        cur.bullets.push(esc(seg.slice(1)));
      } else {
        cur = {hdr: '제안서', bullets: [esc(seg.slice(1))], isProposal: true};
        groups.push(cur);
      }
    } else if (/^As-Is/.test(seg)) {
      cur = {hdr: 'As-Is', bullets: [esc(seg.replace(/^As-Is\s*/, ''))]};
      groups.push(cur);
    } else {
      // 이전 그룹이 있으면 이어붙이기 (섹션명 내부 '/' 로 잘못 분리된 경우 대응)
      if (cur) {
        cur.bullets.push(esc(seg));
      } else {
        cur = {hdr: null, bullets: [esc(seg)]};
        groups.push(cur);
      }
    }
  });

  if (!groups.length) return '<div class="src-grp">' + esc(raw) + '</div>';

  return groups.map(function(g) {
    var html = '<div class="src-grp">';
    if (g.hdr) html += '<b>' + g.hdr + '</b>';
    g.bullets.forEach(function(b) { html += '<span>ㆍ' + b + '</span>'; });
    html += '</div>';
    return html;
  }).join('');
}

function toggleQna1Md() {
  var viewer = document.getElementById('qna1-md-viewer');
  var btn = document.getElementById('btn-qna1-md-toggle');
  if (!viewer) return;

  if (viewer.style.display !== 'none') {
    viewer.style.display = 'none';
    if (btn) btn.textContent = '📄 전체 질의 결과 보기 (QnA_1차질의_정리.md)';
    return;
  }

  if (btn) btn.textContent = '📄 전체 질의 결과 접기';

  if (_mdQna1Cache) {
    viewer.style.display = '';
    return;
  }

  var content = document.getElementById('qna1-md-content');
  if (!content) return;

  if (location.protocol === 'file:') {
    content.innerHTML = '<div class="md-file-notice">⚠️ 로컬 파일(file://)로 열었을 때는 보안 제한으로 파일을 직접 읽을 수 없습니다.<br>배포 버전에서 확인해 주세요: <a href="https://atg-asset.vercel.app" target="_blank" rel="noopener">🔗 atg-asset.vercel.app</a></div>';
    viewer.style.display = '';
    return;
  }

  content.innerHTML = '<div class="md-loading">로딩 중…</div>';
  viewer.style.display = '';

  fetch('QnA_1차질의_정리.md')
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function(text) {
      _mdQna1Cache = text;
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

// 요구사항 그리드 CSV 다운로드 (현재 필터 상태 반영)
function downloadReqCsv() {
  var tbody = document.getElementById('req-tbody');
  if (!tbody) return;
  var cols = ['ID','기능명','우선순위','분류','오픈','출처','주요사용자','As-Is대응','담당','기본요건','확장·예측요건','TBD'];
  var lines = [cols.join(',')];
  tbody.querySelectorAll('tr.req-data-row:not(.req-hidden)').forEach(function(tr) {
    var rid = tr.dataset.rid;
    // REQ_DATA에서 해당 항목 찾기
    var r = null;
    for (var i = 0; i < REQ_DATA.length; i++) {
      if (REQ_DATA[i].id === rid) { r = REQ_DATA[i]; break; }
    }
    if (!r) return;
    var row = [
      r.id, r.name, r.pri, r.type, r.stage, r.srcTip || REQ_SRC_TIPS[r.id] || r.src, r.user, r.asIs, r.by,
      (r.basicReqs||[]).join('\n'),
      (r.extReqs||[]).join('\n'),
      (r.tbd||[]).join('\n')
    ];
    lines.push(row.map(function(v) {
      var s = (v || '').replace(/"/g, '""');
      return /[,\n"]/.test(s) ? '"' + s + '"' : s;
    }).join(','));
  });
  var bom = '﻿';
  var blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var today = new Date();
  var ymd = today.getFullYear() + ('0'+(today.getMonth()+1)).slice(-2) + ('0'+today.getDate()).slice(-2);
  a.href = url;
  a.download = '요구사항정의_' + ymd + '.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

// ── 요구사항 행 편집 ─────────────────────────────────────────────

function openReqEditModal(rid) {
  var r = null;
  for (var i = 0; i < REQ_DATA.length; i++) {
    if (REQ_DATA[i].id === rid) { r = REQ_DATA[i]; break; }
  }
  if (!r) return;
  document.getElementById('req-edit-id').value = r.id;
  document.getElementById('req-edit-title').textContent = '요구사항 수정 — ' + r.id;
  document.getElementById('req-edit-name').value = r.name || '';
  document.getElementById('req-edit-pri').value = r.pri || 'Should';
  document.getElementById('req-edit-type').value = r.type || '신규';
  document.getElementById('req-edit-stage').value = r.stage || '1차';
  document.getElementById('req-edit-src').value = r.src || '';
  document.getElementById('req-edit-user').value = r.user || '';
  document.getElementById('req-edit-asis').value = r.asIs || '';
  document.getElementById('req-edit-by').value = r.by || '';
  document.getElementById('req-edit-modal').style.display = 'flex';
  document.getElementById('req-edit-name').focus();
}

function closeReqEditModal() {
  document.getElementById('req-edit-modal').style.display = 'none';
}

function saveReqEdit() {
  var rid = document.getElementById('req-edit-id').value;
  var name = document.getElementById('req-edit-name').value.trim();
  if (!name) {
    document.getElementById('req-edit-name').focus();
    return;
  }
  for (var i = 0; i < REQ_DATA.length; i++) {
    if (REQ_DATA[i].id === rid) {
      REQ_DATA[i].name  = name;
      REQ_DATA[i].pri   = document.getElementById('req-edit-pri').value;
      REQ_DATA[i].type  = document.getElementById('req-edit-type').value;
      REQ_DATA[i].stage = document.getElementById('req-edit-stage').value;
      REQ_DATA[i].src   = document.getElementById('req-edit-src').value.trim();
      REQ_DATA[i].user  = document.getElementById('req-edit-user').value.trim();
      REQ_DATA[i].asIs  = document.getElementById('req-edit-asis').value.trim();
      REQ_DATA[i].by    = document.getElementById('req-edit-by').value.trim();
      break;
    }
  }
  closeReqEditModal();
  _refreshReqTable();
}

function _refreshReqTable() {
  var tbody = document.getElementById('req-tbody');
  if (!tbody) return;
  var rows = '';
  REQ_DATA.forEach(function(r) {
    var priBadge = r.pri === 'Must' ? '<span class="badge-must">Must</span>'
      : r.pri === 'Should' ? '<span class="badge-should">Should</span>'
      : '<span class="badge-could">Could</span>';
    var typeBadge = r.type === '신규' ? '<span class="badge-new">신규</span>' : '<span class="badge-imp">개선</span>';
    var stgBadge  = r.stage === '1차' ? '<span class="badge-s1">1차</span>' : '<span class="badge-s2">2차</span>';
    var starHtml  = r.star ? '<span class="req-star" title="고객 미명시 확장·예측 제안">★</span>' : '';
    var isPre = r.src && r.src.indexOf('선제 제안') !== -1;
    var tip = r.srcTip || (typeof REQ_SRC_TIPS !== 'undefined' && REQ_SRC_TIPS[r.id]) || '';
    var srcDisplay = r.src.replace(/§/g, '');
    var srcCell = tip
      ? '<td class="req-src-cell req-src-tip" data-tip="' + tip + '">' + srcDisplay + (isPre ? ' <span class="req-tip-icon">?</span>' : '') + '</td>'
      : '<td class="req-src-cell">' + srcDisplay + '</td>';
    rows += '<tr class="req-data-row' + (isPre ? ' req-row-pre' : '') + '" data-rid="' + r.id + '" data-cat="' + r.cat + '" data-pri="' + r.pri + '" data-stage="' + r.stage + '">' +
      '<td><span class="req-id-cell">' + r.id + '</span><button class="req-edit-btn" onclick="openReqEditModal(\'' + r.id + '\')" title="수정">✏</button></td>' +
      '<td><span class="req-name-cell" title="클릭하면 상세 정의서로 이동">' + r.name + starHtml + '</span></td>' +
      '<td>' + priBadge + '</td>' +
      '<td>' + typeBadge + '</td>' +
      '<td>' + stgBadge + '</td>' +
      srcCell +
      '<td class="req-user-cell">' + r.user + '</td>' +
      '<td class="req-asis-cell">' + r.asIs + '</td>' +
      '<td class="req-by-cell">' + r.by + '</td>' +
      '</tr>';
  });
  tbody.innerHTML = rows;
  _applyReqFilter();
}
