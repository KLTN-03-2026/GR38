@echo off
echo ==================================================
echo   KHOI TAO MOI TRUONG DU AN - AI HISTORY LEARNING
echo ==================================================
echo.

echo [1] Dang kiem tra va tao file .env cho Backend...
if not exist "backend\.env.docker" (
    copy "backend\.env.example" "backend\.env.docker" >nul
    echo   - Da tao thanh cong: backend\.env.docker
) else (
    echo   - Bo qua: File backend\.env.docker da ton tai.
)
echo.

echo [2] Dang kiem tra va tao file .env cho Frontend...
if not exist "frontend\ai-history-learning\.env.docker" (
    copy "frontend\ai-history-learning\.env.example" "frontend\ai-history-learning\.env.docker" >nul
    echo   - Da tao thanh cong: frontend\ai-history-learning\.env.docker
) else (
    echo   - Bo qua: File frontend\.env.docker da ton tai.
)
echo.

echo ==================================================
echo THIET LAP HOAN TAT! 
echo Vui long mo cac file .env.docker vua duoc tao ra de dien API Key va Database URI.
echo Sau do chay lenh: docker-compose up -d --build
echo ==================================================
pause 