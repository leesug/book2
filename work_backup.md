# Book2 프로젝트 - 작업 진행 상황

## 📁 프로젝트 정보
- **프로젝트명**: 자유의지 예측 - 집필 시스템
- **로컬 경로**: D:\work\book2
- **GitHub**: https://github.com/leesug/book2
- **배포 URL**: https://book2-83a6.onrender.com/
- **호스팅**: Render.com
- **데이터베이스**: Supabase
- **AI**: Anthropic Claude API

---

## ✅ 완료된 작업

### 1. Git 설정
- [x] work.md를 .gitignore에 추가
- [x] Git 히스토리에서 work.md 완전 제거
- [x] API 키 보안 경고 해결

### 2. Render.com 배포 설정
- [x] API_KEY_SETUP.md에 Render.com 설정 방법 추가
- [x] README.md에 배포 환경 정보 추가
- [x] 서버 환경변수 로깅 강화
- [x] 루트 경로(/) 라우트 추가 → index.html 서빙
- [x] 상대 경로 API 호출로 변경 (localhost:3000 제거)

### 3. 환경변수 설정
- [x] 로컬 .env 파일 설정 완료
- [x] Render.com Environment Variables 설정 가이드 작성
- [x] API 키 검증 로직 추가

---

## ⚠️ 현재 문제 상황

### 1. Supabase 환경변수 오류 (긴급!)
**문제**: Render.com의 `SUPABASE_KEY` 값에 줄바꿈과 `PORT=3000`이 포함됨

**오류 메시지**:
```
TypeError: Headers.set: "eyJhbGci...VSk\nPORT=3000" is an invalid header value.
```

**해결 방법**:
1. Render.com Dashboard → book2 → Environment 탭
2. `SUPABASE_KEY` 편집
3. Value에서 `\nPORT=3000` 삭제
4. JWT 토큰만 남기기 (eyJ로 시작)
5. Save Changes

**올바른 환경변수 형식**:
```
SUPABASE_URL=https://cuwozwldhlzqdbaeperm.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d296d2xkaGx6cWRiYWVwZXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDQ2NTMsImV4cCI6MjA3NDg4MDY1M30.sokPRfCRGN7qQrpL9dRBlOx2cWSg1GWwtDtn7f27VSk
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=10000
```

### 2. Anthropic API 크레딧 부족
**문제**: API 키는 유효하지만 크레딧 잔액 부족

**오류 메시지**:
```json
{
  "type":"invalid_request_error",
  "message":"Your credit balance is too low to access the Anthropic API. 
             Please go to Plans & Billing to upgrade or purchase credits."
}
```

**해결 방법**:
1. https://console.anthropic.com/ 접속
2. Plans & Billing 메뉴
3. Purchase Credits (최소 $5 권장)

---

## 🚧 현재 진행 중인 작업: 목차 관리 시스템

### 요구사항
사용자가 요청한 기능:
1. **제목 표시 및 편집**: 왼쪽 목차 선택 시 가운데 컨텐츠에 제목도 함께 표시
2. **제목 동기화**: 편집기에서 제목 수정 시 목차도 자동 업데이트
3. **목차 단계 변경**: depth 조정 가능 (1단계 ↔ 2단계 ↔ 3단계)
4. **목차 CRUD**: 추가, 삭제, 수정, 이동 기능

### 구현 계획

#### Phase 1: 제목 편집 시스템 (우선순위 ⭐⭐⭐)
- [x] 1-1. 기술 설계 완료
  - 전역 변수: originalTitle
  - 함수: getChapterTitle(), escapeHtml(), previewTitleChange(), updateChapterTitle()
  - localStorage 저장/로드 함수
  
- [x] 1-2. 컨텐츠 영역 상단에 제목 입력 필드 추가
  - ✅ title-integration.js 생성 (함수 오버라이드 방식)
  - ✅ renderViewMode 오버라이드 - 뷰 모드에 제목 표시
  - ✅ enterEditMode 오버라이드 - 편집 모드에 제목 입력 필드
  - ✅ index.html에 스크립트 추가 완료
  
- [x] 1-3. 제목 자동 로드
  - ✅ 챕터 선택 시 제목 필드에 자동 입력
  - ✅ View 모드에도 제목 표시
  
- [x] 1-4. 제목 저장 로직
  - ✅ saveContent 오버라이드 - 저장 버튼 클릭 시 제목도 함께 저장
  - ✅ tableOfContents 객체 업데이트
  - ✅ localStorage에 영구 저장
  - ✅ window.tableOfContents 할당으로 전역 접근 가능
  - ✅ 저장 버튼 이벤트 리스너 재연결
  
- [x] 1-5. 목차 자동 동기화
  - ✅ 제목 변경 시 왼쪽 목차 트리 자동 갱신
  - ✅ 실시간 반영 (저장 전 미리보기)
  - ✅ 페이지 새로고침 후에도 변경된 제목 유지

**✅ Phase 1 완료!** (2025-10-02)

**🔧 해결한 기술적 문제:**
- chapterId를 매개변수로 전달하여 undefined 문제 해결
- window.tableOfContents 할당으로 전역 접근 가능
- 저장 버튼 이벤트 리스너 재연결 (cloneNode 방식)
- ID 계층 탐색 (split('-')으로 "prologue-p1" 처리)

#### Phase 2: 목차 관리 UI (우선순위 ⭐⭐)
- [ ] 2-1. 목차 관리 버튼 추가
  - 위치: 왼쪽 사이드바 상단
  - 버튼: [목차 관리 모드]
  
