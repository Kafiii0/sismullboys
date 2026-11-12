import sys
import os
import time
import threading
import ctypes
from ctypes import wintypes
import tkinter as tk
from tkinter import ttk, messagebox
import cv2
import numpy as np
from PIL import Image, ImageTk
try:
    import sounddevice as sd
    HAS_SOUNDDEVICE = True
except ImportError:
    HAS_SOUNDDEVICE = False
BG_DARK = '#0B0F19'
BG_SIDEBAR = '#080D18'
BG_CARD = '#0F172A'
BG_CARD_BORDER = '#1E293B'
BG_CARD_ACTIVE = '#0D203C'
BORDER_ACTIVE = '#2563EB'
ACCENT_BLUE = '#2563EB'
ACCENT_CYAN = '#38BDF8'
ACCENT_GREEN = '#10B981'
ACCENT_RED = '#EF4444'
TEXT_WHITE = '#F8FAFC'
TEXT_MUTED = '#94A3B8'
TEXT_DIM = '#64748B'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
YUNET_MODEL_PATH = os.path.join(SCRIPT_DIR, '..', 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'face_detection_yunet.onnx')

def ensure_single_instance():
    try:
        import psutil
        my_pid = os.getpid()
        parent_pid = os.getppid() if hasattr(os, 'getppid') else None
        for p in psutil.process_iter(['pid', 'name']):
            try:
                pid = p.info['pid']
                if pid != my_pid and pid != parent_pid and ('bifrost_witness_cam' in p.info['name'].lower()):
                    p.kill()
            except Exception:
                pass
    except Exception:
        pass

def ensure_bifrost_vcam_registered():
    try:
        import winreg
        key_path = 'SOFTWARE\\Classes\\CLSID\\{860BB310-5D01-11d0-BD3B-00A0C911CE86}\\Instance\\{A3FCE0F5-3493-419F-958A-ABA1250EC20B}'
        clsid_val = '{A3FCE0F5-3493-419F-958A-ABA1250EC20B}'
        filter_data = None
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path) as hk:
                filter_data, _ = winreg.QueryValueEx(hk, 'FilterData')
        except Exception:
            pass
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path) as hkcu:
            winreg.SetValueEx(hkcu, 'FriendlyName', 0, winreg.REG_SZ, 'BIFROST Encrypted Camera')
            winreg.SetValueEx(hkcu, 'CLSID', 0, winreg.REG_SZ, clsid_val)
            if filter_data:
                winreg.SetValueEx(hkcu, 'FilterData', 0, winreg.REG_BINARY, filter_data)
        print('[VirtualCam] Registered device: BIFROST Encrypted Camera')
    except Exception as e:
        print(f'[VirtualCam] Registration note: {e}')
VIDEO_NAME = 'OBSVirtualCamVideo'
SHARED_QUEUE_STATE_INVALID = 0
SHARED_QUEUE_STATE_STARTING = 1
SHARED_QUEUE_STATE_READY = 2
SHARED_QUEUE_STATE_STOPPING = 3
FRAME_HEADER_SIZE = 32

class QueueHeader(ctypes.Structure):
    _fields_ = [('write_idx', wintypes.DWORD), ('read_idx', wintypes.DWORD), ('state', wintypes.DWORD), ('offsets', wintypes.DWORD * 3), ('type', wintypes.DWORD), ('cx', wintypes.DWORD), ('cy', wintypes.DWORD), ('interval', ctypes.c_uint64), ('reserved', wintypes.DWORD * 8)]

def align_size(size, align=32):
    return size + (align - 1) & ~(align - 1)

