# 가이드 히스토리 기능 완전 가이드

## 개요

가이드 히스토리 기능을 통해 여러 버전의 AI 가이드를 저장하고 탐색할 수 있습니다. 이전 가이드와 새 가이드를 비교하면서 최적의 가이드를 선택할 수 있습니다.

## 주요 기능

### 1. 가이드 버전 관리
- **자동 저장**: 새가이드를 생성할 때마다 자동으로 히스토리에 추가
- **버전 번호**: 각 가이드에 버전 번호 자동 할당 (1, 2, 3...)
- **타임스탬프**: 생성 시간 자동 기록
- **무제한 저장**: 가이드 개수 제한 없음

### 2. 버전 탐색
- **이전 버튼**: 이전 버전의 가이드로 이동 (◀ 이전)
- **다음 버튼**: 다음 버전의 가이드로 이동 (다음 ▶)
- **버전 표시**: "가이드 2 / 5" 형식으로 현재 위치 표시
- **최신/이전 뱃지**: 최신 가이드는 녹색, 이전 가이드는 회색 뱃지

### 3. 상태 관리
- **현재 버전 추적**: 마지막으로 본 가이드 버전 기억
- **페이지 새로고침 후에도 유지**: 데이터베이스에 저장됨

## 사용 방법

### 첫 가이드 생성
1. 챕터 선택
2. 자동으로 첫 번째 가이드 생성
3. 히스토리 네비게이션 표시 (가이드 1 / 1)

### 새 가이드 생성
1. "🔄 새가이드" 버튼 클릭
2. AI가 새로운 가이드 생성
3. 자동으로 히스토리에 추가됨
4. 히스토리 네비게이션 업데이트 (가이드 2 / 2)

### 이전 가이드 보기
1. "◀ 이전" 버튼 클릭
2. 이전 버전의 가이드 표시
3. 뱃지가 "이전"으로 변경됨

### 최신 가이드로 돌아가기
1. "다음 ▶" 버튼을 계속 클릭
2. 최신 가이드에 도달하면 "다음" 버튼 비활성화
3. 뱃지가 "최신"으로 변경됨

## 데이터베이스 구조

### chapters 테이블 스키마

```sql
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  content TEXT,
  attachments JSONB,
  guide TEXT,                        -- 하위 호환성을 위한 현재 가이드
  guide_history JSONB DEFAULT '[]',  -- 가이드 히스토리 배열
  current_guide_version INTEGER DEFAULT 0,  -- 현재 보고 있는 버전
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### guide_history 데이터 구조

```json
[
  {
    "content": "<h4>📌 이 챕터의 목적과 배경</h4>...",
    "created_at": "2024-01-15T10:30:00.000Z",
    "version": 0
  },
  {
    "content": "<h4>📌 수정된 가이드</h4>...",
    "created_at": "2024-01-15T14:20:00.000Z",
    "version": 1
  },
  {
    "content": "<h4>📌 최신 가이드</h4>...",
    "created_at": "2024-01-15T16:45:00.000Z",
    "version": 2
  }
]
```

## 마이그레이션

### 필수 마이그레이션 스크립트

Supabase SQL Editor에서 다음 스크립트를 실행하세요:

```sql
-- 1. guide_history 컬럼 추가
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS guide_history JSONB DEFAULT '[]'::jsonb;

-- 2. current_guide_version 컬럼 추가
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS current_guide_version INTEGER DEFAULT 0;

-- 3. 기존 가이드를 히스토리로 마이그레이션
UPDATE chapters
SET guide_history = jsonb_build_array(
    jsonb_build_object(
        'content', guide,
        'created_at', NOW(),
        'version', 0
    )
)
WHERE guide IS NOT NULL AND guide != '' AND guide_history = '[]'::jsonb;

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_chapters_guide_history
ON chapters USING GIN (guide_history);

