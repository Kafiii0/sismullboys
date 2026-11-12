import sys
import os
import re
import time
import threading
import ctypes
from ctypes import wintypes
import cv2
import numpy as np
import mss
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

user32 = ctypes.windll.user32

try:
    import rapidocr_onnxruntime
except Exception:
    rapidocr_onnxruntime = None

# ==============================================================================
# PATTERNS & REGEX FOR PII SENSITIVITY
# ==============================================================================
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', re.IGNORECASE)
PHONE_REGEX = re.compile(r'(?:\+?62|08)[\d\s-]{7,16}')
PASSWORD_BULLETS_REGEX = re.compile(r'(?:[•●\*\.]{3,}|[\u2022\u25cf\u2219\u25aa\u22c5]{2,})')
TOKEN_REGEX = re.compile(r'\b(ey[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}|\bghp_[0-9a-zA-Z]{30,}|\b[a-fA-F0-9]{32,64}\b)')
CREDIT_CARD_REGEX = re.compile(r'\b(?:\d{4}[ -]?){3}\d{4}\b')
NIK_REGEX = re.compile(r'\b\d{16}\b')
BANK_ACCOUNT_REGEX = re.compile(r'\b\d{10,16}\b')

FORM_LABEL_MAPPINGS = {
    'email': 'KOLOM EMAIL',
    'surel': 'KOLOM EMAIL',
    'password': 'KOLOM SANDI',
    'kata sandi': 'KOLOM SANDI',
    'sandi': 'KOLOM SANDI',
    'pin': 'KOLOM PIN',
    'username': 'KOLOM USERNAME',
    'token': 'KOLOM TOKEN',
    'api key': 'KOLOM API KEY',
    'rekening': 'KOLOM REKENING',
    'no rekening': 'KOLOM REKENING',
    'card number': 'KOLOM KARTU',
    'cvv': 'KOLOM CVV',
    'otp': 'KOLOM OTP'
}

REAL_BROWSER_EXES = {'chrome.exe', 'msedge.exe', 'brave.exe', 'firefox.exe', 'opera.exe', 'vivaldi.exe', 'arc.exe', 'chromium.exe'}
NON_BROWSER_EXES = {
    'antigravity.exe', 'code.exe', 'cursor.exe', 'devenv.exe', 'pycharm64.exe',
    'idea64.exe', 'powerpnt.exe', 'winword.exe', 'excel.exe', 'notepad.exe',
    'explorer.exe', 'cmd.exe', 'powershell.exe', 'pwsh.exe', 'obs64.exe', 'app.exe'
}

_PID_PNAME_CACHE = {}
_PID_PNAME_CACHE_TIME = {}

def get_process_name_cached(pid_val):
    if not pid_val:
        return ''
    now = time.time()
    if pid_val in _PID_PNAME_CACHE and (now - _PID_PNAME_CACHE_TIME.get(pid_val, 0) < 5.0):
        return _PID_PNAME_CACHE[pid_val]
    try:
        import psutil
        pname = psutil.Process(pid_val).name().lower()
        _PID_PNAME_CACHE[pid_val] = pname
        _PID_PNAME_CACHE_TIME[pid_val] = now
        return pname
    except Exception:
        return ''

def get_foreground_process_info():
    try:
        hwnd = user32.GetForegroundWindow()
        if not hwnd:
            return ('', '')
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        pname = get_process_name_cached(pid.value)
        length = user32.GetWindowTextLengthW(hwnd)
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value.lower()
        return (pname, title)
    except Exception:
        return ('', '')

def check_win32_toast_window(screen_w=1920, screen_h=1080):
    found_box = None
    try:
        def callback(hwnd, extra):
            nonlocal found_box
            if not user32.IsWindowVisible(hwnd):
                return 1
            rect = wintypes.RECT()
            user32.GetWindowRect(hwnd, ctypes.byref(rect))
            w = rect.right - rect.left
            h = rect.bottom - rect.top
            if rect.left >= int(screen_w * 0.55) and rect.top >= int(screen_h * 0.45):
                if 160 <= w <= 540 and 40 <= h <= 320:
                    found_box = (max(0, rect.left), max(0, rect.top), w, h)
                    return 0
            return 1
        WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        user32.EnumWindows(WNDENUMPROC(callback), 0)
    except Exception:
        pass
    return found_box