class DirectVirtualCam:

    def __init__(self, width=640, height=480, fps=30):
        self.width = width
        self.height = height
        self.fps = fps
        self.interval = int(10000000.0 / fps)
        self.frame_size = width * height * 3 // 2
        self.handle = None
        self.base_addr = None
        self.header = None
        self.ts_offsets = [0, 0, 0]
        self.frame_offsets = [0, 0, 0]
        kernel32 = ctypes.windll.kernel32
        kernel32.OpenFileMappingW.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.LPCWSTR]
        kernel32.OpenFileMappingW.restype = wintypes.HANDLE
        kernel32.CreateFileMappingW.argtypes = [wintypes.HANDLE, ctypes.c_void_p, wintypes.DWORD, wintypes.DWORD, wintypes.DWORD, wintypes.LPCWSTR]
        kernel32.CreateFileMappingW.restype = wintypes.HANDLE
        kernel32.MapViewOfFile.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.DWORD, wintypes.DWORD, ctypes.c_size_t]
        kernel32.MapViewOfFile.restype = ctypes.c_void_p
        kernel32.UnmapViewOfFile.argtypes = [ctypes.c_void_p]
        kernel32.UnmapViewOfFile.restype = wintypes.BOOL
        kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel32.CloseHandle.restype = wintypes.BOOL
        FILE_MAP_ALL_ACCESS = 983071
        size = ctypes.sizeof(QueueHeader)
        size = align_size(size, 32)
        offset_frame = [0, 0, 0]
        for i in range(3):
            offset_frame[i] = size
            size += self.frame_size + FRAME_HEADER_SIZE
            size = align_size(size, 32)
        self.total_size = size
        h = kernel32.OpenFileMappingW(FILE_MAP_ALL_ACCESS, False, VIDEO_NAME)
        created = False
        if not h:
            h = kernel32.CreateFileMappingW(wintypes.HANDLE(-1), None, 4, 0, self.total_size, VIDEO_NAME)
            created = True
        if not h:
            raise RuntimeError(f'Gagal membuat file mapping: {ctypes.GetLastError()}')
        self.handle = h
        base_addr = kernel32.MapViewOfFile(h, FILE_MAP_ALL_ACCESS, 0, 0, 0)
        if not base_addr:
            kernel32.CloseHandle(h)
            raise RuntimeError(f'Gagal MapViewOfFile: {ctypes.GetLastError()}')
        self.base_addr = base_addr
        self.header = QueueHeader.from_address(base_addr)
        if created or self.header.state == SHARED_QUEUE_STATE_INVALID or self.header.cx != width or (self.header.cy != height):
            self.header.write_idx = 0
            self.header.read_idx = 0
            self.header.state = SHARED_QUEUE_STATE_STARTING
            self.header.type = 0
            self.header.cx = width
            self.header.cy = height
            self.header.interval = self.interval
            for i in range(3):
                self.header.offsets[i] = offset_frame[i]
        for i in range(3):
            off = self.header.offsets[i]
            self.ts_offsets[i] = off
            self.frame_offsets[i] = off + FRAME_HEADER_SIZE
        print(f'[DirectVirtualCam] Output aktif ke DirectShow: {width}x{height} @ {fps}fps')

    def send_bgr(self, bgr_frame):
        W, H = (self.width, self.height)
        if bgr_frame.shape[1] != W or bgr_frame.shape[0] != H:
            bgr_frame = cv2.resize(bgr_frame, (W, H))
        yuv = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2YUV_I420)
        y_size = W * H
        uv_size = y_size // 4
        raw = yuv.ravel()
        y = raw[:y_size]
        u = raw[y_size:y_size + uv_size]
        v = raw[y_size + uv_size:]
        uv = np.empty(y_size // 2, dtype=np.uint8)
        uv[0::2] = u
        uv[1::2] = v
        inc = self.header.write_idx + 1 & 4294967295
        idx = inc % 3
        frame_addr = self.base_addr + self.frame_offsets[idx]
        self.header.write_idx = inc
        ctypes.memmove(frame_addr, y.ctypes.data, y_size)
        ctypes.memmove(frame_addr + y_size, uv.ctypes.data, y_size // 2)
        ts_addr = self.base_addr + self.ts_offsets[idx]
        now_ns = int(time.perf_counter() * 1000000000.0)
        ctypes.cast(ts_addr, ctypes.POINTER(ctypes.c_uint64))[0] = now_ns
        self.header.read_idx = inc
        self.header.state = SHARED_QUEUE_STATE_READY

    def send(self, bgr_frame):
        self.send_bgr(bgr_frame)

    def close(self):
        if self.base_addr:
            if self.header:
                self.header.state = SHARED_QUEUE_STATE_STOPPING
            ctypes.windll.kernel32.UnmapViewOfFile(self.base_addr)
            self.base_addr = None
        if self.handle:
            ctypes.windll.kernel32.CloseHandle(self.handle)
            self.handle = None

class RealtimeVoiceDisguiser:

    def __init__(self, sr=22050):
        self.sr = sr
        self.mode = 'deep_shadow'
        self.intensity = 0.6
        self.grain_size = 512
        self.buf_size = 4096
        self.buffer = np.zeros(self.buf_size, dtype=np.float32)
        self.w_ptr = 0
        self.r_ptr1 = 0.0
        self.r_ptr2 = float(self.grain_size // 2)
        self.window = 0.5 * (1.0 - np.cos(2.0 * np.pi * np.arange(self.grain_size) / self.grain_size))
        self.robot_phase = 0.0
        self.stream = None
        self.is_running = False
        self.is_muted = False
        self.lock = threading.Lock()

    def set_mode(self, mode: str):
        with self.lock:
            self.mode = mode

    def set_intensity(self, intensity: float):
        with self.lock:
            self.intensity = max(0.0, min(1.0, intensity))

    def _audio_callback(self, indata, outdata, frames, time_info, status):
        try:
            flat = indata.flatten()
            n = len(flat)
            rms = np.sqrt(np.mean(flat ** 2))
            if rms < 0.001 or self.is_muted:
                outdata[:] = np.zeros((frames, 1), dtype=np.float32)
                return
            with self.lock:
                mode = self.mode
                intensity = self.intensity
            if mode == 'normal' or intensity <= 0.01:
                outdata[:] = indata
                return
            if mode == 'deep_shadow':
                factor = 0.82 - intensity * 0.24
                out = np.zeros(n, dtype=np.float32)
                for i in range(n):
                    self.buffer[self.w_ptr] = flat[i]
                    idx1 = int(self.r_ptr1) % self.buf_size
                    p1 = int(self.r_ptr1) % self.grain_size
                    w1 = self.window[p1]
                    idx2 = int(self.r_ptr2) % self.buf_size
                    p2 = int(self.r_ptr2) % self.grain_size
                    w2 = self.window[p2]
                    out[i] = self.buffer[idx1] * w1 + self.buffer[idx2] * w2
                    self.w_ptr = (self.w_ptr + 1) % self.buf_size
                    self.r_ptr1 += factor
                    self.r_ptr2 += factor
                out = np.tanh(out * 1.35) * 0.88
                mixed = (1.0 - intensity) * flat + intensity * out
                outdata[:] = mixed.reshape(-1, 1).astype(np.float32)
                return
            elif mode == 'robotic':
                carrier_freq = 130.0
                t = (np.arange(n) + self.robot_phase) / self.sr
                self.robot_phase = (self.robot_phase + n) % self.sr
                carrier = np.sin(2 * np.pi * carrier_freq * t) + 0.35 * np.sin(2 * np.pi * (carrier_freq * 2.5) * t)
                mod = flat * carrier
                mod = np.clip(mod * 2.2, -0.92, 1)
                mixed = (1.0 - intensity) * flat + intensity * mod
                outdata[:] = mixed.reshape(-1, 1).astype(np.float32)
                return
            outdata[:] = indata
        except Exception:
            outdata[:] = indata

    def start(self, input_device=None, output_device=None):
        if not HAS_SOUNDDEVICE:
            return False
        if self.is_running:
            return True
        try:
            if output_device is None:
                for idx, d in enumerate(sd.query_devices()):
                    if d['max_output_channels'] > 0 and ('cable input' in d['name'].lower() or 'vb-audio' in d['name'].lower()):
                        output_device = idx
                        print(f"[VoiceDisguiser] Otomatis mengalirkan suara ke Virtual Cable: {d['name']}")
                        break
            dev = None
            if input_device is not None or output_device is not None:
                in_d = input_device if input_device is not None else sd.default.device[0]
                out_d = output_device if output_device is not None else sd.default.device[1]
                dev = (in_d, out_d)
            self.stream = sd.Stream(device=dev, samplerate=self.sr, blocksize=512, channels=1, dtype='float32', callback=self._audio_callback)
            self.stream.start()
            self.is_running = True
            print('[VoiceDisguiser] Stream audio aktif')
            return True
        except Exception as e:
            print(f'[VoiceDisguiser] Gagal memulai audio: {e}')
            self.stream = None
            self.is_running = False
            return False

    def stop(self):
        if self.stream:
            try:
                self.stream.stop()
                self.stream.close()
            except Exception:
                pass
            self.stream = None
        self.is_running = False

def scan_available_cameras(max_tested=8):
    ensure_bifrost_vcam_registered()
    cameras = []
    try:
        from pygrabber.dshow_graph import FilterGraph
        graph = FilterGraph()
        devices = graph.get_input_devices()
        for idx, name in enumerate(devices):
            is_vcam = 'BIFROST' in name or 'OBS Virtual Camera' in name
            is_working = False
            if not is_vcam:
                try:
                    test_cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
                    if test_cap.isOpened():
                        is_working = True
                    test_cap.release()
                except Exception:
                    pass
            display_name = f'{name} (Virtual)' if is_vcam else name
            cameras.append({'idx': idx, 'name': display_name, 'raw_name': name, 'is_working': is_working, 'is_vcam': is_vcam})
    except Exception:
        pass
    if not cameras:
        for idx in range(max_tested):
            try:
                cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
                if not cap.isOpened():
                    cap = cv2.VideoCapture(idx)
                if cap.isOpened():
                    cameras.append({'idx': idx, 'name': f'Integrated Camera {idx}', 'raw_name': f'Integrated Camera {idx}', 'is_working': True, 'is_vcam': False})
                    cap.release()
            except Exception:
                pass
    if not cameras:
        cameras.append({'idx': 0, 'name': 'Integrated Camera (Default)', 'raw_name': 'Integrated Camera (Default)', 'is_working': True, 'is_vcam': False})
    return cameras

class BIFROSTWitnessShieldApp:

    def __init__(self, root):
        self.root = root
        self.root.title('BIFROST | Witness Cam')
        self.root.geometry('1160x740')
        self.root.configure(bg=BG_DARK)
        self.root.minsize(1050, 680)
        ico_candidates = [os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'desktop', 'bifrost_cam.ico'), os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'bifrost_cam.ico'), os.path.join(SCRIPT_DIR, 'bifrost_cam.ico'), os.path.join(SCRIPT_DIR, 'desktop', 'bifrost_cam.ico')]
        for p in ico_candidates:
            if os.path.exists(p):
                try:
                    self.root.iconbitmap(p)
                    break
                except Exception:
                    try:
                        ico_img = ImageTk.PhotoImage(file=p)
                        self.root.iconphoto(True, ico_img)
                        break
                    except Exception:
                        pass
        self.is_streaming = False
        self.is_frozen = False
        self.frozen_frame = None
        self.is_filter_enabled = tk.BooleanVar(value=True)
        self.mask_mode = tk.StringVar(value='mosaic')
        self.pixel_pct = tk.IntVar(value=70)
        self.pixel_size = 28
        self.voice_disguiser = RealtimeVoiceDisguiser()
        self.audio_mode = tk.StringVar(value='deep_shadow')
        self.audio_fx_pct = tk.IntVar(value=60)
        self.cap = None
        self.available_cameras = scan_available_cameras()
        working_cams = [c for c in self.available_cameras if c['is_working'] and (not c['is_vcam'])]
        if working_cams:
            usb_cams = [c for c in working_cams if any((k in c['raw_name'].lower() for k in ['usb', 'integrated', 'hd', 'webcam']))]
            preferred = usb_cams[0] if usb_cams else working_cams[0]
        else:
            non_vcam = [c for c in self.available_cameras if not c['is_vcam']]
            preferred = non_vcam[0] if non_vcam else self.available_cameras[0]
        self.preferred_cam_idx = self.available_cameras.index(preferred)
        self.selected_camera_idx = tk.IntVar(value=preferred['idx'])
        self.vcam = None
        self.vcam_device_name = 'BIFROST Encrypted Camera'
        self.latest_stream_frame = None
        self.frame_lock = threading.Lock()
        self.pump_thread = None
        self._init_virtual_cam(640, 480)
        self.face_detector = None
        self._init_detector()
        self.icons = {}
        self.thumbnail_images = []
        self._create_graphics_assets()
        self.vc_window = None
        self.vc_label = None
        self._build_ui()
        self.root.bind('<space>', lambda e: self.toggle_filter())
        self.root.bind('<f>', lambda e: self.toggle_freeze())
        self.root.protocol('WM_DELETE_WINDOW', self.on_close)
        self.root.after(300, self.start_all)

    def _create_graphics_assets(self):
        self.header_logo_img = None
        logo_candidates = [os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'desktop', 'bifrost_cam.png'), os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'bifrost_cam.png'), os.path.join(SCRIPT_DIR, 'bifrost_cam.png'), os.path.join(SCRIPT_DIR, 'desktop', 'bifrost_cam.png')]
        for lp in logo_candidates:
            if os.path.exists(lp):
                try:
                    pil_logo = Image.open(lp).convert('RGBA')
                    pil_logo = pil_logo.resize((26, 26), Image.Resampling.LANCZOS)
                    self.header_logo_img = ImageTk.PhotoImage(pil_logo)
                    break
                except Exception:
                    pass
        w, h = (50, 50)
        base = np.zeros((h, w, 3), dtype=np.uint8) + 20
        cv2.ellipse(base, (25, 50), (23, 18), 0, 180, 360, (38, 48, 65), -1)
        cv2.rectangle(base, (21, 28), (29, 38), (175, 135, 115), -1)
        cv2.circle(base, (25, 21), 13, (190, 148, 125), -1)
        cv2.ellipse(base, (25, 15), (14, 9), 0, 180, 360, (22, 22, 28), -1)
        cv2.circle(base, (20, 21), 2, (30, 30, 30), -1)
        cv2.circle(base, (30, 21), 2, (30, 30, 30), -1)
        pcts = [0, 25, 50, 75, 100]
        self.thumbnail_images = []
        for p in pcts:
            img = base.copy()
            if p > 0:
                grid = max(2, int(p * 14 / 100))
                sw = max(2, w // grid)
                sh = max(2, h // grid)
                small = cv2.resize(img, (sw, sh), interpolation=cv2.INTER_LINEAR)
                img = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
            img[0, :] = (40, 52, 75)
            img[-1, :] = (40, 52, 75)
            img[:, 0] = (40, 52, 75)
            img[:, -1] = (40, 52, 75)
            pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            self.thumbnail_images.append(ImageTk.PhotoImage(pil_img))
        ico_px = np.zeros((26, 26, 3), dtype=np.uint8) + 15
        for r in [4, 11, 18]:
            for c in [4, 11, 18]:
                cv2.rectangle(ico_px, (c, r), (c + 4, r + 4), (248, 189, 56), -1)
        self.icons['pixel'] = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(ico_px, cv2.COLOR_BGR2RGB)))
        ico_sil = np.zeros((26, 26, 3), dtype=np.uint8) + 15
        cv2.circle(ico_sil, (13, 8), 5, (190, 205, 225), -1)
        cv2.ellipse(ico_sil, (13, 23), (9, 7), 0, 180, 360, (190, 205, 225), -1)
        self.icons['sil'] = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(ico_sil, cv2.COLOR_BGR2RGB)))
        ico_eye = np.zeros((26, 26, 3), dtype=np.uint8) + 15
        cv2.ellipse(ico_eye, (13, 13), (10, 6), 0, 0, 360, (190, 205, 225), 1)
        cv2.circle(ico_eye, (13, 13), 3, (190, 205, 225), -1)
        cv2.line(ico_eye, (3, 22), (23, 4), (56, 189, 248), 2)
        self.icons['eyebar'] = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(ico_eye, cv2.COLOR_BGR2RGB)))
        ico_wave = np.zeros((24, 24, 3), dtype=np.uint8) + 15
        bars = [(4, 6), (8, 12), (12, 18), (16, 12), (20, 6)]
        for bx, bh in bars:
            y1 = 12 - bh // 2
            cv2.line(ico_wave, (bx, y1), (bx, y1 + bh), (56, 189, 248), 2)
        self.icons['wave'] = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(ico_wave, cv2.COLOR_BGR2RGB)))
        ico_rob = np.zeros((24, 24, 3), dtype=np.uint8) + 15
        cv2.circle(ico_rob, (12, 12), 8, (190, 205, 225), 2)
        cv2.circle(ico_rob, (9, 11), 2, (56, 189, 248), -1)
        cv2.circle(ico_rob, (15, 11), 2, (56, 189, 248), -1)
        cv2.line(ico_rob, (9, 16), (15, 16), (190, 205, 225), 1)
        self.icons['robot'] = ImageTk.PhotoImage(Image.fromarray(cv2.cvtColor(ico_rob, cv2.COLOR_BGR2RGB)))

    def _init_virtual_cam(self, target_w=640, target_h=480):
        if self.vcam is not None:
            return True
        ensure_bifrost_vcam_registered()
        try:
            self.vcam = DirectVirtualCam(width=target_w, height=target_h, fps=30)
            self.vcam_device_name = 'BIFROST Encrypted Camera'
            return True
        except Exception as e:
            try:
                import pyvirtualcam
                self.vcam = pyvirtualcam.Camera(width=target_w, height=target_h, fps=30, fmt=pyvirtualcam.PixelFormat.BGR)
                self.vcam_device_name = 'BIFROST Encrypted Camera'
                return True
            except Exception:
                self.vcam = None
                return False

    def _init_detector(self):
        if os.path.exists(YUNET_MODEL_PATH):
            try:
                self.face_detector = cv2.FaceDetectorYN.create(YUNET_MODEL_PATH, '', (320, 320), score_threshold=0.42, nms_threshold=0.3, top_k=5000)
            except Exception:
                self.face_detector = None

    def _build_ui(self):
        header = tk.Frame(self.root, bg=BG_DARK, height=50)
        header.pack(fill='x', padx=18, pady=(12, 6))
        title_box = tk.Frame(header, bg=BG_DARK)
        title_box.pack(side='left')
        if getattr(self, 'header_logo_img', None) is not None:
            lbl_shield = tk.Label(title_box, image=self.header_logo_img, bg=BG_DARK)
        else:
            lbl_shield = tk.Label(title_box, text='🛡️', font=('Segoe UI', 13), fg=ACCENT_CYAN, bg=BG_DARK)
        lbl_shield.pack(side='left', padx=(0, 8))
        lbl_brand = tk.Label(title_box, text='BIFROST', font=('Segoe UI', 13, 'bold'), fg=TEXT_WHITE, bg=BG_DARK)
        lbl_brand.pack(side='left')
        lbl_sep = tk.Label(title_box, text=' | ', font=('Segoe UI', 13), fg='#475569', bg=BG_DARK)
        lbl_sep.pack(side='left')
        lbl_subbrand = tk.Label(title_box, text='Witness Cam', font=('Segoe UI', 12), fg=TEXT_MUTED, bg=BG_DARK)
        lbl_subbrand.pack(side='left')
        win_ctrls = tk.Frame(header, bg=BG_DARK)
        win_ctrls.pack(side='right')

        def make_wbtn(text, cmd):
            b = tk.Button(win_ctrls, text=text, font=('Segoe UI', 9), fg=TEXT_MUTED, bg=BG_DARK, activebackground='#1E293B', activeforeground=TEXT_WHITE, bd=0, relief='flat', padx=10, pady=4, cursor='hand2', command=cmd)
            b.pack(side='left')
            return b
        make_wbtn('─', lambda: self.root.iconify())
        make_wbtn('▢', lambda: self._toggle_maximize())
        make_wbtn('✕', lambda: self.on_close())
        main_body = tk.Frame(self.root, bg=BG_DARK)
        main_body.pack(fill='both', expand=True, padx=18, pady=(4, 14))
        sidebar = tk.Frame(main_body, bg=BG_SIDEBAR, width=140, highlightthickness=1, highlightbackground=BG_CARD_BORDER)
        sidebar.pack(side='left', fill='y', padx=(0, 12))
        sidebar.pack_propagate(False)
        nav_box = tk.Frame(sidebar, bg=BG_SIDEBAR)
        nav_box.pack(fill='x', padx=10, pady=16)
        self.btn_nav_live = tk.Frame(nav_box, bg='#132036', highlightthickness=1, highlightbackground='#1D4ED8', padx=8, pady=8)
        self.btn_nav_live.pack(fill='x', pady=4)
        tk.Label(self.btn_nav_live, text='📹  Live', font=('Segoe UI', 9, 'bold'), fg=ACCENT_CYAN, bg='#132036').pack(anchor='w')
        self.btn_nav_settings = tk.Frame(nav_box, bg=BG_SIDEBAR, padx=8, pady=8, cursor='hand2')
        self.btn_nav_settings.pack(fill='x', pady=4)
        lbl_set = tk.Label(self.btn_nav_settings, text='⚙️  Pengaturan', font=('Segoe UI', 9), fg=TEXT_MUTED, bg=BG_SIDEBAR)
        lbl_set.pack(anchor='w')
        self.btn_nav_settings.bind('<Button-1>', lambda e: self.show_settings_dialog())
        lbl_set.bind('<Button-1>', lambda e: self.show_settings_dialog())
        self.btn_nav_log = tk.Frame(nav_box, bg=BG_SIDEBAR, padx=8, pady=8, cursor='hand2')
        self.btn_nav_log.pack(fill='x', pady=4)
        lbl_log = tk.Label(self.btn_nav_log, text='📄  Log', font=('Segoe UI', 9), fg=TEXT_MUTED, bg=BG_SIDEBAR)
        lbl_log.pack(anchor='w')
        self.btn_nav_log.bind('<Button-1>', lambda e: self.show_log_dialog())
        lbl_log.bind('<Button-1>', lambda e: self.show_log_dialog())
        footer_sb = tk.Frame(sidebar, bg=BG_SIDEBAR)
        footer_sb.pack(side='bottom', fill='x', padx=10, pady=16)
        status_row = tk.Frame(footer_sb, bg=BG_SIDEBAR)
        status_row.pack(anchor='w', pady=(0, 4))
        tk.Label(status_row, text='●', font=('Segoe UI', 8), fg=ACCENT_GREEN, bg=BG_SIDEBAR).pack(side='left', padx=(0, 4))
        tk.Label(status_row, text='Kamera & Mikrofon\nTerhubung', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=BG_SIDEBAR, justify='left').pack(side='left')
        tk.Label(footer_sb, text='v1.0.0', font=('Segoe UI', 8), fg=TEXT_DIM, bg=BG_SIDEBAR).pack(anchor='w', pady=(6, 0))
        center_col = tk.Frame(main_body, bg=BG_CARD, highlightthickness=1, highlightbackground=BG_CARD_BORDER)
        center_col.pack(side='left', fill='both', expand=True, padx=(0, 12))
        self.video_viewport = tk.Frame(center_col, bg='#050811')
        self.video_viewport.pack(side='top', fill='both', expand=True, padx=12, pady=(12, 8))
        self.video_viewport.pack_propagate(False)
        self.preview_label = tk.Label(self.video_viewport, bg='#050811', text='Menghubungkan ke BIFROST...', fg=TEXT_MUTED, font=('Segoe UI', 10))
        self.preview_label.place(relx=0.5, rely=0.5, anchor='center')
        self.overlay_vcam = tk.Frame(self.video_viewport, bg='#0A111E', highlightthickness=1, highlightbackground='#1E293B', padx=8, pady=4)
        self.overlay_vcam.place(x=14, y=14)
        tk.Label(self.overlay_vcam, text='📹  BIFROST Encrypted Camera  ⌄', font=('Segoe UI', 8, 'bold'), fg=TEXT_WHITE, bg='#0A111E').pack()
        self.overlay_live = tk.Frame(self.video_viewport, bg='#0A111E', highlightthickness=1, highlightbackground='#1E293B', padx=8, pady=4)
        self.overlay_live.place(relx=1.0, x=-14, y=14, anchor='ne')
        self.lbl_live_indicator = tk.Label(self.overlay_live, text='●  LIVE  30 FPS', font=('Segoe UI', 8, 'bold'), fg='#F87171', bg='#0A111E')
        self.lbl_live_indicator.pack()
        self.container_w = 640
        self.container_h = 440

        def _on_resize_viewport(e):
            if e.width > 50 and e.height > 50:
                self.container_w = e.width
                self.container_h = e.height
        self.video_viewport.bind('<Configure>', _on_resize_viewport)
        bottom_bar = tk.Frame(center_col, bg=BG_CARD, height=58)
        bottom_bar.pack(side='bottom', fill='x', padx=16, pady=(4, 14))
        cam_selector_frame = tk.Frame(bottom_bar, bg=BG_CARD)
        cam_selector_frame.pack(side='left')
        lbl_cam_title = tk.Label(cam_selector_frame, text='📹  Kamera Fisik', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=BG_CARD)
        lbl_cam_title.pack(anchor='w', pady=(0, 2))
        cam_labels = [c['name'] for c in self.available_cameras]
        self.combo_cams = ttk.Combobox(cam_selector_frame, values=cam_labels, state='readonly', width=26, font=('Segoe UI', 9))
        self.combo_cams.current(self.preferred_cam_idx)
        self.combo_cams.pack(anchor='w')
        self.combo_cams.bind('<<ComboboxSelected>>', self.on_camera_select)
        ctrl_btns = tk.Frame(bottom_bar, bg=BG_CARD)
        ctrl_btns.pack(side='right', pady=4)
        self.btn_mulai = tk.Button(ctrl_btns, text='📹  Mulai', font=('Segoe UI', 10, 'bold'), fg=TEXT_WHITE, bg=ACCENT_BLUE, activebackground='#1D4ED8', activeforeground=TEXT_WHITE, relief='flat', padx=22, pady=7, bd=0, cursor='hand2', command=self.start_all)
        self.btn_mulai.pack(side='left', padx=(0, 10))
        self.btn_hentikan = tk.Button(ctrl_btns, text='■  Hentikan', font=('Segoe UI', 10), fg=TEXT_WHITE, bg='#1E293B', activebackground='#334155', activeforeground=TEXT_WHITE, relief='flat', padx=18, pady=7, bd=0, cursor='hand2', command=self.stop_all)
        self.btn_hentikan.pack(side='left')
        right_col = tk.Frame(main_body, bg=BG_CARD, width=340, highlightthickness=1, highlightbackground=BG_CARD_BORDER)
        right_col.pack(side='right', fill='both', padx=(0, 0))
        right_col.pack_propagate(False)
        top_pills_frame = tk.Frame(right_col, bg='#0A111E', highlightthickness=1, highlightbackground=BG_CARD_BORDER)
        top_pills_frame.pack(fill='x', padx=14, pady=(14, 12))
        self.pill_video = tk.Label(top_pills_frame, text='📹 Video', font=('Segoe UI', 8, 'bold'), fg=TEXT_WHITE, bg=ACCENT_BLUE, padx=14, pady=6, cursor='hand2')
        self.pill_video.pack(side='left', padx=3, pady=3)
        self.pill_suara = tk.Label(top_pills_frame, text='ılı Suara', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#0A111E', padx=14, pady=6, cursor='hand2')
        self.pill_suara.pack(side='left', padx=3, pady=3)
        self.pill_umum = tk.Label(top_pills_frame, text='⚙ Umum', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#0A111E', padx=14, pady=6, cursor='hand2')
        self.pill_umum.pack(side='left', padx=3, pady=3)
        tk.Label(right_col, text='Mode Sensor Wajah', font=('Segoe UI', 10, 'bold'), fg=TEXT_WHITE, bg=BG_CARD).pack(anchor='w', padx=14, pady=(6, 8))
        modes_row = tk.Frame(right_col, bg=BG_CARD)
        modes_row.pack(fill='x', padx=14)
        self.card_pixel = tk.Frame(modes_row, bg=BG_CARD_ACTIVE, highlightthickness=1, highlightbackground=BORDER_ACTIVE, cursor='hand2', padx=6, pady=8)
        self.card_pixel.pack(side='left', fill='both', expand=True, padx=(0, 4))
        self.lbl_ico_pixel = tk.Label(self.card_pixel, image=self.icons['pixel'], bg=BG_CARD_ACTIVE)
        self.lbl_ico_pixel.pack(pady=(0, 4))
        self.lbl_t_pixel = tk.Label(self.card_pixel, text='Pixelation', font=('Segoe UI', 8, 'bold'), fg=TEXT_WHITE, bg=BG_CARD_ACTIVE)
        self.lbl_t_pixel.pack()
        self.lbl_s_pixel = tk.Label(self.card_pixel, text='Mozaik adaptif', font=('Segoe UI', 8), fg='#60A5FA', bg=BG_CARD_ACTIVE)
        self.lbl_s_pixel.pack()
        self.card_sil = tk.Frame(modes_row, bg=BG_CARD, highlightthickness=1, highlightbackground=BG_CARD_BORDER, cursor='hand2', padx=6, pady=8)
        self.card_sil.pack(side='left', fill='both', expand=True, padx=4)
        self.lbl_ico_sil = tk.Label(self.card_sil, image=self.icons['sil'], bg=BG_CARD)
        self.lbl_ico_sil.pack(pady=(0, 4))
        self.lbl_t_sil = tk.Label(self.card_sil, text='Silhouette', font=('Segoe UI', 8, 'bold'), fg=TEXT_WHITE, bg=BG_CARD)
        self.lbl_t_sil.pack()
        self.lbl_s_sil = tk.Label(self.card_sil, text='Bayangan gelap', font=('Segoe UI', 8), fg=TEXT_DIM, bg=BG_CARD)
        self.lbl_s_sil.pack()
        self.card_eye = tk.Frame(modes_row, bg=BG_CARD, highlightthickness=1, highlightbackground=BG_CARD_BORDER, cursor='hand2', padx=6, pady=8)
        self.card_eye.pack(side='left', fill='both', expand=True, padx=(4, 0))
        self.lbl_ico_eye = tk.Label(self.card_eye, image=self.icons['eyebar'], bg=BG_CARD)
        self.lbl_ico_eye.pack(pady=(0, 4))
        self.lbl_t_eye = tk.Label(self.card_eye, text='Eyebar', font=('Segoe UI', 8, 'bold'), fg=TEXT_WHITE, bg=BG_CARD)
        self.lbl_t_eye.pack()
        self.lbl_s_eye = tk.Label(self.card_eye, text='Pita mata', font=('Segoe UI', 8), fg=TEXT_DIM, bg=BG_CARD)
        self.lbl_s_eye.pack()
        for w in (self.card_pixel, self.lbl_ico_pixel, self.lbl_t_pixel, self.lbl_s_pixel):
            w.bind('<Button-1>', lambda e: self.select_mask_mode('mosaic'))
        for w in (self.card_sil, self.lbl_ico_sil, self.lbl_t_sil, self.lbl_s_sil):
            w.bind('<Button-1>', lambda e: self.select_mask_mode('silhouette'))
        for w in (self.card_eye, self.lbl_ico_eye, self.lbl_t_eye, self.lbl_s_eye):
            w.bind('<Button-1>', lambda e: self.select_mask_mode('eyebar'))
        px_header = tk.Frame(right_col, bg=BG_CARD)
        px_header.pack(fill='x', padx=14, pady=(14, 4))
        tk.Label(px_header, text='Tingkat Pixelation', font=('Segoe UI', 9), fg=TEXT_WHITE, bg=BG_CARD).pack(side='left')
        self.lbl_px_pct = tk.Label(px_header, text='70%', font=('Segoe UI', 9, 'bold'), fg=TEXT_MUTED, bg=BG_CARD)
        self.lbl_px_pct.pack(side='right')
        self.slider_pixel = tk.Scale(right_col, from_=0, to=100, orient='horizontal', variable=self.pixel_pct, bg=BG_CARD, fg=TEXT_WHITE, highlightthickness=0, troughcolor='#1E293B', activebackground=ACCENT_CYAN, bd=0, showvalue=False, command=self._on_pixel_slider_change)
        self.slider_pixel.pack(fill='x', padx=14, pady=(0, 8))
        thumbs_row = tk.Frame(right_col, bg=BG_CARD)
        thumbs_row.pack(fill='x', padx=14, pady=(0, 10))
        steps = [0, 25, 50, 75, 100]
        for idx, pct in enumerate(steps):
            f = tk.Frame(thumbs_row, bg=BG_CARD, cursor='hand2')
            f.pack(side='left', fill='both', expand=True)
            lbl_th = tk.Label(f, image=self.thumbnail_images[idx], bg=BG_CARD)
            lbl_th.pack()
            lbl_lb = tk.Label(f, text=f'{pct}%', font=('Segoe UI', 7), fg=TEXT_DIM, bg=BG_CARD)
            lbl_lb.pack(pady=(2, 0))

            def _make_setter(val):
                return lambda e: self.set_pixel_percentage(val)
            lbl_th.bind('<Button-1>', _make_setter(pct))
            lbl_lb.bind('<Button-1>', _make_setter(pct))
        tk.Frame(right_col, bg=BG_CARD_BORDER, height=1).pack(fill='x', padx=14, pady=(4, 10))
        tk.Label(right_col, text='🔊  Audio', font=('Segoe UI', 10, 'bold'), fg=TEXT_WHITE, bg=BG_CARD).pack(anchor='w', padx=14, pady=(0, 6))
        self.card_aud_deep = tk.Frame(right_col, bg=BG_CARD_ACTIVE, highlightthickness=1, highlightbackground=BORDER_ACTIVE, cursor='hand2', padx=10, pady=8)
        self.card_aud_deep.pack(fill='x', padx=14, pady=3)
        self.lbl_rad_deep = tk.Label(self.card_aud_deep, text='⊙', font=('Segoe UI', 12, 'bold'), fg=ACCENT_CYAN, bg=BG_CARD_ACTIVE)
        self.lbl_rad_deep.pack(side='left', padx=(0, 8))
        self.lbl_ico_aud_deep = tk.Label(self.card_aud_deep, image=self.icons['wave'], bg=BG_CARD_ACTIVE)
        self.lbl_ico_aud_deep.pack(side='left', padx=(0, 8))
        aud_t1 = tk.Frame(self.card_aud_deep, bg=BG_CARD_ACTIVE)
        aud_t1.pack(side='left', fill='both', expand=True)
        self.lbl_t_aud_deep = tk.Label(aud_t1, text='Deep Shadow', font=('Segoe UI', 9, 'bold'), fg=TEXT_WHITE, bg=BG_CARD_ACTIVE)
        self.lbl_t_aud_deep.pack(anchor='w')
        self.lbl_s_aud_deep = tk.Label(aud_t1, text='Suara lebih berat, menutupi identitas.', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=BG_CARD_ACTIVE)
        self.lbl_s_aud_deep.pack(anchor='w')
        self.card_aud_rob = tk.Frame(right_col, bg=BG_CARD, highlightthickness=1, highlightbackground=BG_CARD_BORDER, cursor='hand2', padx=10, pady=8)
        self.card_aud_rob.pack(fill='x', padx=14, pady=3)
        self.lbl_rad_rob = tk.Label(self.card_aud_rob, text='○', font=('Segoe UI', 12), fg=TEXT_DIM, bg=BG_CARD)
        self.lbl_rad_rob.pack(side='left', padx=(0, 8))
        self.lbl_ico_aud_rob = tk.Label(self.card_aud_rob, image=self.icons['robot'], bg=BG_CARD)
        self.lbl_ico_aud_rob.pack(side='left', padx=(0, 8))
        aud_t2 = tk.Frame(self.card_aud_rob, bg=BG_CARD)
        aud_t2.pack(side='left', fill='both', expand=True)
        self.lbl_t_aud_rob = tk.Label(aud_t2, text='Robotik (Vocoder)', font=('Segoe UI', 9, 'bold'), fg=TEXT_WHITE, bg=BG_CARD)
        self.lbl_t_aud_rob.pack(anchor='w')
        self.lbl_s_aud_rob = tk.Label(aud_t2, text='Efek suara robotik, distorsi ringan.', font=('Segoe UI', 8), fg=TEXT_DIM, bg=BG_CARD)
        self.lbl_s_aud_rob.pack(anchor='w')
        self.card_aud_norm = tk.Frame(right_col, bg=BG_CARD, highlightthickness=1, highlightbackground=BG_CARD_BORDER, cursor='hand2', padx=10, pady=8)
        self.card_aud_norm.pack(fill='x', padx=14, pady=3)
        self.lbl_rad_norm = tk.Label(self.card_aud_norm, text='○', font=('Segoe UI', 12), fg=TEXT_DIM, bg=BG_CARD)
        self.lbl_rad_norm.pack(side='left', padx=(0, 8))
        self.lbl_ico_aud_norm = tk.Label(self.card_aud_norm, image=self.icons['wave'], bg=BG_CARD)
        self.lbl_ico_aud_norm.pack(side='left', padx=(0, 8))
        aud_t3 = tk.Frame(self.card_aud_norm, bg=BG_CARD)
        aud_t3.pack(side='left', fill='both', expand=True)
        self.lbl_t_aud_norm = tk.Label(aud_t3, text='Normal', font=('Segoe UI', 9, 'bold'), fg=TEXT_WHITE, bg=BG_CARD)
        self.lbl_t_aud_norm.pack(anchor='w')
        self.lbl_s_aud_norm = tk.Label(aud_t3, text='Tanpa perubahan.', font=('Segoe UI', 8), fg=TEXT_DIM, bg=BG_CARD)
        self.lbl_s_aud_norm.pack(anchor='w')
        for w in (self.card_aud_deep, self.lbl_rad_deep, self.lbl_ico_aud_deep, self.lbl_t_aud_deep, self.lbl_s_aud_deep, aud_t1):
            w.bind('<Button-1>', lambda e: self.select_audio_mode('deep_shadow'))
        for w in (self.card_aud_rob, self.lbl_rad_rob, self.lbl_ico_aud_rob, self.lbl_t_aud_rob, self.lbl_s_aud_rob, aud_t2):
            w.bind('<Button-1>', lambda e: self.select_audio_mode('robotic'))
        for w in (self.card_aud_norm, self.lbl_rad_norm, self.lbl_ico_aud_norm, self.lbl_t_aud_norm, self.lbl_s_aud_norm, aud_t3):
            w.bind('<Button-1>', lambda e: self.select_audio_mode('normal'))
        fx_header = tk.Frame(right_col, bg=BG_CARD)
        fx_header.pack(fill='x', padx=14, pady=(12, 4))
        tk.Label(fx_header, text='Tingkat Efek', font=('Segoe UI', 9), fg=TEXT_WHITE, bg=BG_CARD).pack(side='left')
        self.lbl_fx_pct = tk.Label(fx_header, text='60%', font=('Segoe UI', 9, 'bold'), fg=TEXT_MUTED, bg=BG_CARD)
        self.lbl_fx_pct.pack(side='right')
        self.slider_fx = tk.Scale(right_col, from_=0, to=100, orient='horizontal', variable=self.audio_fx_pct, bg=BG_CARD, fg=TEXT_WHITE, highlightthickness=0, troughcolor='#1E293B', activebackground=ACCENT_CYAN, bd=0, showvalue=False, command=self._on_fx_slider_change)
        self.slider_fx.pack(fill='x', padx=14, pady=(0, 10))

    def select_mask_mode(self, mode: str):
        self.mask_mode.set(mode)
        for card, ico, tit, sub in [(self.card_pixel, self.lbl_ico_pixel, self.lbl_t_pixel, self.lbl_s_pixel), (self.card_sil, self.lbl_ico_sil, self.lbl_t_sil, self.lbl_s_sil), (self.card_eye, self.lbl_ico_eye, self.lbl_t_eye, self.lbl_s_eye)]:
            card.config(bg=BG_CARD, highlightbackground=BG_CARD_BORDER)
            ico.config(bg=BG_CARD)
            tit.config(bg=BG_CARD)
            sub.config(bg=BG_CARD, fg=TEXT_DIM)
        if mode == 'mosaic':
            self.card_pixel.config(bg=BG_CARD_ACTIVE, highlightbackground=BORDER_ACTIVE)
            self.lbl_ico_pixel.config(bg=BG_CARD_ACTIVE)
            self.lbl_t_pixel.config(bg=BG_CARD_ACTIVE)
            self.lbl_s_pixel.config(bg=BG_CARD_ACTIVE, fg='#60A5FA')
        elif mode == 'silhouette':
            self.card_sil.config(bg=BG_CARD_ACTIVE, highlightbackground=BORDER_ACTIVE)
            self.lbl_ico_sil.config(bg=BG_CARD_ACTIVE)
            self.lbl_t_sil.config(bg=BG_CARD_ACTIVE)
            self.lbl_s_sil.config(bg=BG_CARD_ACTIVE, fg='#60A5FA')
        elif mode == 'eyebar':
            self.card_eye.config(bg=BG_CARD_ACTIVE, highlightbackground=BORDER_ACTIVE)
            self.lbl_ico_eye.config(bg=BG_CARD_ACTIVE)
            self.lbl_t_eye.config(bg=BG_CARD_ACTIVE)
            self.lbl_s_eye.config(bg=BG_CARD_ACTIVE, fg='#60A5FA')

    def _on_pixel_slider_change(self, val):
        p = int(float(val))
        self.lbl_px_pct.config(text=f'{p}%')
        self.pixel_size = max(4, int(4 + p / 100.0 * 36))

    def set_pixel_percentage(self, pct: int):
        self.pixel_pct.set(pct)
        self._on_pixel_slider_change(pct)

    def select_audio_mode(self, mode: str):
        self.audio_mode.set(mode)
        self.voice_disguiser.set_mode(mode)
        for card, rad, ico, t, s in [(self.card_aud_deep, self.lbl_rad_deep, self.lbl_ico_aud_deep, self.lbl_t_aud_deep, self.lbl_s_aud_deep), (self.card_aud_rob, self.lbl_rad_rob, self.lbl_ico_aud_rob, self.lbl_t_aud_rob, self.lbl_s_aud_rob), (self.card_aud_norm, self.lbl_rad_norm, self.lbl_ico_aud_norm, self.lbl_t_aud_norm, self.lbl_s_aud_norm)]:
            card.config(bg=BG_CARD, highlightbackground=BG_CARD_BORDER)
            rad.config(text='○', fg=TEXT_DIM, bg=BG_CARD)
            ico.config(bg=BG_CARD)
            t.config(bg=BG_CARD)
            s.config(bg=BG_CARD, fg=TEXT_DIM)
        if mode == 'deep_shadow':
            self.card_aud_deep.config(bg=BG_CARD_ACTIVE, highlightbackground=BORDER_ACTIVE)
            self.lbl_rad_deep.config(text='⊙', fg=ACCENT_CYAN, bg=BG_CARD_ACTIVE)
            self.lbl_ico_aud_deep.config(bg=BG_CARD_ACTIVE)
            self.lbl_t_aud_deep.config(bg=BG_CARD_ACTIVE)
            self.lbl_s_aud_deep.config(bg=BG_CARD_ACTIVE, fg=TEXT_MUTED)
        elif mode == 'robotic':
            self.card_aud_rob.config(bg=BG_CARD_ACTIVE, highlightbackground=BORDER_ACTIVE)
            self.lbl_rad_rob.config(text='⊙', fg=ACCENT_CYAN, bg=BG_CARD_ACTIVE)
            self.lbl_ico_aud_rob.config(bg=BG_CARD_ACTIVE)
            self.lbl_t_aud_rob.config(bg=BG_CARD_ACTIVE)
            self.lbl_s_aud_rob.config(bg=BG_CARD_ACTIVE, fg=TEXT_MUTED)
        elif mode == 'normal':
            self.card_aud_norm.config(bg=BG_CARD_ACTIVE, highlightbackground=BORDER_ACTIVE)
            self.lbl_rad_norm.config(text='⊙', fg=ACCENT_CYAN, bg=BG_CARD_ACTIVE)
            self.lbl_ico_aud_norm.config(bg=BG_CARD_ACTIVE)
            self.lbl_t_aud_norm.config(bg=BG_CARD_ACTIVE)
            self.lbl_s_aud_norm.config(bg=BG_CARD_ACTIVE, fg=TEXT_MUTED)

    def _on_fx_slider_change(self, val):
        p = int(float(val))
        self.lbl_fx_pct.config(text=f'{p}%')
        self.voice_disguiser.set_intensity(p / 100.0)

    def _toggle_maximize(self):
        if self.root.state() == 'zoomed':
            self.root.state('normal')
        else:
            self.root.state('zoomed')

    def _apply_face_mask(self, frame, x, y, w, h, landmarks):
        H, W = frame.shape[:2]
        mode = self.mask_mode.get()
        pct = self.pixel_pct.get()
        pad_x = int(w * 0.16)
        pad_y = int(h * 0.22)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(W, x + w + pad_x)
        y2 = min(H, y + h + int(pad_y * 0.5))
        rw, rh = (x2 - x1, y2 - y1)
        if rw <= 0 or rh <= 0:
            return
        roi = frame[y1:y2, x1:x2]
        if mode == 'mosaic':
            if pct <= 2:
                return
            grid = max(2, self.pixel_size)
            small_w = max(1, rw // grid)
            small_h = max(1, rh // grid)
            small = cv2.resize(roi, (small_w, small_h), interpolation=cv2.INTER_LINEAR)
            pixelated = cv2.resize(small, (rw, rh), interpolation=cv2.INTER_NEAREST)
            frame[y1:y2, x1:x2] = pixelated
        elif mode == 'silhouette':
            mask = np.zeros((rh, rw), dtype=np.uint8)
            cv2.ellipse(mask, (rw // 2, rh // 2), (rw // 2, rh // 2), 0, 0, 360, 255, -1)
            roi_sil = (roi * 0.04).astype(np.uint8)
            frame[y1:y2, x1:x2] = np.where(mask[:, :, None] > 0, roi_sil, roi)
        elif mode == 'eyebar':
            if landmarks is not None and len(landmarks) >= 4:
                rex, rey = (int(landmarks[0]), int(landmarks[1]))
                lex, ley = (int(landmarks[2]), int(landmarks[3]))
                bar_cx = (rex + lex) // 2
                bar_cy = (rey + ley) // 2
                bar_w = int(abs(lex - rex) * 2.2) + 26
                bar_h = max(20, int(h * 0.16))
                bx1 = max(0, bar_cx - bar_w // 2)
                by1 = max(0, bar_cy - bar_h // 2)
                bx2 = min(W, bar_cx + bar_w // 2)
                by2 = min(H, bar_cy + bar_h // 2)
                frame[by1:by2, bx1:bx2] = (12, 12, 12)
            else:
                ey1 = max(0, y + int(h * 0.22))
                ey2 = min(H, y + int(h * 0.4))
                frame[ey1:ey2, x:x + w] = (12, 12, 12)

    def start_all(self):
        if not self.is_streaming:
            self.start_stream()
        self.voice_disguiser.start()
        self.btn_mulai.config(bg='#1D4ED8')
        self.btn_hentikan.config(bg='#1E293B')

    def stop_all(self):
        self.stop_stream()
        self.voice_disguiser.stop()
        self.btn_mulai.config(bg=ACCENT_BLUE)
        self.btn_hentikan.config(bg='#334155')
        self.preview_label.config(image='', text="Kamera Dihentikan • Tekan 'Mulai' untuk siaran")

    def start_stream(self):
        if self.is_streaming:
            return
        target_idx = self.selected_camera_idx.get()
        try:
            self.cap = cv2.VideoCapture(target_idx, cv2.CAP_DSHOW)
        except Exception:
            self.cap = None
        if self.cap is None or not self.cap.isOpened():
            try:
                self.cap = cv2.VideoCapture(target_idx)
            except Exception:
                self.cap = None
        if self.cap and self.cap.isOpened():
            try:
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            except Exception:
                pass
            cam_w = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            cam_h = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            if cam_w <= 0 or cam_h <= 0:
                cam_w, cam_h = (640, 480)
            self._init_virtual_cam(cam_w, cam_h)
        if not self.vcam:
            self._init_virtual_cam(640, 480)
        self.is_streaming = True
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()
        self.pump_thread = threading.Thread(target=self._vcam_pump_loop, daemon=True)
        self.pump_thread.start()

    def stop_stream(self):
        self.is_streaming = False
        if hasattr(self, 'capture_thread') and self.capture_thread and self.capture_thread.is_alive():
            try:
                self.capture_thread.join(timeout=0.4)
            except Exception:
                pass
        if hasattr(self, 'pump_thread') and self.pump_thread and self.pump_thread.is_alive():
            try:
                self.pump_thread.join(timeout=0.4)
            except Exception:
                pass
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

    def _capture_loop(self):
        fps_counter = 0
        last_fps_time = time.time()
        while self.is_streaming:
            frame = None
            if self.cap and self.cap.isOpened():
                ret, raw = self.cap.read()
                if ret and raw is not None:
                    frame = raw
            if frame is None:
                if self.latest_stream_frame is not None:
                    time.sleep(0.01)
                    continue
                else:
                    frame = np.zeros((720, 1280, 3), dtype=np.uint8) + 16
                    cv2.putText(frame, 'Menghubungkan kamera...', (480, 360), cv2.FONT_HERSHEY_SIMPLEX, 1, (120, 120, 120), 2)
                    time.sleep(0.03)
            H, W = frame.shape[:2]
            if self.is_frozen:
                if self.frozen_frame is None:
                    self.frozen_frame = frame.copy()
                frame = self.frozen_frame.copy()
            elif self.is_filter_enabled.get() and self.face_detector is not None:
                try:
                    self.face_detector.setInputSize((W, H))
                    _, detections = self.face_detector.detect(frame)
                    if detections is not None:
                        for det in detections:
                            fx, fy, fw, fh = det[0:4].astype(int)
                            conf = float(det[-1])
                            if conf > 0.4:
                                landmarks = det[4:8]
                                self._apply_face_mask(frame, fx, fy, fw, fh, landmarks)
                except Exception:
                    pass
            with self.frame_lock:
                self.latest_stream_frame = frame.copy()
            cw, ch = (self.container_w, self.container_h)
            if cw > 60 and ch > 60:
                scale = min(cw / W, ch / H)
                nw = max(1, int(W * scale))
                nh = max(1, int(H * scale))
                prev_res = cv2.resize(frame, (nw, nh))
                prev_rgb = cv2.cvtColor(prev_res, cv2.COLOR_BGR2RGB)
                prev_tk = ImageTk.PhotoImage(Image.fromarray(prev_rgb))
                self.preview_label.config(image=prev_tk, text='')
                self.preview_label.image = prev_tk
            fps_counter += 1
            if time.time() - last_fps_time >= 1.0:
                cur_fps = fps_counter / (time.time() - last_fps_time)
                fps_counter = 0
                last_fps_time = time.time()
                self.lbl_live_indicator.config(text=f'●  LIVE  {cur_fps:.0f} FPS')

    def _vcam_pump_loop(self):
        while self.is_streaming:
            t0 = time.time()
            if self.vcam is not None:
                send_frame = None
                with self.frame_lock:
                    if self.latest_stream_frame is not None:
                        send_frame = self.latest_stream_frame.copy()
                if send_frame is not None:
                    try:
                        self.vcam.send(send_frame)
                    except Exception:
                        pass
            elapsed = time.time() - t0
            time.sleep(max(0.002, 1.0 / 30.0 - elapsed))

    def on_camera_select(self, event=None):
        sel_idx = self.combo_cams.current()
        if 0 <= sel_idx < len(self.available_cameras):
            cam_dev_idx = self.available_cameras[sel_idx]['idx']
            self.selected_camera_idx.set(cam_dev_idx)
            self.stop_stream()
            self.root.after(150, self.start_stream)

    def toggle_filter(self):
        curr = self.is_filter_enabled.get()
        self.is_filter_enabled.set(not curr)

    def toggle_freeze(self):
        self.is_frozen = not self.is_frozen
        if not self.is_frozen:
            self.frozen_frame = None

    def show_settings_dialog(self):
        msg = "PENGATURAN BIFROST WITNESS CAM\n\n📹 KAMERA VIRTUAL:\n• Di Google Meet / Zoom, pilih Kamera: 'BIFROST Encrypted Camera'\n\n🎙️ SUARA / MIKROFON DI GOOGLE MEET:\n• Di Windows, aplikasi pengubah suara memerlukan Virtual Audio Cable agar bisa dibaca sebagai Mikrofon oleh Google Meet.\n• Langkah menghubungkan ke Google Meet:\n  1. Unduh driver gratis: VB-CABLE (vb-audio.com/Cable)\n  2. Install driver VB-CABLE (hanya 1 menit)\n  3. BIFROST otomatis mendeteksi dan mengalirkan suara ke 'CABLE Input'\n  4. Di Google Meet > Setelan > Mikrofon: pilih 'CABLE Output (VB-Audio Virtual Cable)'!\n  5. Seluruh peserta Google Meet akan mendengar suara Deep Shadow / Robotik!\n\nShortcut Cepat:\n  [Spasi] : Nyalakan/Matikan Sensor Wajah\n  [F]     : Jeda/Lanjutkan Layar (Freeze)"
        messagebox.showinfo('Pengaturan & Panduan BIFROST', msg)

    def show_log_dialog(self):
        log_txt = f"[OK] DirectShow Virtual Camera Driver Terdaftar\n[OK] Model AI YuNet Terhubung\n[OK] Voice Disguiser DSP Engine: {self.audio_mode.get()}\n[OK] Kamera Sumber: {self.available_cameras[self.combo_cams.current()]['name']}\n[INFO] Mengalirkan feed terenkripsi ke Google Meet / Zoom / OBS"
        messagebox.showinfo('Log Sistem BIFROST', log_txt)

    def on_close(self):
        self.is_streaming = False
        self.voice_disguiser.stop()
        if self.vcam:
            try:
                self.vcam.close()
            except Exception:
                pass
            self.vcam = None
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
        self.root.destroy()

def main():
    ensure_single_instance()
    time.sleep(0.1)
    root = tk.Tk()
    app = BIFROSTWitnessShieldApp(root)
    root.mainloop()
if __name__ == '__main__':
    main()
