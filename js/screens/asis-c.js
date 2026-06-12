// As-is 화면 Group C: 건물 생애주기, 건물 운영 관리, 임대정보 관리

// ──────────────────────────────────────────────────────────────────────────────
// 1. renderAsisPropLifecycle — 건물 자산 생애주기
// ──────────────────────────────────────────────────────────────────────────────
window.renderAsisPropLifecycle = function () {
  var el = document.getElementById('view-asis-prop-lifecycle');
  if (!el) return;
  el.innerHTML = '';

  /* ── 데이터 ── */
  var groups = [
    {
      id: '취득단계',
      label: '취득단계',
      color: '#e8f4fd',
      borderColor: '#3b9ede',
      rows: [
        { no: 'NH-BLD-021', name: '인천 검단 데이터센터', loc: '인천광역시 서구', area: '15,230', date: '2025-11-01', price: '380억원', dep: '3억원', book: '377억원', remain: '39년 11개월', status: 'progress', statusLabel: '취득중' },
        { no: 'NH-BLD-022', name: '세종 행정지원센터', loc: '세종특별자치시', area: '4,800', date: '2026-02-15', price: '120억원', dep: '0.5억원', book: '119.5억원', remain: '39년 9개월', status: 'progress', statusLabel: '취득중' },
      ]
    },
    {
      id: '운용단계',
      label: '운용단계',
      color: '#f0faf4',
      borderColor: '#28a745',
      rows: [
        { no: 'NH-BLD-001', name: '서울 강남 본사 사옥', loc: '서울 강남구', area: '28,560', date: '2015-03-15', price: '415억원', dep: '62억원', book: '353억원', remain: '29년', status: 'ok', statusLabel: '운용중' },
        { no: 'NH-BLD-002', name: '여의도 금융센터', loc: '서울 영등포구', area: '22,140', date: '2012-08-20', price: '280억원', dep: '56억원', book: '224억원', remain: '26년', status: 'ok', statusLabel: '운용중' },
        { no: 'NH-BLD-003', name: '부산 서면 지점', loc: '부산광역시 부산진구', area: '8,420', date: '2018-05-10', price: '95억원', dep: '19억원', book: '76억원', remain: '32년', status: 'ok', statusLabel: '운용중' },
        { no: 'NH-BLD-004', name: '대구 동성로 빌딩', loc: '대구광역시 중구', area: '6,380', date: '2016-11-25', price: '72억원', dep: '18억원', book: '54억원', remain: '30년', status: 'ok', statusLabel: '운용중' },
        { no: 'NH-BLD-005', name: '인천 부평 지점', loc: '인천광역시 부평구', area: '5,140', date: '2019-07-30', price: '65억원', dep: '10억원', book: '55억원', remain: '33년', status: 'ok', statusLabel: '운용중' },
        { no: 'NH-BLD-006', name: '광주 상무 빌딩', loc: '광주광역시 서구', area: '7,230', date: '2020-04-15', price: '88억원', dep: '9억원', book: '79억원', remain: '34년', status: 'ok', statusLabel: '운용중' },
        { no: 'NH-BLD-007', name: '대전 둔산 지점', loc: '대전광역시 서구', area: '4,920', date: '2017-09-10', price: '58억원', dep: '15억원', book: '43억원', remain: '31년', status: 'ok', statusLabel: '운용중' },
      ]
    },
    {
      id: '임차만료예정',
      label: '임차만료예정',
      color: '#fffbf0',
      borderColor: '#f0a500',
      rows: [
        { no: 'NH-BLD-011', name: '수원 영통 임차사무소', loc: '경기 수원시 영통구', area: '2,840', date: '2021-01-01', price: '임차', dep: '-', book: '-', remain: '임차만료 2026-12-31', status: 'warn', statusLabel: '만료예정' },
        { no: 'NH-BLD-012', name: '성남 판교 IT센터', loc: '경기 성남시 분당구', area: '3,120', date: '2022-03-01', price: '임차', dep: '-', book: '-', remain: '임차만료 2027-02-28', status: 'warn', statusLabel: '만료예정' },
        { no: 'NH-BLD-013', name: '강남 별관 (임차)', loc: '서울 강남구', area: '1,850', date: '2020-06-01', price: '임차', dep: '-', book: '-', remain: '임차만료 2026-05-31', status: 'danger', statusLabel: '긴급' },
      ]
    },
    {
      id: '폐기매각예정',
      label: '폐기/매각예정',
      color: '#fff5f5',
      borderColor: '#dc3545',
      rows: [
        { no: 'NH-BLD-018', name: '구 안양 지점 (구형)', loc: '경기 안양시', area: '1,240', date: '1999-05-20', price: '18억원', dep: '18억원', book: '0원', remain: '잔여 0년', status: 'danger', statusLabel: '매각예정' },
        { no: 'NH-BLD-019', name: '구 인천 지점 창고', loc: '인천광역시 남동구', area: '890', date: '2001-03-10', price: '8억원', dep: '8억원', book: '0원', remain: '잔여 0년', status: 'danger', statusLabel: '매각예정' },
      ]
    }
  ];

  /* ── 타임라인 바 진행률 계산 (취득일 기준) ── */
  function calcProgress(dateStr, totalYears) {
    if (!dateStr || !totalYears) return 0;
    var acq = new Date(dateStr);
    var now = new Date(2026, 5, 12);
    var elapsed = (now - acq) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.min(100, Math.round((elapsed / totalYears) * 100));
  }

  var progressMap = {
    'NH-BLD-001': calcProgress('2015-03-15', 40),
    'NH-BLD-002': calcProgress('2012-08-20', 40),
    'NH-BLD-003': calcProgress('2018-05-10', 40),
    'NH-BLD-004': calcProgress('2016-11-25', 40),
    'NH-BLD-005': calcProgress('2019-07-30', 40),
    'NH-BLD-006': calcProgress('2020-04-15', 40),
    'NH-BLD-007': calcProgress('2017-09-10', 40),
    'NH-BLD-021': calcProgress('2025-11-01', 40),
    'NH-BLD-022': calcProgress('2026-02-15', 40),
    'NH-BLD-018': 100,
    'NH-BLD-019': 100,
    'NH-BLD-011': 0,
    'NH-BLD-012': 0,
    'NH-BLD-013': 0,
  };

  /* ── HTML 조립 ── */
  var tableRows = '';
  groups.forEach(function (g) {
    tableRows += '<tr class="asis-group-row" style="background:' + g.color + ';border-left:4px solid ' + g.borderColor + ';cursor:pointer" onclick="(function(){var rows=document.querySelectorAll(\'[data-group=\\\'' + g.id + '\\\']\');rows.forEach(function(r){r.hidden=!r.hidden;});})()">' +
      '<td colspan="11" style="padding:8px 14px;font-weight:600;font-size:13px;color:#333">' +
        '<span style="margin-right:8px">▾</span>' + g.label +
        ' <span style="background:' + g.borderColor + ';color:#fff;border-radius:10px;padding:1px 9px;font-size:11px;margin-left:6px">' + g.rows.length + '건</span>' +
      '</td>' +
    '</tr>';

    g.rows.forEach(function (r) {
      var pct = progressMap[r.no] || 0;
      var barColor = r.status === 'ok' ? '#28a745' : r.status === 'warn' ? '#f0a500' : r.status === 'danger' ? '#dc3545' : '#3b9ede';
      tableRows += '<tr data-group="' + g.id + '">' +
        '<td>' + r.no + '</td>' +
        '<td style="font-weight:500">' + r.name + '</td>' +
        '<td>' + r.loc + '</td>' +
        '<td style="text-align:right">' + r.area + '</td>' +
        '<td>' + r.date + '</td>' +
        '<td style="text-align:right">' + r.price + '</td>' +
        '<td style="text-align:right">' + r.dep + '</td>' +
        '<td style="text-align:right">' + r.book + '</td>' +
        '<td>' + r.remain + '</td>' +
        '<td><span class="asis-status ' + r.status + '">' + r.statusLabel + '</span></td>' +
        '<td style="min-width:100px">' +
          (pct > 0 ? '<div style="background:#e9ecef;border-radius:4px;height:10px;width:100%;overflow:hidden"><div style="height:10px;border-radius:4px;width:' + pct + '%;background:' + barColor + '"></div></div><div style="font-size:10px;color:#888;text-align:right;margin-top:2px">' + pct + '%</div>' : '') +
        '</td>' +
      '</tr>';
    });
  });

  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<span class="asis-page-title">건물 자산 생애주기 관리</span>' +
        '<span class="asis-badge" style="background:#e8f3ff;color:#1a73e8;border:1px solid #bcd4f0">To-Be</span>' +
        '<div class="asis-toolbar" style="margin-left:auto">' +
          '<select class="asis-select"><option>전체 사업소</option><option>서울</option><option>부산</option><option>대구</option><option>인천</option><option>광주</option><option>대전</option></select>' +
          '<button class="asis-btn primary" style="margin-left:8px">조회</button>' +
        '</div>' +
      '</div>' +

      '<div class="asis-kpi-row">' +
        '<div class="asis-kpi-card accent-blue"><div class="asis-kpi-label">총 건물</div><div class="asis-kpi-value">23<span style="font-size:14px;font-weight:400">개소</span></div><div class="asis-kpi-sub">소유·임차 포함</div></div>' +
        '<div class="asis-kpi-card accent-green"><div class="asis-kpi-label">운용중</div><div class="asis-kpi-value">21<span style="font-size:14px;font-weight:400">개소</span></div><div class="asis-kpi-sub">정상 운영 중</div></div>' +
        '<div class="asis-kpi-card accent-orange"><div class="asis-kpi-label">임차중</div><div class="asis-kpi-value">8<span style="font-size:14px;font-weight:400">개소</span></div><div class="asis-kpi-sub">임차 자산</div></div>' +
        '<div class="asis-kpi-card accent-purple"><div class="asis-kpi-label">내용연수 50% 초과</div><div class="asis-kpi-value">5<span style="font-size:14px;font-weight:400">개소</span></div><div class="asis-kpi-sub">노후화 주의</div></div>' +
      '</div>' +

      '<div class="asis-panel">' +
        '<div class="asis-panel-head"><span class="asis-panel-title">생애주기 단계별 현황</span><span style="font-size:12px;color:#888;margin-left:8px">헤더 클릭 시 접기/펼치기</span></div>' +
        '<div class="asis-panel-body" style="padding:0">' +
          '<div class="asis-table-wrap">' +
            '<table class="asis-table" style="width:100%">' +
              '<colgroup><col style="width:130px"><col><col style="width:160px"><col style="width:80px"><col style="width:100px"><col style="width:90px"><col style="width:80px"><col style="width:90px"><col style="width:160px"><col style="width:90px"><col style="width:110px"></colgroup>' +
              '<thead><tr>' +
                '<th>자산번호</th><th>자산명</th><th>소재지</th><th>연면적(㎡)</th><th>취득일</th><th>취득가액</th><th>누적상각</th><th>장부가액</th><th>잔여/만료</th><th>상태</th><th>내용연수 진행</th>' +
              '</tr></thead>' +
              '<tbody>' + tableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
};