def scan_whatsapp_windows(screen_w=1920, screen_h=1080):
    wa_rects = []
    is_fg_wa = False
    fg_hwnd = user32.GetForegroundWindow()
    if fg_hwnd:
        pname, title = get_foreground_process_info()
        if 'whatsapp' in pname or 'whatsapp' in title:
            is_fg_wa = True
            rect = wintypes.RECT()
            user32.GetWindowRect(fg_hwnd, ctypes.byref(rect))
            wx = max(0, rect.left)
            wy = max(0, rect.top)
            ww = min(screen_w - wx, rect.right - rect.left)
            wh = min(screen_h - wy, rect.bottom - rect.top)
            if ww > 150 and wh > 150:
                wa_rects.append((wx, wy, ww, wh))
                return wa_rects, is_fg_wa

    def enum_cb(hwnd, lparam):
        if not user32.IsWindowVisible(hwnd) or user32.IsIconic(hwnd):
            return True
        rect = wintypes.RECT()
        user32.GetWindowRect(hwnd, ctypes.byref(rect))
        w = rect.right - rect.left
        h = rect.bottom - rect.top
        if w < 180 or h < 180:
            return True
        length = user32.GetWindowTextLengthW(hwnd)
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value.lower()
        if 'whatsapp' in title:
            wx = max(0, rect.left)
            wy = max(0, rect.top)
            ww = min(screen_w - wx, w)
            wh = min(screen_h - wy, h)
            if ww > 150 and wh > 150:
                wa_rects.append((wx, wy, ww, wh))
            return True
        return True

    try:
        WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
    except Exception:
        pass
    return wa_rects, is_fg_wa


# ==============================================================================
# SMART DETECTOR CLASSES
# ==============================================================================
class SmartToastDetector:
    def __init__(self, duration_sec: float = 4.0):
        self.duration_sec = duration_sec
        self.active_until = 0
        self.is_active = False

    def update(self, screen_w=1920, screen_h=1080):
        now = time.time()
        toast_box = check_win32_toast_window(screen_w, screen_h)
        if toast_box is not None:
            self.active_until = now + self.duration_sec
            self.is_active = True
            return True, toast_box
        if now < self.active_until:
            self.is_active = True
            bx = int(screen_w * 0.68)
            by = int(screen_h * 0.70)
            bw = int(screen_w * 0.31)
            bh = int(screen_h * 0.28)
            return True, (bx, by, bw, bh)
        self.is_active = False
        return False, None


class SmartBookmarkDetector:
    def __init__(self):
        self.custom_y_offset = 80
        self.custom_height = 46

    def check(self, H, W):
        pname, title = get_foreground_process_info()
        if pname in NON_BROWSER_EXES or any(ex in pname for ex in ['antigravity', 'code', 'cursor', 'terminal', 'powerpnt']):
            return False, 0, 0
        is_real_browser = (
            pname in REAL_BROWSER_EXES or
            any(pname.startswith(p) for p in ['chrome', 'msedge', 'brave', 'firefox', 'opera']) or
            any(title.endswith(sfx) for sfx in ['- google chrome', '- microsoft edge', '- brave', '- mozilla firefox'])
        )
        if is_real_browser:
            y1 = int(self.custom_y_offset * (H / 1080.0))
            y2 = y1 + int(self.custom_height * (H / 1080.0))
            return True, y1, y2
        return False, 0, 0


class SmartAntiLoopDetector:
    def __init__(self):
        self.enabled = True

    def check(self):
        if not self.enabled:
            return False, ''
        _, title = get_foreground_process_info()
        if any(k in title for k in ['meet.google.com', 'google meet']) or title.startswith('meet - ') or '- meet -' in title:
            return True, 'Google Meet (Anti-Loop)'
        if any(k in title for k in ['zoom meeting', 'zoom workplace', 'microsoft teams']):
            return True, 'Online Meeting (Anti-Loop)'
        return False, ''


