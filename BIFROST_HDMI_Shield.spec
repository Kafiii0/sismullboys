from PyInstaller.utils.hooks import collect_all

ocr_datas, ocr_binaries, ocr_hiddenimports = collect_all('rapidocr_onnxruntime')
all_datas = [('scripts', 'scripts')] + ocr_datas
all_hiddenimports = ocr_hiddenimports

a = Analysis(
    ['desktop/presentation_shield.py'],
    pathex=[],
    binaries=ocr_binaries,
    datas=all_datas,
    hiddenimports=all_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['torch', 'torchvision', 'tensorflow', 'matplotlib', 'scipy'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='BIFROST_HDMI_Shield',
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
    name='BIFROST_HDMI_Shield',
)
