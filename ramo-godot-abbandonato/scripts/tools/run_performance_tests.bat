@echo off
echo ========================================
echo TheSafePlace - Performance Test Runner
echo ========================================
echo.

REM Cerca Godot in diverse posizioni comuni
set GODOT_PATH=""

REM Controlla se Godot è nel PATH
where godot >nul 2>&1
if %errorlevel% == 0 (
    set GODOT_PATH=godot
    goto :run_tests
)

REM Controlla posizioni comuni di installazione
if exist "C:\Program Files\Godot\Godot.exe" (
    set GODOT_PATH="C:\Program Files\Godot\Godot.exe"
    goto :run_tests
)

if exist "C:\Program Files (x86)\Godot\Godot.exe" (
    set GODOT_PATH="C:\Program Files (x86)\Godot\Godot.exe"
    goto :run_tests
)

if exist "%LOCALAPPDATA%\Godot\Godot.exe" (
    set GODOT_PATH="%LOCALAPPDATA%\Godot\Godot.exe"
    goto :run_tests
)

REM Controlla nella cartella Downloads
if exist "%USERPROFILE%\Downloads\Godot_v4.2.2-stable_win64.exe" (
    set GODOT_PATH="%USERPROFILE%\Downloads\Godot_v4.2.2-stable_win64.exe"
    goto :run_tests
)

if exist "%USERPROFILE%\Downloads\Godot.exe" (
    set GODOT_PATH="%USERPROFILE%\Downloads\Godot.exe"
    goto :run_tests
)

REM Se non trovato, chiedi all'utente
echo ❌ Godot non trovato automaticamente.
echo.
echo Inserisci il percorso completo dell'eseguibile di Godot:
echo Esempio: C:\Path\To\Godot.exe
echo.
set /p GODOT_PATH="Percorso Godot: "

if "%GODOT_PATH%"=="" (
    echo ❌ Percorso non fornito. Uscita.
    pause
    exit /b 1
)

:run_tests
echo.
echo 🚀 Avvio test di performance...
echo Usando Godot: %GODOT_PATH%
echo.

REM Esegui i test
%GODOT_PATH% --headless --main-pack . TestExecutorScene.tscn

if %errorlevel% == 0 (
    echo.
    echo ✅ Test completati con successo!
    echo 📄 Controlla il report in: %APPDATA%\Godot\app_userdata\TheSafePlace\performance_test_report.md
) else (
    echo.
    echo ❌ Errore durante l'esecuzione dei test.
    echo Codice errore: %errorlevel%
)

echo.
echo Premi un tasto per continuare...
pause >nul