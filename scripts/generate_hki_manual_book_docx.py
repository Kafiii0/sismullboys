import os
import shutil
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_code_block(doc, code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F8F9FA")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Border
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_text.strip())
    run.font.name = 'Consolas'
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor(17, 24, 39)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def format_table_general(table, col_widths, col_alignments=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    for row_idx, row in enumerate(table.rows):
        is_header = (row_idx == 0)
        for col_idx, cell in enumerate(row.cells):
            cell.width = Inches(col_widths[col_idx])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            
            tcPr = cell._tc.get_or_add_tcPr()
            border_color = "333333" if is_header else "DDDDDD"
            borders = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
                f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
                f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{border_color}"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(borders)
            
            if is_header:
                set_cell_background(cell, "F2F2F2")
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    for run in p.runs:
                        run.font.name = 'Calibri'
                        run.font.size = Pt(8.5)
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(17, 24, 39)
            else:
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    if col_alignments and col_idx < len(col_alignments):
                        p.alignment = col_alignments[col_idx]
                    for run in p.runs:
                        run.font.name = 'Calibri'
                        run.font.size = Pt(8.5)
                        run.font.color.rgb = RGBColor(34, 34, 34)

def build_manual_book_docx(output_path):
    doc = Document()
    
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.85)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("Buku Panduan Penggunaan Program Komputer: BIFROST | Hak Cipta © 2026")
        hrun.font.name = 'Calibri'
        hrun.font.size = Pt(7.5)
        hrun.font.color.rgb = RGBColor(120, 120, 120)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("Fakultas Informatika - Universitas Telkom")
        frun.font.name = 'Calibri'
        frun.font.size = Pt(7.5)
        frun.font.color.rgb = RGBColor(120, 120, 120)

    # Styles
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            r.font.name = 'Calibri'
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(26, 26, 26)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = RGBColor(17, 17, 17)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(10.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(17, 17, 17)
        return p

    def add_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(8)
        r.font.italic = True
        r.font.color.rgb = RGBColor(80, 80, 80)
        return p

    # ==========================================
    # HALAMAN 1: COVER & INFORMASI DOKUMEN
    # ==========================================
    p_cov_sp = doc.add_paragraph()
    p_cov_sp.paragraph_format.space_before = Pt(20)

    logo_path = 'public/bifrost_cam_logo.png'
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(12)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.5))

    p_t = doc.add_paragraph()
    p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t.paragraph_format.space_before = Pt(0)
    p_t.paragraph_format.space_after = Pt(4)
    r_t = p_t.add_run("BUKU PANDUAN PENGGUNAAN PROGRAM KOMPUTER")
    r_t.font.name = 'Calibri'
    r_t.font.size = Pt(18)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(17, 17, 17)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(8)
    r_sub = p_sub.add_run("Sistem Proteksi Privasi Multimedia Real-Time Terintegrasi:\nBIFROST Redact Studio, BIFROST Witness Cam, dan BIFROST HDMI Shield")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(50, 50, 50)

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(16)
    r_m1 = p_meta.add_run("Kategori Ciptaan: ")
    r_m1.font.bold = True
    r_m2 = p_meta.add_run("Program Komputer | ")
    r_m3 = p_meta.add_run("Sub-Kategori: ")
    r_m3.font.bold = True
    r_m4 = p_meta.add_run("Aplikasi Desktop dan Layanan Pemrosesan Multimedia")

    # Tabel Info
    t_info = doc.add_table(rows=8, cols=2)
    info_rows = [
        ("Nama Karya Cipta", "BIFROST: Forensic Multimedia Evidence Sanitization Suite"),
        ("Tautan Portal Web", "https://bifrostsismul.vercel.app/"),
        ("Komponen Web", "Portal Utama, BIFROST Redact Studio, dan BIFROST Watermark Studio"),
        ("Komponen Desktop", "BIFROST Witness Cam (Virtual Cam) dan BIFROST HDMI Shield (Screen Shield)"),
        ("Bahasa Pemrograman", "Rust (Tauri 2.0), JavaScript / TypeScript (Next.js), Python 3.12 (Engine)"),
        ("Institusi Pengembang", "Program Studi S1 Informatika, Fakultas Informatika, Universitas Telkom"),
        ("Tahun Penerbitan", "2026"),
        ("Alamat Institusi", "Jl. Telekomunikasi 1, Terusan Buahbatu, Bandung, Jawa Barat 40257")
    ]
    for idx, (label, val) in enumerate(info_rows):
        r = t_info.rows[idx]
        r.cells[0].paragraphs[0].add_run(label).font.bold = True
        r.cells[1].paragraphs[0].add_run(val)
    format_table_general(t_info, [2.2, 4.3])

    p_btm = doc.add_paragraph()
    p_btm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_btm.paragraph_format.space_before = Pt(24)
    r_b = p_btm.add_run("Bandung, Jawa Barat, Indonesia • 2026")
    r_b.font.size = Pt(9)
    r_b.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_page_break()

    # ==========================================
    # HALAMAN 2: DAFTAR ISI
    # ==========================================
    add_h1("DAFTAR ISI")
    
    t_toc = doc.add_table(rows=22, cols=2)
    toc_entries = [
        ("INFORMASI DOKUMEN DAN HAK CIPTA", "1", True),
        ("DAFTAR ISI", "2", True),
        ("BAB I. PENGENALAN SISTEM BIFROST", "3", True),
        ("  1.1 Kemampuan Utama Sistem", "3", False),
        ("  1.2 Standar Acuan dan Prinsip Desain (UU PDP & ISO/IEC 27037)", "3", False),
        ("  1.3 Tiga Pilar Komponen Perangkat Lunak BIFROST", "3", False),
        ("BAB II. AKSES PORTAL DAN NAVIGASI ANTARMUKA", "4", True),
        ("  2.1 Akses Layanan Web Resmi", "4", False),
        ("  2.2 Struktur Bagian Halaman Utama", "4", False),
        ("  2.3 Navigasi ke Ruang Kerja Redact Studio & Watermark Studio", "5", False),
        ("BAB III. PANDUAN PENGOPERASIAN BIFROST REDACT STUDIO", "5", True),
        ("  3.1 Pemuatan Berkas Media (Browse, Drag & Drop, Clipboard)", "5", False),
        ("  3.2 Penerapan Sensor Kredensial Sensitif (Solid, Mosaik, Pita Mata)", "6", False),
        ("  3.3 Pembersihan Metadata EXIF dan Telemetri Perangkat", "7", False),
        ("  3.4 Ekspor Media Tersanitasi dan Sertifikat Audit Forensik", "7", False),
        ("BAB IV. SPESIFIKASI ALUR KERJA DAN SERTIFIKAT AUDIT FORENSIK", "8", True),
        ("  4.1 Alur Kerja Forensik Tiga Tahap (Ingestion, Scrubbing, Verification)", "8", False),
        ("  4.2 Struktur Data Berkas Audit JSON dan Ledger SHA-256", "8", False),
        ("  4.3 Penandatanganan Kriptografi Pasca-Kuantum (PQC ML-DSA-65)", "9", False),
        ("BAB V. PANDUAN PENGOPERASIAN BIFROST WITNESS CAM", "10", True),
        ("  5.1 Spesifikasi dan Kemampuan Modul Desktop", "10", False),
        ("  5.2 Prosedur Instalasi Aplikasi Windows (Setup NSIS)", "10", False),
    ]
    for idx, (title, page, bold) in enumerate(toc_entries):
        r = t_toc.rows[idx]
        run_title = r.cells[0].paragraphs[0].add_run(title)
        run_title.font.name = 'Calibri'
        run_title.font.size = Pt(8.5)
        run_title.font.bold = bold
        
        run_p = r.cells[1].paragraphs[0].add_run(page)
        run_p.font.name = 'Calibri'
        run_p.font.size = Pt(8.5)
        run_p.font.bold = bold
        r.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        
    format_table_general(t_toc, [5.8, 0.7])
    doc.add_page_break()

    # ==========================================
    # HALAMAN 3: BAB I (PENGENALAN)
    # ==========================================
    add_h1("BAB I. PENGENALAN SISTEM BIFROST")
    add_p(
        "BIFROST adalah perangkat lunak perlindungan privasi multimedia berbasis komputasi cerdas yang dikembangkan untuk "
        "mencegah kebocoran data pribadi (Personally Identifiable Information / PII) dan informasi sensitif secara tidak sengaja. "
        "Perangkat lunak ini dirancang untuk memenuhi kebutuhan dosen, peneliti, penyaji materi, dan narasumber yang sering membagikan "
        "tampilan layar ke proyektor fisik maupun tampil dalam sesi konferensi video virtual."
    )
    add_h2("1.1 Kemampuan Utama Sistem")
    add_p("• Pencegahan Kebocoran Biometrik: Penyamaran identitas wajah secara dinamis dan modulasi nada suara langsung pada masukan kamera tanpa latensi komputasi awan.")
    add_p("• Proteksi Layar Presentasi HDMI: Penyamaran notifikasi pesan masuk, sensor baris penanda peramban, serta pemburaman teks kredensial penting seperti kata sandi, token, dan nomor rekening.")
    add_p("• Pencegahan Layar Berulang (Anti-Loop): Deteksi otomatis saat jendela rapat virtual membagikan tampilannya sendiri, menampilkan tirai privasi abu-abu agar audiens tidak melihat efek cermin tanpa ujung.")
    add_p("• Sanitasi Media Forensik dan Rantai Kustodi: Pembersihan total metadata pelacak (EXIF/GPS) dan penerbitan sertifikat audit integritas berkas berbasis hash SHA-256.")

    add_h2("1.2 Standar Acuan dan Prinsip Desain")
    add_p(
        "Arsitektur BIFROST dirancang dengan mengacu pada prinsip pelindungan privasi data sesuai Undang-Undang Nomor 27 Tahun 2022 "
        "tentang Pelindungan Data Pribadi (UU PDP) serta prinsip tata kelola bukti digital berdasarkan ISO/IEC 27037:2012 "
        "(Guidelines for identification, collection, acquisition, and preservation of digital evidence). Seluruh proses sanitasi media "
        "mempertahankan integritas audit trail sehingga perubahan pada data terekam secara jelas tanpa menghilangkan konteks bukti yang sah."
    )

    add_h2("1.3 Tiga Pilar Komponen Perangkat Lunak BIFROST")
    add_p("1. Portal Web & BIFROST Redact Studio: Layanan berbasis peramban untuk pengunggahan media, redaksi selektif, pembersihan EXIF, dan penandatanganan pasca-kuantum (PQC).")
    add_p("2. BIFROST Witness Cam: Aplikasi desktop mandiri untuk penyamaran wajah dan modulasi audio real-time yang dialirkan ke kamera virtual DirectShow.")
    add_p("3. BIFROST HDMI Shield: Aplikasi desktop mandiri untuk memfilter tampilan layar proyektor eksternal secara bersih dari notifikasi dan kredensial.")

    img_hero = 'scripts/extracted_images/hero_live_clean.png'
    if os.path.exists(img_hero):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_hero, width=Inches(6.2))
        add_caption("Gambar 1.1 Tampilan halaman utama portal resmi BIFROST.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 4: BAB II (AKSES PORTAL)
    # ==========================================
    add_h1("BAB II. AKSES PORTAL DAN NAVIGASI ANTARMUKA")
    add_h2("2.1 Akses Layanan Web Resmi")
    add_p(
        "Portal web BIFROST dapat diakses melalui peramban standar (seperti Google Chrome, Microsoft Edge, atau Mozilla Firefox) "
        "tanpa memerlukan instalasi plugin tambahan. Langkah-langkah untuk mengakses sistem adalah sebagai berikut:"
    )
    add_p("1. Sambungkan komputer ke jaringan internet aktif.")
    add_p("2. Buka aplikasi peramban web dan ketik alamat: https://bifrostsismul.vercel.app/.")
    add_p("3. Halaman beranda BIFROST akan dimuat menampilkan navigasi sistem, pratinjau bukti forensik, dan tautan aplikasi.")

    add_h2("2.2 Struktur Bagian Halaman Utama")
    add_p("Halaman beranda portal web BIFROST terbagi menjadi beberapa bagian fungsional utama:")

    t_portal = doc.add_table(rows=7, cols=2)
    portal_rows = [
        ("Hero Header & Navigation", "Menampilkan identitas sistem, tautan langsung ke Redact Studio, Watermark Studio, dan Programs."),
        ("Evidence Preview", "Pratinjau interaktif perbandingan citra sebelum sanitasi (Raw) dan sesudah sanitasi (Sanitized)."),
        ("Core Forensic Modules", "Ringkasan empat kemampuan inti: Selective Credential Redactor, EXIF Purge, SHA-256 Custody Ledger, dan PQC Watermark."),
        ("Witness Cam Standalone", "Penjelasan arsitektur aplikasi desktop Witness Cam beserta tautan pengunduhan paket installer."),
        ("HDMI Shield Standalone", "Penjelasan modul proteksi presentasi layar proyektor dan tombol instalasi installer."),
        ("How It Works", "Diagram alur kerja forensik tiga tahap dari ingestion media hingga verifikasi sertifikat."),
        ("Footer & Documentation", "Informasi hak cipta resmi, repositori kode sumber, dan dokumentasi kepatuhan privasi.")
    ]
    for idx, (b, d) in enumerate(portal_rows):
        r = t_portal.rows[idx]
        r.cells[0].paragraphs[0].add_run(b).font.bold = True
        r.cells[1].paragraphs[0].add_run(d)
    format_table_general(t_portal, [2.2, 4.3])

    img_core = 'scripts/extracted_images/p6_4__X24.png'
    if os.path.exists(img_core):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_core, width=Inches(6.2))
        add_caption("Gambar 2.1 Bagian Core Forensic Modules pada portal web BIFROST.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 5: BAB II (2.3) & BAB III (REDACT STUDIO)
    # ==========================================
    add_h2("2.3 Navigasi ke Ruang Kerja Redact Studio & Watermark Studio")
    add_p(
        "Untuk mulai memproses berkas bukti multimedia, pengguna dapat mengeklik tombol Launch Redact Studio pada menu atas "
        "atau tombol Explore Redact Studio pada badan halaman. Sistem akan memuat antarmuka kerja interaktif tempat pengguna dapat "
        "memilih berkas, menerapkan penyamaran kredensial, menghapus metadata pelacak, dan mengekspor bukti bersertifikat."
    )

    add_h1("BAB III. PANDUAN PENGOPERASIAN BIFROST REDACT STUDIO")
    add_p(
        "BIFROST Redact Studio adalah modul pengolahan media berbasis peramban yang bekerja secara cepat dan terisolasi. "
        "Modul ini dirancang agar petugas investigasi atau pengguna umum dapat mensterilkan berkas dokumen digital sebelum "
        "disebarkan ke pihak luar."
    )
    add_h2("3.1 Pemuatan Berkas Media (Ingestion)")
    add_p("Sistem menyediakan tiga metode fleksibel untuk memasukkan berkas citra atau tangkapan layar ke dalam ruang kerja:")
    add_p("1. Tombol Pilih Berkas (Browse): Klik tombol 'Pilih Berkas' untuk memilih file gambar (PNG, JPG, JPEG, WEBP) dari media penyimpanan lokal komputer.")
    add_p("2. Seret dan Lepas (Drag & Drop): Tarik file gambar dari jendela File Explorer langsung ke dalam kotak area bertuliskan 'Upload Media'.")
    add_p("3. Tempel Papan Klip (Paste Ctrl+V): Apabila pengguna baru saja menyalin tangkapan layar (screenshot) ke clipboard, cukup tekan tombol kombinasi Ctrl+V pada papan ketik saat halaman aktif.")

    img_redact = 'scripts/extracted_images/screen_redact_studio.png'
    if os.path.exists(img_redact):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_redact, width=Inches(6.2))
        add_caption("Gambar 3.1 Antarmuka ruang kerja BIFROST Redact Studio.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 6: BAB III (3.2 REDAKSI KREDENSIAL)
    # ==========================================
    add_h2("3.2 Penerapan Sensor Kredensial Sensitif (Selective Redactor)")
    add_p(
        "Setelah media berhasil dimuat, sistem menampilkan antarmuka penyuntingan visual. Selective Credential Redactor memungkinkan "
        "pengguna untuk menyamarkan area-area sensitif secara presisi tanpa merusak bagian dokumen yang sah (seperti kop surat resmi atau tanda verifikasi legal)."
    )
    add_p("Objek-objek data yang didukung untuk disamarkan mencakup:")
    add_p("• Nomor Kependudukan: NIK KTP, nomor paspor, dan nomor identitas pegawai.")
    add_p("• Kredensial Finansial: Nomor rekening bank, nomor kartu debit/kredit, dan saldo tabungan.")
    add_p("• Kode Matriks & Barcode: Kode QR pembayaran, barcode dokumen rahasia, dan stempel stiker serial.")
    add_p("• Biometrik Wajah: Area wajah subjek saksi atau pihak yang memerlukan pelindungan identitas.")

    add_p("Tersedia tiga pilihan gaya penyamaran yang dapat dipilih sesuai kebutuhan kepatuhan hukum:")
    add_p("1. Mode Solid (Blok Hitam Pekat): Menutupi seluruh area target dengan piksel hitam bernilai RGB (0,0,0) sehingga informasi di baliknya tidak dapat direkonstruksi sama sekali.")
    add_p("2. Mode Mosaik (Pixelasi Terukur): Mengaburkan area target dengan reduksi resolusi blok proporsional, menyamarkan identitas namun tetap mempertahankan estetika tampilan visual.")
    add_p("3. Mode Pita Mata (Eye Bar Sensor): Khusus untuk foto saksi, menempatkan bilah hitam horizontal secara presisi menutupi mata subjek untuk mencegah pengenalan biometrik okular.")

    img_raw = 'public/evidence_sample_raw.jpg'
    img_mosaic = 'public/evidence_sample_sanitized_mosaic.jpg'
    img_bar = 'public/evidence_sample_sanitized_bar.jpg'

    if os.path.exists(img_raw) and os.path.exists(img_mosaic) and os.path.exists(img_bar):
        t_imgs = doc.add_table(rows=2, cols=3)
        t_imgs.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Images row
        t_imgs.rows[0].cells[0].paragraphs[0].add_run().add_picture(img_raw, width=Inches(1.9))
        t_imgs.rows[0].cells[1].paragraphs[0].add_run().add_picture(img_mosaic, width=Inches(1.9))
        t_imgs.rows[0].cells[2].paragraphs[0].add_run().add_picture(img_bar, width=Inches(1.9))
        
        # Labels row
        t_imgs.rows[1].cells[0].paragraphs[0].add_run("(a) Masukan Asli (Raw)")
        t_imgs.rows[1].cells[1].paragraphs[0].add_run("(b) Mode Mosaik Adaptif")
        t_imgs.rows[1].cells[2].paragraphs[0].add_run("(c) Mode Pita Mata (Eye Bar)")
        
        for cell in t_imgs.rows[1].cells:
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            cell.paragraphs[0].runs[0].font.size = Pt(8)
            cell.paragraphs[0].runs[0].font.italic = True
            
        format_table_general(t_imgs, [2.1, 2.1, 2.1])
        add_caption("Gambar 3.2 Bukti visual penerapan filter sensor privasi pada berkas citra bukti forensik.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 7: BAB III (3.3 EXIF & 3.4 EKSPOR)
    # ==========================================
    add_h2("3.3 Pembersihan Metadata EXIF dan Telemetri Perangkat")
    add_p(
        "Kamera ponsel pintar dan kamera digital secara otomatis merekam metadata sensitif pada header berkas JPEG/TIFF, "
        "seperti koordinat geografis lintang dan bujur (GPS), nomor seri bodi kamera, model lensa, serta tanggal dan waktu pengambilan. "
        "Apabila berkas ini disebarluaskan, pihak luar dapat melacak keberadaan lokasi fisik pembuat foto secara akurat."
    )
    add_p(
        "BIFROST Redact Studio menerapkan mekanisme pembersihan mutlak (EXIF & Hardware Telemetry Purge). "
        "Mekanisme ini tidak sekadar menghapus tag tertentu, melainkan melakukan decoding seluruh larik piksel citra ke dalam memori kerja, "
        "kemudian melakukan penulisan ulang (re-encoding) ke format kontainer murni tanpa menyertakan metadata asal. Dengan demikian, "
        "seluruh koordinat lokasi, nomor seri, dan atribut telemetri terhapus secara permanen."
    )

    add_h2("3.4 Ekspor Media Tersanitasi dan Sertifikat Audit Forensik")
    add_p("Setelah proses sanitasi dan pembersihan selesai dijalankan, pengguna dapat mengekspor hasil kerja melalui dua tombol kontrol utama:")
    add_p("1. Unduh Media Tersanitasi: Menyimpan berkas gambar yang telah bersih dari kredensial sensitif dan bebas dari metadata pelacak ke komputer lokal pengguna.")
    add_p("2. Ekspor JSON Audit Certificate: Menghasilkan berkas sertifikat audit forensik resmi dalam format JSON. Berkas ini merekam bukti matematis bahwa proses sanitasi dilakukan secara sah dan rantai kustodi tetap terjaga.")

    t_audit = doc.add_table(rows=6, cols=2)
    audit_rows = [
        ("Nomor Kasus (Case ID)", "PQC-EVD-847291 (Identifikasi unik sesi pengolahan)"),
        ("SHA-256 Media Mentah", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
        ("SHA-256 Media Tersanitasi", "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"),
        ("Wilayah Redaksi Terpilih", "Bounding Box [x: 142, y: 310, w: 280, h: 65], Mode: Mosaic 14-grid"),
        ("Status Pembersihan EXIF", "GPS Coordinates: SCRUBBED, Camera Serial: PURGED, Timestamp: NORMALIZED"),
        ("Stempel Waktu & Petugas", "2026-11-19T02:15:00Z | Operator: Puslabfor Digital Forensics")
    ]
    for idx, (k, v) in enumerate(audit_rows):
        r = t_audit.rows[idx]
        r.cells[0].paragraphs[0].add_run(k).font.bold = True
        r.cells[1].paragraphs[0].add_run(v)
    format_table_general(t_audit, [2.2, 4.3])
    add_caption("Tabel 3.1 Struktur bukti integritas rantai kustodi SHA-256 yang tersimpan dalam sertifikat audit BIFROST.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 8: BAB IV (ALUR KERJA FORENSIK)
    # ==========================================
    add_h1("BAB IV. SPESIFIKASI ALUR KERJA DAN SERTIFIKAT AUDIT FORENSIK")
    add_p(
        "Untuk memastikan keabsahan bukti multimedia di hadapan regulasi hukum dan audit kepatuhan, sistem BIFROST menerapkan "
        "metodologi sanitasi terstruktur yang terbagi dalam tiga tahap berkesinambungan:"
    )
    add_h2("4.1 Alur Kerja Forensik Tiga Tahap")
    add_p(
        "1. Tahap 1 – Ingestion & Tamper Baseline: "
        "Saat berkas multimedia pertama kali dimuat ke dalam memori sistem, algoritma kriptografi SHA-256 langsung menghitung nilai hash intisari "
        "(digest) berkas mentah tersebut. Nilai hash ini dikunci sebagai titik acuan awal (tamper baseline) yang membuktikan kondisi asli bukti "
        "sebelum dilakukan pemrosesan apapun."
    )
    add_p(
        "2. Tahap 2 – Selective Redaction & EXIF Scrub: "
        "Pengguna menerapkan parameter penyamaran pada wilayah-wilayah yang memuat data rahasia. Mesin komputasi mengubah larik piksel pada wilayah tersebut, "
        "serta merekonstruksi kontainer gambar tanpa menyertakan metadata telemetri perangkat keras dan koordinat lokasi."
    )
    add_p(
        "3. Tahap 3 – Custody Verification & Export: "
        "Sistem secara otomatis menghitung ulang nilai hash SHA-256 dari berkas yang telah disanitasi. Kedua nilai hash (sebelum dan sesudah) "
        "kemudian disatukan ke dalam sertifikat tanda terima audit JSON bersama dengan data stempel waktu dan rincian parameter filter yang diterapkan."
    )

    add_h2("4.2 Struktur Data Berkas Audit JSON")
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
    add_code_block(doc, json_snippet)
    add_caption("Potongan 4.1 Contoh struktur berkas JSON Audit Certificate yang diterbitkan sistem BIFROST.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 9: BAB IV (4.3 PQC)
    # ==========================================
    add_h2("4.3 Penandatanganan Kriptografi Pasca-Kuantum (PQC ML-DSA-65)")
    add_p(
        "Untuk mengantisipasi ancaman dekripsi komputasi kuantum di masa depan (Harvest Now, Decrypt Later), "
        "BIFROST Watermark Studio mengintegrasikan skema tanda tangan digital pasca-kuantum berbasis kisi (lattice cryptography) "
        "yang telah distandarisasi oleh NIST sebagai FIPS 204 (ML-DSA-65)."
    )
    add_p(
        "Fitur ini menjamin prinsip Zero-Impersonation, di mana setiap penandatanganan berkas bukti wajib menggunakan "
        "berkas kunci rahasia pribadi (.bifrost-key) yang dipegang sendiri oleh petugas resmi. Kunci ini mengikat secara permanen "
        "nama lengkap, institusi penegak hukum / institusi akademis, serta stempel waktu penerbitan."
    )
    add_p(
        "Pada sisi verifikasi (/watermark?tab=verify), auditor pengadilan atau pemeriksa independen cukup memuat citra bukti. "
        "Sistem akan mengekstrak tanda air tersembunyi (forensic watermark), memverifikasi tanda tangan kisi ML-DSA, dan memastikan "
        "bahwa berkas tersebut 100% otentik dan belum mengalami manipulasi (tampering)."
    )

    img_pqc_auth = 'public/sample_pqc_authentic.png'
    img_pqc_tamp = 'public/sample_pqc_tampered.png'
    if os.path.exists(img_pqc_auth) and os.path.exists(img_pqc_tamp):
        t_pqc = doc.add_table(rows=2, cols=2)
        t_pqc.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_pqc.rows[0].cells[0].paragraphs[0].add_run().add_picture(img_pqc_auth, width=Inches(3.0))
        t_pqc.rows[0].cells[1].paragraphs[0].add_run().add_picture(img_pqc_tamp, width=Inches(3.0))
        t_pqc.rows[1].cells[0].paragraphs[0].add_run("(a) Berkas Otentik Terverifikasi (Kunci Sah)")
        t_pqc.rows[1].cells[1].paragraphs[0].add_run("(b) Berkas Rusak / Terpalsukan (Tampered)")
        for cell in t_pqc.rows[1].cells:
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            cell.paragraphs[0].runs[0].font.size = Pt(8)
            cell.paragraphs[0].runs[0].font.italic = True
        format_table_general(t_pqc, [3.2, 3.2])
        add_caption("Gambar 4.1 Pengujian integritas penandatanganan media pasca-kuantum (PQC) pada BIFROST Watermark Studio.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 10: BAB V (WITNESS CAM)
    # ==========================================
    add_h1("BAB V. PANDUAN PENGOPERASIAN BIFROST WITNESS CAM")
    add_p(
        "BIFROST Witness Cam adalah aplikasi desktop mandiri Windows yang bertindak sebagai lapisan pelindung biometrik langsung "
        "antara kamera web fisik dan aplikasi konferensi virtual (seperti Google Meet, Zoom, dan OBS Studio). "
        "Aplikasi ini memastikan wajah saksi atau pemateri tersensor secara real-time dan suaranya dimodulasi tanpa memerlukan sambungan internet."
    )
    add_h2("5.1 Spesifikasi dan Kemampuan Modul Desktop")
    add_p("• Model Deteksi Wajah YuNet ONNX: Algoritma pembelajaran mendalam lokal yang mendeteksi wajah dalam hitungan milidetik secara presisi bahkan pada sudut wajah miring.")
    add_p("• Tiga Filter Sensor Visual: Mode Mosaik (pixelasi blok adaptif), Mode Siluet (masker gelap merata), dan Mode Pita Mata (Eye Bar sensor).")
    add_p("• Modulasi Audio Digital DSP: Modulasi suara vokal saksi secara langsung (Deep Voice pitch-shift atau Robotic tone) untuk melindungi karakteristik unik suara.")
    add_p("• DirectShow Virtual Device: Menyalurkan keluaran video yang telah disanitasi sebagai perangkat kamera virtual Windows sehingga dikenali oleh seluruh aplikasi pihak ketiga.")

    add_h2("5.2 Prosedur Instalasi Aplikasi Windows")
    add_p("1. Buka halaman portal https://bifrostsismul.vercel.app/programs pada peramban.")
    add_p("2. Pada bagian BIFROST Witness Cam, klik tombol unduh Setup.exe.")
    add_p("3. Jalankan berkas BIFROST_Witness_Cam_Setup_v1.0.0.exe yang telah diunduh.")
    add_p("4. Pada jendela wizard penyiapan NSIS, klik tombol 'Install'. Seluruh pustaka AI dan driver kamera virtual akan dikonfigurasi otomatis.")
    add_p("5. Klik 'Finish'. Pintasan BIFROST Witness Cam akan tersedia pada Desktop dan Start Menu.")

    img_wit_dl = 'scripts/extracted_images/p12_7__X39.png'
    img_wit_ins = 'scripts/extracted_images/p12_8__X40.png'
    if os.path.exists(img_wit_dl) and os.path.exists(img_wit_ins):
        t_wit = doc.add_table(rows=2, cols=2)
        t_wit.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_wit.rows[0].cells[0].paragraphs[0].add_run().add_picture(img_wit_dl, width=Inches(3.0))
        t_wit.rows[0].cells[1].paragraphs[0].add_run().add_picture(img_wit_ins, width=Inches(3.0))
        t_wit.rows[1].cells[0].paragraphs[0].add_run("(a) Bagian Unduhan Aplikasi Witness Cam")
        t_wit.rows[1].cells[1].paragraphs[0].add_run("(b) Panduan Wizard Instalasi NSIS")
        for cell in t_wit.rows[1].cells:
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            cell.paragraphs[0].runs[0].font.size = Pt(8)
            cell.paragraphs[0].runs[0].font.italic = True
        format_table_general(t_wit, [3.2, 3.2])
        add_caption("Gambar 5.1 Kartu pengunduhan resmi dan wizard instalasi BIFROST Witness Cam pada sistem operasi Windows.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 11: BAB V (5.3 PENGOPERASIAN)
    # ==========================================
    add_h2("5.3 Pengoperasian dan Pemilihan Parameter Sensor Biometrik")
    add_p(
        "Setelah aplikasi BIFROST Witness Cam dibuka dari Desktop, jendela antarmuka kontrol terpadu akan ditampilkan. "
        "Pengguna dapat menyesuaikan pengaturan sebelum mengaktifkan kamera virtual:"
    )
    add_p("1. Pemilihan Sumber Kamera Fisik: Pilih perangkat webcam yang terpasang pada komputer melalui menu tarik-turun (dropdown).")
    add_p("2. Pemilihan Format Resolusi: Pilih antara resolusi 720p HD (1280x720) untuk komputer dengan spesifikasi standar atau 1080p Full HD (1920x1080) untuk kualitas tinggi.")
    add_p("3. Pilihan Mode Penyamaran Wajah: Pilih tombol filter yang diinginkan: Mosaik, Siluet, atau Pita Mata.")
    add_p("4. Pengaturan Modulasi Vokal (DSP Audio): Aktifkan sakelar modulasi suara untuk mengaburkan nada suara asli pembicara.")
    add_p("5. Tombol Daya Utama (Master Switch): Klik tombol bulat besar bertuliskan 'MULAI KAMERA' untuk mengaktifkan pemrosesan real-time.")

    img_wit_ui = 'scripts/extracted_images/p13_9__X43.png'
    if os.path.exists(img_wit_ui):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_wit_ui, width=Inches(6.2))
        add_caption("Gambar 5.2 Antarmuka kontrol panel aplikasi desktop BIFROST Witness Cam.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 12: BAB V (5.4 INTEGRASI MEET/ZOOM)
    # ==========================================
    add_h2("5.4 Integrasi Kamera Virtual pada Google Meet, Zoom, dan OBS Studio")
    add_p(
        "Keluaran video yang telah disanitasi secara otomatis dialirkan ke dalam perangkat memori bersama (shared memory DirectShow). "
        "Aplikasi pihak ketiga dapat langsung membaca perangkat ini seolah-olah merupakan webcam fisik standar. "
        "Langkah-langkah penggunaannya adalah sebagai berikut:"
    )
    add_p("1. Pastikan aplikasi BIFROST Witness Cam sedang dalam kondisi aktif (tombol daya menyala hijau).")
    add_p("2. Buka sesi rapat pada Google Meet atau Zoom Meeting.")
    add_p("3. Masuk ke menu Setelan (Settings) -> Video -> Camera.")
    add_p("4. Pilih kamera bernama BIFROST Encrypted Camera atau Virtual Camera.")
    add_p("5. Tampilan video pengguna pada layar peserta rapat akan secara otomatis terproteksi oleh filter biometrik yang dipilih.")

    img_wit_dev = 'public/fig_witness_cam_virtual_device.png'
    if os.path.exists(img_wit_dev):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_wit_dev, width=Inches(6.2))
        add_caption("Gambar 5.3 Aliran kamera virtual BIFROST terbaca langsung pada aplikasi konferensi video secara real-time.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 13: BAB VI (HDMI SHIELD)
    # ==========================================
    add_h1("BAB VI. PANDUAN PENGOPERASIAN BIFROST HDMI SHIELD")
    add_p(
        "BIFROST HDMI Shield adalah aplikasi desktop Windows yang dikembangkan khusus untuk melindungi layar presentasi pengguna saat "
        "laptop terhubung ke proyektor fisik melalui kabel HDMI maupun saat menggunakan fitur berbagi layar (Share Screen) pada rapat daring. "
        "Aplikasi ini bekerja secara cerdas dan otomatis di latar belakang tanpa menghambat alur kerja penyaji materi."
    )
    add_h2("6.1 Spesifikasi dan Kemampuan Proteksi Layar Presentasi")
    add_p("• Sensor Notifikasi dan Pesan Masuk: Mendeteksi jendela notifikasi pop-up (seperti Windows toast atau pesan WhatsApp) dan menutupinya dengan blok privasi abu-abu.")
    add_p("• Sensor Baris Penanda Peramban (Bookmarks): Menyamarkan baris tab dan tautan bookmark saat peramban aktif, menjaga privasi situs pekerjaan.")
    add_p("• Pemindai Teks Kredensial AI OCR: Mesin RapidOCR memindai kata sandi, token otentikasi (JWT/GitHub), dan nomor rekening bank pada layar lalu memburamkannya secara otomatis.")
    add_p("• Fitur Anti-Infinity Loop: Menghilangkan efek cermin berulang yang membingungkan ketika jendela Google Meet/Zoom tidak sengaja membagikan layarnya sendiri.")
    add_p("• Tombol Darurat Panic Blackout: Menghitamkan seluruh layar proyektor dalam sekejap dengan menekan tombol Spasi saat terjadi insiden privasi.")

    add_h2("6.2 Prosedur Instalasi Aplikasi Windows")
    add_p("1. Buka menu unduhan pada portal web https://bifrostsismul.vercel.app/programs.")
    add_p("2. Unduh berkas instalasi resmi BIFROST_HDMI_Shield_Setup_v1.0.0.exe.")
    add_p("3. Jalankan berkas installer dan selesaikan wizard NSIS hingga tombol Finish muncul.")

    img_hdmi_dl = 'scripts/extracted_images/p14_10__X46.png'
    img_hdmi_ins = 'scripts/extracted_images/p15_11__X49.png'
    if os.path.exists(img_hdmi_dl) and os.path.exists(img_hdmi_ins):
        t_hdmi = doc.add_table(rows=2, cols=2)
        t_hdmi.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_hdmi.rows[0].cells[0].paragraphs[0].add_run().add_picture(img_hdmi_dl, width=Inches(3.0))
        t_hdmi.rows[0].cells[1].paragraphs[0].add_run().add_picture(img_hdmi_ins, width=Inches(3.0))
        t_hdmi.rows[1].cells[0].paragraphs[0].add_run("(a) Bagian Unduhan Aplikasi HDMI Shield")
        t_hdmi.rows[1].cells[1].paragraphs[0].add_run("(b) Panduan Wizard Instalasi NSIS")
        for cell in t_hdmi.rows[1].cells:
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            cell.paragraphs[0].runs[0].font.size = Pt(8)
            cell.paragraphs[0].runs[0].font.italic = True
        format_table_general(t_hdmi, [3.2, 3.2])
        add_caption("Gambar 6.1 Kartu pengunduhan resmi dan wizard instalasi BIFROST HDMI Shield.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 14: BAB VI (6.3 PENGOPERASIAN)
    # ==========================================
    add_h2("6.3 Pengoperasian Mode Proyektor Bersih dan Fitur Anti-Loop")
    add_p("Untuk menggunakan BIFROST HDMI Shield saat presentasi di ruang kelas atau ruang rapat:")
    add_p("1. Hubungkan kabel HDMI laptop ke port monitor proyektor eksternal.")
    add_p("2. Buka aplikasi BIFROST HDMI Shield dari Desktop.")
    add_p("3. Klik tombol Buka Proyektor TV pada sudut kanan atas antarmuka. Jendela keluaran bersih akan otomatis terbuka dalam mode layar penuh (fullscreen) pada monitor proyektor.")
    add_p("4. Pada antarmuka utama, pastikan sakelar proteksi yang diperlukan telah diaktifkan:")
    add_p("   • Sakelar Anti-Loop Presentation: Aktif untuk mencegah efek cermin berulang.")
    add_p("   • Sakelar Sensor Notifikasi: Aktif untuk menutup notifikasi pesan masuk.")
    add_p("   • Sakelar AI OCR Redaction: Aktif untuk memindai kredensial teks rahasia.")
    add_p("5. Pada aplikasi rapat virtual, pilih jendela keluaran proyektor tersebut saat membagikan layar (share window).")

    img_hdmi_ui = 'scripts/extracted_images/p16_12__X52.png'
    if os.path.exists(img_hdmi_ui):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_hdmi_ui, width=Inches(6.2))
        add_caption("Gambar 6.2 Antarmuka kontrol panel aplikasi desktop BIFROST HDMI Shield.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 15: BAB VI (6.4 TIRAI & BLACKOUT)
    # ==========================================
    add_h2("6.4 Pengujian Tirai Privasi Otomatis dan Tombol Panic Blackout")
    add_p("BIFROST HDMI Shield dilengkapi dua mekanisme pengamanan tanggap darurat yang telah diuji secara menyeluruh:")
    add_p(
        "1. Tirai Privasi Anti-Loop (Privacy Curtain): "
        "Ketika pengguna tidak sengaja berpindah ke jendela rapat daring yang sedang aktif berbagi layar, modul pendeteksi jendela latar depan "
        "segera mengidentifikasi proses peramban. Dalam waktu kurang dari 50 milidetik, layar proyektor digantikan dengan tirai privasi abu-abu gelap "
        "yang menginformasikan bahwa proteksi aktif. Begitu pemateri kembali ke aplikasi materi presentasi (misalnya PowerPoint atau PDF), "
        "tampilan proyektor secara otomatis pulih kembali tanpa memerlukan intervensi tombol manual."
    )
    add_p(
        "2. Panic Blackout (Tombol Spasi Darurat): "
        "Apabila terjadi situasi tak terduga di mana dokumen sangat rahasia terbuka di layar laptop pemateri, pemateri cukup menekan tombol "
        "Spasi satu kali. Seluruh layar proyektor eksternal akan langsung menjadi hitam pekat (blackout), melindungi data dari "
        "pandangan audiens. Tekan tombol Spasi sekali lagi untuk memulihkan kembali tampilan presentasi."
    )

    img_curtain = 'public/fig_antiloop_curtain.png'
    if os.path.exists(img_curtain):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.add_run().add_picture(img_curtain, width=Inches(6.2))
        add_caption("Gambar 6.3 Tampilan tirai privasi otomatis BIFROST HDMI Shield saat jendela rapat virtual terdeteksi.")

    doc.add_page_break()

    # ==========================================
    # HALAMAN 16: BAB VII (TROUBLESHOOTING)
    # ==========================================
    add_h1("BAB VII. PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)")
    add_p("Berikut disajikan tabel panduan diagnosis dan langkah penyelesaian teknis untuk menangani kendala operasional yang mungkin dihadapi pengguna:")

    t_trouble = doc.add_table(rows=9, cols=3)
    trouble_rows = [
        ("Gejala Masalah", "Penyebab Utama", "Langkah Solusi Terarah"),
        ("Portal web tidak dapat dimuat di peramban.", "Kendala jaringan atau alamat URL belum tepat.", "Periksa koneksi internet dan pastikan alamat yang diketik adalah https://bifrostsismul.vercel.app/."),
        ("Berkas gambar tidak dapat dimuat ke Redact Studio.", "Format berkas tidak didukung atau berkas rusak.", "Gunakan format gambar standar (JPG, PNG, WEBP). Gunakan tombol 'Pilih Berkas' bila drag & drop terhalang."),
        ("Fungsi tempel papan klip (Paste Ctrl+V) tidak bekerja.", "Peramban memblokir izin pembacaan clipboard sistem.", "Klik ikon gembok pada address bar peramban, pilih 'Izinkan Papan Klip', lalu tekan Ctrl+V ulang."),
        ("Gagal membuat kunci identitas baru (.bifrost-key).", "Lingkungan static build belum mengaktifkan modul kripto lokal.", "Sistem BIFROST telah dilengkapi fallback Web Crypto Subtle bawaan peramban; gunakan peramban modern."),
        ("Kamera virtual BIFROST tidak muncul di Google Meet / Zoom.", "Aplikasi BIFROST Witness Cam belum dijalankan atau switch utama padam.", "Buka BIFROST Witness Cam, pastikan tombol utama telah menyala hijau, kemudian muat ulang halaman rapat."),
        ("Aliran kamera virtual terasa lambat atau patah-patah.", "Resolusi kamera terlalu tinggi untuk beban kerja CPU saat ini.", "Ubah pilihan format resolusi dari 1080p Full HD menjadi 720p HD pada panel kontrol Witness Cam."),
        ("Jendela keluaran proyektor tidak muncul di monitor eksternal.", "Mode proyeksi Windows masih disetel ke 'Duplicate'.", "Tekan tombol kombinasi Windows+P pada keyboard, pilih opsi 'Extend', lalu klik 'Buka Proyektor TV'."),
        ("Layar proyektor mendadak hitam pekat.", "Tombol darurat Panic Blackout tidak sengaja tertekan.", "Tekan tombol Spasi satu kali pada keyboard untuk memulihkan kembali tampilan presentasi proyektor.")
    ]
    for idx, (g, p, s) in enumerate(trouble_rows):
        r = t_trouble.rows[idx]
        r.cells[0].paragraphs[0].add_run(g)
        r.cells[1].paragraphs[0].add_run(p)
        r.cells[2].paragraphs[0].add_run(s)
    format_table_general(t_trouble, [2.0, 2.0, 2.5])

    doc.add_page_break()

    # ==========================================
    # HALAMAN 17: BAB VIII (KODE SUMBER 1 & 2)
    # ==========================================
    add_h1("BAB VIII. LAMPIRAN KODE SUMBER DAN TIM PENGEMBANG")
    add_p(
        "Sesuai dengan ketentuan permohonan pendaftaran Hak Cipta Program Komputer pada Direktorat Jenderal Kekayaan Intelektual "
        "(DJKI) Kementerian Hukum dan HAM RI, berikut dilampirkan potongan kode sumber inti yang merepresentasikan logika orisinal sistem BIFROST:"
    )
    add_h2("8.1 Cuplikan Kode Sumber Orisinal Program Komputer")
    add_p("1. Modul Redaksi Citra Selektif (Solid & Mosaik) - Berkas: server/detector_api.py")
    code1 = """# server/detector_api.py: Fungsi inti penyamaran area citra berbasis OpenCV
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
    add_code_block(doc, code1)

    add_p("2. Modul Pembersihan Metadata EXIF & Rekonstruksi Piksel - Berkas: server/detector_api.py")
    code2 = """# server/detector_api.py: Pembersihan EXIF mutlak melalui decode-reencode larik piksel
def process_image_core(contents, redact_regions):
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    for reg in redact_regions:
        apply_redaction(img, reg['x'], reg['y'], reg['w'], reg['h'], reg.get('style', 'solid'))
    # Encode ulang secara murni tanpa menyertakan header EXIF atau GPS
    success, encoded_img = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    return encoded_img.tobytes()"""
    add_code_block(doc, code2)

    doc.add_page_break()

    # ==========================================
    # HALAMAN 18: BAB VIII (KODE SUMBER 3 & 4)
    # ==========================================
    add_p("3. Modul Perhitungan Digest SHA-256 Rantai Kustodi - Berkas: server/detector_api.py")
    code3 = """# server/detector_api.py: Perhitungan digest SHA-256 sebelum dan sesudah sanitasi
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
    add_code_block(doc, code3)

    add_p("4. Modul Injeksi Memori Kamera Virtual DirectShow (Witness Cam) - Berkas: desktop/witness_engine.py")
    code4 = """# desktop/witness_engine.py: Penulisan bingkai video YUV I420 ke antrean memori bersama
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
    add_code_block(doc, code4)

    doc.add_page_break()

    # ==========================================
    # HALAMAN 19: BAB VIII (KODE SUMBER 5 & 6)
    # ==========================================
    add_p("5. Modul Deteksi Anti-Loop & Tirai Privasi Layar (HDMI Shield) - Berkas: desktop/hdmi_engine.py")
    code5 = """# desktop/hdmi_engine.py: Deteksi otomatis jendela konferensi video dan rendering tirai privasi
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
    add_code_block(doc, code5)

    add_p("6. Pola Regex Pendeteksi Kredensial Sensitif Layar (OCR Scanner) - Berkas: desktop/hdmi_engine.py")
    code6 = """# desktop/hdmi_engine.py: Pola pencocokan teks rahasia pada tampilan layar
EMAIL_REGEX = re.compile(r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b', re.IGNORECASE)
PHONE_REGEX = re.compile(r'(?:\\+?62|08)[\\d\\s-]{7,16}')
TOKEN_REGEX = re.compile(r'\\b(ey[A-Za-z0-9_-]{12,}\\.[A-Za-z0-9_-]{12,}|\\bghp_[0-9a-zA-Z]{30,})')

def sanitize_ocr_boxes(screen_frame, ocr_results):
    for bbox, text in ocr_results:
        if EMAIL_REGEX.search(text) or PHONE_REGEX.search(text) or TOKEN_REGEX.search(text):
            x1, y1, x2, y2 = bbox
            screen_frame[y1:y2, x1:x2] = (15, 23, 42) # Masking blok privasi"""
    add_code_block(doc, code6)

    doc.add_page_break()

    # ==========================================
    # HALAMAN 20: BAB VIII (8.2 IDENTITAS PENGEMBANG)
    # ==========================================
    add_h2("8.2 Identitas Tim Pengembang Perangkat Lunak")
    add_p(
        "Perangkat lunak BIFROST dikembangkan oleh tim mahasiswa Program Studi S1 Informatika / Sains Data, "
        "Fakultas Informatika, Universitas Telkom Bandung:"
    )

    t_team = doc.add_table(rows=5, cols=4)
    team_rows = [
        ("No.", "Nama Lengkap Pengembang", "NIM", "Peran dan Kontribusi Teknis Utama"),
        ("1", "Fahri Al Kahfi", "103032500049", "Lead Software Architect: Perancangan arsitektur mesin desktop Tauri Rust, implementasi DirectShow virtual camera, deteksi YuNet ONNX, dan logika Anti-Loop."),
        ("2", "Muhammad Bagus Prabowo", "103032530005", "Frontend & Integration Engineer: Pengembangan antarmuka Redact Studio, integrasi Next.js Tailwind CSS, dan pengujian sistem audio DSP."),
        ("3", "Anggota Pengembang 3", "103032500021", "Security & Cryptography Engineer: Perancangan modul verifikasi integritas SHA-256 custody ledger dan implementasi penandatanganan pasca-kuantum (PQC)."),
        ("4", "Anggota Pengembang 4", "103032500078", "Quality Assurance & Documentation: Pengujian fungsionalitas cross-platform, audit kesesuaian ISO/IEC 27037, dan penyusunan buku panduan HKI.")
    ]
    for idx, (no, nama, nim, peran) in enumerate(team_rows):
        r = t_team.rows[idx]
        r.cells[0].paragraphs[0].add_run(no)
        r.cells[1].paragraphs[0].add_run(nama).font.bold = (idx > 0)
        r.cells[2].paragraphs[0].add_run(nim)
        r.cells[3].paragraphs[0].add_run(peran)
    format_table_general(t_team, [0.5, 1.8, 1.3, 2.9])

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(28)

    t_sign = doc.add_table(rows=3, cols=2)
    t_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_sign.rows[0].cells[0].paragraphs[0].add_run("Mengetahui,\nDosen Pembimbing Tugas Besar")
    t_sign.rows[0].cells[1].paragraphs[0].add_run("Bandung, 19 November 2026\nKetua Tim Pengembang BIFROST")
    
    t_sign.rows[1].cells[0].paragraphs[0].add_run("\n\n\n")
    t_sign.rows[1].cells[1].paragraphs[0].add_run("\n\n\n")
    
    r_dosen = t_sign.rows[2].cells[0].paragraphs[0].add_run("(______________________________)\nNIP / NIDN.")
    r_dosen.font.bold = True
    r_ketua = t_sign.rows[2].cells[1].paragraphs[0].add_run("Fahri Al Kahfi\nNIM: 103032500049")
    r_ketua.font.bold = True
    
    for row in t_sign.rows:
        for cell in row.cells:
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            cell.paragraphs[0].runs[0].font.size = Pt(9)
            cell.width = Inches(3.2)
            tcPr = cell._tc.get_or_add_tcPr()
            borders = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="none"/>'
                f'<w:bottom w:val="none"/>'
                f'<w:left w:val="none"/>'
                f'<w:right w:val="none"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(borders)

    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(20)
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_end = p_end.add_run(
        "Buku panduan ini merupakan bagian sah dari berkas pendaftaran Ciptaan Program Komputer "
        "pada Pangkalan Data Kekayaan Intelektual (DJKI) Kementerian Hukum dan HAM Republik Indonesia."
    )
    r_end.font.size = Pt(8)
    r_end.font.italic = True
    r_end.font.color.rgb = RGBColor(100, 100, 100)

    doc.save(output_path)
    print(f"Manual book DOCX generated successfully at: {output_path}")

if __name__ == '__main__':
    out1 = 'dist/MANUAL_BOOK_BIFROST_HKI.docx'
    out2 = 'public/downloads/MANUAL_BOOK_BIFROST_HKI.docx'
    os.makedirs(os.path.dirname(out1), exist_ok=True)
    os.makedirs(os.path.dirname(out2), exist_ok=True)
    build_manual_book_docx(out1)
    shutil.copyfile(out1, out2)
