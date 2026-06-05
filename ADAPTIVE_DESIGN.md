# ADAPTIVE_DESIGN.md — 적응형 디자인 설계 기록

> 작성일: 2026-06-05 | 관련 파일: `index.html`, `css/style.css`, `js/app.js`

---

## 1. 반응형 전환 가능 여부 분석 결과

이 앱은 **데스크탑 전용 "꽉 채우는" 설계**로 만들어져 있습니다.

- 레이아웃 전체가 `height: 100vh; overflow: hidden` 구조 (픽셀 단위로 화면을 꽉 채움)
- 사이드바 고정 220px, 높이 계산식이 `calc(100vh - 20px)` 같은 하드코딩 수십 군데
- 대시보드 `dash-grid`, KPI 6칸, 지도 말풍선 절대 위치 등 "데스크탑 1440px 전제"로 설계됨
- AI Agent 3열 레이아웃도 좁은 화면에서는 거의 재설계 필요

기존에 미디어쿼리 일부 존재하지만(`max-width: 1400 / 1200 / 900px`), 본격 반응형이 아닌 KPI 열 수 조정 수준.

### 좁아질 때 문제가 생기는 부분

| 영역 | 문제 |
|---|---|
| 사이드바 | 220px 고정 → 좁은 화면에서 콘텐츠 공간 잠식. 오버레이 방식으로 전환 필요 |
| 대시보드 레이아웃 | 3열 그리드 + KPI 6칸 + 고정 row span이 겹쳐 작은 화면에서 깨짐 |
| 지역 지도 말풍선 | 절대위치 말풍선이 화면 밖으로 밀려남 |
| AI Agent 3열 | 좁은 화면에서 추천질문/채팅/결과가 한 줄이 되어 사용 불가 |
| 인트로 텍스트 | `174px` 고정 폰트 → 모바일에서 화면을 넘어감 |
| 헤더 탭 | 탭 3개 + 버튼들이 좁은 화면에서 잘림 |

### 반응형 작업량 수준

| 수준 | 범위 | 예상 작업 | 상태 |
|------|------|-----------|------|
| 1 — 노트북 소형 (1280px~) | KPI·간격 미세 조정 | 1~2회 | 이미 거의 됨 |
| 2 — 태블릿 (768~1024px) | 사이드바 오버레이, 레이아웃 재배열 | 5~7회 | 기존 CSS 광범위하게 수정 필요 |
| 3 — 모바일 (~768px) 완전 반응형 | 전체 재설계 | 15+회 | 사실상 모바일 버전 신규 작성 수준 |

---

## 2. 적응형(Adaptive) 설계 선택 이유

| 구분 | 반응형(Responsive) | 적응형(Adaptive) — 채택 |
|------|---------------------|------------------|
| 방식 | 같은 HTML을 화면 폭에 따라 CSS로 유동적으로 변형 | 기기 감지 후 각 기기에 최적화된 별도 레이아웃 제공 |
| 작업량 | 매우 큼 (전체 재설계 필요) | 모바일 전용 레이어 추가만으로 가능 |
| 이 프로젝트 | 기존 vh 기반 고정 레이아웃 — 부적합 | 모바일 감지 후 별도 레이아웃으로 전환 |
| 위험도 | 기존 데스크탑 시연 품질 저하 가능성 높음 | 데스크탑 완전 무영향, 모바일만 별도 처리 |

---

## 3. 구현 전략

### 브레이크포인트
- **767px 이하**: 모바일 (iPhone, Android 스마트폰)
- **768px 이상**: 데스크탑 (현재 레이아웃 그대로)

### 기기 감지 방법
```html
<!-- index.html <body> 시작 직후 인라인 스크립트 -->
<script>if(window.innerWidth<=767)document.body.classList.add('is-mobile');</script>
```
- 페이지 렌더 전에 실행 → 화면 깜빡임(flash) 없음
- JS 로드 시 1회만 판단 (리사이즈 시 재판단 없음 — 프로토타입 특성상 적합)

### 모바일 전용 사용 시나리오

모바일 기기의 용도는 **"프로젝트 관리 화면"만** 접근하는 것:

```
① 모바일로 사이트 접속
        ↓
② 전체화면 관리자 인증 화면 표시
   (기존 데스크탑의 "v0.9.3" 비밀버튼 클릭 팝업이 첫 화면)
        ↓
③ 비밀번호 입력 성공
        ↓
④ 프로젝트 관리 화면 표시
   - 상단: 남색 상단 바 (햄버거 아이콘 + "🔒 프로젝트 관리" + 나가기)
   - 본문: #view-project 스크롤
   - 나머지 뷰(대시보드·목록 등)는 숨김
        ↓
⑤ 햄버거 버튼 클릭 → 사이드바가 왼쪽에서 슬라이드 드로어로 등장
   - 프로젝트 트리 네비(개요/분석자료/플로우차트/계획/산출물) 표시
   - 항목 클릭 → 해당 섹션으로 스크롤 + 드로어 자동 닫힘
   - 드로어 바깥 클릭 → 닫힘
```

---

## 4. 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `index.html` | ① `<body>` 시작 인라인 모바일 감지 스크립트 추가 |
| | ② `#mobile-auth-screen` (전체화면 인증 UI) 추가 |
| | ③ `#mobile-topbar` (모바일 상단 바) 추가 |
| | ④ `#m-drawer-overlay` (드로어 배경 어둠) 추가 |
| `css/style.css` | 하단에 `body.is-mobile` 기반 모바일 전용 CSS 섹션 추가 |
| `js/app.js` | 모바일 감지 + 인증 + 드로어 토글 JS 추가 (async IIFE 내부) |

---

## 5. 핵심 CSS 설계 원칙

- `body.is-mobile`이 없으면 → 모바일 CSS 전혀 적용 안 됨 (데스크탑 완전 보호)
- `body.is-mobile`이 있고 `m-authed` 없으면 → 인증 화면만 표시
- `body.is-mobile.m-authed`이면 → 프로젝트 관리 화면 표시

```css
/* 데스크탑: 모바일 요소 숨김 */
#mobile-auth-screen, .mobile-topbar, .m-drawer-overlay { display: none; }

/* 모바일 미인증: 레이아웃 숨김, 인증 화면 표시 */
body.is-mobile .layout            { display: none !important; }
body.is-mobile #mobile-auth-screen { display: flex; }

/* 모바일 인증 후 */
body.is-mobile.m-authed .layout           { display: flex !important; /* 재구성 */ }
body.is-mobile.m-authed #mobile-auth-screen { display: none; }
body.is-mobile.m-authed .mobile-topbar    { display: flex; }
body.is-mobile.m-authed .sidebar          { position: fixed; left: -240px; /* 드로어 */ }
body.is-mobile.m-authed .sidebar.drawer-open { left: 0; }
```
