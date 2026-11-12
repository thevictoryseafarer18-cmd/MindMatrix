# MINDMATRIX AI - Launch Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       MINDMATRIX AI - ADAPTIVE LEARNING PLATFORM        " -ForegroundColor Cyan
Write-Host "          'Beyond Answers. Into Understanding.'          " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = "$PSScriptRoot\backend"
$frontendDir = "$PSScriptRoot\frontend"

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting React + TypeScript Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev -- --host 0.0.0.0 --port 5173"

Write-Host "`nAll services launched successfully!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
