@echo off
cd /d "%~dp0"
setlocal EnableDelayedExpansion
title CMDB - Descarga de librerias
color 0A

echo.
echo  =====================================================
echo   CMDB - Descarga de librerias y fuentes
echo   Ejecuta UNA VEZ antes de usar la app
echo  =====================================================
echo.

:: ── Verificar carpeta correcta ────────────────────────────────────
if not exist "index.html" (
    color 0C
    echo  ERROR: Ejecuta desde la carpeta de CMDB (donde esta index.html^)
    echo.
    pause & exit /b 1
)

if not exist "lib"   mkdir "lib"
if not exist "fonts" mkdir "fonts"

:: ── Detectar metodo de descarga ───────────────────────────────────
set DLOK=0
where node >nul 2>&1
if %errorlevel% equ 0 ( set HASNPM=1 ) else ( set HASNPM=0 )

echo  [1/3] Descargando librerias JS y CSS...
echo.

:: Funcion de descarga usando PowerShell WebClient (sin curl)
:DL
set _DST=%~1
set _URL=%~2
if exist "%_DST%" ( echo  [existe] %_DST% & goto :eof )
echo  Descargando %_DST%...
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command ^
 "try { $wc = New-Object System.Net.WebClient; $wc.Headers.Add('User-Agent','Mozilla/5.0'); $wc.DownloadFile('%_URL%','%_DST%'); Write-Host 'OK' } catch { Write-Host ('FALLO: '+$_.Exception.Message) }"
if exist "%_DST%" ( echo  [OK] %_DST% ) else ( echo  [FALLO] %_DST% )
goto :eof

:: ── Librerias JS / CSS ────────────────────────────────────────────
call :DL "lib\xlsx.full.min.js"          "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
if not exist "lib\xlsx.full.min.js" call :DL "lib\xlsx.full.min.js" "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"

call :DL "lib\echarts.min.js"            "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"
if not exist "lib\echarts.min.js" call :DL "lib\echarts.min.js" "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"

call :DL "lib\handsontable.full.min.css" "https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.css"
call :DL "lib\handsontable.full.min.js"  "https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.js"

echo.
echo  [2/3] Descargando fuentes woff2...
echo.

if "!HASNPM!"=="1" (
    echo  Usando npm @fontsource...
    if not exist "tmp_fonts" mkdir "tmp_fonts"

    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
     "Set-Location '%~dp0'; npm install --prefix tmp_fonts @fontsource/ibm-plex-mono@5 @fontsource/dm-sans@5 --no-save --silent 2>&1 | Out-Null; Write-Host 'npm OK'"

    for %%W in (400 500 600) do (
        if not exist "fonts\IBMPlexMono-%%W.woff2" (
            for /r "tmp_fonts\node_modules\@fontsource\ibm-plex-mono" %%F in (*latin-%%W-normal.woff2) do (
                copy /Y "%%F" "fonts\IBMPlexMono-%%W.woff2" >nul 2>&1 && echo  [OK] IBMPlexMono-%%W.woff2
            )
        ) else ( echo  [existe] IBMPlexMono-%%W.woff2 )
    )
    for %%W in (300 400 500 600) do (
        if not exist "fonts\DMSans-%%W.woff2" (
            for /r "tmp_fonts\node_modules\@fontsource\dm-sans" %%F in (*latin-%%W-normal.woff2) do (
                copy /Y "%%F" "fonts\DMSans-%%W.woff2" >nul 2>&1 && echo  [OK] DMSans-%%W.woff2
            )
        ) else ( echo  [existe] DMSans-%%W.woff2 )
    )
    rmdir /s /q "tmp_fonts" >nul 2>&1

) else (
    echo  Node.js no encontrado. Usando PowerShell + Google Fonts API...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
     "$ErrorActionPreference='SilentlyContinue';" ^
     "$wc = New-Object System.Net.WebClient;" ^
     "$wc.Headers.Add('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64)');" ^
     "try {" ^
     "  $css = $wc.DownloadString('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');" ^
     "  $urls = [regex]::Matches($css,'url\((https://fonts\.gstatic[^)]+\.woff2)\)') | ForEach-Object { $_.Groups[1].Value };" ^
     "  $wts  = [regex]::Matches($css,'font-weight:\s*(\d+)') | ForEach-Object { $_.Groups[1].Value };" ^
     "  $fms  = [regex]::Matches($css,\"font-family:\s*'([^']+)'\") | ForEach-Object { $_.Groups[1].Value };" ^
     "  $wc2  = New-Object System.Net.WebClient;" ^
     "  $ibm=@{}; $dm=@{};" ^
     "  for ($i=0; $i -lt $urls.Count; $i++) {" ^
     "    if ($fms[$i] -like '*IBM*' -and !$ibm[$wts[$i]]) { $ibm[$wts[$i]] = $urls[$i] }" ^
     "    elseif ($fms[$i] -like '*DM*'  -and !$dm[$wts[$i]])  { $dm[$wts[$i]]  = $urls[$i] }" ^
     "  }" ^
     "  @(@{w='400';f='fonts\IBMPlexMono-400.woff2';d=$ibm}, @{w='500';f='fonts\IBMPlexMono-500.woff2';d=$ibm}," ^
     "    @{w='600';f='fonts\IBMPlexMono-600.woff2';d=$ibm}, @{w='300';f='fonts\DMSans-300.woff2';d=$dm}," ^
     "    @{w='400';f='fonts\DMSans-400.woff2';d=$dm}, @{w='500';f='fonts\DMSans-500.woff2';d=$dm}," ^
     "    @{w='600';f='fonts\DMSans-600.woff2';d=$dm}) | ForEach-Object {" ^
     "    if ($_.d[$_.w] -and !(Test-Path $_.f)) {" ^
     "      $wc2.DownloadFile($_.d[$_.w], $_.f); Write-Host ('[OK] ' + $_.f)" ^
     "    } elseif (Test-Path $_.f) { Write-Host ('[existe] ' + $_.f) }" ^
     "  }" ^
     "} catch { Write-Host 'Aviso: fuentes opcionales no descargadas (la app funciona igual)' -ForegroundColor Yellow }"
)

:: ── Verificacion final ────────────────────────────────────────────
echo.
echo  [3/3] Verificacion...
echo.
set CRIT=0
for %%F in ("lib\xlsx.full.min.js" "lib\echarts.min.js" "lib\handsontable.full.min.css" "lib\handsontable.full.min.js") do (
    if exist %%F ( echo  [v] %%F ) else ( echo  [X] %%F  ^<-- CRITICO & set CRIT=1 )
)
for %%F in ("fonts\IBMPlexMono-400.woff2" "fonts\DMSans-400.woff2") do (
    if exist %%F ( echo  [v] %%F ) else ( echo  [~] %%F  (opcional) )
)

echo.
if "!CRIT!"=="0" (
    color 0A
    echo  Listo. Ahora ejecuta: 2-run-dev.bat
) else (
    color 0C
    echo  CRITICO: Faltan librerias. Verifica tu conexion a internet.
    echo  Asegurate de tener acceso a cdn.jsdelivr.net
)
echo.
pause
endlocal
