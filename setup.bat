@echo off
echo ==================================================
echo   KHOI TAO MOI TRUONG DU AN - AI HISTORY LEARNING
echo ==================================================
echo.

echo [1] Dang kiem tra va tao file .env cho Backend...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo   - Da tao thanh cong: backend\.env
) else (
    echo   - Bo qua: File backend\.env da ton tai.
)
echo.

echo [2] Dang kiem tra va tao file .env cho Frontend...
if not exist "frontend\ai-history-learning\.env" (
    copy "frontend\ai-history-learning\.env.example" "frontend\ai-history-learning\.env" >nul
    echo   - Da tao thanh cong: frontend\ai-history-learning\.env
) else (
    echo   - Bo qua: File frontend\ai-history-learning\.env da ton tai.
)
echo.

echo ==================================================
echo THIET LAP HOAN TAT! 
echo Vui long mo cac file .env vua duoc tao ra de dien API Key va Database URI.
echo Sau do chay lenh: docker-compose up -d --build
echo ==================================================
pause 

