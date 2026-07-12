@echo off
echo ========================================
echo TheSafePlace - Simple Performance Test
echo ========================================
echo.

REM Percorso Godot fornito dall'utente
set GODOT_PATH="C:\Users\Utente\Downloads\Godot_v4.4.1-stable_win64.exe"

echo 🚀 Avvio test di performance...
echo Usando Godot: %GODOT_PATH%
echo.

REM Esegui la scena di test direttamente
%GODOT_PATH% --headless "res://TestExecutorScene.tscn"

if %errorlevel% == 0 (
    echo.
    echo ✅ Test completati con successo!
) else (
    echo.
    echo ❌ Errore durante l'esecuzione dei test.
    echo Codice errore: %errorlevel%
)

echo.
echo Premi un tasto per continuare...
pause >nul