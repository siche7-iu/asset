// 고정자산관리시스템 - 시연용 샘플 데이터
// 화면을 새로 고칠 때마다 항상 같은 데이터가 보이도록, 무작위(random) 없이 규칙으로 만듭니다.

// 분류별로 몇 건을 만들지 정합니다. ["분류이름", 개수]
var CATEGORY_PLAN = [
  ["노트북", 14],
  ["데스크탑", 10],
  ["모니터", 12],
  ["서버", 3],
  ["복합기", 4],
  ["프로젝터", 3],
  ["책상", 9],
  ["의자", 9],
  ["캐비닛", 4],
  ["차량", 3]
];

// 분류별 모델(제품) 이름 후보
var MODELS = {
  "노트북": ["LG 그램 16", "삼성 갤럭시북4", "HP 엘리트북 840", "델 래티튜드 7440", "애플 맥북프로 14"],
  "데스크탑": ["HP 프로데스크 400", "델 옵티플렉스 7010", "삼성 DB400P"],
  "모니터": ["LG 27UP650", "삼성 S27A600", "델 U2723QE"],
  "서버": ["HPE ProLiant DL380", "델 PowerEdge R750"],
  "복합기": ["신도리코 D420", "캐논 iR-ADV C3826", "제록스 VersaLink C405"],
  "프로젝터": ["엡손 EB-2250U", "벤큐 MW560"],
  "책상": ["퍼시스 1200 책상", "리바트 모션데스크"],
  "의자": ["시디즈 T50", "퍼시스 큐브 의자"],
  "캐비닛": ["퍼시스 3단 캐비닛", "코아스 철제락커"],
  "차량": ["현대 스타리아", "기아 카니발", "현대 포터2"]
};

// 분류별 기준 취득금액(원)
var PRICE_BASE = {
  "노트북": 1800000, "데스크탑": 1200000, "모니터": 450000, "서버": 9500000,
  "복합기": 2500000, "프로젝터": 1500000, "책상": 280000, "의자": 320000,
  "캐비닛": 180000, "차량": 38000000
};

var DEPARTMENTS = ["경영지원팀", "개발1팀", "개발2팀", "영업팀", "마케팅팀", "인사팀", "재무팀", "고객지원팀"];
var LOCATIONS = ["본사 3층", "본사 5층", "본사 7층", "본사 9층", "물류센터", "부설연구소"];
var USERS = ["김민수", "이서연", "박지훈", "최예린", "정우진", "한가람", "오세진", "윤다은", "장현우", "임수아", "서준호", "배유나"];
// 상태는 "사용중" 비중이 높도록 일부러 여러 번 넣음
var STATUS_PLAN = ["사용중", "사용중", "사용중", "사용중", "사용중", "유휴", "수리중", "폐기예정"];

function pad(n, len) {
  var s = String(n);
  while (s.length < len) s = "0" + s;
  return s;
}

function buildAssets() {
  var assets = [];
  var seq = 0;

  CATEGORY_PLAN.forEach(function (plan) {
    var category = plan[0];
    var count = plan[1];

    for (var k = 0; k < count; k++) {
      var models = MODELS[category];
      var model = models[seq % models.length];
      var dept = DEPARTMENTS[seq % DEPARTMENTS.length];
      var location = LOCATIONS[seq % LOCATIONS.length];
      var owner = USERS[seq % USERS.length];
      var status = STATUS_PLAN[seq % STATUS_PLAN.length];

      // 취득일: 2019 ~ 2025 사이로 골고루 분산
      var year = 2019 + (seq % 7);
      var month = 1 + (seq % 12);
      var day = 1 + (seq % 27);
      var acquireDate = year + "-" + pad(month, 2) + "-" + pad(day, 2);

      // 취득금액: 기준가에서 조금씩 변동
      var base = PRICE_BASE[category];
      var price = base + (seq % 5) * Math.round(base * 0.05);

      seq++;
      var id = "AST-" + year + "-" + pad(seq, 4);

      // 변경 이력 만들기
      var history = [{ date: acquireDate, type: "등록", detail: dept + " 배정 / 신규 취득 등록" }];
      if (seq % 3 === 0) {
        var moveYear = year + 1 <= 2026 ? year + 1 : year;
        var fromDept = DEPARTMENTS[(seq + 1) % DEPARTMENTS.length];
        history.push({ date: moveYear + "-03-15", type: "부서이동", detail: fromDept + " → " + dept + " 이동" });
      }
      if (seq % 4 === 0) {
        var repairYear = Math.min(year + 2, 2026);
        history.push({ date: repairYear + "-07-08", type: "수리", detail: "정기 점검 및 부품 교체" });
      }
      history.push({ date: "2026-04-30", type: "실사", detail: "연 1회 정기 자산 실사 확인" });
      if (status === "폐기예정") {
        history.push({ date: "2026-05-20", type: "폐기심사", detail: "노후화로 폐기 대상 선정" });
      }
      history.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

      assets.push({
        id: id, name: model, category: category, model: model,
        department: dept, owner: owner, location: location, status: status,
        acquireDate: acquireDate, price: price, history: history
      });
    }
  });

  return assets;
}