CREATE INDEX IF NOT EXISTS idx_chapters_current_guide_version
ON chapters(current_guide_version);
```

## API 변경사항

### GET /api/chapters
**응답 예시**:
```json
{
  "1-1": {
    "content": "...",
    "attachments": [],
    "guide": "현재 가이드",
    "guideHistory": [
      {
        "content": "첫 번째 가이드",
        "created_at": "2024-01-15T10:30:00.000Z",
        "version": 0
      },
      {
        "content": "두 번째 가이드",
        "created_at": "2024-01-15T14:20:00.000Z",
        "version": 1
      }
    ],
    "currentGuideVersion": 1,
    "updatedAt": "2024-01-15T14:20:00.000Z"
  }
}
```

### POST /api/chapters/:id
**요청 본문**:
```json
{
  "content": "챕터 내용",
  "attachments": [],
  "guide": "현재 가이드 (하위 호환성)",
  "guideHistory": [
    {
      "content": "가이드 내용",
      "created_at": "2024-01-15T10:30:00.000Z",
      "version": 0
    }
  ],
  "currentGuideVersion": 0
}
```

## 코드 예시

### JavaScript - 가이드 히스토리 접근

```javascript
// 현재 챕터의 가이드 히스토리 가져오기
const history = chapterData[chapterId].guideHistory || [];

// 현재 버전 가져오기
const currentVersion = chapterData[chapterId].currentGuideVersion || 0;

// 특정 버전의 가이드 가져오기
const guide = history[currentVersion];
console.log(guide.content);
console.log(guide.created_at);
console.log(guide.version);

// 최신 가이드인지 확인
const isLatest = currentVersion === history.length - 1;
```

### JavaScript - 새 가이드 추가

```javascript
// 새 가이드를 히스토리에 추가
const newGuide = {
  content: guideHtml,
  created_at: new Date().toISOString(),
  version: chapterData[chapterId].guideHistory.length
};

chapterData[chapterId].guideHistory.push(newGuide);
chapterData[chapterId].currentGuideVersion =
  chapterData[chapterId].guideHistory.length - 1;

// 서버에 저장
await saveGuideToServer(chapterId, guideHtml);
```

## 모바일 지원

모바일 환경에서도 가이드 히스토리를 완벽하게 지원합니다:

1. **슬라이드 패널**: 우측 상단 📝 버튼으로 가이드 패널 열기
2. **히스토리 네비게이션**: 이전/다음 버튼으로 버전 탐색
3. **버전 표시**: 데스크톱과 동일한 버전 정보 표시
4. **자동 동기화**: 데스크톱과 모바일 간 자동 동기화

## 문제 해결

### Q: 가이드 히스토리가 표시되지 않아요
A: 데이터베이스 마이그레이션을 실행했는지 확인하세요. `guide_history` 컬럼이 없으면 히스토리가 저장되지 않습니다.

### Q: 이전 가이드가 모두 사라졌어요
A: 마이그레이션 전에 생성된 가이드는 자동으로 히스토리에 추가되지 않습니다. 마이그레이션 스크립트의 Step 3를 실행하여 기존 가이드를 히스토리로 변환하세요.

### Q: 가이드 히스토리 삭제는 어떻게 하나요?
A: 현재 버전에서는 가이드 삭제 기능이 없습니다. 데이터베이스에서 직접 삭제하거나 향후 업데이트를 기다려주세요.

### Q: 가이드 개수 제한이 있나요?
A: 없습니다. JSONB 컬럼의 크기 제한(약 1GB) 내에서 무제한으로 저장 가능합니다.

## 성능 고려사항

- **인덱스**: `guide_history` 컬럼에 GIN 인덱스가 적용되어 빠른 검색이 가능합니다
- **캐싱**: 로컬 `chapterData` 객체에 캐싱되어 빠른 접근이 가능합니다
- **지연 로딩**: 가이드 내용은 필요할 때만 렌더링됩니다

## 향후 개선 계획

- [ ] 가이드 버전 삭제 기능
- [ ] 가이드 비교 기능 (diff view)
- [ ] 가이드 즐겨찾기
- [ ] 가이드 메모 추가
- [ ] 가이드 내보내기 (PDF, TXT)
- [ ] 가이드 버전 병합
