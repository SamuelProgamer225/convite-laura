@echo off
cd /d "%~dp0"
start "" /b node server.js
timeout /t 2 /nobreak >nul

rem Abre o navegador com a musica liberada para tocar sozinha (perfil proprio, nao mexe no seu)
set "FLAGS=--autoplay-policy=no-user-gesture-required --user-data-dir=%~dp0.perfil-navegador --no-first-run --app=http://localhost:3000"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" ( start "" "%CHROME%" %FLAGS% ) else if exist "%EDGE%" ( start "" "%EDGE%" %FLAGS% ) else start "" http://localhost:3000

echo.
echo Servidor rodando. Feche esta janela para encerrar.
pause >nul
