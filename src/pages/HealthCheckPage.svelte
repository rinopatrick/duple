<script lang="ts">
  import { Heart, TrendingUp } from 'lucide-svelte';
  import { tr } from '../lib/i18n';
  import dayjs from 'dayjs';
  import Chart from 'chart.js/auto';

  let step = $state(0);
  let scores: number[] = $state([]);
  let result: { total: number; level: string; emoji: string; tip: string } | null = $state(null);
  let history: { date: string; score: number }[] = $state(loadHistory());
  let trendCanvas: HTMLCanvasElement;

  const QUESTIONS = tr().health.questions;

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('duple_health_history') || '[]');
    } catch { return []; }
  }

  function saveToHistory(total: number) {
    const today = dayjs().format('YYYY-MM-DD');
    history = [...history.filter(h => h.date !== today), { date: today, score: total }];
    history = history.slice(-12); // keep last 12 entries
    localStorage.setItem('duple_health_history', JSON.stringify(history));
  }

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
    saveToHistory(total);
    setTimeout(() => { if (trendCanvas) renderTrend(); }, 200);
  }

  function reset() { step = 0; scores = []; result = null; }

  function renderTrend() {
    if (!trendCanvas || history.length < 2) return;
    Chart.getChart(trendCanvas)?.destroy();
    const data = history.slice(-10);
    const avg = data.reduce((s, h) => s + h.score, 0) / data.length;
    const trend = data.length >= 2 ? (data[data.length - 1].score - data[0].score) : 0;
    const color = trend > 0 ? '#22c55e' : trend < 0 ? '#ef4444' : '#f59e0b';

    new Chart(trendCanvas, {
      type: 'line',
      data: {
        labels: data.map(h => dayjs(h.date).format('MMM DD')),
        datasets: [{
          data: data.map(h => h.score),
          borderColor: color,
          backgroundColor: color + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: color,
        }, {
          data: Array(data.length).fill(avg),
          borderColor: '#94a3b880',
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 25, ticks: { font: { size: 10 }, stepSize: 5 } },
          x: { ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  function trendLabel(): string {
    if (history.length < 2) return '';
    const first = history.slice(-10)[0]?.score || 0;
    const last = history[history.length - 1]?.score || 0;
    if (last > first + 2) return '↗ Improving';
    if (last < first - 2) return '↘ Declining';
    return '→ Stable';
  }
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
        {#if history.length >= 2}
          <div class="space-y-2 mt-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">Score History</span>
              <span class="text-text-soft">{trendLabel()}</span>
            </div>
            <canvas bind:this={trendCanvas}></canvas>
          </div>
        {/if}
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
