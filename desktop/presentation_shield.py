import sys
import os
import re
import time
import threading
import tkinter as tk
from tkinter import ttk
import cv2
import numpy as np
import mss
from PIL import Image, ImageTk, ImageDraw, ImageFont
import ctypes
from ctypes import wintypes
user32 = ctypes.windll.user32
try:
    import rapidocr_onnxruntime
except Exception:
    rapidocr_onnxruntime = None
BG_VOID = '#070B14'
GLASS_BG = '#0D1527'
GLASS_CARD = '#121D36'
GLASS_CARD_HOVER = '#182748'
GLASS_BORDER = '#1E2E52'
GLASS_BORDER_LIGHT = '#2B4173'
ACCENT_CYAN = '#38BDF8'
ACCENT_EMERALD = '#10B981'
ACCENT_AMBER = '#F59E0B'
ACCENT_ROSE = '#F43F5E'
TEXT_TITLE = '#FFFFFF'
TEXT_WHITE = '#FFFFFF'
TEXT_BODY = '#E2E8F0'
TEXT_MUTED = '#94A3B8'
TEXT_FAINT = '#64748B'
EMAIL_REGEX = re.compile('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b', re.IGNORECASE)
PHONE_REGEX = re.compile('(?:\\+?62|08)[\\d\\s-]{7,16}')
PASSWORD_BULLETS_REGEX = re.compile('(?:[•●\\*\\.]{3,}|[\\u2022\\u25cf\\u2219\\u25aa\\u22c5]{2,})')
TOKEN_REGEX = re.compile('\\b(ey[A-Za-z0-9_-]{12,}\\.[A-Za-z0-9_-]{12,}|\\bghp_[0-9a-zA-Z]{30,}|\\b[a-fA-F0-9]{32,64}\\b)')
CREDIT_CARD_REGEX = re.compile('\\b(?:\\d{4}[ -]?){3}\\d{4}\\b')
NIK_REGEX = re.compile('\\b\\d{16}\\b')
BANK_ACCOUNT_REGEX = re.compile('\\b\\d{10,16}\\b')
WA_SENDER_REGEX = re.compile('~\\s*[\\w\\s.-]+')
CHAT_TIMESTAMP_REGEX = re.compile('\\b([01]?\\d|2[0-3])[:.][0-5]\\d\\b')
FORM_LABEL_MAPPINGS = {'email': 'KOLOM EMAIL', 'email address': 'KOLOM EMAIL', 'surel': 'KOLOM EMAIL', 'alamat email': 'KOLOM EMAIL', 'password': 'KOLOM SANDI', 'kata sandi': 'KOLOM SANDI', 'sandi': 'KOLOM SANDI', 'pin': 'KOLOM PIN', 'passcode': 'KOLOM PIN', 'username': 'KOLOM USERNAME', 'nama pengguna': 'KOLOM USERNAME', 'user id': 'KOLOM USER ID', 'id pengguna': 'KOLOM USER ID', 'token': 'KOLOM TOKEN', 'api key': 'KOLOM API KEY', 'rekening': 'KOLOM REKENING', 'no rekening': 'KOLOM REKENING', 'nomor rekening': 'KOLOM REKENING', 'bank account': 'KOLOM REKENING', 'card number': 'KOLOM KARTU', 'nomor kartu': 'KOLOM KARTU', 'cvv': 'KOLOM CVV', 'cvc': 'KOLOM CVC', 'otp': 'KOLOM OTP', 'kode verifikasi': 'KOLOM OTP', 'verification code': 'KOLOM OTP'}
SENSITIVE_KEYWORDS = ['whatsapp', 'telegram', 'sayang', 'pesan baru', 'chat', 'notifikasi', 'rekening', 'bca', 'mandiri', 'bri', 'bni', 'cimb', 'bsi', 'password', 'sandi', 'pin', 'otp', 'transfer', 'saldo', 'tagihan', 'hacktools', 'bugcrowd', 'oauth', 'authorize', 'client_id', 'client_secret', 'token', 'cvv', 'cvc', 'nik', 'ktp']
REAL_BROWSER_EXES = {'chrome.exe', 'msedge.exe', 'brave.exe', 'firefox.exe', 'opera.exe', 'vivaldi.exe', 'arc.exe', 'chromium.exe'}
NON_BROWSER_EXES = {'antigravity.exe', 'antigravity ide.exe', 'code.exe', 'code - oss.exe', 'cursor.exe', 'devenv.exe', 'pycharm64.exe', 'idea64.exe', 'powerpnt.exe', 'winword.exe', 'excel.exe', 'notepad.exe', 'sublime_text.exe', 'explorer.exe', 'windowsterminal.exe', 'cmd.exe', 'powershell.exe', 'pwsh.exe', 'bifrost_hdmi_shield.exe', 'bifrost_witness_cam.exe', 'obs64.exe'}
_PID_PNAME_CACHE = {}
_PID_PNAME_CACHE_TIME = {}

def get_process_name_cached(pid_val):
    if not pid_val:
        return ''
    now = time.time()
    if pid_val in _PID_PNAME_CACHE and now - _PID_PNAME_CACHE_TIME.get(pid_val, 0) < 5.0:
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
_TOAST_SCAN_CACHE = (0, None)

def check_win32_toast_window(screen_w=1920, screen_h=1080):
    global _TOAST_SCAN_CACHE
    now = time.time()
    if now - _TOAST_SCAN_CACHE[0] < 0.25:
        return _TOAST_SCAN_CACHE[1]
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
                    length = user32.GetWindowTextLengthW(hwnd)
                    buff = ctypes.create_unicode_buffer(length + 1)
                    user32.GetWindowTextW(hwnd, buff, length + 1)
                    title = buff.value.lower()
                    cls_buff = ctypes.create_unicode_buffer(256)
                    user32.GetClassNameW(hwnd, cls_buff, 256)
                    cls_name = cls_buff.value.lower()
                    if any((k in title for k in ['notification', 'notifikasi', 'whatsapp', 'telegram', 'toast'])) or any((k in cls_name for k in ['corewindow', 'toast', 'notification', 'popup', 'tooltips_class32'])):
                        found_box = (rect.left, rect.top, w, h)
                        return 0
                    pid = wintypes.DWORD()
                    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                    pname = get_process_name_cached(pid.value)
                    if any((k in pname for k in ['shellexperiencehost', 'actioncenter', 'whatsapp', 'telegram'])):
                        found_box = (rect.left, rect.top, w, h)
                        return 0
            return 1
        WNDPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        user32.EnumWindows(WNDPROC(callback), 0)
    except Exception:
        pass
    _TOAST_SCAN_CACHE = (now, found_box)
    return found_box
_WA_SCAN_CACHE = (0, ([], False, None))

def find_visible_whatsapp_windows(screen_w=1920, screen_h=1080):
    global _WA_SCAN_CACHE
    now = time.time()
    if now - _WA_SCAN_CACHE[0] < 0.25:
        return _WA_SCAN_CACHE[1]
    wa_rects = []
    fg_hwnd = user32.GetForegroundWindow()
    is_fg_wa = False
    try:
        hwinsta = user32.OpenWindowStationW('winsta0', False, 895)
        if hwinsta:
            user32.SetProcessWindowStation(hwinsta)
            hdesk = user32.OpenDesktopW('default', 0, False, 511)
            if hdesk:
                user32.SetThreadDesktop(hdesk)
    except Exception:
        pass
    if fg_hwnd:
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(fg_hwnd, ctypes.byref(pid))
        pname = get_process_name_cached(pid.value)
        length = user32.GetWindowTextLengthW(fg_hwnd)
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(fg_hwnd, buff, length + 1)
        title = buff.value.lower()
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
                res = (wa_rects, is_fg_wa, fg_hwnd)
                _WA_SCAN_CACHE = (now, res)
                return res

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
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        pname = get_process_name_cached(pid.value)
        if 'whatsapp' in pname:
            wx = max(0, rect.left)
            wy = max(0, rect.top)
            ww = min(screen_w - wx, w)
            wh = min(screen_h - wy, h)
            if ww > 150 and wh > 150:
                wa_rects.append((wx, wy, ww, wh))
        return True
    try:
        WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
    except Exception:
        pass
    res = (wa_rects, is_fg_wa, fg_hwnd)
    _WA_SCAN_CACHE = (now, res)
    return res

def check_is_email(text):
    t_clean = text.strip()
    t_lower = t_clean.lower()
    if EMAIL_REGEX.search(t_clean):
        return True
    if '@' in t_lower and any((ext in t_lower for ext in ['.com', '.id', '.net', '.org', '.edu', '.gov', '.io', '.ai', '.me', '.co'])):
        return True
    if re.search('[A-Za-z0-9._%+-]+(?:@|e|©|at|\\b)(?:gmail|gmal|gmall|yahoo|hotmail|outlook|ymail|icloud)\\.[A-Za-z]{2,7}', t_lower):
        return True
    if re.search('[A-Za-z0-9._%+-]+(?:\\.sch\\.?id|\\.ac\\.?id|\\.co\\.?id|\\.go\\.?id|\\.id|\\.com)', t_lower):
        if any((d in t_lower for d in ['sch.id', 'schid', 'ac.id', 'acid', 'co.id', 'go.id', 'gmail', 'gmal', 'yahoo', 'outlook'])):
            return True
    if any((dom in t_lower for dom in ['gmail.com', 'gmal.com', 'gmall.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'sch.id', 'schid', 'ac.id', 'acid'])):
        return True
    return False

def find_input_box_above_label(frame_bgr, lx, ly, lw, lh):
    H, W = frame_bgr.shape[:2]
    roi_y1 = max(0, ly - 85)
    roi_y2 = max(0, ly - 3)
    roi_x1 = max(0, lx - max(30, int(lw * 0.3)))
    roi_x2 = min(W, lx + max(lw * 3, 420))
    if roi_y2 - roi_y1 >= 20 and roi_x2 - roi_x1 >= 90:
        roi = frame_bgr[roi_y1:roi_y2, roi_x1:roi_x2]
        try:
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 20, 110)
            k = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 3))
            closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, k)
            contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            best_box = None
            max_score = 0
            for cnt in contours:
                cx, cy, cw, ch = cv2.boundingRect(cnt)
                if 22 <= ch <= 85 and cw >= 95:
                    score = cw * ch
                    if score > max_score:
                        max_score = score
                        best_box = (max(0, roi_x1 + cx - 4), max(0, roi_y1 + cy - 2), min(W - (roi_x1 + cx - 4), cw + 8), min(H - (roi_y1 + cy - 2), ch + 4))
            if best_box:
                return best_box
        except Exception:
            pass
    geom_x = max(0, lx - 10)
    geom_y = max(0, ly - 56)
    geom_w = min(W - geom_x, max(int(lw * 3.0), 340))
    geom_h = 50
    return (geom_x, geom_y, geom_w, geom_h)

