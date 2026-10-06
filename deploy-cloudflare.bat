@echo off
chcp 65001 > nul
echo ===================================================
echo   ระบบจัดการหอพัก - Deploy to Cloudflare Pages
echo ===================================================
echo.

echo [1/2] กำลัง Build Production Bundle...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Build ล้มเหลว กรุณาตรวจสอบโค้ด
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] กำลัง Deploy ขึ้น Cloudflare...
call npx.cmd wrangler deploy

echo.
echo ===================================================
echo   Deploy เสร็จสมบูรณ์! ตรวจสอบ URL ด้านบนได้เลยครับ
echo ===================================================
pause
