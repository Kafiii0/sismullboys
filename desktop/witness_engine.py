import sys
import os
import time
import threading
import ctypes
from ctypes import wintypes
import cv2
import numpy as np
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

try:
    import sounddevice as sd
    HAS_SOUNDDEVICE = True
except ImportError:
    HAS_SOUNDDEVICE = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
YUNET_MODEL_PATH = os.path.join(SCRIPT_DIR, '..', 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(getattr(sys, '_MEIPASS', SCRIPT_DIR), 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(os.path.dirname(sys.executable), 'scripts', 'face_detection_yunet.onnx')
if not os.path.exists(YUNET_MODEL_PATH):
    YUNET_MODEL_PATH = os.path.join(os.path.dirname(sys.executable), '_internal', 'scripts', 'face_detection_yunet.onnx')



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
# DIRECTSHOW VIRTUAL CAMERA LOW-LEVEL MEMORY MAPPING
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


def scan_available_cameras(max_tested=8):
    ensure_bifrost_vcam_registered()
    cameras = []
    try:
        from pygrabber.dshow_graph import FilterGraph
        graph = FilterGraph()
        devices = graph.get_input_devices()
        for idx, name in enumerate(devices):
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
# WITNESS ENGINE CORE
# ==============================================================================
class WitnessEngine:
    def __init__(self):
        self.is_streaming = False
        self._is_switching = False
        self.is_filter_enabled = True
        self.mask_mode = 'mosaic'
        self.pixel_pct = 70
        self.pixel_size = 28
        self.res_mode = '1080p'
        self.target_width = 1920
        self.target_height = 1080

        self.voice_disguiser = RealtimeVoiceDisguiser()
        self.audio_mode = 'deep_shadow'
        self.audio_fx_pct = 60

        self.available_cameras = scan_available_cameras()
        self.selected_camera_idx = self.available_cameras[0]['idx'] if self.available_cameras else 0

        self.cap = None
        self.vcam = None
        self.latest_frame = None
        self.frame_lock = threading.Lock()
        self.capture_thread = None
        self.pump_thread = None

        self.face_detector = None
        self._init_detector()
        self._init_virtual_cam(1920, 1080)

        # Autostart
        self.start_stream()

    def _init_virtual_cam(self, w=1920, h=1080):
        if self.vcam is not None:
            if getattr(self.vcam, 'width', 0) == w and getattr(self.vcam, 'height', 0) == h:
                return True
            try:
                self.vcam.close()
            except Exception:
                pass
            self.vcam = None

        ensure_bifrost_vcam_registered()
        try:
            self.vcam = DirectVirtualCam(width=w, height=h, fps=30)
            self.target_width = w
            self.target_height = h
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

    def start_stream(self):
        if self.is_streaming or self._is_switching:
            return
        threading.Thread(target=self._switch_camera_worker, args=(self.selected_camera_idx,), daemon=True).start()
        self.voice_disguiser.start()
        if not self.pump_thread or not self.pump_thread.is_alive():
            self.pump_thread = threading.Thread(target=self._vcam_pump_loop, daemon=True)
            self.pump_thread.start()

    def stop_stream(self):
        self.is_streaming = False
        self.voice_disguiser.stop()
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

    def _switch_camera_worker(self, new_idx):
        if self._is_switching:
            return
        self._is_switching = True
        self.is_streaming = False

        if hasattr(self, 'capture_thread') and self.capture_thread and self.capture_thread.is_alive():
            try:
                self.capture_thread.join(timeout=1.2)
            except Exception:
                pass

        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None

        time.sleep(0.15)
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
            self.selected_camera_idx = new_idx
            self._init_virtual_cam(target_w, target_h)
            self.is_streaming = True
            self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.capture_thread.start()

        self._is_switching = False

    def _apply_face_mask(self, frame, x, y, w, h, landmarks):
        H, W = frame.shape[:2]
        mode = self.mask_mode
        pct = self.pixel_pct
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

    def _capture_loop(self):
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

            if frame is None:
                frame = np.zeros((target_h, target_w, 3), dtype=np.uint8) + 20
                cv2.putText(frame, 'Menghubungkan kamera 1080p...', (target_w // 4, target_h // 2), cv2.FONT_HERSHEY_SIMPLEX, 1, (160, 160, 160), 2)
                time.sleep(0.03)

            H, W = frame.shape[:2]
            if W != target_w or H != target_h:
                frame = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
                H, W = target_h, target_w

            if self.is_filter_enabled and self.face_detector is not None:
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
                self.latest_frame = frame.copy()

    def _vcam_pump_loop(self):
        while True:
            if not self.is_streaming:
                time.sleep(0.05)
                continue
            t0 = time.time()
            if self.vcam is not None:
                send_frame = None
                with self.frame_lock:
                    if self.latest_frame is not None:
                        send_frame = self.latest_frame.copy()
                if send_frame is not None:
                    try:
                        self.vcam.send(send_frame)
                    except Exception:
                        pass
            elapsed = time.time() - t0
            time.sleep(max(0.002, 1.0 / 30.0 - elapsed))

    def get_latest_frame(self):
        with self.frame_lock:
            if self.latest_frame is not None:
                return self.latest_frame.copy()
        return None


engine = WitnessEngine()

# ==============================================================================
# FASTAPI ENGINE API
# ==============================================================================
app = FastAPI(title="BIFROST Witness Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StatusResponse(BaseModel):
    is_streaming: bool
    is_filter_enabled: bool
    mask_mode: str
    pixel_pct: int
    audio_mode: str
    audio_fx_pct: int
    res_mode: str
    available_cameras: list
    selected_camera_idx: int

@app.get("/status")
def get_status():
    return {
        "is_streaming": engine.is_streaming,
        "is_filter_enabled": engine.is_filter_enabled,
        "mask_mode": engine.mask_mode,
        "pixel_pct": engine.pixel_pct,
        "audio_mode": engine.audio_mode,
        "audio_fx_pct": engine.audio_fx_pct,
        "res_mode": engine.res_mode,
        "available_cameras": engine.available_cameras,
        "selected_camera_idx": engine.selected_camera_idx,
    }

@app.post("/stream/toggle")
def toggle_stream():
    if engine.is_streaming:
        engine.stop_stream()
    else:
        engine.start_stream()
    return {"is_streaming": engine.is_streaming}

@app.post("/sensor/toggle")
def toggle_sensor():
    engine.is_filter_enabled = not engine.is_filter_enabled
    return {"is_filter_enabled": engine.is_filter_enabled}

@app.post("/sensor/mode")
def set_mask_mode(mode: str):
    if mode in ["mosaic", "silhouette", "eyebar"]:
        engine.mask_mode = mode
    return {"mask_mode": engine.mask_mode}

@app.post("/sensor/intensity")
def set_pixel_intensity(val: int):
    val = max(0, min(100, val))
    engine.pixel_pct = val
    engine.pixel_size = max(4, int(4 + (val / 100.0) * 36))
    return {"pixel_pct": engine.pixel_pct}

@app.post("/voice/mode")
def set_voice_mode(mode: str):
    if mode in ["deep_shadow", "robotic", "normal"]:
        engine.audio_mode = mode
        engine.voice_disguiser.set_mode(mode)
    return {"audio_mode": engine.audio_mode}

@app.post("/voice/intensity")
def set_voice_intensity(val: int):
    val = max(0, min(100, val))
    engine.audio_fx_pct = val
    engine.voice_disguiser.set_intensity(val / 100.0)
    return {"audio_fx_pct": engine.audio_fx_pct}

@app.post("/camera/select")
def select_camera(idx: int):
    threading.Thread(target=engine._switch_camera_worker, args=(idx,), daemon=True).start()
    return {"selected_camera_idx": idx}

@app.post("/camera/resolution")
def set_resolution(res: str):
    if res == "1080p":
        engine.res_mode = "1080p"
        engine.target_width = 1920
        engine.target_height = 1080
    else:
        engine.res_mode = "720p"
        engine.target_width = 1280
        engine.target_height = 720
    if engine.is_streaming:
        threading.Thread(target=engine._switch_camera_worker, args=(engine.selected_camera_idx,), daemon=True).start()
    return {"res_mode": engine.res_mode}

def generate_mjpeg_frames():
    while True:
        frame = engine.get_latest_frame()
        if frame is not None:
            # Resize preview untuk transmisi web super cepat tanpa jeda
            preview_frame = cv2.resize(frame, (960, 540), interpolation=cv2.INTER_LINEAR)
            ret, buffer = cv2.imencode('.jpg', preview_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.016)

@app.get("/stream")
def video_stream():
    return StreamingResponse(generate_mjpeg_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.post("/api/shutdown")
def shutdown_app():
    def _kill():
        time.sleep(0.3)
        os._exit(0)
    threading.Thread(target=_kill, daemon=True).start()
    return {"status": "ok"}


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


def start_parent_watchdog(target_pid: int):
    def _watch():
        try:
            import psutil
            while True:
                time.sleep(2)
                if not psutil.pid_exists(target_pid):
                    os._exit(0)
        except Exception:
            pass
    t = threading.Thread(target=_watch, daemon=True)
    t.start()


if __name__ == '__main__':
    if is_port_in_use(8765):
        print("[WitnessEngine] Port 8765 already running. Existing engine in use.")
        sys.exit(0)

    # Cek argument --parent-pid
    if "--parent-pid" in sys.argv:
        try:
            idx = sys.argv.index("--parent-pid")
            parent_pid = int(sys.argv[idx + 1])
            start_parent_watchdog(parent_pid)
        except Exception:
            pass

    uvicorn.run(app, host="127.0.0.1", port=8765, log_level="warning")


