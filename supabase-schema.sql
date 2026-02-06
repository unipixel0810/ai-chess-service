-- =====================================================
-- Chess DNA 프로젝트 Supabase 테이블 스키마
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- =====================================================

-- 0. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  real_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. 게임 기록 테이블
CREATE TABLE IF NOT EXISTS game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  result TEXT NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
  total_moves INTEGER NOT NULL,
  final_fen TEXT NOT NULL,
  duration_seconds INTEGER,
  player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  real_name TEXT
);

-- 2. DNA 분석 데이터 테이블
CREATE TABLE IF NOT EXISTS dna_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_records(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  aggression_score DECIMAL(5,4) NOT NULL,
  capture_count INTEGER NOT NULL,
  pawn_advance_score DECIMAL(5,4) NOT NULL,
  move_count INTEGER NOT NULL,
  highlight_captions TEXT[] DEFAULT '{}',
  player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. 이동 기록 테이블 (상세 분석용)
CREATE TABLE IF NOT EXISTS move_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES game_records(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  san TEXT NOT NULL,
  from_square TEXT NOT NULL,
  to_square TEXT NOT NULL,
  fen_after TEXT NOT NULL,
  is_capture BOOLEAN DEFAULT FALSE,
  is_check BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_real_name ON profiles(real_name);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_result ON game_records(result);
CREATE INDEX IF NOT EXISTS idx_dna_records_game_id ON dna_records(game_id);
CREATE INDEX IF NOT EXISTS idx_move_records_game_id ON move_records(game_id);

-- RLS (Row Level Security) 정책 설정
-- 익명 사용자도 데이터를 읽고 쓸 수 있도록 설정 (데모용)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 허용 (데모용 - 프로덕션에서는 더 엄격하게)
CREATE POLICY "Allow all access to profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to game_records" ON game_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to dna_records" ON dna_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to move_records" ON move_records
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 실행 완료 후 Supabase Dashboard에서 확인하세요!
-- =====================================================
