@echo off
echo =======================================================
echo   BIFROST VIRTUAL CAMERA - PYINSTALLER BUILDER
echo   Telkom University - Tubes Sistem Multimedia
echo =======================================================
echo.

cd /d "%~dp0.."

echo [1/2] Mengompilasi BIFROST_Witness_Cam.exe dengan dukungan OBS Virtual Camera...
pyinstaller --noconfirm --onedir --windowed ^
    --name "BIFROST_Witness_Cam" ^
    --exclude-module torch ^
    --exclude-module torchvision ^
    --exclude-module tensorflow ^
    --exclude-module matplotlib ^
    --exclude-module scipy ^
    --collect-all pyvirtualcam ^
    --collect-all pygrabber ^
    --collect-all comtypes ^
    --add-data "scripts/face_detection_yunet.onnx;scripts" ^
    desktop/witness_shield.py

if errorlevel 1 (
    echo [ERROR] Kompilasi gagal!
    pause
    exit /b 1
)

echo.
if exist "dist\BIFROST_Witness_Cam\BIFROST_Witness_Cam.exe" (
    echo =======================================================
    echo   BERHASIL! File executable siap di:
    echo   dist\BIFROST_Witness_Cam\BIFROST_Witness_Cam.exe
    echo =======================================================
) else (
    echo [!] Kompilasi gagal atau terganggu.
)

pause
