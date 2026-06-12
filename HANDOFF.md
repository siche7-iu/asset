# HANDOFF.md — 현재 상태 인수인계

> 이 문서는 "지금까지 무엇을 했고, 어디까지 동작하며, 어떻게 이어서 작업하는지"를 정리한 것입니다.
> 다음에 할 일은 [TODO.md](TODO.md), 디자인 규칙은 [DESIGN.md](DESIGN.md), 프로젝트 안내는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

최종 업데이트: **2026-06-12 (AI Agent 확장 설계 완료 — Phase 5~7 구현 대기 중)**

---

## 1. 한 줄 요약
**고정자산관리시스템(NH 고정자산관리)의 시연용 웹 프로토타입.** `index.html`을 더블클릭하면 브라우저에서 바로 열립니다.
**외부 서버 없이 100% 로컬 데이터**로만 동작합니다 (Supabase 제거 완료).
배포 주소: **https://블루비-asset.vercel.app** (GitHub push 시 자동 배포)

---

## 2. 지금 동작하는 것 (완료)

### 기본 인프라
- ✅ **순수 HTML + CSS + JS** — 외부 라이브러리·서버 없이 더블클릭만으로 실행
- ✅ **로컬 데이터 전용** (`js/data.js`): Supabase 완전 제거. 자산 샘플 데이터 로컬에만 존재. 외부 네트워크 의존 없음.
- ✅ **Chart.js 4.4.9 + Plotly.js basic 2.35.2** 로컬 파일로 도입 (`js/lib/`). 인터넷 없이도 차트 동작.
- ✅ **사이트 진입 인증 팝업** — 데스크탑 첫 접속 시 "관리자 인증" 팝업 → 비밀번호 입력 → 대시보드. `v0.9.3 · NH Demo Build` 클릭 시 팝업 없이 프로젝트 관리로 직행.
- ✅ **GitHub 백업**: `siche7-iu/asset` 저장소 `main` 브랜치. push 시 Vercel 자동 배포.
- ✅ **Playwright 자동 테스트** (`npm test`): 대시보드·목록·상세 스크린샷 + 기본 동작 + AI Agent + 프로젝트 화면 등 총 9건.

### 화면 (전체)

| 화면 | URL | 상태 |
|------|-----|------|
| 대시보드 | `#/dashboard` | ✅ 완성 |
| AI Agent | `#/ai-agent` | ✅ 완성 |
| 보고서 | `#/report` | ✅ 시나리오2 완성 |
| 자산 목록 | `#/list` | ✅ 완성 |
| 자산 상세 | `#/detail/AST-…` | ✅ 완성 |
| 프로젝트 관리 | 비밀번호 입력 후 진입 | ✅ 완성 |
| 준비 중 | `#/soon` | ✅ 안내 화면 |
| **As-is → To-be** (11개 서브화면) | `#/asis-*` | ✅ 완성 |
| **AI Agent 예상안** (9개 서브화면) | `#/aiph-*` | ✅ 완성 |

#### 대시보드 (`#/dashboard`)
- KPI 6칸(게이지·카운터·hover 효과) + AI 인사이트 배너(shimmer)
  - KPI 게이지 2개(유지보수 가동률·감가상각률): SVG ↔ Chart.js 토글 스위치
- 노후 위험도 도넛: SVG ↔ Chart.js 토글 스위치 (Chart.js 버전: afterDraw 센터 텍스트 + 커스텀 툴팁)
- 내용연수 도래 자산 타임라인 / 자산 노후도 분석
- 지역별 관리 현황 지도: SVG 이미지 지도 ↔ Leaflet 폴리곤 지도 토글
  - Leaflet: 6개 권역 merged 레이어(zoom<9) + 228개 시군구 상세(zoom≥9), 핀 마커 배지, 인터랙션(줌/홈/축척바)
- 위험 자산 TOP5 / 최근 이슈 / 계약·점검 일정
- 진입 애니메이션 매번 재생 / FAB 버튼(ai_insight.svg)

#### AI Agent (`#/ai-agent`)
- 3열 레이아웃(추천질문·채팅·분석 패널) — 각 패널 내부 스크롤
- 퍼지 매칭으로 오타·띄어쓰기 허용 / 분석 단계 스피너 / 보고서 작성 버튼
- 입력창 클릭 시 한 세션 1회 자동 타이핑·전송

