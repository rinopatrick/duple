export const SCHEMA = `
CREATE TABLE IF NOT EXISTS makanan_favorit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'makanan',
  rating INTEGER DEFAULT 3,
  mood_tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS log_makanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL,
  waktu TEXT NOT NULL,
  makanan TEXT NOT NULL,
  mood_sebelum TEXT DEFAULT '',
  mood_sesudah TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS siklus_haid (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tgl_mulai TEXT NOT NULL,
  tgl_selesai TEXT NOT NULL,
  flow_intensity INTEGER DEFAULT 3,
  symptoms TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS mood_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL,
  waktu TEXT NOT NULL,
  mood TEXT NOT NULL,
  trigger_penyebab TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS rencana_tempat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kategori TEXT DEFAULT 'kuliner',
  lokasi TEXT DEFAULT '',
  maps_url TEXT DEFAULT '',
  status TEXT DEFAULT 'wishlist',
  estimasi_biaya INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS momen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  kategori TEXT DEFAULT 'date',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS wishlist_hadiah (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_barang TEXT NOT NULL,
  harga_estimasi INTEGER DEFAULT 0,
  status TEXT DEFAULT 'belum_dibeli',
  occasion TEXT DEFAULT 'random',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS ukuran_pasangan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori TEXT NOT NULL,
  ukuran TEXT NOT NULL,
  brand_favorit TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS trigger_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori TEXT DEFAULT 'umum',
  kata_kalimat_jangan TEXT NOT NULL,
  konteks TEXT DEFAULT '',
  alternatif_aman TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS orang_penting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  relasi TEXT DEFAULT '',
  role TEXT DEFAULT 'teman',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);
`;

export const TABLES = [
  'makanan_favorit', 'log_makanan', 'siklus_haid', 'mood_log',
  'rencana_tempat', 'momen', 'wishlist_hadiah', 'ukuran_pasangan',
  'trigger_words', 'orang_penting', 'settings'
];