// ===== 대시보드 표시용 요약 데이터 =====
// 화면(이미지)에 보이는 큰 수치들은 운영 시스템 전체 규모를 가정한 "요약 통계"입니다.
// (원장관리 목록의 샘플 자산 70여 건과는 별개로, 시연 화면을 이미지와 똑같이 보여주기 위한 값)
var DASHBOARD = {
  asOf: "오전 09:12",
  insight: "강원 지역 사업소의 노후 자산 교체 주기가 도래했습니다. 다음 분기 예산 편성 시 유지보수 비용 12.4% 절감이 예상되는 교체 안을 검토하세요.",

  // KPI 6칸
  kpis: [
    { label: "총 자산 가치", value: "₩12,405", unit: "억", icon: "trend",
      badge: "전월 대비 ▲ 1.2%", tone: "red", badgeIcon: "trend" },
    { label: "전체 자산 수", value: "12,492", unit: "개", icon: "box",
      badge: "관리중인 자산 수 : 8,421개", tone: "amber" },
    { label: "고위험 자산", value: "42", unit: "개", icon: "warn",
      badge: "위험", tone: "red", badgeIcon: "warn" },
    { label: "점검 예정", value: "128", unit: "개", icon: "clock",
      badge: "7일 이내 점검 대상", tone: "blue", badgeIcon: "clock" },
    { label: "유지보수 가동률", value: "98.4", unit: "%",
      gauge: { pct: 98.4, color: "#16A34A" }, badge: "이번 달 완료 기준", tone: "green", badgeIcon: "check" },
    { label: "감가상각률(평균)", value: "14.2", unit: "%",
      gauge: { pct: 14.2, color: "#2563EB" }, badge: "전월 대비 ▼ 0.3%", tone: "blue", badgeIcon: "trend" }
  ],

  // 노후 위험도 분포 (도넛 + 범례)
  risk: {
    centerTotal: "12,492개",
    centerSub: "자산 가치 2,548억원",
    segments: [
      { key: "HIGH",        note: "즉시 교체 필요", count: 1248, label: "1,248개", pct: "9.6%",  color: "#F2426A" },
      { key: "MEDIUM",      note: "추후 교체 필요", count: 3572, label: "3,572개", pct: "27.3%", color: "#F5B73D" },
      { key: "LOW",         note: "정상",          count: 7672, label: "7,672개", pct: "59.1%", color: "#3B82F6" },
      { key: "신규 / 미평가", note: "",             count: 0,    label: "0개",     pct: "0.0%",  color: "#CBD5E1" }
    ],
    formula: "* 위험도 산정 기준: 노후도(40%) + 장애이력(30%) + 유지보수비용(20%) + 중요도(10%)"
  },

  // 교체 시기 도래 자산 (타임라인)
  timeline: {
    rows: [
      { label: "~ 6개월 이내", value: "56억원",  count: "218개",   color: "#EF4444" },
      { label: "6개월 ~ 1년",  value: "102억원", count: "424개",   color: "#F5B73D" },
      { label: "1년 ~ 2년",    value: "128억원", count: "606개",   color: "#F97316" },
      { label: "2년 이후",     value: "426억원", count: "1,912개", color: "#3B82F6" }
    ],
    totalCount: "3,160개",
    totalValue: "712"
  },

  // 지역별 관리 현황 (지도 마커) — x/y 는 지도 영역 안에서의 위치(%)
  regions: [
    { name: "서울", count: "4,218", x: 44, y: 25, dir: "left", active: true,
      detail: [["전체 자산", "4,218개"], ["고위험 자산", "12개 [HIGH]"], ["점검 예정", "37개 (7일 이내 6개)"],
               ["계약 만료 임박", "5개"], ["노후 자산(8년+)", "857개"], ["유지보수 가동률", "97.8%"]] },
    { name: "강원", count: "1,124", x: 59, y: 18, dir: "right", expDir: "left", expAdjust: 160,
      detail: [["전체 자산", "1,124개"], ["고위험 자산", "8개 [HIGH]"], ["점검 예정", "14개 (7일 이내 3개)"],
               ["계약 만료 임박", "2개"], ["노후 자산(8년+)", "286개"], ["유지보수 가동률", "96.1%"]] },
    { name: "경상", count: "2,193", x: 72, y: 50, dir: "right", expDir: "left",
      detail: [["전체 자산", "2,193개"], ["고위험 자산", "11개 [HIGH]"], ["점검 예정", "29개 (7일 이내 5개)"],
               ["계약 만료 임박", "4개"], ["노후 자산(8년+)", "498개"], ["유지보수 가동률", "98.0%"]] },
    { name: "전라", count: "1,587", x: 40, y: 67, dir: "left", expAbove: true,
      detail: [["전체 자산", "1,587개"], ["고위험 자산", "7개 [HIGH]"], ["점검 예정", "21개 (7일 이내 4개)"],
               ["계약 만료 임박", "3개"], ["노후 자산(8년+)", "312개"], ["유지보수 가동률", "97.4%"]] },
    { name: "제주", count: "412", x: 27, y: 92, dir: "left", expAbove: true,
      detail: [["전체 자산", "412개"], ["고위험 자산", "4개 [HIGH]"], ["점검 예정", "6개 (7일 이내 1개)"],
               ["계약 만료 임박", "1개"], ["노후 자산(8년+)", "115개"], ["유지보수 가동률", "95.6%"]] }
  ],

  // 위험 자산 TOP 5
  top5: [
    { title: "강원 춘천지점 ATM 03호",        sub: "장애 발생 5회 + 사용연수 7년 초과", badge: "심각", tone: "red" },
    { title: "본사 서버실 서버 12호",          sub: "메모리 오류 반복 + EOL 도래",       badge: "경고", tone: "amber" },
    { title: "영남 부산지점 네트워크장비 05호", sub: "펌웨어 미지원 + 장애 3회",          badge: "경고", tone: "amber" },
    { title: "전라 광주지점 ATM 07호",         sub: "부품 단종 + 사용연수 8년 초과",     badge: "경고", tone: "amber" },
    { title: "경기 수원지점 키오스크 02호",     sub: "디스플레이 불량 반복 + 장애 2회",   badge: "주의", tone: "amber" }
  ],

  // 최근 이슈 내역
  issues: [
    { time: "14:20", title: "경기 용인 지점 CCTV 망 장애 복구...", sub: "현장 점검팀: 김철수 과장" },
    { time: "11:05", title: "본사 공조 시스템 소음 민원 접수",      sub: "유지보수 업체: (주)그레이엔지니어링" },
    { time: "09:12", title: "신규 자산 12건 등록 완료 (영남 지역)",  sub: "자산 분류: 사무용 기기" },
    { time: "08:34", title: "제주 지점 UPS 배터리 용량 경보 발생",   sub: "조치 담당: 전기안전팀 이민호 대리" },
    { time: "07:50", title: "전국 사무용 PC 보안 패치 배포 완료 (132대)", sub: "패치 분류: 윈도우 긴급 보안 업데이트" }
  ],

  // 계약/점검 일정
  schedule: [
    { tag: "MAINTENANCE", date: "5/24 (수)", title: "서울 지역 전력 설비 점검",      sub: "대상: 본사 외 3개 지점" },
    { tag: "CONTRACT",    date: "5/28 (월)", title: "데이터센터 임대 계약 갱신",     sub: "협력사: KT 클라우드 서비스" },
    { tag: "MAINTENANCE", date: "6/2 (화)",  title: "영남 지역 네트워크 장비 점검",  sub: "대상: 부산 외 2개 지점" },
    { tag: "CONTRACT",    date: "6/5 (금)",  title: "복합기 임대 계약 갱신 (전국)",  sub: "협력사: (주)리코코리아" },
    { tag: "INSPECTION",  date: "6/12 (금)", title: "소방 설비 정기 안전 점검",      sub: "대상: 본사·강남·영등포 지점" }
  ],

  // 자산 노후도 분석
  aging: {
    bars: [
      { label: "신규 (0-3년)", pct: 42, color: "#3B82F6", count: "5,247개" },
      { label: "보통 (4-7년)", pct: 35, color: "#22D3EE", count: "4,372개" },
      { label: "노후 (8년+)",  pct: 23, color: "#22C55E", count: "2,873개" }
    ],
    stats: [["총 노후 자산", "2,068개"], ["분기 교체 권고", "42개"], ["예상 교체 비용", "38.2억원"]]
  }
};

