@echo off
echo =======================================================
echo   BIFROST HDMI PRESENTATION SHIELD - PYINSTALLER BUILDER
echo   Telkom University - Tubes Sistem Multimedia
echo =======================================================
echo.

cd /d "%~dp0.."

echo [1/3] Memeriksa dependensi python...
python -c "import cv2, numpy, PIL, mss; print('Core dependencies OK.')"
if errorlevel 1 (
    echo [ERROR] Dependensi python belum lengkap.
    pause
    exit /b 1
)

echo.
echo [2/3] Mengompilasi desktop/presentation_shield.py menjadi .EXE mandiri...
pyinstaller --noconfirm --onedir --windowed ^
    --name "BIFROST_HDMI_Shield" ^
    --exclude-module torch ^
    --exclude-module torchvision ^
    --exclude-module tensorflow ^
    --exclude-module matplotlib ^
    --exclude-module scipy ^
    --add-data "scripts;scripts" ^
    desktop/presentation_shield.py

if errorlevel 1 (
    echo [ERROR] Kompilasi gagal!
    pause
    exit /b 1
)

echo.
if exist "dist\BIFROST_HDMI_Shield\BIFROST_HDMI_Shield.exe" (
    echo =======================================================
    echo   BERHASIL! File executable siap di:
    echo   dist\BIFROST_HDMI_Shield\BIFROST_HDMI_Shield.exe
    echo =======================================================
) else (
    echo [!] Kompilasi gagal atau terganggu.
)

pause
