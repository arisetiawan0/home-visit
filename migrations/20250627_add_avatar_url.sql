-- Tambahkan kolom avatar_url ke tabel quick_login_codes untuk foto profil SPV/outlet
ALTER TABLE quick_login_codes
  ADD COLUMN avatar_url VARCHAR(512) NULL
  AFTER nik;
