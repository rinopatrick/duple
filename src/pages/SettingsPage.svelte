<script lang="ts">
  import { getSetting, setSetting } from '../lib/db/settings';
  import { getTheme, setTheme, getFeature, setFeature, loadFeatures } from '../lib/stores/app.svelte';
  import { getLocale, setLocale, t, type Locale } from '../lib/i18n';
  import { initSync, pushAllToCloud, isSyncEnabled, checkSyncStatus } from '../lib/sync/supabase';
  import { getAllMakanan, getAllLogMakanan, getAllSiklus, getAllMoodLogs, getAllRencana, getAllMomen, getAllWishlist, getAllUkuran, getAllTriggerWords, getAllOrang } from '../lib/db';
  import { Sun, Moon, Database, Cloud, CloudOff, Upload, Download, Check } from 'lucide-svelte';

  let theme = $derived(getTheme());
  let supabaseUrl = $state('');
  let supabaseKey = $state('');
  let syncEnabled = $state(false);
  let syncStatus = $state('');
  let syncing = $state(false);
  let exporting = $state(false);
  let importing = $state(false);

  const MIGRATION_SQL_URL = 'https://raw.githubusercontent.com/rinopatrick/duple/master/supabase_migration.sql';

  $effect(() => { loadSettings(); loadFeatures(); });

  async function loadSettings() {
    const url = await getSetting('supabase_url');
    const key = await getSetting('supabase_key');
    if (url) supabaseUrl = url;
    if (key) supabaseKey = key;
    syncEnabled = await isSyncEnabled();
  }

  async function saveSupabaseConfig() {
    await setSetting('supabase_url', supabaseUrl);
    await setSetting('supabase_key', supabaseKey);
    const ok = await initSync();
    if (ok) {
      syncEnabled = true;
      syncStatus = '✅ Connected to Supabase';
    } else {
      syncEnabled = false;
      syncStatus = '❌ Connection failed — check URL & anon key';
    }
  }

  async function handleSync() {
    syncing = true;
    syncStatus = 'Syncing...';
    const result = await pushAllToCloud();
    syncStatus = result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
    syncing = false;
  }

  async function exportData() {
    exporting = true;
    try {
      const [makanan, log, siklus, mood, rencana, momen, wishlist, ukuran, trigger, orang] =
        await Promise.all([
          getAllMakanan(), getAllLogMakanan(), getAllSiklus(), getAllMoodLogs(''),
          getAllRencana(), getAllMomen(), getAllWishlist(), getAllUkuran(),
          getAllTriggerWords(), getAllOrang()
        ]);

      const backup = {
        version: '0.1.0',
        date: new Date().toISOString(),
        data: { makanan_favorit: makanan, log_makanan: log, siklus_haid: siklus, mood_log: mood,
                rencana_tempat: rencana, momen, wishlist_hadiah: wishlist, ukuran_pasangan: ukuran,
                trigger_words: trigger, orang_penting: orang }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `duple-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      syncStatus = '📦 Backup downloaded';
    } catch (e) {
      syncStatus = '❌ Export failed';
    }
    exporting = false;
  }

  async function importData() {
    importing = true;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0];
        const text = await file.text();
        const backup = JSON.parse(text);
        syncStatus = '✅ Imported! (restore will be available in next update)';
      } catch (ex) {
        syncStatus = '❌ Invalid backup file';
      }
      importing = false;
    };
    input.click();
  }
</script>

<div class="space-y-6 max-w-2xl">
  <h1 class="text-2xl font-bold">⚙️ Settings</h1>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2">
        {#if theme === 'light'}<Sun class="w-5 h-5" />{:else}<Moon class="w-5 h-5" />{/if}
        Tampilan
      </h2>
      <div class="flex items-center justify-between mt-2">
        <div>
          <p class="font-medium">Dark Mode</p>
          <p class="text-sm text-base-content/50">Ubah tema aplikasi</p>
        </div>
        <input type="checkbox" class="toggle toggle-primary" checked={theme === 'dark'}
               onchange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      </div>
      <div class="flex items-center justify-between mt-3">
        <div>
          <p class="font-medium">🌐 Language / Bahasa</p>
          <p class="text-sm text-base-content/50">{getLocale() === 'en' ? 'English' : 'Bahasa Indonesia'}</p>
        </div>
        <select class="select text-sm w-auto" value={getLocale()}
                onchange={(e: any) => setLocale(e.target.value)}>
          <option value="en">English</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="pt">Português</option>
          <option value="jp">日本語</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2">🔧 Fitur</h2>
      <p class="text-sm text-base-content/50 mb-2">Aktifkan/nonaktifkan fitur sesuai kebutuhan.</p>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">🩸 Siklus Haid Tracker</p>
            <p class="text-xs text-base-content/50">Kalender siklus haid, daily log, prediksi. Nonaktifkan jika tidak diperlukan.</p>
          </div>
          <input type="checkbox" class="toggle-lg" checked={getFeature('siklus')}
                 onchange={() => setFeature('siklus', !getFeature('siklus'))} />
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Cloud class="w-5 h-5" /> Cloud Sync (BYOD)</h2>
      <p class="text-sm text-base-content/50 mb-3">
        Pakai Supabase gratis kamu sendiri untuk sinkronisasi antar device.
        <a href="https://supabase.com" target="_blank" rel="noopener" class="link">Buat akun gratis</a> → copy URL + anon key → paste di sini.
      </p>

      <ol class="text-sm text-base-content/70 space-y-2 mb-4 ml-4 list-decimal">
        <li>Buat akun dan project baru di <a href="https://supabase.com" target="_blank" rel="noopener" class="link">supabase.com</a> (gratis)</li>
        <li>Buka <strong>SQL Editor</strong> → copy-paste <a href={MIGRATION_SQL_URL} target="_blank" rel="noopener" class="link">migration SQL ini</a> → Run</li>
        <li>Buka <strong>Project Settings → API</strong> → copy Project URL & anon key</li>
        <li>Paste di bawah → Save → Sync</li>
      </ol>

      <div class="space-y-3">
        <div class="form-control">
          <label class="label"><span class="label-text">Supabase Project URL</span></label>
          <input type="url" class="input input-bordered font-mono text-xs" bind:value={supabaseUrl}
                 placeholder="https://xxxxxxxx.supabase.co" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Anon Key</span></label>
          <input type="password" class="input input-bordered font-mono text-xs" bind:value={supabaseKey}
                 placeholder="eyJhbGci..." />
        </div>
        <div class="flex gap-2">
          <button onclick={saveSupabaseConfig} class="btn btn-primary btn-sm">
            <Check class="w-4 h-4" /> Save & Connect
          </button>
          <button onclick={handleSync} class="btn btn-secondary btn-sm" disabled={!syncEnabled || syncing}>
            {#if syncing}
              <span class="loading loading-spinner loading-sm"></span> Syncing...
            {:else}
              <Upload class="w-4 h-4" /> Sync Now
            {/if}
          </button>
        </div>
        {#if syncStatus}
          <div class="text-sm mt-2">{syncStatus}</div>
        {/if}
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Download class="w-5 h-5" /> Backup & Restore</h2>
      <p class="text-sm text-base-content/50 mb-2">Export semua data ke file JSON atau import dari backup sebelumnya.</p>
      <div class="flex gap-2">
        <button onclick={exportData} class="btn btn-outline btn-sm" disabled={exporting}>
          <Download class="w-4 h-4" /> Export Backup
        </button>
        <button onclick={importData} class="btn btn-outline btn-sm" disabled={importing}>
          <Upload class="w-4 h-4" /> Import Backup
        </button>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Database class="w-5 h-5" /> Data</h2>
      <p class="text-sm text-base-content/50">Data disimpan secara lokal. Desktop: SQLite, Browser: IndexedDB.</p>
      <div class="stats shadow mt-3">
        <div class="stat">
          <div class="stat-title">Mode</div>
          <div class="stat-value text-sm font-mono">{typeof window !== 'undefined' && '__TAURI_INTERNALS__' in (window as any) ? 'Desktop (SQLite)' : 'Browser (IndexedDB)'}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title">ℹ️ Tentang</h2>
      <div class="text-sm space-y-1">
        <p><strong>Duple</strong> v0.1.0</p>
        <p>Your relationship sidekick — track, remember, and care better.</p>
        <p class="text-base-content/50">🦀 Tauri + ⚡ Svelte + 🎨 TailwindCSS + ☁️ Supabase</p>
      </div>
    </div>
  </div>
</div>
