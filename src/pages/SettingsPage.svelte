<script lang="ts">
  import { getSetting, setSetting } from '../lib/db/settings';
  import { getTheme, setTheme, getFeature, setFeature, loadFeatures, isDesktop } from '../lib/stores/app.svelte';
  import { setLocale, getLocale, tr, type Locale } from '../lib/i18n';
  import { initSync, pushAllToCloud, isSyncEnabled, checkSyncStatus, signInWithOAuth, signOut, getSession } from '../lib/sync/supabase';
  import { getAllMakanan, getAllLogMakanan, getAllSiklus, getAllMoodLogs, getAllRencana, getAllMomen, getAllWishlist, getAllUkuran, getAllTriggerWords, getAllOrang } from '../lib/db';
  import { importTable } from '../lib/db/core';
  import { isPinEnabled, setPin, removePin } from '../lib/stores/pin.svelte';
  import { Sun, Moon, Database, Cloud, Upload, Download, Check, LogIn, LogOut, Lock, Unlock } from 'lucide-svelte';

  let locale = $derived(getLocale());
  let theme = $derived(getTheme());
  const LANG_NAMES: Record<string, string> = { en: 'English', id: 'Bahasa Indonesia', es: 'Español', fr: 'Français', pt: 'Português', jp: '日本語' };
  let supabaseUrl = $state('');
  let supabaseKey = $state('');
  let syncEnabled = $state(false);
  let syncStatus = $state('');
  let syncing = $state(false);
  let exporting = $state(false);
  let importing = $state(false);
  let authUser = $state(null as string | null);
  let pinEnabled = $state(isPinEnabled());
  let newPin = $state('');

  const MIGRATION_SQL_URL = 'https://raw.githubusercontent.com/rinopatrick/duple/master/supabase_migration.sql';

  $effect(() => { loadSettings(); loadFeatures(); });

  async function loadSettings() {
    const url = await getSetting('supabase_url');
    const key = await getSetting('supabase_key');
    if (url) supabaseUrl = url;
    if (key) supabaseKey = key;
    syncEnabled = await isSyncEnabled();
    authUser = getSession()?.user?.email || null;
  }

  async function saveSupabaseConfig() {
    await setSetting('supabase_url', supabaseUrl);
    await setSetting('supabase_key', supabaseKey);
    const ok = await initSync();
    if (ok) {
      syncEnabled = true;
      syncStatus = tr().settings.syncOk;
    } else {
      syncEnabled = false;
      syncStatus = tr().settings.syncFail;
    }
  }

  async function handleSync() {
    syncing = true;
    syncStatus = tr().settings.syncing;
    const result = await pushAllToCloud();
    syncStatus = result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
    syncing = false;
  }

  async function handleLogin() {
    const err = await signInWithOAuth();
    if (err) syncStatus = `❌ ${err}`;
  }

  async function handleLogout() {
    await signOut();
    authUser = null;
    syncEnabled = false;
    syncStatus = 'Signed out';
  }

  function handleSetPin() {
    if (newPin.length >= 4) {
      setPin(newPin);
      pinEnabled = true;
      newPin = '';
    }
  }

  function handleRemovePin() {
    removePin();
    pinEnabled = false;
    newPin = '';
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
      syncStatus = tr().settings.exportOk;
    } catch (e) {
      syncStatus = tr().settings.exportFail;
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
        if (!backup.data) throw new Error('Invalid backup format');

        const tables: Record<string, string> = {
          makanan_favorit: 'makanan_favorit',
          log_makanan: 'log_makanan',
          siklus_haid: 'siklus_haid',
          mood_log: 'mood_log',
          rencana_tempat: 'rencana_tempat',
          momen: 'momen',
          wishlist_hadiah: 'wishlist_hadiah',
          ukuran_pasangan: 'ukuran_pasangan',
          trigger_words: 'trigger_words',
          orang_penting: 'orang_penting',
        };

        let imported = 0;
        for (const [key, tableName] of Object.entries(tables)) {
          const rows = backup.data[key];
          if (rows && rows.length > 0) {
            await importTable(tableName, rows);
            imported += rows.length;
          }
        }

        syncStatus = `✅ Imported ${imported} records from backup`;
      } catch (ex) {
        syncStatus = `❌ Import failed: ${String(ex)}`;
      }
      importing = false;
    };
    input.click();
  }
</script>

