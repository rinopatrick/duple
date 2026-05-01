<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllMakanan } from '../lib/db/makanan';
  import { getAllLogMakanan } from '../lib/db/log_makanan';
  import { getAllMoodLogs } from '../lib/db/mood';
  import { getAllRencana } from '../lib/db/rencana';
  import { getLastSiklus } from '../lib/db/siklus';
  import { formatDate } from '../lib/utils/date';
  import dayjs from 'dayjs';
  import Chart from 'chart.js/auto';

  let loaded = $state(false);
  let foodCount = $state(0); let logCount = $state(0); let moodCount = $state(0); let streak = $state(0);
  let moodCanvas: HTMLCanvasElement;
  let foodCanvas: HTMLCanvasElement;

  const MOOD_EMOJI: Record<string, string> = { 'senang': '😊', 'biasa': '😐', 'kesel': '😤', 'sedih': '😢', 'gaenak': '🤒' };
  const MOOD_COLORS: Record<string, string> = { 'senang': '#22c55e', 'biasa': '#94a3b8', 'kesel': '#f59e0b', 'sedih': '#3b82f6', 'gaenak': '#ef4444' };

  $effect(() => {
    loadAndCharts();
    return () => { Chart.getChart(moodCanvas)?.destroy(); Chart.getChart(foodCanvas)?.destroy(); };
  });

  async function loadAndCharts() {
    const [makanan, logs, moods, rencana] = await Promise.all([
      getAllMakanan(), getAllLogMakanan(), getAllMoodLogs(''), getAllRencana()
    ]);
    foodCount = makanan.length; logCount = logs.length; moodCount = moods.length;
    streak = calcStreak(logs, moods);
    loaded = true;

    setTimeout(() => {
      if (moodCanvas) renderMoodChart(moods);
      if (foodCanvas) renderFoodChart(logs);
    }, 100);
  }

  function calcStreak(logs: any[], moods: any[]): number {
    let s = 0; let d = dayjs();
    while (true) {
      const ds = d.format('YYYY-MM-DD');
      if (logs.some((l:any) => l.tanggal === ds) || moods.some((m:any) => m.tanggal === ds)) { s++; d = d.subtract(1, 'day'); }
      else break;
    }
    return s;
  }

  function renderMoodChart(moods: any[]) {
    const map: Record<string, number> = {};
    for (const m of moods) map[m.mood] = (map[m.mood] || 0) + 1;
    const labels = Object.keys(map);
    new Chart(moodCanvas, {
      type: 'doughnut',
      data: {
        labels: labels.map(l => `${MOOD_EMOJI[l] || ''} ${l}`),
        datasets: [{ data: labels.map(l => map[l]), backgroundColor: labels.map(l => MOOD_COLORS[l] || '#94a3b8') }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });
  }

  function renderFoodChart(logs: any[]) {
    const map: Record<string, number> = {};
    for (const l of logs) map[l.makanan] = (map[l.makanan] || 0) + 1;
    const entries = Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 8);
    new Chart(foodCanvas, {
      type: 'bar',
      data: {
        labels: entries.map(e => e[0]),
        datasets: [{ data: entries.map(e => e[1]), backgroundColor: '#6366f1', borderRadius: 4 }]
      },
      options: {
        responsive: true, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } }
      }
    });
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">📊 Stats & Insights</h1>
  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner loading-lg"></span></div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-primary">{foodCount}</p><p class="text-xs text-text-soft">Foods</p></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-secondary">{logCount}</p><p class="text-xs text-text-soft">Meals</p></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-accent">{moodCount}</p><p class="text-xs text-text-soft">Moods</p></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-success">{streak}d</p><p class="text-xs text-text-soft">Streak</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow"><div class="card-body"><h2 class="font-bold mb-3">😊 Mood Distribution</h2><canvas bind:this={moodCanvas}></canvas></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body"><h2 class="font-bold mb-3">🍕 Most Eaten</h2><canvas bind:this={foodCanvas}></canvas></div></div>
    </div>
  {/if}
</div>
