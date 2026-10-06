Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  ระบบจัดการหอพัก - Deploy to Cloudflare Pages" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] กำลัง Build Production Bundle..." -ForegroundColor Yellow
npm.cmd run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build ล้มเหลว กรุณาตรวจสอบโค้ด" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "[2/2] กำลัง Deploy ขึ้น Cloudflare..." -ForegroundColor Yellow
npx.cmd wrangler deploy

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Deploy เสร็จสมบูรณ์!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