<div class="space-y-6 max-w-2xl">
  <h1 class="text-2xl font-bold">{tr().settings.heading}</h1>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2">
        {#if theme === 'light'}<Sun class="w-5 h-5" />{:else}<Moon class="w-5 h-5" />{/if}
        {tr().settings.appearance}
      </h2>
      <div class="flex items-center justify-between mt-2">
        <div>
          <p class="font-medium">{tr().settings.darkMode}</p>
          <p class="text-sm text-base-content/50">{tr().settings.darkDesc}</p>
        </div>
        <input type="checkbox" class="toggle toggle-primary" checked={theme === 'dark'}
               onchange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      </div>
      <div class="flex items-center justify-between mt-3">
        <div>
          <p class="font-medium">{tr().settings.languageLabel}</p>
           <p class="text-sm text-base-content/50">{LANG_NAMES[locale] || locale.toUpperCase()}</p>
        </div>
         <select class="select text-sm w-auto" value={locale}
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
      <h2 class="card-title flex items-center gap-2">{tr().settings.features}</h2>
      <p class="text-sm text-base-content/50 mb-2">{tr().settings.featureDesc}</p>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">{tr().settings.cycleToggle}</p>
            <p class="text-xs text-base-content/50">{tr().settings.cycleDesc}</p>
          </div>
          <input type="checkbox" class="toggle-lg" checked={getFeature('siklus')}
                 onchange={() => setFeature('siklus', !getFeature('siklus'))} />
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Cloud class="w-5 h-5" /> {tr().settings.cloud}</h2>
      <p class="text-sm text-base-content/50 mb-3">
        {tr().settings.cloudDesc}
      </p>

      <ol class="text-sm text-base-content/70 space-y-2 mb-4 ml-4 list-decimal">
        <li>{tr().settings.cloudSteps[0]}</li>
        <li>{tr().settings.cloudSteps[1]}</li>
        <li>{tr().settings.cloudSteps[2]}</li>
        <li>{tr().settings.cloudSteps[3]}</li>
      </ol>

      <div class="space-y-3">
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().settings.supabaseUrl}</span></label>
          <input type="url" class="input input-bordered font-mono text-xs" bind:value={supabaseUrl}
                 placeholder="https://xxxxxxxx.supabase.co" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().settings.supabaseKey}</span></label>
          <input type="password" class="input input-bordered font-mono text-xs" bind:value={supabaseKey}
                 placeholder="eyJhbGci..." />
        </div>
        <div class="flex gap-2">
          <button onclick={saveSupabaseConfig} class="btn btn-primary btn-sm">
            <Check class="w-4 h-4" /> {tr().settings.saveConnect}
          </button>
          <button onclick={handleSync} class="btn btn-secondary btn-sm" disabled={!syncEnabled || syncing}>
            {#if syncing}
              <span class="loading loading-spinner loading-sm"></span> {tr().settings.syncing}
            {:else}
              <Upload class="w-4 h-4" /> {tr().settings.syncNow}
            {/if}
          </button>
        </div>
        {#if syncStatus}
          <div class="text-sm mt-2">{syncStatus}</div>
        {/if}

        {#if syncEnabled && supabaseUrl}
          <div class="divider text-xs text-base-content/50 mt-3 mb-1">{tr().settings.orDivider}</div>
          {#if authUser}
            <div class="flex items-center justify-between gap-2 p-2 bg-base-200 rounded-lg">
              <span class="text-xs text-base-content/70">👤 {authUser}</span>
              <button onclick={handleLogout} class="btn btn-ghost btn-xs text-error">
                <LogOut class="w-3.5 h-3.5" /> {tr().settings.signOut}
              </button>
        </div>
        <div class="flex items-center justify-between mt-3">
          <div>
            <p class="font-medium">🔐 App Lock (PIN)</p>
            <p class="text-xs text-base-content/50">Lock the app with a PIN on startup.</p>
          </div>
          {#if pinEnabled}
            <div class="flex gap-1">
              <button onclick={handleRemovePin} class="btn btn-ghost btn-sm text-error">
                <Unlock class="w-4 h-4" /> Disable
              </button>
            </div>
          {:else}
            <div class="flex items-center gap-1">
              <input type="password" inputmode="numeric" maxlength="6" class="input input-bordered input-sm w-20 text-center" bind:value={newPin} placeholder="PIN" />
              <button onclick={handleSetPin} class="btn btn-primary btn-sm" disabled={newPin.length < 4}>
                <Lock class="w-4 h-4" /> Set
              </button>
            </div>
          {/if}
        </div>
          {:else}
            <button onclick={handleLogin} class="btn btn-outline btn-sm w-full gap-2">
              <LogIn class="w-4 h-4" /> {tr().settings.oauthLogin}
            </button>
            <p class="text-xs text-base-content/50 mt-1">{tr().settings.oauthDesc}</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Download class="w-5 h-5" /> {tr().settings.backup}</h2>
      <p class="text-sm text-base-content/50 mb-2">{tr().settings.backupDesc}</p>
      <div class="flex gap-2">
        <button onclick={exportData} class="btn btn-outline btn-sm" disabled={exporting}>
          <Download class="w-4 h-4" /> {tr().settings.exportBackup}
        </button>
        <button onclick={importData} class="btn btn-outline btn-sm" disabled={importing}>
          <Upload class="w-4 h-4" /> {tr().settings.importBackup}
        </button>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title flex items-center gap-2"><Database class="w-5 h-5" /> {tr().settings.data}</h2>
      <p class="text-sm text-base-content/50">{tr().settings.dataDesc}</p>
      <div class="stats shadow mt-3">
        <div class="stat">
          <div class="stat-title">{tr().settings.mode}</div>
          <div class="stat-value text-sm font-mono">{isDesktop() ? tr().settings.modeDesktop : tr().settings.modeBrowser}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title">{tr().settings.about}</h2>
      <div class="text-sm space-y-1">
        <p><strong>{tr().app.name}</strong> v0.1.0</p>
        <p>{tr().app.tagline}</p>
        <p class="text-base-content/50">🦀 Tauri + ⚡ Svelte + 🎨 TailwindCSS + ☁️ Supabase</p>
      </div>
    </div>
  </div>
</div>