// ===== AI Agent 시연용 데이터 =====
// 본점영업부 노후 PC 5건 (시나리오 1)
var AI_AGENT_PC_LIST = [
  { id: 'AST-2020-0142', name: '본점영업부 데스크탑PC 01호',
    category: '데스크탑', model: 'HP 프로데스크 400 G6', department: '본점영업부',
    owner: '김민수 대리', location: '본점 3F 사무실A', status: '교체권고',
    acquireDate: '2020-03-15', price: 1250000, usedYears: 6.2, statusTone: 'red',
    history: [
      { date: '2020-03-15', type: '등록', detail: '본점영업부 배정 / 신규 취득 등록' },
      { date: '2024-06-10', type: '이동', detail: '사무실B → 사무실A 이동' },
      { date: '2025-09-05', type: '수리', detail: 'HDD 교체 (SSD 256GB)' },
      { date: '2026-03-12', type: '점검', detail: 'OS 패치 적용 및 정기 점검' }
    ],
    aiNote: '사용연수가 내용연수(5년)를 초과했고 최근 6개월 내 수리 1회 발생. 교체 권고.'
  },
  { id: 'AST-2020-0143', name: '본점영업부 데스크탑PC 02호',
    category: '데스크탑', model: '델 옵티플렉스 7010', department: '본점영업부',
    owner: '이서연 사원', location: '본점 3F 사무실A', status: '점검필요',
    acquireDate: '2020-08-22', price: 1180000, usedYears: 5.8, statusTone: 'amber',
    history: [
      { date: '2020-08-22', type: '등록', detail: '본점영업부 배정 / 신규 취득 등록' },
      { date: '2025-02-18', type: '수리', detail: '전원 어댑터 교체' },
      { date: '2026-04-30', type: '실사', detail: '연 1회 정기 자산 실사 확인' }
    ],
    aiNote: '사용연수 5.8년으로 내용연수 도래. 1회 수리 이력으로 점검 후 교체 검토.'
  },
  { id: 'AST-2019-0089', name: '본점영업부 노트북 03호',
    category: '노트북', model: 'LG 그램 14', department: '본점영업부',
    owner: '박지훈 대리', location: '본점 3F 사무실B', status: '교체권고',
    acquireDate: '2019-11-04', price: 1620000, usedYears: 6.5, statusTone: 'red',
    history: [
      { date: '2019-11-04', type: '등록', detail: '본점영업부 배정 / 신규 취득 등록' },
      { date: '2023-05-10', type: '수리', detail: '배터리 교체' },
      { date: '2025-08-22', type: '수리', detail: '키보드 교체' }
    ],
    aiNote: '사용연수 6.5년으로 내용연수 1.5년 초과. 수리 이력 2회. 즉시 교체 우선순위.'
  },
  { id: 'AST-2020-0150', name: '본점영업부 데스크탑PC 04호',
    category: '데스크탑', model: '삼성 DB400P', department: '본점영업부',
    owner: '최예린 사원', location: '본점 4F 회의실B', status: '점검필요',
    acquireDate: '2020-12-01', price: 1150000, usedYears: 5.5, statusTone: 'amber',
    history: [
      { date: '2020-12-01', type: '등록', detail: '본점영업부 배정 / 신규 취득 등록' },
      { date: '2026-01-15', type: '점검', detail: '정기 점검 / 이상 없음' }
    ],
    aiNote: '사용연수 5.5년 내용연수 도래. 수리 이력 없음. 점검 후 교체 일정 수립 권고.'
  },
  { id: 'AST-2019-0091', name: '본점영업부 노트북 05호',
    category: '노트북', model: 'HP 엘리트북 840', department: '본점영업부',
    owner: '정우진 대리', location: '본점 3F 사무실A', status: '교체권고',
    acquireDate: '2019-06-20', price: 1750000, usedYears: 6.8, statusTone: 'red',
    history: [
      { date: '2019-06-20', type: '등록', detail: '본점영업부 배정 / 신규 취득 등록' },
      { date: '2024-09-12', type: '수리', detail: '메인보드 부분 수리' }
    ],
    aiNote: '사용연수 6.8년으로 내용연수 크게 초과. 메인보드 수리 이력. 즉시 교체 우선순위.'
  }
];

