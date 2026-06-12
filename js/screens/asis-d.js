// As-is 화면 Group D: 사용자 정의 데이터 추출, 계약 관리

// ─────────────────────────────────────────────────────────────
// 1. renderAsisPropExtract — 사용자 정의 데이터 추출
// ─────────────────────────────────────────────────────────────
window.renderAsisPropExtract = function () {
  var el = document.getElementById('view-asis-prop-extract');
  if (!el) return;
  el.innerHTML = '';

  var EXTRACT_DATA = [
    { 자산번호:'NH-BLD-001', 자산명:'서울 강남 본사 사옥',    자산분류:'건물',   모델명:'-', 제조사:'-',          취득일:'2015-03-15', 취득가액:41500000000, 누적상각액:6200000000,  장부가액:35300000000, 현재상태:'운용중',   사용부서:'경영지원팀' },
    { 자산번호:'NH-BLD-002', 자산명:'여의도 금융센터',          자산분류:'건물',   모델명:'-', 제조사:'-',          취득일:'2012-08-20', 취득가액:28000000000, 누적상각액:5600000000,  장부가액:22400000000, 현재상태:'운용중',   사용부서:'경영지원팀' },
    { 자산번호:'NH-IT-001',  자산명:'서울 IDC 서버팜',         자산분류:'IT장비', 모델명:'Dell PowerEdge R750', 제조사:'Dell',        취득일:'2022-01-15', 취득가액:18000000000, 누적상각액:5400000000,  장부가액:12600000000, 현재상태:'운용중',   사용부서:'IT본부' },
    { 자산번호:'NH-IT-002',  자산명:'업무용 노트북 일괄',      자산분류:'IT장비', 모델명:'Latitude 5540',       제조사:'Dell',        취득일:'2023-09-01', 취득가액:8500000000,  누적상각액:1700000000,  장부가액:6800000000,  현재상태:'운용중',   사용부서:'전부서' },
    { 자산번호:'NH-VHC-001', 자산명:'현대 그랜저',              자산분류:'차량',   모델명:'GN7',                제조사:'현대자동차',   취득일:'2021-03-15', 취득가액:45000000,    누적상각액:13500000,    장부가액:31500000,    현재상태:'운용중',   사용부서:'경영지원팀' },
    { 자산번호:'NH-VHC-003', 자산명:'현대 아이오닉6',           자산분류:'차량',   모델명:'IONIQ 6',            제조사:'현대자동차',   취득일:'2023-01-10', 취득가액:55000000,    누적상각액:5500000,     장부가액:49500000,    현재상태:'운용중',   사용부서:'마케팅팀' },
    { 자산번호:'NH-FUR-001', 자산명:'강남지점 인테리어',        자산분류:'사무가구',모델명:'-', 제조사:'-',         취득일:'2020-02-28', 취득가액:2800000000,  누적상각액:1400000000,  장부가액:1400000000,  현재상태:'운용중',   사용부서:'경영지원팀' },
    { 자산번호:'NH-IT-004',  자산명:'네트워크 장비',             자산분류:'IT장비', 모델명:'Catalyst 9300',      제조사:'Cisco',       취득일:'2021-11-15', 취득가액:3500000000,  누적상각액:1800000000,  장부가액:1700000000,  현재상태:'운용중',   사용부서:'IT본부' },
    { 자산번호:'NH-VHC-006', 자산명:'기아 K5 (2018)',           자산분류:'차량',   모델명:'K5',                 제조사:'기아자동차',   취득일:'2018-07-15', 취득가액:35000000,    누적상각액:24500000,    장부가액:10500000,    현재상태:'폐기예정', 사용부서:'리스크관리팀' },
    { 자산번호:'NH-IT-005',  자산명:'보안 서버 시스템',         자산분류:'IT장비', 모델명:'ProLiant DL380',     제조사:'HP',          취득일:'2024-03-10', 취득가액:2200000000,  누적상각액:200000000,   장부가액:2000000000,  현재상태:'운용중',   사용부서:'IT본부' }
  ];

  // 추출 가능한 항목 그룹 정의
  var FIELD_GROUPS = [
    {
      group: '기본정보',
      fields: [
        { key: '자산번호', checked: true },
        { key: '자산명',   checked: true },
        { key: '자산분류', checked: true },
        { key: '모델명',   checked: true },
        { key: '제조사',   checked: true }
      ]
    },
    {
      group: '취득정보',
      fields: [
        { key: '취득일',   checked: true },
        { key: '취득가액', checked: true },
        { key: '취득방법', checked: false },
        { key: '구매처',   checked: false }
      ]
    },
    {
      group: '감가상각',
      fields: [
        { key: '누적상각액', checked: true },
        { key: '장부가액',   checked: true },
        { key: '상각방법',   checked: false },
        { key: '내용연수',   checked: false }
      ]
    },
    {
      group: '현황정보',
      fields: [
        { key: '현재상태',   checked: true },
        { key: '사용부서',   checked: true },
        { key: '사용자',     checked: false },
        { key: '위치',       checked: false },
        { key: '최종점검일', checked: false }
      ]
    }
  ];

  // ── 좌측 체크박스 패널 HTML 생성 ──────────────────────────────
  var checkGroupsHtml = FIELD_GROUPS.map(function (fg) {
    var fieldsHtml = fg.fields.map(function (f) {
      var id = 'ext-chk-' + f.key;
      return '<label style="display:flex;align-items:center;gap:7px;padding:5px 0;cursor:pointer;font-size:13px;color:#3a3a3a">'
        + '<input type="checkbox" id="' + id + '" data-field="' + f.key + '"'
        + (f.checked ? ' checked' : '') + ' style="accent-color:var(--primary,#006ab4);width:14px;height:14px;cursor:pointer">'
        + f.key
        + '</label>';
    }).join('');
    return '<div style="margin-bottom:16px">'
      + '<div style="font-size:12px;font-weight:600;color:#888;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px">' + fg.group + '</div>'
      + fieldsHtml
      + '</div>';
  }).join('');

  // ── HTML 뼈대 ─────────────────────────────────────────────────
  var page = document.createElement('div');
  page.className = 'asis-page';
  page.innerHTML = [
    '<div class="asis-page-header">',
    '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '    <h2 class="asis-page-title">사용자 정의 데이터 추출</h2>',
    '    <span class="asis-badge">To-Be</span>',
    '  </div>',
    '</div>',

    // 안내 박스
    '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px">',
    '  <span style="font-size:16px;flex-shrink:0">ℹ️</span>',
    '  <span style="font-size:13.5px;color:#1e40af;line-height:1.6">원하는 항목과 조건을 선택해서 자산 데이터를 추출하세요. 최대 50,000건까지 Excel로 내보낼 수 있습니다.</span>',
    '</div>',

    // 2열 레이아웃: 1/3 | 2/3
    '<div style="display:grid;grid-template-columns:1fr 2fr;gap:20px;align-items:start">',

    // ── 좌측: 추출 항목 선택 ──
    '  <div class="asis-panel">',
    '    <div class="asis-panel-head" style="display:flex;align-items:center;justify-content:space-between">',
    '      <span class="asis-panel-title">추출 항목 선택</span>',
    '      <div style="display:flex;gap:6px">',
    '        <button class="asis-btn" id="ext-check-all" style="font-size:11.5px;padding:4px 10px">전체 선택</button>',
    '        <button class="asis-btn" id="ext-uncheck-all" style="font-size:11.5px;padding:4px 10px">전체 해제</button>',
    '      </div>',
    '    </div>',
    '    <div class="asis-panel-body">',
         checkGroupsHtml,
    '    </div>',
    '  </div>',

    // ── 우측 ──
    '  <div style="display:flex;flex-direction:column;gap:20px">',

    // 조건 설정 패널
    '    <div class="asis-panel">',
    '      <div class="asis-panel-head"><span class="asis-panel-title">추출 조건 설정</span></div>',
    '      <div class="asis-panel-body">',
    '        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;margin-bottom:16px">',
    '          <div>',
    '            <label style="display:block;font-size:12.5px;color:#666;margin-bottom:5px">자산분류</label>',
    '            <select class="asis-select" id="ext-filter-cat" style="width:100%">',
    '              <option value="">전체</option>',
    '              <option>건물</option><option>IT장비</option><option>차량</option>',
    '              <option>사무가구</option><option>기타</option>',
    '            </select>',
    '          </div>',
    '          <div>',
    '            <label style="display:block;font-size:12.5px;color:#666;margin-bottom:5px">자산상태</label>',
    '            <select class="asis-select" id="ext-filter-status" style="width:100%">',
    '              <option value="">전체</option>',
    '              <option>운용중</option><option>유휴</option><option>수리중</option><option>폐기예정</option>',
    '            </select>',
    '          </div>',
    '          <div>',
    '            <label style="display:block;font-size:12.5px;color:#666;margin-bottom:5px">취득기간</label>',
    '            <div style="display:flex;align-items:center;gap:6px">',
    '              <input type="date" class="asis-input" id="ext-filter-from" value="2012-01-01" style="flex:1;font-size:12px">',
    '              <span style="color:#999;font-size:12px">~</span>',
    '              <input type="date" class="asis-input" id="ext-filter-to" value="2026-12-31" style="flex:1;font-size:12px">',
    '            </div>',
    '          </div>',
    '          <div>',
    '            <label style="display:block;font-size:12.5px;color:#666;margin-bottom:5px">취득가액 이상</label>',
    '            <div style="display:flex;align-items:center;gap:6px">',
    '              <input type="number" class="asis-input" id="ext-filter-price" placeholder="0" style="flex:1;font-size:12px">',
    '              <span style="color:#999;font-size:13px">원</span>',
    '            </div>',
    '          </div>',
    '        </div>',
    '        <div style="display:flex;gap:8px">',
    '          <button class="asis-btn primary" id="ext-preview-btn">추출 미리보기</button>',
    '          <button class="asis-btn" id="ext-export-btn">📥 Excel 내보내기</button>',
    '        </div>',
    '      </div>',
    '    </div>',

    // 미리보기 결과 패널
    '    <div class="asis-panel">',
    '      <div class="asis-panel-head" style="display:flex;align-items:center;justify-content:space-between">',
    '        <span class="asis-panel-title">미리보기 결과</span>',
    '        <span id="ext-result-count" style="font-size:12.5px;color:#888">조건을 설정하고 [추출 미리보기]를 클릭하세요</span>',
    '      </div>',
    '      <div class="asis-panel-body" style="padding:0">',
    '        <div class="asis-table-wrap" id="ext-preview-wrap">',
    '          <table class="asis-table" id="ext-preview-table"><thead></thead><tbody></tbody></table>',
    '        </div>',
    '      </div>',
    '    </div>',

    '  </div>',
    '</div>'
  ].join('');

  el.appendChild(page);

  // ── 미리보기 렌더 함수 ────────────────────────────────────────
  function getCheckedFields() {
    var checked = [];
    el.querySelectorAll('input[data-field]:checked').forEach(function (cb) {
      checked.push(cb.getAttribute('data-field'));
    });
    return checked;
  }

  function formatVal(key, val) {
    if (val === undefined || val === null) return '-';
    // 금액 항목: 숫자 → 원 표기
    if (key === '취득가액' || key === '누적상각액' || key === '장부가액') {
      return Number(val).toLocaleString('ko-KR') + '원';
    }
    return val;
  }

  function runPreview() {
    var fields = getCheckedFields();
    if (!fields.length) {
      document.getElementById('ext-result-count').textContent = '항목을 1개 이상 선택하세요';
      document.querySelector('#ext-preview-table thead').innerHTML = '';
      document.querySelector('#ext-preview-table tbody').innerHTML = '';
      return;
    }

    var filterCat    = (document.getElementById('ext-filter-cat').value    || '').trim();
    var filterStatus = (document.getElementById('ext-filter-status').value || '').trim();
    var filterFrom   = document.getElementById('ext-filter-from').value;
    var filterTo     = document.getElementById('ext-filter-to').value;
    var filterPrice  = parseFloat(document.getElementById('ext-filter-price').value) || 0;

    var filtered = EXTRACT_DATA.filter(function (row) {
      if (filterCat    && row['자산분류'] !== filterCat)    return false;
      if (filterStatus && row['현재상태'] !== filterStatus) return false;
      if (filterFrom   && row['취득일'] < filterFrom)       return false;
      if (filterTo     && row['취득일'] > filterTo)         return false;
      if (filterPrice  && row['취득가액'] < filterPrice)    return false;
      return true;
    });

    // 헤더
    var thead = document.querySelector('#ext-preview-table thead');
    var tbody = document.querySelector('#ext-preview-table tbody');
    thead.innerHTML = '<tr>' + fields.map(function (f) { return '<th>' + f + '</th>'; }).join('') + '</tr>';

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="' + fields.length + '" style="text-align:center;color:#aaa;padding:24px">조건에 맞는 데이터가 없습니다</td></tr>';
      document.getElementById('ext-result-count').textContent = '0건 추출 예정';
      return;
    }

    tbody.innerHTML = filtered.map(function (row) {
      return '<tr>' + fields.map(function (f) {
        // 금액은 오른쪽 정렬
        var isNum = (f === '취득가액' || f === '누적상각액' || f === '장부가액');
        return '<td' + (isNum ? ' class="num"' : '') + '>' + formatVal(f, row[f]) + '</td>';
      }).join('') + '</tr>';
    }).join('');

    document.getElementById('ext-result-count').textContent = filtered.length + '건 추출 예정';
  }

  // 초기 미리보기 실행
  runPreview();

  // ── 이벤트 연결 ───────────────────────────────────────────────
  document.getElementById('ext-preview-btn').addEventListener('click', runPreview);

  document.getElementById('ext-export-btn').addEventListener('click', function () {
    var countEl = document.getElementById('ext-result-count');
    var orig = countEl.textContent;
    countEl.textContent = 'Excel 파일을 생성 중입니다…';
    setTimeout(function () {
      countEl.textContent = orig;
      alert('Excel 내보내기 기능은 운영 시스템에서 제공됩니다.\n(현재 시연용 프로토타입)');
    }, 800);
  });

  document.getElementById('ext-check-all').addEventListener('click', function () {
    el.querySelectorAll('input[data-field]').forEach(function (cb) { cb.checked = true; });
    runPreview();
  });

  document.getElementById('ext-uncheck-all').addEventListener('click', function () {
    el.querySelectorAll('input[data-field]').forEach(function (cb) { cb.checked = false; });
    runPreview();
  });

  // 체크박스 변경 → 미리보기 자동 갱신
  el.querySelectorAll('input[data-field]').forEach(function (cb) {
    cb.addEventListener('change', runPreview);
  });
};


