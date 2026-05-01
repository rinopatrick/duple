-- ============================================
-- Duple — Supabase Migration SQL
-- Copy & paste ke Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS makanan_favorit (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'makanan',
  rating INTEGER DEFAULT 3,
  mood_tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_makanan (
  id SERIAL PRIMARY KEY,
  tanggal TEXT NOT NULL,
  waktu TEXT NOT NULL,
  makanan TEXT NOT NULL,
  mood_sebelum TEXT DEFAULT '',
  mood_sesudah TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS siklus_haid (
  id SERIAL PRIMARY KEY,
  tgl_mulai TEXT NOT NULL,
  tgl_selesai TEXT NOT NULL,
  flow_intensity INTEGER DEFAULT 3,
  symptoms TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_log (
  id SERIAL PRIMARY KEY,
  tanggal TEXT NOT NULL,
  waktu TEXT NOT NULL,
  mood TEXT NOT NULL,
  trigger_penyebab TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rencana_tempat (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT DEFAULT 'kuliner',
  lokasi TEXT DEFAULT '',
  maps_url TEXT DEFAULT '',
  status TEXT DEFAULT 'wishlist',
  estimasi_biaya INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS momen (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  kategori TEXT DEFAULT 'date',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_hadiah (
  id SERIAL PRIMARY KEY,
  nama_barang TEXT NOT NULL,
  harga_estimasi INTEGER DEFAULT 0,
  status TEXT DEFAULT 'belum_dibeli',
  occasion TEXT DEFAULT 'random',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ukuran_pasangan (
  id SERIAL PRIMARY KEY,
  kategori TEXT NOT NULL,
  ukuran TEXT NOT NULL,
  brand_favorit TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trigger_words (
  id SERIAL PRIMARY KEY,
  kategori TEXT DEFAULT 'umum',
  kata_kalimat_jangan TEXT NOT NULL,
  konteks TEXT DEFAULT '',
  alternatif_aman TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orang_penting (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  relasi TEXT DEFAULT '',
  role TEXT DEFAULT 'teman',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE makanan_favorit ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_makanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE siklus_haid ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rencana_tempat ENABLE ROW LEVEL SECURITY;
ALTER TABLE momen ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_hadiah ENABLE ROW LEVEL SECURITY;
ALTER TABLE ukuran_pasangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE orang_penting ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations with anon key (simplest BYOD setup)
CREATE POLICY "Allow all" ON makanan_favorit FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON log_makanan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON siklus_haid FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON mood_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON rencana_tempat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON momen FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON wishlist_hadiah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ukuran_pasangan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON trigger_words FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON orang_penting FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Drop the tables if re-running
-- DROP TABLE IF EXISTS ... CASCADE;
