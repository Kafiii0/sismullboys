import re
import io
import os
import time
import base64
import hashlib
import threading
from collections import OrderedDict
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image, ExifTags
from ultralytics import YOLO
app = FastAPI(title='BIFROST-ADLS Forensic Vision API', description='Adaptive Document Localization & Selective Credential Segmentation Engine', version='2.5.0-hki')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

class DetectionCache:

    def __init__(self, max_size: int=64):
        self.max_size = max_size
        self.cache = OrderedDict()
        self.lock = threading.Lock()

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
                return self.cache[key]
            return None

    def set(self, key: str, value: Dict[str, Any]):
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = value
            if len(self.cache) > self.max_size:
                self.cache.popitem(last=False)
DETECTION_CACHE = DetectionCache(max_size=64)

def to_py(val):
    if isinstance(val, (np.integer, np.int64, np.int32)):
        return int(val)
    if isinstance(val, (np.floating, np.float32, np.float64)):
        return float(val)
    if isinstance(val, dict):
        return {k: to_py(v) for k, v in val.items()}
    if isinstance(val, list):
        return [to_py(v) for v in val]
    return val

def parse_bool(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.lower() in ['true', '1', 'yes']
    return bool(val)
YUNET_PATH = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'face_detection_yunet.onnx')
face_detector = None
if os.path.exists(YUNET_PATH):
    try:
        face_detector = cv2.FaceDetectorYN.create(YUNET_PATH, '', (320, 320), score_threshold=0.3)
        print('YuNet FaceDetectorYN initialized successfully.')
    except Exception as e:
        print('YuNet initialization warning:', e)
yolo_model = None
try:
    yolo_model = YOLO('yolov8n.pt')
    print('YOLOv8 initialized successfully.')
except Exception as e:
    print('YOLO initialization warning:', e)
