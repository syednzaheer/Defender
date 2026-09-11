@echo off
setlocal
set "ROOT=%~dp0"
if not exist "%ROOT%Backend\package.json" (
  echo Defender root not found. Expected Backend and Frontend beside this file.
  pause
  exit /b 1
)
start "Defender Backend" /D "%ROOT%Backend" cmd /k npm start
start "Defender Frontend" /D "%ROOT%Frontend" cmd /k npm run dev -- --host 127.0.0.1
echo Defender backend and frontend terminals started.
echo Open the Vite URL shown in the Frontend terminal.
endlocal
