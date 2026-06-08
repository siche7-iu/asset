# HANDOFF.md — 현재 상태 인수인계

> 이 문서는 "지금까지 무엇을 했고, 어디까지 동작하며, 어떻게 이어서 작업하는지"를 정리한 것입니다.
> 다음에 할 일은 [TODO.md](TODO.md), 디자인 규칙은 [DESIGN.md](DESIGN.md), 프로젝트 안내는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

최종 업데이트: **2026-06-08 (요구사항 정의 섹션 신설 + 출처 표시 전면 개선)**

---

## 1. 한 줄 요약
**고정자산관리시스템(NH 고정자산관리)의 시연용 웹 프로토타입.** `index.html`을 더블클릭하면 브라우저에서 바로 열립니다.
인터넷이 있으면 **Supabase DB**에서 자산 데이터를 읽고, 오프라인이면 로컬 샘플 데이터로 자동 전환됩니다.
배포 주소: **https://블루비-asset.vercel.app** (GitHub push 시 자동 배포)

---

## 2. 지금 동작하는 것 (완료)

### 기본 인프라
- ✅ **순수 HTML + CSS + JS** — 외부 라이브러리·서버 없이 더블클릭만으로 실행
- ✅ **Supabase DB 연동** (`js/db.js`): 자산 **71건** + 이력 **190건**이 Supabase에 저장됨. 앱 시작 시 DB에서 읽어오고, 실패 시 로컬 샘플 데이터로 자동 폴백.
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
- 섹션: 개요·추진일정 / RFP·제안서·As-Is / 화면 디자인 갤러리 / AI 에이전트 분석 / 플로우 차트 7종 / **질의·인터뷰** / 계획·산출물
- **화면 디자인 갤러리**: 14장 이미지(비밀번호 인증 후에만 src 주입)
- **AI 에이전트 분석**: 우리은행 제안 3계층(AI서비스플랫폼·Multi Agent FW·LLM Ops) 47장 카드 + 설명
- **플로우 차트**: 7종 SVG 플로우차트(max-width 1500px, 세로 75vh 이하 제한)
- **질의·인터뷰**: 1차 기술 질의 QnA MD 뷰어 + 현업 요건정의 인터뷰 질의서(v1.0) 파트 카드 10개
- **요구사항 정의**: 50건 요구사항(NH-XXX-NNN 체계), 통계 카드(8종)·카테고리 탭(10개)·우선순위·오픈단계 필터·9열 테이블·CSV 다운로드·행 편집 기능. MD 전체 뷰어(출처 구조화 표시, § 제거)

---

## 3. 파일 구조

```
index.html                    화면 전체 (대시보드·AI Agent·목록·상세·프로젝트 관리 등)
css/style.css                 디자인 (맨 위 :root 토큰 = DESIGN.md 규칙)
js/data.js                    샘플 자산 데이터 + 대시보드 요약 수치 — 오프라인 폴백용
js/db.js                      Supabase 연결 모듈 (loadAssets / insertAsset)
js/app.js                     화면 동작 전부 (라우팅·대시보드·AI Agent·보고서·팝업·프로젝트관리)
supabase/schema.sql           Supabase 테이블 생성 SQL (1회 실행 완료)
supabase/seed.html            샘플 데이터 71건 삽입 도구 (1회 실행 완료)
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
- 인터넷이 있으면 Supabase DB에서 자산 데이터를 읽어옵니다. 🟢 토스트로 확인.
- 오프라인이면 `js/data.js`의 로컬 샘플 데이터를 자동으로 사용합니다. 🟡 토스트 표시.
- 코드 수정 후 브라우저 **새로고침(F5)** 하면 반영됩니다.
- `git push` 하면 Vercel이 자동으로 https://블루비-asset.vercel.app 에 배포합니다.

### Supabase 정보
- **프로젝트 URL**: `https://znlcgszxhrbxkhggqbry.supabase.co`
- **테이블**: `assets` (71건) / `asset_history` (190건)
- **비밀번호·API 키**: Claude 메모리(`reference-credentials.md`)에 저장됨 (git 비포함)

---

## 5. 디자인 출처 & 주의사항
- Figma 시안: NH고정자산관리 (`node 209:2622`)
- **Figma 동기화 상태**: `FIGMA_SYNC_PLAN.md` 참고. Phase 1 완료. Phase 2~5 미완료.

---

## 6. 이어서 작업하려면
1. `index.html`을 브라우저로 열어 현재 모습 확인.
2. [TODO.md](TODO.md)에서 다음 작업을 고른다.
3. 작업 완료 후 `CLAUDE.md` 맨 아래 "작업 로그"에 한 줄 기록하고, 이 문서의 "최종 업데이트" 날짜를 갱신한다.

