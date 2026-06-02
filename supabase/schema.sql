-- =====================================================
-- NH 고정자산관리 시스템 — Supabase 테이블 생성 스크립트
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- =====================================================

-- 1. 자산 테이블
CREATE TABLE IF NOT EXISTS assets (
  id           TEXT        PRIMARY KEY,           -- 예: AST-2019-0001
  name         TEXT        NOT NULL,
  category     TEXT        NOT NULL,
  model        TEXT        NOT NULL DEFAULT '-',
  department   TEXT        NOT NULL DEFAULT '-',
  owner        TEXT        NOT NULL DEFAULT '-',
  location     TEXT        NOT NULL DEFAULT '-',
  status       TEXT        NOT NULL DEFAULT '사용중',
  acquire_date DATE        NOT NULL,
  price        INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 자산 이력 테이블
CREATE TABLE IF NOT EXISTS asset_history (
  id         BIGSERIAL   PRIMARY KEY,
  asset_id   TEXT        NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  type       TEXT        NOT NULL,               -- 등록 / 수리 / 부서이동 / 실사 / 폐기심사
  detail     TEXT        NOT NULL DEFAULT ''
);

-- 이력 조회 속도를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON asset_history(asset_id);

-- 3. RLS(행 수준 보안) 활성화
ALTER TABLE assets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

-- 4. 시연용 정책: 익명 키(anon)로 전체 읽기/쓰기 허용
--    (실제 운영에서는 인증 기반 정책으로 교체 필요)
DROP POLICY IF EXISTS "demo_all" ON assets;
DROP POLICY IF EXISTS "demo_all" ON asset_history;

CREATE POLICY "demo_all" ON assets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "demo_all" ON asset_history
  FOR ALL USING (true) WITH CHECK (true);