def find_input_box_below_label(frame_bgr, lx, ly, lw, lh):
    H, W = frame_bgr.shape[:2]
    y_start = min(H - 10, ly + lh + 2)
    y_end = min(H, ly + lh + max(80, int(lh * 3.6)))
    search_x1 = max(0, lx - max(35, int(lw * 0.35)))
    search_x2 = min(W, lx + max(lw * 4, 460))
    if y_end - y_start >= 18 and search_x2 - search_x1 >= 90:
        roi = frame_bgr[y_start:y_end, search_x1:search_x2]
        try:
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 20, 110)
            k = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 3))
            closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, k)
            contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            best_box = None
            max_score = 0
            for cnt in contours:
                cx, cy, cw, ch = cv2.boundingRect(cnt)
                if 22 <= ch <= 85 and cw >= 95:
                    score = cw * ch
                    if score > max_score:
                        max_score = score
                        best_box = (max(0, search_x1 + cx - 4), max(0, y_start + cy - 2), min(W - (search_x1 + cx - 4), cw + 8), min(H - (y_start + cy - 2), ch + 4))
            if best_box:
                return best_box
        except Exception:
            pass
    try:
        gray_f = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        y_test = min(H - 5, ly + lh + max(16, int(lh * 1.0)))
        left_x = max(0, lx - 10)
        for x in range(min(W - 1, lx), max(0, lx - 250), -2):
            if x > 1:
                diff = abs(int(gray_f[y_test, x]) - int(gray_f[y_test, x - 2]))
                if diff > 10:
                    left_x = max(0, x - 4)
                    break
        right_x = min(W, lx + max(lw * 3, 340))
        for x in range(min(W - 2, lx + lw), min(W - 1, lx + lw + 480), 2):
            diff = abs(int(gray_f[y_test, x]) - int(gray_f[y_test, x + 2]))
            if diff > 10:
                right_x = min(W, x + 4)
                break
        if right_x - left_x >= 140:
            box_h = max(44, min(65, int(lh * 2.5)))
            return (left_x, y_start, right_x - left_x, box_h)
    except Exception:
        pass
    fb_x = max(0, lx - 10)
    fb_y = min(H - 46, ly + lh + 4)
    fb_w = min(W - fb_x, max(int(lw * 3.2), min(420, int(W * 0.35))))
    fb_h = max(42, min(64, int(lh * 2.5)))
    return (fb_x, fb_y, fb_w, fb_h)

def find_input_box_beside_label(frame_bgr, lx, ly, lw, lh):
    H, W = frame_bgr.shape[:2]
    roi_y1 = max(0, ly - 6)
    roi_y2 = min(H, ly + lh + 14)
    roi_x1 = min(W - 20, lx + lw + 2)
    roi_x2 = min(W, lx + lw + max(260, int(lw * 3)))
    if roi_y2 - roi_y1 >= 18 and roi_x2 - roi_x1 >= 80:
        roi = frame_bgr[roi_y1:roi_y2, roi_x1:roi_x2]
        try:
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 20, 110)
            k = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
            closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, k)
            contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                cx, cy, cw, ch = cv2.boundingRect(cnt)
                if 20 <= ch <= 80 and cw >= 80:
                    return (max(0, roi_x1 + cx - 3), max(0, roi_y1 + cy - 2), min(W - (roi_x1 + cx - 3), cw + 6), min(H - (roi_y1 + cy - 2), ch + 4))
        except Exception:
            pass
    return None

def find_enclosing_input_box(frame_bgr, bx, by, bw, bh):
    H, W = frame_bgr.shape[:2]
    pad_left = max(24, int(bw * 0.18))
    pad_right = max(28, int(bw * 0.35))
    ex = max(0, bx - pad_left)
    ey = max(0, by - 12)
    ew = min(W - ex, bw + pad_left + pad_right)
    eh = min(H - ey, max(44, bh + 24))
    return (ex, ey, ew, eh)

def detect_password_bullet_boxes(img_bgr, offset_x=0, offset_y=0):
    H, W = img_bgr.shape[:2]
    if H < 30 or W < 80:
        return []
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    _, thresh_dark = cv2.threshold(gray, 95, 255, cv2.THRESH_BINARY_INV)
    _, thresh_light = cv2.threshold(gray, 175, 255, cv2.THRESH_BINARY)
    results = []
    for thresh in (thresh_dark, thresh_light):
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(thresh)
        dots = []
        for i in range(1, num_labels):
            w = stats[i, cv2.CC_STAT_WIDTH]
            h = stats[i, cv2.CC_STAT_HEIGHT]
            if 4 <= w <= 16 and 4 <= h <= 16 and abs(w - h) <= 2:
                area = stats[i, cv2.CC_STAT_AREA]
                if area >= w * h * 0.55:
                    dots.append({'cx': centroids[i][0], 'cy': centroids[i][1], 'x': stats[i, cv2.CC_STAT_LEFT], 'y': stats[i, cv2.CC_STAT_TOP], 'w': w, 'h': h})
        if len(dots) < 4:
            continue
        dots.sort(key=lambda d: d['cx'])
        y_clusters = {}
        for d in dots:
            matched = False
            for y_k in list(y_clusters.keys()):
                if abs(d['cy'] - y_k) <= 3:
                    y_clusters[y_k].append(d)
                    matched = True
                    break
            if not matched:
                y_clusters[d['cy']] = [d]
        for y_k, cluster in y_clusters.items():
            if len(cluster) >= 4:
                cluster.sort(key=lambda d: d['cx'])
                spacings = [cluster[i + 1]['cx'] - cluster[i]['cx'] for i in range(len(cluster) - 1)]
                mean_sp = float(np.mean(spacings))
                std_sp = float(np.std(spacings))
                if len(spacings) >= 3 and 5.0 <= mean_sp <= 26.0 and std_sp < 2.8:
                    min_x = min((d['x'] for d in cluster))
                    max_x = max((d['x'] + d['w'] for d in cluster))
                    min_y = min((d['y'] for d in cluster))
                    max_y = max((d['y'] + d['h'] for d in cluster))
                    box_x = max(0, int(offset_x + min_x - 36))
                    box_y = max(0, int(offset_y + min_y - 18))
                    box_w = min(W - box_x, int(max_x - min_x + 280))
                    box_h = min(H - box_y, max(46, int(max_y - min_y + 38)))
                    results.append((box_x, box_y, box_w, box_h))
    return results

class SmartToastDetector:

    def __init__(self, duration_sec: float=4.5):
        self.duration_sec = duration_sec
        self.active_until = 0
        self.cooldown_until = 0
        self.bg_accum = None
        self.is_active = False
        self.simulated_until = 0
        self.last_reason = ''

    def trigger_simulation(self, duration: float=4.5):
        now = time.time()
        self.simulated_until = now + duration
        self.active_until = now + duration
        self.is_active = True
        self.last_reason = 'Simulasi Uji'

    def trigger_from_detection(self, duration: float=4.5, reason: str='Notifikasi Masuk'):
        now = time.time()
        self.active_until = max(self.active_until, now + duration)
        self.is_active = True
        self.last_reason = reason

    def reset(self):
        self.active_until = 0
        self.cooldown_until = 0
        self.simulated_until = 0
        self.bg_accum = None
        self.is_active = False
        self.last_reason = ''

    def update(self, roi_bgr, screen_w=1920, screen_h=1080):
        now = time.time()
        if now < self.simulated_until:
            self.is_active = True
            return (True, True)
        toast_box = check_win32_toast_window(screen_w, screen_h)
        if toast_box is not None:
            if not self.is_active:
                self.active_until = now + self.duration_sec
            self.is_active = True
            self.last_reason = 'Jendela Notifikasi'
            return (True, True)
        if roi_bgr is None or roi_bgr.size == 0:
            self.is_active = False
            return (False, False)
        gray = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY)
        if self.bg_accum is None or self.bg_accum.shape != gray.shape:
            self.bg_accum = gray.astype(np.float32)
            self.is_active = False
            return (False, False)
        bg_current = self.bg_accum.astype(np.uint8)
        diff = cv2.absdiff(gray, bg_current)
        diff_mean = float(np.mean(diff))
        changed_ratio = float(np.mean(diff > 16))
        newly_triggered = False
        if (diff_mean > 12.0 or changed_ratio > 0.07) and now > self.cooldown_until and (not self.is_active):
            self.active_until = now + self.duration_sec
            self.cooldown_until = now + self.duration_sec + 1.0
            newly_triggered = True
            self.last_reason = 'Gerakan Pop-up'
        if now < self.active_until:
            self.is_active = True
            cv2.accumulateWeighted(gray, self.bg_accum, 0.005)
            return (True, newly_triggered)
        else:
            self.is_active = False
            cv2.accumulateWeighted(gray, self.bg_accum, 0.05)
            return (False, False)

class SmartBookmarkDetector:

    def __init__(self):
        self.mode = 'auto'
        self.is_browser_visible = False
        self.active_until = 0
        self.simulated_until = 0
        self.bar_y1 = 80
        self.bar_y2 = 126
        self.custom_y_offset = 80
        self.custom_height = 46

    def trigger_simulation(self, duration: float=3.5):
        self.simulated_until = time.time() + duration

    def trigger_from_ocr(self, y_min, y_max, duration: float=2.5):
        now = time.time()
        self.active_until = now + duration
        self.is_browser_visible = True
        self.bar_y1 = max(40, y_min - 4)
        self.bar_y2 = y_max + 6

    def check(self, H, W, top_roi_bgr=None):
        now = time.time()
        pname, title = get_foreground_process_info()
        if pname in NON_BROWSER_EXES or any((ex in pname for ex in ['antigravity', 'code', 'cursor', 'devenv', 'pycharm', 'idea', 'powerpnt', 'word', 'excel', 'obs', 'terminal', 'notepad'])) or any((ex in title for ex in ['antigravity', 'visual studio', 'cursor', 'powerpoint', 'word', 'excel', 'obs studio'])):
            self.is_browser_visible = False
            self.active_until = 0
            return (False, 0, 0)
        if now < self.simulated_until:
            self.is_browser_visible = True
            y1 = int(self.custom_y_offset * (H / 1080.0))
            y2 = y1 + int(self.custom_height * (H / 1080.0))
            return (True, y1, y2)
        if self.mode == 'always':
            self.is_browser_visible = True
            y1 = int(self.custom_y_offset * (H / 1080.0))
            y2 = y1 + int(self.custom_height * (H / 1080.0))
            return (True, y1, y2)
        is_real_browser = pname in REAL_BROWSER_EXES or any((pname.startswith(p) for p in ['chrome', 'msedge', 'brave', 'firefox', 'opera', 'vivaldi', 'arc'])) or any((title.endswith(sfx) for sfx in ['- google chrome', '- microsoft edge', '- brave', '- mozilla firefox', '- opera', '- vivaldi', '- arc']))
        if is_real_browser:
            self.is_browser_visible = True
            if now < self.active_until and self.bar_y2 > self.bar_y1:
                return (True, self.bar_y1, self.bar_y2)
            else:
                y1 = int(self.custom_y_offset * (H / 1080.0))
                y2 = y1 + int(self.custom_height * (H / 1080.0))
                return (True, y1, y2)
        self.is_browser_visible = False
        return (False, 0, 0)

