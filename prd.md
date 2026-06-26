# PRD — Dashboard Home Visit Beauty Kendari

**Versi:** 1.0  
**Tanggal:** Juni 2026  
**Status:** Draft  
**Author:** Beauty Kendari Operations Team

---

## 1. Latar Belakang & Tujuan

Beauty Kendari memiliki 26 outlet (Beauty 01–26) yang perlu dikunjungi secara berkala oleh SPV melalui proses Home Visit. Saat ini proses monitoring checklist kunjungan masih dilakukan secara manual menggunakan Excel, sehingga sulit untuk melacak progress perbaikan secara real-time, mendistribusikan laporan ke kepala toko, dan merekap seluruh temuan dari semua outlet.

**Tujuan dashboard ini:**
- Mendigitalisasi proses checklist kunjungan outlet
- Memudahkan SPV mengisi hasil temuan secara langsung di sistem
- Memberikan akses outlet untuk mengisi dokumentasi rencana perbaikan
- Menghasilkan laporan ringkasan (Summary) per outlet dan rekap semua outlet dalam format PDF/PNG

---

## 2. Ruang Lingkup

### 2.1 Pengguna (Users)

| Role | Akses | Login |
|------|-------|-------|
| **SPV** | Full access: buat kunjungan baru, isi semua perspektif, lihat semua outlet, export summary rekap | Quick Login (kode SPV) |
| **Outlet (Beauty 01–26)** | Terbatas: hanya bisa lihat dan isi bagian Rencana Perbaikan + Dokumentasi dari kunjungan milik outletnya | Quick Login (nomor outlet, contoh: `01`, `15`, `26`) |

### 2.2 Out of Scope

- Sistem notifikasi (push notification / email)
- Manajemen user (tambah/hapus/edit akun) — diasumsikan dikelola oleh admin langsung di Supabase
- Integrasi dengan sistem kasir atau stok

---

## 3. Alur Pengguna (User Flows)

### 3.1 SPV — Alur Utama

```
Login (Quick Login kode SPV)
  └─> Dashboard Monitoring (tabel semua outlet & kunjungan)
        └─> [+ Buat Kunjungan Baru]
              └─> Pilih Outlet + Isi Tanggal Kunjungan
                    └─> Form Checklist
                          ├─> Perspektif 1–4 : Isi Hasil Temuan (√ / X)
                          │     └─> Jika X → otomatis buka kolom Rencana Perbaikan
                          ├─> Perspektif 5  : Isi Point Penilaian manual → langsung ke Rencana Perbaikan
                          └─> Perspektif 6  : Klik tombol → Modal → Isi temuan per sub-item
                                └─> Submit → masuk ke Rencana Perbaikan
              └─> Simpan & Lihat Summary
                    └─> Export PDF per Outlet atau Export PDF Rekap Semua Outlet
```

### 3.2 Outlet — Alur Utama

```
Login (Quick Login nomor outlet)
  └─> Daftar Kunjungan milik outlet ini
        └─> Pilih kunjungan
              └─> Halaman Rencana Perbaikan
                    └─> Lihat daftar item yang perlu diperbaiki (hasil X dari SPV)
                          └─> Per item: Isi Dokumentasi (textarea + upload foto opsional)
                                └─> Simpan
```

---

## 4. Fitur Detail

### 4.1 Sistem Login (Quick Login)

- Tidak ada username/password konvensional
- Terdapat daftar kode yang sudah ditetapkan:
  - SPV: kode khusus SPV (contoh: `SPV2024`)
  - Outlet: nomor outlet 2 digit (contoh: `01` s/d `26`)
- User memilih role (SPV / Outlet) lalu memasukkan kode
- Session disimpan di localStorage / cookie dengan expiry (misal 8 jam)
- Tidak ada fitur forgot password (dikelola manual oleh admin)

### 4.2 Dashboard Monitoring (SPV Only)

Halaman utama SPV menampilkan tabel monitoring seluruh kunjungan, berisi:

| Kolom | Keterangan |
|-------|-----------|
| No | Nomor urut |
| Outlet | Nama outlet (Beauty 01–26) |
| Tanggal Kunjungan | Tanggal kunjungan dilakukan |
| SPV | Nama/kode SPV yang mengisi |
| Status Checklist | Belum Mulai / Sedang Diisi / Selesai |
| Status Perbaikan | Menunggu / Sedang Proses / Selesai |
| Aksi | Lihat Detail / Export |

