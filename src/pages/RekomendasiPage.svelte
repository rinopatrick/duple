<script lang="ts">
  import { generateRekomendasi, type RekomendasiResult } from '../lib/engine/rekomendasi';
  import { setRoute } from '../lib/stores/app.svelte';
  import { RefreshCw } from 'lucide-svelte';

  let result: RekomendasiResult | null = $state(null);
  let loading = $state(false);
  let error = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      result = await generateRekomendasi();
    } catch (e) {
      error = 'Gagal generate rekomendasi: ' + String(e);
    }
    loading = false;
  }

  $effect(() => { load(); });

  const FASE_LABELS: Record<string, string> = {
    'normal': 'Normal',
    'pms': 'PMS',
    'haid': 'Haid',
    'ovulasi': 'Ovulasi',
    'unknown': 'Belum Diketahui',
  };

  const MOOD_EMOJI: Record<string, string> = {
    'senang': '😊', 'biasa': '😐', 'kesel': '😤', 'sedih': '😢', 'gaenak': '🤒'
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">💡 Rekomendasi</h1>
      <button onclick={load} class="btn btn-ghost btn-sm" disabled={loading}>
        {#if loading}
          <span class="loading loading-spinner loading-sm"></span>
        {:else}
          <RefreshCw class="w-4 h-4" />
        {/if}
      </button>
  </div>

  {#if loading}
    <div class="flex justify-center py-12"><span class="loading loading-spinner loading-lg"></span></div>
  {:else if error}
    <div class="alert alert-error">{error}</div>
  {:else if result}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">📊 Status Hari Ini</h2>
            <div class="stats stats-vertical shadow">
              <div class="stat">
                <div class="stat-title">Fase Siklus</div>
                <div class="stat-value text-lg">{FASE_LABELS[result.fase] || result.fase}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Mood Hari Ini</div>
                <div class="stat-value text-lg">{MOOD_EMOJI[result.mood_hari_ini] || ''} {result.mood_hari_ini}</div>
              </div>
            </div>
            <div class="alert" class:alert-info={result.fase === 'normal'}
                 class:alert-warning={result.fase === 'pms' || result.fase === 'ovulasi'}
                 class:alert-error={result.fase === 'haid'}>
              <p>{result.saran}</p>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">🎯 Aksi Cepat</h2>
            <div class="flex flex-col gap-2">
              <button onclick={() => setRoute('makanan')} class="btn btn-primary">🍕 Tambah Makanan Favorit</button>
              <button onclick={() => setRoute('mood')} class="btn btn-secondary">😊 Catat Mood</button>
              <button onclick={() => setRoute('siklus')} class="btn btn-accent">🩸 Update Siklus</button>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">🍕 Rekomendasi Makanan</h2>
            {#if result.makanan.length > 0}
              <div class="space-y-2">
                {#each result.makanan as item, i}
                  <div class="flex items-center gap-3 p-2 rounded-lg bg-base-200">
                    <span class="badge badge-primary">{i + 1}</span>
                    <div>
                      <p class="font-medium">{item.nama}</p>
                      <p class="text-xs text-base-content/50">{item.kategori} — Rating: {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-base-content/50">Belum ada data makanan favorit. <button class="link" onclick={() => setRoute('makanan')}>Tambahin dulu</button></p>
            {/if}
          </div>
        </div>

        {#if result.warnings.length > 0}
          <div class="card bg-error/10 shadow border border-error/30">
            <div class="card-body">
              <h2 class="card-title text-error">⚠️ Pantangan / Trigger Words</h2>
              <p class="text-sm text-error/70 mb-2">Hindari kata-kata ini!</p>
              <div class="space-y-2">
                {#each result.warnings as w}
                  <div class="p-2 rounded bg-error/5">
                    <p class="text-sm text-error">❌ "{w.kata_kalimat_jangan}"</p>
                    {#if w.alternatif_aman}
                      <p class="text-sm text-success">✅ "{w.alternatif_aman}"</p>
                    {/if}
                    {#if w.konteks}
                      <p class="text-xs text-base-content/50">Konteks: {w.konteks}</p>
                    {/if}
                  </div>
                {/each}
              </div>
              <button onclick={() => setRoute('trigger')} class="btn btn-sm btn-ghost mt-2">Kelola Trigger Words</button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
