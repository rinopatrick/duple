<script lang="ts">
  import { getTheme, setTheme } from '../lib/stores/app.svelte';
  import { Sun, Moon, Database, Cloud } from 'lucide-svelte';

  let theme = $derived(getTheme());
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
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Database class="w-5 h-5" /> Data</h2>
      <p class="text-sm text-base-content/50">Data disimpan secara lokal di laptop kamu menggunakan SQLite. Tidak ada data yang dikirim ke server.</p>
      <div class="stats shadow mt-3">
        <div class="stat">
          <div class="stat-title">Lokasi Database</div>
          <div class="stat-value text-xs font-mono">%APPDATA%/com.pacarcenter.app/pacarcenter.db</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Cloud class="w-5 h-5" /> Cloud Sync</h2>
      <p class="text-sm text-base-content/50 mb-3">Sinkronisasi cloud akan tersedia di versi berikutnya. Dengan fitur ini, kamu bisa setup Supabase gratis milik sendiri buat sync data antar device.</p>
      <div class="alert">
        <p class="text-sm">🔜 Coming soon: Bring Your Own Database (BYOD) dengan Supabase</p>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title">ℹ️ Tentang</h2>
      <div class="text-sm space-y-1">
        <p><strong>Duple</strong> v0.1.0</p>
        <p>Your relationship sidekick — track, remember, and care better.</p>
      </div>
      <div class="mt-3 space-y-1 text-sm text-base-content/50">
        <p>🔒 100% data lokal — data aman di laptop kamu sendiri</p>
        <p>🆓 Gratis selamanya — open source</p>
        <p>🦀 Dibangun dengan Tauri + Svelte + TailwindCSS</p>
      </div>
    </div>
  </div>
</div>
