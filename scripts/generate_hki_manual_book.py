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
        self.setFillColor(colors.HexColor("#333333"))

        # Running Header
        self.drawString(20 * mm, 283 * mm, "Buku Panduan Penggunaan Program Komputer: BIFROST")
        self.drawRightString(190 * mm, 283 * mm, "Hak Cipta © 2026 Universitas Telkom")
        self.setStrokeColor(colors.HexColor("#CCCCCC"))
        self.setLineWidth(0.5)
        self.line(20 * mm, 280 * mm, 190 * mm, 280 * mm)

        # Running Footer
        self.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
        self.drawString(20 * mm, 11 * mm, "Fakultas Informatika - Universitas Telkom")
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
        fontSize=18,
        leading=24,
        alignment=1,
        textColor=colors.HexColor('#111111')
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#222222')
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        alignment=1,
        textColor=colors.HexColor('#333333')
    )

    meta_left = ParagraphStyle(
        'MetaLeft',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        alignment=0,
        textColor=colors.HexColor('#222222')
    )

    meta_bold_left = ParagraphStyle(
        'MetaBoldLeft',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12.5,
        alignment=0,
        textColor=colors.HexColor('#111111')
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=16,
        textColor=colors.HexColor('#111111'),
        spaceBefore=0,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#111111'),
        spaceBefore=5,
        spaceAfter=2.5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        alignment=4,
        textColor=colors.HexColor('#1A1A1A'),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1A1A1A'),
        leftIndent=10,
        spaceAfter=2
    )

    toc_title_style = ParagraphStyle(
        'TOCTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#111111')
    )

    toc_sub_style = ParagraphStyle(
        'TOCSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#333333'),
        leftIndent=12
    )

    toc_page_style = ParagraphStyle(
        'TOCPage',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11.5,
        alignment=2,
        textColor=colors.HexColor('#111111')
    )

    caption_style = ParagraphStyle(
        'Caption_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10.5,
        alignment=1,
        textColor=colors.HexColor('#333333'),
        spaceBefore=2.5,
        spaceAfter=5
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.8,
        leading=9.2,
        textColor=colors.HexColor('#111111')
    )

    story = []

    # =========================================================================
    # HALAMAN 1: COVER & INFORMASI DOKUMEN
    # =========================================================================
    story.append(Spacer(1, 15 * mm))

    logo_path = 'public/bifrost_cam_logo.png'
    if os.path.exists(logo_path):
        story.append(Image(logo_path, width=38 * mm, height=38 * mm))
        story.append(Spacer(1, 8 * mm))

    story.append(Paragraph("BUKU PANDUAN PENGGUNAAN PROGRAM KOMPUTER", title_style))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Sistem Proteksi Privasi Multimedia Real-Time Terintegrasi:<br/>BIFROST Redact Studio, BIFROST Witness Cam, dan BIFROST HDMI Shield", subtitle_style))
    story.append(Spacer(1, 3 * mm))

    story.append(HRFlowable(width="60%", thickness=1.2, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("Kategori Ciptaan: <strong>Program Komputer</strong>", meta_style))
    story.append(Paragraph("Sub-Kategori: <strong>Aplikasi Desktop dan Layanan Pemrosesan Multimedia</strong>", meta_style))
    story.append(Spacer(1, 6 * mm))

    info_table_data = [
        [Paragraph("<strong>Elemen Informasi</strong>", meta_bold_left), Paragraph("<strong>Deskripsi Teknis</strong>", meta_bold_left)],
        [Paragraph("Nama Karya Cipta", meta_bold_left), Paragraph("BIFROST: Forensic Multimedia Evidence Sanitization Suite", meta_left)],
        [Paragraph("Tautan Portal Web", meta_bold_left), Paragraph("https://bifrostsismul.vercel.app/", meta_left)],
        [Paragraph("Komponen Web", meta_bold_left), Paragraph("Portal Utama, BIFROST Redact Studio, dan BIFROST Watermark Studio", meta_left)],
        [Paragraph("Komponen Desktop", meta_bold_left), Paragraph("BIFROST Witness Cam (Virtual Cam) dan BIFROST HDMI Shield (Screen Shield)", meta_left)],
        [Paragraph("Bahasa Pemrograman", meta_bold_left), Paragraph("Rust (Tauri 2.0), JavaScript / TypeScript (Next.js), Python 3.12 (Engine)", meta_left)],
        [Paragraph("Institusi Pengembang", meta_bold_left), Paragraph("Program Studi S1 Informatika, Fakultas Informatika, Universitas Telkom", meta_left)],
        [Paragraph("Tahun Penerbitan", meta_bold_left), Paragraph("2026", meta_left)]
    ]
    t_info = Table(info_table_data, colWidths=[50 * mm, 120 * mm])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F2F2F2')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#333333')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_info)

    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph("Bandung, Jawa Barat, Indonesia • 2026", meta_style))
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 2: DAFTAR ISI
    # =========================================================================
    story.append(Paragraph("DAFTAR ISI", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    toc_data = [
        [Paragraph("<strong>INFORMASI DOKUMEN DAN HAK CIPTA</strong>", toc_title_style), Paragraph("1", toc_page_style)],
        [Paragraph("<strong>DAFTAR ISI</strong>", toc_title_style), Paragraph("2", toc_page_style)],
        
        [Paragraph("<strong>BAB I. PENGENALAN SISTEM BIFROST</strong>", toc_title_style), Paragraph("3", toc_page_style)],
        [Paragraph("1.1 Kemampuan Utama Sistem", toc_sub_style), Paragraph("3", toc_page_style)],
        [Paragraph("1.2 Standar Acuan dan Prinsip Desain (UU PDP & ISO/IEC 27037)", toc_sub_style), Paragraph("3", toc_page_style)],
        [Paragraph("1.3 Tiga Pilar Komponen Perangkat Lunak BIFROST", toc_sub_style), Paragraph("3", toc_page_style)],
        
        [Paragraph("<strong>BAB II. AKSES PORTAL DAN NAVIGASI ANTARMUKA</strong>", toc_title_style), Paragraph("4", toc_page_style)],
        [Paragraph("2.1 Akses Layanan Web Resmi", toc_sub_style), Paragraph("4", toc_page_style)],
        [Paragraph("2.2 Struktur Bagian Halaman Utama", toc_sub_style), Paragraph("4", toc_page_style)],
        [Paragraph("2.3 Navigasi ke Ruang Kerja Redact Studio & Watermark Studio", toc_sub_style), Paragraph("5", toc_page_style)],
        
        [Paragraph("<strong>BAB III. PANDUAN PENGOPERASIAN BIFROST REDACT STUDIO</strong>", toc_title_style), Paragraph("5", toc_page_style)],
        [Paragraph("3.1 Pemuatan Berkas Media (Browse, Drag & Drop, Clipboard)", toc_sub_style), Paragraph("5", toc_page_style)],
        [Paragraph("3.2 Penerapan Sensor Kredensial Sensitif (Solid, Mosaik, Pita Mata)", toc_sub_style), Paragraph("6", toc_page_style)],
        [Paragraph("3.3 Pembersihan Metadata EXIF dan Telemetri Perangkat", toc_sub_style), Paragraph("7", toc_page_style)],
        [Paragraph("3.4 Ekspor Media Tersanitasi dan Sertifikat Audit Forensik", toc_sub_style), Paragraph("7", toc_page_style)],
        
        [Paragraph("<strong>BAB IV. SPESIFIKASI ALUR KERJA DAN SERTIFIKAT AUDIT FORENSIK</strong>", toc_title_style), Paragraph("8", toc_page_style)],
        [Paragraph("4.1 Alur Kerja Forensik Tiga Tahap (Ingestion, Scrubbing, Verification)", toc_sub_style), Paragraph("8", toc_page_style)],
        [Paragraph("4.2 Struktur Data Berkas Audit JSON dan Ledger SHA-256", toc_sub_style), Paragraph("8", toc_page_style)],
        [Paragraph("4.3 Penandatanganan Kriptografi Pasca-Kuantum (PQC ML-DSA-65)", toc_sub_style), Paragraph("9", toc_page_style)],
        
        [Paragraph("<strong>BAB V. PANDUAN PENGOPERASIAN BIFROST WITNESS CAM</strong>", toc_title_style), Paragraph("10", toc_page_style)],
        [Paragraph("5.1 Spesifikasi dan Kemampuan Modul Desktop", toc_sub_style), Paragraph("10", toc_page_style)],
        [Paragraph("5.2 Prosedur Instalasi Aplikasi Windows (Setup NSIS)", toc_sub_style), Paragraph("10", toc_page_style)],
        [Paragraph("5.3 Pengoperasian dan Pemilihan Parameter Sensor Biometrik", toc_sub_style), Paragraph("11", toc_page_style)],
        [Paragraph("5.4 Integrasi Kamera Virtual pada Google Meet, Zoom, dan OBS Studio", toc_sub_style), Paragraph("12", toc_page_style)],
        
        [Paragraph("<strong>BAB VI. PANDUAN PENGOPERASIAN BIFROST HDMI SHIELD</strong>", toc_title_style), Paragraph("13", toc_page_style)],
        [Paragraph("6.1 Spesifikasi dan Kemampuan Proteksi Layar Presentasi", toc_sub_style), Paragraph("13", toc_page_style)],
        [Paragraph("6.2 Prosedur Instalasi Aplikasi Windows (Setup NSIS)", toc_sub_style), Paragraph("13", toc_page_style)],
        [Paragraph("6.3 Pengoperasian Mode Proyektor Bersih dan Fitur Anti-Loop", toc_sub_style), Paragraph("14", toc_page_style)],
        [Paragraph("6.4 Pengujian Tirai Privasi Otomatis dan Tombol Panic Blackout", toc_sub_style), Paragraph("15", toc_page_style)],
        
        [Paragraph("<strong>BAB VII. PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)</strong>", toc_title_style), Paragraph("16", toc_page_style)],
        [Paragraph("7.1 Penanganan Masalah Layanan Web dan Redact Studio", toc_sub_style), Paragraph("16", toc_page_style)],
        [Paragraph("7.2 Penanganan Masalah Aplikasi Desktop Witness Cam & HDMI Shield", toc_sub_style), Paragraph("16", toc_page_style)],
        
        [Paragraph("<strong>BAB VIII. LAMPIRAN KODE SUMBER DAN TIM PENGEMBANG</strong>", toc_title_style), Paragraph("17", toc_page_style)],
        [Paragraph("8.1 Cuplikan Kode Sumber Orisinal Program Komputer", toc_sub_style), Paragraph("17", toc_page_style)],
        [Paragraph("8.2 Identitas Tim Pengembang Mahasiswa Universitas Telkom", toc_sub_style), Paragraph("20", toc_page_style)],
    ]

    t_toc = Table(toc_data, colWidths=[150 * mm, 20 * mm])
    t_toc.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.2),
        ('TOPPADDING', (0, 0), (-1, -1), 1.2),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, colors.HexColor('#EEEEEE')),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 3: BAB I (PENGENALAN BIFROST)
    # =========================================================================
    story.append(Paragraph("BAB I. PENGENALAN SISTEM BIFROST", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "BIFROST adalah perangkat lunak perlindungan privasi multimedia berbasis komputasi cerdas yang dikembangkan untuk "
        "mencegah kebocoran data pribadi (Personally Identifiable Information / PII) dan informasi sensitif secara tidak sengaja. "
        "Perangkat lunak ini dirancang untuk memenuhi kebutuhan dosen, peneliti, penyaji materi, dan narasumber yang sering membagikan "
        "tampilan layar ke proyektor fisik maupun tampil dalam sesi konferensi video virtual.",
        body_style
    ))

    story.append(Paragraph("1.1 Kemampuan Utama Sistem", h2_style))
    story.append(Paragraph(
        "Sistem BIFROST menghadirkan solusi pengamanan multimedia terintegrasi yang mencakup:",
        body_style
    ))
    story.append(Paragraph("• <strong>Pencegahan Kebocoran Biometrik:</strong> Penyamaran identitas wajah secara dinamis dan modulasi nada suara langsung pada masukan kamera tanpa latensi komputasi awan.", bullet_style))
    story.append(Paragraph("• <strong>Proteksi Layar Presentasi HDMI:</strong> Penyamaran notifikasi pesan masuk, sensor baris penanda peramban, serta pemburaman teks kredensial penting seperti kata sandi, token, dan nomor rekening.", bullet_style))
    story.append(Paragraph("• <strong>Pencegahan Layar Berulang (Anti-Loop):</strong> Deteksi otomatis saat jendela rapat virtual membagikan tampilannya sendiri, menampilkan tirai privasi abu-abu agar audiens tidak melihat efek cermin tanpa ujung.", bullet_style))
    story.append(Paragraph("• <strong>Sanitasi Media Forensik dan Rantai Kustodi:</strong> Pembersihan total metadata pelacak (EXIF/GPS) dan penerbitan sertifikat audit integritas berkas berbasis hash SHA-256.", bullet_style))

    story.append(Paragraph("1.2 Standar Acuan dan Prinsip Desain", h2_style))
    story.append(Paragraph(
        "Arsitektur BIFROST dirancang dengan mengacu pada prinsip pelindungan privasi data sesuai <strong>Undang-Undang Nomor 27 Tahun 2022 "
        "tentang Pelindungan Data Pribadi (UU PDP)</strong> serta prinsip tata kelola bukti digital berdasarkan <strong>ISO/IEC 27037:2012</strong> "
        "(Guidelines for identification, collection, acquisition, and preservation of digital evidence). Seluruh proses sanitasi media "
        "mempertahankan integritas audit trail sehingga perubahan pada data terekam secara jelas tanpa menghilangkan konteks bukti yang sah.",
        body_style
    ))

    story.append(Paragraph("1.3 Tiga Pilar Komponen Perangkat Lunak BIFROST", h2_style))
    story.append(Paragraph("1. <strong>Portal Web & BIFROST Redact Studio:</strong> Layanan berbasis peramban untuk pengunggahan media, redaksi selektif, pembersihan EXIF, dan penandatanganan pasca-kuantum (PQC).", bullet_style))
    story.append(Paragraph("2. <strong>BIFROST Witness Cam:</strong> Aplikasi desktop mandiri untuk penyamaran wajah dan modulasi audio real-time yang dialirkan ke kamera virtual DirectShow.", bullet_style))
    story.append(Paragraph("3. <strong>BIFROST HDMI Shield:</strong> Aplikasi desktop mandiri untuk memfilter tampilan layar proyektor eksternal secara bersih dari notifikasi dan kredensial.", bullet_style))

    img_hero = 'scripts/extracted_images/hero_live_clean.png'
    if os.path.exists(img_hero):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_hero, width=155 * mm, height=65 * mm))
        story.append(Paragraph("Gambar 1.1 Tampilan halaman utama portal resmi BIFROST.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 4: BAB II (AKSES PORTAL DAN NAVIGASI ANTARMUKA)
    # =========================================================================
    story.append(Paragraph("BAB II. AKSES PORTAL DAN NAVIGASI ANTARMUKA", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph("2.1 Akses Layanan Web Resmi", h2_style))
    story.append(Paragraph(
        "Portal web BIFROST dapat diakses melalui peramban standar (seperti Google Chrome, Microsoft Edge, atau Mozilla Firefox) "
        "tanpa memerlukan instalasi plugin tambahan. Langkah-langkah untuk mengakses sistem adalah sebagai berikut:",
        body_style
    ))
    story.append(Paragraph("1. Sambungkan komputer ke jaringan internet aktif.", bullet_style))
    story.append(Paragraph("2. Buka aplikasi peramban web dan ketik alamat: <code>https://bifrostsismul.vercel.app/</code>.", bullet_style))
    story.append(Paragraph("3. Halaman beranda BIFROST akan dimuat menampilkan navigasi sistem, pratinjau bukti forensik, dan tautan aplikasi.", bullet_style))

    story.append(Paragraph("2.2 Struktur Bagian Halaman Utama", h2_style))
    story.append(Paragraph(
        "Halaman beranda portal web BIFROST terbagi menjadi beberapa bagian fungsional utama:",
        body_style
    ))

    portal_table_data = [
        [Paragraph("<strong>Bagian Antarmuka</strong>", meta_bold_left), Paragraph("<strong>Fungsi dan Deskripsi Penggunaan</strong>", meta_bold_left)],
        [Paragraph("Hero Header & Navigation", meta_bold_left), Paragraph("Menampilkan identitas sistem, tautan langsung ke Redact Studio, Watermark Studio, dan Programs.", meta_left)],
        [Paragraph("Evidence Preview", meta_bold_left), Paragraph("Pratinjau interaktif perbandingan citra sebelum sanitasi (Raw) dan sesudah sanitasi (Sanitized).", meta_left)],
        [Paragraph("Core Forensic Modules", meta_bold_left), Paragraph("Ringkasan empat kemampuan inti: Selective Credential Redactor, EXIF Purge, SHA-256 Custody Ledger, dan PQC Watermark.", meta_left)],
        [Paragraph("Witness Cam Standalone", meta_bold_left), Paragraph("Penjelasan arsitektur aplikasi desktop Witness Cam beserta tautan pengunduhan paket installer.", meta_left)],
        [Paragraph("HDMI Shield Standalone", meta_bold_left), Paragraph("Penjelasan modul proteksi presentasi layar proyektor dan tombol instalasi installer.", meta_left)],
        [Paragraph("How It Works", meta_bold_left), Paragraph("Diagram alur kerja forensik tiga tahap dari ingestion media hingga verifikasi sertifikat.", meta_left)],
    ]
    t_portal = Table(portal_table_data, colWidths=[45 * mm, 125 * mm])
    t_portal.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F2F2F2')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#333333')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_portal)

    img_core = 'scripts/extracted_images/p6_4__X24.png'
    if os.path.exists(img_core):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_core, width=155 * mm, height=62 * mm))
        story.append(Paragraph("Gambar 2.1 Bagian Core Forensic Modules pada portal web BIFROST.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 5: BAB II (Lanjutan 2.3) & BAB III (REDACT STUDIO)
    # =========================================================================
    story.append(Paragraph("2.3 Navigasi ke Ruang Kerja Redact Studio & Watermark Studio", h2_style))
    story.append(Paragraph(
        "Untuk mulai memproses berkas bukti multimedia, pengguna dapat mengeklik tombol <strong>Launch Redact Studio</strong> pada menu atas "
        "atau tombol <strong>Explore Redact Studio</strong> pada badan halaman. Sistem akan memuat antarmuka kerja interaktif tempat pengguna dapat "
        "memilih berkas, menerapkan penyamaran kredensial, menghapus metadata pelacak, dan mengekspor bukti bersertifikat.",
        body_style
    ))
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("BAB III. PANDUAN PENGOPERASIAN BIFROST REDACT STUDIO", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "BIFROST Redact Studio adalah modul pengolahan media berbasis peramban yang bekerja secara cepat dan terisolasi. "
        "Modul ini dirancang agar petugas investigasi atau pengguna umum dapat mensterilkan berkas dokumen digital sebelum "
        "disebarkan ke pihak luar.",
        body_style
    ))

    story.append(Paragraph("3.1 Pemuatan Berkas Media (Ingestion)", h2_style))
    story.append(Paragraph(
        "Sistem menyediakan tiga metode fleksibel untuk memasukkan berkas citra atau tangkapan layar ke dalam ruang kerja:",
        body_style
    ))
    story.append(Paragraph("1. <strong>Tombol Pilih Berkas (Browse):</strong> Klik tombol 'Pilih Berkas' untuk memilih file gambar (PNG, JPG, JPEG, WEBP) dari media penyimpanan lokal komputer.", bullet_style))
    story.append(Paragraph("2. <strong>Seret dan Lepas (Drag & Drop):</strong> Tarik file gambar dari jendela File Explorer langsung ke dalam kotak area bertuliskan 'Upload Media'.", bullet_style))
    story.append(Paragraph("3. <strong>Tempel Papan Klip (Paste Ctrl+V):</strong> Apabila pengguna baru saja menyalin tangkapan layar (screenshot) ke clipboard, cukup tekan tombol kombinasi Ctrl+V pada papan ketik saat halaman aktif.", bullet_style))

    img_redact = 'scripts/extracted_images/screen_redact_studio.png'
    if os.path.exists(img_redact):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_redact, width=155 * mm, height=75 * mm))
        story.append(Paragraph("Gambar 3.1 Antarmuka ruang kerja BIFROST Redact Studio.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 6: BAB III (Lanjutan 3.2 - REDAKSI KREDENSIAL)
    # =========================================================================
    story.append(Paragraph("3.2 Penerapan Sensor Kredensial Sensitif (Selective Redactor)", h2_style))
    story.append(Paragraph(
        "Setelah media berhasil dimuat, sistem menampilkan antarmuka penyuntingan visual. Selective Credential Redactor memungkinkan "
        "pengguna untuk menyamarkan area-area sensitif secara presisi tanpa merusak bagian dokumen yang sah (seperti kop surat resmi atau tanda verifikasi legal).",
        body_style
    ))
    story.append(Paragraph(
        "Objek-objek data yang didukung untuk disamarkan mencakup:",
        body_style
    ))
    story.append(Paragraph("• <strong>Nomor Kependudukan:</strong> NIK KTP, nomor paspor, dan nomor identitas pegawai.", bullet_style))
    story.append(Paragraph("• <strong>Kredensial Finansial:</strong> Nomor rekening bank, nomor kartu debit/kredit, dan saldo tabungan.", bullet_style))
    story.append(Paragraph("• <strong>Kode Matriks & Barcode:</strong> Kode QR pembayaran, barcode dokumen rahasia, dan stempel stiker serial.", bullet_style))
    story.append(Paragraph("• <strong>Biometrik Wajah:</strong> Area wajah subjek saksi atau pihak yang memerlukan pelindungan identitas.", bullet_style))

    story.append(Paragraph(
        "Tersedia tiga pilihan gaya penyamaran yang dapat dipilih sesuai kebutuhan kepatuhan hukum:",
        body_style
    ))
    story.append(Paragraph("1. <strong>Mode Solid (Blok Hitam Pekat):</strong> Menutupi seluruh area target dengan piksel hitam bernilai RGB (0,0,0) sehingga informasi di baliknya tidak dapat direkonstruksi sama sekali.", bullet_style))
    story.append(Paragraph("2. <strong>Mode Mosaik (Pixelasi Terukur):</strong> Mengaburkan area target dengan reduksi resolusi blok proporsional, menyamarkan identitas namun tetap mempertahankan estetika tampilan visual.", bullet_style))
    story.append(Paragraph("3. <strong>Mode Pita Mata (Eye Bar Sensor):</strong> Khusus untuk foto saksi, menempatkan bilah hitam horizontal secara presisi menutupi mata subjek untuk mencegah pengenalan biometrik okular.", bullet_style))

    img_raw = 'public/evidence_sample_raw.jpg'
    img_mosaic = 'public/evidence_sample_sanitized_mosaic.jpg'
    img_bar = 'public/evidence_sample_sanitized_bar.jpg'

    if os.path.exists(img_raw) and os.path.exists(img_mosaic) and os.path.exists(img_bar):
        story.append(Spacer(1, 2 * mm))
        row_redact = [
            [
                Image(img_raw, width=48 * mm, height=52 * mm),
                Image(img_mosaic, width=48 * mm, height=52 * mm),
                Image(img_bar, width=48 * mm, height=52 * mm)
            ],
            [
                Paragraph("(a) Berkas Masukan Asli (Raw)", caption_style),
                Paragraph("(b) Sensor Mode Mosaik Adaptif", caption_style),
                Paragraph("(c) Sensor Mode Pita Mata (Eye Bar)", caption_style)
            ]
        ]
        t_redact = Table(row_redact, colWidths=[56 * mm, 56 * mm, 56 * mm])
        t_redact.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(t_redact)
        story.append(Paragraph("Gambar 3.2 Bukti visual penerapan filter sensor privasi pada berkas citra bukti forensik.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 7: BAB III (Lanjutan 3.3 EXIF Scrub & 3.4 Ekspor & Audit)
    # =========================================================================
    story.append(Paragraph("3.3 Pembersihan Metadata EXIF dan Telemetri Perangkat", h2_style))
    story.append(Paragraph(
        "Kamera ponsel pintar dan kamera digital secara otomatis merekam metadata sensitif pada header berkas JPEG/TIFF, "
        "seperti koordinat geografis lintang dan bujur (GPS), nomor seri bodi kamera, model lensa, serta tanggal dan waktu pengambilan. "
        "Apabila berkas ini disebarluaskan, pihak luar dapat melacak keberadaan lokasi fisik pembuat foto secara akurat.",
        body_style
    ))
    story.append(Paragraph(
        "BIFROST Redact Studio menerapkan mekanisme pembersihan mutlak (EXIF & Hardware Telemetry Purge). "
        "Mekanisme ini tidak sekadar menghapus tag tertentu, melainkan melakukan decoding seluruh larik piksel citra ke dalam memori kerja, "
        "kemudian melakukan penulisan ulang (re-encoding) ke format kontainer murni tanpa menyertakan metadata asal. Dengan demikian, "
        "seluruh koordinat lokasi, nomor seri, dan atribut telemetri terhapus secara permanen.",
        body_style
    ))

    story.append(Paragraph("3.4 Ekspor Media Tersanitasi dan Sertifikat Audit Forensik", h2_style))
    story.append(Paragraph(
        "Setelah proses sanitasi dan pembersihan selesai dijalankan, pengguna dapat mengekspor hasil kerja melalui dua tombol kontrol utama:",
        body_style
    ))
    story.append(Paragraph("1. <strong>Unduh Media Tersanitasi:</strong> Menyimpan berkas gambar yang telah bersih dari kredensial sensitif dan bebas dari metadata pelacak ke komputer lokal pengguna.", bullet_style))
    story.append(Paragraph("2. <strong>Ekspor JSON Audit Certificate:</strong> Menghasilkan berkas sertifikat audit forensik resmi dalam format JSON. Berkas ini merekam bukti matematis bahwa proses sanitasi dilakukan secara sah dan rantai kustodi tetap terjaga.", bullet_style))

    audit_sample_data = [
        [Paragraph("<strong>Komponen Audit Ledger</strong>", meta_bold_left), Paragraph("<strong>Nilai Bukti Forensik yang Terekam</strong>", meta_bold_left)],
        [Paragraph("Nomor Kasus (Case ID)", meta_bold_left), Paragraph("PQC-EVD-847291 (Identifikasi unik sesi pengolahan)", meta_left)],
        [Paragraph("SHA-256 Media Mentah", meta_bold_left), Paragraph("<code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>", meta_left)],
        [Paragraph("SHA-256 Media Tersanitasi", meta_bold_left), Paragraph("<code>7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</code>", meta_left)],
        [Paragraph("Wilayah Redaksi Terpilih", meta_bold_left), Paragraph("Bounding Box [x: 142, y: 310, w: 280, h: 65], Mode: Mosaic 14-grid", meta_left)],
        [Paragraph("Status Pembersihan EXIF", meta_bold_left), Paragraph("GPS Coordinates: SCRUBBED, Camera Serial: PURGED, Timestamp: NORMALIZED", meta_left)],
        [Paragraph("Stempel Waktu & Petugas", meta_bold_left), Paragraph("2026-11-19T02:15:00Z | Operator: Puslabfor Digital Forensics", meta_left)],
    ]
    t_audit = Table(audit_sample_data, colWidths=[48 * mm, 122 * mm])
    t_audit.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F2F2F2')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#333333')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_audit)
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Tabel 3.1 Struktur bukti integritas rantai kustodi SHA-256 yang tersimpan dalam sertifikat audit BIFROST.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 8: BAB IV (ALUR KERJA FORENSIK DAN AUDIT LEDGER)
    # =========================================================================
    story.append(Paragraph("BAB IV. SPESIFIKASI ALUR KERJA DAN SERTIFIKAT AUDIT FORENSIK", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "Untuk memastikan keabsahan bukti multimedia di hadapan regulasi hukum dan audit kepatuhan, sistem BIFROST menerapkan "
        "metodologi sanitasi terstruktur yang terbagi dalam tiga tahap berkesinambungan:",
        body_style
    ))

    story.append(Paragraph("4.1 Alur Kerja Forensik Tiga Tahap", h2_style))
    story.append(Paragraph(
        "1. <strong>Tahap 1 – Ingestion & Tamper Baseline:</strong> "
        "Saat berkas multimedia pertama kali dimuat ke dalam memori sistem, algoritma kriptografi SHA-256 langsung menghitung nilai hash intisari "
        "(digest) berkas mentah tersebut. Nilai hash ini dikunci sebagai titik acuan awal (tamper baseline) yang membuktikan kondisi asli bukti "
        "sebelum dilakukan pemrosesan apapun.",
        body_style
    ))
    story.append(Paragraph(
        "2. <strong>Tahap 2 – Selective Redaction & EXIF Scrub:</strong> "
        "Pengguna menerapkan parameter penyamaran pada wilayah-wilayah yang memuat data rahasia. Mesin komputasi mengubah larik piksel pada wilayah tersebut, "
        "serta merekonstruksi kontainer gambar tanpa menyertakan metadata telemetri perangkat keras dan koordinat lokasi.",
        body_style
    ))
    story.append(Paragraph(
        "3. <strong>Tahap 3 – Custody Verification & Export:</strong> "
        "Sistem secara otomatis menghitung ulang nilai hash SHA-256 dari berkas yang telah disanitasi. Kedua nilai hash (sebelum dan sesudah) "
        "kemudian disatukan ke dalam sertifikat tanda terima audit JSON bersama dengan data stempel waktu dan rincian parameter filter yang diterapkan.",
        body_style
    ))

    story.append(Paragraph("4.2 Struktur Data Berkas Audit JSON", h2_style))
    story.append(Paragraph(
        "Format sertifikat audit BIFROST dirancang transparan dan dapat divalidasi oleh perangkat lunak pihak ketiga tanpa ketergantungan pada BIFROST:",
        body_style
    ))

    json_snippet = """{
  "audit_version": "1.0",
  "case_id": "PQC-EVD-847291",
  "timestamp_utc": "2026-11-19T02:15:00Z",
  "custody_ledger": {
    "original_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "sanitized_sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "hash_algorithm": "SHA-256"
  },
  "sanitization_actions": {
    "exif_scrubbed": true,
    "gps_purged": true,
    "redaction_regions_count": 1,
    "applied_modes": ["mosaic_14grid"]
  }
}"""
    t_json = Table([[Paragraph(format_code_block(json_snippet), code_style)]], colWidths=[170 * mm])
    t_json.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_json)
    story.append(Paragraph("Potongan 4.1 Contoh struktur berkas JSON Audit Certificate yang diterbitkan sistem BIFROST.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 9: BAB IV (Lanjutan 4.3 PQC ML-DSA-65)
    # =========================================================================
    story.append(Paragraph("4.3 Penandatanganan Kriptografi Pasca-Kuantum (PQC ML-DSA-65)", h2_style))
    story.append(Paragraph(
        "Untuk mengantisipasi ancaman dekripsi komputasi kuantum di masa depan (Harvest Now, Decrypt Later), "
        "BIFROST Watermark Studio mengintegrasikan skema tanda tangan digital pasca-kuantum berbasis kisi (lattice cryptography) "
        "yang telah distandarisasi oleh NIST sebagai <strong>FIPS 204 (ML-DSA-65)</strong>.",
        body_style
    ))
    story.append(Paragraph(
        "Fitur ini menjamin prinsip <em>Zero-Impersonation</em>, di mana setiap penandatanganan berkas bukti wajib menggunakan "
        "berkas kunci rahasia pribadi (<code>.bifrost-key</code>) yang dipegang sendiri oleh petugas resmi. Kunci ini mengikat secara permanen "
        "nama lengkap, institusi penegak hukum / institusi akademis, serta stempel waktu penerbitan.",
        body_style
    ))
    story.append(Paragraph(
        "Pada sisi verifikasi (<code>/watermark?tab=verify</code>), auditor pengadilan atau pemeriksa independen cukup memuat citra bukti. "
        "Sistem akan mengekstrak tanda air tersembunyi (forensic watermark), memverifikasi tanda tangan kisi ML-DSA, dan memastikan "
        "bahwa berkas tersebut 100% otentik dan belum mengalami manipulasi (tampering).",
        body_style
    ))

    img_pqc_auth = 'public/sample_pqc_authentic.png'
    img_pqc_tamp = 'public/sample_pqc_tampered.png'
    if os.path.exists(img_pqc_auth) and os.path.exists(img_pqc_tamp):
        story.append(Spacer(1, 2 * mm))
        row_pqc = [
            [
                Image(img_pqc_auth, width=78 * mm, height=56 * mm),
                Image(img_pqc_tamp, width=78 * mm, height=56 * mm)
            ],
            [
                Paragraph("(a) Hasil Uji: Berkas Otentik Terverifikasi (Kunci Sah)", caption_style),
                Paragraph("(b) Hasil Uji: Berkas Rusak / Terpalsukan (Tampered)", caption_style)
            ]
        ]
        t_pqc = Table(row_pqc, colWidths=[85 * mm, 85 * mm])
        t_pqc.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(t_pqc)
        story.append(Paragraph("Gambar 4.1 Pengujian integritas penandatanganan media pasca-kuantum (PQC) pada BIFROST Watermark Studio.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 10: BAB V (BIFROST WITNESS CAM)
    # =========================================================================
    story.append(Paragraph("BAB V. PANDUAN PENGOPERASIAN BIFROST WITNESS CAM", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "BIFROST Witness Cam adalah aplikasi desktop mandiri Windows yang bertindak sebagai lapisan pelindung biometrik langsung "
        "antara kamera web fisik dan aplikasi konferensi virtual (seperti Google Meet, Zoom, dan OBS Studio). "
        "Aplikasi ini memastikan wajah saksi atau pemateri tersensor secara real-time dan suaranya dimodulasi tanpa memerlukan sambungan internet.",
        body_style
    ))

    story.append(Paragraph("5.1 Spesifikasi dan Kemampuan Modul Desktop", h2_style))
    story.append(Paragraph("• <strong>Model Deteksi Wajah YuNet ONNX:</strong> Algoritma pembelajaran mendalam lokal yang mendeteksi wajah dalam hitungan milidetik secara presisi bahkan pada sudut wajah miring.", bullet_style))
    story.append(Paragraph("• <strong>Tiga Filter Sensor Visual:</strong> Mode Mosaik (pixelasi blok adaptif), Mode Siluet (masker gelap merata), dan Mode Pita Mata (Eye Bar sensor).", bullet_style))
    story.append(Paragraph("• <strong>Modulasi Audio Digital DSP:</strong> Modulasi suara vokal saksi secara langsung (Deep Voice pitch-shift atau Robotic tone) untuk melindungi karakteristik unik suara.", bullet_style))
    story.append(Paragraph("• <strong>DirectShow Virtual Device:</strong> Menyalurkan keluaran video yang telah disanitasi sebagai perangkat kamera virtual Windows sehingga dikenali oleh seluruh aplikasi pihak ketiga.", bullet_style))

    story.append(Paragraph("5.2 Prosedur Instalasi Aplikasi Windows", h2_style))
    story.append(Paragraph("1. Buka halaman portal <code>https://bifrostsismul.vercel.app/programs</code> pada peramban.", bullet_style))
    story.append(Paragraph("2. Pada bagian <strong>BIFROST Witness Cam</strong>, klik tombol unduh <code>Setup.exe</code>.", bullet_style))
    story.append(Paragraph("3. Jalankan berkas <code>BIFROST_Witness_Cam_Setup_v1.0.0.exe</code> yang telah diunduh.", bullet_style))
    story.append(Paragraph("4. Pada jendela wizard penyiapan NSIS, klik tombol 'Install'. Seluruh pustaka AI dan driver kamera virtual akan dikonfigurasi otomatis.", bullet_style))
    story.append(Paragraph("5. Klik 'Finish'. Pintasan BIFROST Witness Cam akan tersedia pada Desktop dan Start Menu.", bullet_style))

    img_wit_dl = 'scripts/extracted_images/p12_7__X39.png'
    img_wit_ins = 'scripts/extracted_images/p12_8__X40.png'
    if os.path.exists(img_wit_dl) and os.path.exists(img_wit_ins):
        story.append(Spacer(1, 2 * mm))
        row_wit = [
            [
                Image(img_wit_dl, width=80 * mm, height=48 * mm),
                Image(img_wit_ins, width=80 * mm, height=48 * mm)
            ],
            [
                Paragraph("(a) Bagian Unduhan Aplikasi Witness Cam", caption_style),
                Paragraph("(b) Panduan Wizard Instalasi NSIS", caption_style)
            ]
        ]
        t_wit = Table(row_wit, colWidths=[85 * mm, 85 * mm])
        t_wit.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(t_wit)
        story.append(Paragraph("Gambar 5.1 Kartu pengunduhan resmi dan wizard instalasi BIFROST Witness Cam pada sistem operasi Windows.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 11: BAB V (Lanjutan 5.3 Pengoperasian Witness Cam)
    # =========================================================================
    story.append(Paragraph("5.3 Pengoperasian dan Pemilihan Parameter Sensor Biometrik", h2_style))
    story.append(Paragraph(
        "Setelah aplikasi BIFROST Witness Cam dibuka dari Desktop, jendela antarmuka kontrol terpadu akan ditampilkan. "
        "Pengguna dapat menyesuaikan pengaturan sebelum mengaktifkan kamera virtual:",
        body_style
    ))
    story.append(Paragraph("1. <strong>Pemilihan Sumber Kamera Fisik:</strong> Pilih perangkat webcam yang terpasang pada komputer melalui menu tarik-turun (dropdown).", bullet_style))
    story.append(Paragraph("2. <strong>Pemilihan Format Resolusi:</strong> Pilih antara resolusi <strong>720p HD</strong> (1280x720) untuk komputer dengan spesifikasi standar atau <strong>1080p Full HD</strong> (1920x1080) untuk kualitas tinggi.", bullet_style))
    story.append(Paragraph("3. <strong>Pilihan Mode Penyamaran Wajah:</strong> Pilih tombol filter yang diinginkan: Mosaik, Siluet, atau Pita Mata.", bullet_style))
    story.append(Paragraph("4. <strong>Pengaturan Modulasi Vokal (DSP Audio):</strong> Aktifkan sakelar modulasi suara untuk mengaburkan nada suara asli pembicara.", bullet_style))
    story.append(Paragraph("5. <strong>Tombol Daya Utama (Master Switch):</strong> Klik tombol bulat besar bertuliskan 'MULAI KAMERA' untuk mengaktifkan pemrosesan real-time.", bullet_style))

    img_wit_ui = 'public/fig_witness_cam_ui_live.png'
    if os.path.exists(img_wit_ui):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_wit_ui, width=155 * mm, height=88 * mm))
        story.append(Paragraph("Gambar 5.2 Antarmuka kontrol panel aplikasi desktop BIFROST Witness Cam saat siaran aktif dengan proteksi sensor wajah mosaik.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 12: BAB V (Lanjutan 5.4 Integrasi Google Meet / Zoom)
    # =========================================================================
    story.append(Paragraph("5.4 Integrasi Kamera Virtual pada Google Meet, Zoom, dan OBS Studio", h2_style))
    story.append(Paragraph(
        "Keluaran video yang telah disanitasi secara otomatis dialirkan ke dalam perangkat memori bersama (shared memory DirectShow). "
        "Aplikasi pihak ketiga dapat langsung membaca perangkat ini seolah-olah merupakan webcam fisik standar. "
        "Langkah-langkah penggunaannya adalah sebagai berikut:",
        body_style
    ))
    story.append(Paragraph("1. Pastikan aplikasi BIFROST Witness Cam sedang dalam kondisi aktif (tombol daya menyala hijau).", bullet_style))
    story.append(Paragraph("2. Buka sesi rapat pada <strong>Google Meet</strong> atau <strong>Zoom Meeting</strong>.", bullet_style))
    story.append(Paragraph("3. Masuk ke menu Setelan (Settings) -> Video -> Camera.", bullet_style))
    story.append(Paragraph("4. Pilih kamera bernama <strong>BIFROST Encrypted Camera</strong> atau <strong>Virtual Camera</strong>.", bullet_style))
    story.append(Paragraph("5. Tampilan video pengguna pada layar peserta rapat akan secara otomatis terproteksi oleh filter biometrik yang dipilih.", bullet_style))

    img_wit_dev = 'public/fig_witness_cam_google_meet.png'
    if os.path.exists(img_wit_dev):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_wit_dev, width=155 * mm, height=83 * mm))
        story.append(Paragraph("Gambar 5.3 Integrasi kamera virtual DirectShow BIFROST Encrypted Camera pada sesi panggilan rapat Google Meet.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 13: BAB VI (BIFROST HDMI SHIELD)
    # =========================================================================
    story.append(Paragraph("BAB VI. PANDUAN PENGOPERASIAN BIFROST HDMI SHIELD", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "BIFROST HDMI Shield adalah aplikasi desktop Windows yang dikembangkan khusus untuk melindungi layar presentasi pengguna saat "
        "laptop terhubung ke proyektor fisik melalui kabel HDMI maupun saat menggunakan fitur berbagi layar (Share Screen) pada rapat daring. "
        "Aplikasi ini bekerja secara cerdas dan otomatis di latar belakang tanpa menghambat alur kerja penyaji materi.",
        body_style
    ))

    story.append(Paragraph("6.1 Spesifikasi dan Kemampuan Proteksi Layar Presentasi", h2_style))
    story.append(Paragraph("• <strong>Sensor Notifikasi dan Pesan Masuk:</strong> Mendeteksi jendela notifikasi pop-up (seperti Windows toast atau pesan WhatsApp) dan menutupinya dengan blok privasi abu-abu.", bullet_style))
    story.append(Paragraph("• <strong>Sensor Baris Penanda Peramban (Bookmarks):</strong> Menyamarkan baris tab dan tautan bookmark saat peramban aktif, menjaga privasi situs pekerjaan.", bullet_style))
    story.append(Paragraph("• <strong>Pemindai Teks Kredensial AI OCR:</strong> Mesin RapidOCR memindai kata sandi, token otentikasi (JWT/GitHub), dan nomor rekening bank pada layar lalu memburamkannya secara otomatis.", bullet_style))
    story.append(Paragraph("• <strong>Fitur Anti-Infinity Loop:</strong> Menghilangkan efek cermin berulang yang membingungkan ketika jendela Google Meet/Zoom tidak sengaja membagikan layarnya sendiri.", bullet_style))
    story.append(Paragraph("• <strong>Tombol Darurat Panic Blackout:</strong> Menghitamkan seluruh layar proyektor dalam sekejap dengan menekan tombol Spasi saat terjadi insiden privasi.", bullet_style))

    story.append(Paragraph("6.2 Prosedur Instalasi Aplikasi Windows", h2_style))
    story.append(Paragraph("1. Buka menu unduhan pada portal web <code>https://bifrostsismul.vercel.app/programs</code>.", bullet_style))
    story.append(Paragraph("2. Unduh berkas instalasi resmi <code>BIFROST_HDMI_Shield_Setup_v1.0.0.exe</code>.", bullet_style))
    story.append(Paragraph("3. Jalankan berkas installer dan selesaikan wizard NSIS hingga tombol Finish muncul.", bullet_style))

    img_hdmi_dl = 'scripts/extracted_images/p14_10__X46.png'
    img_hdmi_ins = 'scripts/extracted_images/p15_11__X49.png'
    if os.path.exists(img_hdmi_dl) and os.path.exists(img_hdmi_ins):
        story.append(Spacer(1, 2 * mm))
        row_hdmi = [
            [
                Image(img_hdmi_dl, width=80 * mm, height=48 * mm),
                Image(img_hdmi_ins, width=80 * mm, height=48 * mm)
            ],
            [
                Paragraph("(a) Bagian Unduhan Aplikasi HDMI Shield", caption_style),
                Paragraph("(b) Panduan Wizard Instalasi NSIS", caption_style)
            ]
        ]
        t_hdmi = Table(row_hdmi, colWidths=[85 * mm, 85 * mm])
        t_hdmi.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(t_hdmi)
        story.append(Paragraph("Gambar 6.1 Kartu pengunduhan resmi dan wizard instalasi BIFROST HDMI Shield.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 14: BAB VI (Lanjutan 6.3 Pengoperasian HDMI Shield)
    # =========================================================================
    story.append(Paragraph("6.3 Pengoperasian Mode Proyektor Bersih dan Fitur Anti-Loop", h2_style))
    story.append(Paragraph(
        "Untuk menggunakan BIFROST HDMI Shield saat presentasi di ruang kelas atau ruang rapat:",
        body_style
    ))
    story.append(Paragraph("1. Hubungkan kabel HDMI laptop ke port monitor proyektor eksternal.", bullet_style))
    story.append(Paragraph("2. Buka aplikasi <strong>BIFROST HDMI Shield</strong> dari Desktop.", bullet_style))
    story.append(Paragraph("3. Klik tombol <strong>Buka Proyektor TV</strong> pada sudut kanan atas antarmuka. Jendela keluaran bersih akan otomatis terbuka dalam mode layar penuh (fullscreen) pada monitor proyektor.", bullet_style))
    story.append(Paragraph("4. Pada antarmuka utama, pastikan sakelar proteksi yang diperlukan telah diaktifkan:", bullet_style))
    story.append(Paragraph("   • Sakelar <em>Anti-Loop Presentation:</em> Aktif untuk mencegah efek cermin berulang.", bullet_style))
    story.append(Paragraph("   • Sakelar <em>Sensor Notifikasi:</em> Aktif untuk menutup notifikasi pesan masuk.", bullet_style))
    story.append(Paragraph("   • Sakelar <em>AI OCR Redaction:</em> Aktif untuk memindai kredensial teks rahasia.", bullet_style))
    story.append(Paragraph("5. Pada aplikasi rapat virtual, pilih jendela keluaran proyektor tersebut saat membagikan layar (share window).", bullet_style))

    img_hdmi_ui = 'scripts/extracted_images/p16_12__X52.png'
    if os.path.exists(img_hdmi_ui):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_hdmi_ui, width=155 * mm, height=88 * mm))
        story.append(Paragraph("Gambar 6.2 Antarmuka kontrol panel aplikasi desktop BIFROST HDMI Shield.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 15: BAB VI (Lanjutan 6.4 Tirai Privasi Anti-Loop & Panic Blackout)
    # =========================================================================
    story.append(Paragraph("6.4 Pengujian Tirai Privasi Otomatis dan Tombol Panic Blackout", h2_style))
    story.append(Paragraph(
        "BIFROST HDMI Shield dilengkapi dua mekanisme pengamanan tanggap darurat yang telah diuji secara menyeluruh:",
        body_style
    ))
    story.append(Paragraph(
        "1. <strong>Tirai Privasi Anti-Loop (Privacy Curtain):</strong> "
        "Ketika pengguna tidak sengaja berpindah ke jendela rapat daring yang sedang aktif berbagi layar, modul pendeteksi jendela latar depan "
        "segera mengidentifikasi proses peramban. Dalam waktu kurang dari 50 milidetik, layar proyektor digantikan dengan tirai privasi abu-abu gelap "
        "yang menginformasikan bahwa proteksi aktif. Begitu pemateri kembali ke aplikasi materi presentasi (misalnya PowerPoint atau PDF), "
        "tampilan proyektor secara otomatis pulih kembali tanpa memerlukan intervensi tombol manual.",
        body_style
    ))
    story.append(Paragraph(
        "2. <strong>Panic Blackout (Tombol Spasi Darurat):</strong> "
        "Apabila terjadi situasi tak terduga di mana dokumen sangat rahasia terbuka di layar laptop pemateri, pemateri cukup menekan tombol "
        "<strong>Spasi</strong> satu kali. Seluruh layar proyektor eksternal akan langsung menjadi hitam pekat (blackout), melindungi data dari "
        "pandangan audiens. Tekan tombol Spasi sekali lagi untuk memulihkan kembali tampilan presentasi.",
        body_style
    ))

    img_curtain = 'public/fig_antiloop_curtain.png'
    if os.path.exists(img_curtain):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_curtain, width=155 * mm, height=86 * mm))
        story.append(Paragraph("Gambar 6.3 Tampilan tirai privasi otomatis BIFROST HDMI Shield saat jendela rapat virtual terdeteksi.", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 16: BAB VII (TROUBLESHOOTING DAN KEAMANAN)
    # =========================================================================
    story.append(Paragraph("BAB VII. PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "Berikut disajikan tabel panduan diagnosis dan langkah penyelesaian teknis untuk menangani kendala operasional yang mungkin dihadapi pengguna:",
        body_style
    ))

    trouble_data = [
        [Paragraph("<strong>Gejala Masalah</strong>", meta_bold_left), Paragraph("<strong>Penyebab Utama</strong>", meta_bold_left), Paragraph("<strong>Langkah Solusi Terarah</strong>", meta_bold_left)],
        [
            Paragraph("Portal web tidak dapat dimuat di peramban.", meta_left),
            Paragraph("Kendala jaringan atau alamat URL belum tepat.", meta_left),
            Paragraph("Periksa koneksi internet dan pastikan alamat yang diketik adalah <code>https://bifrostsismul.vercel.app/</code>.", meta_left)
        ],
        [
            Paragraph("Berkas gambar tidak dapat dimuat ke Redact Studio.", meta_left),
            Paragraph("Format berkas tidak didukung atau berkas rusak.", meta_left),
            Paragraph("Gunakan format gambar standar (JPG, PNG, WEBP). Gunakan tombol 'Pilih Berkas' bila drag & drop terhalang izin browser.", meta_left)
        ],
        [
            Paragraph("Fungsi tempel papan klip (Paste Ctrl+V) tidak bekerja.", meta_left),
            Paragraph("Peramban memblokir izin pembacaan clipboard sistem.", meta_left),
            Paragraph("Klik ikon gembok pada address bar peramban, pilih 'Izinkan Papan Klip' (Allow Clipboard Access), lalu tekan Ctrl+V ulang.", meta_left)
        ],
        [
            Paragraph("Gagal membuat kunci identitas baru (.bifrost-key).", meta_left),
            Paragraph("Lingkungan static build belum mengaktifkan modul kripto lokal.", meta_left),
            Paragraph("Sistem BIFROST telah dilengkapi fallback Web Crypto Subtle bawaan peramban; pastikan browser diperbarui ke versi stabil terbaru.", meta_left)
        ],
        [
            Paragraph("Kamera virtual BIFROST tidak muncul di Google Meet / Zoom.", meta_left),
            Paragraph("Aplikasi BIFROST Witness Cam belum dijalankan atau switch utama padam.", meta_left),
            Paragraph("Buka BIFROST Witness Cam, pastikan tombol utama telah menyala hijau, kemudian muat ulang (refresh) halaman rapat daring.", meta_left)
        ],
        [
            Paragraph("Aliran kamera virtual terasa lambat atau patah-patah.", meta_left),
            Paragraph("Resolusi kamera terlalu tinggi untuk beban kerja CPU saat ini.", meta_left),
            Paragraph("Ubah pilihan format resolusi dari 1080p Full HD menjadi 720p HD pada panel kontrol Witness Cam.", meta_left)
        ],
        [
            Paragraph("Jendela keluaran proyektor HDMI Shield tidak muncul di monitor eksternal.", meta_left),
            Paragraph("Mode proyeksi Windows masih disetel ke 'Duplicate'.", meta_left),
            Paragraph("Tekan tombol kombinasi Windows+P pada keyboard, pilih opsi 'Extend', lalu klik tombol 'Buka Proyektor TV' kembali.", meta_left)
        ],
        [
            Paragraph("Layar proyektor mendadak hitam pekat.", meta_left),
            Paragraph("Tombol darurat Panic Blackout tidak sengaja tertekan.", meta_left),
            Paragraph("Tekan tombol Spasi satu kali pada keyboard untuk memulihkan kembali tampilan presentasi proyektor.", meta_left)
        ],
    ]

    t_trouble = Table(trouble_data, colWidths=[40 * mm, 45 * mm, 85 * mm])
    t_trouble.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F2F2F2')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#333333')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_trouble)

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 17: BAB VIII (LAMPIRAN KODE SUMBER - Bagian 1)
    # =========================================================================
    story.append(Paragraph("BAB VIII. LAMPIRAN KODE SUMBER DAN TIM PENGEMBANG", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#222222"), spaceBefore=2, spaceAfter=6))

    story.append(Paragraph(
        "Sesuai dengan ketentuan permohonan pendaftaran Hak Cipta Program Komputer pada Direktorat Jenderal Kekayaan Intelektual "
        "(DJKI) Kementerian Hukum dan HAM RI, berikut dilampirkan potongan kode sumber inti yang merepresentasikan logika orisinal sistem BIFROST:",
        body_style
    ))

    story.append(Paragraph("8.1 Cuplikan Kode Sumber Orisinal Program Komputer", h2_style))
    story.append(Paragraph("<strong>1. Modul Redaksi Citra Selektif (Solid & Mosaik)</strong> - Berkas: <code>server/detector_api.py</code>", meta_bold_left))

    code_redact_py = """# server/detector_api.py: Fungsi inti penyamaran area citra berbasis OpenCV
def apply_redaction(img, x, y, w, h, style='solid'):
    H, W = img.shape[:2]
    x = max(0, min(W - 1, int(x))); y = max(0, min(H - 1, int(y)))
    w = max(1, min(W - x, int(w))); h = max(1, min(H - y, int(h)))
    if style == 'solid':
        img[y:y + h, x:x + w] = (0, 0, 0)
    elif style == 'mosaic':
        roi = img[y:y + h, x:x + w]
        small = cv2.resize(roi, (max(1, w // 14), max(1, h // 14)), interpolation=cv2.INTER_LINEAR)
        img[y:y + h, x:x + w] = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
    return img"""

    t_c1 = Table([[Paragraph(format_code_block(code_redact_py), code_style)]], colWidths=[170 * mm])
    t_c1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_c1)
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("<strong>2. Modul Pembersihan Metadata EXIF & Rekonstruksi Piksel</strong> - Berkas: <code>server/detector_api.py</code>", meta_bold_left))

    code_exif_py = """# server/detector_api.py: Pembersihan EXIF mutlak melalui decode-reencode larik piksel
def process_image_core(contents, redact_regions):
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    for reg in redact_regions:
        apply_redaction(img, reg['x'], reg['y'], reg['w'], reg['h'], reg.get('style', 'solid'))
    # Encode ulang secara murni tanpa menyertakan header EXIF atau GPS
    success, encoded_img = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    return encoded_img.tobytes()"""

    t_c2 = Table([[Paragraph(format_code_block(code_exif_py), code_style)]], colWidths=[170 * mm])
    t_c2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_c2)

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 18: BAB VIII (LAMPIRAN KODE SUMBER - Bagian 2)
    # =========================================================================
    story.append(Paragraph("<strong>3. Modul Perhitungan Digest SHA-256 Rantai Kustodi</strong> - Berkas: <code>server/detector_api.py</code>", meta_bold_left))

    code_sha_py = """# server/detector_api.py: Perhitungan digest SHA-256 sebelum dan sesudah sanitasi
def generate_custody_record(raw_bytes, sanitized_bytes, case_id):
    raw_hash = hashlib.sha256(raw_bytes).hexdigest()
    sanitized_hash = hashlib.sha256(sanitized_bytes).hexdigest()
    record = {
        "case_id": case_id,
        "original_sha256": raw_hash,
        "sanitized_sha256": sanitized_hash,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "integrity_status": "VERIFIED_CHAIN_OF_CUSTODY"
    }
    return record"""

    t_c3 = Table([[Paragraph(format_code_block(code_sha_py), code_style)]], colWidths=[170 * mm])
    t_c3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_c3)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("<strong>4. Modul Injeksi Memori Kamera Virtual DirectShow (Witness Cam)</strong> - Berkas: <code>desktop/witness_engine.py</code>", meta_bold_left))

    code_cam_py = """# desktop/witness_engine.py: Penulisan bingkai video YUV I420 ke antrean memori bersama
class DirectVirtualCam:
    def send_bgr(self, bgr_frame):
        W, H = self.width, self.height
        if bgr_frame.shape[1] != W or bgr_frame.shape[0] != H:
            bgr_frame = cv2.resize(bgr_frame, (W, H), interpolation=cv2.INTER_LINEAR)
        yuv = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2YUV_I420)
        y_size = W * H
        uv_size = y_size // 4
        raw = yuv.ravel()
        y, u, v = raw[:y_size], raw[y_size:y_size + uv_size], raw[y_size + uv_size:]
        uv = np.empty(y_size // 2, dtype=np.uint8)
        uv[0::2] = u; uv[1::2] = v
        inc = (self.header.write_idx + 1) & 0xFFFFFFFF
        idx = inc % 3
        frame_addr = self.base_addr + self.frame_offsets[idx]
        self.header.write_idx = inc
        ctypes.memmove(frame_addr, y.ctypes.data, y_size)
        ctypes.memmove(frame_addr + y_size, uv.ctypes.data, y_size // 2)
        self.header.state = SHARED_QUEUE_STATE_READY"""

    t_c4 = Table([[Paragraph(format_code_block(code_cam_py), code_style)]], colWidths=[170 * mm])
    t_c4.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_c4)

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 19: BAB VIII (LAMPIRAN KODE SUMBER - Bagian 3)
    # =========================================================================
    story.append(Paragraph("<strong>5. Modul Deteksi Anti-Loop & Tirai Privasi Layar (HDMI Shield)</strong> - Berkas: <code>desktop/hdmi_engine.py</code>", meta_bold_left))

    code_hdmi_py = """# desktop/hdmi_engine.py: Deteksi otomatis jendela konferensi video dan rendering tirai privasi
class SmartAntiLoopDetector:
    def check(self):
        if not self.enabled:
            return False, ''
        _, title = get_foreground_process_info()
        title_lower = title.lower()
        if any(k in title_lower for k in ['meet.google.com', 'google meet']):
            return True, 'Google Meet (Anti-Loop)'
        if any(k in title_lower for k in ['zoom meeting', 'zoom workplace', 'microsoft teams']):
            return True, 'Online Meeting (Anti-Loop)'
        return False, ''

    def draw_curtain(self, img, reason='Google Meet'):
        # Menampilkan tirai privasi abu-abu slate-900 saat efek layar berulang terdeteksi
        img[:] = (42, 23, 15)
        cv2.putText(img, 'BIFROST ANTI-LOOP PRIVACY CURTAIN', (80, 180),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (56, 189, 248), 2)
        cv2.putText(img, f'Status: {reason} Terdeteksi', (80, 230),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)"""

    t_c5 = Table([[Paragraph(format_code_block(code_hdmi_py), code_style)]], colWidths=[170 * mm])
    t_c5.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_c5)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("<strong>6. Pola Regex Pendeteksi Kredensial Sensitif Layar (OCR Scanner)</strong> - Berkas: <code>desktop/hdmi_engine.py</code>", meta_bold_left))

    code_regex_py = """# desktop/hdmi_engine.py: Pola pencocokan teks rahasia pada tampilan layar
EMAIL_REGEX = re.compile(r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b', re.IGNORECASE)
PHONE_REGEX = re.compile(r'(?:\\+?62|08)[\\d\\s-]{7,16}')
TOKEN_REGEX = re.compile(r'\\b(ey[A-Za-z0-9_-]{12,}\\.[A-Za-z0-9_-]{12,}|\\bghp_[0-9a-zA-Z]{30,})')

def sanitize_ocr_boxes(screen_frame, ocr_results):
    for bbox, text in ocr_results:
        if EMAIL_REGEX.search(text) or PHONE_REGEX.search(text) or TOKEN_REGEX.search(text):
            x1, y1, x2, y2 = bbox
            screen_frame[y1:y2, x1:x2] = (15, 23, 42) # Masking blok privasi"""

    t_c6 = Table([[Paragraph(format_code_block(code_regex_py), code_style)]], colWidths=[170 * mm])
    t_c6.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8F9FA')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_c6)

    story.append(PageBreak())

    # =========================================================================
    # HALAMAN 20: BAB VIII (Lanjutan 8.2 IDENTITAS PENGEMBANG)
    # =========================================================================
    story.append(Paragraph("8.2 Identitas Tim Pengembang Perangkat Lunak", h2_style))
    story.append(Paragraph(
        "Perangkat lunak BIFROST dikembangkan oleh tim mahasiswa Program Studi S1 Informatika / Sains Data, "
        "Fakultas Informatika, Universitas Telkom Bandung:",
        body_style
    ))

    team_data = [
        [Paragraph("<strong>No.</strong>", meta_bold_left), Paragraph("<strong>Nama Lengkap Pengembang</strong>", meta_bold_left), Paragraph("<strong>Nomor Induk Mahasiswa (NIM)</strong>", meta_bold_left), Paragraph("<strong>Peran dan Kontribusi Teknis Utama</strong>", meta_bold_left)],
        [
            Paragraph("1", meta_left),
            Paragraph("Fahri Al Kahfi", meta_bold_left),
            Paragraph("103032500049", meta_left),
            Paragraph("Ketua Tim & Lead Architect: Perancangan arsitektur mesin desktop Tauri Rust, implementasi DirectShow virtual camera, deteksi YuNet ONNX, dan logika Anti-Loop.", meta_left)
        ],
        [
            Paragraph("2", meta_left),
            Paragraph("[Nama Anggota 2]", meta_bold_left),
            Paragraph("[NIM Anggota 2]", meta_left),
            Paragraph("Frontend & Integration Engineer: Pengembangan antarmuka Redact Studio, integrasi Next.js Tailwind CSS, dan pengujian sistem audio DSP.", meta_left)
        ],
        [
            Paragraph("3", meta_left),
            Paragraph("[Nama Anggota 3]", meta_bold_left),
            Paragraph("[NIM Anggota 3]", meta_left),
            Paragraph("Security & Cryptography Engineer: Perancangan modul verifikasi integritas SHA-256 custody ledger dan implementasi penandatanganan pasca-kuantum (PQC).", meta_left)
        ],
        [
            Paragraph("4", meta_left),
            Paragraph("[Nama Anggota 4]", meta_bold_left),
            Paragraph("[NIM Anggota 4]", meta_left),
            Paragraph("Quality Assurance & Documentation: Pengujian fungsionalitas cross-platform, audit kesesuaian ISO/IEC 27037, dan penyusunan buku panduan HKI.", meta_left)
        ]
    ]

    t_team = Table(team_data, colWidths=[10 * mm, 50 * mm, 38 * mm, 72 * mm])
    t_team.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F2F2F2')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#333333')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_team)

    story.append(Spacer(1, 15 * mm))

    # Lembar Pengesahan / Pernyataan
    sign_box = [
        [
            Paragraph("Mengetahui,<br/>Dosen Pembimbing Tugas Besar", meta_style),
            Paragraph("Bandung, 19 November 2026<br/>Ketua Tim Pengembang BIFROST", meta_style)
        ],
        [
            Spacer(1, 20 * mm),
            Spacer(1, 20 * mm)
        ],
        [
            Paragraph("<strong>(______________________________)</strong><br/>NIP / NIDN.", meta_style),
            Paragraph("<strong>Fahri Al Kahfi</strong><br/>NIM: 103032500049", meta_style)
        ]
    ]
    t_sign = Table(sign_box, colWidths=[85 * mm, 85 * mm])
    t_sign.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_sign)

    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#666666"), spaceBefore=3, spaceAfter=4))
    story.append(Paragraph(
        "Buku panduan ini merupakan bagian sah dari berkas pendaftaran Ciptaan Program Komputer "
        "pada Pangkalan Data Kekayaan Intelektual (DJKI) Kementerian Hukum dan HAM Republik Indonesia.",
        caption_style
    ))

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