// 본점영업부 보험 만료 임박 차량 6건 (시나리오 2)
var AI_AGENT_VEHICLE_LIST = [
  { id: 'AST-2021-0205', name: '본점영업부 영업차량 3호',
    category: '차량', model: '그랜저 IG 2.5 가솔린', department: '본점영업부',
    vehicleNo: '56다 1234', owner: '한가람 과장', location: '본점 지하1F 주차장',
    status: 'D-7 만료임박', statusTone: 'red',
    acquireDate: '2021-08-15', price: 38500000, dDay: 7,
    insurance: { company: 'KB손해보험', policyNo: 'KB-2025-78901',
      coverage: '종합 (대인무한·대물 10억·자차)',
      startDate: '2025-06-07', endDate: '2026-06-07',
      annualPremium: 1820000, autoRenew: false },
    history: [
      { date: '2021-08-15', type: '취득', detail: '신규 구입 / 본점영업부 배정' },
      { date: '2023-06-07', type: '갱신', detail: 'KB손해보험 종합 갱신' },
      { date: '2024-06-07', type: '갱신', detail: 'KB손해보험 종합 갱신' },
      { date: '2025-06-07', type: '갱신', detail: 'KB손해보험 종합 갱신' }
    ],
    aiNote: '보험 만료까지 7일. 자동 갱신 미설정. D-7 이내 최우선 갱신 처리 필요.'
  },
  { id: 'AST-2022-0118', name: '본점영업부 영업차량 1호',
    category: '차량', model: '쏘나타 DN8 2.0 가솔린', department: '본점영업부',
    vehicleNo: '12가 3456', owner: '김민수 대리', location: '본점 지하1F 주차장',
    status: 'D-12 만료임박', statusTone: 'red',
    acquireDate: '2022-05-10', price: 28500000, dDay: 12,
    insurance: { company: '삼성화재', policyNo: 'SS-2025-12345',
      coverage: '종합 (대인무한·대물 5억·자차)',
      startDate: '2025-06-12', endDate: '2026-06-12',
      annualPremium: 1250000, autoRenew: false },
    history: [
      { date: '2022-05-10', type: '취득', detail: '신규 구입 / 본점영업부 배정' },
      { date: '2024-06-12', type: '갱신', detail: '삼성화재 종합 갱신' },
      { date: '2025-06-12', type: '갱신', detail: '삼성화재 종합 갱신' },
      { date: '2025-11-20', type: '사고', detail: '경미한 접촉 (자차 처리)' }
    ],
    aiNote: '보험 만료까지 12일. 자동 갱신 미설정. 만기 공백 위험. 즉시 갱신 권고.'
  },
  { id: 'AST-2022-0119', name: '본점영업부 영업차량 2호',
    category: '차량', model: 'K5 3세대 2.0 LPG', department: '본점영업부',
    vehicleNo: '34나 7890', owner: '오세진 사원', location: '본점 지하1F 주차장',
    status: 'D-19 만료', statusTone: 'amber',
    acquireDate: '2022-09-03', price: 26800000, dDay: 19,
    insurance: { company: '현대해상', policyNo: 'HD-2025-23456',
      coverage: '종합 (대인무한·대물 5억·자차)',
      startDate: '2025-06-19', endDate: '2026-06-19',
      annualPremium: 1180000, autoRenew: true },
    history: [
      { date: '2022-09-03', type: '취득', detail: '신규 구입 / 본점영업부 배정' },
      { date: '2024-06-19', type: '갱신', detail: '현대해상 종합 갱신' },
      { date: '2025-06-19', type: '갱신', detail: '현대해상 종합 갱신' }
    ],
    aiNote: '보험 만료까지 19일. 자동 갱신 설정됨. 갱신 예정 보험료 사전 확인 권고.'
  },
  { id: 'AST-2022-0220', name: '본점영업부 임원차량 1호',
    category: '차량', model: '제네시스 G80 3.5', department: '본점영업부',
    vehicleNo: '78라 5678', owner: '윤다은 차장', location: '본점 지하1F 주차장',
    status: 'D-22 만료', statusTone: 'amber',
    acquireDate: '2022-11-20', price: 72500000, dDay: 22,
    insurance: { company: 'DB손해보험', policyNo: 'DB-2025-34567',
      coverage: '종합 (대인무한·대물 10억·자차·자손)',
      startDate: '2025-06-22', endDate: '2026-06-22',
      annualPremium: 2480000, autoRenew: true },
    history: [
      { date: '2022-11-20', type: '취득', detail: '신규 구입 / 본점영업부 임원배정' },
      { date: '2024-06-22', type: '갱신', detail: 'DB손해보험 종합 갱신' },
      { date: '2025-06-22', type: '갱신', detail: 'DB손해보험 종합 갱신' }
    ],
    aiNote: '보험 만료까지 22일. 자동 갱신 설정됨. 임원차량 — 보장 범위 재검토 권고.'
  },
  { id: 'AST-2023-0114', name: '본점영업부 리스차량 1호',
    category: '차량', model: '카니발 KA4 9인승', department: '본점영업부',
    vehicleNo: '90마 3456', owner: '장현우 과장', location: '본점 지하1F 주차장',
    status: 'D-25 만료', statusTone: 'amber',
    acquireDate: '2023-02-08', price: 41800000, dDay: 25,
    insurance: { company: 'KB손해보험', policyNo: 'KB-2025-45678',
      coverage: '종합 (대인무한·대물 5억·자차)',
      startDate: '2025-06-25', endDate: '2026-06-25',
      annualPremium: 1340000, autoRenew: true },
    history: [
      { date: '2023-02-08', type: '취득', detail: '리스 계약 / 본점영업부 배정' },
      { date: '2024-06-25', type: '갱신', detail: 'KB손해보험 종합 갱신' },
      { date: '2025-06-25', type: '갱신', detail: 'KB손해보험 종합 갱신' }
    ],
    aiNote: '보험 만료까지 25일. 자동 갱신 설정됨. 리스 계약 종료일 별도 확인 권고.'
  },
  { id: 'AST-2022-0121', name: '본점영업부 영업차량 4호',
    category: '차량', model: '아반떼 CN7 1.6', department: '본점영업부',
    vehicleNo: '11바 6789', owner: '임수아 사원', location: '본점 지하1F 주차장',
    status: 'D-28 만료', statusTone: 'blue',
    acquireDate: '2022-12-15', price: 21500000, dDay: 28,
    insurance: { company: '메리츠화재', policyNo: 'MR-2025-56789',
      coverage: '종합 (대인무한·대물 3억·자차)',
      startDate: '2025-06-28', endDate: '2026-06-28',
      annualPremium: 980000, autoRenew: true },
    history: [
      { date: '2022-12-15', type: '취득', detail: '신규 구입 / 본점영업부 배정' },
      { date: '2024-06-28', type: '갱신', detail: '메리츠화재 종합 갱신' },
      { date: '2025-06-28', type: '갱신', detail: '메리츠화재 종합 갱신' }
    ],
    aiNote: '보험 만료까지 28일. 자동 갱신 설정됨. 정상 처리 가능.'
  }
];

