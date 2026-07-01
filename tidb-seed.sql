-- ============================================================
-- Beauty Kendari Home Visit — Seed Data for TiDB
-- ============================================================

-- 1. QUICK LOGIN CODES

-- SPV Codes - ACTUAL SPVs with NIK from data-area-spv.md
INSERT INTO quick_login_codes (code, role, outlet_code, label, nik) VALUES
  ('SPV001', 'spv', NULL, 'Toni Irawan', '20120100051'),
  ('SPV002', 'spv', NULL, 'Zulkifli', '2022070364'),
  ('SPV003', 'spv', NULL, 'Choirul Amin Nurfauzi', '2021120331');

-- Areas & Outlet Mapping based on data-area-spv.md
INSERT INTO areas (id, name, nik, label, spv_code, outlet_codes) VALUES
  ('area-001', 'Toni Irawan', '20120100051', 'Area 1', 'SPV001', '["B2","B7","B8","B12","B14","B18","B21","B23","B25","B24"]'),
  ('area-002', 'Zulkifli', '2022070364', 'Area 2', 'SPV002', '["B1","B3","B9","B10","B15","B17","B20","B22","B26"]'),
  ('area-003', 'Choirul Amin Nurfauzi', '2021120331', 'Area 3', 'SPV003', '["B4","B5","B6","B11","B13","B16","B19","B27"]');

INSERT INTO outlets_mapped (code, outlet_code, name, area_id) VALUES
  ('02', 'B2', 'Beauty B2', 'area-001'),
  ('07', 'B7', 'Beauty B7', 'area-001'),
  ('08', 'B8', 'Beauty B8', 'area-001'),
  ('12', 'B12', 'Beauty B12', 'area-001'),
  ('14', 'B14', 'Beauty B14', 'area-001'),
  ('18', 'B18', 'Beauty B18', 'area-001'),
  ('21', 'B21', 'Beauty B21', 'area-001'),
  ('23', 'B23', 'Beauty B23', 'area-001'),
  ('25', 'B25', 'Beauty B25', 'area-001'),
  ('24', 'B24', 'Beauty B24', 'area-001'),
  ('01', 'B1', 'Beauty B1', 'area-002'),
  ('03', 'B3', 'Beauty B3', 'area-002'),
  ('09', 'B9', 'Beauty B9', 'area-002'),
  ('10', 'B10', 'Beauty B10', 'area-002'),
  ('15', 'B15', 'Beauty B15', 'area-002'),
  ('17', 'B17', 'Beauty B17', 'area-002'),
  ('20', 'B20', 'Beauty B20', 'area-002'),
  ('22', 'B22', 'Beauty B22', 'area-002'),
  ('26', 'B26', 'Beauty B26', 'area-002'),
  ('04', 'B4', 'Beauty B4', 'area-003'),
  ('05', 'B5', 'Beauty B5', 'area-003'),
  ('06', 'B6', 'Beauty B6', 'area-003'),
  ('11', 'B11', 'Beauty B11', 'area-003'),
  ('13', 'B13', 'Beauty B13', 'area-003'),
  ('16', 'B16', 'Beauty B16', 'area-003'),
  ('19', 'B19', 'Beauty B19', 'area-003'),
  ('27', 'B27', 'Beauty B27', 'area-003');

-- Outlet Codes (Beauty 01–27)
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
  ('26', 'outlet', '26', 'Beauty 26'),
  ('27', 'outlet', '27', 'Beauty 27');

-- 2. SAMPLE VISITS (Empty by default)

