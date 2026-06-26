-- ============================================================
-- Beauty Kendari Home Visit — Seed Data
-- Run this AFTER supabase-schema.sql
-- ============================================================

-- ============================================================
-- 1. QUICK LOGIN CODES
-- ============================================================

-- SPV Codes
INSERT INTO quick_login_codes (code, role, outlet_code, label) VALUES
  ('SPV2024', 'spv', NULL, 'SPV 2024'),
  ('SPV2026', 'spv', NULL, 'SPV 2026');

-- Outlet Codes (Beauty 01–26)
INSERT INTO quick_login_codes (code, role, outlet_code, label)
SELECT
  LPAD(i::text, 2, '0'),
  'outlet',
  LPAD(i::text, 2, '0'),
  'Beauty ' || LPAD(i::text, 2, '0')
FROM generate_series(1, 26) AS i;

-- ============================================================
-- 2. SAMPLE VISITS
-- ============================================================

INSERT INTO visits (id, outlet_code, outlet_name, visit_date, spv_code, divisi, status, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '01', 'Beauty 01', '2026-06-10', 'SPV2024', 'OPS', 'completed', '2026-06-10T08:00:00Z', '2026-06-10T12:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', '05', 'Beauty 05', '2026-06-24', 'SPV2024', 'OPS', 'completed', '2026-06-24T09:00:00Z', '2026-06-24T11:30:00Z'),
  ('00000000-0000-0000-0000-000000000003', '12', 'Beauty 12', '2026-06-25', 'SPV2026', 'OPS', 'draft', '2026-06-25T03:00:00Z', '2026-06-25T03:00:00Z');

-- ============================================================
-- 3. MASTER CHECKLIST DATA (helper function)
-- ============================================================

-- Perspektif 1 — Standar Pelayanan Advisor dan BA
-- Perspektif 2 — Standar Pelayanan Kasir
-- Perspektif 3 — Standar Kebersihan & Kenyamanan Outlet
-- Perspektif 4 — Standar Tertib Administrasi
-- Perspektif 6 — Kendala OPS

-- We'll create a temporary table for master checklist
CREATE TEMPORARY TABLE _master_checklist (
  p_no INT,
  pt_no INT,
  p_name TEXT,
  description TEXT
);

INSERT INTO _master_checklist (p_no, pt_no, p_name, description) VALUES
  -- Perspektif 1
  (1, 1, 'Standar Pelayanan Advisor dan BA', 'Karyawan memberikan senyum, sapa, salam kepada pelanggan dengan tangan kanan diletakan di dada'),
  (1, 2, 'Standar Pelayanan Advisor dan BA', 'Karyawan bersikap ramah dalam memberikan pelayanan kepada pelanggan'),
  (1, 3, 'Standar Pelayanan Advisor dan BA', 'Karyawan mampu memberikan penjelasan tentang produk yang dijual'),
  (1, 4, 'Standar Pelayanan Advisor dan BA', 'Karyawan mampu berkomunikasi dengan baik kepada pelanggan'),
  (1, 5, 'Standar Pelayanan Advisor dan BA', 'Karyawan mampu melakukan Cross-selling dan Up-selling'),
  (1, 6, 'Standar Pelayanan Advisor dan BA', 'Grooming sesuai Standar'),
  (1, 7, 'Standar Pelayanan Advisor dan BA', 'Kecepatan Melayani Pelanggan'),
  (1, 8, 'Standar Pelayanan Advisor dan BA', 'Sikap dan etika kerja tim'),
  -- Perspektif 2
  (2, 1, 'Standar Pelayanan Kasir', 'Kasir melakukan eye-contact dan memberikan senyum, sapa, salam kepada pelanggan dengan tangan kanan diletakan di dada'),
  (2, 2, 'Standar Pelayanan Kasir', 'Kasir mampu memberikan penjelasan tentang promosi yang sedang berjalan'),
  (2, 3, 'Standar Pelayanan Kasir', 'Kasir melakukan cross-selling, up-selling dan menawarkan membership'),
  (2, 4, 'Standar Pelayanan Kasir', 'Kasir mampu memberikan pelayanan pembayaran secara teliti dan cepat'),
  (2, 5, 'Standar Pelayanan Kasir', 'Kasir melakukan 7 step pelayanan kasir'),
  (2, 6, 'Standar Pelayanan Kasir', 'Kondisi Tester'),
  (2, 7, 'Standar Pelayanan Kasir', 'Area Kasir bersih dan Rapih'),
  -- Perspektif 3
  (3, 1, 'Standar Kebersihan & Kenyamanan Outlet', 'Kebersihan lantai, kaca, produk dan rak selalu terjaga dengan baik'),
  (3, 2, 'Standar Kebersihan & Kenyamanan Outlet', 'Standar kenyamanan suhu ruangan area penjualan terjaga dengan baik (suhu 25–27°C)'),
  (3, 3, 'Standar Kebersihan & Kenyamanan Outlet', 'Standar penerangan area penjualan terjaga dengan baik (lumen 800–1.100)'),
  -- Perspektif 4
  (4, 1, 'Standar Tertib Administrasi', 'Mengecek form checklist buka-tutup toko'),
  (4, 2, 'Standar Tertib Administrasi', 'Mengecek pelaksanaan worksheet dan checklist kebersihan'),
  (4, 3, 'Standar Tertib Administrasi', 'Mengecek administrasi kasir (buku serah-terima modal, setoran kasir, void & refund)'),
  (4, 4, 'Standar Tertib Administrasi', 'Mengecek kelengkapan pricecard dan perubahan harga jual'),
  (4, 5, 'Standar Tertib Administrasi', 'Proses penerimaan barang internal dan eksternal'),
  (4, 6, 'Standar Tertib Administrasi', 'Pelaksanaan Cek Body'),
  (4, 7, 'Standar Tertib Administrasi', 'Penggunaan LOKER'),
  -- Perspektif 6
  (6, 1, 'Kendala OPS', 'Produk / Ketersediaan Barang'),
  (6, 2, 'Kendala OPS', 'Fasilitas'),
  (6, 3, 'Kendala OPS', 'SDM');

