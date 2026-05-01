<script lang="ts">
  import { Heart, TrendingUp } from 'lucide-svelte';
  import { getAllMoodLogs } from '../lib/db/mood';
  import { tr } from '../lib/i18n';
  import dayjs from 'dayjs';

  let step = $state(0);
  let scores: number[] = $state([]);
  let result: { total: number; level: string; emoji: string; tip: string } | null = $state(null);

  const QUESTIONS = tr().health.questions;

  function answer(n: number) {
    scores = [...scores, n];
    if (step < QUESTIONS.length - 1) { step++; return; }
    const total = scores.reduce((a,b)=>a+b,0);
    let level: string, emoji: string, tip: string;
    if (total >= 20) { level = tr().health.levels.thriving.label; emoji = '🌟'; tip = tr().health.levels.thriving.tip; }
    else if (total >= 14) { level = tr().health.levels.good.label; emoji = '💚'; tip = tr().health.levels.good.tip; }
    else if (total >= 9) { level = tr().health.levels.attention.label; emoji = '🟡'; tip = tr().health.levels.attention.tip; }
    else { level = tr().health.levels.struggling.label; emoji = '❤️‍🩹'; tip = tr().health.levels.struggling.tip; }
    result = { total, level, emoji, tip };
  }

  function reset() { step = 0; scores = []; result = null; }
</script>

<div class="space-y-6 max-w-xl mx-auto">
  <h1 class="text-2xl font-bold text-center">{tr().health.heading}</h1>
  {#if result}
    <div class="card bg-base-100 shadow text-center space-y-4">
      <div class="card-body">
        <span class="text-6xl">{result.emoji}</span>
        <h2 class="text-2xl font-bold">{result.level}</h2>
        <div class="w-full bg-base-200 rounded-full h-4">
          <div class="h-full rounded-full bg-primary" style="width:{(result.total/25)*100}%"></div>
        </div>
        <p class="text-text-soft">{tr().health.result.replace('{pct}', String(Math.round((result.total/25)*100))).replace('{score}', String(result.total))}</p>
        <div class="alert alert-info text-left"><p class="text-sm">{result.tip}</p></div>
        <button onclick={reset} class="btn btn-ghost btn-sm">{tr().health.retry}</button>
      </div>
    </div>
  {:else}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <p class="text-sm text-text-soft mb-4">{tr().health.progress.replace('{n}', String(step + 1)).replace('{total}', String(QUESTIONS.length))}</p>
        <p class="text-lg font-medium mb-6">{QUESTIONS[step]}</p>
        <div class="flex gap-2">
          {#each [1,2,3,4,5] as n}
            <button onclick={() => answer(n)} class="btn btn-outline flex-1">{n}</button>
          {/each}
        </div>
        <div class="flex justify-between text-xs text-text-soft mt-2"><span>{tr().health.scaleLow}</span><span>{tr().health.scaleHigh}</span></div>
      </div>
    </div>
  {/if}
</div>