// ─────────────────────────────────────────────────────────────
// 2. renderAsisPropContract — 계약 관리
// ─────────────────────────────────────────────────────────────
window.renderAsisPropContract = function () {
  var el = document.getElementById('view-asis-prop-contract');
  if (!el) return;
  el.innerHTML = '';

  var CONTRACTS = [
    { no:'CT-2026-001', name:'서울 강남 본사 시설관리 용역',  type:'용역계약',   partner:'(주)NH시설관리',        start:'2024-01-01', end:'2026-12-31', amount:420000000,  auto:'있음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-002', name:'여의도 본사 엘리베이터 유지보수', type:'유지보수',  partner:'현대엘리베이터(주)',    start:'2025-01-01', end:'2027-12-31', amount:36000000,   auto:'있음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-003', name:'수원 영통 사무소 임차',          type:'임차계약',   partner:'(주)영통빌딩',          start:'2021-01-01', end:'2026-12-31', amount:340800000,  auto:'없음', statusKey:'갱신예정', statusClass:'warn'  },
    { no:'CT-2026-004', name:'IT 보안 솔루션 라이선스',        type:'라이선스',   partner:'(주)안랩',              start:'2024-07-01', end:'2026-06-30', amount:85000000,   auto:'있음', statusKey:'만료임박', statusClass:'danger', dday:'D-18' },
    { no:'CT-2026-005', name:'전사 노트북 유지보수',            type:'유지보수',   partner:'Dell Technologies',     start:'2023-01-01', end:'2026-12-31', amount:120000000,  auto:'있음', statusKey:'갱신예정', statusClass:'warn'  },
    { no:'CT-2026-006', name:'강남 본사 경비용역',              type:'용역계약',   partner:'(주)에스원',            start:'2024-01-01', end:'2027-12-31', amount:180000000,  auto:'있음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-007', name:'인천 창고 임차',                  type:'임차계약',   partner:'(주)남동물류',          start:'2023-01-01', end:'2027-12-31', amount:201600000,  auto:'없음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-008', name:'전사 복합기 임대',                type:'임대차계약', partner:'(주)신도리코',          start:'2022-06-01', end:'2025-05-31', amount:48000000,   auto:'있음', statusKey:'종료',    statusClass:'done'   },
    { no:'CT-2026-009', name:'여의도 지하주차장 관리',          type:'용역계약',   partner:'(주)파크원주차',        start:'2025-01-01', end:'2027-12-31', amount:96000000,   auto:'있음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-010', name:'성남 판교 IT센터 임차',           type:'임차계약',   partner:'(주)판교테크노밸리',    start:'2022-03-01', end:'2027-02-28', amount:561600000,  auto:'없음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-011', name:'법인차량 보험 (전체)',            type:'보험계약',   partner:'현대해상(주)',          start:'2026-01-01', end:'2026-12-31', amount:28500000,   auto:'있음', statusKey:'갱신예정', statusClass:'warn'  },
    { no:'CT-2026-012', name:'IDC 전력 공급 계약',              type:'전력계약',   partner:'한국전력(주)',          start:'2020-01-01', end:'2027-12-31', amount:240000000,  auto:'없음', statusKey:'유효',    statusClass:'ok'     },
    { no:'CT-2026-013', name:'강남 별관 임차',                  type:'임차계약',   partner:'NH강남빌딩(주)',        start:'2020-06-01', end:'2026-05-31', amount:666000000,  auto:'없음', statusKey:'만료임박', statusClass:'danger', dday:'D-10' },
    { no:'CT-2026-014', name:'부산 서면 건물 화재보험',         type:'보험계약',   partner:'삼성화재(주)',          start:'2025-07-01', end:'2026-06-30', amount:12000000,   auto:'있음', statusKey:'갱신예정', statusClass:'warn'  },
    { no:'CT-2026-015', name:'전산장비 종합보험',               type:'보험계약',   partner:'DB손해보험(주)',        start:'2025-01-01', end:'2025-12-31', amount:45000000,   auto:'있음', statusKey:'종료',    statusClass:'done'   }
  ];

  var STEPS = [
    { label: '계약 검토', active: false, done: true  },
    { label: '내부 결재', active: false, done: true  },
    { label: '계약 체결', active: true,  done: false },
    { label: '이행 관리', active: false, done: false },
    { label: '갱신/종료', active: false, done: false }
  ];

  // ── 스텝 HTML ─────────────────────────────────────────────────
  var stepsHtml = STEPS.map(function (s) {
    var cls = s.done ? 'done' : (s.active ? 'active' : '');
    return '<div class="asis-step ' + cls + '">'
      + '<div class="asis-step-dot">' + (s.done ? '✓' : '') + '</div>'
      + '<div class="asis-step-label">' + s.label + '</div>'
      + '</div>';
  }).join('');

  // ── 테이블 행 HTML ─────────────────────────────────────────────
  var rowsHtml = CONTRACTS.map(function (c) {
    var ddayBadge = c.dday
      ? ' <span style="display:inline-block;background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:5px;vertical-align:middle">' + c.dday + '</span>'
      : '';
    return '<tr data-status="' + c.statusKey + '">'
      + '<td style="font-family:monospace;font-size:12px">' + c.no + '</td>'
      + '<td>' + c.name + ddayBadge + '</td>'
      + '<td class="center"><span style="font-size:12px;color:#555">' + c.type + '</span></td>'
      + '<td>' + c.partner + '</td>'
      + '<td class="center">' + c.start + '</td>'
      + '<td class="center">' + c.end + '</td>'
      + '<td class="num">' + c.amount.toLocaleString('ko-KR') + '원</td>'
      + '<td class="center">' + c.auto + '</td>'
      + '<td class="center"><span class="asis-status ' + c.statusClass + '">' + c.statusKey + '</span></td>'
      + '</tr>';
  }).join('');

  // ── HTML 뼈대 ─────────────────────────────────────────────────
  var page = document.createElement('div');
  page.className = 'asis-page';
  page.innerHTML = [
    '<div class="asis-page-header">',
    '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">',
    '    <h2 class="asis-page-title">계약 관리</h2>',
    '    <span class="asis-badge">To-Be</span>',
    '  </div>',
    '  <div class="asis-toolbar">',
    '    <button class="asis-btn primary">＋ 신규계약 등록</button>',
    '    <button class="asis-btn">📥 Excel</button>',
    '  </div>',
    '</div>',

    // KPI 4칸
    '<div class="asis-kpi-row" style="margin-bottom:20px">',
    '  <div class="asis-kpi-card accent-blue">',
    '    <div class="asis-kpi-label">유효계약</div>',
    '    <div class="asis-kpi-value">24건</div>',
    '    <div class="asis-kpi-sub">현재 유효한 계약</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-orange">',
    '    <div class="asis-kpi-label">갱신예정</div>',
    '    <div class="asis-kpi-value">6건</div>',
    '    <div class="asis-kpi-sub">90일 이내 갱신 필요</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-purple" style="border-top-color:#dc2626">',
    '    <div class="asis-kpi-label">만료예정</div>',
    '    <div class="asis-kpi-value" style="color:#dc2626">3건</div>',
    '    <div class="asis-kpi-sub">30일 이내 만료</div>',
    '  </div>',
    '  <div class="asis-kpi-card accent-green">',
    '    <div class="asis-kpi-label">이번달 계약금액</div>',
    '    <div class="asis-kpi-value">12.5억원</div>',
    '    <div class="asis-kpi-sub">2026년 6월 기준</div>',
    '  </div>',
    '</div>',

    // 프로세스 스텝
    '<div class="asis-panel" style="margin-bottom:20px">',
    '  <div class="asis-panel-head"><span class="asis-panel-title">계약 라이프사이클</span></div>',
    '  <div class="asis-panel-body">',
    '    <div class="asis-steps">' + stepsHtml + '</div>',
    '  </div>',
    '</div>',

    // 탭 + 테이블
    '<div class="asis-panel">',
    '  <div class="asis-panel-head" style="border-bottom:none;padding-bottom:0">',
    '    <div class="asis-tabs" id="contract-tabs">',
    '      <button class="asis-tab active" data-filter="">전체</button>',
    '      <button class="asis-tab" data-filter="유효">유효계약</button>',
    '      <button class="asis-tab" data-filter="갱신예정">갱신예정</button>',
    '      <button class="asis-tab" data-filter="만료임박|종료">만료예정·종료</button>',
    '    </div>',
    '  </div>',
    '  <div class="asis-panel-body" style="padding:0">',
    '    <div class="asis-table-wrap">',
    '      <table class="asis-table" id="contract-table">',
    '        <thead><tr>',
    '          <th>계약번호</th><th>계약명</th><th>계약유형</th><th>계약상대방</th>',
    '          <th>계약시작일</th><th>계약종료일</th><th>계약금액</th><th>자동갱신</th><th>상태</th>',
    '        </tr></thead>',
    '        <tbody id="contract-tbody">' + rowsHtml + '</tbody>',
    '      </table>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');

  el.appendChild(page);

  // ── 탭 필터 동작 ─────────────────────────────────────────────
  var tabsEl = document.getElementById('contract-tabs');
  if (tabsEl) {
    tabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.asis-tab');
      if (!btn) return;

      tabsEl.querySelectorAll('.asis-tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');
      var patterns = filter ? filter.split('|') : [];

      document.querySelectorAll('#contract-tbody tr').forEach(function (row) {
        if (!patterns.length) {
          row.style.display = '';
          return;
        }
        var status = row.getAttribute('data-status') || '';
        var match = patterns.some(function (p) { return status === p; });
        row.style.display = match ? '' : 'none';
      });
    });
  }

  // ── 신규계약 등록 버튼 (시연 안내) ───────────────────────────
  var newBtn = el.querySelector('.asis-btn.primary');
  if (newBtn) {
    newBtn.addEventListener('click', function () {
      alert('신규계약 등록 화면은 운영 시스템에서 제공됩니다.\n(현재 시연용 프로토타입)');
    });
  }
};
