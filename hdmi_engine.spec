# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all

ocr_datas, ocr_binaries, ocr_hiddenimports = collect_all('rapidocr_onnxruntime')

a = Analysis(
    ['desktop/hdmi_engine.py'],
    pathex=[],
    binaries=ocr_binaries,
    datas=ocr_datas,
    hiddenimports=ocr_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['torch', 'torchvision'],
    noarchive=False,
    optimize=0,
)
a.binaries = [b for b in a.binaries if 'opencv_videoio_ffmpeg' not in b[0].lower() and '_avif' not in b[0].lower()]
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='hdmi_engine',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='hdmi_engine',
)
