@echo off
cd /d "%~dp0"
setlocal EnableDelayedExpansion
title CMDB - Modo desarrollo
color 0B

echo.
echo  CMDB - Iniciando...
echo.

:: ── Node.js ───────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js no instalado.
    echo  Descargalo desde: https://nodejs.org  (version LTS^)
    echo.
    pause & exit /b 1
)
for /f "tokens=*" %%V in ('node --version') do echo  Node.js %%V

:: ── Librerias criticas ────────────────────────────────────────────
set MISS=0
for %%F in ("lib\xlsx.full.min.js" "lib\echarts.min.js" "lib\handsontable.full.min.css" "lib\handsontable.full.min.js") do (
    if not exist %%F ( echo  Falta: %%F & set MISS=1 )
)
if "!MISS!"=="1" (
    color 0E
    echo.
    echo  Ejecuta primero: 1-download-libs.bat
    echo.
    pause & exit /b 1
)
echo  Librerias: OK

:: ── Instalar Electron si no existe ───────────────────────────────
if not exist "node_modules\electron" (
    echo  Instalando Electron (primera vez, ~2 min^)...
    echo.
    call npm install --save-dev electron@31
    if %errorlevel% neq 0 (
        color 0C
        echo  Error al instalar Electron. Verifica internet.
        pause & exit /b 1
    )
    echo  Electron instalado OK.
    echo.
)

:: ── Lanzar app ────────────────────────────────────────────────────
echo  Abriendo CMDB...
echo  (Cierra esta ventana para salir^)
echo.
node_modules\.bin\electron . 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  Si electron no inicio, intenta: npx electron .
    npx electron .
)
endlocal
