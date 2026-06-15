// AI Phase — AI 세무 검증

window.renderAiphTax = function () {
  var el = document.getElementById('view-aiph-tax');
  if (!el) return;
  el.innerHTML = '';

  // ── 데이터 ────────────────────────────────────────────────────
  var VAT_DATA = [
    { period: '2026-05', partner: '(주)IT솔루션',    type: '세금계산서 이상',    amount: '4,800만원', deviation: '+320%', risk: '🔴 고위험', action: '검토 요청' },
    { period: '2026-05', partner: '㈜건축사무소',    type: '공통매입세액 이상',  amount: '1,200만원', deviation: '+45%',  risk: '🟡 중간',   action: '검토 요청' },
    { period: '2026-04', partner: '(주)시설관리',    type: '누락 계산서 의심',   amount: '2,700만원', deviation: '—',    risk: '🟡 중간',   action: '확인 요청' },
    { period: '2026-04', partner: '㈜전기공사',      type: '세금계산서 이상',    amount: '890만원',   deviation: '+180%', risk: '🔴 고위험', action: '검토 요청' },
    { period: '2026-03', partner: '(주)보안서비스',  type: '중복 발행 의심',     amount: '340만원',   deviation: '—',    risk: '🟡 중간',   action: '확인 요청' },
    { period: '2026-03', partner: '㈜청소용역',      type: '공통매입세액 이상',  amount: '280만원',   deviation: '+38%',  risk: '🟢 낮음',   action: '모니터링' },
    { period: '2026-02', partner: '(주)IT솔루션',    type: '세금계산서 이상',    amount: '1,100만원', deviation: '+85%',  risk: '🟡 중간',   action: '검토 요청' },
    { period: '2026-02', partner: '㈜렌탈서비스',    type: '누락 계산서 의심',   amount: '620만원',   deviation: '—',    risk: '🟡 중간',   action: '확인 요청' },
    { period: '2026-01', partner: '(주)건물관리',    type: '공통매입세액 이상',  amount: '450만원',   deviation: '+22%',  risk: '🟢 낮음',   action: '모니터링' },
    { period: '2026-01', partner: '㈜보험대리점',    type: '세금계산서 이상',    amount: '230만원',   deviation: '+110%', risk: '🟡 중간',   action: '검토 요청' }
  ];

  var PAYMENT_DATA = [
    { date: '2026-06-10', partner: '(주)IT솔루션',   amount: '1,200만원', pattern: '반복 지급 패턴', evidence: '3개월 연속 동액',        risk: '🔴 고위험', action: '세무 검토' },
    { date: '2026-06-08', partner: '개인 홍길동',    amount: '180만원',   pattern: '증빙 누락',      evidence: '영수증 미첨부',           risk: '🔴 고위험', action: '증빙 요청' },
    { date: '2026-06-05', partner: '㈜건물관리',     amount: '3,400만원', pattern: '단위 오류 의심', evidence: '전월 34만원 대비 ×100',   risk: '🔴 고위험', action: '금액 확인' },
    { date: '2026-05-28', partner: '(주)시설관리',   amount: '560만원',   pattern: '반복 지급 패턴', evidence: '5개월 연속 청구',          risk: '🟡 중간',   action: '계약 확인' },
    { date: '2026-05-20', partner: '개인 이철수',    amount: '95만원',    pattern: '증빙 누락',      evidence: '영수증 미첨부',           risk: '🟡 중간',   action: '증빙 요청' },
    { date: '2026-05-15', partner: '㈜청소용역',     amount: '220만원',   pattern: '금액 이상',      evidence: '전분기 대비 +40%',        risk: '🟡 중간',   action: '금액 확인' },
    { date: '2026-04-30', partner: '(주)보안서비스', amount: '310만원',   pattern: '반복 지급 패턴', evidence: '분기별 정기 청구',         risk: '🟢 낮음',   action: '모니터링' },
    { date: '2026-04-22', partner: '개인 박영수',    amount: '45만원',    pattern: '증빙 누락',      evidence: '간이영수증 첨부',          risk: '🟢 낮음',   action: '모니터링' }
  ];

  var CORP_TAX_DATA = [
    { category: '업무용 차량 비용', item: '법인차 소나타 (서울)', amount: '68만원/월',  issue: '업무 사용 비율 미기재',            risk: '🔴 고위험', action: '비율 등록' },
    { category: '업무용 차량 비용', item: '법인차 K5 (부산)',     amount: '72만원/월',  issue: '업무 전용 표시 누락',              risk: '🟡 중간',   action: '서류 보완' },
    { category: '간주임대료',       item: '부동산 임대 (광주)',   amount: '임대료 수입', issue: '보증금 운용 이자율 적용 기준 이탈', risk: '🔴 고위험', action: '재계산 요청' },
    { category: '세무조정 항목',    item: '접대비 한도 초과',     amount: '120만원',    issue: '전년 대비 +65% 이상 급증',         risk: '🟡 중간',   action: '한도 확인' },
    { category: '세무조정 항목',    item: '감가상각비 한도',      amount: '조정 필요',  issue: '법정상각률 초과 자산 4건',          risk: '🟡 중간',   action: '세무 검토' },
    { category: '세무조정 항목',    item: '기부금 한도',          amount: '30만원',     issue: '기부금 영수증 미첨부',              risk: '🟢 낮음',   action: '서류 보완' }
  ];

  // ── HTML 생성 ────────────────────────────────────────────────
  var html = '';

  // 페이지 헤더
  html += '<div class="asis-page">';
  html += '<div class="asis-page-header">';
  html += '  <div style="display:flex;align-items:center;gap:10px;">';
  html += '    <h2 class="asis-page-title">AI 세무 검증</h2>';
  html += '    <span class="asis-badge">AI</span>';
  html += '  </div>';
  html += '  <span style="font-size:13px;color:#888;">AI가 세무 신고자료를 검증하고 지급회의서·법인세 이상 항목을 자동으로 탐지합니다</span>';
  html += '</div>';

  // KPI 4개
  html += '<div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);">';

  html += '<div class="asis-kpi-card" style="border-top:3px solid #ef4444;">';
  html += '  <div class="asis-kpi-label">AI 탐지 이상</div>';
  html += '  <div class="asis-kpi-value">18건</div>';
  html += '</div>';

  html += '<div class="asis-kpi-card" style="border-top:3px solid var(--accent-green,#16a34a);">';
  html += '  <div class="asis-kpi-label">부가세 검증 완료</div>';
  html += '  <div class="asis-kpi-value">94.2%</div>';
  html += '</div>';

  html += '<div class="asis-kpi-card" style="border-top:3px solid var(--accent-orange,#f97316);">';
  html += '  <div class="asis-kpi-label">지급회의서 이상</div>';
  html += '  <div class="asis-kpi-value">5건</div>';
  html += '</div>';

  html += '<div class="asis-kpi-card" style="border-top:3px solid #7c3aed;">';
  html += '  <div class="asis-kpi-label">법인세 검토 항목</div>';
  html += '  <div class="asis-kpi-value">3건</div>';
  html += '</div>';

  html += '</div>'; // asis-kpi-row

  // 3탭 패널
  html += '<div class="asis-panel">';
  html += '<div class="asis-panel-head">';
  html += '  <div class="asis-tabs" id="tax-tabs" style="border-bottom:none;">';
  html += '    <button class="asis-tab active" data-tab="vat">부가세 신고 검증</button>';
  html += '    <button class="asis-tab" data-tab="payment">지급회의서 이상 탐지</button>';
  html += '    <button class="asis-tab" data-tab="corp">법인세 검증</button>';
  html += '  </div>';
  html += '</div>';
  html += '<div class="asis-panel-body">';

  // ── 탭 1: 부가세 신고 검증 ──────────────────────────────────
  html += '<div id="tax-vat">';
  html += '<div style="background:#FEF2F2;border-left:4px solid #EF4444;border-radius:6px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#7F1D1D;">';
  html += '  <strong>AI 이상 탐지 요약</strong>: 최근 6개월 세금계산서 중 통계적 기준선(±3σ) 이탈 항목 4건 탐지. ';
  html += '  공통매입세액 적용비율 전기 대비 이상 변동 3건. 누락 의심 계산서 3건.';
  html += '</div>';
  html += '<div class="asis-table-wrap">';
  html += '<table class="asis-table">';
  html += '<thead><tr>';
  html += '  <th>과세기간</th><th>거래처</th><th>유형</th><th>금액</th><th>이탈도</th><th>AI 위험도</th><th>조치</th>';
  html += '</tr></thead>';
  html += '<tbody>';
  for (var i = 0; i < VAT_DATA.length; i++) {
    var v = VAT_DATA[i];
    html += '<tr>';
    html += '<td>' + v.period + '</td>';
    html += '<td>' + v.partner + '</td>';
    html += '<td>' + v.type + '</td>';
    html += '<td>' + v.amount + '</td>';
    html += '<td>' + v.deviation + '</td>';
    html += '<td>' + v.risk + '</td>';
    html += '<td><button class="asis-btn-sm">' + v.action + '</button></td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += '</div>';
  html += '</div>'; // tax-vat

  // ── 탭 2: 지급회의서 이상 탐지 ──────────────────────────────
  html += '<div id="tax-payment" style="display:none;">';
  html += '<div style="background:#FFF7ED;border-left:4px solid #F97316;border-radius:6px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#7C2D12;">';
  html += '  <strong>AI 이상 탐지 요약</strong>: 반복 지급 패턴 이상 3건, 증빙서류 누락 3건, 금액 단위 오류 의심 1건. ';
  html += '  고위험 건은 즉시 세무담당자 확인이 필요합니다.';
  html += '</div>';
  html += '<div class="asis-table-wrap">';
  html += '<table class="asis-table">';
  html += '<thead><tr>';
  html += '  <th>지급일</th><th>거래처</th><th>금액</th><th>탐지 패턴</th><th>근거</th><th>AI 위험도</th><th>조치</th>';
  html += '</tr></thead>';
  html += '<tbody>';
  for (var j = 0; j < PAYMENT_DATA.length; j++) {
    var p = PAYMENT_DATA[j];
    html += '<tr>';
    html += '<td>' + p.date + '</td>';
    html += '<td>' + p.partner + '</td>';
    html += '<td>' + p.amount + '</td>';
    html += '<td>' + p.pattern + '</td>';
    html += '<td>' + p.evidence + '</td>';
    html += '<td>' + p.risk + '</td>';
    html += '<td><button class="asis-btn-sm">' + p.action + '</button></td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += '</div>';
  html += '</div>'; // tax-payment

  // ── 탭 3: 법인세 검증 ───────────────────────────────────────
  html += '<div id="tax-corp" style="display:none;">';
  html += '<div style="background:#F5F3FF;border-left:4px solid #7C3AED;border-radius:6px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#4C1D95;">';
  html += '  <strong>AI 검증 요약</strong>: 업무용 차량 비용 처리 기준 위반 의심 2건, 간주임대료 계산 이탈 1건, ';
  html += '  세무조정 항목 전기 대비 이상 변동 3건.';
  html += '</div>';
  html += '<div class="asis-table-wrap">';
  html += '<table class="asis-table">';
  html += '<thead><tr>';
  html += '  <th>구분</th><th>항목</th><th>금액</th><th>AI 발견 이슈</th><th>AI 위험도</th><th>조치</th>';
  html += '</tr></thead>';
  html += '<tbody>';
  for (var k = 0; k < CORP_TAX_DATA.length; k++) {
    var c = CORP_TAX_DATA[k];
    html += '<tr>';
    html += '<td>' + c.category + '</td>';
    html += '<td>' + c.item + '</td>';
    html += '<td>' + c.amount + '</td>';
    html += '<td>' + c.issue + '</td>';
    html += '<td>' + c.risk + '</td>';
    html += '<td><button class="asis-btn-sm">' + c.action + '</button></td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += '</div>';
  html += '</div>'; // tax-corp

  html += '</div>'; // asis-panel-body
  html += '</div>'; // asis-panel
  html += '</div>'; // asis-page

  el.innerHTML = html;

  // ── 탭 전환 이벤트 ────────────────────────────────────────────
  var taxTabsEl = document.getElementById('tax-tabs');
  if (taxTabsEl) {
    taxTabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button.asis-tab');
      if (!btn) return;
      taxTabsEl.querySelectorAll('button.asis-tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      var tab = btn.getAttribute('data-tab');
      ['vat', 'payment', 'corp'].forEach(function (id) {
        var pane = document.getElementById('tax-' + id);
        if (pane) pane.style.display = (id === tab) ? '' : 'none';
      });
    });
  }
};
