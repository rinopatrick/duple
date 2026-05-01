<script lang="ts">
  import { getAllTriggerWords, type TriggerWord } from '../lib/db/trigger';
  import { tr } from '../lib/i18n';
  import { generateRekomendasi } from '../lib/engine/rekomendasi';
  import { setRoute } from '../lib/stores/app.svelte';

  let triggers: TriggerWord[] = $state([]);
  let activeScenario: 'ngambek' | 'pms' | 'cemas' | 'surprise' = $state('ngambek');
  let loaded = $state(false);
  let error = $state('');

  $effect(() => { load(); });

  async function load() {
    try {
      triggers = await getAllTriggerWords();
      loaded = true;
    } catch (e) {
      error = String(e);
      loaded = true;
    }
  }

  const SCENARIOS = $derived([
    { key: 'ngambek' as const, emoji: '😤', label: tr().apology.scenarioLabels.ngambek, tip: tr().apology.tips.ngambek },
    { key: 'pms' as const, emoji: '🤒', label: tr().apology.scenarioLabels.pms, tip: tr().apology.tips.pms },
    { key: 'cemas' as const, emoji: '😰', label: tr().apology.scenarioLabels.cemas, tip: tr().apology.tips.cemas },
    { key: 'surprise' as const, emoji: '💝', label: tr().apology.scenarioLabels.surprise, tip: tr().apology.tips.surprise },
  ]);

  const scenarioFilterMap: Record<string, string> = $derived({
    'ngambek': 'ngambek', 'pms': 'pms', 'cemas': 'emosi', 'surprise': 'umum'
  });

  function getPlaybook() {
    const label = scenarioFilterMap[activeScenario] || 'umum';
    const relevant = triggers.filter(t => t.kategori === label || t.kategori === 'umum');
    const current = SCENARIOS.find(s => s.key === activeScenario)!;
    return { scenario: current, triggers: relevant };
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">{tr().apology.heading}</h1>
  <p class="text-sm text-text-soft">{tr().apology.subtitle}</p>

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
  {:else if error}
    <div class="alert alert-error">{error}</div>
  {:else}
    {@const pb = getPlaybook()}
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
              <h3 class="font-semibold mb-3">{tr().apology.avoid}</h3>
              <div class="space-y-2">
                {#each pb.triggers as t}
                  <div class="p-3 rounded-lg border border-error/20 bg-error/5">
                    <p class="text-sm text-error font-medium">❌ "{t.kata_kalimat_jangan}"</p>
                    {#if t.konteks}<p class="text-xs text-text-soft mt-1">{tr().apology.contextPrefix}{t.konteks}</p>{/if}
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
            <h3 class="font-semibold mb-3">{tr().apology.safeAlt}</h3>
            {#if pb.triggers.length > 0}
              <div class="space-y-2">
                {#each pb.triggers.filter(t => t.alternatif_aman) as t}
                  <div class="p-3 rounded-lg border border-success/20 bg-success/5">
                    <p class="text-sm text-success">"{t.alternatif_aman}"</p>
                    <p class="text-xs text-text-soft mt-1">{tr().apology.betterThan.replace('{word}', t.kata_kalimat_jangan)}</p>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-text-soft text-sm">{tr().apology.empty} <button onclick={() => setRoute('trigger')} class="link">{tr().apology.emptyLink}</button></p>
            {/if}
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="font-semibold mb-2">{tr().apology.quickActions}</h3>
            <div class="flex flex-col gap-2">
              <button onclick={() => setRoute('rekomendasi')} class="btn btn-outline btn-sm">{tr().apology.viewRecs}</button>
              <button onclick={() => setRoute('makanan')} class="btn btn-outline btn-sm">{tr().apology.foodFavs}</button>
              <button onclick={() => setRoute('trigger')} class="btn btn-outline btn-sm">{tr().apology.manageTrigger}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