# ==============================================================================
# MAIN ENGINE CONTROLLER
# ==============================================================================
class HDMIShieldEngine:
    def __init__(self):
        self.sct = mss.mss()
        self.monitors = self.sct.monitors
        self.selected_monitor_idx = 1 if len(self.monitors) > 1 else 0
        
        self.is_streaming = True
        self.is_panic = False
        self.mask_style = 'mosaic'  # 'mosaic', 'blur', 'solid'
        
        # Detector modules
        self.smart_toast = SmartToastDetector()
        self.smart_bookmark = SmartBookmarkDetector()
        self.smart_anti_loop = SmartAntiLoopDetector()
        
        # Toggles
        self.enable_toast_sensor = True
        self.enable_bookmark_sensor = True
        self.enable_wa_sensor = True
        self.enable_ocr_pii_sensor = True
        self.enable_anti_loop = True
        
        # OCR state
        self.ocr_engine = None
        self.active_pii_boxes = []
        self.pii_lock = threading.Lock()
        
        # Latest frame buffer
        self.latest_frame = None
        self.frame_lock = threading.Lock()
        self.fps = 0.0
        
        # Projector display state
        self.is_projector_open = False
        self.projector_thread = None
        
        self._init_ocr()
        threading.Thread(target=self._capture_worker, daemon=True).start()
        threading.Thread(target=self._ocr_worker, daemon=True).start()

    def _init_ocr(self):
        def _load():
            try:
                import rapidocr_onnxruntime
                cpu = os.cpu_count() or 4
                self.ocr_engine = rapidocr_onnxruntime.RapidOCR(intra_op_num_threads=min(4, cpu))
                print('[HDMI Engine] RapidOCR ready.')
            except Exception as e:
                print(f'[HDMI Engine] OCR note: {e}')
        threading.Thread(target=_load, daemon=True).start()

    def apply_mask(self, img, x, y, w, h, style='mosaic', badge_text=''):
        H, W = img.shape[:2]
        x = max(0, x)
        y = max(0, y)
        w = min(w, W - x)
        h = min(h, H - y)
        if w <= 0 or h <= 0:
            return
        if style == 'solid':
            img[y:y+h, x:x+w] = (15, 23, 42)
        elif style == 'mosaic':
            roi = img[y:y+h, x:x+w]
            if roi.size > 0:
                grid = max(10, min(24, w // 14))
                small_w = max(1, w // grid)
                small_h = max(1, h // grid)
                small = cv2.resize(roi, (small_w, small_h), interpolation=cv2.INTER_LINEAR)
                img[y:y+h, x:x+w] = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
        else:
            roi = img[y:y+h, x:x+w]
            if roi.size > 0:
                k = max(21, (w // 10) | 1)
                img[y:y+h, x:x+w] = cv2.GaussianBlur(roi, (k, k), 35)

        if badge_text and w >= 120 and h >= 24:
            label = f'🔒 {badge_text}'
            cv2.rectangle(img, (x + 8, y + 6), (x + min(w - 10, 220), y + 28), (15, 23, 42), -1)
            cv2.rectangle(img, (x + 8, y + 6), (x + min(w - 10, 220), y + 28), (56, 189, 248), 1)
            cv2.putText(img, label, (x + 14, y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (241, 245, 249), 1, cv2.LINE_AA)

    def draw_curtain(self, img, reason='Google Meet'):
        H, W = img.shape[:2]
        img[:] = (15, 23, 42)
        center_x = W // 2
        center_y = H // 2
        title = 'BIFROST ANTI-LOOP PRIVACY CURTAIN'
        desc = f'Deteksi aktif: {reason}. Layar presentasi diproteksi dari efek cermin.'
        
        cv2.putText(img, title, (center_x - 320, center_y - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (56, 189, 248), 2, cv2.LINE_AA)
        cv2.putText(img, desc, (center_x - 300, center_y + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (148, 163, 184), 1, cv2.LINE_AA)
        cv2.putText(img, 'Buka jendela aplikasi/dokumen yang ingin dipresentasikan.', (center_x - 240, center_y + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 116, 139), 1, cv2.LINE_AA)

    def _ocr_worker(self):
        while True:
            if not self.is_streaming or not self.enable_ocr_pii_sensor or self.ocr_engine is None or self.is_panic:
                time.sleep(0.4)
                continue
            
            with self.frame_lock:
                if self.latest_frame is None:
                    frame = None
                else:
                    frame = self.latest_frame.copy()

            if frame is None:
                time.sleep(0.1)
                continue

            try:
                H, W = frame.shape[:2]
                ocr_img = cv2.resize(frame, (W // 2, H // 2))
                res, _ = self.ocr_engine(ocr_img)
                
                boxes = []
                now = time.time()
                if res:
                    for item in res:
                        poly, text, score = item[0], item[1], item[2]
                        if score < 0.45 or not text:
                            continue
                        text_str = str(text).strip()
                        t_lower = text_str.lower()
                        
                        is_sensitive = False
                        tag = 'DATA PRIVAT'

                        if EMAIL_REGEX.search(text_str) or '@' in t_lower:
                            is_sensitive = True
                            tag = 'EMAIL'
                        elif PASSWORD_BULLETS_REGEX.search(text_str) or any(k in t_lower for k in ['password', 'sandi', 'passcode']):
                            is_sensitive = True
                            tag = 'SANDI'
                        elif TOKEN_REGEX.search(text_str) or 'token' in t_lower:
                            is_sensitive = True
                            tag = 'TOKEN'
                        elif CREDIT_CARD_REGEX.search(text_str) or BANK_ACCOUNT_REGEX.search(text_str):
                            is_sensitive = True
                            tag = 'REKENING'
                        elif NIK_REGEX.search(text_str):
                            is_sensitive = True
                            tag = 'NIK'
                        elif PHONE_REGEX.search(text_str):
                            is_sensitive = True
                            tag = 'NO TELP'
                        elif any(lbl in t_lower for lbl in FORM_LABEL_MAPPINGS):
                            for k, v in FORM_LABEL_MAPPINGS.items():
                                if k in t_lower:
                                    is_sensitive = True
                                    tag = v
                                    break

                        if is_sensitive:
                            pts = np.array(poly, dtype=np.int32) * 2
                            bx, by, bw, bh = cv2.boundingRect(pts)
                            # Perluas box agar mencakup kolom isian
                            bx = max(0, bx - 10)
                            by = max(0, by - 6)
                            bw = min(W - bx, bw + 20)
                            bh = min(H - by, bh + 12)
                            boxes.append({'box': (bx, by, bw, bh), 'tag': tag, 'until': now + 3.0})

                with self.pii_lock:
                    # Gabungkan box yang masih berlaku
                    valid_existing = [b for b in self.active_pii_boxes if b['until'] > now]
                    self.active_pii_boxes = valid_existing + boxes
            except Exception as e:
                pass
            time.sleep(0.35)

    def _capture_worker(self):
        last_t = time.time()
        fps_count = 0
        fps_timer = time.time()

        while True:
            if not self.is_streaming:
                time.sleep(0.1)
                continue

            try:
                mon_idx = min(self.selected_monitor_idx, len(self.monitors) - 1)
                target_mon = self.monitors[mon_idx]
                raw = self.sct.grab(target_mon)
                frame = np.array(raw)[:, :, :3]  # BGRA to BGR
                H, W = frame.shape[:2]

                if self.is_panic:
                    frame[:] = (0, 0, 0)
                    cv2.putText(frame, "PANIC BLACKOUT AKTIF", (W // 2 - 200, H // 2), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2, cv2.LINE_AA)
                else:
                    # 1. Anti-Loop
                    if self.enable_anti_loop:
                        is_loop, reason = self.smart_anti_loop.check()
                        if is_loop:
                            self.draw_curtain(frame, reason)
                            with self.frame_lock:
                                self.latest_frame = frame
                            time.sleep(0.03)
                            continue

                    # 2. Browser Bookmark Bar
                    if self.enable_bookmark_sensor:
                        is_bm, y1, y2 = self.smart_bookmark.check(H, W)
                        if is_bm and y2 > y1:
                            self.apply_mask(frame, 0, y1, W, y2 - y1, self.mask_style, 'BOOKMARK BROWSER')

                    # 3. Toast Notifications
                    if self.enable_toast_sensor:
                        is_toast, t_box = self.smart_toast.update(W, H)
                        if is_toast and t_box:
                            tx, ty, tw, th = t_box
                            self.apply_mask(frame, tx, ty, tw, th, self.mask_style, 'POP-UP NOTIFIKASI')

                    # 4. WhatsApp Window
                    if self.enable_wa_sensor:
                        wa_rects, is_fg = scan_whatsapp_windows(W, H)
                        for wx, wy, ww, wh in wa_rects:
                            self.apply_mask(frame, wx, wy, ww, wh, self.mask_style, 'WHATSAPP OBROLAN')

                    # 5. AI OCR PII
                    if self.enable_ocr_pii_sensor:
                        now = time.time()
                        with self.pii_lock:
                            for item in self.active_pii_boxes:
                                if item['until'] > now:
                                    bx, by, bw, bh = item['box']
                                    self.apply_mask(frame, bx, by, bw, bh, self.mask_style, item['tag'])

                with self.frame_lock:
                    self.latest_frame = frame

                fps_count += 1
                if time.time() - fps_timer >= 1.0:
                    self.fps = round(fps_count / (time.time() - fps_timer), 1)
                    fps_count = 0
                    fps_timer = time.time()

                time.sleep(0.016)  # ~60 FPS cap
            except Exception as e:
                time.sleep(0.05)

    def launch_projector_window(self):
        if self.is_projector_open:
            return
        self.is_projector_open = True

        def _win_worker():
            win_name = "BIFROST HDMI Output - Proyektor"
            cv2.namedWindow(win_name, cv2.WINDOW_NORMAL)
            if len(self.monitors) > 2:
                m2 = self.monitors[2]
                cv2.moveWindow(win_name, m2['left'], m2['top'])
                cv2.setWindowProperty(win_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

            while self.is_projector_open:
                with self.frame_lock:
                    if self.latest_frame is not None:
                        disp = self.latest_frame.copy()
                    else:
                        disp = None
                if disp is not None:
                    cv2.imshow(win_name, disp)
                key = cv2.waitKey(20) & 0xFF
                if key == 27 or key == ord('q'):  # ESC to close
                    break
            cv2.destroyWindow(win_name)
            self.is_projector_open = False

        self.projector_thread = threading.Thread(target=_win_worker, daemon=True)
        self.projector_thread.start()

    def close_projector_window(self):
        self.is_projector_open = False


engine = HDMIShieldEngine()

# ==============================================================================
# FASTAPI APP
# ==============================================================================
app = FastAPI(title="BIFROST HDMI Shield Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SettingsPayload(BaseModel):
    mask_style: str = "mosaic"
    selected_monitor: int = 1
    enable_toast: bool = True
    enable_bookmark: bool = True
    enable_wa: bool = True
    enable_ocr: bool = True
    enable_anti_loop: bool = True

@app.get("/status")
def get_status():
    monitors_info = []
    for idx, m in enumerate(engine.monitors):
        if idx == 0:
            continue
        monitors_info.append({
            "index": idx,
            "width": m['width'],
            "height": m['height'],
            "label": f"Layar {idx} ({m['width']}x{m['height']})"
        })
    return {
        "is_streaming": engine.is_streaming,
        "is_panic": engine.is_panic,
        "is_projector_open": engine.is_projector_open,
        "fps": engine.fps,
        "mask_style": engine.mask_style,
        "selected_monitor": engine.selected_monitor_idx,
        "monitors": monitors_info,
        "guards": {
            "toast": engine.enable_toast_sensor,
            "bookmark": engine.enable_bookmark_sensor,
            "whatsapp": engine.enable_wa_sensor,
            "ocr": engine.enable_ocr_pii_sensor,
            "anti_loop": engine.enable_anti_loop,
        }
    }

@app.post("/toggle_stream")
def toggle_stream():
    engine.is_streaming = not engine.is_streaming
    return {"is_streaming": engine.is_streaming}

@app.post("/toggle_panic")
def toggle_panic():
    engine.is_panic = not engine.is_panic
    return {"is_panic": engine.is_panic}

@app.post("/settings")
def update_settings(payload: SettingsPayload):
    engine.mask_style = payload.mask_style
    engine.selected_monitor_idx = payload.selected_monitor
    engine.enable_toast_sensor = payload.enable_toast
    engine.enable_bookmark_sensor = payload.enable_bookmark
    engine.enable_wa_sensor = payload.enable_wa
    engine.enable_ocr_pii_sensor = payload.enable_ocr
    engine.enable_anti_loop = payload.enable_anti_loop
    return {"status": "updated"}

@app.post("/projector/open")
def open_projector():
    engine.launch_projector_window()
    return {"is_projector_open": True}

@app.post("/projector/close")
def close_projector():
    engine.close_projector_window()
    return {"is_projector_open": False}

@app.post("/api/shutdown")
def shutdown_app():
    def _kill():
        time.sleep(0.3)
        os._exit(0)
    threading.Thread(target=_kill, daemon=True).start()
    return {"status": "ok"}

def generate_frames():
    while True:
        with engine.frame_lock:
            frame = None if engine.latest_frame is None else engine.latest_frame.copy()
        if frame is not None:
            preview = cv2.resize(frame, (960, 540), interpolation=cv2.INTER_LINEAR)
            ret, buf = cv2.imencode('.jpg', preview, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        time.sleep(0.02)

@app.get("/stream")
def stream_video():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

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
    threading.Thread(target=_watch, daemon=True).start()

if __name__ == '__main__':
    if is_port_in_use(8766):
        print("[HDMIShieldEngine] Port 8766 already running.")
        sys.exit(0)

    if "--parent-pid" in sys.argv:
        try:
            idx = sys.argv.index("--parent-pid")
            parent_pid = int(sys.argv[idx + 1])
            start_parent_watchdog(parent_pid)
        except Exception:
            pass

    uvicorn.run(app, host="127.0.0.1", port=8766, log_level="warning")

