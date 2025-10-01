# AI 가이드 기능 설정 방법

## 🤖 AI 가이드 기능이란?

챕터별로 자동으로 글쓰기 가이드를 생성하고, 작성한 내용을 분석하여 개선 방향을 제시하는 기능입니다.

## ⚠️ 주의사항

- **AI 가이드 기능은 선택 사항입니다**
- API 키 없이도 모든 편집 기능을 사용할 수 있습니다
- AI 가이드 기능만 사용할 수 없습니다

## 🔑 Anthropic API 키 발급 방법

### 1. Anthropic 계정 생성
https://console.anthropic.com/ 접속하여 계정 생성

### 2. API 키 발급
1. https://console.anthropic.com/settings/keys 접속
2. "Create Key" 버튼 클릭
3. API 키 복사 (sk-ant-api03-... 형식)

### 3. 비용 안내
- 무료 크레딧이 제공될 수 있습니다
- 사용량에 따라 과금됩니다
- Claude Sonnet 4 모델 기준: 약 $3 / 1M tokens
- 가이드 1회 생성 시 약 500-1000 tokens 사용
- 자세한 내용: https://www.anthropic.com/pricing

## 🛠️ 설정 방법

### 🌐 Render.com 배포 환경 (프로덕션)

**현재 배포 URL**: https://book2-83a6.onrender.com/

Render.com에 배포된 서비스에서 AI 가이드 기능을 사용하려면:

#### 1. Render.com 대시보드 접속
1. https://dashboard.render.com/ 로그인
2. 프로젝트 목록에서 **book2** 선택

#### 2. 환경변수(Environment Variables) 설정
1. 왼쪽 메뉴에서 **"Environment"** 탭 클릭
2. **"Add Environment Variable"** 버튼 클릭
3. 다음 정보 입력:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-api03-실제발급받은키를여기에입력`
4. **"Save Changes"** 버튼 클릭

#### 3. 서비스 재배포
- 환경변수를 추가하면 **자동으로 재배포**됩니다
- 몇 분 후 https://book2-83a6.onrender.com/ 에서 AI 가이드 기능이 활성화됩니다

#### 4. 확인
1. https://book2-83a6.onrender.com/ 접속
2. 챕터 선택
3. AI 가이드가 정상적으로 생성되는지 확인

**⚠️ 중요**: 
- Render.com의 환경변수는 웹 대시보드에서만 설정 가능
- `.env` 파일은 로컬 개발 환경에서만 사용되며, Render.com에는 업로드되지 않음
- **같은 API 키를 로컬과 프로덕션에서 모두 사용 가능**

---

### 💻 로컬 개발 환경 (Windows)

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
```bash
copy .env.example .env
```

2. `.env` 파일을 메모장으로 열기:
```bash
notepad .env
```

3. `your_api_key_here` 부분을 발급받은 API 키로 교체:
```
ANTHROPIC_API_KEY=sk-ant-api03-실제발급받은키를여기에입력
```

4. 파일 저장 후 서버 재시작

### 환경변수로 직접 설정 (대안)

`.env` 파일 대신 서버 실행 시 환경변수로 직접 설정할 수도 있습니다:

```bash
set ANTHROPIC_API_KEY=sk-ant-api03-실제발급받은키
npm start
```

## ✅ 설정 확인

### 로컬 환경 (localhost)

1. 서버를 시작합니다
2. 브라우저에서 http://localhost:3000/index.html 접속
3. 챕터를 선택합니다
4. 오른쪽 패널에서 AI 가이드가 정상적으로 생성되는지 확인

### Render.com 배포 환경

1. 브라우저에서 https://book2-83a6.onrender.com/ 접속
2. 챕터를 선택합니다
3. 오른쪽 패널에서 AI 가이드가 정상적으로 생성되는지 확인

### 성공 시
- "AI가 글쓰기 가이드를 생성하고 있습니다..." 메시지 표시
- 몇 초 후 가이드 내용이 표시됨

### 실패 시
- "가이드 생성에 실패했습니다" 메시지 표시
- API 키 설정을 확인하라는 안내 표시

## 🔒 보안 주의사항

1. **절대로 API 키를 Git에 커밋하지 마세요**
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   - Render.com의 환경변수는 Git에 저장되지 않습니다 (안전!)
   
2. **API 키를 다른 사람과 공유하지 마세요**
   - API 키가 노출되면 즉시 재발급하세요

3. **사용량 모니터링**
   - https://console.anthropic.com/settings/usage 에서 사용량 확인
   - Render.com에서 사용하는 API 호출도 여기에 포함됩니다

4. **같은 API 키를 로컬과 Render.com에서 사용**
   - 로컬: `.env` 파일에 설정
   - Render.com: Environment Variables에 설정
   - **동일한 키를 두 곳에서 모두 사용 가능**

## 🚫 API 키 없이 사용하기

AI 가이드 기능을 사용하지 않으려면:

1. `.env` 파일을 생성하지 않거나 비워둡니다
2. 서버를 정상적으로 실행합니다
3. 모든 편집 기능은 정상 작동합니다
4. 가이드 패널에서 "API 키가 필요합니다" 메시지만 표시됩니다

## 💡 문제 해결

### "가이드 생성에 실패했습니다"

#### 로컬 환경
- API 키가 올바르게 설정되었는지 확인
- 서버를 재시작했는지 확인
- 인터넷 연결 상태 확인

#### Render.com 환경
- Render.com 대시보드에서 환경변수가 올바르게 설정되었는지 확인
- 환경변수 저장 후 자동 재배포가 완료되었는지 확인 (약 2-5분 소요)
- Render.com 대시보드 → Logs 탭에서 에러 메시지 확인

### "서버 연결을 확인해주세요"

#### 로컬 환경
- 서버가 실행 중인지 확인 (http://localhost:3000)
- 방화벽이 차단하고 있지 않은지 확인

#### Render.com 환경
- Render.com 서비스 상태 확인 (대시보드에서 "Live" 상태 확인)
- 배포 로그에서 에러 확인

### API 키 오류
- API 키가 유효한지 Anthropic 콘솔에서 확인
- API 키 앞뒤에 공백이 없는지 확인
- API 키가 만료되지 않았는지 확인