// ──────────────────────────────────────────────────────────────────────────────
// 2. renderAsisPropOperation — 건물 운영 통합 관리
// ──────────────────────────────────────────────────────────────────────────────
window.renderAsisPropOperation = function () {
  var el = document.getElementById('view-asis-prop-operation');
  if (!el) return;
  el.innerHTML = '';

  /* ── 점검 이력 데이터 ── */
  var inspections = [
    { date: '2026-05-15', item: '소화기 정기점검',     cat: '법정점검', cost: '450,000원',   vendor: 'NH소방안전',    status: 'ok', statusLabel: '완료' },
    { date: '2026-04-20', item: '엘리베이터 월정검',   cat: '정기점검', cost: '280,000원',   vendor: '현대엘리베이터', status: 'ok', statusLabel: '완료' },
    { date: '2026-04-10', item: '에어컨 필터 교체',    cat: '예방정비', cost: '1,200,000원', vendor: '삼성전자서비스', status: 'ok', statusLabel: '완료' },
    { date: '2026-03-18', item: '지하주차장 형광등 교체', cat: '수리',  cost: '880,000원',   vendor: 'NH시설관리',    status: 'ok', statusLabel: '완료' },
    { date: '2026-03-05', item: '외벽 균열 보수',      cat: '수리',    cost: '3,500,000원', vendor: '현대건설',      status: 'ok', statusLabel: '완료' },
    { date: '2026-02-14', item: '보일러 정기점검',     cat: '법정점검', cost: '320,000원',   vendor: '귀뚜라미',      status: 'ok', statusLabel: '완료' },
    { date: '2025-11-20', item: '건물 외관 청소',      cat: '연간점검', cost: '5,800,000원', vendor: '청소전문업체',  status: 'ok', statusLabel: '완료' },
  ];

  /* ── 연도별 비용 집계 ── */
  var yearCosts = [
    { year: '2026', legal: '770,000', repair: '4,380,000', maintain: '46,200,000', total: '51,350,000' },
    { year: '2025', legal: '1,240,000', repair: '12,000,000', maintain: '46,200,000', total: '59,440,000' },
    { year: '2024', legal: '1,100,000', repair: '8,500,000', maintain: '46,200,000', total: '55,800,000' },
    { year: '2023', legal: '950,000', repair: '132,000,000', maintain: '46,200,000', total: '179,150,000' },
    { year: '2022', legal: '880,000', repair: '6,200,000', maintain: '46,200,000', total: '53,280,000' },
  ];

  var inspectionRows = inspections.map(function (r) {
    return '<tr><td>' + r.date + '</td><td style="font-weight:500">' + r.item + '</td><td>' + r.cat + '</td><td style="text-align:right">' + r.cost + '</td><td>' + r.vendor + '</td><td><span class="asis-status ' + r.status + '">' + r.statusLabel + '</span></td></tr>';
  }).join('');

  var yearRows = yearCosts.map(function (r) {
    return '<tr><td>' + r.year + '</td><td style="text-align:right">' + r.legal + '</td><td style="text-align:right">' + r.repair + '</td><td style="text-align:right">' + r.maintain + '</td><td style="text-align:right;font-weight:600">' + r.total + '</td></tr>';
  }).join('');

  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<span class="asis-page-title">건물 운영 통합 관리</span>' +
        '<span class="asis-badge" style="background:#e8f3ff;color:#1a73e8;border:1px solid #bcd4f0">To-Be</span>' +
      '</div>' +

      '<div class="asis-panel">' +
        '<div class="asis-panel-head">' +
          '<div class="asis-tabs" id="op-tabs">' +
            '<div class="asis-tab active" data-tab="status">운영 현황</div>' +
            '<div class="asis-tab" data-tab="cost">비용 이력</div>' +
          '</div>' +
        '</div>' +
        '<div class="asis-panel-body">' +

          /* ── 운영 현황 탭 ── */
          '<div class="asis-tab-panel" data-panel="status">' +
            '<div class="asis-filter-bar" style="margin-bottom:16px">' +
              '<label style="font-size:13px;font-weight:500;margin-right:8px">건물 선택</label>' +
              '<select class="asis-select" style="min-width:220px">' +
                '<option value="BLD001">NH-BLD-001 서울 강남 본사 사옥</option>' +
                '<option value="BLD002">NH-BLD-002 여의도 금융센터</option>' +
                '<option value="BLD003">NH-BLD-003 부산 서면 지점</option>' +
                '<option value="BLD004">NH-BLD-004 대구 동성로 빌딩</option>' +
              '</select>' +
            '</div>' +

            '<div class="asis-grid-2" style="margin-bottom:20px">' +
              /* 좌: 자산정보 */
              '<div class="asis-panel" style="margin:0">' +
                '<div class="asis-panel-head"><span class="asis-panel-title">자산 정보</span></div>' +
                '<div class="asis-panel-body">' +
                  '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
                    '<colgroup><col style="width:130px"><col></colgroup>' +
                    '<tbody>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">자산번호</td><td style="padding:7px 0;font-weight:500">NH-BLD-001</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">자산명</td><td style="padding:7px 0;font-weight:600">서울 강남 본사 사옥</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">소재지</td><td style="padding:7px 0">서울특별시 강남구 테헤란로 152 (역삼동)</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">연면적</td><td style="padding:7px 0">28,560㎡ / 지하3층·지상22층</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">자산상태</td><td style="padding:7px 0"><span class="asis-status ok">운용중</span></td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">취득일</td><td style="padding:7px 0">2015-03-15</td></tr>' +
                      '<tr><td style="padding:7px 0;color:#888">취득가액</td><td style="padding:7px 0;font-weight:500">415억원</td></tr>' +
                    '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +

              /* 우: 계약정보 */
              '<div class="asis-panel" style="margin:0">' +
                '<div class="asis-panel-head"><span class="asis-panel-title">운영 비용 정보</span></div>' +
                '<div class="asis-panel-body">' +
                  '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
                    '<colgroup><col style="width:130px"><col></colgroup>' +
                    '<tbody>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">준공연도</td><td style="padding:7px 0">2014년</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">내용연수</td><td style="padding:7px 0">40년 <span style="color:#888">(잔여 29년)</span></td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">보험료(연)</td><td style="padding:7px 0">42,000,000원</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">재산세(연)</td><td style="padding:7px 0">185,000,000원</td></tr>' +
                      '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:7px 0;color:#888">관리비(월)</td><td style="padding:7px 0;font-weight:500">38,500,000원</td></tr>' +
                      '<tr><td style="padding:7px 0;color:#888">최근 대규모 수리</td><td style="padding:7px 0">2023-04 외벽 방수공사 <span style="color:#dc3545;font-weight:500">(1.2억원)</span></td></tr>' +
                    '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +

            /* 월별 관리비 차트 */
            '<div class="asis-panel" style="margin-bottom:20px">' +
              '<div class="asis-panel-head"><span class="asis-panel-title">월별 관리비 현황 (2026년, 단위: 만원)</span></div>' +
              '<div class="asis-panel-body" style="padding:16px">' +
                '<canvas id="op-cost-chart" height="90"></canvas>' +
              '</div>' +
            '</div>' +

            /* 점검·수리 이력 */
            '<div class="asis-panel" style="margin:0">' +
              '<div class="asis-panel-head"><span class="asis-panel-title">점검·수리 이력</span></div>' +
              '<div class="asis-panel-body" style="padding:0">' +
                '<div class="asis-table-wrap">' +
                  '<table class="asis-table" style="width:100%">' +
                    '<thead><tr><th>일자</th><th>항목</th><th>구분</th><th>비용</th><th>담당업체</th><th>완료여부</th></tr></thead>' +
                    '<tbody>' + inspectionRows + '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ── 비용 이력 탭 ── */
          '<div class="asis-tab-panel" data-panel="cost" hidden>' +
            '<div class="asis-panel" style="margin:0">' +
              '<div class="asis-panel-head"><span class="asis-panel-title">연도별 비용 집계 (NH-BLD-001 서울 강남 본사 사옥)</span></div>' +
              '<div class="asis-panel-body" style="padding:0">' +
                '<div class="asis-table-wrap">' +
                  '<table class="asis-table" style="width:100%">' +
                    '<thead><tr><th>연도</th><th>법정점검</th><th>수리비</th><th>관리비</th><th>합계</th></tr></thead>' +
                    '<tbody>' + yearRows + '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>' +
    '</div>';

  /* ── 탭 전환 ── */
  el.querySelector('#op-tabs').addEventListener('click', function (e) {
    var tab = e.target.closest('.asis-tab');
    if (!tab) return;
    var tabId = tab.dataset.tab;
    el.querySelectorAll('.asis-tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tabId); });
    el.querySelectorAll('.asis-tab-panel').forEach(function (p) { p.hidden = p.dataset.panel !== tabId; });
  });

  /* ── 월별 관리비 Chart.js 라인 차트 ── */
  var ctx = el.querySelector('#op-cost-chart');
  if (ctx && window.Chart) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
        datasets: [{
          label: '관리비(만원)',
          data: [3850, 3720, 3680, 3810, 4120, 4380, 4950, 4820, 4210, 3890, 3740, 4150],
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26,115,232,0.08)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#1a73e8',
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return '  ' + ctx.parsed.y.toLocaleString('ko-KR') + ' 만원'; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: { callback: function (v) { return v.toLocaleString('ko-KR'); } }
          }
        }
      }
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// 3. renderAsisPropLease — 임대·임차 통합 관리
// ──────────────────────────────────────────────────────────────────────────────
window.renderAsisPropLease = function () {
  var el = document.getElementById('view-asis-prop-lease');
  if (!el) return;
  el.innerHTML = '';

  /* ── 데이터 ── */
  var leases = [
    { no: 'LEASE-2024-001', type: '임차', asset: '수원 영통 사무소',     counterpart: '(주)영통빌딩',          period: '2021-01-01~2026-12-31', area: '2,840', rent: 28400000,  status: 'warn',   statusLabel: '만료예정' },
    { no: 'LEASE-2024-002', type: '임차', asset: '성남 판교 IT센터',     counterpart: '(주)판교테크노밸리',     period: '2022-03-01~2027-02-28', area: '3,120', rent: 46800000,  status: 'ok',     statusLabel: '정상' },
    { no: 'LEASE-2024-003', type: '임차', asset: '강남 별관',            counterpart: 'NH강남빌딩(주)',         period: '2020-06-01~2026-05-31', area: '1,850', rent: 55500000,  status: 'danger', statusLabel: '긴급만료' },
    { no: 'LEASE-2024-004', type: '임차', asset: '인천 남동 창고',       counterpart: '(주)남동물류',           period: '2023-01-01~2027-12-31', area: '4,200', rent: 16800000,  status: 'ok',     statusLabel: '정상' },
    { no: 'LEASE-2024-005', type: '임차', asset: '대전 유성 사무소',     counterpart: '대전씨티빌딩',           period: '2022-06-01~2025-05-31', area: '1,650', rent: 12375000,  status: 'warn',   statusLabel: '갱신검토' },
    { no: 'LEASE-2024-006', type: '임차', asset: '부산 해운대 분소',     counterpart: '(주)해운대타워',         period: '2023-07-01~2028-06-30', area: '2,100', rent: 31500000,  status: 'ok',     statusLabel: '정상' },
    { no: 'LEASE-2024-007', type: '임차', asset: '광주 월드컵 사무소',   counterpart: '(주)광주광역',           period: '2024-01-01~2028-12-31', area: '1,480', rent: 11100000,  status: 'ok',     statusLabel: '정상' },
    { no: 'LEASE-2024-008', type: '임차', asset: '울산 동구 분소',       counterpart: '울산빌딩관리',           period: '2021-09-01~2026-08-31', area: '980',   rent: 7350000,   status: 'warn',   statusLabel: '만료예정' },
    { no: 'LEASE-OUT-001',  type: '임대', asset: '강남 본사 1~2층',      counterpart: '(주)스타벅스코리아',     period: '2022-01-01~2027-12-31', area: '850',   rent: 25500000,  status: 'ok',     statusLabel: '정상' },
    { no: 'LEASE-OUT-002',  type: '임대', asset: '여의도 지하1층',       counterpart: '(주)KB국민은행',         period: '2021-06-01~2026-05-31', area: '420',   rent: 12600000,  status: 'warn',   statusLabel: '만료예정' },
    { no: 'LEASE-OUT-003',  type: '임대', asset: '부산 서면 1층',        counterpart: '(주)파리바게뜨',         period: '2023-03-01~2028-02-28', area: '180',   rent: 9000000,   status: 'ok',     statusLabel: '정상' },
    { no: 'LEASE-OUT-004',  type: '임대', asset: '대구 동성로 1층',      counterpart: '(주)GS25',               period: '2024-05-01~2029-04-30', area: '150',   rent: 7500000,   status: 'ok',     statusLabel: '정상' },
  ];

  /* ── 테이블 행 생성 ── */
  var tableRows = leases.map(function (r) {
    return '<tr class="lease-row" data-type="' + r.type + '">' +
      '<td>' + r.no + '</td>' +
      '<td><span style="background:' + (r.type === '임차' ? '#e8f4fd' : '#fff3e0') + ';color:' + (r.type === '임차' ? '#1a73e8' : '#e65100') + ';border-radius:4px;padding:2px 8px;font-size:12px;font-weight:500">' + r.type + '</span></td>' +
      '<td style="font-weight:500">' + r.asset + '</td>' +
      '<td>' + r.counterpart + '</td>' +
      '<td style="font-size:12px">' + r.period + '</td>' +
      '<td style="text-align:right">' + r.area + '</td>' +
      '<td style="text-align:right;font-weight:500">' + r.rent.toLocaleString('ko-KR') + '원</td>' +
      '<td><span class="asis-status ' + r.status + '">' + r.statusLabel + '</span></td>' +
    '</tr>';
  }).join('');

  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<span class="asis-page-title">임대·임차 통합 관리</span>' +
        '<span class="asis-badge" style="background:#e8f3ff;color:#1a73e8;border:1px solid #bcd4f0">To-Be</span>' +
        '<div class="asis-toolbar" style="margin-left:auto">' +
          '<button class="asis-btn primary">+ 신규계약</button>' +
          '<button class="asis-btn" style="margin-left:8px">Excel 다운로드</button>' +
        '</div>' +
      '</div>' +

      '<div class="asis-kpi-row">' +
        '<div class="asis-kpi-card accent-blue"><div class="asis-kpi-label">임차 중</div><div class="asis-kpi-value">8<span style="font-size:14px;font-weight:400">건</span></div><div class="asis-kpi-sub">외부 임차 중</div></div>' +
        '<div class="asis-kpi-card accent-green"><div class="asis-kpi-label">임대 중</div><div class="asis-kpi-value">3<span style="font-size:14px;font-weight:400">건</span></div><div class="asis-kpi-sub">NH 자산 임대</div></div>' +
        '<div class="asis-kpi-card accent-orange"><div class="asis-kpi-label">이번달 만료예정</div><div class="asis-kpi-value">1<span style="font-size:14px;font-weight:400">건</span></div><div class="asis-kpi-sub">즉시 검토 필요</div></div>' +
        '<div class="asis-kpi-card accent-purple"><div class="asis-kpi-label">연간 임차료</div><div class="asis-kpi-value">28.4<span style="font-size:14px;font-weight:400">억원</span></div><div class="asis-kpi-sub">임차 총액 기준</div></div>' +
      '</div>' +

      '<div class="asis-panel">' +
        '<div class="asis-panel-head">' +
          '<div class="asis-tabs" id="lease-tabs">' +
            '<div class="asis-tab active" data-tab="all">전체</div>' +
            '<div class="asis-tab" data-tab="임차">임차</div>' +
            '<div class="asis-tab" data-tab="임대">임대</div>' +
          '</div>' +
        '</div>' +
        '<div class="asis-panel-body" style="padding:0">' +
          '<div class="asis-table-wrap">' +
            '<table class="asis-table" style="width:100%">' +
              '<colgroup><col style="width:140px"><col style="width:60px"><col><col style="width:160px"><col style="width:190px"><col style="width:80px"><col style="width:130px"><col style="width:90px"></colgroup>' +
              '<thead><tr><th>계약번호</th><th>구분</th><th>대상자산</th><th>계약상대방</th><th>계약기간</th><th>면적(㎡)</th><th>월 임차료</th><th>상태</th></tr></thead>' +
              '<tbody id="lease-tbody">' + tableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ── 탭 전환 + 행 필터링 ── */
  el.querySelector('#lease-tabs').addEventListener('click', function (e) {
    var tab = e.target.closest('.asis-tab');
    if (!tab) return;
    var tabId = tab.dataset.tab;

    el.querySelectorAll('.asis-tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tabId); });

    el.querySelectorAll('.lease-row').forEach(function (row) {
      if (tabId === 'all') {
        row.hidden = false;
      } else {
        row.hidden = row.dataset.type !== tabId;
      }
    });
  });
};
