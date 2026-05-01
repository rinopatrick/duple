<script lang="ts">
  import { getAllTriggerWords, type TriggerWord } from '../lib/db/trigger';
  import { generateRekomendasi } from '../lib/engine/rekomendasi';
  import { setRoute } from '../lib/stores/app.svelte';

  let triggers: TriggerWord[] = $state([]);
  let activeScenario = $state<'pms' | 'ngambek' | 'takut' | 'random'>('ngambek');
  let loaded = $state(false);

  $effect(() => { load(); });

  async function load() {
    triggers = await getAllTriggerWords();
    loaded = true;
  }

  const SCENARIOS = [
    { key: 'ngambek' as const, emoji: '😤', label: 'Dia ngambek', tip: 'Dengerin dulu. Jangan defensif. Validasi perasaannya sebelum ngomong apapun.' },
    { key: 'pms' as const, emoji: '🤒', label: 'Dia PMS', tip: 'Jangan bercanda soal PMS. Kasih perhatian ekstra, makanan hangat, dan jangan ajak debat.' },
    { key: 'takut' as const, emoji: '😰', label: 'Dia cemas/takut', tip: 'Peluk atau pegang tangannya. Kasih tahu kamu ada buat dia. Jangan kasih solusi dulu — dengerin dulu.' },
    { key: 'random' as const, emoji: '💝', label: 'Surprise date', tip: 'Random acts of kindness: beliin makanan fav-nya, tulis note kecil, atau ajak ke tempat yang dia suka.' },
  ];

  const scenarioLabels: Record<string, string> = {
    'ngambek': 'ngambek', 'pms': 'pms', 'takut': 'emosi', 'random': 'umum'
  };

  const getPlaybook = $derived(() => {
    const label = scenarioLabels[activeScenario] || 'umum';
    const relevant = triggers.filter(t => t.kategori === label || t.kategori === 'umum');
    const tips: string[] = [];
    if (relevant.length > 0) {
      tips.push(...relevant.filter(t => t.alternatif_aman).map(t => t.alternatif_aman));
    }
    const current = SCENARIOS.find(s => s.key === activeScenario)!;
    return { scenario: current, triggers: relevant, tips };
  });
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">🛡️ Apology Playbook</h1>
  <p class="text-sm text-text-soft">Pilih situasi — lihat do's & don'ts biar gak bikin makin parah.</p>

  <div class="flex gap-2 flex-wrap">
    {#each SCENARIOS as s}
      <button onclick={() => activeScenario = s.key}
        class="btn btn-sm" class:btn-primary={activeScenario === s.key}
        class:btn-ghost={activeScenario !== s.key}>
        {s.emoji} {s.label}
      </button>
    {/each}
  </div>

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else}
    {@const pb = getPlaybook}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div class="card bg-base-100 shadow border-l-4" style="border-left-color: var(--primary)">
          <div class="card-body">
            <h2 class="font-bold text-lg flex items-center gap-2">{pb.scenario.emoji} {pb.scenario.label}</h2>
            <div class="alert alert-info mt-2"><p class="text-sm">{pb.scenario.tip}</p></div>
          </div>
        </div>

        {#if pb.triggers.length > 0}
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="font-semibold mb-3">⚡ Things to AVOID</h3>
              <div class="space-y-2">
                {#each pb.triggers as t}
                  <div class="p-3 rounded-lg border border-error/20 bg-error/5">
                    <p class="text-sm text-error font-medium">❌ "{t.kata_kalimat_jangan}"</p>
                    {#if t.konteks}<p class="text-xs text-text-soft mt-1">Konteks: {t.konteks}</p>{/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="space-y-4">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="font-semibold mb-3">✅ Safe Alternatives</h3>
            {#if pb.triggers.length > 0}
              <div class="space-y-2">
                {#each pb.triggers.filter(t => t.alternatif_aman) as t}
                  <div class="p-3 rounded-lg border border-success/20 bg-success/5">
                    <p class="text-sm text-success">"{t.alternatif_aman}"</p>
                    <p class="text-xs text-text-soft mt-1">Lebih baik daripada: "{t.kata_kalimat_jangan}"</p>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-text-soft text-sm">Belum ada trigger words yang dicatat. <button onclick={() => setRoute('trigger')} class="link">Tambahin dulu</button> biar dapet rekomendasi personal.</p>
            {/if}
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="font-semibold mb-2">🎯 Quick Actions</h3>
            <div class="flex flex-col gap-2">
              <button onclick={() => setRoute('rekomendasi')} class="btn btn-outline btn-sm">💡 Lihat Rekomendasi</button>
              <button onclick={() => setRoute('makanan')} class="btn btn-outline btn-sm">🍕 Makanan Favorit</button>
              <button onclick={() => setRoute('trigger')} class="btn btn-outline btn-sm">⚡ Kelola Trigger Words</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
