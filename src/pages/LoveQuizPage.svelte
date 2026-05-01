<script lang="ts">
  import { tr } from '../lib/i18n';
  import { Heart, Gift, Clock, Hand, Star } from 'lucide-svelte';
  import { setRoute } from '../lib/stores/app.svelte';

  let step = $state(0);
  let answers: number[] = $state([0,0,0,0,0]);
  let result: 'words' | 'acts' | 'gifts' | 'time' | 'touch' | null = $state(null);

  const CATEGORIES = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4];
  const RESULT_ICONS: Record<string, string> = {
    words: '💬', acts: '🛠️', gifts: '🎁', time: '⏰', touch: '🤗'
  };

  function answer(val: number) {
    const cat = CATEGORIES[step];
    answers[cat] += val;
    if (step < CATEGORIES.length - 1) { step++; return; }
    let max = 0, idx = 0;
    answers.forEach((v, i) => { if (v > max) { max = v; idx = i; } });
    const keys = ['words', 'acts', 'gifts', 'time', 'touch'];
    result = keys[idx] as any;
  }

  function reset() { step = 0; answers = [0,0,0,0,0]; result = null; }
</script>

<div class="space-y-6 max-w-xl mx-auto">
  <h1 class="text-2xl font-bold text-center">{tr().quiz.heading}</h1>

  {#if result}
    {@const r = tr().quiz.results[result]}
    <div class="card bg-base-100 shadow text-center space-y-4">
      <div class="card-body">
        <span class="text-6xl">{RESULT_ICONS[result]}</span>
        <h2 class="text-2xl font-bold">{r.name}</h2>
        <p class="text-text-soft">{r.desc}</p>
        <div class="alert alert-info text-left"><p class="text-sm font-medium">{tr().quiz.tipLabel}{r.tip}</p></div>
        <div class="flex gap-2 justify-center mt-4">
          <button onclick={() => setRoute('wishlist')} class="btn btn-primary btn-sm"><Gift class="w-4 h-4" /> {tr().quiz.wishlist}</button>
          <button onclick={() => setRoute('rekomendasi')} class="btn btn-secondary btn-sm"><Heart class="w-4 h-4" /> {tr().quiz.recs}</button>
          <button onclick={reset} class="btn btn-ghost btn-sm">{tr().quiz.retake}</button>
        </div>
      </div>
    </div>
  {:else}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <p class="text-sm text-text-soft mb-4">{tr().quiz.progress.replace('{n}', String(step + 1)).replace('{total}', String(CATEGORIES.length))}</p>
        <p class="text-lg font-medium mb-6">{tr().quiz.questions[step]}</p>
        <div class="flex gap-2">
          {#each [1,2,3,4,5] as n}
            <button onclick={() => answer(n)} class="btn btn-outline flex-1 w-0">{n}</button>
          {/each}
        </div>
        <div class="flex justify-between text-xs text-text-soft mt-2">
          <span>{tr().quiz.scaleLow}</span><span>{tr().quiz.scaleHigh}</span>
        </div>
      </div>
    </div>
  {/if}
</div>