ocr_engine = None
try:
    from rapidocr_onnxruntime import RapidOCR
    cpu_cores = os.cpu_count() or 4
    threads = min(8, max(2, cpu_cores // 2))
    ocr_engine = RapidOCR(intra_op_num_threads=threads, rec_batch_num=16)
    dummy = np.zeros((32, 32, 3), dtype=np.uint8)
    ocr_engine(dummy)
    print(f'RapidOCR ONNX Engine initialized & warmed up successfully (threads={threads}, batch=16).')
except Exception as e:
    print('RapidOCR initialization warning:', e)

def extract_ocr_entities(img_bgr: np.ndarray) -> Dict[str, Any]:
    empty_result = {'all_texts': [], 'phone_numbers': [], 'names': [], 'timestamps': [], 'bank_accounts': [], 'nik_numbers': [], 'detected_keywords': []}
    if ocr_engine is None or img_bgr is None or img_bgr.size == 0:
        return empty_result
    try:
        results, _ = ocr_engine(img_bgr)
    except Exception as e:
        print('OCR execution error:', e)
        return empty_result
    if not results:
        return empty_result
    all_texts = []
    phone_numbers = []
    names = []
    timestamps = []
    bank_accounts = []
    nik_numbers = []
    emails = []
    passwords = []
    tokens = []
    form_inputs = []
    detected_keywords = []
    phone_regex = re.compile('(\\+?62|08)[\\d\\s-]{7,16}')
    ts_regex = re.compile('\\b([01]?\\d|2[0-3])[:.][0-5]\\d\\b')
    nik_regex = re.compile('\\b\\d{16}\\b')
    account_regex = re.compile('\\b\\d{9,16}\\b')
    group_name_regex = re.compile('~\\s*[\\w\\s.-]+')
    email_regex = re.compile('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b', re.IGNORECASE)
    password_mask_regex = re.compile('(?:[•●\\*\\.]{3,}|[\\u2022\\u25cf\\u2219\\u25aa\\u22c5]{2,})')
    token_regex = re.compile('\\b(ey[A-Za-z0-9_-]{12,}\\.[A-Za-z0-9_-]{12,}|\\bghp_[0-9a-zA-Z]{30,}|\\b[a-fA-F0-9]{32,64}\\b)')
    form_label_words = {'email', 'email address', 'surel', 'password', 'kata sandi', 'sandi', 'pin', 'username', 'token', 'otp'}
    for box, text, score in results:
        if score < 0.35:
            continue
        pts = np.array(box, dtype=np.int32)
        x, y, w, h = cv2.boundingRect(pts)
        item = {'text': text.strip(), 'bbox': [int(x), int(y), int(w), int(h)], 'score': float(score)}
        all_texts.append(item)
        t_clean = text.strip()
        t_lower = t_clean.lower()
        if email_regex.search(t_clean):
            emails.append(item)
            detected_keywords.append('email_address')
        elif password_mask_regex.search(t_clean):
            passwords.append(item)
            detected_keywords.append('password_mask')
        elif phone_regex.search(t_clean):
            phone_numbers.append(item)
            detected_keywords.append('phone_number')
        elif group_name_regex.search(t_clean) or t_clean.startswith('~'):
            names.append(item)
            detected_keywords.append('contact_name')
        elif ts_regex.search(t_clean) and len(t_clean) <= 12:
            timestamps.append(item)
            detected_keywords.append('timestamp')
        elif nik_regex.search(t_clean):
            nik_numbers.append(item)
            detected_keywords.append('nik')
        elif account_regex.search(t_clean) and (not phone_regex.search(t_clean)):
            bank_accounts.append(item)
            detected_keywords.append('bank_account')
        elif token_regex.search(t_clean):
            tokens.append(item)
            detected_keywords.append('api_token')
        if any((fkw == t_lower or fkw in t_lower.split() for fkw in form_label_words)):
            input_box = [int(x), int(y + h + 4), int(max(w * 2.2, 240)), 40]
            form_inputs.append({'text': f'Kolom {t_clean}', 'bbox': input_box, 'score': float(score)})
            detected_keywords.append('form_input_credential')
    return {'all_texts': all_texts, 'phone_numbers': phone_numbers, 'names': names, 'timestamps': timestamps, 'bank_accounts': bank_accounts, 'nik_numbers': nik_numbers, 'emails': emails, 'passwords': passwords, 'tokens': tokens, 'form_inputs': form_inputs, 'detected_keywords': list(set(detected_keywords))}

def extract_exif(img_pil: Image.Image) -> Dict[str, Any]:
    exif_data = {}
    try:
        info = img_pil._getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                if decoded in ['Make', 'Model', 'DateTimeOriginal', 'Software', 'LensModel']:
                    exif_data[decoded] = str(value)
                elif decoded == 'GPSInfo':
                    exif_data['GPS_Telemetry'] = 'Embedded Geo-Coordinates Detected'
    except Exception:
        pass
    if not exif_data:
        exif_data = {'Container_Format': 'JPEG / Standard Bitmap', 'Notice': 'No unscrubbed container metadata detected or container format is PNG/WebP'}
    return exif_data

def calc_iou(b1, b2):
    xA = max(b1[0], b2[0])
    yA = max(b1[1], b2[1])
    xB = min(b1[0] + b1[2], b2[0] + b2[2])
    yB = min(b1[1] + b1[3], b2[1] + b2[3])
    inter = max(0, xB - xA) * max(0, yB - yA)
    a1 = b1[2] * b1[3]
    a2 = b2[2] * b2[3]
    union = a1 + a2 - inter
    return inter / float(union) if union > 0 else 0

def detect_faces_fast(img_bgr: np.ndarray, force_deep: bool=False) -> List[Dict[str, Any]]:
    if face_detector is None or img_bgr is None:
        return []
    h, w = img_bgr.shape[:2]
    faces = []
    try:
        face_detector.setInputSize((w, h))
        _, detections = face_detector.detect(img_bgr)
        if detections is not None:
            for det in detections:
                fx, fy, fw, fh = det[0:4].astype(int)
                conf = float(det[-1])
                if conf > 0.35:
                    faces.append({'bbox': [int(max(0, fx)), int(max(0, fy)), int(min(w - fx, fw)), int(min(h - fy, fh))], 'conf': round(conf, 3)})
    except Exception as e:
        print('YuNet single-pass error:', e)
    if force_deep and (not faces) and (yolo_model is not None):
        try:
            results = yolo_model(img_bgr, verbose=False)
            boxes = results[0].boxes
            for b in boxes:
                if int(b.cls[0]) == 0:
                    xyxy = b.xyxy[0].cpu().numpy().astype(int)
                    bx, by, bx2, by2 = xyxy
                    crop_y2 = min(h, by + int((by2 - by) * 0.75))
                    crop = img_bgr[by:crop_y2, bx:bx2]
                    if crop.size > 0:
                        face_detector.setInputSize((crop.shape[1], crop.shape[0]))
                        _, p_det = face_detector.detect(crop)
                        if p_det is not None:
                            for det in p_det:
                                fx, fy, fw, fh = det[0:4].astype(int)
                                conf = float(det[-1])
                                if conf > 0.35:
                                    faces.append({'bbox': [int(bx + fx), int(by + fy), int(fw), int(fh)], 'conf': round(conf, 3)})
        except Exception as e:
            print('YOLO person deep face error:', e)
    return faces

def detect_id_card(img_bgr: np.ndarray) -> Optional[Dict[str, Any]]:
    best_card = None
    h_img, w_img = img_bgr.shape[:2]
    if yolo_model is not None:
        try:
            results = yolo_model(img_bgr, verbose=False)
            boxes = results[0].boxes
            for b in boxes:
                cls_id = int(b.cls[0])
                cls_name = yolo_model.names[cls_id]
                xyxy = b.xyxy[0].cpu().numpy().astype(int)
                bx, by, bx2, by2 = xyxy
                bw = bx2 - bx
                bh = by2 - by
                aspect = bw / float(bh) if bh > 0 else 0
                if cls_name in ['cell phone', 'book'] and 1.15 <= aspect <= 2.2:
                    best_card = [int(bx), int(by), int(bw), int(bh)]
                    break
        except Exception as e:
            print('YOLO card detector error:', e)
    if best_card is None:
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        lower_cyan = np.array([70, 20, 20])
        upper_cyan = np.array([130, 255, 255])
        color_mask = cv2.inRange(hsv, lower_cyan, upper_cyan)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
        closed = cv2.morphologyEx(color_mask, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        max_area = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < w_img * h_img * 0.015:
                continue
            x, y, w, h = cv2.boundingRect(cnt)
            aspect = w / float(h)
            if 1.15 <= aspect <= 2.2:
                if area > max_area:
                    max_area = area
                    best_card = [int(x), int(y), int(w), int(h)]
    if best_card:
        x, y, w, h = best_card
        card_roi = img_bgr[y:y + h, x:x + w]
        cyan_ratio = 0.0
        if card_roi.size > 0:
            hsv_card = cv2.cvtColor(card_roi, cv2.COLOR_BGR2HSV)
            c_mask = cv2.inRange(hsv_card, np.array([70, 25, 25]), np.array([135, 255, 255]))
            cyan_ratio = np.count_nonzero(c_mask) / float(w * h)
        is_ktp = cyan_ratio >= 0.06
        ktp_sub = {'header': [int(x + 0.05 * w), int(y + 0.02 * h), int(0.9 * w), int(0.18 * h)], 'nik': [int(x + 0.18 * w), int(y + 0.19 * h), int(0.6 * w), int(0.12 * h)], 'name': [int(x + 0.18 * w), int(y + 0.31 * h), int(0.48 * w), int(0.1 * h)], 'ttl': [int(x + 0.18 * w), int(y + 0.41 * h), int(0.48 * w), int(0.09 * h)], 'gender_blood': [int(x + 0.18 * w), int(y + 0.5 * h), int(0.48 * w), int(0.07 * h)], 'address': [int(x + 0.18 * w), int(y + 0.57 * h), int(0.48 * w), int(0.16 * h)], 'other_pii': [int(x + 0.18 * w), int(y + 0.73 * h), int(0.48 * w), int(0.14 * h)], 'photo': [int(x + 0.68 * w), int(y + 0.2 * h), int(0.29 * w), int(0.55 * h)], 'signature': [int(x + 0.68 * w), int(y + 0.75 * h), int(0.29 * w), int(0.21 * h)], 'qr': [int(x + 0.03 * w), int(y + 0.74 * h), int(0.15 * w), int(0.22 * h)]}
        sim_sub = {'header': [int(x + 0.05 * w), int(y + 0.02 * h), int(0.9 * w), int(0.16 * h)], 'sim_number': [int(x + 0.38 * w), int(y + 0.18 * h), int(0.42 * w), int(0.1 * h)], 'sim_class': [int(x + 0.8 * w), int(y + 0.18 * h), int(0.16 * w), int(0.1 * h)], 'name': [int(x + 0.15 * w), int(y + 0.28 * h), int(0.5 * w), int(0.12 * h)], 'address': [int(x + 0.15 * w), int(y + 0.4 * h), int(0.5 * w), int(0.18 * h)], 'occupation_ttl': [int(x + 0.15 * w), int(y + 0.58 * h), int(0.5 * w), int(0.14 * h)], 'photo': [int(x + 0.68 * w), int(y + 0.28 * h), int(0.29 * w), int(0.5 * h)], 'fingerprint_sign': [int(x + 0.15 * w), int(y + 0.72 * h), int(0.38 * w), int(0.24 * h)], 'expiry': [int(x + 0.55 * w), int(y + 0.8 * h), int(0.4 * w), int(0.16 * h)]}
        return {'detected': True, 'card_type': 'ktp' if is_ktp else 'sim', 'type_label': 'Kartu Tanda Penduduk (e-KTP)' if is_ktp else 'Surat Izin Mengemudi (SIM)', 'cyan_ratio': round(float(cyan_ratio), 4), 'bbox': [int(x), int(y), int(w), int(h)], 'aspect_ratio': round(float(w) / float(h), 3), 'standard': 'ISO/IEC 7810 ID-1', 'ktp_regions': ktp_sub, 'sim_regions': sim_sub}
    return None

def detect_whatsapp_screenshot(img_bgr: np.ndarray, ocr_data: Optional[Dict[str, Any]]=None) -> Dict[str, Any]:
    h, w = img_bgr.shape[:2]
    aspect = h / float(w)
    has_chat_keywords = False
    if ocr_data:
        has_chat_keywords = len(ocr_data.get('phone_numbers', [])) > 0 or len(ocr_data.get('names', [])) > 0 or len(ocr_data.get('timestamps', [])) >= 2
    is_mobile_screen = aspect >= 1.25 or has_chat_keywords
    header_h = int(h * 0.088)
    footer_h = int(h * 0.075)
    footer_y = h - footer_h
    avatar_box = [int(w * 0.08), int(header_h * 0.18), int(header_h * 0.65), int(header_h * 0.65)]
    contact_name_box = [int(w * 0.2), int(header_h * 0.18), int(w * 0.58), int(header_h * 0.4)]
    status_box = [int(w * 0.2), int(header_h * 0.58), int(w * 0.45), int(header_h * 0.3)]
    input_box = [int(w * 0.02), int(footer_y + 0.05 * footer_h), int(w * 0.82), int(0.9 * footer_h)]
    chat_bubbles = []
    digit_clusters = []
    timestamps = []
    chat_roi_y1 = header_h
    chat_roi_y2 = footer_y
    chat_roi = img_bgr[chat_roi_y1:chat_roi_y2, :]
    if chat_roi.size > 0:
        gray = cv2.cvtColor(chat_roi, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blur, 30, 100)
        kernel_bubble = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 10))
        dilated = cv2.dilate(edges, kernel_bubble, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            x, y, bw, bh = cv2.boundingRect(cnt)
            if bw > w * 0.18 and 25 < bh < h * 0.35:
                abs_y = y + chat_roi_y1
                chat_bubbles.append([int(x), int(abs_y), int(bw), int(bh)])
                ts_w = int(min(bw * 0.28, 80))
                ts_h = int(min(24, bh * 0.35))
                ts_x = int(x + bw - ts_w - 6)
                ts_y = int(abs_y + bh - ts_h - 4)
                timestamps.append([ts_x, ts_y, ts_w, ts_h])
    ocr_phones = ocr_data.get('phone_numbers', []) if ocr_data else []
    ocr_names = ocr_data.get('names', []) if ocr_data else []
    ocr_ts = ocr_data.get('timestamps', []) if ocr_data else []
    ocr_accounts = ocr_data.get('bank_accounts', []) if ocr_data else []
    if ocr_ts:
        timestamps = [item['bbox'] for item in ocr_ts]
    return {'is_screenshot': is_mobile_screen, 'aspect_ratio': round(aspect, 3), 'header_box': [0, 0, w, header_h], 'avatar_box': avatar_box, 'contact_name_box': contact_name_box, 'status_box': status_box, 'input_box': input_box, 'chat_bubbles_count': len(chat_bubbles), 'digit_clusters_count': len(digit_clusters) + len(ocr_phones) + len(ocr_accounts), 'chat_bubbles': chat_bubbles[:15], 'digit_clusters': [p['bbox'] for p in ocr_phones] + [a['bbox'] for a in ocr_accounts], 'timestamps': timestamps[:25], 'ocr_phones': [p['bbox'] for p in ocr_phones], 'ocr_names': [n['bbox'] for n in ocr_names], 'ocr_accounts': [a['bbox'] for a in ocr_accounts], 'ocr_detected_count': len(ocr_data.get('all_texts', [])) if ocr_data else 0}

def apply_redaction(img: np.ndarray, x: int, y: int, w: int, h: int, style: str='solid'):
    H, W = img.shape[:2]
    x = max(0, min(W - 1, int(x)))
    y = max(0, min(H - 1, int(y)))
    w = max(1, min(W - x, int(w)))
    h = max(1, min(H - y, int(h)))
    if style == 'solid':
        img[y:y + h, x:x + w] = (0, 0, 0)
    elif style == 'mosaic':
        roi = img[y:y + h, x:x + w]
        if roi.size > 0:
            small_w = max(1, w // 14)
            small_h = max(1, h // 14)
            small = cv2.resize(roi, (small_w, small_h), interpolation=cv2.INTER_LINEAR)
            pixelated = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
            img[y:y + h, x:x + w] = pixelated
    else:
        roi = img[y:y + h, x:x + w]
        if roi.size > 0:
            ksize = max(15, w // 10 | 1)
            blurred = cv2.GaussianBlur(roi, (ksize, ksize), 30)
            img[y:y + h, x:x + w] = blurred

def process_image_core(contents: bytes, options: Dict[str, Any]) -> Dict[str, Any]:
    t_start = time.perf_counter()
    raw_sha256 = hashlib.sha256(contents).hexdigest()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise HTTPException(status_code=400, detail='Invalid image encoding')
    cached_entry = DETECTION_CACHE.get(raw_sha256)
    if cached_entry is not None:
        raw_exif = cached_entry['raw_exif']
        ocr_data = cached_entry['ocr_data']
        card_info = cached_entry['card_info']
        wa_info = cached_entry['wa_info']
        detected_faces = cached_entry['detected_faces']
        cache_hit = True
    else:
        pil_img = Image.open(io.BytesIO(contents))
        raw_exif = extract_exif(pil_img)
        ocr_data = extract_ocr_entities(img_bgr)
        card_info = detect_id_card(img_bgr)
        wa_info = detect_whatsapp_screenshot(img_bgr, ocr_data)
        is_wa = wa_info and wa_info.get('is_screenshot', False)
        need_face = options.get('redact_user_face', False) or not is_wa
        detected_faces = detect_faces_fast(img_bgr, force_deep=options.get('redact_user_face', False)) if need_face else []
        DETECTION_CACHE.set(raw_sha256, {'raw_exif': raw_exif, 'ocr_data': ocr_data, 'card_info': card_info, 'wa_info': wa_info, 'detected_faces': detected_faces})
        cache_hit = False
    sanitized_bgr = img_bgr.copy()
    redacted_items = []
    mask_style = options.get('mask_style', 'mosaic')
    preserve_header = options.get('preserve_header', True)
    redact_user_face = options.get('redact_user_face', False)
    if card_info and options.get('target_type', 'auto') in ['auto', 'ktp']:
        k_sub = card_info['ktp_regions']
        card_box = card_info['bbox']
        if options.get('redact_ktp_mode') == 'full_card':
            if preserve_header:
                hy = k_sub['header'][1] + k_sub['header'][3]
                apply_redaction(sanitized_bgr, card_box[0], hy, card_box[2], card_box[1] + card_box[3] - hy, mask_style)
                redacted_items.append('Badan Kartu KTP (Header Dikecualikan)')
            else:
                apply_redaction(sanitized_bgr, card_box[0], card_box[1], card_box[2], card_box[3], mask_style)
                redacted_items.append('Seluruh Kartu KTP')
        if options.get('redact_nik', False):
            apply_redaction(sanitized_bgr, k_sub['nik'][0], k_sub['nik'][1], k_sub['nik'][2], k_sub['nik'][3], mask_style)
            redacted_items.append('NIK 16-Digit KTP')
        if options.get('redact_name', False):
            apply_redaction(sanitized_bgr, k_sub['name'][0], k_sub['name'][1], k_sub['name'][2], k_sub['name'][3], mask_style)
            redacted_items.append('Nama Lengkap KTP')
        if options.get('redact_ttl', False):
            apply_redaction(sanitized_bgr, k_sub['ttl'][0], k_sub['ttl'][1], k_sub['ttl'][2], k_sub['ttl'][3], mask_style)
            redacted_items.append('Tempat / Tanggal Lahir (TTL)')
        if options.get('redact_gender', False):
            apply_redaction(sanitized_bgr, k_sub['gender_blood'][0], k_sub['gender_blood'][1], k_sub['gender_blood'][2], k_sub['gender_blood'][3], mask_style)
            redacted_items.append('Jenis Kelamin & Golongan Darah')
        if options.get('redact_address', False):
            apply_redaction(sanitized_bgr, k_sub['address'][0], k_sub['address'][1], k_sub['address'][2], k_sub['address'][3], mask_style)
            redacted_items.append('Alamat & Domisili KTP')
        if options.get('redact_other_pii', False):
            apply_redaction(sanitized_bgr, k_sub['other_pii'][0], k_sub['other_pii'][1], k_sub['other_pii'][2], k_sub['other_pii'][3], mask_style)
            redacted_items.append('Agama & Pekerjaan KTP')
        if options.get('redact_card_photo', False):
            apply_redaction(sanitized_bgr, k_sub['photo'][0], k_sub['photo'][1], k_sub['photo'][2], k_sub['photo'][3], mask_style)
            redacted_items.append('Pasfoto KTP')
        if options.get('redact_signature', False):
            apply_redaction(sanitized_bgr, k_sub['signature'][0], k_sub['signature'][1], k_sub['signature'][2], k_sub['signature'][3], mask_style)
            redacted_items.append('Tanda Tangan KTP')
        if options.get('redact_qr', False):
            apply_redaction(sanitized_bgr, k_sub['qr'][0], k_sub['qr'][1], k_sub['qr'][2], k_sub['qr'][3], mask_style)
            redacted_items.append('QR / Barcode KTP')
    if card_info and options.get('target_type', 'auto') in ['auto', 'sim']:
        s_sub = card_info['sim_regions']
        card_box = card_info['bbox']
        if options.get('redact_sim_full', False):
            if preserve_header:
                hy = s_sub['header'][1] + s_sub['header'][3]
                apply_redaction(sanitized_bgr, card_box[0], hy, card_box[2], card_box[1] + card_box[3] - hy, mask_style)
                redacted_items.append('Badan Kartu SIM (Header POLRI Dikecualikan)')
            else:
                apply_redaction(sanitized_bgr, card_box[0], card_box[1], card_box[2], card_box[3], mask_style)
                redacted_items.append('Seluruh Kartu SIM')
        if options.get('redact_sim_number', False):
            apply_redaction(sanitized_bgr, s_sub['sim_number'][0], s_sub['sim_number'][1], s_sub['sim_number'][2], s_sub['sim_number'][3], mask_style)
            redacted_items.append('Nomor SIM (12-Digit)')
        if options.get('redact_sim_name', False):
            apply_redaction(sanitized_bgr, s_sub['name'][0], s_sub['name'][1], s_sub['name'][2], s_sub['name'][3], mask_style)
            redacted_items.append('Nama Pemegang SIM')
        if options.get('redact_sim_address', False):
            apply_redaction(sanitized_bgr, s_sub['address'][0], s_sub['address'][1], s_sub['address'][2], s_sub['address'][3], mask_style)
            redacted_items.append('Alamat Domisili SIM')
        if options.get('redact_sim_occupation', False):
            apply_redaction(sanitized_bgr, s_sub['occupation_ttl'][0], s_sub['occupation_ttl'][1], s_sub['occupation_ttl'][2], s_sub['occupation_ttl'][3], mask_style)
            redacted_items.append('Pekerjaan & TTL SIM')
        if options.get('redact_sim_photo', False):
            apply_redaction(sanitized_bgr, s_sub['photo'][0], s_sub['photo'][1], s_sub['photo'][2], s_sub['photo'][3], mask_style)
            redacted_items.append('Pasfoto Pemegang SIM')
        if options.get('redact_sim_fingerprint', False):
            apply_redaction(sanitized_bgr, s_sub['fingerprint_sign'][0], s_sub['fingerprint_sign'][1], s_sub['fingerprint_sign'][2], s_sub['fingerprint_sign'][3], mask_style)
            redacted_items.append('Sidik Jari & Tanda Tangan SIM')
        if options.get('redact_sim_expiry', False):
            apply_redaction(sanitized_bgr, s_sub['expiry'][0], s_sub['expiry'][1], s_sub['expiry'][2], s_sub['expiry'][3], mask_style)
            redacted_items.append('Masa Berlaku SIM')
    if wa_info and (wa_info['is_screenshot'] or options.get('target_type') == 'whatsapp'):
        pad = 3
        if options.get('redact_wa_contact', False):
            c_box = wa_info['contact_name_box']
            apply_redaction(sanitized_bgr, c_box[0], c_box[1], c_box[2], c_box[3], mask_style)
            for nbox in wa_info.get('ocr_names', []):
                apply_redaction(sanitized_bgr, nbox[0] - pad, nbox[1] - pad, nbox[2] + pad * 2, nbox[3] + pad * 2, mask_style)
            total_names = 1 + len(wa_info.get('ocr_names', []))
            redacted_items.append(f'Nama Kontak & Pengirim Grup ({total_names} Titik)')
        if options.get('redact_wa_phone_numbers', False):
            for pbox in wa_info.get('ocr_phones', []):
                apply_redaction(sanitized_bgr, pbox[0] - pad, pbox[1] - pad, pbox[2] + pad * 2, pbox[3] + pad * 2, mask_style)
            if wa_info.get('ocr_phones'):
                redacted_items.append(f"Nomor Telepon WhatsApp ({len(wa_info['ocr_phones'])} Titik)")
        if options.get('redact_wa_avatar', False):
            av_box = wa_info['avatar_box']
            apply_redaction(sanitized_bgr, av_box[0], av_box[1], av_box[2], av_box[3], mask_style)
            redacted_items.append('Foto Profil Avatar Kontak')
        if options.get('redact_wa_account_numbers', False):
            for dbox in wa_info.get('ocr_accounts', []):
                apply_redaction(sanitized_bgr, dbox[0] - pad, dbox[1] - pad, dbox[2] + pad * 2, dbox[3] + pad * 2, mask_style)
            for dbox in wa_info['digit_clusters']:
                apply_redaction(sanitized_bgr, dbox[0], dbox[1], dbox[2], dbox[3], mask_style)
            if wa_info.get('ocr_accounts') or wa_info['digit_clusters']:
                redacted_items.append(f"Nomor Rekening / Digit di Chat ({len(wa_info.get('ocr_accounts', [])) + len(wa_info['digit_clusters'])} Titik)")
        if options.get('redact_wa_timestamp', False):
            for tbox in wa_info['timestamps']:
                apply_redaction(sanitized_bgr, tbox[0] - 2, tbox[1] - 2, tbox[2] + 4, tbox[3] + 4, mask_style)
            if wa_info['timestamps']:
                redacted_items.append(f"Timestamp Pesan ({len(wa_info['timestamps'])} Titik)")
        if options.get('redact_wa_chat_bubbles', False):
            for bbox in wa_info['chat_bubbles']:
                apply_redaction(sanitized_bgr, bbox[0], bbox[1], bbox[2], bbox[3], mask_style)
            if wa_info['chat_bubbles']:
                redacted_items.append(f"Gelembung Chat ({len(wa_info['chat_bubbles'])} Pesan)")
        if options.get('redact_wa_input_bar', False):
            ibox = wa_info['input_box']
            apply_redaction(sanitized_bgr, ibox[0], ibox[1], ibox[2], ibox[3], mask_style)
            redacted_items.append('Bar Input Pesan WhatsApp')
    for f in detected_faces:
        bx, by, bw, bh = f['bbox']
        is_inside_card = False
        if card_info:
            kx, ky, kw, kh = card_info['bbox']
            if bx >= kx - 10 and by >= ky - 10 and (bx + bw <= kx + kw + 10) and (by + bh <= ky + kh + 10):
                is_inside_card = True
        if not is_inside_card:
            f['role'] = 'user_face'
            if redact_user_face:
                apply_redaction(sanitized_bgr, bx, by, bw, bh, mask_style)
                redacted_items.append('Wajah Pengguna (Selfie)')
        else:
            f['role'] = 'card_photo_face'
    success, encoded_img = cv2.imencode('.jpg', sanitized_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    if not success:
        raise HTTPException(status_code=500, detail='Image encoding failed')
    sanitized_bytes = encoded_img.tobytes()
    sanitized_sha256 = hashlib.sha256(sanitized_bytes).hexdigest()
    b64_output = base64.b64encode(sanitized_bytes).decode('utf-8')
    data_url = f'data:image/jpeg;base64,{b64_output}'
    detected_doc_type = 'none'
    if card_info:
        detected_doc_type = card_info['card_type']
    elif wa_info and wa_info['is_screenshot']:
        detected_doc_type = 'whatsapp'
    res = {'success': True, 'document_type': detected_doc_type, 'ktp_detected': card_info is not None and card_info['card_type'] == 'ktp', 'sim_detected': card_info is not None and card_info['card_type'] == 'sim', 'whatsapp_detected': wa_info['is_screenshot'], 'card_info': card_info, 'whatsapp_info': wa_info, 'faces_detected_count': len(detected_faces), 'faces': detected_faces, 'redacted_items': redacted_items, 'raw_sha256': raw_sha256, 'sanitized_sha256': sanitized_sha256, 'exif_metadata': raw_exif, 'exif_stripped': options.get('strip_exif', False), 'ocr_telemetry': {'engine': 'RapidOCR-ONNX', 'total_texts_detected': len(ocr_data.get('all_texts', [])), 'phone_numbers_detected': len(ocr_data.get('phone_numbers', [])), 'names_detected': len(ocr_data.get('names', [])), 'timestamps_detected': len(ocr_data.get('timestamps', [])), 'nik_detected': len(ocr_data.get('nik_numbers', []))}, 'redacted_image_url': data_url, 'processing_time_ms': round((time.perf_counter() - t_start) * 1000, 1), 'cache_hit': cache_hit, 'algorithm_manifest': {'name': 'BIFROST-ADLS (Adaptive Document Localization & Selective Credential Segmentation)', 'classification': 'Multi-Spectral ISO/IEC 7810 ID-1 Edge Regressor & Mobile Chat Heuristic Pipeline', 'patent_readiness': 'HKI-Eligible Computer Vision Pipeline (Telkom University CBK2CAB3)', 'judicial_compliance': 'UU PDP No. 27/2022 & ISO/IEC 27037 Digital Forensics'}}
    return to_py(res)

@app.get('/health')
def health_check():
    return {'status': 'operational', 'engine': 'BIFROST-ADLS Forensic Vision', 'version': '2.5.0-hki', 'face_detector_loaded': face_detector is not None, 'yolo_loaded': yolo_model is not None}

@app.post('/detect-redact')
async def detect_redact_form(file: UploadFile=File(...), target_type: str=Form('auto'), mask_style: str=Form('mosaic'), strip_exif: str=Form('false'), preserve_header: str=Form('true'), redact_user_face: str=Form('false'), redact_ktp_mode: str=Form('none'), redact_nik: str=Form('false'), redact_name: str=Form('false'), redact_ttl: str=Form('false'), redact_gender: str=Form('false'), redact_address: str=Form('false'), redact_other_pii: str=Form('false'), redact_card_photo: str=Form('false'), redact_signature: str=Form('false'), redact_qr: str=Form('false'), redact_sim_full: str=Form('false'), redact_sim_number: str=Form('false'), redact_sim_name: str=Form('false'), redact_sim_address: str=Form('false'), redact_sim_occupation: str=Form('false'), redact_sim_photo: str=Form('false'), redact_sim_fingerprint: str=Form('false'), redact_sim_expiry: str=Form('false'), redact_wa_contact: str=Form('false'), redact_wa_avatar: str=Form('false'), redact_wa_account_numbers: str=Form('false'), redact_wa_phone_numbers: str=Form('false'), redact_wa_timestamp: str=Form('false'), redact_wa_chat_bubbles: str=Form('false'), redact_wa_input_bar: str=Form('false')):
    contents = await file.read()
    options = {'target_type': target_type, 'mask_style': mask_style, 'strip_exif': parse_bool(strip_exif), 'preserve_header': parse_bool(preserve_header), 'redact_user_face': parse_bool(redact_user_face), 'redact_ktp_mode': redact_ktp_mode, 'redact_nik': parse_bool(redact_nik), 'redact_name': parse_bool(redact_name), 'redact_ttl': parse_bool(redact_ttl), 'redact_gender': parse_bool(redact_gender), 'redact_address': parse_bool(redact_address), 'redact_other_pii': parse_bool(redact_other_pii), 'redact_card_photo': parse_bool(redact_card_photo), 'redact_signature': parse_bool(redact_signature), 'redact_qr': parse_bool(redact_qr), 'redact_sim_full': parse_bool(redact_sim_full), 'redact_sim_number': parse_bool(redact_sim_number), 'redact_sim_name': parse_bool(redact_sim_name), 'redact_sim_address': parse_bool(redact_sim_address), 'redact_sim_occupation': parse_bool(redact_sim_occupation), 'redact_sim_photo': parse_bool(redact_sim_photo), 'redact_sim_fingerprint': parse_bool(redact_sim_fingerprint), 'redact_sim_expiry': parse_bool(redact_sim_expiry), 'redact_wa_contact': parse_bool(redact_wa_contact), 'redact_wa_avatar': parse_bool(redact_wa_avatar), 'redact_wa_account_numbers': parse_bool(redact_wa_account_numbers), 'redact_wa_phone_numbers': parse_bool(redact_wa_phone_numbers), 'redact_wa_timestamp': parse_bool(redact_wa_timestamp), 'redact_wa_chat_bubbles': parse_bool(redact_wa_chat_bubbles), 'redact_wa_input_bar': parse_bool(redact_wa_input_bar)}
    return process_image_core(contents, options)

@app.post('/api/witness/detect-face')
async def witness_detect_face(file: UploadFile=File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return {'faces': [], 'width': 0, 'height': 0}
    faces = detect_faces_fast(img_bgr, force_deep=False)
    return {'faces': faces, 'width': int(img_bgr.shape[1]), 'height': int(img_bgr.shape[0])}
