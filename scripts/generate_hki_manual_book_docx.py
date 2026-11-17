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
    set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    run = p.add_run(code_text.strip())
    run.font.name = 'Courier New'
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor(0x11, 0x11, 0x11)
    
    # Empty spacer after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(2)
    sp.paragraph_format.space_after = Pt(4)


def build_manual_book_docx(output_path):
    doc = Document()
    
    # Setup page margins A4 standard (2 cm all sides)
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        hrun = hp.add_run("Buku Panduan Penggunaan Program Komputer: BIFROST")
        hrun.font.name = 'Arial'
        hrun.font.size = Pt(8)
        hrun.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("Universitas Telkom - Fakultas Informatika | Panduan Ciptaan DJKI")
        frun.font.name = 'Arial'
        frun.font.size = Pt(8)
        frun.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

    # Base styling
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(9.5)
    normal_style.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)

    # =========================================================================
    # HALAMAN 1: COVER
    # =========================================================================
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(40)
    p_logo.paragraph_format.space_after = Pt(20)
    
    logo_path = 'public/bifrost_cam_logo.png'
    if os.path.exists(logo_path):
        p_logo.add_run().add_picture(logo_path, width=Inches(1.8))

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("BUKU PANDUAN PENGGUNAAN PROGRAM KOMPUTER")
    r_title.bold = True
    r_title.font.size = Pt(18)
    r_title.font.color.rgb = RGBColor(0x11, 0x11, 0x11)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Sistem Proteksi Privasi Multimedia Real-Time Terintegrasi:\nBIFROST Witness Cam & BIFROST HDMI Shield")
    r_sub.font.size = Pt(11.5)
    r_sub.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(14)
    r_line = p_line.add_run("____________________________________________________")
    r_line.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.space_after = Pt(4)
    r_m1 = p_meta.add_run("Kategori Ciptaan: ")
    r_m2 = p_meta.add_run("Program Komputer\n")
    r_m2.bold = True
    r_m3 = p_meta.add_run("Sub-Kategori: ")
    r_m4 = p_meta.add_run("Aplikasi Desktop & Layanan Pengolahan Multimedia")
    r_m4.bold = True
    for r in [r_m1, r_m2, r_m3, r_m4]:
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(80)

    p_team = doc.add_paragraph()
    p_team.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_team.paragraph_format.line_spacing = 1.25
    r_t1 = p_team.add_run("Penyusun / Pengembang:\n")
    r_t1.bold = True
    r_t2 = p_team.add_run(
        "Tim Pengembang Perangkat Lunak BIFROST\n"
        "Program Studi S1 Informatika / Sains Data\n"
        "Fakultas Informatika, Universitas Telkom\n"
        "Bandung, Indonesia\n"
        "Tahun 2026"
    )
    for r in [r_t1, r_t2]:
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    doc.add_page_break()

    # =========================================================================
    # BAB I: DESKRIPSI UMUM SISTEM
    # =========================================================================
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(6)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("BAB I. DESKRIPSI UMUM SISTEM")
    rh1.bold = True
    rh1.font.size = Pt(13)
    rh1.font.color.rgb = RGBColor(0x11, 0x11, 0x11)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "BIFROST adalah perangkat lunak perlindungan privasi multimedia yang beroperasi secara luring (offline) "
        "pada sistem operasi Windows. Perangkat lunak ini dikembangkan untuk kebutuhan keamanan data identitas saksi, "
        "narasumber, dan penyaji informasi saat melakukan komunikasi tatap muka virtual melalui konferensi video maupun presentasi layar."
    )

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.add_run("Sistem BIFROST terdiri dari dua modul fungsional utama yang berdiri sendiri namun bekerja saling melengkapi:")

    for num, title, desc in [
        ("1.", "BIFROST Witness Cam:", 
         " Modul pemroses aliran kamera web dan mikrofon secara real-time. Modul ini mendeteksi titik wajah pengguna menggunakan model pembelajaran mendalam YuNet ONNX, menerapkan sensor visual (mosaik, siluet, atau pita mata), serta memodulasi nada suara pengguna agar identitas vokal tidak dapat dikenali. Hasil pemrosesan disalurkan langsung sebagai perangkat kamera virtual (DirectShow) sehingga terbaca sebagai kamera standar pada aplikasi rapat daring seperti Google Meet, Zoom, dan OBS Studio."),
        ("2.", "BIFROST HDMI Shield:", 
         " Modul pelindung layar tampilan saat laptop dihubungkan ke kabel proyektor fisik atau saat fitur 'Share Screen' aktif. Modul ini secara otomatis menyamarkan notifikasi pesan instan masuk, baris bookmark peramban, serta teks rahasia seperti kata sandi, token, dan nomor rekening perbankan. Modul ini juga dilengkapi pencegah tampilan cermin berulang (mirror loop) yang umum terjadi ketika jendela rapat virtual dibagikan ke layar rapat itu sendiri.")
    ]:
        bp = doc.add_paragraph()
        bp.paragraph_format.left_indent = Inches(0.25)
        bp.paragraph_format.space_after = Pt(4)
        bp.paragraph_format.line_spacing = 1.2
        r_num = bp.add_run(f"{num} ")
        r_t = bp.add_run(title)
        r_t.bold = True
        bp.add_run(desc)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("1.1 Arsitektur Perangkat Lunak")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "Perangkat lunak BIFROST dibangun dengan arsitektur dua lapis (two-tier architecture) berbasis Tauri 2.0 dan Rust. "
        "Lapisan antarmuka pengguna (Frontend) menggunakan teknologi Next.js dan Tailwind CSS yang dirender melalui Microsoft Edge WebView2, "
        "menghasilkan penggunaan memori kerja (RAM) yang sangat rendah (sekitar 1.5 MB untuk antarmuka). Lapisan mesin komputasi (Backend Engine) "
        "berjalan sebagai proses mandiri berbasis pustaka OpenCV, ONNX Runtime, dan DirectShow API. Kedua lapisan berkomunikasi melalui "
        "antarmuka soket lokal berkas latensi rendah (loopback HTTP dan stream MJPEG lokal), memastikan keamanan data tanpa transmisi internet."
    )

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(8)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("1.2 Keunggulan Komputasi Luring (Zero Cloud Latency)")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "Seluruh proses inferensi visi komputer (deteksi wajah dan OCR teks) serta modulasi sinyal suara dijalankan 100% secara lokal "
        "di dalam CPU komputer pengguna tanpa mengirimkan satu bingkai gambar pun ke server cloud. Hal ini memberikan jaminan hukum "
        "bahwa data biometrik saksi dan informasi rahasia pada layar presentasi tidak berisiko bocor melalui jaringan internet."
    )

    doc.add_page_break()

    # =========================================================================
    # BAB II: KEBUTUHAN SISTEM & CARA INSTALASI
    # =========================================================================
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(6)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("BAB II. KEBUTUHAN SISTEM DAN CARA INSTALASI")
    rh1.bold = True
    rh1.font.size = Pt(13)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("2.1 Spesifikasi Perangkat")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.add_run(
        "Agar perangkat lunak BIFROST dapat menjalankan deteksi visual dan pemrosesan audio dengan lancar (minimal 30 bingkai per detik), "
        "dibutuhkan spesifikasi komputer sebagai berikut:"
    )

    spec_rows = [
        ("Komponen", "Spesifikasi Minimum", "Spesifikasi Rekomendasi"),
        ("Sistem Operasi", "Windows 10 64-bit (Build 19041+)", "Windows 11 64-bit"),
        ("Prosesor (CPU)", "Intel Core i3 Gen-8 / AMD Ryzen 3", "Intel Core i5 Gen-10 / Ryzen 5 ke atas"),
        ("Memori (RAM)", "4 GB RAM", "8 GB RAM atau lebih"),
        ("Penyimpanan", "Ruang kosong 350 MB", "Solid State Drive (SSD)"),
        ("Perangkat Masukan", "Webcam USB / Terintegrasi, Mikrofon", "Webcam Full HD 1080p, Mikrofon USB")
    ]
    t_spec = doc.add_table(rows=len(spec_rows), cols=3)
    t_spec.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_spec.autofit = False

    widths = [Inches(1.5), Inches(2.5), Inches(2.5)]
    for r_idx, row in enumerate(spec_rows):
        for c_idx, val in enumerate(row):
            cell = t_spec.cell(r_idx, c_idx)
            cell.width = widths[c_idx]
            cp = cell.paragraphs[0]
            cp.paragraph_format.space_before = Pt(3)
            cp.paragraph_format.space_after = Pt(3)
            cp.paragraph_format.line_spacing = 1.15
            run = cp.add_run(val)
            run.font.size = Pt(8.5)
            if r_idx == 0:
                run.bold = True
                set_cell_background(cell, "EAEAEA")
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(2)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(6)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("2.2 Prosedur Instalasi")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.add_run(
        "Perangkat lunak telah dipaketkan ke dalam format installer mandiri Windows (.exe) menggunakan sistem instalasi NSIS. "
        "Langkah-langkah instalasi adalah sebagai berikut:"
    )

    steps = [
        "Unduh berkas instalasi BIFROST_Witness_Cam_Setup.exe atau BIFROST_HDMI_Shield_Setup.exe.",
        "Klik dua kali pada berkas installer yang telah diunduh.",
        "Pada jendela wizard penyiapan, tentukan folder tujuan instalasi (standar: direktori Program Pengguna).",
        "Klik tombol 'Install'. Installer akan menyalin seluruh pustaka biner, model kecerdasan buatan, dan konfigurasi kamera secara otomatis.",
        "Setelah instalasi selesai, centang opsi 'Jalankan Aplikasi' lalu klik 'Finish'. Pintasan aplikasi akan muncul di Desktop dan Start Menu."
    ]
    for s_idx, st in enumerate(steps):
        sp = doc.add_paragraph()
        sp.paragraph_format.left_indent = Inches(0.25)
        sp.paragraph_format.space_after = Pt(3)
        sp.paragraph_format.line_spacing = 1.15
        sp.add_run(f"{s_idx + 1}. ").bold = True
        sp.add_run(st)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(6)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("2.3 Manajemen Hak Akses Kamera & Mikrofon")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "Pada peluncuran pertama kali, sistem operasi Windows mungkin menampilkan permintaan izin privasi untuk kamera dan mikrofon. "
        "Pilih 'Izinkan' (Allow) agar modul mesin dapat membaca perangkat masukan fisik tanpa hambatan."
    )

    doc.add_page_break()

    # =========================================================================
    # BAB III: PANDUAN PENGOPERASIAN BIFROST WITNESS CAM
    # =========================================================================
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(6)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("BAB III. PANDUAN PENGOPERASIAN BIFROST WITNESS CAM")
    rh1.bold = True
    rh1.font.size = Pt(13)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "BIFROST Witness Cam bertindak sebagai lapisan pelindung biometrik antara kamera fisik laptop dan aplikasi rapat virtual. "
        "Pengguna dapat mengatur gaya penyamaran wajah serta modulasi suara langsung dari antarmuka kontrol."
    )

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("3.1 Penjelasan Fitur Antarmuka Utama")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    witness_features = [
        ("Pemilihan Perangkat Kamera:", " Menu tarik-turun (dropdown) untuk memilih kamera fisik masukan yang terpasang di komputer."),
        ("Pemilihan Resolusi:", " Pilihan format resolusi antara 720p HD (1280x720) untuk komputer berspesifikasi standar atau 1080p Full HD (1920x1080) untuk kejernihan maksimal."),
        ("Mode Sensor Wajah:", " Tersedia tiga jenis filter penyamaran: Mosaik (pixelasi blok terukur), Siluet (warna gelap transparan), dan Pita Mata (bilah sensor horizontal pada area kedua mata)."),
        ("Modulasi Suara DSP:", " Pilihan modulasi suara untuk privasi vokal saksi (Deep Shadow untuk nada berat, Robotik untuk nada sintetis, atau Normal)."),
        ("Tombol Utama Daya:", " Tombol tunggal untuk memulai atau menghentikan aliran kamera dan audio secara menyeluruh.")
    ]
    for idx, (ftit, fdesc) in enumerate(witness_features):
        fp = doc.add_paragraph()
        fp.paragraph_format.left_indent = Inches(0.25)
        fp.paragraph_format.space_after = Pt(2.5)
        fp.paragraph_format.line_spacing = 1.15
        fp.add_run(f"{idx + 1}. ")
        fp.add_run(ftit).bold = True
        fp.add_run(fdesc)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(6)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("3.2 Bukti Pengujian Sensor Wajah Nyata")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.add_run("Berikut merupakan hasil pengujian riil penyensoran wajah saksi yang dihasilkan oleh algoritma deteksi YuNet dan modul sensor BIFROST:")

    # Table 3 images
    img1 = 'public/evidence_sample_raw.jpg'
    img2 = 'public/evidence_sample_sanitized_mosaic.jpg'
    img3 = 'public/evidence_sample_sanitized_bar.jpg'

    if os.path.exists(img1) and os.path.exists(img2) and os.path.exists(img3):
        t_img = doc.add_table(rows=2, cols=3)
        t_img.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_img.autofit = False
        
        c_w = Inches(2.1)
        for c in range(3):
            t_img.cell(0, c).width = c_w
            t_img.cell(1, c).width = c_w

        for idx, (ipath, cap) in enumerate([
            (img1, "(a) Citra Asli (Raw)"),
            (img2, "(b) Sensor Mode Mosaik"),
            (img3, "(c) Sensor Mode Pita Mata")
        ]):
            cell_pic = t_img.cell(0, idx)
            cp = cell_pic.paragraphs[0]
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cp.paragraph_format.space_before = Pt(2)
            cp.paragraph_format.space_after = Pt(2)
            cp.add_run().add_picture(ipath, width=Inches(1.9))
            
            cell_cap = t_img.cell(1, idx)
            ccp = cell_cap.paragraphs[0]
            ccp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ccp.paragraph_format.space_before = Pt(2)
            ccp.paragraph_format.space_after = Pt(2)
            crun = ccp.add_run(cap)
            crun.italic = True
            crun.font.size = Pt(8)
            crun.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

        p_caption = doc.add_paragraph()
        p_caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_caption.paragraph_format.space_before = Pt(4)
        p_caption.paragraph_format.space_after = Pt(4)
        rcap = p_caption.add_run("Gambar 3.1 Perbandingan citra masukan kamera sebelum dan sesudah penerapan filter penyamar identitas.")
        rcap.italic = True
        rcap.font.size = Pt(8)
        rcap.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(6)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("3.3 Integrasi ke Google Meet dan Zoom")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "Untuk menggunakan aliran kamera BIFROST di dalam aplikasi rapat virtual: "
        "Jalankan aplikasi BIFROST Witness Cam, buka menu Setelan (Settings) di Google Meet / Zoom, pilih tab Video, "
        "lalu pilih kamera bernama BIFROST Encrypted Camera atau OBS Virtual Camera. "
        "Tampilan pada peserta rapat otomatis tersensor secara aman."
    )

    doc.add_page_break()

    # =========================================================================
    # HALAMAN 5: BAB IV (HDMI SHIELD)
    # =========================================================================
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(6)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("BAB IV. PANDUAN BIFROST HDMI SHIELD")
    rh1.bold = True
    rh1.font.size = Pt(13)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "BIFROST HDMI Shield digunakan saat pengguna sedang membagikan tampilan layar pada rapat online atau saat terhubung ke proyektor HDMI. "
        "Sistem bertugas memfilter tampilan secara langsung tanpa mengganggu kenyamanan pengguna dalam bekerja."
    )

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("4.1 Fitur Proteksi Layar Otomatis")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    hdmi_features = [
        ("Sensor Notifikasi dan Pesan Masuk:", " Mendeteksi kemunculan kotak notifikasi Windows atau pesan masuk WhatsApp pada sudut kanan bawah layar, lalu menutupinya dengan blok sensor."),
        ("Sensor Baris Bookmark:", " Menyamarkan baris tautan bookmark peramban (Chrome, Edge, Brave) saat peramban aktif di latar depan, mencegah tautan pekerjaan pribadi terlihat oleh audiens."),
        ("Sensor Kredensial AI OCR:", " Mesin OCR memindai teks pada layar secara berkala. Apabila ditemukan pola email, kata sandi, token otentikasi, nomor kartu kredit, atau nomor rekening bank, area tersebut langsung disamarkan."),
        ("Sensor Jendela WhatsApp:", " Menutup secara penuh area obrolan aplikasi WhatsApp saat jendela tersebut terbuka di layar presentasi."),
        ("Pencegah Layar Berulang (Anti-Loop):", " Mendeteksi situasi saat jendela Google Meet membagikan layarnya sendiri. Sistem langsung menampilkan tirai privasi abu-abu agar audiens tidak melihat efek cermin tanpa ujung."),
        ("Panic Blackout (Tombol Darurat Spasi):", " Tombol cepat untuk memadamkan seluruh layar tampilan proyektor menjadi hitam pekat saat terjadi situasi darurat privasi.")
    ]
    for idx, (htit, hdesc) in enumerate(hdmi_features):
        hp = doc.add_paragraph()
        hp.paragraph_format.left_indent = Inches(0.25)
        hp.paragraph_format.space_after = Pt(2.5)
        hp.paragraph_format.line_spacing = 1.15
        hp.add_run(f"{idx + 1}. ")
        hp.add_run(htit).bold = True
        hp.add_run(hdesc)

    # Table 2 video images
    img_vid = 'public/evidence_cinematic_sanitized_mosaic.jpg'
    img_dark = 'public/evidence_dark_sanitized_clean.jpg'
    if os.path.exists(img_vid) and os.path.exists(img_dark):
        t_vid = doc.add_table(rows=2, cols=2)
        t_vid.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_vid.autofit = False
        
        cv_w = Inches(3.2)
        t_vid.cell(0, 0).width = cv_w
        t_vid.cell(0, 1).width = cv_w
        t_vid.cell(1, 0).width = cv_w
        t_vid.cell(1, 1).width = cv_w

        for idx, (ipath, cap) in enumerate([
            (img_vid, "(a) Uji Penyamaran Video Aliran Dinamis"),
            (img_dark, "(b) Uji Pemrosesan Kondisi Pencahayaan Rendah")
        ]):
            cell_pic = t_vid.cell(0, idx)
            cp = cell_pic.paragraphs[0]
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cp.paragraph_format.space_before = Pt(2)
            cp.paragraph_format.space_after = Pt(2)
            cp.add_run().add_picture(ipath, width=Inches(3.0))
            
            cell_cap = t_vid.cell(1, idx)
            ccp = cell_cap.paragraphs[0]
            ccp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            ccp.paragraph_format.space_before = Pt(2)
            ccp.paragraph_format.space_after = Pt(2)
            crun = ccp.add_run(cap)
            crun.italic = True
            crun.font.size = Pt(8)
            crun.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

        p_caption = doc.add_paragraph()
        p_caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_caption.paragraph_format.space_before = Pt(4)
        p_caption.paragraph_format.space_after = Pt(4)
        rcap = p_caption.add_run("Gambar 4.1 Uji ketahanan algoritma penyamaran privasi pada berbagai kondisi skenario presentasi.")
        rcap.italic = True
        rcap.font.size = Pt(8)
        rcap.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(3)
    rh2 = h2.add_run("4.2 Cara Membuka Layar Bersih Proyektor")
    rh2.bold = True
    rh2.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "Sambungkan kabel HDMI laptop ke monitor eksternal atau proyektor fisik. Buka aplikasi BIFROST HDMI Shield, "
        "lalu klik tombol Buka Proyektor TV pada sudut kanan atas. Jendela keluaran bersih akan otomatis tampil "
        "dalam mode layar penuh (fullscreen) di monitor kedua. Pada Google Meet, pilih jendela proyektor tersebut saat membagikan layar."
    )

    doc.add_page_break()

    # =========================================================================
    # HALAMAN 6: BAB V (POTONGAN KODE SUMBER)
    # =========================================================================
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(6)
    h1.paragraph_format.space_after = Pt(4)
    rh1 = h1.add_run("BAB V. LAMPIRAN POTONGAN KODE SUMBER INTI")
    rh1.bold = True
    rh1.font.size = Pt(13)

    p = doc.add_paragraph()
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.add_run(
        "Sesuai ketentuan permohonan Hak Cipta Program Komputer pada Direktorat Jenderal Kekayaan Intelektual (DJKI) Kemenkumham RI, "
        "berikut dilampirkan potongan kode sumber inti yang merepresentasikan logika orisinal perangkat lunak BIFROST:"
    )

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(2)
    rh2 = h2.add_run("5.1 Logika Deteksi Wajah dan Penerapan Sensor Mosaik (Python / OpenCV)")
    rh2.bold = True
    rh2.font.size = Pt(9.5)

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
        small = cv2.resize(roi, (max(1, w // grid), max(1, h // grid)), interpolation=cv2.INTER_LINEAR)
        pixelated = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
        frame[y:y+h, x:x+w] = pixelated
    elif self.mask_mode == 'eyebar':
        eye_y = y + int(h * 0.20)
        eye_h = int(h * 0.28)
        frame[eye_y:eye_y+eye_h, x:x+w] = (15, 23, 42)
    return frame"""
    add_code_block(doc, raw_code_1)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(2)
    rh2 = h2.add_run("5.2 Logika Injeksi Memori Kamera Virtual DirectShow Windows")
    rh2.bold = True
    rh2.font.size = Pt(9.5)

    raw_code_2 = """# Cuplikan Modul witness_engine.py: DirectShow Shared Memory Mapping
class DirectShowSharedQueue:
    def write_frame(self, frame_bgr):
        header = self.get_queue_header()
        idx = header.write_idx % 3
        offset = header.offsets[idx]
        ctypes.memmove(self.base_ptr + offset, frame_bgr.ctypes.data, frame_bgr.nbytes)
        header.write_idx += 1
        header.state = SHARED_QUEUE_STATE_READY"""
    add_code_block(doc, raw_code_2)

    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(4)
    h2.paragraph_format.space_after = Pt(2)
    rh2 = h2.add_run("5.3 Logika Penyamaran Layar Otomatis dan Anti-Loop (HDMI Shield)")
    rh2.bold = True
    rh2.font.size = Pt(9.5)

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
    add_code_block(doc, raw_code_3)

    p_close = doc.add_paragraph()
    p_close.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_close.paragraph_format.space_before = Pt(8)
    rclose = p_close.add_run("Dokumen ini merupakan bagian sah dari kelengkapan berkas permohonan Hak Cipta Program Komputer pada Pangkalan Data Kekayaan Intelektual (DJKI) Kemenkumham RI.")
    rclose.italic = True
    rclose.font.size = Pt(8)
    rclose.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

    doc.save(output_path)
    print(f"Manual book DOCX generated successfully at: {output_path}")

if __name__ == '__main__':
    out1 = 'dist/MANUAL_BOOK_BIFROST_HKI.docx'
    out2 = 'public/downloads/MANUAL_BOOK_BIFROST_HKI.docx'
    os.makedirs(os.path.dirname(out1), exist_ok=True)
    os.makedirs(os.path.dirname(out2), exist_ok=True)
    build_manual_book_docx(out1)
    shutil.copyfile(out1, out2)

