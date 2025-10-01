# Supabase 설정 가이드

## 📝 단계별 설정 방법

### 1. Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `cuwozwldhlzqdbaeperm`

### 2. 테이블 생성
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭
3. `supabase-setup.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

### 3. Storage 버킷 생성
1. 좌측 메뉴에서 **Storage** 클릭
2. **New bucket** 버튼 클릭
3. 버킷 설정:
   - **Name**: `book-attachments`
   - **Public bucket**: ✅ 체크 (공개 접근 허용)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: 비워두기 (모든 타입 허용)
4. **Create bucket** 클릭

### 4. Storage 정책 설정 (자동으로 생성됨)
버킷 생성 시 Public으로 설정하면 자동으로 읽기 정책이 생성됩니다.
추가 정책이 필요한 경우 아래 SQL 실행:

```sql
-- 모든 사용자 업로드 허용
CREATE POLICY "Enable upload for all users"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'book-attachments');

-- 모든 사용자 삭제 허용
CREATE POLICY "Enable delete for all users"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'book-attachments');
```

## ✅ 설정 확인

### 테이블 확인
```sql
SELECT * FROM chapters LIMIT 5;
```

### Storage 버킷 확인
Storage 메뉴에서 `book-attachments` 버킷이 보이는지 확인

## 🔧 문제 해결

### RLS 오류 발생 시
테이블에 RLS 정책이 제대로 적용되지 않은 경우:
```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON chapters;
DROP POLICY IF EXISTS "Enable insert access for all users" ON chapters;
DROP POLICY IF EXISTS "Enable update access for all users" ON chapters;
DROP POLICY IF EXISTS "Enable delete access for all users" ON chapters;

-- 정책 다시 생성
-- (supabase-setup.sql의 정책 부분 다시 실행)
```

### Storage 업로드 오류 시
1. 버킷이 Public으로 설정되어 있는지 확인
2. Storage 정책이 올바르게 설정되어 있는지 확인
3. 파일 크기가 제한을 초과하지 않는지 확인
