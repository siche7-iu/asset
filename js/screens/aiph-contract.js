// ===== AI 계약·리스 관리 화면 =====
window.renderAiphContract = function () {
  var el = document.getElementById('view-aiph-contract');
  if (!el) return;

  // ===== KPI 데이터 =====
  var KPI_DATA = [
    { label: '30일내 만기 계약', value: '3건',  borderColor: '#ef4444', valueColor: '#ef4444' },
    { label: 'AI 해지 권고',     value: '2건',  borderColor: 'var(--accent-orange, #F97316)', valueColor: 'var(--accent-orange, #F97316)' },
    { label: '복구충당부채 이상', value: '1건',  borderColor: '#f59e0b', valueColor: '#f59e0b' },
    { label: '임대 수익률 평균',  value: '4.7%', borderColor: 'var(--accent-green, #22C55E)', valueColor: 'var(--accent-green, #22C55E)' }
  ];

  // ===== 만기 타임라인 데이터 =====
  var TIMELINE = [
    { dday: 'D-7',   label: '서울논현지점',   type: '임차 계약 만기',    urgency: 'danger',  urgencyText: '🔴 긴급 갱신', key: 'contract-0', dotColor: '#EF4444', textColor: '#EF4444', badgeBg: '#FEF2F2', badgeColor: '#DC2626' },
    { dday: 'D-23',  label: '법인차 소나타',  type: '차량 리스 만기',    urgency: 'warning', urgencyText: '🟡 검토중',   key: 'contract-1', dotColor: '#F59E0B', textColor: '#D97706', badgeBg: '#FFFBEB', badgeColor: '#B45309' },
    { dday: 'D-45',  label: '부산해운대지점', type: '부동산임차 재계약', urgency: 'warning', urgencyText: '🟡 검토중',  key: 'contract-2', dotColor: '#F59E0B', textColor: '#D97706', badgeBg: '#FFFBEB', badgeColor: '#B45309' },
    { dday: 'D-120', label: '인천부평지점',   type: '부동산임차 재계약', urgency: 'normal',  urgencyText: '🟢 예정',    key: 'contract-3', dotColor: '#22C55E', textColor: '#16A34A', badgeBg: '#F0FDF4', badgeColor: '#15803D' }
  ];

  // ===== 상세 패널 데이터 =====
  var CONTRACT_DETAILS = {
    'contract-0': {
      title: '서울논현지점 임차 계약',
      desc: '현행 임차료: 2,400만원/월 · 면적: 320㎡',
      renew: { cost: '14.4억원 (5년)', rating: '시세 대비 +12% 고평가', ai: 'AI 권고: 임차료 협상 후 5년 갱신 (재무 안정성)' },
      terminate: { cost: '복구공사비 0.8억원', rating: '인근 대체 물건 3건 확인', ai: 'AI 권고: 해지 시 비용 절감 2.1억원' },
      confidence: 'GOOD',
      date: '2026-06-15'
    },
    'contract-1': {
      title: '법인차 소나타 차량 리스',
      desc: '월 리스료: 68만원 · 리스 기간: 3년',
      renew: { cost: '244.8만원 (3년)', rating: '시세 동등 수준', ai: 'AI 권고: 시세 재협상 후 갱신 가능' },
      terminate: { cost: '중도해지 위약금 30만원', rating: '동급 차량 대안 2건', ai: 'AI 권고: 만기 해지 후 재계약 유리' },
      confidence: 'NORMAL',
      date: '2026-06-15'
    },
    'contract-2': {
      title: '부산해운대지점 부동산임차',
      desc: '현행 임차료: 1,850만원/월 · 면적: 280㎡',
      renew: { cost: '11.1억원 (5년)', rating: '시세 적정 수준', ai: 'AI 권고: 현행 조건으로 갱신 권장' },
      terminate: { cost: '복구공사비 0.6억원', rating: '인근 대체 물건 1건 (시세 유사)', ai: 'AI 권고: 갱신이 유리 (이전 비용 과다)' },
      confidence: 'GOOD',
      date: '2026-06-15'
    }
  };

  // ===== 리스 현황 테이블 데이터 =====
  var LEASE_DATA = {
    property: [
      { no: 'LS-2023-041', name: '서울논현지점',   expire: '2026-06-19', monthly: '2,400만', ai: '🔴 긴급', recommend: '재계약' },
      { no: 'LS-2022-089', name: '부산해운대지점', expire: '2026-07-31', monthly: '1,850만', ai: '🟡 검토', recommend: '갱신' },
      { no: 'LS-2021-033', name: '인천부평지점',   expire: '2026-10-14', monthly: '1,200만', ai: '🟢 여유', recommend: '갱신' },
      { no: 'LS-2020-071', name: '대전둔산지점',   expire: '2027-02-28', monthly: '980만',   ai: '🟢 여유', recommend: '갱신' },
      { no: 'LS-2024-012', name: '광주상무지점',   expire: '2027-05-31', monthly: '1,100만', ai: '🟢 여유', recommend: '갱신' }
    ],
    vehicle: [
      { no: 'LS-2024-012', name: '법인차 소나타',  expire: '2026-07-31', monthly: '68만', ai: '🟡 검토', recommend: '해지' },
      { no: 'LS-2024-023', name: '영업용 K5',      expire: '2026-09-30', monthly: '72만', ai: '🟡 검토', recommend: '해지' },
      { no: 'LS-2023-088', name: '화물차 봉고3',   expire: '2026-12-31', monthly: '45만', ai: '🟢 여유', recommend: '갱신' },
      { no: 'LS-2025-001', name: '업무용 카니발',  expire: '2027-03-31', monthly: '95만', ai: '🟢 여유', recommend: '갱신' }
    ],
    other: [
      { no: 'LS-2022-077', name: '복합기 3대',    expire: '2026-09-30', monthly: '15만', ai: '🟢 여유', recommend: '갱신' },
      { no: 'LS-2023-055', name: '정수기 12대',   expire: '2026-11-30', monthly: '8만',  ai: '🟢 여유', recommend: '갱신' },
      { no: 'LS-2024-031', name: 'CCTV 시스템',  expire: '2027-01-31', monthly: '22만', ai: '🟢 여유', recommend: '갱신' }
    ]
  };

  // ===== 헬퍼: 리스 테이블 빌더 =====
  function buildLeaseTable(rows) {
    var html = '<div style="overflow-x:auto;"><table class="asis-table"><thead><tr><th>계약번호</th><th>물건명</th><th>만기일</th><th>월 리스료</th><th>AI 분석</th><th>권고</th><th>분석</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr>';
      html += '<td style="font-family:monospace;font-size:11.5px;">' + r.no + '</td>';
      html += '<td style="font-weight:500;">' + r.name + '</td>';
      html += '<td style="font-size:12px;color:#888;">' + r.expire + '</td>';
      html += '<td style="text-align:right;">' + r.monthly + '</td>';
      html += '<td>' + r.ai + '</td>';
      html += '<td>' + r.recommend + '</td>';
      html += '<td><button onclick="alert(\'AI 갱신·해지 분석을 실행합니다.\')" style="padding:3px 9px;border:1px solid #E2E8F0;border-radius:5px;background:#fff;font-size:11px;cursor:pointer;">분석</button></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  // ===== 헬퍼: 상세 패널 빌더 =====
  function buildDetailPanel(d) {
    return '<div style="padding:14px 16px;">' +
      '<div style="font-size:15px;font-weight:700;margin-bottom:4px;">' + d.title + '</div>' +
      '<div style="font-size:12.5px;color:#888;margin-bottom:16px;">' + d.desc + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
        '<div style="border:1px solid #3B82F6;border-radius:8px;padding:12px;background:#EFF6FF;">' +
          '<div style="font-size:12px;font-weight:700;color:#1D4ED8;margin-bottom:8px;">갱신 시나리오</div>' +
          '<div style="font-size:12px;color:#333;margin-bottom:4px;">총 비용: ' + d.renew.cost + '</div>' +
          '<div style="font-size:11.5px;color:#888;margin-bottom:6px;">' + d.renew.rating + '</div>' +
          '<div style="font-size:11.5px;color:#1D4ED8;">' + d.renew.ai + '</div>' +
        '</div>' +
        '<div style="border:1px solid #EF4444;border-radius:8px;padding:12px;background:#FEF2F2;">' +
          '<div style="font-size:12px;font-weight:700;color:#DC2626;margin-bottom:8px;">해지 시나리오</div>' +
          '<div style="font-size:12px;color:#333;margin-bottom:4px;">비용: ' + d.terminate.cost + '</div>' +
          '<div style="font-size:11.5px;color:#888;margin-bottom:6px;">' + d.terminate.rating + '</div>' +
          '<div style="font-size:11.5px;color:#DC2626;">' + d.terminate.ai + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:#888;margin-bottom:12px;">AI 신뢰도: ' + d.confidence + ' · 기준일: ' + d.date + '</div>' +
      '<button onclick="alert(\'AI 결재함으로 검토 요청이 전달되었습니다.\')" style="width:100%;padding:8px;background:#3B82F6;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;">AI 결재함으로 검토 요청 →</button>' +
    '</div>';
  }

  // ===== KPI HTML =====
  var kpiHtml = '';
  KPI_DATA.forEach(function (k) {
    kpiHtml += '<div class="asis-kpi-card" style="border-top:3px solid ' + k.borderColor + ';">' +
      '<div class="asis-kpi-label">' + k.label + '</div>' +
      '<div class="asis-kpi-value" style="color:' + k.valueColor + ';">' + k.value + '</div>' +
    '</div>';
  });

  // ===== 타임라인 HTML =====
  var tlHtml = '<div style="display:flex;align-items:flex-start;padding:12px 0;">';
  TIMELINE.forEach(function (t, i) {
    tlHtml +=
      '<div class="contract-tl-item" data-key="' + t.key + '" style="cursor:pointer;min-width:160px;flex:1;padding:14px 16px;border-radius:8px;transition:background 0.15s;">' +
        '<div style="width:14px;height:14px;border-radius:50%;background:' + t.dotColor + ';margin:0 auto 8px;border:3px solid #fff;box-shadow:0 0 0 2px ' + t.dotColor + ';"></div>' +
        '<div style="font-weight:700;font-size:13px;color:' + t.textColor + ';text-align:center;">' + t.dday + '</div>' +
        '<div style="font-size:13px;font-weight:600;margin:4px 0 2px;text-align:center;">' + t.label + '</div>' +
        '<div style="font-size:11.5px;color:#888;text-align:center;">' + t.type + '</div>' +
        '<div style="margin-top:6px;font-size:11.5px;background:' + t.badgeBg + ';color:' + t.badgeColor + ';padding:3px 8px;border-radius:12px;display:inline-block;">' + t.urgencyText + '</div>' +
      '</div>';
    if (i < TIMELINE.length - 1) {
      tlHtml += '<div style="flex:0 0 24px;border-top:2px dashed #E2E8F0;margin-top:15px;"></div>';
    }
  });
  tlHtml += '</div>';

  // ===== 전체 HTML 렌더링 =====
  el.innerHTML =
    '<div class="asis-page">' +
      '<div class="asis-page-header">' +
        '<h2 class="asis-page-title">AI 계약·리스 관리 <span class="asis-badge">AI</span></h2>' +
        '<span>AI가 리스·임대차 계약 만기를 예측하고 갱신 vs 해지 비용을 분석합니다 · 기준일: 2026-06-15</span>' +
      '</div>' +

      '<div class="asis-kpi-row" style="grid-template-columns:repeat(4,1fr);">' + kpiHtml + '</div>' +

      '<div class="asis-panel" style="margin-bottom:20px;">' +
        '<div class="asis-panel-head"><span class="asis-panel-title">계약 만기 타임라인</span></div>' +
        '<div class="asis-panel-body"><div id="contract-timeline">' + tlHtml + '</div></div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 360px;gap:20px;">' +
        '<div class="asis-panel">' +
          '<div class="asis-panel-head">' +
            '<span class="asis-panel-title">리스 현황</span>' +
            '<div class="asis-tabs" id="lease-tabs" style="border-bottom:none;">' +
              '<button class="asis-tab active" data-tab="property">부동산 리스</button>' +
              '<button class="asis-tab" data-tab="vehicle">차량 리스</button>' +
              '<button class="asis-tab" data-tab="other">기타 리스</button>' +
            '</div>' +
          '</div>' +
          '<div class="asis-panel-body"><div id="lease-table-wrap"></div></div>' +
        '</div>' +

        '<div class="asis-panel" id="contract-detail-panel" style="height:fit-content;">' +
          '<div class="asis-panel-head"><span class="asis-panel-title">🤖 AI 갱신·해지 분석</span></div>' +
          '<div class="asis-panel-body" id="contract-detail-body">' +
            '<div style="text-align:center;padding:40px 20px;color:#aaa;font-size:13px;">타임라인에서 계약을 클릭하면<br>AI 분석 결과를 보여줍니다.</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // ===== 초기 테이블 렌더링 =====
  var leaseTableWrap = document.getElementById('lease-table-wrap');
  if (leaseTableWrap) {
    leaseTableWrap.innerHTML = buildLeaseTable(LEASE_DATA.property);
  }

  // ===== 리스 탭 전환 이벤트 =====
  var leaseTabsEl = document.getElementById('lease-tabs');
  if (leaseTabsEl && leaseTableWrap) {
    leaseTabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button.asis-tab');
      if (!btn) return;
      leaseTabsEl.querySelectorAll('.asis-tab').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      leaseTableWrap.innerHTML = buildLeaseTable(LEASE_DATA[btn.getAttribute('data-tab')]);
    });
  }

  // ===== 타임라인 카드 클릭 → 상세 패널 =====
  var timeline = document.getElementById('contract-timeline');
  var detailBody = document.getElementById('contract-detail-body');
  if (timeline && detailBody) {
    timeline.addEventListener('click', function (e) {
      var item = e.target.closest('.contract-tl-item');
      if (!item) return;
      var key = item.getAttribute('data-key');
      var d = CONTRACT_DETAILS[key];
      if (!d) return;
      timeline.querySelectorAll('.contract-tl-item').forEach(function (c) { c.style.background = ''; });
      item.style.background = '#F0F9FF';
      detailBody.innerHTML = buildDetailPanel(d);
    });
  }
};
