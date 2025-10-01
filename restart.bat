@echo off
echo ========================================
echo 서버 재시작 중...
echo ========================================
echo.

REM 기존 서버 종료
echo [1/3] 기존 서버 종료 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo ✓ 기존 서버 종료 완료
timeout /t 2 /nobreak >nul
echo.

REM .env 파일 확인
echo [2/3] 환경변수 확인 중...
if exist .env (
    echo ✓ .env 파일 발견
    type .env | findstr "ANTHROPIC_API_KEY" >nul
    if errorlevel 1 (
        echo ⚠ 경고: ANTHROPIC_API_KEY가 .env 파일에 없습니다!
    ) else (
        echo ✓ API 키 설정 확인됨
    )
) else (
    echo ⚠ 경고: .env 파일이 없습니다!
)
echo.

REM 서버 시작
echo [3/3] 서버 시작 중...
start "Book2 Server" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
echo ✓ 서버가 시작되었습니다!
echo.

echo ========================================
echo 서버 재시작 완료!
echo 브라우저에서 http://localhost:3000 접속
echo ========================================
echo.
pause