#### As-is → To-be (11개 서브화면, 사이드바 아코디언)

| 서브화면 | view ID | 내용 |
|---------|---------|------|
| GIS 현황 | `asis-gis` | Leaflet 마커 25개 + 범례 + 탭 |
| 생애주기 모니터링 | `asis-lifecycle` | KPI4 + 아크 게이지 4개 + stacked bar |
| 통계 분석 리포트 | `asis-report` | 도넛 + 수평 막대 + 자산대금 원장 |
| 차량 관리 | `asis-vehicle` | KPI4 + 필터 바 + 테이블 |
| 자산 취득 | `asis-acquire` | KPI3 + 5단계 스텝 + 테이블 |
| 자산 폐기 | `asis-closing` | 상태 카드 + 도넛 차트 |
| 건물 생애주기 | `asis-prop-lifecycle` | 그룹 접기/펼치기 |
| 건물 운영 관리 | `asis-prop-operation` | 탭 + 월별 관리비 라인 차트 |
| 임대정보 관리 | `asis-prop-lease` | 탭 필터 |
| 데이터 추출 | `asis-prop-extract` | 체크박스 동적 컬럼 |
| 계약 관리 | `asis-prop-contract` | D-day 배지 + KPI4 |

#### AI Agent 예상안 (9개 서브화면, 사이드바 아코디언)

**사용자 레이어 (4개)**

| 서브화면 | view ID | 핵심 내용 |
|---------|---------|----------|
| AI Copilot | `aiph-copilot` | 3열 레이아웃 · 추론 Trace · 신뢰도 배지 · 멀티에이전트 진행표시 · 추천질문 6개 mock 답변 |
| 이상탐지 보드 | `aiph-anomaly` | KPI4 · 탐지 카드 그리드 · Chart.js 바 차트 · 탐지 이력 |
| AI 결재함 | `aiph-approval` | KPI4 · 결재 대기 6행 · 우측 상세 패널(클릭 토글) · AI 분석 근거 · 승인/반려 |
| 자동 리포트 | `aiph-report` | KPI4 · Chart.js 월별 발송 바 차트 · 스케줄 설정 · 발송 이력 |

**관리 레이어 (5개)**

| 서브화면 | view ID | 핵심 내용 |
|---------|---------|----------|
| 모니터링 | `aiph-monitor` | 6축 운영 현황 · KPI4 · Chart.js 2개(질의량·응답시간) · 세션 상세 패널 · 가드레일 현황 |
| 에이전트 빌더 | `aiph-builder` | 활성 에이전트 카드 4개 · 블록 팔레트 · SVG 플로우 다이어그램 · 노드 클릭 속성 패널 |
| 지식베이스 | `aiph-kb` | 문서 10건 · 카테고리 탭 필터 · 실시간 검색 · RAG 임베딩 현황 |
| 평가·품질 | `aiph-eval` | Chart.js 레이더 차트(3에이전트·5축) · 에이전트 성적표 · 테스트 케이스 이력 |
| 거버넌스 | `aiph-governance` | 역할·권한 매트릭스(3역할×10기능) · 가드레일 정책 5건 · 감사 로그 |

#### 프로젝트 관리 (비밀 버튼 `v0.9.3 · NH Demo Build` → 비밀번호 입력)
- 비밀번호: SHA-256 해시 처리 완료 (로컬 메모리에만 원문 보관)
- 사이드바가 프로젝트 트리 네비게이터로 전환
- 섹션: 개요·추진일정 / RFP·제안서·As-Is / 화면 디자인 갤러리 / AI 에이전트 분석 / 플로우 차트 7종 / **질의·인터뷰** / 계획·산출물 / **개발사 정보(천명소프트)**
- **화면 디자인 갤러리**: 14장 이미지(비밀번호 인증 후에만 src 주입)
- **AI 에이전트 분석**: 우리은행 제안 3계층(AI서비스플랫폼·Multi Agent FW·LLM Ops) 47장 카드 + 설명 ⚠️ *우리은행 타 사업 제안 자료 — NH 고정자산관리에 직접 적용 불가, 방법론·참고 용도만*
- **플로우 차트**: 7종 SVG 플로우차트(max-width 1500px, 세로 75vh 이하 제한). 제안서(`제안서_Asis_정리.md`) 기준으로 전수 검수 완료 — fc-api(부동산 기준 수정), fc-budget(환수 단계 추가), fc-lifecycle(이동·수선 명시), fc-approval·fc-contract·fc-aiagent(sub 문구 정확화).
- **질의·인터뷰**: 1차 기술 질의 QnA MD 뷰어 + 현업 요건정의 인터뷰 질의서(v1.0) 파트 카드 10개
- **요구사항 정의**: 50건 요구사항(NH-XXX-NNN 체계), 통계 카드(8종)·카테고리 탭(10개)·우선순위·오픈단계 필터·9열 테이블·CSV 다운로드·행 편집 기능. MD 전체 뷰어(출처 구조화 표시, § 제거)