- Filter berdasarkan outlet, bulan/tahun, status
- Tombol `+ Buat Kunjungan Baru`

### 4.3 Form Checklist Kunjungan (SPV)

Form berisi header kunjungan dan 6 perspektif penilaian.

#### Header Form

| Field | Input |
|-------|-------|
| Divisi | Text (auto-filled atau dropdown) |
| Outlet | Dropdown (Beauty 01–26) |
| Tanggal Kunjungan | Date picker |
| SPV | Auto-filled dari session login |

#### Perspektif 1 – 4: Standard Penilaian dengan Hasil Temuan

Perspektif yang masuk kategori ini:

| No | Perspektif | Jumlah Point Penilaian |
|----|-----------|----------------------|
| 1 | Standar Pelayanan Advisor dan BA | 8 |
| 2 | Standar Pelayanan Kasir | 7 |
| 3 | Standar Kebersihan & Kerapihan Back Office | *(sesuai data)* |
| 4 | Standar Tertib Administrasi | 7 |

**Logika pengisian:**

Setiap point penilaian memiliki 2 tombol/radio: `√` (Sesuai) atau `X` (Tidak Sesuai)

- Jika dipilih `√` → kolom Rencana Perbaikan, Deadline, Support Divisi Terkait **tidak muncul / disabled**
- Jika dipilih `X` → kolom berikut **otomatis expand/muncul** di bawah baris tersebut:
  - Rencana Perbaikan (textarea)
  - Deadline (date picker)
  - Support Divisi Terkait (text input / dropdown)

#### Perspektif 5: Temuan / Issue Lain

- **Tidak ada kolom Hasil Temuan (√/X)**
- SPV langsung mengisi Point Penilaian secara manual (textarea per baris, minimal 4 baris tersedia, bisa tambah baris)
- Setiap baris yang diisi otomatis masuk ke Rencana Perbaikan (expand di bawahnya):
  - Rencana Perbaikan (textarea)
  - Deadline (date picker)
  - Support Divisi Terkait (text input)

#### Perspektif 6: Kendala OPS

Sub-item yang ada:
1. Produk / Ketersediaan Barang
2. Fasilitas
3. SDM

**Mekanisme pengisian:**

- Perspektif 6 ditampilkan sebagai baris ringkasan di tabel (tidak langsung tampil semua sub-item)
- SPV klik tombol **"Isi Kendala OPS"** → muncul **Modal Dialog**
- Di dalam modal, terdapat 3 sub-item, masing-masing memiliki:
  - Label nama sub-item (Produk / Fasilitas / SDM)
  - Textarea: **"Uraian Temuan"** (input bebas / manual)
- Setelah Submit modal → data masuk ke tabel utama dan otomatis membuka kolom:
  - Rencana Perbaikan
  - Deadline
  - Support Divisi Terkait
- Sub-item yang tidak diisi temuan dianggap tidak ada kendala dan tidak masuk ke rencana perbaikan

### 4.4 Halaman Rencana Perbaikan (Outlet)

Setelah outlet login:
- Tampil daftar kunjungan outlet tersebut (tanggal + status)
- Outlet memilih 1 kunjungan → tampil daftar item perbaikan
- Setiap item perbaikan menampilkan:
  - Perspektif & nomor point
  - Deskripsi point penilaian
  - Rencana Perbaikan yang diisi SPV (read-only)
  - Deadline (read-only)
  - Kolom **Dokumentasi Perbaikan** (yang bisa diisi outlet):
    - Textarea: Catatan / keterangan tindakan yang sudah dilakukan
    - Upload foto (opsional, maks. 3 foto per item)
    - Status: `Belum Dikerjakan` / `Sedang Proses` / `Selesai`
- Tombol Simpan per item atau Simpan Semua

### 4.5 Summary & Export

#### Summary Per Outlet (untuk Kepala Toko)

Konten yang ditampilkan:
- Header: Logo Beauty Kendari, Nama Outlet, Tanggal Kunjungan, Nama SPV
- Tabel rekap semua perspektif dengan kolom: No, Perspektif, Point Penilaian, Hasil Temuan, Rencana Perbaikan, Deadline, Support Divisi, Status Dokumentasi Outlet
- Bagian bawah: tanda tangan SPV (text)
- Format export: **PDF** (utama) dan **PNG** (opsional)

#### Summary Rekap Semua Outlet (untuk SPV)

