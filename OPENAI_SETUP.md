# OpenAI API 키 설정 가이드

## 🎤 음성 → 텍스트 변환 기능 사용하기

이 기능은 **OpenAI Whisper API**를 사용하여 음성 파일을 텍스트로 변환합니다.

---

## 📋 준비사항

### 1. OpenAI 계정 생성
1. https://platform.openai.com/ 접속
2. 계정이 없다면 **Sign Up** 클릭하여 회원가입
3. 이메일 인증 완료

### 2. 결제 정보 등록
1. 로그인 후 우측 상단 프로필 클릭
2. **Billing** → **Payment methods** 선택
3. 신용카드 정보 입력
4. 초기 크레딧 $5 충전 (약 830분의 음성 변환 가능)

**💰 요금 정보**:
- 가격: **$0.006/분** (약 8원/분)
- 예시: 10분 음성 = $0.06 (약 80원)
- 한달 300분 사용 시 = $1.8 (약 2,400원)

---

## 🔑 API 키 발급

### 1. API Keys 페이지 접속
https://platform.openai.com/api-keys

### 2. API 키 생성
1. **+ Create new secret key** 버튼 클릭
2. 이름 입력 (예: "Book2 Voice to Text")
3. **Create secret key** 클릭
4. 생성된 키 복사 (⚠️ 다시 볼 수 없으니 반드시 복사!)
   - 형식: `sk-proj-...` 로 시작하는 긴 문자열

---

## ⚙️ 로컬 환경 설정

### 1. .env 파일 열기
```
D:\work\book2\.env
```

### 2. API 키 입력
```env
# OpenAI API Key (음성 → 텍스트 변환 기능 사용 시 필요)
# https://platform.openai.com/api-keys 에서 발급받으세요
# 요금: $0.006/분 (1분 음성 = 약 8원)
OPENAI_API_KEY=sk-proj-여기에-발급받은-키를-붙여넣기
```

### 3. 서버 재시작
```bash
# 기존 서버 종료 (Ctrl+C)
# 서버 재시작
npm start
```

### 4. 환경변수 확인
서버 시작 시 콘솔에서 확인:
```
🔍 환경변수 체크:
- OPENAI_API_KEY: ✅ 설정됨
```

---

## 🚀 Render.com 배포 환경 설정

### 1. Render.com 대시보드 접속
https://dashboard.render.com/

### 2. 서비스 선택
- 좌측 메뉴에서 **Web Services** 클릭
- `book2` 서비스 선택

### 3. 환경변수 추가
1. **Environment** 탭 클릭
2. **+ Add Environment Variable** 클릭
3. 다음 정보 입력:
   ```
   Key: OPENAI_API_KEY
   Value: sk-proj-여기에-발급받은-키를-붙여넣기
   ```
4. **Save Changes** 클릭

### 4. 서비스 재배포
- 환경변수 저장 후 자동으로 재배포됩니다
- 또는 **Manual Deploy** → **Deploy latest commit** 클릭

---

## 🧪 테스트

### 1. 브라우저에서 접속
```
http://localhost:3000/
```

### 2. 음성 파일 준비
지원 형식: **WAV, MP3, M4A, WebM, OGG**
최대 크기: **25MB**

### 3. 음성 입력 테스트
1. 챕터 선택
2. 편집기에서 **🎤 음성 입력** 버튼 클릭
3. 음성 파일 선택
4. 변환 완료까지 대기 (1~3초)
5. 텍스트가 편집기에 자동 삽입됨

---

## ❌ 문제 해결

### "OpenAI API 키가 설정되지 않았습니다" 오류
**원인**: .env 파일에 API 키가 없거나 잘못됨

**해결**:
1. .env 파일 확인
2. `OPENAI_API_KEY=your-openai-api-key-here` 부분을 실제 키로 변경
3. 서버 재시작

### "Invalid API key" 오류
**원인**: 잘못된 API 키

**해결**:
1. https://platform.openai.com/api-keys 에서 키 재확인
2. 키 복사 시 공백 없이 정확히 복사
3. 키가 만료되었다면 새로 생성

### "Insufficient credits" 오류
**원인**: OpenAI 크레딧 부족

**해결**:
1. https://platform.openai.com/settings/organization/billing 접속
2. **Add payment method** 클릭
3. 결제 정보 입력 및 크레딧 충전

### 변환이 너무 느림
**원인**: 파일 크기가 큼

**해결**:
1. 음성 파일을 압축 (MP3 형식 권장)
2. 불필요한 부분 편집으로 제거
3. 최대한 25MB 이하로 유지

---

## 📊 비용 관리

### 사용량 확인
https://platform.openai.com/usage

### 월별 한도 설정
1. https://platform.openai.com/settings/organization/limits 접속
2. **Monthly budget** 설정 (예: $10)
3. 한도 도달 시 자동으로 차단

### 비용 절감 팁
- 짧은 음성 파일로 쪼개서 변환
- MP3 형식 사용 (파일 크기 작음)
- 불필요한 침묵 구간 제거

---

## 🔗 참고 링크

- OpenAI Platform: https://platform.openai.com/
- API Keys 관리: https://platform.openai.com/api-keys
- 사용량 확인: https://platform.openai.com/usage
- Whisper API 문서: https://platform.openai.com/docs/guides/speech-to-text
- 가격 정책: https://openai.com/pricing

---

**마지막 업데이트**: 2025-10-03
