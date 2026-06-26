-- ============================================================
-- Beauty Kendari Home Visit — Seed Data for TiDB
-- ============================================================

-- 1. QUICK LOGIN CODES

-- SPV Codes
INSERT INTO quick_login_codes (code, role, outlet_code, label) VALUES
  ('SPV2024', 'spv', NULL, 'SPV 2024'),
  ('SPV2026', 'spv', NULL, 'SPV 2026');

-- Outlet Codes (Beauty 01–26)
INSERT INTO quick_login_codes (code, role, outlet_code, label) VALUES
  ('01', 'outlet', '01', 'Beauty 01'),
  ('02', 'outlet', '02', 'Beauty 02'),
  ('03', 'outlet', '03', 'Beauty 03'),
  ('04', 'outlet', '04', 'Beauty 04'),
  ('05', 'outlet', '05', 'Beauty 05'),
  ('06', 'outlet', '06', 'Beauty 06'),
  ('07', 'outlet', '07', 'Beauty 07'),
  ('08', 'outlet', '08', 'Beauty 08'),
  ('09', 'outlet', '09', 'Beauty 09'),
  ('10', 'outlet', '10', 'Beauty 10'),
  ('11', 'outlet', '11', 'Beauty 11'),
  ('12', 'outlet', '12', 'Beauty 12'),
  ('13', 'outlet', '13', 'Beauty 13'),
  ('14', 'outlet', '14', 'Beauty 14'),
  ('15', 'outlet', '15', 'Beauty 15'),
  ('16', 'outlet', '16', 'Beauty 16'),
  ('17', 'outlet', '17', 'Beauty 17'),
  ('18', 'outlet', '18', 'Beauty 18'),
  ('19', 'outlet', '19', 'Beauty 19'),
  ('20', 'outlet', '20', 'Beauty 20'),
  ('21', 'outlet', '21', 'Beauty 21'),
  ('22', 'outlet', '22', 'Beauty 22'),
  ('23', 'outlet', '23', 'Beauty 23'),
  ('24', 'outlet', '24', 'Beauty 24'),
  ('25', 'outlet', '25', 'Beauty 25'),
  ('26', 'outlet', '26', 'Beauty 26');

-- 2. SAMPLE VISITS
INSERT INTO visits (id, outlet_code, outlet_name, visit_date, spv_code, divisi, status, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '01', 'Beauty 01', '2026-06-10', 'SPV2024', 'OPS', 'completed', '2026-06-10 08:00:00', '2026-06-10 12:00:00'),
  ('00000000-0000-0000-0000-000000000002', '05', 'Beauty 05', '2026-06-24', 'SPV2024', 'OPS', 'completed', '2026-06-24 09:00:00', '2026-06-24 11:30:00'),
  ('00000000-0000-0000-0000-000000000003', '12', 'Beauty 12', '2026-06-25', 'SPV2026', 'OPS', 'draft', '2026-06-25 03:00:00', '2026-06-25 03:00:00');

