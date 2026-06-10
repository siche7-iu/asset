# HANDOFF.md — 현재 상태 인수인계

> 이 문서는 "지금까지 무엇을 했고, 어디까지 동작하며, 어떻게 이어서 작업하는지"를 정리한 것입니다.
> 다음에 할 일은 [TODO.md](TODO.md), 디자인 규칙은 [DESIGN.md](DESIGN.md), 프로젝트 안내는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

최종 업데이트: **2026-06-10 (Leaflet 지도 구현 진행 중 — Stage 2까지 작업, 내일 계속)**

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

### 화면 (7개)

| 화면 | URL | 상태 |
|------|-----|------|
| 대시보드 | `#/dashboard` | ✅ 완성 |
| AI Agent | `#/ai-agent` | ✅ 완성 |
| 보고서 | `#/report` | ✅ 시나리오2 완성 |
| 자산 목록 | `#/list` | ✅ 완성 |
| 자산 상세 | `#/detail/AST-…` | ✅ 완성 |
| 프로젝트 관리 | 비밀번호 입력 후 진입 | ✅ 완성 |
| 준비 중 | `#/soon` | ✅ 안내 화면 |

#### 대시보드 (`#/dashboard`)
- KPI 6칸(게이지·카운터·hover 효과) + AI 인사이트 배너(shimmer)
- 노후 위험도 도넛 / 내용연수 도래 자산 타임라인 / 지역별 관리 현황 지도
- 위험 자산 TOP5 / 최근 이슈 / 계약·점검 일정 / 자산 노후도 분석
- 진입 애니메이션 매번 재생 / FAB 버튼(ai_insight.svg)

#### AI Agent (`#/ai-agent`)
- 3열 레이아웃(추천질문·채팅·분석 패널) — 각 패널 내부 스크롤
- 퍼지 매칭으로 오타·띄어쓰기 허용 / 분석 단계 스피너 / 보고서 작성 버튼
- 입력창 클릭 시 한 세션 1회 자동 타이핑·전송

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
AI_AGENT_제안분석.md           우리은행 AI에이전트 제안 3계층 분석
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
1. `index.html`을 브라우저로 열어 현재 모습 확인.
2. [TODO.md](TODO.md)에서 다음 작업을 고른다.
3. 작업 완료 후 `CLAUDE.md` 맨 아래 "작업 로그"에 한 줄 기록하고, 이 문서의 "최종 업데이트" 날짜를 갱신한다.

---

## 7. 진행 중인 작업 — Leaflet 지도 (2026-06-10, 내일 계속)

### 현재 상태
- **Stage 1 완료**: Leaflet 1.9.4 + topojson-client 3 + municipalities-topo.js 로컬 저장 (`js/lib/`)
- **Stage 2 진행 중**: renderMap() 구현 완료, Leaflet 초기화까지 도달. 지도 색상이 렌더링되기 시작했으나 완전하지 않음.
- **수정된 버그 3건**:
  1. CSS 선택자 `.map-box .leaflet-container` → `.map-box.leaflet-container` (공백 제거)
  2. `.dr-map-card .map-box`의 `height: auto` 제거
  3. `height: 100% !important`가 Leaflet 초기화 시 0으로 해석되는 타이밍 버그 → CSS에서 제거, `setView` 추가, `invalidateSize` 딜레이 400ms + `requestAnimationFrame` 적용

### 버그 3번 — 왜 지도가 안 보였는가 (상세 원인)

Leaflet이 초기화됐는데도 지도가 흰 화면으로 보인 이유:

1. `renderMap()`이 `.map-box`에 inline 스타일 `width: 270px; height: 270px` 설정
2. `L.map(mapEl)` 호출 → Leaflet이 즉시 `.map-box`에 `.leaflet-container` 클래스 추가
3. **이 순간** CSS 규칙 `.map-box.leaflet-container { height: 100% !important }` 발동
4. 브라우저가 `height: 100%`를 계산할 때 부모 `.dr-map-card`의 높이가 flex 레이아웃 계산 중 → **0으로 해석**
5. Leaflet이 `clientHeight = 0`을 읽어 **내부 pane을 0×0으로 생성**
6. GeoJSON 폴리곤들이 0×0짜리 SVG 안에 그려지고, SVG 자체가 컨테이너 완전 바깥(`x: 992, y: 445`)에 위치
7. `.map-box`의 `overflow: hidden`이 바깥 영역을 잘라냄 → 아무것도 안 보임

> Leaflet은 정상 동작했지만, 그림을 그린 캔버스 자체가 보이지 않는 곳에 있었던 것.
> 200ms 후 `invalidateSize()` 호출도 SVG 좌표 계산이 0×0 기준으로 이미 꼬여 있어서 재배치 위치도 틀렸음.

**수정 방향**: `height: 100% !important` 제거(CSS 간섭 차단) + `setView` 추가(초기 좌표계 명시) + 딜레이 400ms+rAF(레이아웃 확정 후 재계산)

### 내일 해야 할 것 (Stage 2 마무리 → Stage 3)
- 지도가 올바르게 렌더링되는지 확인 (한국 지형 + 5개 권역 파란색 구분)
- 안 되면 추가 디버깅 (Playwright로 SVG path 좌표 확인)
- Stage 3: hover 툴팁 연동 + 권역별 자산 수 실제 데이터 반영

### 관련 파일
- `js/app.js` — `renderMap()` 함수 (675~787줄)
- `css/style.css` — `.dr-map-card .map-box` (1575줄), `.map-box.leaflet-container` (2790줄)
- `js/lib/leaflet/` — leaflet.js, leaflet.css
- `js/lib/topojson-client.min.js`
- `js/lib/municipalities-topo.js` — `window.MUNICIPALITIES_TOPO` (KOSTAT 2012, 228개 시군구)