- [ ] 2-2. 목차 편집 모드 UI
  - 각 목차 항목 옆에 액션 버튼
  - 버튼: [↑ 위로] [↓ 아래로] [← 레벨업] [→ 레벨다운] [✏️ 수정] [❌ 삭제]
  
- [ ] 2-3. 새 챕터 추가 기능
  - [+ 새 챕터 추가] 버튼
  - 모달: 제목 입력, 부모 선택, 위치 선택
  - 자동 ID 생성 (예: p33, 1-6-1, etc.)

#### Phase 3: 목차 레벨 변경 (우선순위 ⭐⭐)
- [ ] 3-1. 레벨업 기능 (자식 → 형제)
  - 현재: part1 > 1-1 > 1-1-1
  - 변경 후: part1 > 1-1, 1-1-1 (동일 레벨)
  
- [ ] 3-2. 레벨다운 기능 (형제 → 자식)
  - 현재: part1 > 1-1, 1-2
  - 변경 후: part1 > 1-1 > 1-2
  
- [ ] 3-3. 하위 항목 자동 이동
  - 부모가 이동하면 모든 자식도 함께 이동

#### Phase 4: 데이터 영속성 (우선순위 ⭐)
- [ ] 4-1. 목차 데이터 Supabase 저장
  - 새 테이블: `table_of_contents`
  - 컬럼: id, parent_id, title, order, depth, updated_at
  
- [ ] 4-2. 서버 API 추가
  - GET /api/toc - 목차 전체 조회
  - POST /api/toc - 목차 저장
  - PUT /api/toc/:id - 목차 수정
  - DELETE /api/toc/:id - 목차 삭제
  
- [ ] 4-3. 로컬 백업
  - localStorage에도 캐시 저장
  - 오프라인 모드 지원

### 기술적 세부사항

#### 파일 수정 위치
```
D:\work\book2\index.html
- Line 738~1010: tableOfContents 객체
- Line 1160~1250: renderChapterTree() 함수
- Line 1270~1310: loadChapter() 함수
- Line 1345~1370: 편집 모드 HTML
```

#### 데이터 구조 (현재)
```javascript
const tableOfContents = {
    "bookInfo": {
        title: "📋 책 기본 정보",
        isSpecial: true
    },
    "prologue": {
        title: "프롤로그: 인류의 숙명, 예측에 대한 갈망",
        children: {
            "p1": { title: "왜 우리는 예측하려 하는가?" },
            "p2": { title: "..." }
        }
    }
}
```

#### 새 데이터 구조 (제안)
```javascript
const tableOfContents = {
    "bookInfo": {
        id: "bookInfo",
        title: "📋 책 기본 정보",
        isSpecial: true,
        order: 0,
        depth: 0
    },
    "prologue": {
        id: "prologue",
        title: "프롤로그: 인류의 숙명, 예측에 대한 갈망",
        order: 1,
        depth: 0,
        children: {
            "p1": { 
                id: "p1",
                title: "왜 우리는 예측하려 하는가?",
                parentId: "prologue",
                order: 0,
                depth: 1
            }
        }
    }
}
```

### 함수 리스트 (구현 필요)
```javascript
// 제목 관리
function updateChapterTitle(chapterId, newTitle) {}
function syncTitleToTOC(chapterId, newTitle) {}

// 목차 관리
function addNewChapter(parentId, title, position) {}
function deleteChapter(chapterId) {}
function moveChapterUp(chapterId) {}
function moveChapterDown(chapterId) {}
function changeLevelUp(chapterId) {}
function changeLevelDown(chapterId) {}

// UI 업데이트
function enterTOCEditMode() {}
function exitTOCEditMode() {}
function refreshTOCTree() {}

// 데이터 저장
function saveTOCToDatabase() {}
function loadTOCFromDatabase() {}
```

---

## 📝 새 채팅에서 계속하기

**새 채팅에서 시작할 때 이렇게 요청하세요:**

```
D:\work\book2 폴더에서 작업 중입니다.
work.md 파일을 읽고 "현재 진행 중인 작업: 목차 관리 시스템"을 계속 구현해주세요.

먼저 Phase 1: 제목 편집 시스템부터 시작합니다.
완료된 항목은 work.md에 [x] 체크 표시를 해주세요.
```

---

## 🔧 로컬 개발 환경

### 서버 실행
```bash
cd D:\work\book2
npm start
# 또는
node server.js
```

### 브라우저 접속
```
http://localhost:3000/index.html
```

### Git 작업
```bash
git status
git add .
git commit -m "메시지"
git push origin main  # GitHub Desktop 사용 권장
```

---

## 📚 참고 문서
- `API_KEY_SETUP.md` - API 키 설정 방법
- `README.md` - 프로젝트 개요 및 사용법
- `SUPABASE_SETUP_GUIDE.md` - Supabase 설정
- `.env.example` - 환경변수 템플릿

---

## 🎯 우선순위

1. **긴급**: Render.com의 SUPABASE_KEY 환경변수 수정
2. **중요**: Anthropic API 크레딧 충전
3. **다음**: Phase 1 제목 편집 시스템 구현
4. **이후**: Phase 2-4 순차적 구현

---

**마지막 업데이트**: 2025-10-02
**작성자**: AI Assistant
**상태**: 목차 관리 시스템 구현 준비 완료