Konten yang ditampilkan:
- Header: periode / rentang tanggal
- Tabel ringkasan per outlet: Outlet, Tanggal Kunjungan, Total Point Diperiksa, Total Temuan (X), Total Selesai Diperbaiki, Status
- Detail temuan per outlet (collapsible atau halaman terpisah per outlet)
- Format export: **PDF** (multi-halaman)

---

## 5. Struktur Data (Database Schema)

### Tabel: `visits` (Kunjungan)

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | - |
| `outlet_code` | VARCHAR(3) | `01` – `26` |
| `outlet_name` | VARCHAR | `Beauty 01` – `Beauty 26` |
| `visit_date` | DATE | Tanggal kunjungan |
| `spv_code` | VARCHAR | Kode SPV |
| `divisi` | VARCHAR | - |
| `status` | ENUM | `draft`, `completed` |
| `created_at` | TIMESTAMP | - |
| `updated_at` | TIMESTAMP | - |

### Tabel: `checklist_items` (Item Checklist)

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | - |
| `visit_id` | UUID (FK → visits) | - |
| `perspective_no` | INT | 1–6 |
| `perspective_name` | VARCHAR | Nama perspektif |
| `point_no` | INT / VARCHAR | Nomor point penilaian |
| `point_description` | TEXT | Deskripsi point penilaian |
| `hasil_temuan` | ENUM | `V`, `X`, `N/A` |
| `rencana_perbaikan` | TEXT | Diisi SPV |
| `deadline` | DATE | - |
| `support_divisi` | VARCHAR | - |
| `created_at` | TIMESTAMP | - |

### Tabel: `outlet_documentation` (Dokumentasi Perbaikan dari Outlet)

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | - |
| `checklist_item_id` | UUID (FK → checklist_items) | - |
| `catatan` | TEXT | Uraian tindakan perbaikan |
| `foto_urls` | JSONB | Array URL foto (max 3) |
| `status` | ENUM | `belum`, `proses`, `selesai` |
| `updated_at` | TIMESTAMP | - |

### Tabel: `ops_kendala` (Perspektif 6)

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | - |
| `checklist_item_id` | UUID (FK → checklist_items) | - |
| `sub_item` | VARCHAR | `produk`, `fasilitas`, `sdm` |
| `uraian_temuan` | TEXT | Input bebas SPV |

### Tabel: `quick_login_codes` (Kode Login)

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `code` | VARCHAR (PK) | Kode unik |
| `role` | ENUM | `spv`, `outlet` |
| `outlet_code` | VARCHAR | Hanya untuk role outlet |
| `label` | VARCHAR | Nama tampilan |
| `is_active` | BOOLEAN | - |

---

## 6. Tech Stack

| Layer | Teknologi |
|-------|----------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| File Storage | Supabase Storage (foto dokumentasi) |
| Export PDF | `react-pdf` / `@react-pdf/renderer` atau `html2canvas` + `jsPDF` |
| Export PNG | `html2canvas` |
| Hosting | Vercel (frontend) |

---

## 7. Halaman / Routes Aplikasi

| Route | Akses | Deskripsi |
|-------|-------|-----------|
| `/` | Publik | Halaman login (quick login) |
| `/dashboard` | SPV | Tabel monitoring semua kunjungan |
| `/visits/new` | SPV | Buat kunjungan baru |
| `/visits/[id]` | SPV | Detail & edit form checklist |
| `/visits/[id]/summary` | SPV | Preview summary sebelum export |
| `/outlet` | Outlet | Daftar kunjungan outlet ini |
| `/outlet/[visitId]` | Outlet | Form rencana perbaikan & dokumentasi |

---

## 8. Business Rules

1. **SPV** adalah satu-satunya yang bisa membuat kunjungan baru dan mengisi hasil temuan (√/X)
2. **Perspektif 1–4**: Hasil temuan wajib diisi (√ atau X). Jika semua `√`, rencana perbaikan tidak wajib diisi
3. **Perspektif 5**: Tidak ada hasil temuan. SPV langsung mengisi point penilaian (temuan bebas). Setiap baris yang diisi wajib memiliki rencana perbaikan
4. **Perspektif 6**: Pengisian via modal. Sub-item yang tidak ada temuan boleh dikosongkan
5. Item dengan `hasil_temuan = X` atau perspektif 5 & 6 yang terisi **wajib memiliki** Rencana Perbaikan dan Deadline sebelum form bisa di-submit sebagai `completed`
6. Outlet **hanya bisa mengisi** dokumentasi perbaikan pada item yang statusnya ada rencana perbaikan (dari SPV)
7. SPV **bisa melihat dan memantau** status dokumentasi yang diisi outlet
8. Export summary hanya bisa dilakukan setelah status kunjungan `completed`
9. 1 outlet bisa memiliki lebih dari 1 kunjungan (berbeda tanggal)

