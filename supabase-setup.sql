-- ============================================
-- Book2 프로젝트 Supabase 테이블 설정
-- ============================================

-- 1. chapters 테이블 생성
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,                    -- 챕터 ID (예: "prologue-p1")
  content TEXT DEFAULT '',                -- 챕터 내용 (HTML)
  attachments JSONB DEFAULT '[]'::jsonb,  -- 첨부파일 정보 배열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. updated_at 트리거 설정
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security) 정책 설정 - 모든 사용자 접근 허용
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- 읽기 권한
CREATE POLICY "Enable read access for all users" ON chapters
    FOR SELECT
    USING (true);

-- 쓰기 권한
CREATE POLICY "Enable insert access for all users" ON chapters
    FOR INSERT
    WITH CHECK (true);

-- 업데이트 권한
CREATE POLICY "Enable update access for all users" ON chapters
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 삭제 권한
CREATE POLICY "Enable delete access for all users" ON chapters
    FOR DELETE
    USING (true);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_chapters_updated_at ON chapters(updated_at DESC);

-- ============================================
-- Storage 버킷 설정 (Supabase 대시보드에서 수동 설정 필요)
-- ============================================
-- 버킷 이름: book-attachments
-- 공개 접근: true
-- 파일 크기 제한: 50MB
-- 허용 MIME 타입: image/*, application/pdf, application/msword, etc.
