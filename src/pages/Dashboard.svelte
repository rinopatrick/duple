<script lang="ts">
  import { setRoute } from '../lib/stores/app.svelte';
  import { getAllMakanan, getAllRencana, getUpcomingMomen, getAllWishlist } from '../lib/db';
  import { getLastSiklus } from '../lib/db/siklus';
  import { getAllMoodLogs } from '../lib/db/mood';
  import { generateRekomendasi, type RekomendasiResult } from '../lib/engine/rekomendasi';
  import type { MakananFavorit } from '../lib/db/makanan';
  import type { RencanaTempat } from '../lib/db/rencana';
  import type { Momen } from '../lib/db/momen';
  import type { WishlistHadiah } from '../lib/db/wishlist';
  import type { SiklusHaid } from '../lib/db/siklus';
  import type { MoodLog } from '../lib/db/mood';
  import { formatDate, today, daysBetween } from '../lib/utils/date';
  import dayjs from 'dayjs';
  import { Heart } from 'lucide-svelte';

  let makananCount = $state(0);
  let rencanaWishlist = $state(0);
  let upcomingMomens: Momen[] = $state([]);
  let wishlistActive = $state(0);
  let lastSiklus: SiklusHaid[] = $state([]);
  let moodToday: MoodLog | null = $state(null);
  let rekomendasi: RekomendasiResult | null = $state(null);
  let loaded = $state(false);

  $effect(() => {
    loadDashboard();
  });

  async function loadDashboard() {
    const [makanan, rencana, momens, wishlists, siklus, moods, rec] = await Promise.all([
      getAllMakanan(),
      getAllRencana(),
      getUpcomingMomen(3),
      getAllWishlist(),
      getLastSiklus(3),
      getAllMoodLogs(today()),
      generateRekomendasi(),
    ]);
    makananCount = makanan.length;
    rencanaWishlist = rencana.filter(r => r.status === 'wishlist').length;
    upcomingMomens = momens;
    wishlistActive = wishlists.filter(w => w.status === 'belum_dibeli').length;
    lastSiklus = siklus;
    moodToday = moods.length > 0 ? moods[moods.length - 1] : null;
    rekomendasi = rec;
    loaded = true;
  }

  const MOOD_EMOJI: Record<string, string> = {
    'senang': '😊',
    'biasa': '😐',
    'kesel': '😤',
    'sedih': '😢',
    'gaenak': '🤒',
  };

  function prediksiSiklus(): string {
    if (lastSiklus.length < 2) return 'Belum cukup data';
    const cycles: number[] = [];
    for (let i = 0; i < lastSiklus.length - 1; i++) {
      const d = dayjs(lastSiklus[i].tgl_mulai).diff(dayjs(lastSiklus[i + 1].tgl_mulai), 'day');
      if (d > 0) cycles.push(d);
    }
    const avg = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    const lastStart = dayjs(lastSiklus[0].tgl_mulai);
    const next = lastStart.add(avg, 'day');
    const daysLeft = next.diff(dayjs(), 'day');
    if (daysLeft < 0) return 'Sedang/sudah lewat';
    if (daysLeft === 0) return 'Hari ini';
    return `${daysLeft} hari lagi (${next.format('DD MMM')})`;
  }
</script>

{#if !loaded}
  <div class="flex items-center justify-center h-64">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else}
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <Heart class="w-8 h-8 text-error" />
      <h1 class="text-2xl font-bold">Dashboard</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="text-sm text-base-content/60">Makanan Favorit</h3>
          <p class="text-3xl font-bold text-primary">{makananCount}</p>
          <button onclick={() => setRoute('makanan')} class="btn btn-sm btn-ghost mt-2">Lihat</button>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="text-sm text-base-content/60">Rencana Wishlist</h3>
          <p class="text-3xl font-bold text-secondary">{rencanaWishlist}</p>
          <button onclick={() => setRoute('rencana')} class="btn btn-sm btn-ghost mt-2">Lihat</button>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="text-sm text-base-content/60">Wishlist Hadiah</h3>
          <p class="text-3xl font-bold text-accent">{wishlistActive}</p>
          <button onclick={() => setRoute('wishlist')} class="btn btn-sm btn-ghost mt-2">Lihat</button>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="text-sm text-base-content/60">Prediksi Haid Berikutnya</h3>
          <p class="text-2xl font-bold text-error">{prediksiSiklus()}</p>
          <button onclick={() => setRoute('siklus')} class="btn btn-sm btn-ghost mt-2">Lihat</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card bg-base-100 shadow lg:col-span-2">
        <div class="card-body">
          <h2 class="card-title">💡 Rekomendasi Hari Ini</h2>
          {#if rekomendasi}
            <div class="alert" class:alert-info={rekomendasi.fase === 'normal'}
                 class:alert-warning={rekomendasi.fase === 'pms'}
                 class:alert-error={rekomendasi.fase === 'haid'}>
              <p class="font-medium">{rekomendasi.saran}</p>
            </div>
            {#if rekomendasi.makanan.length > 0}
              <div class="mt-3">
                <p class="font-medium mb-2">Rekomendasi Makanan:</p>
                <div class="flex flex-wrap gap-2">
                  {#each rekomendasi.makanan.slice(0, 5) as m}
                    <span class="badge badge-primary badge-lg">{m.nama}</span>
                  {/each}
                </div>
              </div>
            {/if}
            {#if rekomendasi.warnings.length > 0}
              <div class="mt-3">
                <p class="font-medium text-error mb-2">⚠️ Hindari:</p>
                <div class="space-y-1">
                  {#each rekomendasi.warnings.slice(0, 3) as w}
                    <p class="text-sm text-error">
                      ❌ "{w.kata_kalimat_jangan}" → ✅ "{w.alternatif_aman || 'Diam aja dulu'}"
                    </p>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <div class="space-y-4">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">😊 Mood Hari Ini</h2>
            {#if moodToday}
              <p class="text-3xl text-center">{MOOD_EMOJI[moodToday.mood] || '😐'}</p>
              <p class="text-center font-medium capitalize">{moodToday.mood}</p>
              {#if moodToday.trigger_penyebab}
                <p class="text-xs text-base-content/50">Trigger: {moodToday.trigger_penyebab}</p>
              {/if}
            {:else}
              <p class="text-base-content/50 text-center">Belum ada mood hari ini</p>
            {/if}
            <button onclick={() => setRoute('mood')} class="btn btn-sm btn-ghost mt-2">Catat Mood</button>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">📅 Momen Terdekat</h2>
            {#if upcomingMomens.length > 0}
              <div class="space-y-2">
                {#each upcomingMomens as m}
                  <div class="flex justify-between items-center">
                    <span class="text-sm">{m.nama}</span>
                    <span class="badge badge-sm">{formatDate(m.tanggal, 'DD MMM')}</span>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-base-content/50 text-sm">Belum ada momen terdekat</p>
            {/if}
            <button onclick={() => setRoute('momen')} class="btn btn-sm btn-ghost mt-2">Lihat Semua</button>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-8">
      <button onclick={() => setRoute('rekomendasi')} class="btn btn-primary btn-lg">
        🚨 Mode Darurat: Dia Lagi Ngambek?
      </button>
    </div>
  </div>
{/if}