-- ============================================================
-- 4. SEED CHECKLIST ITEMS FOR VISIT 1 (Beauty 01 - Completed)
-- ============================================================

-- All items V except Perspektif 2 Point 7 (X)
INSERT INTO checklist_items (visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
SELECT
  '00000000-0000-0000-0000-000000000001',
  mc.p_no,
  mc.p_name,
  mc.pt_no::text,
  mc.description,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN 'X'::hasil_temuan_type ELSE 'V'::hasil_temuan_type END,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN 'Membersihkan sisa tumpukan struk kasir dan merapikan kabel EDC' ELSE '' END,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN '2026-06-12'::date ELSE NULL END,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN 'IT / GA' ELSE '' END
FROM _master_checklist mc;

-- Add documentation for the X item in Visit 1
INSERT INTO outlet_documentation (checklist_item_id, catatan, foto_urls, status, updated_at)
SELECT ci.id, 'Area kasir sudah dirapikan, tumpukan struk lama sudah dibuang, kabel diikat cable tie', '["https://picsum.photos/seed/clean-cashier/400/300"]'::jsonb, 'selesai', '2026-06-12T10:00:00Z'
FROM checklist_items ci
WHERE ci.visit_id = '00000000-0000-0000-0000-000000000001'
  AND ci.perspective_no = 2 AND ci.point_no = '7';

-- ============================================================
-- 5. SEED CHECKLIST ITEMS FOR VISIT 2 (Beauty 05 - Completed, pending repairs)
-- ============================================================

-- Perspektif 1 Point 2 = X, Perspektif 3 Point 1 = X, rest = V
INSERT INTO checklist_items (visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
SELECT
  '00000000-0000-0000-0000-000000000002',
  mc.p_no,
  mc.p_name,
  mc.pt_no::text,
  mc.description,
  CASE
    WHEN mc.p_no = 1 AND mc.pt_no = 2 THEN 'X'::hasil_temuan_type
    WHEN mc.p_no = 3 AND mc.pt_no = 1 THEN 'X'::hasil_temuan_type
    ELSE 'V'::hasil_temuan_type
  END,
  CASE
    WHEN mc.p_no = 1 AND mc.pt_no = 2 THEN 'Briefing pagi internal outlet mengenai hospitality dan 3S'
    WHEN mc.p_no = 3 AND mc.pt_no = 1 THEN 'Melakukan penjadwalan pembersihan rak produk secara berkala setiap shift'
    ELSE ''
  END,
  CASE
    WHEN mc.p_no = 1 AND mc.pt_no = 2 THEN '2026-06-28'::date
    WHEN mc.p_no = 3 AND mc.pt_no = 1 THEN '2026-06-26'::date
    ELSE NULL
  END,
  ''
FROM _master_checklist mc;

-- Documentation for Visit 2 X items
INSERT INTO outlet_documentation (checklist_item_id, catatan, foto_urls, status, updated_at)
SELECT ci.id, 'Belum dijadwalkan briefing khusus', '[]'::jsonb, 'belum', '2026-06-24T12:00:00Z'
FROM checklist_items ci
WHERE ci.visit_id = '00000000-0000-0000-0000-000000000002'
  AND ci.perspective_no = 1 AND ci.point_no = '2';

INSERT INTO outlet_documentation (checklist_item_id, catatan, foto_urls, status, updated_at)
SELECT ci.id, 'Sedang dibersihkan bertahap oleh staff shift siang', '[]'::jsonb, 'proses', '2026-06-25T09:00:00Z'
FROM checklist_items ci
WHERE ci.visit_id = '00000000-0000-0000-0000-000000000002'
  AND ci.perspective_no = 3 AND ci.point_no = '1';

-- Perspektif 5 custom item for Visit 2
INSERT INTO checklist_items (visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  5,
  'Temuan / Issue Lain',
  '1',
  'Lampu luar depan outlet mati 1 unit',
  'X',
  'Penggantian lampu LED luar 15 Watt',
  '2026-06-30',
  'GA / Maintenance'
);

INSERT INTO outlet_documentation (checklist_item_id, catatan, foto_urls, status, updated_at)
SELECT ci.id, 'Sudah diajukan ke divisi GA untuk penggantian bohlam', '[]'::jsonb, 'proses', '2026-06-25T09:10:00Z'
FROM checklist_items ci
WHERE ci.visit_id = '00000000-0000-0000-0000-000000000002'
  AND ci.perspective_no = 5 AND ci.point_no = '1';

-- ============================================================
-- 6. SEED CHECKLIST ITEMS FOR VISIT 3 (Beauty 12 - Draft)
-- ============================================================

-- All items with NULL hasil_temuan (not yet evaluated)
INSERT INTO checklist_items (visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
SELECT
  '00000000-0000-0000-0000-000000000003',
  mc.p_no,
  mc.p_name,
  mc.pt_no::text,
  mc.description,
  NULL,
  '',
  NULL,
  ''
FROM _master_checklist mc;

-- Clean up
DROP TABLE _master_checklist;