---

## 9. UI / UX Guidelines

- Tampilan mobile-friendly (SPV kemungkinan mengisi dari HP saat di outlet)
- Tabel checklist menggunakan accordion / expand-row untuk hemat ruang
- Warna indikator status:
  - `√` / Selesai → Hijau
  - `X` / Ada Temuan → Merah
  - Sedang Proses → Kuning/Orange
  - Belum Mulai → Abu-abu
- Modal Perspektif 6 full-screen di mobile
- Tombol export PDF/PNG prominently placed di halaman summary
- Quick login: tampilan sederhana — dropdown pilih role, input kode, tombol masuk

---

## 10. Prioritas Pengembangan (MVP Phases)

### Phase 1 — MVP Core
- [ ] Quick Login (SPV & Outlet)
- [ ] Dashboard monitoring tabel (SPV)
- [ ] Form checklist perspektif 1–4 dengan logika √/X → Rencana Perbaikan
- [ ] Form perspektif 5 (input manual)
- [ ] Modal perspektif 6
- [ ] Halaman rencana perbaikan untuk outlet

### Phase 2 — Export & Summary
- [ ] Halaman preview summary per outlet
- [ ] Export PDF per outlet
- [ ] Halaman rekap semua outlet (SPV)
- [ ] Export PDF rekap

### Phase 3 — Enhancement
- [ ] Upload foto dokumentasi oleh outlet
- [ ] Filter & pencarian di dashboard monitoring
- [ ] Status tracking perbaikan real-time
- [ ] Print-friendly view summary

---

## 11. Referensi Checklist (Data Tetap)

Data checklist berikut di-seed ke database sebagai master data:

### Perspektif 1 — Standar Pelayanan Advisor dan BA
1. Karyawan memberikan senyum, sapa, salam kepada pelanggan dengan tangan kanan diletakan di dada
2. Karyawan bersikap ramah dalam memberikan pelayanan kepada pelanggan
3. Karyawan mampu memberikan penjelasan tentang produk yang dijual
4. Karyawan mampu berkomunikasi dengan baik kepada pelanggan
5. Karyawan mampu melakukan Cross-selling dan Up-selling
6. Grooming sesuai Standar
7. Kecepatan Melayani Pelanggan
8. Sikap dan etika kerja tim

### Perspektif 2 — Standar Pelayanan Kasir
1. Kasir melakukan eye-contact dan memberikan senyum, sapa, salam kepada pelanggan dengan tangan kanan diletakan di dada
2. Kasir mampu memberikan penjelasan tentang promosi yang sedang berjalan
3. Kasir melakukan cross-selling, up-selling dan menawarkan membership
4. Kasir mampu memberikan pelayanan pembayaran secara teliti dan cepat
5. Kasir melakukan 7 step pelayanan kasir
6. Kondisi Tester
7. Area Kasir bersih dan Rapih

### Perspektif 3 — Standar Kebersihan & Kenyamanan Outlet
1. Kebersihan lantai, kaca, produk dan rak selalu terjaga dengan baik
2. Standar kenyamanan suhu ruangan area penjualan terjaga dengan baik (suhu 25–27°C)
3. Standar penerangan area penjualan terjaga dengan baik (lumen 800–1.100)

### Perspektif 4 — Standar Tertib Administrasi
1. Mengecek form checklist buka-tutup toko
2. Mengecek pelaksanaan worksheet dan checklist kebersihan
3. Mengecek administrasi kasir (buku serah-terima modal, setoran kasir, void & refund)
4. Mengecek kelengkapan pricecard dan perubahan harga jual
5. Proses penerimaan barang internal dan eksternal
6. Pelaksanaan Cek Body
7. Penggunaan LOKER

### Perspektif 5 — Temuan / Issue Lain
*(Input bebas oleh SPV, tidak ada point penilaian yang pre-defined)*

### Perspektif 6 — Kendala OPS
1. Produk / Ketersediaan Barang
2. Fasilitas
3. SDM

---

*Dokumen ini merupakan acuan awal development. Perubahan requirement akan didokumentasikan sebagai revisi versi PRD.*