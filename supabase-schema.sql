-- ============================================================
-- Beauty Kendari Home Visit — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE visit_status AS ENUM ('draft', 'completed');
CREATE TYPE hasil_temuan_type AS ENUM ('V', 'X');
CREATE TYPE documentation_status AS ENUM ('belum', 'proses', 'selesai');
CREATE TYPE user_role AS ENUM ('spv', 'outlet');
CREATE TYPE ops_sub_item AS ENUM ('produk', 'fasilitas', 'sdm');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Quick Login Codes
CREATE TABLE quick_login_codes (
  code VARCHAR(20) PRIMARY KEY,
  role user_role NOT NULL,
  outlet_code VARCHAR(3),
  label VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Visits (Kunjungan)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_code VARCHAR(3) NOT NULL,
  outlet_name VARCHAR(100) NOT NULL,
  visit_date DATE NOT NULL,
  spv_code VARCHAR(20) NOT NULL,
  divisi VARCHAR(50) DEFAULT 'OPS',
  status visit_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Checklist Items (Item Checklist)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  perspective_no INT NOT NULL,
  perspective_name VARCHAR(200) NOT NULL,
  point_no VARCHAR(10) NOT NULL,
  point_description TEXT NOT NULL,
  hasil_temuan hasil_temuan_type,
  rencana_perbaikan TEXT DEFAULT '',
  deadline DATE,
  support_divisi VARCHAR(100) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Outlet Documentation (Dokumentasi Perbaikan dari Outlet)
CREATE TABLE outlet_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  catatan TEXT DEFAULT '',
  foto_urls JSONB DEFAULT '[]'::jsonb,
  status documentation_status DEFAULT 'belum',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- OPS Kendala (Perspektif 6)
CREATE TABLE ops_kendala (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  sub_item ops_sub_item NOT NULL,
  uraian_temuan TEXT DEFAULT ''
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_visits_outlet_code ON visits(outlet_code);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_visit_date ON visits(visit_date);
CREATE INDEX idx_checklist_items_visit_id ON checklist_items(visit_id);
CREATE INDEX idx_checklist_items_perspective ON checklist_items(perspective_no);
CREATE INDEX idx_outlet_documentation_item ON outlet_documentation(checklist_item_id);
CREATE INDEX idx_ops_kendala_item ON ops_kendala(checklist_item_id);

-- ============================================================
-- 4. TRIGGERS (auto-update updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER outlet_documentation_updated_at
  BEFORE UPDATE ON outlet_documentation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE quick_login_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlet_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_kendala ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (API routes use service role)
-- The anon key is used for initial auth only; all data access goes through API routes with service role

CREATE POLICY "Service role full access" ON quick_login_codes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON visits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON checklist_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON outlet_documentation
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON ops_kendala
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. STORAGE BUCKET (for photo uploads)
-- ============================================================

-- Create the storage bucket for documentation photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentation-photos', 'documentation-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to photos
CREATE POLICY "Public read access for documentation photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentation-photos');

-- Allow authenticated uploads (via service role from API)
CREATE POLICY "Service role upload access for documentation photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentation-photos');

-- Allow service role to delete photos
CREATE POLICY "Service role delete access for documentation photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documentation-photos');