---

## 3. 파일 구조

```
index.html                    화면 전체 (대시보드·AI Agent·목록·상세·프로젝트 관리 등)
css/style.css                 디자인 (맨 위 :root 토큰 = DESIGN.md 규칙)
js/data.js                    샘플 자산 데이터 + 대시보드 요약 수치 (단일 데이터 소스)
js/app.js                     화면 동작 전부 (라우팅·대시보드·AI Agent·보고서·팝업·프로젝트관리)
js/lib/                       Chart.js 4.4.9 + Plotly.js basic 2.35.2 로컬 번들
js/screens/                   화면별 분리 모듈 (lazy-init, window.renderXXX 패턴)
  asis-a.js                   GIS현황·생애주기모니터링·통계분석리포트
  asis-b.js                   차량관리·자산취득·자산폐기
  asis-c.js                   건물생애주기·건물운영관리·임대정보관리
  asis-d.js                   데이터추출·계약관리
  aiph-copilot.js             AI Copilot (3열·추론Trace·멀티에이전트)
  aiph-anomaly.js             이상탐지 보드
  aiph-approval.js            AI 결재함 (상세 패널 토글)
  aiph-report.js              자동 리포트 (Chart.js 바 차트)
  aiph-monitor.js             모니터링 (6축 도식·세션 상세)
  aiph-builder.js             에이전트 빌더 (SVG 플로우 다이어그램)
  aiph-kb.js                  지식베이스 (RAG 임베딩 현황)
  aiph-eval.js                평가·품질 (Chart.js 레이더 차트)
  aiph-governance.js          거버넌스 (역할 매트릭스·가드레일·감사 로그)
images/                       SVG 아이콘 + 프로젝트 관리용 이미지
  proj-screens/               To-Be 화면 디자인 14장 (비밀번호 인증 후에만 src 주입)
  ai-agent/                   AI 에이전트 분석 이미지 47장
요건정의_인터뷰질의서.md        현업 요건정의 인터뷰 질의서 v1.0 (P0~P10 + 부록 A·B·C)
요구사항_상세정의.md            요구사항 50건 상세 정의 (NH-XXX-NNN 체계, v0.1)
QnA_1차질의_정리.md             1차 기술질의 QnA 결과 (Q1~Q5, "보고서 180개" 출처)
시연_자막.txt                  시연 진행용 자막 스크립트
CLAUDE.md                     프로젝트 안내 + 전체 작업 로그
DESIGN.md                     디자인 시스템 규칙 (Figma 실측값 반영)
FIGMA_SYNC_PLAN.md            Figma 원본 vs 현재 구현 차이 + 단계별 수정 계획
HANDOFF.md                    이 문서
TODO.md                       다음에 할 일
AI_AGENT_설계초안.md           NH 고정자산 AI Agent 관리 콘솔 설계 초안 v1.0 (9개 화면)
AI_AGENT_확장설계.md           AI Agent 확장 설계 v1.0 — Phase 5~7 신규 5개 화면 + 기존 3개 강화 설계
AI_AGENT_제안분析.md           우리은행 AI에이전트 제안 3계층 분석 ⚠️ 참고 용도만
제안서_Asis_정리.md            RFP·제안서(57p)·As-Is 화면 21장 정리
플로우차트_학습정리.md          플로우차트 17유형 학습 및 작도 후보 정리
HASHGEN.md                    비밀번호 해시 생성 방법 안내
ADAPTIVE_DESIGN.md            반응형 vs 적응형 설계 분석 및 모바일 구현 기록
tests/                        Playwright 테스트 스크립트
backup/                       주요 시점 백업
```

