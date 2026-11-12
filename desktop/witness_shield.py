import sys
import os
import time
import threading
import ctypes
from ctypes import wintypes
import cv2
import numpy as np
from PIL import Image, ImageTk
import customtkinter as ctk
from tkinter import messagebox

try:
    import sounddevice as sd
    HAS_SOUNDDEVICE = True
except ImportError:
    HAS_SOUNDDEVICE = False

# ==============================================================================
# DESIGN SYSTEM: ULTRA-CLEAN LIGHT MODE GLASSMORPHISM
# ==============================================================================
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

BG_CANVAS = "#F1F5F9"        # Soft crisp ice slate
SURFACE_WHITE = "#FFFFFF"    # Pure translucent glass card
SURFACE_MUTED = "#F8FAFC"    # Soft nested container
BORDER_GLASS = "#E2E8F0"     # Crisp subtle card border
BORDER_ACTIVE = "#3B82F6"    # Vibrant focus ring

ACCENT_BLUE = "#2563EB"      # Modern Royal Blue
ACCENT_BLUE_HOVER = "#1D4ED8"
ACCENT_CYAN = "#0EA5E9"      # Sky Blue
ACCENT_GREEN = "#10B981"     # Emerald Online indicator
ACCENT_RED = "#EF4444"       # Stop button crimson
ACCENT_RED_HOVER = "#DC2626"

TEXT_HEADING = "#0F172A"     # Deep crisp slate
TEXT_BODY = "#334155"        # Neutral dark slate
TEXT_MUTED = "#64748B"       # Subtle slate
TEXT_DIM = "#94A3B8"         # Placeholder slate

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
YUNET_MODEL_PATH = os.path.join(SCRIPT_DIR, '..', 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'face_detection_yunet.onnx')


def ensure_single_instance():
    """Mencegah multiple instance berjalan bersamaan."""
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
    """Mendaftarkan DirectShow CLSID BIFROST Encrypted Camera di Windows Registry."""
    try:
        import winreg
        key_path = r'SOFTWARE\Classes\CLSID\{860BB310-5D01-11d0-BD3B-00A0C911CE86}\Instance\{A3FCE0F5-3493-419F-958A-ABA1250EC20B}'
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


# ==============================================================================
# DIRECTSHOW VIRTUAL CAMERA LOW-LEVEL MEMORY MAPPING (1080p FULL HD READY)
# ==============================================================================
VIDEO_NAME = 'OBSVirtualCamVideo'
SHARED_QUEUE_STATE_INVALID = 0
SHARED_QUEUE_STATE_STARTING = 1
SHARED_QUEUE_STATE_READY = 2
SHARED_QUEUE_STATE_STOPPING = 3
FRAME_HEADER_SIZE = 32

class QueueHeader(ctypes.Structure):
    _fields_ = [
        ('write_idx', wintypes.DWORD),
        ('read_idx', wintypes.DWORD),
        ('state', wintypes.DWORD),
        ('offsets', wintypes.DWORD * 3),
        ('type', wintypes.DWORD),
        ('cx', wintypes.DWORD),
        ('cy', wintypes.DWORD),
        ('interval', ctypes.c_uint64),
        ('reserved', wintypes.DWORD * 8)
    ]

def align_size(size, align=32):
    return (size + (align - 1)) & ~(align - 1)

class DirectVirtualCam:
    def __init__(self, width=1920, height=1080, fps=30):
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

        FILE_MAP_ALL_ACCESS = 0xF001F
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
            h = kernel32.CreateFileMappingW(wintypes.HANDLE(-1), None, 0x04, 0, self.total_size, VIDEO_NAME)
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
        W, H = self.width, self.height
        if bgr_frame.shape[1] != W or bgr_frame.shape[0] != H:
            bgr_frame = cv2.resize(bgr_frame, (W, H), interpolation=cv2.INTER_LINEAR)
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

        inc = (self.header.write_idx + 1) & 0xFFFFFFFF
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


# ==============================================================================
# AUDIO DSP VOICE DISGUISER
# ==============================================================================
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
                        break
            dev = None
            if input_device is not None or output_device is not None:
                in_d = input_device if input_device is not None else sd.default.device[0]
                out_d = output_device if output_device is not None else sd.default.device[1]
                dev = (in_d, out_d)
            self.stream = sd.Stream(device=dev, samplerate=self.sr, blocksize=512, channels=1, dtype='float32', callback=self._audio_callback)
            self.stream.start()
            self.is_running = True
            return True
        except Exception:
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


