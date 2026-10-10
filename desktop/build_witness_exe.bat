@echo off
echo ========================================================
echo   BIFROST Witness Virtual Cam - PyInstaller Build Script
echo ========================================================
echo.

cd /d "%~dp0\.."

echo [1/3] Checking dependencies...
python -c "import cv2, numpy, PIL; print('Core dependencies present.')"
if errorlevel 1 (
    echo [ERROR] Required python modules missing.
    pause
    exit /b 1
)

echo.
echo [2/3] Compiling BIFROST_Witness_Cam.exe with PyInstaller...
pyinstaller --noconfirm --onedir --windowed ^
    --name "BIFROST_Witness_Cam" ^
    --exclude-module torch ^
    --exclude-module torchvision ^
    --exclude-module tensorflow ^
    --exclude-module matplotlib ^
    --exclude-module scipy ^
    --add-data "scripts/face_detection_yunet.onnx;scripts" ^
    desktop/witness_shield.py

if errorlevel 1 (
    echo [ERROR] PyInstaller compilation failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Build completed successfully!
echo Executable located at: dist\BIFROST_Witness_Cam\BIFROST_Witness_Cam.exe
echo ========================================================
pause
