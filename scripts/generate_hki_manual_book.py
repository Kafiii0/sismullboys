import os
import sys
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#444444"))

        # Running Header
        self.drawString(20 * mm, 282 * mm, "Buku Panduan Penggunaan Program Komputer: BIFROST")
        self.setStrokeColor(colors.HexColor("#D1D5DB"))
        self.setLineWidth(0.5)
        self.line(20 * mm, 280 * mm, 190 * mm, 280 * mm)

        # Running Footer
        self.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
        self.drawString(20 * mm, 11 * mm, "Universitas Telkom - Fakultas Informatika")
        page_text = f"Halaman {self._pageNumber} dari {total_pages}"
        self.drawRightString(190 * mm, 11 * mm, page_text)
        self.restoreState()


def format_code_block(code_text):
    lines = code_text.strip().split('\n')
    formatted = []
    for line in lines:
        indent_len = len(line) - len(line.lstrip(' '))
        content = line.lstrip(' ')
        content_escaped = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        indent_html = '&nbsp;' * (indent_len * 2)
        formatted.append(f"{indent_html}{content_escaped}")
    return "<br/>".join(formatted)


def build_manual_book_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=22 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=19,
        leading=25,
        alignment=1,
        textColor=colors.HexColor('#111111')
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11.5,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#333333')
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        alignment=1,
        textColor=colors.HexColor('#444444')
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=17,
        textColor=colors.HexColor('#111111'),
        spaceBefore=0,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#222222'),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        alignment=4,
        textColor=colors.HexColor('#1A1A1A'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#1A1A1A'),
        leftIndent=12,
        spaceAfter=2.5
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#444444'),
        spaceBefore=3,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9.8,
        textColor=colors.HexColor('#111111')
    )

    story = []

    # =========================================================================
    # HALAMAN 1: COVER
    # =========================================================================
    story.append(Spacer(1, 28 * mm))
    
    logo_path = 'public/bifrost_cam_logo.png'
    if os.path.exists(logo_path):
        story.append(Image(logo_path, width=44 * mm, height=44 * mm))
        story.append(Spacer(1, 14 * mm))

    story.append(Paragraph("BUKU PANDUAN PENGGUNAAN PROGRAM KOMPUTER", title_style))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Sistem Proteksi Privasi Multimedia Real-Time Terintegrasi:<br/>BIFROST Witness Cam & BIFROST HDMI Shield", subtitle_style))
    story.append(Spacer(1, 5 * mm))

    story.append(HRFlowable(width="60%", thickness=1.5, color=colors.HexColor("#222222"), spaceBefore=4, spaceAfter=14))

    story.append(Paragraph("Kategori Ciptaan: <strong>Program Komputer</strong>", meta_style))
    story.append(Paragraph("Sub-Kategori: <strong>Aplikasi Desktop & Layanan Pengolahan Multimedia</strong>", meta_style))
    story.append(Spacer(1, 40 * mm))

    cover_box = [
        [Paragraph("<strong>Penyusun / Pengembang:</strong>", meta_style)],
        [Paragraph("Tim Pengembang Perangkat Lunak BIFROST", meta_style)],
        [Paragraph("Program Studi S1 Informatika / Sains Data", meta_style)],
        [Paragraph("Fakultas Informatika, Universitas Telkom", meta_style)],
        [Paragraph("Bandung, Indonesia", meta_style)],
        [Paragraph("Tahun 2026", meta_style)],
    ]
    t_cover = Table(cover_box, colWidths=[150 * mm])
    t_cover.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_cover)
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 2: BAB I (DESKRIPSI UMUM SISTEM)
    # =========================================================================
    story.append(Paragraph("BAB I. DESKRIPSI UMUM SISTEM", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "BIFROST adalah perangkat lunak perlindungan privasi multimedia yang beroperasi secara luring (offline) "
        "pada sistem operasi Windows. Perangkat lunak ini dikembangkan untuk kebutuhan keamanan data identitas saksi, "
        "narasumber, dan penyaji informasi saat melakukan komunikasi tatap muka virtual melalui konferensi video maupun presentasi layar.",
        body_style
    ))

    story.append(Paragraph(
        "Sistem BIFROST terdiri dari dua modul fungsional utama yang berdiri sendiri namun bekerja saling melengkapi:",
        body_style
    ))

    story.append(Paragraph(
        "1. <strong>BIFROST Witness Cam:</strong> Modul pemroses aliran kamera web dan mikrofon secara real-time. "
        "Modul ini mendeteksi titik wajah pengguna menggunakan model pembelajaran mendalam YuNet ONNX, "
        "menerapkan sensor visual (mosaik, siluet, atau pita mata), serta memodulasi nada suara pengguna agar identitas vokal tidak "
        "dapat dikenali. Hasil pemrosesan disalurkan langsung sebagai perangkat kamera virtual (DirectShow) sehingga terbaca sebagai "
        "kamera standar pada aplikasi rapat daring seperti Google Meet, Zoom, dan OBS Studio.",
        bullet_style
    ))

    story.append(Paragraph(
        "2. <strong>BIFROST HDMI Shield:</strong> Modul pelindung layar tampilan saat laptop dihubungkan ke kabel proyektor fisik "
        "atau saat fitur 'Share Screen' aktif. Modul ini secara otomatis menyamarkan notifikasi pesan instan masuk, baris bookmark peramban, "
        "serta teks rahasia seperti kata sandi, token, dan nomor rekening perbankan. Modul ini juga dilengkapi pencegah tampilan cermin "
        "berulang (mirror loop) yang umum terjadi ketika jendela rapat virtual dibagikan ke layar rapat itu sendiri.",
        bullet_style
    ))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("1.1 Arsitektur Perangkat Lunak", h2_style))
    story.append(Paragraph(
        "Perangkat lunak BIFROST dibangun dengan arsitektur dua lapis (two-tier architecture) berbasis Tauri 2.0 dan Rust. "
        "Lapisan antarmuka pengguna (Frontend) menggunakan teknologi Next.js dan Tailwind CSS yang dirender melalui Microsoft Edge WebView2, "
        "menghasilkan penggunaan memori kerja (RAM) yang sangat rendah (sekitar 1.5 MB untuk antarmuka). Lapisan mesin komputasi (Backend Engine) "
        "berjalan sebagai proses mandiri berbasis pustaka OpenCV, ONNX Runtime, dan DirectShow API. Kedua lapisan berkomunikasi melalui "
        "antarmuka soket lokal berkas latensi rendah (loopback HTTP dan stream MJPEG lokal), memastikan keamanan data tanpa transmisi internet.",
        body_style
    ))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("1.2 Keunggulan Komputasi Luring (Zero Cloud Latency)", h2_style))
    story.append(Paragraph(
        "Seluruh proses inferensi visi komputer (deteksi wajah dan OCR teks) serta modulasi sinyal suara dijalankan 100% secara lokal "
        "di dalam CPU komputer pengguna tanpa mengirimkan satu bingkai gambar pun ke server cloud. Hal ini memberikan jaminan hukum "
        "bahwa data biometrik saksi dan informasi rahasia pada layar presentasi tidak berisiko bocor melalui jaringan internet.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 3: BAB II (KEBUTUHAN SISTEM & INSTALASI)
    # =========================================================================
    story.append(Paragraph("BAB II. KEBUTUHAN SISTEM DAN CARA INSTALASI", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("2.1 Spesifikasi Perangkat", h2_style))
    story.append(Paragraph(
        "Agar perangkat lunak BIFROST dapat menjalankan deteksi visual dan pemrosesan audio dengan lancar (minimal 30 bingkai per detik), "
        "dibutuhkan spesifikasi komputer sebagai berikut:",
        body_style
    ))

    spec_data = [
        [Paragraph("<strong>Komponen</strong>", meta_style), Paragraph("<strong>Spesifikasi Minimum</strong>", meta_style), Paragraph("<strong>Spesifikasi Rekomendasi</strong>", meta_style)],
        [Paragraph("Sistem Operasi", body_style), Paragraph("Windows 10 64-bit (Build 19041+)", body_style), Paragraph("Windows 11 64-bit", body_style)],
        [Paragraph("Prosesor (CPU)", body_style), Paragraph("Intel Core i3 Gen-8 / AMD Ryzen 3", body_style), Paragraph("Intel Core i5 Gen-10 / Ryzen 5 ke atas", body_style)],
        [Paragraph("Memori (RAM)", body_style), Paragraph("4 GB RAM", body_style), Paragraph("8 GB RAM atau lebih", body_style)],
        [Paragraph("Penyimpanan", body_style), Paragraph("Ruang kosong 350 MB", body_style), Paragraph("Solid State Drive (SSD)", body_style)],
        [Paragraph("Perangkat Masukan", body_style), Paragraph("Webcam USB / Terintegrasi, Mikrofon", body_style), Paragraph("Webcam Full HD 1080p, Mikrofon USB", body_style)]
    ]
    t_spec = Table(spec_data, colWidths=[35 * mm, 65 * mm, 65 * mm])
    t_spec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F0F0')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#333333')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_spec)

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("2.2 Prosedur Instalasi", h2_style))
    story.append(Paragraph(
        "Perangkat lunak telah dipaketkan ke dalam format installer mandiri Windows (.exe) menggunakan sistem instalasi NSIS. "
        "Langkah-langkah instalasi adalah sebagai berikut:",
        body_style
    ))
    story.append(Paragraph("1. Unduh berkas instalasi <code>BIFROST_Witness_Cam_Setup.exe</code> atau <code>BIFROST_HDMI_Shield_Setup.exe</code>.", bullet_style))
    story.append(Paragraph("2. Klik dua kali pada berkas installer yang telah diunduh.", bullet_style))
    story.append(Paragraph("3. Pada jendela wizard penyiapan, tentukan folder tujuan instalasi (standar: direktori Program Pengguna).", bullet_style))
    story.append(Paragraph("4. Klik tombol 'Install'. Installer akan menyalin seluruh pustaka biner, model kecerdasan buatan, dan konfigurasi kamera secara otomatis.", bullet_style))
    story.append(Paragraph("5. Setelah instalasi selesai, centang opsi 'Jalankan Aplikasi' lalu klik 'Finish'. Pintasan aplikasi akan muncul di Desktop dan Start Menu.", bullet_style))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("2.3 Manajemen Hak Akses Kamera & Mikrofon", h2_style))
    story.append(Paragraph(
        "Pada peluncuran pertama kali, sistem operasi Windows mungkin menampilkan permintaan izin privasi untuk kamera dan mikrofon. "
        "Pilih 'Izinkan' (Allow) agar modul mesin dapat membaca perangkat masukan fisik tanpa hambatan.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 4: BAB III (WITNESS CAM)
    # =========================================================================
    story.append(Paragraph("BAB III. PANDUAN PENGOPERASIAN BIFROST WITNESS CAM", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "BIFROST Witness Cam bertindak sebagai lapisan pelindung biometrik antara kamera fisik laptop dan aplikasi rapat virtual. "
        "Pengguna dapat mengatur gaya penyamaran wajah serta modulasi suara langsung dari antarmuka kontrol.",
        body_style
    ))

    story.append(Paragraph("3.1 Penjelasan Fitur Antarmuka Utama", h2_style))
    story.append(Paragraph("1. <strong>Pemilihan Perangkat Kamera:</strong> Menu tarik-turun (dropdown) untuk memilih kamera fisik masukan yang terpasang di komputer.", bullet_style))
    story.append(Paragraph("2. <strong>Pemilihan Resolusi:</strong> Pilihan format resolusi antara 720p HD (1280x720) untuk komputer berspesifikasi standar atau 1080p Full HD (1920x1080) untuk kejernihan maksimal.", bullet_style))
    story.append(Paragraph("3. <strong>Mode Sensor Wajah:</strong> Tersedia tiga jenis filter penyamaran:", bullet_style))
    story.append(Paragraph("   • <em>Mosaik:</em> Menyamarkan area wajah dengan pixelasi blok yang terukur.", bullet_style))
    story.append(Paragraph("   • <em>Siluet:</em> Mengisi area wajah dengan warna gelap transparan.", bullet_style))
    story.append(Paragraph("   • <em>Pita Mata:</em> Menempatkan bilah sensor horizontal khusus pada area kedua mata.", bullet_style))
    story.append(Paragraph("4. <strong>Modulasi Suara DSP:</strong> Pilihan modulasi suara untuk privasi vokal saksi (Deep Shadow untuk nada berat, Robotik untuk nada sintetis, atau Normal).", bullet_style))
    story.append(Paragraph("5. <strong>Tombol Utama Daya:</strong> Tombol tunggal untuk memulai atau menghentikan aliran kamera dan audio secara menyeluruh.", bullet_style))

    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("3.2 Bukti Pengujian Sensor Wajah Nyata", h2_style))
    story.append(Paragraph(
        "Berikut merupakan hasil pengujian riil penyensoran wajah saksi yang dihasilkan oleh algoritma deteksi YuNet dan modul sensor BIFROST:",
        body_style
    ))

    img1 = 'public/evidence_sample_raw.jpg'
    img2 = 'public/evidence_sample_sanitized_mosaic.jpg'
    img3 = 'public/evidence_sample_sanitized_bar.jpg'

    if os.path.exists(img1) and os.path.exists(img2) and os.path.exists(img3):
        row_imgs = [
            [
                Image(img1, width=47 * mm, height=49 * mm),
                Image(img2, width=47 * mm, height=49 * mm),
                Image(img3, width=47 * mm, height=49 * mm)
            ],
            [
                Paragraph("(a) Citra Asli (Raw)", caption_style),
                Paragraph("(b) Sensor Mode Mosaik", caption_style),
                Paragraph("(c) Sensor Mode Pita Mata", caption_style)
            ]
        ]
        t_imgs = Table(row_imgs, colWidths=[55 * mm, 55 * mm, 55 * mm])
        t_imgs.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t_imgs)
        story.append(Paragraph("Gambar 3.1 Perbandingan citra masukan kamera sebelum dan sesudah penerapan filter penyamar identitas.", caption_style))

    story.append(Paragraph("3.3 Integrasi ke Google Meet dan Zoom", h2_style))
    story.append(Paragraph(
        "Untuk menggunakan aliran kamera BIFROST di dalam aplikasi rapat virtual: "
        "Jalankan aplikasi BIFROST Witness Cam, buka menu Setelan (Settings) di Google Meet / Zoom, pilih tab Video, "
        "lalu pilih kamera bernama <strong>BIFROST Encrypted Camera</strong> atau <strong>OBS Virtual Camera</strong>. "
        "Tampilan pada peserta rapat otomatis tersensor secara aman.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 5: BAB IV (HDMI SHIELD)
    # =========================================================================
    story.append(Paragraph("BAB IV. PANDUAN BIFROST HDMI SHIELD", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "BIFROST HDMI Shield digunakan saat pengguna sedang membagikan tampilan layar pada rapat online atau saat terhubung ke proyektor HDMI. "
        "Sistem bertugas memfilter tampilan secara langsung tanpa mengganggu kenyamanan pengguna dalam bekerja.",
        body_style
    ))

    story.append(Paragraph("4.1 Fitur Proteksi Layar Otomatis", h2_style))
    story.append(Paragraph("1. <strong>Sensor Notifikasi dan Pesan Masuk:</strong> Mendeteksi kemunculan kotak notifikasi Windows atau pesan masuk WhatsApp pada sudut kanan bawah layar, lalu menutupinya dengan blok sensor.", bullet_style))
    story.append(Paragraph("2. <strong>Sensor Baris Bookmark:</strong> Menyamarkan baris tautan bookmark peramban (Chrome, Edge, Brave) saat peramban aktif di latar depan, mencegah tautan pekerjaan pribadi terlihat oleh audiens.", bullet_style))
    story.append(Paragraph("3. <strong>Sensor Kredensial AI OCR:</strong> Mesin OCR memindai teks pada layar secara berkala. Apabila ditemukan pola email, kata sandi, token otentikasi, nomor kartu kredit, atau nomor rekening bank, area tersebut langsung disamarkan.", bullet_style))
    story.append(Paragraph("4. <strong>Sensor Jendela WhatsApp:</strong> Menutup secara penuh area obrolan aplikasi WhatsApp saat jendela tersebut terbuka di layar presentasi.", bullet_style))
    story.append(Paragraph("5. <strong>Pencegah Layar Berulang (Anti-Loop):</strong> Mendeteksi situasi saat jendela Google Meet membagikan layarnya sendiri. Sistem langsung menampilkan tirai privasi abu-abu agar audiens tidak melihat efek cermin tanpa ujung.", bullet_style))
    story.append(Paragraph("6. <strong>Panic Blackout (Tombol Darurat Spasi):</strong> Tombol cepat untuk memadamkan seluruh layar tampilan proyektor menjadi hitam pekat saat terjadi situasi darurat privasi.", bullet_style))

    story.append(Spacer(1, 2 * mm))

    img_vid = 'public/evidence_cinematic_sanitized_mosaic.jpg'
    img_dark = 'public/evidence_dark_sanitized_clean.jpg'
    if os.path.exists(img_vid) and os.path.exists(img_dark):
        row_vid = [
            [
                Image(img_vid, width=73 * mm, height=53 * mm),
                Image(img_dark, width=73 * mm, height=53 * mm)
            ],
            [
                Paragraph("(a) Uji Penyamaran Video Aliran Dinamis", caption_style),
                Paragraph("(b) Uji Pemrosesan Kondisi Pencahayaan Rendah", caption_style)
            ]
        ]
        t_vid = Table(row_vid, colWidths=[82 * mm, 82 * mm])
        t_vid.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t_vid)
        story.append(Paragraph("Gambar 4.1 Uji ketahanan algoritma penyamaran privasi pada berbagai kondisi skenario presentasi.", caption_style))

    story.append(Paragraph("4.2 Cara Membuka Layar Bersih Proyektor", h2_style))
    story.append(Paragraph(
        "Sambungkan kabel HDMI laptop ke monitor eksternal atau proyektor fisik. Buka aplikasi BIFROST HDMI Shield, "
        "lalu klik tombol <strong>Buka Proyektor TV</strong> pada sudut kanan atas. Jendela keluaran bersih akan otomatis tampil "
        "dalam mode layar penuh (fullscreen) di monitor kedua. Pada Google Meet, pilih jendela proyektor tersebut saat membagikan layar.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 6: BAB V (POTONGAN KODE SUMBER)
    # =========================================================================
    story.append(Paragraph("BAB V. LAMPIRAN POTONGAN KODE SUMBER INTI", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "Sesuai ketentuan permohonan Hak Cipta Program Komputer pada Direktorat Jenderal Kekayaan Intelektual (DJKI) Kemenkumham RI, "
        "berikut dilampirkan potongan kode sumber inti yang merepresentasikan logika orisinal perangkat lunak BIFROST:",
        body_style
    ))

    story.append(Paragraph("5.1 Logika Deteksi Wajah dan Penerapan Sensor Mosaik (Python / OpenCV)", h2_style))

    raw_code_1 = """# Cuplikan Modul witness_engine.py: Deteksi Wajah YuNet & Mosaik Adaptif
def apply_mask(self, frame, x, y, w, h):
    x = max(0, int(x))
    y = max(0, int(y))
    w = min(int(w), frame.shape[1] - x)
    h = min(int(h), frame.shape[0] - y)
    if w <= 0 or h <= 0:
        return frame

    if self.mask_mode == 'mosaic':
        roi = frame[y:y+h, x:x+w]
        grid = max(6, int(w * (1.0 - (self.pixel_pct / 100.0) * 0.8) // 4))
        small = cv2.resize(roi, (max(1, w // grid), max(1, h // grid)), 
                           interpolation=cv2.INTER_LINEAR)
        pixelated = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
        frame[y:y+h, x:x+w] = pixelated
    elif self.mask_mode == 'eyebar':
        eye_y = y + int(h * 0.20)
        eye_h = int(h * 0.28)
        frame[eye_y:eye_y+eye_h, x:x+w] = (15, 23, 42)
    return frame"""

    t_code1 = Table([[Paragraph(format_code_block(raw_code_1), code_style)]], colWidths=[165 * mm])
    t_code1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_code1)

    story.append(Paragraph("5.2 Logika Injeksi Memori Kamera Virtual DirectShow Windows", h2_style))

    raw_code_2 = """# Cuplikan Modul witness_engine.py: DirectShow Shared Memory Mapping
class DirectShowSharedQueue:
    def write_frame(self, frame_bgr):
        header = self.get_queue_header()
        idx = header.write_idx % 3
        offset = header.offsets[idx]
        ctypes.memmove(self.base_ptr + offset, frame_bgr.ctypes.data, frame_bgr.nbytes)
        header.write_idx += 1
        header.state = SHARED_QUEUE_STATE_READY"""

    t_code2 = Table([[Paragraph(format_code_block(raw_code_2), code_style)]], colWidths=[165 * mm])
    t_code2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_code2)

    story.append(Paragraph("5.3 Logika Penyamaran Layar Otomatis dan Anti-Loop (HDMI Shield)", h2_style))

    raw_code_3 = """# Cuplikan Modul hdmi_engine.py: Anti-Infinity Loop & Win32 Detector
def check_anti_loop(self):
    _, title = get_foreground_process_info()
    if any(k in title for k in ['meet.google.com', 'google meet', 'zoom meeting']):
        return True, 'Google Meet Screen Mirror'
    return False, ''

def sanitize_frame(self, frame):
    if self.enable_anti_loop and self.check_anti_loop()[0]:
        self.draw_curtain(frame, 'Pencegahan Efek Layar Berulang')
    return frame"""

    t_code3 = Table([[Paragraph(format_code_block(raw_code_3), code_style)]], colWidths=[165 * mm])
    t_code3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_code3)

    story.append(Spacer(1, 4 * mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#666666"), spaceBefore=3, spaceAfter=4))
    story.append(Paragraph("Dokumen ini merupakan bagian sah dari kelengkapan berkas permohonan Hak Cipta Program Komputer pada Pangkalan Data Kekayaan Intelektual (DJKI) Kemenkumham RI.", caption_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Manual book PDF generated successfully at: {output_path}")

if __name__ == '__main__':
    out1 = 'dist/MANUAL_BOOK_BIFROST_HKI.pdf'
    out2 = 'public/downloads/MANUAL_BOOK_BIFROST_HKI.pdf'
    os.makedirs(os.path.dirname(out1), exist_ok=True)
    os.makedirs(os.path.dirname(out2), exist_ok=True)
    build_manual_book_pdf(out1)
    shutil.copyfile(out1, out2)