-- 3. MASTER CHECKLIST DATA (Temporary table helper)
CREATE TEMPORARY TABLE _master_checklist (
  p_no INT,
  pt_no INT,
  p_name VARCHAR(200),
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

-- 4. SEED CHECKLIST ITEMS FOR VISIT 1 (Beauty 01 - Completed)
-- We use REPLACE / INSERT with UUID() or custom IDs so we can reference them
-- To reference checklist item IDs in outlet_documentation, we can seed them with static UUIDs
-- For simplicity, let's generate static UUIDs based on pt_no for the specific rows we need to reference.
-- Or we can generate UUIDs for all rows in checklist_items by concat:
-- CONCAT('10000000-0000-0000-0000-0000000000', LPAD(mc.p_no, 2, '0'), LPAD(mc.pt_no, 2, '0'))

INSERT INTO checklist_items (id, visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
SELECT
  CONCAT('10000000-0000-0000-0000-00000000', LPAD(mc.p_no, 2, '0'), LPAD(mc.pt_no, 2, '0')),
  '00000000-0000-0000-0000-000000000001',
  mc.p_no,
  mc.p_name,
  CAST(mc.pt_no AS CHAR),
  mc.description,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN 'X' ELSE 'V' END,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN 'Membersihkan sisa tumpukan struk kasir dan merapikan kabel EDC' ELSE '' END,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN '2026-06-12' ELSE NULL END,
  CASE WHEN mc.p_no = 2 AND mc.pt_no = 7 THEN 'IT / GA' ELSE '' END
FROM _master_checklist mc;

-- Add documentation for the X item in Visit 1 (p_no = 2, pt_no = 7)
INSERT INTO outlet_documentation (id, checklist_item_id, catatan, foto_urls, status, updated_at) VALUES
  ('d1000000-0000-0000-0000-000000000207', '10000000-0000-0000-0000-000000000207', 'Area kasir sudah dirapikan, tumpukan struk lama sudah dibuang, kabel diikat cable tie', '["https://picsum.photos/seed/clean-cashier/400/300"]', 'selesai', '2026-06-12 10:00:00');

-- 5. SEED CHECKLIST ITEMS FOR VISIT 2 (Beauty 05 - Completed, pending repairs)
INSERT INTO checklist_items (id, visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
SELECT
  CONCAT('20000000-0000-0000-0000-00000000', LPAD(mc.p_no, 2, '0'), LPAD(mc.pt_no, 2, '0')),
  '00000000-0000-0000-0000-000000000002',
  mc.p_no,
  mc.p_name,
  CAST(mc.pt_no AS CHAR),
  mc.description,
  CASE
    WHEN mc.p_no = 1 AND mc.pt_no = 2 THEN 'X'
    WHEN mc.p_no = 3 AND mc.pt_no = 1 THEN 'X'
    ELSE 'V'
  END,
  CASE
    WHEN mc.p_no = 1 AND mc.pt_no = 2 THEN 'Briefing pagi internal outlet mengenai hospitality dan 3S'
    WHEN mc.p_no = 3 AND mc.pt_no = 1 THEN 'Melakukan penjadwalan pembersihan rak produk secara berkala setiap shift'
    ELSE ''
  END,
  CASE
    WHEN mc.p_no = 1 AND mc.pt_no = 2 THEN '2026-06-28'
    WHEN mc.p_no = 3 AND mc.pt_no = 1 THEN '2026-06-26'
    ELSE NULL
  END,
  ''
FROM _master_checklist mc;

-- Documentation for Visit 2 X items
INSERT INTO outlet_documentation (id, checklist_item_id, catatan, foto_urls, status, updated_at) VALUES
  ('d2000000-0000-0000-0000-000000000102', '20000000-0000-0000-0000-000000000102', 'Belum dijadwalkan briefing khusus', '[]', 'belum', '2026-06-24 12:00:00'),
  ('d2000000-0000-0000-0000-000000000301', '20000000-0000-0000-0000-000000000301', 'Sedang dibersihkan bertahap oleh staff shift siang', '[]', 'proses', '2026-06-25 09:00:00');

-- Perspektif 5 custom item for Visit 2
INSERT INTO checklist_items (id, visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi) VALUES
  ('20000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000002', 5, 'Temuan / Issue Lain', '1', 'Lampu luar depan outlet mati 1 unit', 'X', 'Penggantian lampu LED luar 15 Watt', '2026-06-30', 'GA / Maintenance');

INSERT INTO outlet_documentation (id, checklist_item_id, catatan, foto_urls, status, updated_at) VALUES
  ('d2000000-0000-0000-0000-000000000501', '20000000-0000-0000-0000-000000000501', 'Sudah diajukan ke divisi GA untuk penggantian bohlam', '[]', 'proses', '2026-06-25 09:10:00');

-- 6. SEED CHECKLIST ITEMS FOR VISIT 3 (Beauty 12 - Draft)
INSERT INTO checklist_items (id, visit_id, perspective_no, perspective_name, point_no, point_description, hasil_temuan, rencana_perbaikan, deadline, support_divisi)
SELECT
  CONCAT('30000000-0000-0000-0000-00000000', LPAD(mc.p_no, 2, '0'), LPAD(mc.pt_no, 2, '0')),
  '00000000-0000-0000-0000-000000000003',
  mc.p_no,
  mc.p_name,
  CAST(mc.pt_no AS CHAR),
  mc.description,
  NULL,
  '',
  NULL,
  ''
FROM _master_checklist mc;

-- Clean up
DROP TEMPORARY TABLE _master_checklist;