---

## 4. 실행 방법

```
index.html 더블클릭  → 브라우저에서 바로 열림
```
- "관리자 인증" 팝업이 뜨면 비밀번호 입력 → 대시보드 진입.
- `js/data.js`의 로컬 샘플 데이터만 사용합니다 (인터넷 불필요).
- 코드 수정 후 브라우저 **새로고침(F5)** 하면 반영됩니다.
- `git push` 하면 Vercel이 자동으로 https://블루비-asset.vercel.app 에 배포합니다.

---

## 5. 디자인 출처 & 주의사항
- Figma 시안: NH고정자산관리 (`node 209:2622`)
- **Figma 동기화 상태**: `FIGMA_SYNC_PLAN.md` 참고. Phase 1 완료. Phase 2~5 미완료.

---

## 6. 이어서 작업하려면

### 다음 세션 바로 시작하는 법
1. `index.html`을 브라우저로 열어 현재 모습 확인.
2. [TODO.md](TODO.md)에서 "Phase 5~7" 항목을 고른다. **Phase 5가 최우선.**
3. 작업 완료 후 `CLAUDE.md` 맨 아래 "작업 로그"에 한 줄 기록하고, 이 문서의 "최종 업데이트" 날짜를 갱신한다.

### AI Agent 확장 구현 — 다음 작업 순서

> 설계 문서: `AI_AGENT_확장설계.md`  
> 각 Phase는 한 세션에서 완성 가능 (약 1~1.5시간).

| Phase | 내용 | 예상 시간 | 파일 |
|-------|------|---------|------|
| **Phase 5** | ① 이상탐지 보드 강화 (5→10 카테고리) | 약 1시간 | `aiph-anomaly.js` 수정 |
| **Phase 5** | ② 자동 리포트 강화 (4→8 유형) | | `aiph-report.js` 수정 |
| **Phase 5** | ③ AI 예산 어시스턴트 신규 구현 | | `aiph-budget.js` 신규 |
| **Phase 6** | ④ AI 결산·감사 지원 신규 구현 | 약 1~1.5시간 | `aiph-closing.js` 신규 |
| **Phase 6** | ⑤ AI 계약·리스 관리 신규 구현 | | `aiph-contract.js` 신규 |
| **Phase 7** | ⑥ AI 재물조사 분석 신규 구현 | 약 1시간 | `aiph-rfid.js` 신규 |
| **Phase 7** | ⑦ AI 세무 검증 신규 구현 | | `aiph-tax.js` 신규 |
| **Phase 7** | ⑧ 에이전트 빌더 플로우 확장 (5→12개) | | `aiph-builder.js` 수정 |

**공통 작업 패턴** (매 Phase마다 동일):
- `js/screens/aiph-*.js` 신규 파일 작성 (`window.renderAiphXXX` 정의)
- `index.html` — 사이드바 메뉴 버튼 + `<section id="view-aiph-*">` 컨테이너 + `<script>` 태그 추가
- `js/app.js` — `sectionIds` 배열 + `_aiphMap` 객체에 항목 추가

---

## 7. 완료된 작업 — AI Agent 예상안 전체 + As-is→To-be (2026-06-12 완료)

### AI Agent 예상안 9개 화면 구현 완료