var AI_AGENT = {
  suggestions: [
    { icon: '🔍', text: '본점영업부 자산 중에 5년 이상 사용한 노후 PC 목록 보여줘' },
    { icon: '🛡', text: '본점영업부에서 보험 만료 예정인 차량 목록 조회해줘' },
    { icon: '🏧', text: 'ATM 장비가 빈번하게 정지 알려줘' },
    { icon: '💰', text: '이번 분기 교체 예산 예상해줘' },
    { icon: '📅', text: '다음달 점검 일정 보여줘' },
    { icon: '📝', text: '노후 장비 현황 보고서 작성해줘' }
  ],
  favorites: [
    { text: '본점 서버실 노후도 점검' },
    { text: '지점별 ATM 장애율 비교' },
    { text: '분기 차량 보험 만기 예측' },
    { text: '감사 대응 점검 가능 자산' }
  ],
  steps: [
    { title: '질의 이해',         sub: '분류·범위·지표 추출' },
    { title: '자산 데이터 조회',   sub: '원장·이력·태그' },
    { title: '위험도 분석',       sub: '노후도·장애율·비용' },
    { title: '정책 적용',         sub: '감가·내용연수·교체기준' },
    { title: '조치안 생성',       sub: '교체·임대·유지 비용 비교' },
    { title: '출력 정리',         sub: '분석·진단·조치안' }
  ],
  scripts: {
    '본점영업부 자산 중에 5년 이상 사용한 노후 PC 목록 보여줘': {
      reply: '본점영업부 PC중에서 5년 이상 사용한 노후 PC 목록을 보여드릴께요',
      thinkingSteps: ['자산 데이터 조회', '정책 기준 검토'],
      resultType: 'pc',
      intro: '본점영업부 운영 PC <b>31대</b> 중 <b>1,247건</b>의 자산 이력과 ITSM <b>1건</b>의 점검 일정을 분석한 결과 다음과 같은 조치가 필요합니다.',
      meta: '평균 사용 <b>5.2년</b> · HDD→SSD 미전환 <b>7대</b> · OS 지원 종료 <b>1대</b>',
      actionText: '일괄 교체 시 → 노후화 <b>30%</b> 해소 / 임대 전환 시 <b>20%</b> 단가 절감 / 단순 점검 추가 항목 가능',
      assets: AI_AGENT_PC_LIST,
      relatedChips: [
        { label: '본점영업부 데스크탑', count: '12대' },
        { label: '본점영업부 노트북',   count: '6대' },
        { label: '본점영업부 모니터',   count: '13대' },
        { label: '강남영업소 PC',       count: '25대' },
        { label: '강남영업소 노트북',   count: '4대' }
      ],
      riskDist: { high: 6, medium: 5, low: 20 },
      cost: { value: '2,160만원', sub: '노후 PC 32대 × 87만원 × 할인 0.7' },
      actions: ['우선 5대 교체 결재 상신', '4대 임대 전환 검토', '점검 일정 자동 등록'],
      buttons: [
        { label: '📑 노후 PC 자산이력 보기', style: 'outline', action: 'history' },
        { label: '🛠 ITSM 조치 등록',        style: 'primary', action: 'itsm' }
      ]
    },
    '본점영업부에서 보험 만료 예정인 차량 목록 조회해줘': {
      reply: '본점영업부 자동차 보험중에서 1개월내 보험 만료 예정인 목록을 조회할께요.',
      thinkingSteps: ['보험 계약 조회', '만기 기준 검토'],
      resultType: 'vehicle',
      intro: '본점영업부 운영 차량 <b>24대</b> 중 향후 1개월 내 보험이 만료되는 차량은 총 <b>6대</b>입니다. 그중 자동 갱신 미설정 <b>2건</b>은 만기 공백 위험이 있어 즉시 조치가 필요합니다.',
      meta: '평균 잔여 <b>14.2일</b> · 자동갱신 미설정 <b>2건</b> · D-7 이내 <b>1건</b>',
      actionText: '6건 일괄 갱신 시 → 보험료 <b>8%</b> 절감 / 개별 갱신은 표준 단가 적용 / D-7 이내 1건은 자동갱신 우선 설정 권고',
      assets: AI_AGENT_VEHICLE_LIST,
      relatedChips: [
        { label: '본점영업부 영업차량', count: '6대' },
        { label: '본점영업부 임원차량', count: '2대' },
        { label: '본점영업부 리스차량', count: '4대' },
        { label: '자동갱신 미설정',     count: '2대' }
      ],
      riskDist: { high: 1, medium: 3, low: 2 },
      cost: { value: '7,500만원', sub: '차량 6대 × 평균 125만원, 일괄 갱신 8% 절감 시 6,900,000원' },
      actions: ['6건 일괄 갱신', '자동갱신 미설정 2건 우선 설정', '견적 3사 비교 후 확정'],
      buttons: [
        { label: '📑 차량 자산이력 보기',  style: 'outline', action: 'history' },
        { label: '📝 보험 갱신 결재 상신', style: 'primary', action: 'approval' }
      ]
    }
  }
};

window.APP_DATA = { assets: buildAssets(), dashboard: DASHBOARD, aiAgent: AI_AGENT };
