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

### Windows

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

1. 서버를 시작합니다
2. 브라우저에서 http://localhost:3000/index.html 접속
3. 챕터를 선택합니다
4. 오른쪽 패널에서 AI 가이드가 정상적으로 생성되는지 확인

### 성공 시
- "AI가 글쓰기 가이드를 생성하고 있습니다..." 메시지 표시
- 몇 초 후 가이드 내용이 표시됨

### 실패 시
- "가이드 생성에 실패했습니다" 메시지 표시
- API 키 설정을 확인하라는 안내 표시

## 🔒 보안 주의사항

1. **절대로 API 키를 Git에 커밋하지 마세요**
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   
2. **API 키를 다른 사람과 공유하지 마세요**
   - API 키가 노출되면 즉시 재발급하세요

3. **사용량 모니터링**
   - https://console.anthropic.com/settings/usage 에서 사용량 확인

## 🚫 API 키 없이 사용하기

AI 가이드 기능을 사용하지 않으려면:

1. `.env` 파일을 생성하지 않거나 비워둡니다
2. 서버를 정상적으로 실행합니다
3. 모든 편집 기능은 정상 작동합니다
4. 가이드 패널에서 "API 키가 필요합니다" 메시지만 표시됩니다

## 💡 문제 해결

### "가이드 생성에 실패했습니다"
- API 키가 올바르게 설정되었는지 확인
- 서버를 재시작했는지 확인
- 인터넷 연결 상태 확인

### "서버 연결을 확인해주세요"
- 서버가 실행 중인지 확인 (http://localhost:3000)
- 방화벽이 차단하고 있지 않은지 확인

### API 키 오류
- API 키가 유효한지 Anthropic 콘솔에서 확인
- API 키 앞뒤에 공백이 없는지 확인
- API 키가 만료되지 않았는지 확인
