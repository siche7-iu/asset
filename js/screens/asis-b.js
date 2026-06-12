// As-is 화면 Group B: 차량 관리, 자산 취득, 자산 폐기

// ─────────────────────────────────────────────────────────────────────────────
// 1. 차량 자산 관리
// ─────────────────────────────────────────────────────────────────────────────
window.renderAsisVehicle = function () {
  var el = document.getElementById('view-asis-vehicle');
  if (!el) return;
  el.innerHTML = '';

  var vehicles = [
    { id: 'NH-VHC-001', name: '현대 그랜저',    type: '세단', plate: '12가 3456', acquireDate: '2021-03-15', price: 45000000, bookValue: 31500000, year: '2021', mileage: '48,500km', dept: '경영지원팀', status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-002', name: '기아 카니발',    type: '승합', plate: '34나 7890', acquireDate: '2020-08-20', price: 38000000, bookValue: 22800000, year: '2020', mileage: '72,300km', dept: 'IT본부',    status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-003', name: '현대 아이오닉6', type: '전기', plate: '56다 1234', acquireDate: '2023-01-10', price: 55000000, bookValue: 49500000, year: '2023', mileage: '18,200km', dept: '마케팅팀', status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-004', name: '기아 쏘렌토',   type: 'SUV',  plate: '78라 5678', acquireDate: '2019-05-22', price: 42000000, bookValue: 16800000, year: '2019', mileage: '95,400km', dept: '영업본부', status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-005', name: '현대 스타리아',  type: '승합', plate: '90마 2345', acquireDate: '2022-11-30', price: 52000000, bookValue: 41600000, year: '2022', mileage: '28,700km', dept: '자산운용팀', status: 'ok',   statusLabel: '운용중' },
    { id: 'NH-VHC-006', name: '기아 K5',       type: '세단', plate: '23바 6789', acquireDate: '2018-07-15', price: 35000000, bookValue: 10500000, year: '2018', mileage: '128,600km', dept: '리스크관리팀', status: 'danger', statusLabel: '폐기예정' },
    { id: 'NH-VHC-007', name: '현대 투싼',      type: 'SUV',  plate: '45사 0123', acquireDate: '2022-04-05', price: 38500000, bookValue: 30800000, year: '2022', mileage: '35,100km', dept: 'IT본부',    status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-008', name: '기아 레이',      type: '경차', plate: '67아 4567', acquireDate: '2021-09-20', price: 20000000, bookValue: 14000000, year: '2021', mileage: '42,800km', dept: '경영지원팀', status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-009', name: '현대 아반떼',    type: '세단', plate: '89자 8901', acquireDate: '2017-12-10', price: 25000000, bookValue:  5000000, year: '2017', mileage: '152,300km', dept: '영업본부', status: 'danger', statusLabel: '폐기예정' },
    { id: 'NH-VHC-010', name: '기아 봉고3',     type: '화물', plate: '01차 2345', acquireDate: '2020-03-28', price: 28000000, bookValue: 16800000, year: '2020', mileage: '85,600km', dept: '자산운용팀', status: 'ok',    statusLabel: '운용중' },
    { id: 'NH-VHC-011', name: '현대 코나 EV',   type: '전기', plate: '12카 6789', acquireDate: '2023-06-15', price: 48000000, bookValue: 43200000, year: '2023', mileage: '12,400km', dept: '마케팅팀', status: 'ok',     statusLabel: '운용중' },
    { id: 'NH-VHC-012', name: '쌍용 렉스턴',    type: 'SUV',  plate: '34타 0123', acquireDate: '2021-02-10', price: 44000000, bookValue: 30800000, year: '2021', mileage: '51,200km', dept: 'IT본부',    status: 'warn',   statusLabel: '수리중' },
    { id: 'NH-VHC-013', name: '기아 카고',      type: '화물', plate: '56파 4567', acquireDate: '2019-10-05', price: 32000000, bookValue: 12800000, year: '2019', mileage: '108,900km', dept: '자산운용팀', status: 'warn',  statusLabel: '수리중' },
    { id: 'NH-VHC-014', name: '현대 넥쏘',      type: '수소', plate: '78하 8901', acquireDate: '2022-08-22', price: 70000000, bookValue: 56000000, year: '2022', mileage: '22,100km', dept: '경영지원팀', status: 'ok',    statusLabel: '운용중' },
    { id: 'NH-VHC-015', name: '기아 EV6',       type: '전기', plate: '90거 2345', acquireDate: '2023-12-01', price: 58000000, bookValue: 55100000, year: '2023', mileage: '5,800km',  dept: '마케팅팀', status: 'ok',     statusLabel: '운용중' }
  ];

  function fmt(n) { return n.toLocaleString('ko-KR') + '원'; }

  var rows = vehicles.map(function (v) {
    return '<tr>' +
      '<td>' + v.id + '</td>' +
      '<td>' + v.name + '</td>' +
      '<td>' + v.type + '</td>' +
      '<td>' + v.plate + '</td>' +
      '<td>' + v.acquireDate + '</td>' +
      '<td>' + fmt(v.price) + '</td>' +
      '<td>' + fmt(v.bookValue) + '</td>' +
      '<td>' + v.year + '</td>' +
      '<td>' + v.mileage + '</td>' +
      '<td>' + v.dept + '</td>' +
      '<td><span class="asis-status ' + v.status + '">' + v.statusLabel + '</span></td>' +
      '</tr>';
  }).join('');

  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<span class="asis-page-title">차량 자산 관리</span>' +
        '<span class="asis-badge">To-Be</span>' +
        '<div class="asis-toolbar">' +
          '<button class="asis-btn primary">신규 등록</button>' +
          '<button class="asis-btn">Excel 다운로드</button>' +
        '</div>' +
      '</div>' +

      '<div class="asis-kpi-row">' +
        '<div class="asis-kpi-card accent-blue">' +
          '<div class="asis-kpi-label">총 차량 수</div>' +
          '<div class="asis-kpi-value">156<span class="asis-kpi-sub">대</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card accent-green">' +
          '<div class="asis-kpi-label">운용중</div>' +
          '<div class="asis-kpi-value">142<span class="asis-kpi-sub">대</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card accent-orange">' +
          '<div class="asis-kpi-label">수리중</div>' +
          '<div class="asis-kpi-value">8<span class="asis-kpi-sub">대</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card accent-purple">' +
          '<div class="asis-kpi-label">폐기예정</div>' +
          '<div class="asis-kpi-value">6<span class="asis-kpi-sub">대</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="asis-filter-bar">' +
        '<select class="asis-select">' +
          '<option value="">상태 전체</option>' +
          '<option>운용중</option>' +
          '<option>수리중</option>' +
          '<option>폐기예정</option>' +
        '</select>' +
        '<select class="asis-select">' +
          '<option value="">차종 전체</option>' +
          '<option>세단</option><option>SUV</option><option>승합</option>' +
          '<option>전기</option><option>화물</option><option>경차</option>' +
          '<option>수소</option>' +
        '</select>' +
        '<input class="asis-input" type="text" placeholder="차량명/번호" style="width:180px;">' +
        '<button class="asis-btn primary">조회</button>' +
      '</div>' +

      '<div class="asis-panel">' +
        '<div class="asis-panel-head">' +
          '<span class="asis-panel-title">차량 목록</span>' +
        '</div>' +
        '<div class="asis-panel-body">' +
          '<div class="asis-table-wrap">' +
            '<table class="asis-table">' +
              '<thead><tr>' +
                '<th>자산번호</th><th>차량명</th><th>차종</th><th>차량번호</th>' +
                '<th>취득일</th><th>취득가액</th><th>장부가액</th>' +
                '<th>연식</th><th>주행거리</th><th>배정부서</th><th>상태</th>' +
              '</tr></thead>' +
              '<tbody>' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. 자산 취득 신청 현황
// ─────────────────────────────────────────────────────────────────────────────
window.renderAsisAcquire = function () {
  var el = document.getElementById('view-asis-acquire');
  if (!el) return;
  el.innerHTML = '';

  var requests = [
    { id: 'REQ-2026-0081', name: '노트북 (Dell Latitude) 20대',  cat: 'IT장비',   dept: 'IT본부',     req: '김민준', date: '2026-05-28', amount: 54000000, status: 'warn',     statusLabel: '승인대기', note: '' },
    { id: 'REQ-2026-0080', name: '사무용 의자 30개',              cat: '사무가구', dept: '경영지원팀', req: '이수진', date: '2026-05-27', amount: 12000000, status: 'ok',       statusLabel: '승인완료', note: '6.15 납품 예정' },
    { id: 'REQ-2026-0079', name: '서버 랙 2대',                   cat: 'IT장비',   dept: 'IT본부',     req: '박지호', date: '2026-05-26', amount:  8500000, status: 'ok',       statusLabel: '승인완료', note: '' },
    { id: 'REQ-2026-0078', name: '법인차량 (현대 아이오닉6)',      cat: '차량',     dept: '자산운용팀', req: '최현아', date: '2026-05-25', amount: 55000000, status: 'progress', statusLabel: '구매발주', note: '6.20 인도 예정' },
    { id: 'REQ-2026-0077', name: '에어컨 실외기 교체',            cat: '시설',     dept: '경영지원팀', req: '한도윤', date: '2026-05-22', amount:  3800000, status: 'ok',       statusLabel: '승인완료', note: '' },
    { id: 'REQ-2026-0076', name: '보안카메라 시스템',              cat: 'IT장비',   dept: '리스크관리팀', req: '신예나', date: '2026-05-20', amount: 18500000, status: 'danger',  statusLabel: '반려',     note: '예산 초과' },
    { id: 'REQ-2026-0075', name: '복합기 교체 (3대)',              cat: '사무기기', dept: '마케팅팀',   req: '오태양', date: '2026-05-18', amount:  9600000, status: 'ok',       statusLabel: '승인완료', note: '' },
    { id: 'REQ-2026-0074', name: 'UPS 배터리 교체',               cat: 'IT장비',   dept: 'IT본부',     req: '정우성', date: '2026-05-15', amount:  4200000, status: 'idle',     statusLabel: '자산등록', note: '' },
    { id: 'REQ-2026-0073', name: '대형 모니터 50인치 5대',         cat: 'IT장비',   dept: '마케팅팀',   req: '강민서', date: '2026-05-12', amount:  7500000, status: 'idle',     statusLabel: '자산등록', note: '' },
    { id: 'REQ-2026-0072', name: '전동 높이조절 책상 10개',        cat: '사무가구', dept: 'IT본부',     req: '윤지은', date: '2026-05-10', amount: 14000000, status: 'idle',     statusLabel: '자산등록', note: '' }
  ];

  function fmt(n) { return n.toLocaleString('ko-KR') + '원'; }

  var steps = [
    { label: '신청서 작성', cls: 'done',   dot: '✓' },
    { label: '부서장 검토', cls: 'done',   dot: '✓' },
    { label: '자산팀 승인', cls: 'active', dot: '3' },
    { label: '구매 발주',   cls: '',       dot: '4' },
    { label: '자산 등록',   cls: '',       dot: '5' }
  ];

  var stepsHtml = steps.map(function (s, i) {
    var sep = i < steps.length - 1
      ? '<div class="asis-step-sep"></div>'
      : '';
    return '<div class="asis-step ' + s.cls + '">' +
      '<div class="asis-step-dot">' + s.dot + '</div>' +
      '<div class="asis-step-label">' + s.label + '</div>' +
      '</div>' + sep;
  }).join('');

  var rows = requests.map(function (r) {
    return '<tr>' +
      '<td>' + r.id + '</td>' +
      '<td>' + r.name + '</td>' +
      '<td>' + r.cat + '</td>' +
      '<td>' + r.dept + '</td>' +
      '<td>' + r.req + '</td>' +
      '<td>' + r.date + '</td>' +
      '<td>' + fmt(r.amount) + '</td>' +
      '<td><span class="asis-status ' + r.status + '">' + r.statusLabel + '</span></td>' +
      '<td>' + r.note + '</td>' +
      '</tr>';
  }).join('');

  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<span class="asis-page-title">자산 취득 신청 현황</span>' +
        '<span class="asis-badge">To-Be</span>' +
      '</div>' +

      '<div class="asis-kpi-row">' +
        '<div class="asis-kpi-card accent-blue">' +
          '<div class="asis-kpi-label">이번달 신청</div>' +
          '<div class="asis-kpi-value">12<span class="asis-kpi-sub">건</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card accent-orange">' +
          '<div class="asis-kpi-label">승인대기</div>' +
          '<div class="asis-kpi-value">5<span class="asis-kpi-sub">건</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card accent-green">' +
          '<div class="asis-kpi-label">이번달 승인금액</div>' +
          '<div class="asis-kpi-value">2억 3,500<span class="asis-kpi-sub">만원</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="asis-panel">' +
        '<div class="asis-panel-head">' +
          '<span class="asis-panel-title">취득 프로세스</span>' +
        '</div>' +
        '<div class="asis-panel-body">' +
          '<div class="asis-steps">' + stepsHtml + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="asis-filter-bar">' +
        '<label style="font-size:13px;color:#555;">신청기간</label>' +
        '<input class="asis-input" type="date" value="2026-05-01" style="width:140px;">' +
        '<span style="color:#888;padding:0 4px;">~</span>' +
        '<input class="asis-input" type="date" value="2026-05-31" style="width:140px;">' +
        '<select class="asis-select">' +
          '<option value="">상태 전체</option>' +
          '<option>승인대기</option><option>승인완료</option>' +
          '<option>구매발주</option><option>자산등록</option><option>반려</option>' +
        '</select>' +
        '<button class="asis-btn primary">조회</button>' +
      '</div>' +

      '<div class="asis-panel">' +
        '<div class="asis-panel-head">' +
          '<span class="asis-panel-title">신청 목록</span>' +
        '</div>' +
        '<div class="asis-panel-body">' +
          '<div class="asis-table-wrap">' +
            '<table class="asis-table">' +
              '<thead><tr>' +
                '<th>신청번호</th><th>자산명</th><th>분류</th><th>신청부서</th>' +
                '<th>신청자</th><th>신청일</th><th>신청금액</th><th>승인상태</th><th>비고</th>' +
              '</tr></thead>' +
              '<tbody>' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. 자산 폐기 현황
// ─────────────────────────────────────────────────────────────────────────────
window.renderAsisClosing = function () {
  var el = document.getElementById('view-asis-closing');
  if (!el) return;
  el.innerHTML = '';

  var disposals = [
    { id: 'DIS-2026-0045', name: '구형 서버 Dell R720',     cat: 'IT장비',   acquireDate: '2015-03-10', bookValue: '0원',         reason: '내용연수 초과', method: '폐기처분',  disposeAmt: '0원',         status: 'danger', statusLabel: '폐기신청' },
    { id: 'DIS-2026-0044', name: 'HP 레이저젯 복합기',       cat: '사무기기', acquireDate: '2016-08-15', bookValue: '0원',         reason: '고장(수리불가)', method: '폐기처분', disposeAmt: '0원',         status: 'warn',   statusLabel: '승인대기' },
    { id: 'DIS-2026-0043', name: '2014년식 아반떼',          cat: '차량',     acquireDate: '2014-05-20', bookValue: '500,000원',   reason: '내용연수 초과', method: '공매처분',  disposeAmt: '2,500,000원', status: 'warn',   statusLabel: '승인대기' },
    { id: 'DIS-2026-0042', name: '노트북 20대 (2016년)',      cat: 'IT장비',   acquireDate: '2016-03-01', bookValue: '0원',         reason: '내용연수 초과', method: '일괄매각',  disposeAmt: '1,000,000원', status: 'danger', statusLabel: '폐기신청' },
    { id: 'DIS-2026-0041', name: '강남지점 에어컨 구형',      cat: '시설',     acquireDate: '2013-07-22', bookValue: '0원',         reason: '효율 저하',     method: '폐기처분',  disposeAmt: '0원',         status: 'ok',     statusLabel: '폐기완료' },
    { id: 'DIS-2026-0040', name: '모니터 35대 (2015년)',      cat: 'IT장비',   acquireDate: '2015-09-10', bookValue: '0원',         reason: '내용연수 초과', method: '일괄매각',  disposeAmt: '700,000원',   status: 'ok',     statusLabel: '폐기완료' },
    { id: 'DIS-2026-0039', name: '2015년식 카니발',           cat: '차량',     acquireDate: '2015-11-30', bookValue: '0원',         reason: '내용연수 초과', method: '공매처분',  disposeAmt: '1,800,000원', status: 'ok',     statusLabel: '폐기완료' },
    { id: 'DIS-2026-0038', name: '구형 프린터 8대',           cat: '사무기기', acquireDate: '2014-04-05', bookValue: '0원',         reason: '고장(수리불가)', method: '폐기처분', disposeAmt: '0원',         status: 'ok',     statusLabel: '폐기완료' },
    { id: 'DIS-2026-0037', name: '물류창고 지게차',           cat: '운반장비', acquireDate: '2016-02-18', bookValue: '1,200,000원', reason: '노후화',        method: '매각',      disposeAmt: '3,000,000원', status: 'idle',   statusLabel: '처분보류' },
    { id: 'DIS-2026-0036', name: '여의도 PBX 교환기',         cat: '통신장비', acquireDate: '2012-06-30', bookValue: '0원',         reason: '기술노후',      method: '처분검토중', disposeAmt: '미정',        status: 'idle',   statusLabel: '처분보류' }
  ];

  var rows = disposals.map(function (d) {
    return '<tr>' +
      '<td>' + d.id + '</td>' +
      '<td>' + d.name + '</td>' +
      '<td>' + d.cat + '</td>' +
      '<td>' + d.acquireDate + '</td>' +
      '<td>' + d.bookValue + '</td>' +
      '<td>' + d.reason + '</td>' +
      '<td>' + d.method + '</td>' +
      '<td>' + d.disposeAmt + '</td>' +
      '<td><span class="asis-status ' + d.status + '">' + d.statusLabel + '</span></td>' +
      '</tr>';
  }).join('');

  var canvasId = 'asis-closing-chart';

  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<span class="asis-page-title">자산 폐기 현황</span>' +
        '<span class="asis-badge">To-Be</span>' +
        '<div class="asis-toolbar">' +
          '<button class="asis-btn primary">폐기 신청</button>' +
          '<button class="asis-btn">Excel 다운로드</button>' +
        '</div>' +
      '</div>' +

      '<div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);">' +
        '<div class="asis-kpi-card" style="border-left:4px solid #ef4444;">' +
          '<div class="asis-kpi-label">폐기신청</div>' +
          '<div class="asis-kpi-value">45<span class="asis-kpi-sub">건</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card" style="border-left:4px solid #f97316;">' +
          '<div class="asis-kpi-label">승인대기</div>' +
          '<div class="asis-kpi-value">18<span class="asis-kpi-sub">건</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card" style="border-left:4px solid #22c55e;">' +
          '<div class="asis-kpi-label">폐기완료</div>' +
          '<div class="asis-kpi-value">387<span class="asis-kpi-sub">건</span></div>' +
        '</div>' +
        '<div class="asis-kpi-card" style="border-left:4px solid #3b82f6;">' +
          '<div class="asis-kpi-label">처분보류</div>' +
          '<div class="asis-kpi-value">12<span class="asis-kpi-sub">건</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="asis-filter-bar">' +
        '<label style="font-size:13px;color:#555;">기간</label>' +
        '<input class="asis-input" type="date" value="2026-01-01" style="width:140px;">' +
        '<span style="color:#888;padding:0 4px;">~</span>' +
        '<input class="asis-input" type="date" value="2026-12-31" style="width:140px;">' +
        '<select class="asis-select">' +
          '<option value="">상태 전체</option>' +
          '<option>폐기신청</option><option>승인대기</option>' +
          '<option>폐기완료</option><option>처분보류</option>' +
        '</select>' +
        '<select class="asis-select">' +
          '<option value="">분류 전체</option>' +
          '<option>IT장비</option><option>차량</option><option>사무기기</option>' +
          '<option>시설</option><option>운반장비</option><option>통신장비</option>' +
        '</select>' +
        '<button class="asis-btn primary">조회</button>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">' +
        '<div class="asis-panel">' +
          '<div class="asis-panel-head">' +
            '<span class="asis-panel-title">폐기 현황 목록</span>' +
          '</div>' +
          '<div class="asis-panel-body">' +
            '<div class="asis-table-wrap">' +
              '<table class="asis-table">' +
                '<thead><tr>' +
                  '<th>폐기번호</th><th>자산명</th><th>분류</th><th>취득일</th>' +
                  '<th>장부가액</th><th>폐기사유</th><th>폐기방법</th>' +
                  '<th>처분예정금액</th><th>상태</th>' +
                '</tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="asis-panel">' +
          '<div class="asis-panel-head">' +
            '<span class="asis-panel-title">상태별 비율</span>' +
          '</div>' +
          '<div class="asis-panel-body" style="display:flex;align-items:center;justify-content:center;min-height:280px;">' +
            '<canvas id="' + canvasId + '" width="260" height="260"></canvas>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Chart.js 도넛 렌더링 — DOM 삽입 직후 실행
  (function () {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    // 이전 인스턴스 파괴 (화면 재진입 시 캔버스 재사용 오류 방지)
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    var ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['폐기신청', '승인대기', '폐기완료', '처분보류'],
        datasets: [{
          data: [45, 18, 387, 12],
          backgroundColor: ['#ef4444', '#f97316', '#22c55e', '#3b82f6'],
          borderWidth: 2
        }]
      },
      options: {
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, padding: 12 }
          },
          tooltip: { enabled: true }
        }
      },
      plugins: [{
        id: 'centerText',
        afterDraw: function (chart) {
          var ctx = chart.ctx;
          ctx.save();
          var cx = chart.chartArea
            ? (chart.chartArea.left + chart.chartArea.right) / 2
            : chart.width / 2;
          var cy = chart.chartArea
            ? (chart.chartArea.top + chart.chartArea.bottom) / 2
            : chart.height / 2;
          ctx.font = 'bold 18px sans-serif';
          ctx.fillStyle = '#1a1a2e';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('462건', cx, cy - 8);
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#888';
          ctx.fillText('전체 폐기 현황', cx, cy + 10);
          ctx.restore();
        }
      }]
    });
  }());
};
