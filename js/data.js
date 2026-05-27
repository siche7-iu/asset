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
    { name: "서울", count: "4,218", x: 40, y: 33, active: true,
      detail: [["전체 자산", "4,218개"], ["고위험 자산", "12개 [HIGH]"], ["점검 예정", "37개 (7일 이내 6개)"],
               ["계약 만료 임박", "5개"], ["노후 자산(8년+)", "857개"], ["유지보수 가동률", "97.8%"]] },
    { name: "강원", count: "1,124", x: 73, y: 18,
      detail: [["전체 자산", "1,124개"], ["고위험 자산", "8개 [HIGH]"], ["점검 예정", "14개 (7일 이내 3개)"],
               ["계약 만료 임박", "2개"], ["노후 자산(8년+)", "286개"], ["유지보수 가동률", "96.1%"]] },
    { name: "경상", count: "2,193", x: 79, y: 50,
      detail: [["전체 자산", "2,193개"], ["고위험 자산", "11개 [HIGH]"], ["점검 예정", "29개 (7일 이내 5개)"],
               ["계약 만료 임박", "4개"], ["노후 자산(8년+)", "498개"], ["유지보수 가동률", "98.0%"]] },
    { name: "전라", count: "1,587", x: 32, y: 73,
      detail: [["전체 자산", "1,587개"], ["고위험 자산", "7개 [HIGH]"], ["점검 예정", "21개 (7일 이내 4개)"],
               ["계약 만료 임박", "3개"], ["노후 자산(8년+)", "312개"], ["유지보수 가동률", "97.4%"]] },
    { name: "제주", count: "412", x: 34, y: 92,
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
    { time: "09:12", title: "신규 자산 12건 등록 완료 (영남 지역)",  sub: "자산 분류: 사무용 기기" }
  ],

  // 계약/점검 일정
  schedule: [
    { tag: "MAINTENANCE", date: "5/24 (수)", title: "서울 지역 전력 설비 점검",   sub: "대상: 본사 외 3개 지점" },
    { tag: "CONTRACT",    date: "5/28 (월)", title: "데이터센터 임대 계약 갱신", sub: "협력사: KT 클라우드 서비스" },
    { tag: "MAINTENANCE", date: "6/2 (금)",  title: "영남 지역 네트워크 장비 점검", sub: "대상: 부산 외 2개 지점" }
  ],

  // 자산 노후도 분석
  aging: {
    bars: [
      { label: "신규 (0-3년)", pct: 42, color: "#3B82F6" },
      { label: "보통 (4-7년)", pct: 35, color: "#22D3EE" },
      { label: "노후 (8년+)",  pct: 23, color: "#22C55E" }
    ],
    stats: [["총 노후 자산", "2,068개"], ["분기 교체 권고", "42개"], ["예상 교체 비용", "38.2억원"]]
  }
};

window.APP_DATA = { assets: buildAssets(), dashboard: DASHBOARD };