class SmartTaskbarDetector:

    def __init__(self):
        self.cached_badges = []
        self.last_scan = 0

    def scan(self, taskbar_bgr):
        now = time.time()
        if now - self.last_scan < 0.25:
            return self.cached_badges
        self.last_scan = now
        badges = []
        if taskbar_bgr is None or taskbar_bgr.size == 0:
            self.cached_badges = []
            return badges
        H, W = taskbar_bgr.shape[:2]
        hsv = cv2.cvtColor(taskbar_bgr, cv2.COLOR_BGR2HSV)
        mask1 = cv2.inRange(hsv, np.array([0, 140, 140]), np.array([10, 255, 255]))
        mask2 = cv2.inRange(hsv, np.array([170, 140, 140]), np.array([180, 255, 255]))
        red_mask = cv2.bitwise_or(mask1, mask2)
        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            perimeter = cv2.arcLength(cnt, True)
            if perimeter > 0:
                circularity = 4 * np.pi * (area / (perimeter * perimeter))
                if 15 <= area <= 240 and circularity > 0.65:
                    bx, by, bw, bh = cv2.boundingRect(cnt)
                    cx = bx + bw // 2
                    cy = by + bh // 2
                    icon_w = 42
                    icon_h = 42
                    ix1 = max(0, cx - icon_w // 2)
                    iy1 = max(0, cy - icon_h // 2)
                    ix2 = min(W, cx + icon_w // 2)
                    iy2 = min(H, cy + icon_h // 2)
                    badges.append((ix1, iy1, ix2 - ix1, iy2 - iy1))
        self.cached_badges = badges
        return badges

class SmartAntiLoopDetector:

    def __init__(self):
        self.enabled = True
        self.override = False
        self.simulated_until = 0
        self.ocr_triggered_until = 0
        self.cached_curtains = {}
        self.is_curtain_active = False
        self.last_reason = ''
        self.last_non_loop_time = time.time()

    def trigger_simulation(self, duration: float=3.5):
        self.simulated_until = time.time() + duration

    def trigger_from_ocr(self, duration: float=4.5):
        self.ocr_triggered_until = time.time() + duration

    def check(self, H, W):
        now = time.time()
        if not self.enabled:
            return (False, '')
        if now < self.simulated_until:
            self.last_reason = 'Uji Coba Sensor'
            return (True, self.last_reason)
        if self.override:
            return (False, 'Override')
        if now < self.ocr_triggered_until:
            self.last_reason = 'Deteksi Teks Rapat'
            return (True, self.last_reason)
        pname, title = get_foreground_process_info()
        is_meet = False
        if any((k in title for k in ['meet.google.com', 'google meet'])):
            is_meet = True
        elif title.startswith('meet - ') or title.startswith('meet – '):
            is_meet = True
        elif '- meet -' in title or '/meet' in title or 'meet |' in title:
            is_meet = True
        elif 'meet' in title and any((b in title for b in ['brave', 'chrome', 'edge', 'firefox', 'opera'])):
            is_meet = True
        if is_meet:
            self.last_reason = 'Google Meet'
            return (True, self.last_reason)
        if 'layar bersih bifrost' in title:
            self.last_reason = 'Proyektor BIFROST'
            return (True, self.last_reason)
        if 'bifrost presentation shield' in title:
            self.last_reason = 'Konsol BIFROST'
            return (True, self.last_reason)
        if any((k in title for k in ['zoom meeting', 'zoom workplace', 'microsoft teams'])):
            self.last_reason = 'Aplikasi Rapat'
            return (True, self.last_reason)
        self.last_non_loop_time = now
        return (False, '')

    def get_curtain_frame(self, W, H):
        key = (W, H)
        if key in self.cached_curtains:
            return self.cached_curtains[key].copy()
        curtain = Image.new('RGB', (W, H), (15, 17, 23))
        draw = ImageDraw.Draw(curtain)
        scale = H / 1080.0
        try:
            font_badge = ImageFont.truetype('segoeuib.ttf', max(11, int(15 * scale)))
            font_title = ImageFont.truetype('segoeuib.ttf', max(18, int(36 * scale)))
            font_body = ImageFont.truetype('segoeui.ttf', max(12, int(19 * scale)))
            font_hint = ImageFont.truetype('segoeui.ttf', max(10, int(15 * scale)))
            font_btn = ImageFont.truetype('segoeui.ttf', max(11, int(17 * scale)))
        except Exception:
            font_badge = font_title = font_body = font_hint = font_btn = ImageFont.load_default()
        cx = W // 2
        cy = H // 2
        badge = 'BIFROST ANTI-LOOP PRIVACY SHIELD'
        bb = draw.textbbox((0, 0), badge, font=font_badge)
        bw = bb[2] - bb[0]
        badge_y = cy - int(190 * scale)
        badge_h = int(32 * scale)
        draw.rounded_rectangle([cx - bw // 2 - 16, badge_y, cx + bw // 2 + 16, badge_y + badge_h], radius=max(6, badge_h // 2), fill=(13, 27, 42), outline=(56, 189, 248), width=1)
        draw.text((cx - bw // 2, badge_y + int(6 * scale)), badge, font=font_badge, fill=(56, 189, 248))
        t1 = 'Anda sedang memberikan presentasi'
        bbox = draw.textbbox((0, 0), t1, font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw // 2, cy - int(130 * scale)), t1, font=font_title, fill=(255, 255, 255))
        lines = ['Untuk menghindari terjadinya pencerminan tanpa henti, jangan membagikan', 'seluruh layar atau jendela browser. Namun, bagikan tab atau jendela yang', 'berbeda saja.']
        curr_y = cy - int(65 * scale)
        line_spacing = int(30 * scale)
        for l in lines:
            b = draw.textbbox((0, 0), l, font=font_body)
            lw = b[2] - b[0]
            draw.text((cx - lw // 2, curr_y), l, font=font_body, fill=(226, 232, 240))
            curr_y += line_spacing
        hint = '• Beralihlah (Alt + Tab) ke slide PowerPoint, dokumen, atau tab materi Anda untuk langsung tampil.'
        b = draw.textbbox((0, 0), hint, font=font_hint)
        draw.text((cx - (b[2] - b[0]) // 2, curr_y + int(12 * scale)), hint, font=font_hint, fill=(148, 163, 184))
        btn_y = cy + int(85 * scale)
        btn_h = int(48 * scale)
        b1_w = int(280 * scale * (W / H) / 1.777)
        b1_w = max(int(240 * scale), b1_w)
        b1_x1 = cx - b1_w - int(14 * scale)
        b1_x2 = cx - int(14 * scale)
        draw.rounded_rectangle([b1_x1, btn_y, b1_x2, btn_y + btn_h], radius=max(6, btn_h // 2), fill=(26, 33, 46), outline=(226, 232, 240), width=2)
        t_b1 = 'Tetap tampilkan layar saya'
        bb1 = draw.textbbox((0, 0), t_b1, font=font_btn)
        draw.text((b1_x1 + (b1_w - (bb1[2] - bb1[0])) // 2, btn_y + (btn_h - (bb1[3] - bb1[1])) // 2 - 1), t_b1, font=font_btn, fill=(255, 255, 255))
        b2_w = int(230 * scale * (W / H) / 1.777)
        b2_w = max(int(190 * scale), b2_w)
        b2_x1 = cx + int(14 * scale)
        b2_x2 = b2_x1 + b2_w
        draw.rounded_rectangle([b2_x1, btn_y, b2_x2, btn_y + btn_h], radius=max(6, btn_h // 2), fill=(20, 24, 33), outline=(100, 116, 139), width=1)
        t_b2 = 'Hentikan presentasi'
        bb2 = draw.textbbox((0, 0), t_b2, font=font_btn)
        draw.text((b2_x1 + (b2_w - (bb2[2] - bb2[0])) // 2, btn_y + (btn_h - (bb2[3] - bb2[1])) // 2 - 1), t_b2, font=font_btn, fill=(226, 232, 240))
        arr = np.array(curtain)
        arr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        self.cached_curtains[key] = arr
        return arr.copy()

class BIFROSTPresentationShieldApp:

    def __init__(self, root):
        self.root = root
        self.root.title('BIFROST Presentation Shield')
        self.root.geometry('1140x740')
        self.root.configure(bg=BG_VOID)
        self.root.minsize(1000, 680)
        self.is_streaming = False
        self.is_panic = False
        self.is_frozen = False
        self.frozen_frame = None
        self.mask_style = tk.StringVar(value='mosaic')
        self.selected_monitor_idx = tk.IntVar(value=1)
        self.container_w = 720
        self.container_h = 480
        self.toast_detector_br = SmartToastDetector(duration_sec=4.0)
        self.taskbar_detector = SmartTaskbarDetector()
        self.bookmark_detector = SmartBookmarkDetector()
        self.anti_loop_detector = SmartAntiLoopDetector()
        self.smart_bookmarks_active = tk.BooleanVar(value=True)
        self.smart_toast_active = tk.BooleanVar(value=True)
        self.smart_ocr_pii_active = tk.BooleanVar(value=True)
        self.smart_whatsapp_active = tk.BooleanVar(value=True)
        self.smart_taskbar_active = tk.BooleanVar(value=False)
        self.smart_anti_loop_active = tk.BooleanVar(value=True)
        self.override_loop_curtain = tk.BooleanVar(value=False)
        self.sct = mss.mss()
        self.monitors = self.sct.monitors
        self.projector_window = None
        self.projector_label = None
        self.is_projector_fullscreen = False
        self.crop_laptop_taskbar = tk.BooleanVar(value=True)
        self.proj_toolbar = None
        self.btn_proj_fs = None
        self.btn_projector_tv = None
        self._build_ui()
        self.ocr_engine = None
        self.active_pii_boxes = []
        self.pii_lock = threading.Lock()
        self._init_ocr_engine()
        self.root.bind('<space>', lambda e: self.toggle_panic())
        self.root.bind('<Control-b>', lambda e: self.toggle_panic())
        self.root.bind('<f>', lambda e: self.toggle_freeze())
        self.root.protocol('WM_DELETE_WINDOW', self.on_close)
        self.root.after(250, self.start_stream)

    def _init_ocr_engine(self):

        def load():
            try:
                import rapidocr_onnxruntime
                cpu_cores = os.cpu_count() or 4
                threads = min(8, max(2, cpu_cores // 2))
                self.ocr_engine = rapidocr_onnxruntime.RapidOCR(intra_op_num_threads=threads)
                print(f'[AI OCR] RapidOCR Engine aktif (Threads: {threads})')
                self.set_status(f'AI OCR siap mendeteksi email & form login (Threads: {threads})')
            except Exception as e:
                print(f'[AI OCR] Gagal memuat RapidOCR: {e}')
                self.set_status(f'Catatan OCR: {e}')
        threading.Thread(target=load, daemon=True).start()

    def _build_ui(self):
        header = tk.Frame(self.root, bg=GLASS_CARD, highlightthickness=1, highlightbackground=GLASS_BORDER, height=64)
        header.pack(fill='x', padx=16, pady=(14, 8))
        title_frame = tk.Frame(header, bg=GLASS_CARD)
        title_frame.pack(side='left', padx=18, pady=10)
        brand_row = tk.Frame(title_frame, bg=GLASS_CARD)
        brand_row.pack(anchor='w')
        tk.Label(brand_row, text='✦', font=('Segoe UI', 12, 'bold'), fg=ACCENT_CYAN, bg=GLASS_CARD).pack(side='left', padx=(0, 6))
        tk.Label(brand_row, text='BIFROST', font=('Segoe UI', 13, 'bold'), fg=TEXT_TITLE, bg=GLASS_CARD).pack(side='left')
        tk.Label(brand_row, text='HDMI Presentation Shield', font=('Segoe UI', 11), fg=ACCENT_CYAN, bg=GLASS_CARD).pack(side='left', padx=(8, 0))
        lbl_sub = tk.Label(title_frame, text='Sensor otomatis bookmark browser, notifikasi WA, dan data sensitif saat presentasi', font=('Segoe UI', 9), fg=TEXT_MUTED, bg=GLASS_CARD)
        lbl_sub.pack(anchor='w', pady=(2, 0))
        btn_frame = tk.Frame(header, bg=GLASS_CARD)
        btn_frame.pack(side='right', padx=16, pady=10)
        self.lbl_header_badge = tk.Label(btn_frame, text='● LIVE PROYEKSI • AMAN', font=('Segoe UI', 9, 'bold'), fg=ACCENT_EMERALD, bg='#0B1A24', padx=12, pady=6, highlightthickness=1, highlightbackground='#164E63')
        self.lbl_header_badge.pack(side='left', padx=6)
        self.btn_projector = tk.Button(btn_frame, text='📽️ Layar Proyektor', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg='#0284C7', activebackground='#0369A1', activeforeground=TEXT_TITLE, relief='flat', padx=14, pady=6, bd=0, cursor='hand2', command=self.toggle_projector_window)
        self.btn_projector.pack(side='left', padx=4)
        self.btn_projector_tv = tk.Button(btn_frame, text='📺 TV Fullscreen', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg='#059669', activebackground='#047857', activeforeground=TEXT_TITLE, relief='flat', padx=12, pady=6, bd=0, cursor='hand2', command=self.launch_projector_on_screen2)
        self.btn_projector_tv.pack(side='left', padx=4)
        self.btn_panic = tk.Button(btn_frame, text='🚨 Layar Hitam', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg='#7F1D1D', activebackground='#991B1B', activeforeground=TEXT_TITLE, relief='flat', padx=14, pady=6, bd=0, cursor='hand2', command=self.toggle_panic)
        self.btn_panic.pack(side='left', padx=4)
        body = tk.Frame(self.root, bg=BG_VOID)
        body.pack(fill='both', expand=True, padx=16, pady=4)
        left_col = tk.Frame(body, bg=GLASS_CARD, highlightthickness=1, highlightbackground=GLASS_BORDER)
        left_col.pack(side='left', fill='both', expand=True, padx=(0, 8))
        vp_header = tk.Frame(left_col, bg=GLASS_CARD)
        vp_header.pack(side='top', fill='x', padx=16, pady=10)
        self.lbl_vp_title = tk.Label(vp_header, text='🟢 Layar Siaga • Sensor Aktif', font=('Segoe UI', 10, 'bold'), fg=ACCENT_CYAN, bg=GLASS_CARD)
        self.lbl_vp_title.pack(side='left')
        self.lbl_telemetry = tk.Label(vp_header, text='Menghubungkan layar...', font=('Segoe UI', 9), fg=TEXT_MUTED, bg=GLASS_CARD)
        self.lbl_telemetry.pack(side='right')
        pv_ctrl = tk.Frame(left_col, bg=GLASS_CARD, height=48)
        pv_ctrl.pack(side='bottom', fill='x', padx=14, pady=(0, 12))
        pv_ctrl.pack_propagate(False)
        self.btn_stream = tk.Button(pv_ctrl, text='⏹️ Hentikan Layar', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg='#1E293B', activebackground='#334155', activeforeground=TEXT_TITLE, relief='flat', padx=12, pady=6, cursor='hand2', command=self.toggle_stream)
        self.btn_stream.pack(side='left')
        self.btn_freeze = tk.Button(pv_ctrl, text='⏸️ Jeda Layar', font=('Segoe UI', 9), fg=TEXT_TITLE, bg='#1E293B', activebackground='#334155', activeforeground=TEXT_TITLE, relief='flat', padx=12, pady=6, cursor='hand2', command=self.toggle_freeze)
        self.btn_freeze.pack(side='left', padx=6)
        self.chk_crop_tb = tk.Checkbutton(pv_ctrl, text='✂️ Potong Taskbar Laptop (No Double Taskbar)', variable=self.crop_laptop_taskbar, font=('Segoe UI', 8, 'bold'), fg=ACCENT_CYAN, bg=GLASS_CARD, selectcolor='#09182B', activebackground=GLASS_CARD, activeforeground=TEXT_TITLE, cursor='hand2')
        self.chk_crop_tb.pack(side='left', padx=8)
        self.btn_refresh_mon = tk.Button(pv_ctrl, text='🔄', font=('Segoe UI', 8), fg=TEXT_TITLE, bg='#1E293B', activebackground='#334155', relief='flat', padx=6, pady=4, cursor='hand2', command=self.refresh_monitors)
        self.btn_refresh_mon.pack(side='right', padx=(2, 6))
        mon_names = [f'Layar {i}' for i in range(1, len(self.monitors))]
        if not mon_names:
            mon_names = ['Layar 1']
        self.mon_combo = ttk.Combobox(pv_ctrl, values=mon_names, state='readonly', width=12, font=('Segoe UI', 9))
        self.mon_combo.current(0)
        self.mon_combo.pack(side='right')
        self.mon_combo.bind('<<ComboboxSelected>>', self.on_monitor_change)
        tk.Label(pv_ctrl, text='Pilih Layar:', font=('Segoe UI', 9), fg=TEXT_MUTED, bg=GLASS_CARD).pack(side='right', padx=6)
        self.preview_container = tk.Frame(left_col, bg='#04060B')
        self.preview_container.pack(side='top', fill='both', expand=True, padx=12, pady=(0, 8))
        self.preview_container.pack_propagate(False)

        def _on_pv_resize(e):
            if e.width > 50 and e.height > 50:
                self.container_w = e.width
                self.container_h = e.height
        self.preview_container.bind('<Configure>', _on_pv_resize)
        self.preview_label = tk.Label(self.preview_container, bg='#04060B', text='Menghubungkan ke display...', fg=TEXT_MUTED, font=('Segoe UI', 10), cursor='hand2')
        self.preview_label.place(relx=0.5, rely=0.5, anchor='center')
        self.preview_label.bind('<Button-1>', lambda e: self._on_screen_click(e, self.preview_label))
        right_col = tk.Frame(body, bg=GLASS_CARD, highlightthickness=1, highlightbackground=GLASS_BORDER, width=340)
        right_col.pack(side='right', fill='y', padx=(8, 0))
        right_col.pack_propagate(False)
        tk.Label(right_col, text='KONTROL SENSOR CERDAS', font=('Segoe UI', 10, 'bold'), fg=TEXT_TITLE, bg=GLASS_CARD).pack(anchor='w', padx=16, pady=(16, 8))
        card_bm = tk.Frame(right_col, bg=GLASS_BG, highlightthickness=1, highlightbackground=GLASS_BORDER)
        card_bm.pack(fill='x', padx=14, pady=5)
        bm_head = tk.Frame(card_bm, bg=GLASS_BG)
        bm_head.pack(fill='x', padx=10, pady=(8, 4))
        tk.Label(bm_head, text='🌐 Sensor Bookmark Browser', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg=GLASS_BG).pack(side='left')
        self.btn_toggle_bm = tk.Button(bm_head, text='● AKTIF', font=('Segoe UI', 8, 'bold'), fg=ACCENT_EMERALD, bg='#0B1C28', activebackground='#0F283B', activeforeground=ACCENT_EMERALD, relief='flat', bd=0, padx=6, pady=2, cursor='hand2', command=self.toggle_bookmark_sensor)
        self.btn_toggle_bm.pack(side='right')
        tk.Label(card_bm, text='Otomatis menyamarkan baris bookmark saat browser dibuka.', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=GLASS_BG, justify='left', wraplength=290).pack(anchor='w', padx=10, pady=(0, 6))
        bm_mode_frame = tk.Frame(card_bm, bg=GLASS_BG)
        bm_mode_frame.pack(fill='x', padx=10, pady=(0, 6))
        self.bm_mode_var = tk.StringVar(value='auto')
        self.btn_bm_auto = tk.Button(bm_mode_frame, text='Otomatis', font=('Segoe UI', 8, 'bold'), fg=TEXT_TITLE, bg='#1E293B', relief='flat', padx=8, pady=3, cursor='hand2', command=lambda: self.set_bm_mode('auto'))
        self.btn_bm_auto.pack(side='left', padx=(0, 4))
        self.btn_bm_always = tk.Button(bm_mode_frame, text='Selalu Aktif', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#0F172A', relief='flat', padx=8, pady=3, cursor='hand2', command=lambda: self.set_bm_mode('always'))
        self.btn_bm_always.pack(side='left', padx=4)
        self.btn_test_bm = tk.Button(bm_mode_frame, text='⚡ Uji (3 Detik)', font=('Segoe UI', 8, 'bold'), fg=ACCENT_AMBER, bg='#261A05', activebackground='#382507', relief='flat', padx=8, pady=3, cursor='hand2', command=self.simulate_bookmark_trigger)
        self.btn_test_bm.pack(side='right')
        card_toast = tk.Frame(right_col, bg=GLASS_BG, highlightthickness=1, highlightbackground=GLASS_BORDER)
        card_toast.pack(fill='x', padx=14, pady=5)
        toast_head = tk.Frame(card_toast, bg=GLASS_BG)
        toast_head.pack(fill='x', padx=10, pady=(8, 4))
        tk.Label(toast_head, text='💬 Sensor Notifikasi Masuk', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg=GLASS_BG).pack(side='left')
        self.btn_toggle_toast = tk.Button(toast_head, text='● AKTIF', font=('Segoe UI', 8, 'bold'), fg=ACCENT_EMERALD, bg='#0B1C28', activebackground='#0F283B', activeforeground=ACCENT_EMERALD, relief='flat', bd=0, padx=6, pady=2, cursor='hand2', command=self.toggle_toast_sensor)
        self.btn_toggle_toast.pack(side='right')
        tk.Label(card_toast, text='Menutupi pop-up WhatsApp, Telegram, & Windows di pojok kanan bawah.', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=GLASS_BG, justify='left', wraplength=290).pack(anchor='w', padx=10, pady=(0, 6))
        toast_btn_row = tk.Frame(card_toast, bg=GLASS_BG)
        toast_btn_row.pack(fill='x', padx=10, pady=(0, 6))
        self.btn_test_toast = tk.Button(toast_btn_row, text='🧪 Uji Sensor Notifikasi (4 Detik)', font=('Segoe UI', 8, 'bold'), fg=ACCENT_AMBER, bg='#261A05', activebackground='#382507', relief='flat', padx=10, pady=3, cursor='hand2', command=self.simulate_toast_trigger)
        self.btn_test_toast.pack(side='left')
        card_ocr = tk.Frame(right_col, bg=GLASS_BG, highlightthickness=1, highlightbackground=GLASS_BORDER)
        card_ocr.pack(fill='x', padx=14, pady=4)
        ocr_head = tk.Frame(card_ocr, bg=GLASS_BG)
        ocr_head.pack(fill='x', padx=10, pady=(6, 2))
        tk.Label(ocr_head, text='🔒 Sensor Kredensial & Form', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg=GLASS_BG).pack(side='left')
        self.btn_toggle_ocr = tk.Button(ocr_head, text='● AKTIF', font=('Segoe UI', 8, 'bold'), fg=ACCENT_EMERALD, bg='#0B1C28', activebackground='#0F283B', activeforeground=ACCENT_EMERALD, relief='flat', bd=0, padx=6, pady=2, cursor='hand2', command=self.toggle_ocr_sensor)
        self.btn_toggle_ocr.pack(side='right')
        tk.Label(card_ocr, text='Otomatis menyamarkan email, sandi, kolom login, rekening, OTP, & no HP.', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=GLASS_BG, justify='left', wraplength=290).pack(anchor='w', padx=10, pady=(0, 6))
        card_wa = tk.Frame(right_col, bg=GLASS_BG, highlightthickness=1, highlightbackground=GLASS_BORDER)
        card_wa.pack(fill='x', padx=14, pady=4)
        wa_head = tk.Frame(card_wa, bg=GLASS_BG)
        wa_head.pack(fill='x', padx=10, pady=(6, 2))
        tk.Label(wa_head, text='🟢 Sensor Aplikasi WhatsApp', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg=GLASS_BG).pack(side='left')
        self.btn_toggle_wa = tk.Button(wa_head, text='● AKTIF', font=('Segoe UI', 8, 'bold'), fg=ACCENT_EMERALD, bg='#0B1C28', activebackground='#0F283B', activeforeground=ACCENT_EMERALD, relief='flat', bd=0, padx=6, pady=2, cursor='hand2', command=self.toggle_whatsapp_sensor)
        self.btn_toggle_wa.pack(side='right')
        tk.Label(card_wa, text='Otomatis menyamarkan obrolan & kontak saat WhatsApp dibuka.', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=GLASS_BG, justify='left', wraplength=290).pack(anchor='w', padx=10, pady=(0, 6))
        card_loop = tk.Frame(right_col, bg=GLASS_BG, highlightthickness=1, highlightbackground=GLASS_BORDER)
        card_loop.pack(fill='x', padx=14, pady=4)
        loop_head = tk.Frame(card_loop, bg=GLASS_BG)
        loop_head.pack(fill='x', padx=10, pady=(6, 2))
        tk.Label(loop_head, text='🔄 Anti-Infinity Loop (Meet)', font=('Segoe UI', 9, 'bold'), fg=TEXT_TITLE, bg=GLASS_BG).pack(side='left')
        self.btn_toggle_loop = tk.Button(loop_head, text='● AKTIF', font=('Segoe UI', 8, 'bold'), fg=ACCENT_EMERALD, bg='#0B1C28', activebackground='#0F283B', activeforeground=ACCENT_EMERALD, relief='flat', bd=0, padx=6, pady=2, cursor='hand2', command=self.toggle_anti_loop_sensor)
        self.btn_toggle_loop.pack(side='right')
        tk.Label(card_loop, text='Cegah efek cermin berulang saat Google Meet / BIFROST dibuka.', font=('Segoe UI', 8), fg=TEXT_MUTED, bg=GLASS_BG, justify='left', wraplength=290).pack(anchor='w', padx=10, pady=(0, 6))
        loop_btn_row = tk.Frame(card_loop, bg=GLASS_BG)
        loop_btn_row.pack(fill='x', padx=10, pady=(0, 6))
        self.btn_override_loop = tk.Button(loop_btn_row, text='👁️ Tetap Tampilkan', font=('Segoe UI', 8), fg=TEXT_BODY, bg='#1E293B', activebackground='#334155', relief='flat', padx=8, pady=3, cursor='hand2', command=self.toggle_loop_override)
        self.btn_override_loop.pack(side='left', padx=(0, 4))
        self.btn_test_loop = tk.Button(loop_btn_row, text='⚡ Uji Tirai (3 Detik)', font=('Segoe UI', 8, 'bold'), fg=ACCENT_AMBER, bg='#261A05', activebackground='#382507', relief='flat', padx=8, pady=3, cursor='hand2', command=self.simulate_loop_trigger)
        self.btn_test_loop.pack(side='right')
        card_style = tk.Frame(right_col, bg=GLASS_BG, highlightthickness=1, highlightbackground=GLASS_BORDER)
        card_style.pack(fill='x', padx=14, pady=4)
        tk.Label(card_style, text='GAYA PENYAMARAN', font=('Segoe UI', 8, 'bold'), fg=TEXT_MUTED, bg=GLASS_BG).pack(anchor='w', padx=10, pady=(6, 2))
        modes_frame = tk.Frame(card_style, bg=GLASS_BG)
        modes_frame.pack(fill='x', padx=10, pady=(0, 6))
        for label, val in [('Mozaik Kaca', 'mosaic'), ('Blur Halus', 'blur'), ('Hitam Gelap', 'solid')]:
            rb = tk.Radiobutton(modes_frame, text=label, value=val, variable=self.mask_style, font=('Segoe UI', 9), fg=TEXT_TITLE, bg=GLASS_BG, selectcolor='#1E293B', activebackground=GLASS_BG, activeforeground=TEXT_TITLE, pady=1, cursor='hand2')
            rb.pack(anchor='w')
        stat_card = tk.Frame(right_col, bg='#070C16', highlightthickness=1, highlightbackground=GLASS_BORDER)
        stat_card.pack(fill='x', padx=14, pady=(6, 4))
        tk.Label(stat_card, text='Status Proteksi Layar', font=('Segoe UI', 9, 'bold'), fg=ACCENT_CYAN, bg='#070C16').pack(anchor='w', padx=10, pady=(6, 2))
        self.lbl_s_bm = tk.Label(stat_card, text='• Bookmark: Siaga', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#070C16')
        self.lbl_s_bm.pack(anchor='w', padx=10, pady=1)
        self.lbl_s_toast = tk.Label(stat_card, text='• Pop-up: Siaga', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#070C16')
        self.lbl_s_toast.pack(anchor='w', padx=10, pady=1)
        self.lbl_s_wa = tk.Label(stat_card, text='• WhatsApp: Aman', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#070C16')
        self.lbl_s_wa.pack(anchor='w', padx=10, pady=1)
        self.lbl_s_ocr = tk.Label(stat_card, text='• Kredensial/Form: Siaga', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#070C16')
        self.lbl_s_ocr.pack(anchor='w', padx=10, pady=1)
        self.lbl_s_loop = tk.Label(stat_card, text='• Anti-Loop: Siaga', font=('Segoe UI', 8), fg=TEXT_MUTED, bg='#070C16')
        self.lbl_s_loop.pack(anchor='w', padx=10, pady=(1, 6))
        status_bar = tk.Frame(self.root, bg='#050811', height=26)
        status_bar.pack(fill='x', side='bottom')
        self.lbl_status = tk.Label(status_bar, text='Siap presentasi • Sensor otomatis aktif menjaga privasi Anda', font=('Segoe UI', 8), fg=TEXT_FAINT, bg='#050811')
        self.lbl_status.pack(side='left', padx=16, pady=4)

    def set_status(self, msg: str):
        if hasattr(self, 'lbl_status') and self.lbl_status:
            try:
                self.lbl_status.config(text=msg)
            except Exception:
                pass

    def toggle_bookmark_sensor(self):
        curr = self.smart_bookmarks_active.get()
        self.smart_bookmarks_active.set(not curr)
        if self.smart_bookmarks_active.get():
            self.btn_toggle_bm.config(text='● AKTIF', fg=ACCENT_EMERALD, bg='#0B1C28')
            self.set_status('Sensor bookmark browser diaktifkan')
        else:
            self.btn_toggle_bm.config(text='○ NONAKTIF', fg=TEXT_FAINT, bg='#111827')
            self.set_status('Sensor bookmark browser dinonaktifkan')

    def set_bm_mode(self, mode: str):
        self.bookmark_detector.mode = mode
        if mode == 'auto':
            self.btn_bm_auto.config(bg='#1E293B', fg=TEXT_TITLE, font=('Segoe UI', 8, 'bold'))
            self.btn_bm_always.config(bg='#0F172A', fg=TEXT_MUTED, font=('Segoe UI', 8))
            self.set_status('Mode bookmark: Otomatis saat browser dibuka')
        else:
            self.btn_bm_always.config(bg='#1E293B', fg=TEXT_TITLE, font=('Segoe UI', 8, 'bold'))
            self.btn_bm_auto.config(bg='#0F172A', fg=TEXT_MUTED, font=('Segoe UI', 8))
            self.set_status('Mode bookmark: Selalu aktif di baris atas')

    def simulate_bookmark_trigger(self):
        self.bookmark_detector.trigger_simulation(duration=3.5)
        self.lbl_s_bm.config(text='• Bookmark: 🔒 Menguji Sensor', fg=ACCENT_AMBER)
        self.set_status('Menguji sensor baris bookmark selama 3.5 detik')

    def toggle_toast_sensor(self):
        curr = self.smart_toast_active.get()
        self.smart_toast_active.set(not curr)
        if self.smart_toast_active.get():
            self.btn_toggle_toast.config(text='● AKTIF', fg=ACCENT_EMERALD, bg='#0B1C28')
            self.set_status('Sensor pop-up notifikasi diaktifkan')
        else:
            self.btn_toggle_toast.config(text='○ NONAKTIF', fg=TEXT_FAINT, bg='#111827')
            self.set_status('Sensor pop-up notifikasi dinonaktifkan')

    def simulate_toast_trigger(self):
        self.toast_detector_br.trigger_simulation(duration=4.0)
        self.lbl_s_toast.config(text='• Pop-up: 🔒 Menguji Sensor', fg=ACCENT_AMBER)
        self.set_status('Menguji sensor pop-up notifikasi selama 4 detik')

    def toggle_ocr_sensor(self):
        curr = self.smart_ocr_pii_active.get()
        self.smart_ocr_pii_active.set(not curr)
        if self.smart_ocr_pii_active.get():
            self.btn_toggle_ocr.config(text='● AKTIF', fg=ACCENT_EMERALD, bg='#0B1C28')
            self.set_status('Sensor kredensial dan form diaktifkan')
        else:
            self.btn_toggle_ocr.config(text='○ NONAKTIF', fg=TEXT_FAINT, bg='#111827')
            self.set_status('Sensor kredensial dan form dinonaktifkan')

    def toggle_whatsapp_sensor(self):
        curr = self.smart_whatsapp_active.get()
        self.smart_whatsapp_active.set(not curr)
        if self.smart_whatsapp_active.get():
            self.btn_toggle_wa.config(text='● AKTIF', fg=ACCENT_EMERALD, bg='#0B1C28')
            self.set_status('Sensor aplikasi WhatsApp diaktifkan')
        else:
            self.btn_toggle_wa.config(text='○ NONAKTIF', fg=TEXT_FAINT, bg='#111827')
            self.set_status('Sensor aplikasi WhatsApp dinonaktifkan')

    def toggle_anti_loop_sensor(self):
        curr = self.smart_anti_loop_active.get()
        self.smart_anti_loop_active.set(not curr)
        self.anti_loop_detector.enabled = not curr
        if self.smart_anti_loop_active.get():
            self.btn_toggle_loop.config(text='● AKTIF', fg=ACCENT_EMERALD, bg='#0B1C28')
            self.set_status('Proteksi anti-infinity loop diaktifkan')
        else:
            self.btn_toggle_loop.config(text='○ NONAKTIF', fg=TEXT_FAINT, bg='#111827')
            self.set_status('Proteksi anti-infinity loop dinonaktifkan')

    def toggle_loop_override(self):
        curr = self.override_loop_curtain.get()
        new_val = not curr
        self.override_loop_curtain.set(new_val)
        self.anti_loop_detector.override = new_val
        if new_val:
            self.btn_override_loop.config(text='🛡️ Pasang Tirai', fg=ACCENT_CYAN, bg='#164E63')
            self.set_status('Override aktif: Layar ditampilkan penuh tanpa tirai')
        else:
            self.btn_override_loop.config(text='👁️ Tetap Tampilkan', fg=TEXT_BODY, bg='#1E293B')
            self.set_status('Proteksi anti-infinity loop kembali aktif')

    def simulate_loop_trigger(self):
        self.anti_loop_detector.trigger_simulation(duration=3.5)
        self.lbl_s_loop.config(text='• Anti-Loop: 🔒 Menguji Tirai', fg=ACCENT_AMBER)
        self.set_status('Menguji tirai anti-infinity loop selama 3.5 detik')

    def _on_screen_click(self, event, widget):
        if not self.anti_loop_detector.is_curtain_active:
            return
        w = widget.winfo_width()
        h = widget.winfo_height()
        if w <= 0 or h <= 0:
            return
        nx = event.x / float(w)
        ny = event.y / float(h)
        if 0.3 <= nx <= 0.49 and 0.54 <= ny <= 0.66:
            self.toggle_loop_override()
        elif 0.51 <= nx <= 0.7 and 0.54 <= ny <= 0.66:
            self.toggle_stream()

    def on_monitor_change(self, event=None):
        idx = self.mon_combo.current() + 1
        self.selected_monitor_idx.set(idx)
        self.set_status(f'Beralih ke Layar {idx}')

    def toggle_stream(self):
        if self.is_streaming:
            self.stop_stream()
            self.btn_stream.config(text='▶️ Mulai Layar')
            self.lbl_vp_title.config(text='Layar Dijeda', fg=TEXT_MUTED)
        else:
            self.start_stream()
            self.btn_stream.config(text='⏹️ Hentikan Layar')
            self.lbl_vp_title.config(text='🟢 Layar Siaga • Sensor Aktif', fg=ACCENT_CYAN)

    def start_stream(self):
        if self.is_streaming:
            return
        self.is_streaming = True
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()
        self.ocr_thread = threading.Thread(target=self._ocr_watcher_loop, daemon=True)
        self.ocr_thread.start()
        self.set_status('Layar terhubung dan sensor privasi aktif')

    def stop_stream(self):
        self.is_streaming = False

    def toggle_panic(self):
        self.is_panic = not self.is_panic
        if self.is_panic:
            self.btn_panic.config(text='🚨 Nyalakan Layar', bg=ACCENT_ROSE)
            self.lbl_vp_title.config(text='Layar Dimatikan', fg=ACCENT_ROSE)
            self.lbl_header_badge.config(text='🚨 LAYAR DIMATIKAN', fg=ACCENT_ROSE, bg='#2A0808')
            self.set_status('Layar dimatikan')
        else:
            self.btn_panic.config(text='🚨 Layar Hitam', bg='#7F1D1D')
            self.lbl_vp_title.config(text='🟢 Layar Siaga • Sensor Aktif', fg=ACCENT_CYAN)
            self.lbl_header_badge.config(text='● LIVE PROYEKSI • AMAN', fg=ACCENT_EMERALD, bg='#0B1A24')
            self.set_status('Layar dinyalakan kembali')

    def toggle_freeze(self):
        self.is_frozen = not self.is_frozen
        if self.is_frozen:
            self.btn_freeze.config(text='▶️ Lanjutkan', bg='#D97706')
            self.set_status('Layar dijeda')
        else:
            self.frozen_frame = None
            self.btn_freeze.config(text='⏸️ Jeda Layar', bg='#1E293B')
            self.set_status('Layar dilanjutkan')

    def refresh_monitors(self):
        try:
            self.monitors = self.sct.monitors
            mon_names = [f'Layar {i}' for i in range(1, len(self.monitors))]
            if not mon_names:
                mon_names = ['Layar 1']
            self.mon_combo['values'] = mon_names
            curr = self.selected_monitor_idx.get()
            if curr >= len(self.monitors):
                self.selected_monitor_idx.set(1)
                self.mon_combo.current(0)
            else:
                self.mon_combo.current(max(0, curr - 1))
            self.set_status(f'Daftar monitor diperbarui ({len(self.monitors) - 1} layar terdeteksi)')
        except Exception as e:
            self.set_status(f'Gagal memperbarui monitor: {e}')

    def toggle_projector_window(self):
        if self.projector_window is not None:
            try:
                self.projector_window.destroy()
            except Exception:
                pass
            self.projector_window = None
            self.is_projector_fullscreen = False
            self.btn_projector.config(text='📽️ Layar Proyektor', bg='#0284C7')
            self.set_status('Jendela proyektor ditutup')
            return
        self.projector_window = tk.Toplevel(self.root)
        self.projector_window.title('Layar Bersih BIFROST - Bagikan Jendela Ini ke Proyektor / Meet')
        self.projector_window.geometry('960x540')
        self.projector_window.configure(bg='#000000')
        self.projector_window.protocol('WM_DELETE_WINDOW', self.toggle_projector_window)
        self.is_projector_fullscreen = False
        self.proj_toolbar = tk.Frame(self.projector_window, bg='#0B1220', height=38)
        self.proj_toolbar.pack(side='top', fill='x')
        self.proj_toolbar.pack_propagate(False)
        lbl_p_title = tk.Label(self.proj_toolbar, text='📽️ BIFROST Clean Output', font=('Segoe UI', 9, 'bold'), fg=ACCENT_CYAN, bg='#0B1220')
        lbl_p_title.pack(side='left', padx=10)
        chk_p_tb = tk.Checkbutton(self.proj_toolbar, text='✂️ Potong Taskbar Laptop', variable=self.crop_laptop_taskbar, font=('Segoe UI', 8), fg=TEXT_BODY, bg='#0B1220', selectcolor='#1E293B', activebackground='#0B1220', activeforeground=TEXT_TITLE, cursor='hand2')
        chk_p_tb.pack(side='left', padx=8)
        self.btn_proj_fs = tk.Button(self.proj_toolbar, text='⛶ Layar Penuh (F11)', font=('Segoe UI', 8, 'bold'), fg=TEXT_TITLE, bg='#2563EB', activebackground='#1D4ED8', activeforeground=TEXT_TITLE, relief='flat', padx=10, pady=2, cursor='hand2', command=self.toggle_projector_fullscreen)
        self.btn_proj_fs.pack(side='right', padx=6)
        btn_p_close = tk.Button(self.proj_toolbar, text='✕', font=('Segoe UI', 8, 'bold'), fg=TEXT_TITLE, bg='#991B1B', activebackground='#7F1D1D', activeforeground=TEXT_TITLE, relief='flat', padx=8, pady=2, cursor='hand2', command=self.toggle_projector_window)
        btn_p_close.pack(side='right', padx=(0, 6))
        self.projector_label = tk.Label(self.projector_window, bg='#000000', cursor='hand2')
        self.projector_label.pack(fill='both', expand=True)
        self.projector_label.bind('<Button-1>', lambda e: self._on_screen_click(e, self.projector_label))
        self.projector_label.bind('<Double-Button-1>', lambda e: self.toggle_projector_fullscreen())
        self.projector_window.bind('<F11>', lambda e: self.toggle_projector_fullscreen())
        self.projector_window.bind('<Escape>', lambda e: self.exit_projector_fullscreen())
        self.btn_projector.config(text='❌ Tutup Proyektor', bg=ACCENT_ROSE)
        self.set_status('Jendela proyektor terbuka • Tekan F11 atau Double-Click untuk Fullscreen')

    def toggle_projector_fullscreen(self, event=None):
        if not self.projector_window:
            return
        self.is_projector_fullscreen = not self.is_projector_fullscreen
        self.projector_window.attributes('-fullscreen', self.is_projector_fullscreen)
        if self.is_projector_fullscreen:
            if hasattr(self, 'btn_proj_fs') and self.btn_proj_fs:
                self.btn_proj_fs.config(text='🗗 Keluar Fullscreen (F11)')
            if hasattr(self, 'proj_toolbar') and self.proj_toolbar:
                self.proj_toolbar.pack_forget()
            self.set_status('Layar penuh aktif • Tekan F11 atau Esc untuk keluar layar penuh')
        else:
            if hasattr(self, 'btn_proj_fs') and self.btn_proj_fs:
                self.btn_proj_fs.config(text='⛶ Layar Penuh (F11)')
            if hasattr(self, 'proj_toolbar') and self.proj_toolbar:
                self.proj_toolbar.pack(side='top', fill='x', before=self.projector_label)
            self.set_status('Keluar dari layar penuh')

    def exit_projector_fullscreen(self, event=None):
        if self.projector_window and self.is_projector_fullscreen:
            self.toggle_projector_fullscreen()

    def launch_projector_on_screen2(self):
        self.refresh_monitors()
        if self.projector_window is None:
            self.toggle_projector_window()
        if len(self.monitors) > 2:
            m2 = self.monitors[2]
            self.projector_window.geometry(f"{m2['width']}x{m2['height']}+{m2['left']}+{m2['top']}")
            self.root.after(150, lambda: self._apply_fullscreen_direct(True))
            self.set_status(f"Proyektor dibuka langsung di Layar 2 ({m2['width']}x{m2['height']}) Fullscreen")
        else:
            self.root.after(100, lambda: self._apply_fullscreen_direct(True))
            self.set_status('Layar 2 belum terdeteksi. Proyektor dibuka Fullscreen di layar utama.')

    def _apply_fullscreen_direct(self, val: bool):
        if self.projector_window:
            self.is_projector_fullscreen = val
            self.projector_window.attributes('-fullscreen', val)
            if hasattr(self, 'proj_toolbar') and self.proj_toolbar and val:
                self.proj_toolbar.pack_forget()

    def apply_mask(self, img, x, y, w, h, style, badge_text=''):
        H, W = img.shape[:2]
        x = max(0, x)
        y = max(0, y)
        w = min(w, W - x)
        h = min(h, H - y)
        if w <= 0 or h <= 0:
            return
        if style == 'solid':
            img[y:y + h, x:x + w] = (10, 10, 16)
        elif style == 'mosaic':
            roi = img[y:y + h, x:x + w]
            if roi.size > 0:
                grid = max(8, min(24, w // 14))
                small_w = max(1, w // grid)
                small_h = max(1, h // grid)
                small = cv2.resize(roi, (small_w, small_h), interpolation=cv2.INTER_LINEAR)
                pixelated = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
                img[y:y + h, x:x + w] = pixelated
        else:
            roi = img[y:y + h, x:x + w]
            if roi.size > 0:
                k = max(21, w // 10 | 1)
                img[y:y + h, x:x + w] = cv2.GaussianBlur(roi, (k, k), 35)
        if badge_text and w >= 140 and (h >= 26):
            b_label = f'🔒 {badge_text}'
            (tw, th), _ = cv2.getTextSize(b_label, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
            bx1 = x + 10
            by1 = y + 8
            bx2 = bx1 + tw + 14
            by2 = by1 + th + 10
            if by2 < y + h and bx2 < x + w:
                overlay = img.copy()
                cv2.rectangle(overlay, (bx1, by1), (bx2, by2), (15, 23, 42), -1)
                cv2.rectangle(overlay, (bx1, by1), (bx2, by2), (56, 189, 248), 1)
                cv2.addWeighted(overlay, 0.85, img, 0.15, 0, img)
                cv2.putText(img, b_label, (bx1 + 7, by1 + th + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (241, 245, 249), 1, cv2.LINE_AA)

    def _ocr_watcher_loop(self):
        while self.is_streaming:
            if not self.smart_ocr_pii_active.get() and (not self.smart_bookmarks_active.get()) and (not self.smart_toast_active.get()):
                time.sleep(0.4)
                continue
            if self.ocr_engine is None or self.is_panic:
                time.sleep(0.4)
                continue
            try:
                mon_idx = min(self.selected_monitor_idx.get(), len(self.monitors) - 1)
                target_mon = self.monitors[mon_idx]
                raw = self.sct.grab(target_mon)
                frame = np.array(raw)
                H, W = frame.shape[:2]
                now = time.time()
                scan_x1, scan_y1, scan_x2, scan_y2 = (0, max(35, int(H * 0.05)), W, H)
                fg_hwnd = user32.GetForegroundWindow()
                if fg_hwnd:
                    fg_rect = wintypes.RECT()
                    if user32.GetWindowRect(fg_hwnd, ctypes.byref(fg_rect)):
                        fx = max(0, fg_rect.left)
                        fy = max(35, fg_rect.top)
                        fw = min(W - fx, fg_rect.right - fg_rect.left)
                        fh = min(H - fy, fg_rect.bottom - fg_rect.top)
                        if fw >= 360 and fh >= 280 and (fw < W or fh < H):
                            scan_x1, scan_y1, scan_x2, scan_y2 = (fx, fy, fx + fw, fy + fh)
                scan_roi = frame[scan_y1:scan_y2, scan_x1:scan_x2, :3]
                if scan_roi.size == 0:
                    time.sleep(0.3)
                    continue
                results, _ = self.ocr_engine(scan_roi)
                detected = []
                bm_ys = []
                toast_texts = []
                if self.smart_ocr_pii_active.get():
                    bullet_boxes = detect_password_bullet_boxes(scan_roi, scan_x1, scan_y1)
                    for bb in bullet_boxes:
                        detected.append({'box': bb, 'label': 'KATA SANDI', 'expires': now + 12.0})
                if results:
                    pname, title = get_foreground_process_info()
                    is_real_browser = pname in REAL_BROWSER_EXES or any((pname.startswith(p) for p in ['chrome', 'msedge', 'brave', 'firefox', 'opera', 'vivaldi', 'arc'])) or any((title.endswith(sfx) for sfx in ['- google chrome', '- microsoft edge', '- brave', '- mozilla firefox', '- opera', '- vivaldi', '- arc']))
                    for box, text, score in results:
                        text_clean = text.strip()
                        t_lower = text_clean.lower()
                        xs = [pt[0] for pt in box]
                        ys = [pt[1] for pt in box]
                        bx = int(scan_x1 + min(xs))
                        by = int(scan_y1 + min(ys))
                        bw = int(max(xs) - min(xs))
                        bh = int(max(ys) - min(ys))
                        if self.smart_anti_loop_active.get():
                            if any((k in t_lower for k in ['pencerminan tanpa henti', 'anda sedang memberikan presentasi', 'tetap tampilkan layar', 'hentikan presentasi'])):
                                self.anti_loop_detector.trigger_from_ocr(duration=5.0)
                        if self.smart_bookmarks_active.get() and is_real_browser:
                            if by <= int(H * 0.16) and by >= int(H * 0.04):
                                bm_ys.append((by, by + bh))
                        if self.smart_toast_active.get():
                            if bx >= int(W * 0.6) and by >= int(H * 0.6):
                                if len(t_lower) >= 3 and (not t_lower.isdigit()):
                                    toast_texts.append(t_lower)
                        if self.smart_ocr_pii_active.get():
                            if check_is_email(text_clean):
                                enc_box = find_enclosing_input_box(frame, bx, by, bw, bh)
                                detected.append({'box': enc_box, 'label': 'EMAIL PRIBADI', 'expires': now + 12.0})
                                detected.append({'box': (max(0, bx - 14), max(0, by - 6), bw + 28, bh + 12), 'label': 'EMAIL PRIBADI', 'expires': now + 12.0})
                            elif any((k in t_lower for k in ['tampilkan sandi', 'tampllkan sandi', 'show password', 'lihat sandi'])):
                                inp_box = find_input_box_above_label(frame, bx, by, bw, bh)
                                detected.append({'box': inp_box, 'label': 'KOLOM SANDI', 'expires': now + 12.0})
                            elif any((k in t_lower for k in ['email', 'surel', 'e-mail', 'alamat email', 'email address'])):
                                inp_box = find_input_box_below_label(frame, bx, by, bw, bh)
                                detected.append({'box': inp_box, 'label': 'KOLOM EMAIL', 'expires': now + 12.0})
                                side_box = find_input_box_beside_label(frame, bx, by, bw, bh)
                                if side_box:
                                    detected.append({'box': side_box, 'label': 'KOLOM EMAIL', 'expires': now + 12.0})
                            elif any((k in t_lower for k in ['password', 'sandi', 'passcode', 'pin', 'masukkan sandi'])):
                                inp_box = find_input_box_below_label(frame, bx, by, bw, bh)
                                detected.append({'box': inp_box, 'label': 'KOLOM SANDI', 'expires': now + 12.0})
                                side_box = find_input_box_beside_label(frame, bx, by, bw, bh)
                                if side_box:
                                    detected.append({'box': side_box, 'label': 'KOLOM SANDI', 'expires': now + 12.0})
                            elif any((k in t_lower for k in ['username', 'pengguna', 'user id', 'userid'])):
                                inp_box = find_input_box_below_label(frame, bx, by, bw, bh)
                                detected.append({'box': inp_box, 'label': 'KOLOM USERNAME', 'expires': now + 12.0})
                                side_box = find_input_box_beside_label(frame, bx, by, bw, bh)
                                if side_box:
                                    detected.append({'box': side_box, 'label': 'KOLOM USERNAME', 'expires': now + 12.0})
                            elif PASSWORD_BULLETS_REGEX.search(text_clean):
                                detected.append({'box': (max(0, bx - 18), max(0, by - 8), bw + 36, bh + 16), 'label': 'KATA SANDI', 'expires': now + 12.0})
                            elif PHONE_REGEX.search(text_clean):
                                detected.append({'box': (max(0, bx - 8), max(0, by - 6), bw + 16, bh + 12), 'label': 'NO TELEPON', 'expires': now + 12.0})
                            elif TOKEN_REGEX.search(text_clean):
                                detected.append({'box': (max(0, bx - 8), max(0, by - 6), bw + 16, bh + 12), 'label': 'API TOKEN', 'expires': now + 12.0})
                            elif CREDIT_CARD_REGEX.search(text_clean):
                                detected.append({'box': (max(0, bx - 8), max(0, by - 6), bw + 16, bh + 12), 'label': 'NO KARTU', 'expires': now + 12.0})
                            elif NIK_REGEX.search(text_clean):
                                detected.append({'box': (max(0, bx - 8), max(0, by - 6), bw + 16, bh + 12), 'label': 'NIK KTP', 'expires': now + 12.0})
                            elif WA_SENDER_REGEX.search(text_clean):
                                detected.append({'box': (max(0, bx - 8), max(0, by - 4), bw + 16, bh + 8), 'label': 'KONTAK WA', 'expires': now + 12.0})
                            else:
                                for kw in SENSITIVE_KEYWORDS:
                                    if kw in t_lower:
                                        detected.append({'box': (max(0, bx - 8), max(0, by - 6), bw + 16, bh + 12), 'label': kw.upper(), 'expires': now + 12.0})
                                        break
                if bm_ys:
                    y1 = max(45, int(min((y[0] for y in bm_ys)) - 6))
                    y2 = int(max((y[1] for y in bm_ys)) + 8)
                    self.bookmark_detector.trigger_from_ocr(y1, y2, duration=3.0)
                if toast_texts and (not self.toast_detector_br.is_active):
                    self.toast_detector_br.trigger_from_detection(duration=4.5, reason='Teks Notifikasi')
                with self.pii_lock:
                    existing = [b for b in self.active_pii_boxes if now < b['expires']]
                    for n_box in detected:
                        dup = False
                        for e_box in existing:
                            eb = e_box['box']
                            nb = n_box['box']
                            if abs(eb[0] - nb[0]) < 25 and abs(eb[1] - nb[1]) < 25 and (abs(eb[2] - nb[2]) < 35):
                                e_box['expires'] = n_box['expires']
                                dup = True
                                break
                        if not dup:
                            existing.append(n_box)
                    self.active_pii_boxes = existing
                if self.active_pii_boxes:
                    self.lbl_s_ocr.config(text=f'• Form/Teks: 🔒 {len(self.active_pii_boxes)} disamarkan', fg=ACCENT_ROSE)
                else:
                    self.lbl_s_ocr.config(text='• Kredensial/Form: Siaga', fg=ACCENT_EMERALD)
                if self.bookmark_detector.is_browser_visible:
                    self.lbl_s_bm.config(text='• Bookmark: 🔒 Disamarkan', fg=ACCENT_ROSE)
                else:
                    self.lbl_s_bm.config(text='• Bookmark: Bersih', fg=ACCENT_EMERALD)
            except Exception:
                pass
            time.sleep(0.15)

    def _capture_loop(self):
        fps_counter = 0
        last_fps_time = time.time()
        fps_display = 0.0
        while self.is_streaming:
            loop_start = time.time()
            mon_idx = min(self.selected_monitor_idx.get(), len(self.monitors) - 1)
            target_mon = self.monitors[mon_idx]
            try:
                raw = self.sct.grab(target_mon)
                frame = np.array(raw)
                frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            except Exception:
                frame = np.zeros((720, 1280, 3), dtype=np.uint8) + 16
                cv2.putText(frame, 'BIFROST HDMI SHIELD', (180, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (120, 120, 120), 2)
            H, W = frame.shape[:2]
            if self.is_frozen:
                if self.frozen_frame is None:
                    self.frozen_frame = frame.copy()
                frame = self.frozen_frame.copy()
            if self.is_panic:
                frame[:] = (10, 10, 15)
                cv2.putText(frame, 'LAYAR DINONAKTIFKAN', (W // 2 - 200, H // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (220, 220, 220), 2)
            else:
                style = self.mask_style.get()
                now = time.time()
                active_sensor_count = 0
                is_loop_risk, loop_reason = self.anti_loop_detector.check(H, W)
                if is_loop_risk:
                    frame = self.anti_loop_detector.get_curtain_frame(W, H)
                    self.anti_loop_detector.is_curtain_active = True
                    self.lbl_s_loop.config(text=f'• Anti-Loop: 🔒 Tirai Aktif ({loop_reason})', fg=ACCENT_ROSE)
                    self.lbl_vp_title.config(text=f'🛡️ Tirai Anti-Loop Aktif ({loop_reason})', fg=ACCENT_AMBER)
                else:
                    self.anti_loop_detector.is_curtain_active = False
                    if self.override_loop_curtain.get():
                        self.lbl_s_loop.config(text='• Anti-Loop: 👁️ Override Aktif', fg=ACCENT_AMBER)
                    else:
                        self.lbl_s_loop.config(text='• Anti-Loop: Siaga', fg=ACCENT_EMERALD)
                    if self.smart_whatsapp_active.get():
                        wa_rects, is_fg_wa, fg_hwnd = find_visible_whatsapp_windows(W, H)
                        if wa_rects:
                            active_sensor_count += 1
                            self.lbl_s_wa.config(text='• WhatsApp: 🔒 Terlindungi', fg=ACCENT_ROSE)
                            fg_saved = None
                            fx, fy, fw, fh = (0, 0, 0, 0)
                            if not is_fg_wa and fg_hwnd:
                                fg_rect = wintypes.RECT()
                                if user32.GetWindowRect(fg_hwnd, ctypes.byref(fg_rect)):
                                    fx = max(0, fg_rect.left)
                                    fy = max(0, fg_rect.top)
                                    fw = min(W - fx, fg_rect.right - fg_rect.left)
                                    fh = min(H - fy, fg_rect.bottom - fg_rect.top)
                                    if fw > 80 and fh > 80 and (fy + fh <= H) and (fx + fw <= W):
                                        fg_saved = frame[fy:fy + fh, fx:fx + fw].copy()
                            for wx, wy, ww, wh in wa_rects:
                                self.apply_mask(frame, wx, wy, ww, wh, style, badge_text='WHATSAPP PRIVACY SHIELD')
                            if fg_saved is not None:
                                frame[fy:fy + fh, fx:fx + fw] = fg_saved
                        else:
                            self.lbl_s_wa.config(text='• WhatsApp: Aman', fg=ACCENT_EMERALD)
                    if self.smart_bookmarks_active.get():
                        is_bm, bm_y1, bm_y2 = self.bookmark_detector.check(H, W)
                        if is_bm and bm_y2 > bm_y1:
                            active_sensor_count += 1
                            self.lbl_s_bm.config(text='• Bookmark: 🔒 Disamarkan', fg=ACCENT_ROSE)
                            self.apply_mask(frame, 0, bm_y1, W, bm_y2 - bm_y1, style, badge_text='BOOKMARK BROWSER')
                        else:
                            self.lbl_s_bm.config(text='• Bookmark: Bersih', fg=ACCENT_EMERALD)
                    if self.smart_toast_active.get():
                        bw = min(380, int(W * 0.32))
                        bh = min(150, int(H * 0.2))
                        tx = W - bw - 15
                        ty = H - bh - 50
                        roi = frame[ty:ty + bh, tx:tx + bw]
                        is_toast, newly_triggered = self.toast_detector_br.update(roi, W, H)
                        if is_toast:
                            active_sensor_count += 1
                            reason_lbl = f'🔒 {self.toast_detector_br.last_reason}' if self.toast_detector_br.last_reason else '🔒 Disamarkan'
                            self.lbl_s_toast.config(text=f'• Pop-up: {reason_lbl}', fg=ACCENT_ROSE)
                            self.apply_mask(frame, tx, ty, bw, bh, style, badge_text='NOTIFIKASI')
                        else:
                            self.lbl_s_toast.config(text='• Pop-up: Siaga', fg=ACCENT_EMERALD)
                    if self.smart_taskbar_active.get():
                        tb_h = max(46, int(H * 0.05))
                        tb_roi = frame[H - tb_h:H, :]
                        badges = self.taskbar_detector.scan(tb_roi)
                        if badges:
                            active_sensor_count += 1
                            for bx, by, bw, bh in badges:
                                self.apply_mask(frame, bx, H - tb_h + by, bw, bh, style)
                    with self.pii_lock:
                        for item in self.active_pii_boxes:
                            if now < item['expires']:
                                active_sensor_count += 1
                                bx, by, bw, bh = item['box']
                                self.apply_mask(frame, bx, by, bw, bh, style, badge_text=item.get('label', ''))
                    if active_sensor_count > 0:
                        self.lbl_vp_title.config(text='🔒 Menyensor Konten Sensitif', fg=ACCENT_ROSE)
                    else:
                        self.lbl_vp_title.config(text='🟢 Layar Bersih • Bebas Sensor', fg=ACCENT_CYAN)
            if self.projector_window and self.projector_label:
                try:
                    p_w = self.projector_label.winfo_width()
                    p_h = self.projector_label.winfo_height()
                    if p_w > 100 and p_h > 100:
                        if self.crop_laptop_taskbar.get():
                            tb_crop_h = max(38, int(H * 0.046))
                            out_frame = frame[0:max(10, H - tb_crop_h), :]
                        else:
                            out_frame = frame
                        proj_res = cv2.resize(out_frame, (p_w, p_h), interpolation=cv2.INTER_LINEAR)
                        proj_rgb = cv2.cvtColor(proj_res, cv2.COLOR_BGR2RGB)
                        proj_img = ImageTk.PhotoImage(Image.fromarray(proj_rgb))
                        self.projector_label.config(image=proj_img)
                        self.projector_label.image = proj_img
                except Exception:
                    pass
            cw = self.container_w
            ch = self.container_h
            if cw > 60 and ch > 60:
                scale = min(cw / W, ch / H)
                nw = max(1, int(W * scale))
                nh = max(1, int(H * scale))
                prev_res = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_LINEAR)
                prev_rgb = cv2.cvtColor(prev_res, cv2.COLOR_BGR2RGB)
                prev_img = ImageTk.PhotoImage(Image.fromarray(prev_rgb))
                self.preview_label.config(image=prev_img, text='')
                self.preview_label.image = prev_img
            fps_counter += 1
            if time.time() - last_fps_time >= 1.0:
                fps_display = fps_counter / (time.time() - last_fps_time)
                fps_counter = 0
                last_fps_time = time.time()
                self.lbl_telemetry.config(text=f'{fps_display:.0f} FPS • Layar {self.selected_monitor_idx.get()}')
            elapsed = time.time() - loop_start
            sleep_time = max(0.001, 1.0 / 60.0 - elapsed)
            time.sleep(sleep_time)

    def on_close(self):
        self.is_streaming = False
        if self.projector_window:
            try:
                self.projector_window.destroy()
            except Exception:
                pass
        self.root.destroy()

def main():
    root = tk.Tk()
    app = BIFROSTPresentationShieldApp(root)
    root.mainloop()
if __name__ == '__main__':
    main()