# ==============================================================================
# SAFE HARDWARE WEBCAM ENUMERATION (FILTERS OUT VIRTUAL CAMS)
# ==============================================================================
def scan_available_cameras(max_tested=8):
    """Memindai HANYA webcam fisik nyata (mengecualikan virtual loopback)."""
    ensure_bifrost_vcam_registered()
    cameras = []
    try:
        from pygrabber.dshow_graph import FilterGraph
        graph = FilterGraph()
        devices = graph.get_input_devices()
        for idx, name in enumerate(devices):
            # FILTER KETAT: Buang perangkat virtual agar tidak terjadi feedback deadlock
            is_vcam = any(k in name.lower() for k in ['bifrost', 'obs virtual camera', 'virtual', 'vcam', 'cyberlink'])
            if not is_vcam:
                cameras.append({'idx': idx, 'name': name, 'raw_name': name, 'is_vcam': False})
    except Exception:
        pass

    if not cameras:
        for idx in range(max_tested):
            try:
                cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
                if not cap.isOpened():
                    cap = cv2.VideoCapture(idx)
                if cap.isOpened():
                    cameras.append({'idx': idx, 'name': f'Kamera Fisik #{idx}', 'raw_name': f'Camera {idx}', 'is_vcam': False})
                    cap.release()
            except Exception:
                pass

    if not cameras:
        cameras.append({'idx': 0, 'name': 'Kamera Fisik Bawaan', 'raw_name': 'Default Camera', 'is_vcam': False})
    return cameras


