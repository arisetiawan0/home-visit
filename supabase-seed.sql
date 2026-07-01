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
-- 2. SAMPLE VISITS (Empty by default)
-- ============================================================

