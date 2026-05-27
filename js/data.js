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

window.APP_DATA = { assets: buildAssets() };