| Phase | 화면 | 파일 | 주요 컴포넌트 |
|-------|------|------|-------------|
| 1 | AI Copilot | `aiph-copilot.js` | 3열 레이아웃·추론 Trace·신뢰도 배지·멀티에이전트 진행표시 |
| 1 | 이상탐지 보드 | `aiph-anomaly.js` | KPI4·카테고리 탭·탐지 카드 그리드·Chart.js 바 차트 |
| 1 | 모니터링 | `aiph-monitor.js` | 6축 운영 도식·Chart.js 2개·세션 상세 패널·가드레일 현황 |
| 2 | AI 결재함 | `aiph-approval.js` | 결재 대기 6행·우측 상세 패널(클릭 토글)·AI 분석 근거·승인/반려 |
| 2 | 에이전트 빌더 | `aiph-builder.js` | 활성 에이전트 카드·블록 팔레트·SVG 플로우 다이어그램·노드 속성 패널 |
| 3 | 자동 리포트 | `aiph-report.js` | Chart.js 월별 바 차트·유형별 카드·스케줄 설정·발송 이력 |
| 3 | 지식베이스 | `aiph-kb.js` | 카테고리 탭 필터·실시간 검색·문서 10건·RAG 임베딩 현황 |
| 4 | 평가·품질 | `aiph-eval.js` | Chart.js 레이더 차트(3에이전트·5축)·성적표·테스트 케이스 이력 |
| 4 | 거버넌스 | `aiph-governance.js` | 역할·권한 매트릭스(3×10)·역할 카드·가드레일 정책·감사 로그 |

**공통 아키텍처 패턴**
- 각 화면은 `js/screens/aiph-*.js` 독립 파일로 분리
- `window.renderAiphXXX` 전역 함수 정의
- `data-rendered` 플래그로 lazy-init (첫 진입 시 1회만 실행)
- `Chart.getChart(canvas)` → destroy → 재생성 패턴으로 재진입 안전
- 공통 CSS: `.asis-page`, `.asis-kpi-row`, `.asis-kpi-card.accent-*`, `.asis-panel`, `.asis-table`, `.asis-tabs`

### As-is → To-be 11개 화면 구현 완료

`js/screens/asis-a~d.js` 4개 파일, 총 11개 서브화면. 각 화면은 실제 NH 업무 도메인 기반 mock 데이터와 Chart.js 차트 포함.

---

## 8. 완료된 작업 — Leaflet 지도 + Chart.js 토글 (2026-06-11 완료)

### Leaflet 지도 최종 상태: ✅ 완료

| 기능 | 상태 |
|------|------|
| 228개 시군구 TopoJSON 폴리곤 렌더링 | ✅ |
| 6개 권역 merged 레이어 (zoom<9 깔끔한 뷰) | ✅ |
| zoom≥9 시군구 상세 레이어 전환 | ✅ |
| 권역 핀 마커 배지 (항상 표시) + hover 툴팁 | ✅ |
| 스크롤/드래그 줌, +/- 버튼, 홈 버튼, 거리 축척 바 | ✅ |
| zoom 단계별 경계선 두께 (없음/일반/두꺼움) | ✅ |
| 지도 배경(바다) 흰색 | ✅ |
| SVG 이미지 지도 ↔ Leaflet 토글 스위치 | ✅ |

**핵심 버그 원인 기록** (재발 방지용):
- `css/style.css` 전역 규칙 `.map-box svg { height: auto }` → Leaflet SVG에도 적용 → 0×0으로 클리핑
- 수정: `.map-box:not(.leaflet-container) svg` + `unset` 보정 규칙
- 폴리곤 단편화(조각 유리): 228개 폴리곤 독립 단순화 시 공유 경계 어긋남 → `topojson.merge()` 6-region 레이어로 해결

### Chart.js 토글 최종 상태: ✅ 완료

| 기능 | 상태 |
|------|------|
| KPI 게이지 SVG ↔ Chart.js 토글 (유지보수 가동률·감가상각률) | ✅ |
| 노후 위험도 분포 도넛 SVG ↔ Chart.js 토글 | ✅ |
| Chart.js 도넛 센터 텍스트 (afterDraw 플러그인) | ✅ |
| Chart.js 도넛 커스텀 hover 툴팁 (showTip 재사용) | ✅ |

**다음 단계**: 이미지 버전 검증 후 토글 제거, Chart.js 단일 버전으로 정리 예정

### 관련 파일
- `js/app.js` — `_initLeafletMap()`, `renderMap()`, `renderKpis()`, `renderRiskDonut()`, `centerTextPlugin`
- `css/style.css` — Leaflet 전용 규칙, 토글 스위치 스타일, KPI/리스크 Chart.js 캔버스 스타일
- `index.html` — 지도 토글, KPI 토글, 노후 위험도 토글 마크업
- `js/lib/leaflet/`, `js/lib/topojson-client.min.js`, `js/lib/municipalities-topo.js`