# ==============================================================================
# MAIN MODERN GLASSMORPHIC APPLICATION
# ==============================================================================
class BIFROSTWitnessShieldApp:
    def __init__(self, root: ctk.CTk):
        self.root = root
        self.root.title('BIFROST Witness Cam — 1080p Full HD')
        self.root.geometry('1140x740')
        self.root.minsize(1020, 650)
        self.root.configure(fg_color=BG_CANVAS)

        # Set App Icon
        ico_candidates = [
            os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'desktop', 'bifrost_cam.ico'),
            os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'bifrost_cam.ico'),
            os.path.join(SCRIPT_DIR, 'bifrost_cam.ico'),
            os.path.join(SCRIPT_DIR, 'desktop', 'bifrost_cam.ico')
        ]
        for p in ico_candidates:
            if os.path.exists(p):
                try:
                    self.root.iconbitmap(p)
                    break
                except Exception:
                    pass

        # States & Logic
        self.is_streaming = False
        self._is_switching = False
        self.is_filter_enabled = ctk.BooleanVar(value=True)
        self.mask_mode = ctk.StringVar(value='mosaic')
        self.pixel_pct = ctk.IntVar(value=70)
        self.pixel_size = 28

        # Target Resolution: 1080p Full HD default
        self.res_mode = ctk.StringVar(value="1080p")
        self.target_width = 1920
        self.target_height = 1080

        self.voice_disguiser = RealtimeVoiceDisguiser()
        self.audio_mode = ctk.StringVar(value='deep_shadow')
        self.audio_fx_pct = ctk.IntVar(value=60)

        self.cap = None
        self.available_cameras = scan_available_cameras()
        self.preferred_cam_idx = 0
        self.selected_camera_idx = ctk.IntVar(value=self.available_cameras[0]['idx'])

        self.vcam = None
        self.latest_stream_frame = None
        self.frame_lock = threading.Lock()
        self.pump_thread = None
        self._init_virtual_cam(1920, 1080)

        self.face_detector = None
        self._init_detector()

        # Build Clean UI
        self._build_clean_ui()

        # Global Hotkey (Spasi to toggle sensor)
        self.root.bind('<space>', lambda e: self.toggle_filter())
        self.root.protocol('WM_DELETE_WINDOW', self.on_close)

        # Autostart safely
        self.root.after(350, self.start_stream)

    def _init_virtual_cam(self, target_w=1920, target_h=1080):
        if self.vcam is not None:
            if getattr(self.vcam, 'width', 0) == target_w and getattr(self.vcam, 'height', 0) == target_h:
                return True
            try:
                self.vcam.close()
            except Exception:
                pass
            self.vcam = None

        ensure_bifrost_vcam_registered()
        try:
            self.vcam = DirectVirtualCam(width=target_w, height=target_h, fps=30)
            self.target_width = target_w
            self.target_height = target_h
            return True
        except Exception:
            try:
                import pyvirtualcam
                self.vcam = pyvirtualcam.Camera(width=target_w, height=target_h, fps=30, fmt=pyvirtualcam.PixelFormat.BGR)
                self.target_width = target_w
                self.target_height = target_h
                return True
            except Exception:
                self.vcam = None
                return False

    def _init_detector(self):
        if os.path.exists(YUNET_MODEL_PATH):
            try:
                self.face_detector = cv2.FaceDetectorYN.create(
                    YUNET_MODEL_PATH, '', (320, 320),
                    score_threshold=0.42, nms_threshold=0.3, top_k=5000
                )
            except Exception:
                self.face_detector = None

    # ==========================================================================
    # USER INTERFACE BUILDER (CLEAN LIGHT GLASSMORPHISM)
    # ==========================================================================
    def _build_clean_ui(self):
        self.root.grid_rowconfigure(1, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

        # ----------------------------------------------------------------------
        # 1. TOP NAVBAR
        # ----------------------------------------------------------------------
        header = ctk.CTkFrame(self.root, fg_color=SURFACE_WHITE, corner_radius=0, height=62, border_width=1, border_color=BORDER_GLASS)
        header.grid(row=0, column=0, sticky="ew")
        header.grid_propagate(False)

        brand_box = ctk.CTkFrame(header, fg_color="transparent")
        brand_box.pack(side="left", padx=24, pady=12)

        lbl_icon = ctk.CTkLabel(brand_box, text="🛡️", font=("Segoe UI Emoji", 20))
        lbl_icon.pack(side="left", padx=(0, 10))

        lbl_title = ctk.CTkLabel(brand_box, text="BIFROST", font=("Segoe UI", 16, "bold"), text_color=TEXT_HEADING)
        lbl_title.pack(side="left")

        lbl_sep = ctk.CTkLabel(brand_box, text="•", font=("Segoe UI", 12), text_color=TEXT_DIM)
        lbl_sep.pack(side="left", padx=8)

        lbl_sub = ctk.CTkLabel(brand_box, text="Witness Cam", font=("Segoe UI", 13, "bold"), text_color=ACCENT_BLUE)
        lbl_sub.pack(side="left")

        lbl_chip = ctk.CTkLabel(
            brand_box, text="Identity Shield", font=("Segoe UI", 10, "bold"),
            text_color="#1E40AF", fg_color="#EFF6FF", corner_radius=12, padx=10, pady=2
        )
        lbl_chip.pack(side="left", padx=(12, 0))

        nav_right = ctk.CTkFrame(header, fg_color="transparent")
        nav_right.pack(side="right", padx=24)

        self.lbl_vcam_chip = ctk.CTkLabel(
            nav_right, text="● 1080p FHD Virtual Cam: Siap di Google Meet / Zoom",
            font=("Segoe UI", 11, "bold"), text_color="#065F46",
            fg_color="#D1FAE5", corner_radius=12, padx=12, pady=4
        )
        self.lbl_vcam_chip.pack(side="left", padx=(0, 12))

        btn_info = ctk.CTkButton(
            nav_right, text="Panduan Setup ↗", font=("Segoe UI", 11, "bold"),
            fg_color=SURFACE_MUTED, hover_color="#E2E8F0", text_color=TEXT_BODY,
            corner_radius=8, width=130, height=32, command=self.show_guide_dialog
        )
        btn_info.pack(side="left")

        # ----------------------------------------------------------------------
        # 2. MAIN BODY
        # ----------------------------------------------------------------------
        body = ctk.CTkFrame(self.root, fg_color="transparent")
        body.grid(row=1, column=0, sticky="nsew", padx=24, pady=20)
        body.grid_rowconfigure(0, weight=1)
        body.grid_columnconfigure(0, weight=3)
        body.grid_columnconfigure(1, weight=2)

        # ------------------- LEFT: CAMERA VIEWPORT -------------------
        viewport_wrapper = ctk.CTkFrame(body, fg_color="transparent")
        viewport_wrapper.grid(row=0, column=0, sticky="nsew", padx=(0, 16))
        viewport_wrapper.grid_rowconfigure(0, weight=1)
        viewport_wrapper.grid_columnconfigure(0, weight=1)

        self.video_card = ctk.CTkFrame(
            viewport_wrapper, fg_color="#090D16", corner_radius=16,
            border_width=1, border_color="#CBD5E1"
        )
        self.video_card.grid(row=0, column=0, sticky="nsew")

        self.preview_label = ctk.CTkLabel(
            self.video_card, text="Menghubungkan Kamera 1080p BIFROST...",
            font=("Segoe UI", 13), text_color="#94A3B8"
        )
        self.preview_label.place(relx=0.5, rely=0.5, anchor="center")

        self.overlay_badge = ctk.CTkLabel(
            self.video_card, text="📹 BIFROST Encrypted Camera (1080p FHD)",
            font=("Segoe UI", 10, "bold"), text_color="#FFFFFF",
            fg_color="#1E293B", corner_radius=8, padx=12, pady=5
        )
        self.overlay_badge.place(x=16, y=16)

        self.lbl_fps_badge = ctk.CTkLabel(
            self.video_card, text="● LIVE 30 FPS",
            font=("Segoe UI", 10, "bold"), text_color="#34D399",
            fg_color="#1E293B", corner_radius=8, padx=12, pady=5
        )
        self.lbl_fps_badge.place(relx=1.0, x=-16, y=16, anchor="ne")

        self.container_w = 640
        self.container_h = 440
        def _on_resize(e):
            if e.width > 50 and e.height > 50:
                self.container_w = e.width
                self.container_h = e.height
        self.video_card.bind("<Configure>", _on_resize)

        # Bottom Camera & Resolution Selector Toolbar
        cam_bar = ctk.CTkFrame(viewport_wrapper, fg_color=SURFACE_WHITE, corner_radius=12, height=54, border_width=1, border_color=BORDER_GLASS)
        cam_bar.grid(row=1, column=0, sticky="ew", pady=(12, 0))
        cam_bar.pack_propagate(False)

        lbl_source = ctk.CTkLabel(cam_bar, text="Kamera Fisik:", font=("Segoe UI", 11, "bold"), text_color=TEXT_MUTED)
        lbl_source.pack(side="left", padx=(16, 8))

        cam_labels = [c['name'] for c in self.available_cameras]
        self.option_cam = ctk.CTkOptionMenu(
            cam_bar, values=cam_labels, width=220, height=32,
            fg_color=SURFACE_MUTED, button_color=ACCENT_BLUE,
            button_hover_color=ACCENT_BLUE_HOVER, dropdown_fg_color=SURFACE_WHITE,
            text_color=TEXT_HEADING, dropdown_text_color=TEXT_HEADING,
            corner_radius=8, font=("Segoe UI", 10),
            command=self.on_camera_option_selected
        )
        if 0 <= self.preferred_cam_idx < len(cam_labels):
            self.option_cam.set(cam_labels[self.preferred_cam_idx])
        self.option_cam.pack(side="left")

        lbl_res = ctk.CTkLabel(cam_bar, text="Resolusi:", font=("Segoe UI", 11, "bold"), text_color=TEXT_MUTED)
        lbl_res.pack(side="left", padx=(16, 8))

        self.seg_res = ctk.CTkSegmentedButton(
            cam_bar, values=["1080p FHD", "720p HD"],
            font=("Segoe UI", 10, "bold"), selected_color=ACCENT_BLUE,
            selected_hover_color=ACCENT_BLUE_HOVER, corner_radius=8, height=32,
            command=self._on_res_change
        )
        self.seg_res.set("1080p FHD")
        self.seg_res.pack(side="left", padx=(0, 14))

        # ------------------- RIGHT: MODERN GLASS CONTROLS -------------------
        controls_card = ctk.CTkFrame(
            body, fg_color=SURFACE_WHITE, corner_radius=16,
            border_width=1, border_color=BORDER_GLASS
        )
        controls_card.grid(row=0, column=1, sticky="nsew")

        scroll_content = ctk.CTkScrollableFrame(controls_card, fg_color="transparent")
        scroll_content.pack(fill="both", expand=True, padx=16, pady=16)

        # 1. Face Sensor Section
        sec_face = ctk.CTkFrame(scroll_content, fg_color=SURFACE_MUTED, corner_radius=12, border_width=1, border_color=BORDER_GLASS)
        sec_face.pack(fill="x", pady=(0, 14))

        face_head = ctk.CTkFrame(sec_face, fg_color="transparent")
        face_head.pack(fill="x", padx=14, pady=(12, 8))

        ctk.CTkLabel(face_head, text="Sensor Wajah Saksi", font=("Segoe UI", 12, "bold"), text_color=TEXT_HEADING).pack(side="left")
        
        self.sw_sensor = ctk.CTkSwitch(
            face_head, text="", width=44, height=22,
            variable=self.is_filter_enabled, progress_color=ACCENT_BLUE,
            command=self.toggle_filter
        )
        self.sw_sensor.pack(side="right")

        self.seg_mask = ctk.CTkSegmentedButton(
            sec_face, values=["Mosaik", "Siluet", "Pita Mata"],
            font=("Segoe UI", 11, "bold"), selected_color=ACCENT_BLUE,
            selected_hover_color=ACCENT_BLUE_HOVER, corner_radius=8, height=34,
            command=self._on_mask_mode_change
        )
        self.seg_mask.set("Mosaik")
        self.seg_mask.pack(fill="x", padx=14, pady=(0, 10))

        slider_head = ctk.CTkFrame(sec_face, fg_color="transparent")
        slider_head.pack(fill="x", padx=14, pady=(0, 4))
        ctk.CTkLabel(slider_head, text="Intensitas Sensor", font=("Segoe UI", 10), text_color=TEXT_MUTED).pack(side="left")
        self.lbl_px_pct = ctk.CTkLabel(slider_head, text="70%", font=("Segoe UI", 11, "bold"), text_color=ACCENT_BLUE)
        self.lbl_px_pct.pack(side="right")

        self.slider_pixel = ctk.CTkSlider(
            sec_face, from_=0, to=100, number_of_steps=100,
            variable=self.pixel_pct, progress_color=ACCENT_BLUE,
            button_color=ACCENT_BLUE, button_hover_color=ACCENT_BLUE_HOVER,
            command=self._on_pixel_slider_change
        )
        self.slider_pixel.pack(fill="x", padx=14, pady=(0, 8))

        presets = ctk.CTkFrame(sec_face, fg_color="transparent")
        presets.pack(fill="x", padx=10, pady=(0, 12))
        for v in [0, 25, 50, 75, 100]:
            ctk.CTkButton(
                presets, text=f"{v}%", font=("Segoe UI", 9, "bold"),
                fg_color=SURFACE_WHITE, hover_color="#E2E8F0", text_color=TEXT_BODY,
                corner_radius=6, height=24, width=44,
                command=lambda val=v: self.set_pixel_percentage(val)
            ).pack(side="left", expand=True, padx=2)

        # 2. Voice Disguiser Section
        sec_voice = ctk.CTkFrame(scroll_content, fg_color=SURFACE_MUTED, corner_radius=12, border_width=1, border_color=BORDER_GLASS)
        sec_voice.pack(fill="x", pady=(0, 14))

        voice_head = ctk.CTkFrame(sec_voice, fg_color="transparent")
        voice_head.pack(fill="x", padx=14, pady=(12, 8))
        ctk.CTkLabel(voice_head, text="Pengubah Suara (Voice DSP)", font=("Segoe UI", 12, "bold"), text_color=TEXT_HEADING).pack(side="left")

        self.seg_voice = ctk.CTkSegmentedButton(
            sec_voice, values=["Deep Shadow", "Robotik", "Normal"],
            font=("Segoe UI", 11, "bold"), selected_color=ACCENT_BLUE,
            selected_hover_color=ACCENT_BLUE_HOVER, corner_radius=8, height=34,
            command=self._on_voice_mode_change
        )
        self.seg_voice.set("Deep Shadow")
        self.seg_voice.pack(fill="x", padx=14, pady=(0, 10))

        v_slider_head = ctk.CTkFrame(sec_voice, fg_color="transparent")
        v_slider_head.pack(fill="x", padx=14, pady=(0, 4))
        ctk.CTkLabel(v_slider_head, text="Modulasi Suara", font=("Segoe UI", 10), text_color=TEXT_MUTED).pack(side="left")
        self.lbl_voice_pct = ctk.CTkLabel(v_slider_head, text="60%", font=("Segoe UI", 11, "bold"), text_color=ACCENT_BLUE)
        self.lbl_voice_pct.pack(side="right")

        self.slider_voice = ctk.CTkSlider(
            sec_voice, from_=0, to=100, number_of_steps=100,
            variable=self.audio_fx_pct, progress_color=ACCENT_BLUE,
            button_color=ACCENT_BLUE, button_hover_color=ACCENT_BLUE_HOVER,
            command=self._on_voice_slider_change
        )
        self.slider_voice.pack(fill="x", padx=14, pady=(0, 12))

        # 3. Single Unified Primary Action Button (Start / Stop)
        self.btn_action = ctk.CTkButton(
            scroll_content, text="■  Hentikan Siaran",
            font=("Segoe UI", 13, "bold"), fg_color=ACCENT_RED,
            hover_color=ACCENT_RED_HOVER, text_color="#FFFFFF",
            corner_radius=10, height=44, command=self.toggle_stream_state
        )
        self.btn_action.pack(fill="x", pady=(4, 8))

        hint_box = ctk.CTkFrame(scroll_content, fg_color="transparent")
        hint_box.pack(fill="x")
        ctk.CTkLabel(
            hint_box, text="Tekan [Spasi] untuk mengaktifkan/mematikan sensor wajah secara instan.",
            font=("Segoe UI", 9), text_color=TEXT_MUTED, wraplength=270, justify="center"
        ).pack()

    # ==========================================================================
    # EVENT HANDLERS & SAFE ASYNCHRONOUS CAMERA SWITCHING
    # ==========================================================================
    def _on_res_change(self, val):
        if "1080p" in val:
            self.res_mode.set("1080p")
            self.target_width = 1920
            self.target_height = 1080
            self.overlay_badge.configure(text="📹 BIFROST Encrypted Camera (1080p FHD)")
            self.lbl_vcam_chip.configure(text="● 1080p FHD Virtual Cam: Siap di Google Meet / Zoom")
        else:
            self.res_mode.set("720p")
            self.target_width = 1280
            self.target_height = 720
            self.overlay_badge.configure(text="📹 BIFROST Encrypted Camera (720p HD)")
            self.lbl_vcam_chip.configure(text="● 720p HD Virtual Cam: Siap di Google Meet / Zoom")
        
        if self.is_streaming:
            threading.Thread(target=self._switch_camera_worker, args=(self.selected_camera_idx.get(),), daemon=True).start()

    def on_camera_option_selected(self, choice_text):
        for c in self.available_cameras:
            if c['name'] == choice_text:
                new_idx = c['idx']
                if new_idx == self.selected_camera_idx.get() and self.is_streaming:
                    return
                self.selected_camera_idx.set(new_idx)
                threading.Thread(target=self._switch_camera_worker, args=(new_idx,), daemon=True).start()
                break

    def _switch_camera_worker(self, new_idx):
        """Asynchronous safe camera switching thread (prevents GUI freeze & DirectShow crashes)."""
        if self._is_switching:
            return
        self._is_switching = True

        self.root.after(0, lambda: self.preview_label.configure(image='', text="Beralih ke kamera..."))
        self.root.after(0, lambda: self.option_cam.configure(state="disabled"))

        # 1. Hentikan loop pengambilan gambar secara bersih
        self.is_streaming = False
        if hasattr(self, 'capture_thread') and self.capture_thread and self.capture_thread.is_alive():
            try:
                self.capture_thread.join(timeout=1.2)
            except Exception:
                pass

        # 2. Release hardware handle secara aman setelah thread capture berhenti
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

        time.sleep(0.15)  # Beri jeda kernel Windows DirectShow untuk melepas driver

        # 3. Buka kamera baru di background thread tanpa membekukan GUI
        target_w, target_h = self.target_width, self.target_height
        new_cap = None
        try:
            new_cap = cv2.VideoCapture(new_idx, cv2.CAP_DSHOW)
            if not new_cap.isOpened():
                new_cap.release()
                new_cap = cv2.VideoCapture(new_idx)
        except Exception:
            new_cap = None

        if new_cap and new_cap.isOpened():
            try:
                new_cap.set(cv2.CAP_PROP_FRAME_WIDTH, target_w)
                new_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, target_h)
            except Exception:
                pass
            self.cap = new_cap
            self._init_virtual_cam(target_w, target_h)
            self.is_streaming = True
            self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.capture_thread.start()
        else:
            self.root.after(0, lambda: self.preview_label.configure(image='', text="Kamera tidak dapat diakses atau sedang digunakan aplikasi lain."))

        self._is_switching = False
        self.root.after(0, lambda: self.option_cam.configure(state="normal"))

    def toggle_stream_state(self):
        """Satu tombol tunggal yang jelas untuk Mulai / Hentikan siaran."""
        if self.is_streaming:
            self.stop_stream()
            self.btn_action.configure(
                text="▶  Mulai Siaran",
                fg_color=ACCENT_BLUE,
                hover_color=ACCENT_BLUE_HOVER
            )
            self.preview_label.configure(image='', text="Kamera Dihentikan • Tekan 'Mulai Siaran'")
            self.lbl_fps_badge.configure(text="● OFFLINE", text_color="#94A3B8")
        else:
            self.start_stream()
            self.btn_action.configure(
                text="■  Hentikan Siaran",
                fg_color=ACCENT_RED,
                hover_color=ACCENT_RED_HOVER
            )

    def _on_mask_mode_change(self, value):
        mapping = {"Mosaik": "mosaic", "Siluet": "silhouette", "Pita Mata": "eyebar"}
        self.mask_mode.set(mapping.get(value, "mosaic"))

    def _on_voice_mode_change(self, value):
        mapping = {"Deep Shadow": "deep_shadow", "Robotik": "robotic", "Normal": "normal"}
        mode = mapping.get(value, "deep_shadow")
        self.audio_mode.set(mode)
        self.voice_disguiser.set_mode(mode)

    def _on_pixel_slider_change(self, val):
        p = int(float(val))
        self.lbl_px_pct.configure(text=f"{p}%")
        self.pixel_size = max(4, int(4 + (p / 100.0) * 36))

    def set_pixel_percentage(self, pct: int):
        self.pixel_pct.set(pct)
        self._on_pixel_slider_change(pct)

    def _on_voice_slider_change(self, val):
        p = int(float(val))
        self.lbl_voice_pct.configure(text=f"{p}%")
        self.voice_disguiser.set_intensity(p / 100.0)

    def toggle_filter(self):
        curr = self.is_filter_enabled.get()
        self.is_filter_enabled.set(not curr)

    def show_guide_dialog(self):
        msg = (
            "PANDUAN BIFROST WITNESS CAM (1080p FULL HD)\n\n"
            "1. Hubungkan ke Google Meet / Zoom:\n"
            "   • Buka Setelan Kamera > Pilih 'BIFROST Encrypted Camera'\n"
            "   • Output video terenkripsi mengalir dalam resolusi 1920x1080 Full HD!\n\n"
            "2. Pengubah Suara Saksi:\n"
            "   • Pasang Virtual Audio Cable (VB-Audio Cable)\n"
            "   • Di Google Meet > Setelan Mikrofon > Pilih 'CABLE Output'\n"
            "   • Peserta rapat akan mendengar suara Deep Shadow yang telah disamarkan.\n\n"
            "Shortcut Keyboard:\n"
            "   • [Spasi] : Sensor Wajah ON / OFF"
        )
        messagebox.showinfo("Panduan BIFROST", msg)

    # ==========================================================================
    # VIDEO STREAMING ENGINE
    # ==========================================================================
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
        rw, rh = x2 - x1, y2 - y1
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
                rex, rey = int(landmarks[0]), int(landmarks[1])
                lex, ley = int(landmarks[2]), int(landmarks[3])
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

    def start_stream(self):
        if self.is_streaming or self._is_switching:
            return
        threading.Thread(target=self._switch_camera_worker, args=(self.selected_camera_idx.get(),), daemon=True).start()
        self.voice_disguiser.start()
        if not self.pump_thread or not self.pump_thread.is_alive():
            self.pump_thread = threading.Thread(target=self._vcam_pump_loop, daemon=True)
            self.pump_thread.start()

    def stop_stream(self):
        self.is_streaming = False
        self.voice_disguiser.stop()
        if hasattr(self, 'capture_thread') and self.capture_thread and self.capture_thread.is_alive():
            try:
                self.capture_thread.join(timeout=1.0)
            except Exception:
                pass
        if hasattr(self, 'pump_thread') and self.pump_thread and self.pump_thread.is_alive():
            try:
                self.pump_thread.join(timeout=0.5)
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
        target_w, target_h = self.target_width, self.target_height

        while self.is_streaming:
            if not self.is_streaming:
                break

            frame = None
            cap_ref = self.cap
            if cap_ref and cap_ref.isOpened():
                try:
                    ret, raw = cap_ref.read()
                    if ret and raw is not None:
                        frame = raw
                except Exception:
                    frame = None

            if not self.is_streaming:
                break

            if frame is None:
                if self.latest_stream_frame is not None:
                    time.sleep(0.01)
                    continue
                else:
                    frame = np.zeros((target_h, target_w, 3), dtype=np.uint8) + 20
                    cv2.putText(frame, 'Menghubungkan kamera 1080p...', (target_w // 4, target_h // 2), cv2.FONT_HERSHEY_SIMPLEX, 1, (160, 160, 160), 2)
                    time.sleep(0.03)

            H, W = frame.shape[:2]
            if W != target_w or H != target_h:
                frame = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
                H, W = target_h, target_w

            # AI Face Detection
            if self.is_filter_enabled.get() and self.face_detector is not None:
                try:
                    det_w = max(320, int(W * 0.5))
                    det_h = max(180, int(H * 0.5))
                    det_frame = cv2.resize(frame, (det_w, det_h))
                    self.face_detector.setInputSize((det_w, det_h))
                    _, detections = self.face_detector.detect(det_frame)
                    if detections is not None:
                        scale_x = W / det_w
                        scale_y = H / det_h
                        for det in detections:
                            conf = float(det[-1])
                            if conf > 0.4:
                                fx = int(det[0] * scale_x)
                                fy = int(det[1] * scale_y)
                                fw = int(det[2] * scale_x)
                                fh = int(det[3] * scale_y)
                                landmarks = [
                                    det[4] * scale_x, det[5] * scale_y,
                                    det[6] * scale_x, det[7] * scale_y
                                ]
                                self._apply_face_mask(frame, fx, fy, fw, fh, landmarks)
                except Exception:
                    pass

            with self.frame_lock:
                self.latest_stream_frame = frame.copy()

            # Render to Viewport
            cw, ch = self.container_w, self.container_h
            if cw > 60 and ch > 60:
                scale = min(cw / W, ch / H)
                nw = max(1, int(W * scale))
                nh = max(1, int(H * scale))
                prev_res = cv2.resize(frame, (nw, nh))
                prev_rgb = cv2.cvtColor(prev_res, cv2.COLOR_BGR2RGB)
                
                ctk_img = ctk.CTkImage(
                    light_image=Image.fromarray(prev_rgb),
                    dark_image=Image.fromarray(prev_rgb),
                    size=(nw, nh)
                )
                self.preview_label.configure(image=ctk_img, text='')
                self.preview_label.image = ctk_img

            fps_counter += 1
            if time.time() - last_fps_time >= 1.0:
                cur_fps = fps_counter / (time.time() - last_fps_time)
                fps_counter = 0
                last_fps_time = time.time()
                self.lbl_fps_badge.configure(text=f'● LIVE {cur_fps:.0f} FPS')

    def _vcam_pump_loop(self):
        while True:
            if not self.is_streaming:
                time.sleep(0.05)
                continue
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
            self.cap = None
        self.root.destroy()


def main():
    ensure_single_instance()
    time.sleep(0.1)
    root = ctk.CTk()
    app = BIFROSTWitnessShieldApp(root)
    root.mainloop()


if __name__ == '__main__':
    main()
