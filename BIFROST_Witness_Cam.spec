from PyInstaller.utils.hooks import collect_all
datas = [('scripts/face_detection_yunet.onnx', 'scripts'), ('desktop/bifrost_cam.ico', '.'), ('desktop/bifrost_cam.png', '.')]
binaries = []
hiddenimports = []
tmp_ret = collect_all('pyvirtualcam')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]
tmp_ret = collect_all('pygrabber')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]
tmp_ret = collect_all('comtypes')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]
tmp_ret = collect_all('sounddevice')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]
a = Analysis(['desktop/witness_shield.py'], pathex=[], binaries=binaries, datas=datas, hiddenimports=hiddenimports, hookspath=[], hooksconfig={}, runtime_hooks=[], excludes=['torch', 'torchvision', 'tensorflow', 'matplotlib', 'scipy'], noarchive=False, optimize=0)
pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name='BIFROST_Witness_Cam', debug=False, bootloader_ignore_signals=False, strip=False, upx=True, console=False, disable_windowed_traceback=False, argv_emulation=False, target_arch=None, codesign_identity=None, entitlements_file=None, icon='desktop/bifrost_cam.ico')
coll = COLLECT(exe, a.binaries, a.datas, strip=False, upx=True, upx_exclude=[], name='BIFROST_Witness_Cam')
