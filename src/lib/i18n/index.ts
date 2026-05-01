export const en = {
  app: { name: 'Duple', tagline: 'Your relationship sidekick' },
  nav: {
    dashboard: 'Dashboard', makanan: 'Food Favorites', 'log-makanan': 'Food Log',
    'date-generator': 'Date Generator', siklus: 'Cycle Tracker', mood: 'Mood Tracker',
    rekomendasi: 'Recommendations', rencana: 'Place Plans', momen: 'Special Moments',
    wishlist: 'Wishlist', trigger: 'Trigger Words', apology: 'Apology Playbook',
    stats: 'Stats & Insights', orang: 'Important People', settings: 'Settings'
  },
  landing: {
    title: 'Your relationship sidekick', start: "Get Started — It's Free",
    sub: 'Open source. No signup required. Data stays on your device.',
    f1t: 'Never forget their favorites', f1d: 'Log their favorite foods, drinks, and comfort meals.',
    f2t: 'Cycle-aware recommendations', f2d: 'Smart reminders when PMS is near, with food suggestions that actually help.',
    f3t: 'What to say when they\'re upset', f3d: 'Trigger word warnings + safe alternatives. Never make it worse again.',
    f4t: '100% local. 100% private.', f4d: 'All data stays on your device. No accounts, no servers, no tracking.',
  },
  common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add', loading: 'Loading...' },
  dashboard: {
    favorites: 'Food Favorites', wishlist: 'Wishlist Plans', gifts: 'Gift Wishlist',
    prediction: 'Next Cycle Prediction', notEnough: 'Not enough data', today: 'Today',
    daysAway: 'days away', recommendations: "Today's Recommendations", todayMood: "Today's Mood",
    noMood: 'No mood today', logMood: 'Log Mood', upcoming: 'Upcoming Moments',
    noUpcoming: 'No upcoming moments', seeAll: 'See All', emergency: '🚨 Emergency Mode: They\'re Upset?'
  },
  settings: {
    appearance: 'Appearance', darkMode: 'Dark Mode', darkDesc: 'Toggle app theme',
    features: 'Features', cycleToggle: 'Cycle Tracker', cycleDesc: 'Cycle tracker, calendar, predictions. Turn off if not needed.',
    cloud: 'Cloud Sync (BYOD)', cloudDesc: 'Use your own free Supabase to sync across devices.',
    backup: 'Backup & Restore', backupDesc: 'Export all data to JSON or import from backup.',
    about: 'About',
  },
};

export const id = {
  app: { name: 'Duple', tagline: 'Your relationship sidekick' },
  nav: {
    dashboard: 'Dashboard', makanan: 'Makanan Favorit', 'log-makanan': 'Log Makanan',
    'date-generator': 'Date Generator', siklus: 'Siklus Haid', mood: 'Mood Tracker',
    rekomendasi: 'Rekomendasi', rencana: 'Rencana Tempat', momen: 'Momen Spesial',
    wishlist: 'Wishlist', trigger: 'Trigger Words', apology: 'Apology Playbook',
    stats: 'Stats & Insights', orang: 'Orang Penting', settings: 'Pengaturan'
  },
  landing: {
    title: 'Your relationship sidekick', start: 'Mulai — Gratis',
    sub: 'Open source. Tanpa daftar. Data aman di perangkat kamu.',
    f1t: 'Gak bakal lupa makanan favoritnya', f1d: 'Catat makanan, minuman, dan comfort food favorit dia.',
    f2t: 'Rekomendasi sadar siklus', f2d: 'Pengingat cerdas saat PMS dekat, lengkap dengan saran makanan.',
    f3t: 'Kata-kata aman saat dia marah', f3d: 'Peringatan trigger words + alternatif yang lebih baik.',
    f4t: '100% lokal. 100% privat.', f4d: 'Semua data di perangkat kamu. Tanpa akun, tanpa server, tanpa tracking.',
  },
  common: { save: 'Simpan', cancel: 'Batal', delete: 'Hapus', edit: 'Edit', add: 'Tambah', loading: 'Memuat...' },
  dashboard: {
    favorites: 'Makanan Favorit', wishlist: 'Rencana Wishlist', gifts: 'Wishlist Hadiah',
    prediction: 'Prediksi Haid Berikutnya', notEnough: 'Belum cukup data', today: 'Hari ini',
    daysAway: 'hari lagi', recommendations: 'Rekomendasi Hari Ini', todayMood: 'Mood Hari Ini',
    noMood: 'Belum ada mood', logMood: 'Catat Mood', upcoming: 'Momen Terdekat',
    noUpcoming: 'Belum ada momen', seeAll: 'Lihat Semua', emergency: '🚨 Mode Darurat: Dia Lagi Ngambek?'
  },
  settings: {
    appearance: 'Tampilan', darkMode: 'Dark Mode', darkDesc: 'Ubah tema aplikasi',
    features: 'Fitur', cycleToggle: 'Siklus Haid Tracker', cycleDesc: 'Kalender siklus, prediksi. Nonaktifkan jika tidak diperlukan.',
    cloud: 'Cloud Sync (BYOD)', cloudDesc: 'Pakai Supabase gratis sendiri buat sinkronisasi.',
    backup: 'Backup & Restore', backupDesc: 'Export data ke JSON atau import dari backup.',
    about: 'Tentang',
  },
};

export type Locale = 'en' | 'id';
export type Translations = typeof en;

let _locale: Locale = $state('en');

export function getLocale(): Locale { return _locale; }
export function setLocale(l: Locale) {
  _locale = l;
  if (typeof localStorage !== 'undefined') localStorage.setItem('duple_locale', l);
}
export function t(): Translations { return _locale === 'en' ? en : id; }
export function loadLocale() {
  if (typeof localStorage !== 'undefined') {
    _locale = (localStorage.getItem('duple_locale') as Locale) || 'en';
  }
}
