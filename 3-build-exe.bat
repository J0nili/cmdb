@echo off
cd /d "%~dp0"
setlocal EnableDelayedExpansion
title CMDB - Generar instalador .exe
color 0A

echo.
echo  =====================================================
echo   CMDB - Generar instalador Windows
echo  =====================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 ( color 0C & echo  ERROR: Instala Node.js desde https://nodejs.org & pause & exit /b 1 )
for /f "tokens=*" %%V in ('node --version') do echo  Node.js: %%V

set CRIT=0
for %%F in ("lib\xlsx.full.min.js" "lib\echarts.min.js" "lib\handsontable.full.min.css" "lib\handsontable.full.min.js") do (
    if not exist %%F ( echo  Falta: %%F & set CRIT=1 )
)
if "!CRIT!"=="1" ( echo. & echo  Ejecuta primero: 1-download-libs.bat & pause & exit /b 1 )
echo  Librerias: OK
echo.

echo  [1/3] Instalando dependencias npm...
call npm install --save-dev electron@31 electron-builder@24
if %errorlevel% neq 0 ( color 0C & echo  Error en npm install. & pause & exit /b 1 )
echo  OK
echo.

echo  [2/3] Generando exe (primera vez ~5-10 min^)...
echo.
call npm run dist:win
if %errorlevel% neq 0 ( color 0C & echo  Error en build. & pause & exit /b 1 )

echo.
echo  [3/3] Listo!
echo.
if exist "dist\" (
    color 0A
    echo  Archivos en dist\:
    for %%F in ("dist\*.exe") do echo    %%~nxF
    echo.
    start "" explorer "%~dp0dist"
)
echo.
pause
endlocal
