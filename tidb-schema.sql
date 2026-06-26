-- ============================================================
-- Beauty Kendari Home Visit — TiDB Database Schema
-- ============================================================

-- Clean reset (child tables first)
DROP TABLE IF EXISTS ops_kendala;
DROP TABLE IF EXISTS outlet_documentation;
DROP TABLE IF EXISTS checklist_items;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS quick_login_codes;

-- 1. Tables

-- Quick Login Codes
CREATE TABLE quick_login_codes (
  code VARCHAR(20) PRIMARY KEY,
  role ENUM('spv', 'outlet') NOT NULL,
  outlet_code VARCHAR(3),
  label VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits (Kunjungan)
CREATE TABLE visits (
  id VARCHAR(36) PRIMARY KEY,
  outlet_code VARCHAR(3) NOT NULL,
  outlet_name VARCHAR(100) NOT NULL,
  visit_date DATE NOT NULL,
  spv_code VARCHAR(20) NOT NULL,
  divisi VARCHAR(50) DEFAULT 'OPS',
  status ENUM('draft', 'completed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Checklist Items (Item Checklist)
CREATE TABLE checklist_items (
  id VARCHAR(36) PRIMARY KEY,
  visit_id VARCHAR(36) NOT NULL,
  perspective_no INT NOT NULL,
  perspective_name VARCHAR(200) NOT NULL,
  point_no VARCHAR(10) NOT NULL,
  point_description TEXT NOT NULL,
  hasil_temuan ENUM('V', 'X'),
  rencana_perbaikan TEXT,
  deadline DATE,
  support_divisi VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);

-- Outlet Documentation (Dokumentasi Perbaikan dari Outlet)
CREATE TABLE outlet_documentation (
  id VARCHAR(36) PRIMARY KEY,
  checklist_item_id VARCHAR(36) NOT NULL,
  catatan TEXT,
  foto_urls JSON,
  status ENUM('belum', 'proses', 'selesai') DEFAULT 'belum',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id) ON DELETE CASCADE
);

-- OPS Kendala (Perspektif 6)
CREATE TABLE ops_kendala (
  id VARCHAR(36) PRIMARY KEY,
  checklist_item_id VARCHAR(36) NOT NULL,
  sub_item ENUM('produk', 'fasilitas', 'sdm') NOT NULL,
  uraian_temuan TEXT,
  FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id) ON DELETE CASCADE
);

-- 2. Indexes
CREATE INDEX idx_visits_outlet_code ON visits(outlet_code);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_visit_date ON visits(visit_date);
CREATE INDEX idx_checklist_items_visit_id ON checklist_items(visit_id);
CREATE INDEX idx_checklist_items_perspective ON checklist_items(perspective_no);
CREATE INDEX idx_outlet_documentation_item ON outlet_documentation(checklist_item_id);
CREATE INDEX idx_ops_kendala_item ON ops_kendala(checklist_item_id);
