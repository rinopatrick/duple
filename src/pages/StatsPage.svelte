<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllMakanan } from '../lib/db/makanan';
  import { getAllLogMakanan } from '../lib/db/log_makanan';
  import { getAllMoodLogs } from '../lib/db/mood';
  import { getAllRencana } from '../lib/db/rencana';
  import { getLastSiklus } from '../lib/db/siklus';
  import { formatDate } from '../lib/utils/date';
  import { tr } from '../lib/i18n';
  import dayjs from 'dayjs';
  import Chart from 'chart.js/auto';

  let loaded = $state(false);
  let foodCount = $state(0); let logCount = $state(0); let moodCount = $state(0); let streak = $state(0);
  let moodCanvas: HTMLCanvasElement;
  let foodCanvas: HTMLCanvasElement;
  let timelineCanvas: HTMLCanvasElement;
  let cycleCanvas: HTMLCanvasElement;

  const MOOD_EMOJI: Record<string, string> = { 'senang': '😊', 'biasa': '😐', 'kesel': '😤', 'sedih': '😢', 'gaenak': '🤒' };
  const MOOD_COLORS: Record<string, string> = { 'senang': '#22c55e', 'biasa': '#94a3b8', 'kesel': '#f59e0b', 'sedih': '#3b82f6', 'gaenak': '#ef4444' };
  const MOOD_VALUES: Record<string, number> = { 'senang': 5, 'biasa': 3, 'kesel': 2, 'sedih': 1, 'gaenak': 0 };

  $effect(() => {
    loadAndCharts();
    return () => {
      Chart.getChart(moodCanvas)?.destroy();
      Chart.getChart(foodCanvas)?.destroy();
      Chart.getChart(timelineCanvas)?.destroy();
      Chart.getChart(cycleCanvas)?.destroy();
    };
  });

  async function loadAndCharts() {
    const [makanan, logs, moods, rencana, siklus] = await Promise.all([
      getAllMakanan(), getAllLogMakanan(), getAllMoodLogs(''), getAllRencana(), getLastSiklus(12)
    ]);
    foodCount = makanan.length; logCount = logs.length; moodCount = moods.length;
    streak = calcStreak(logs, moods);
    loaded = true;

    setTimeout(() => {
      if (moodCanvas) renderMoodChart(moods);
      if (foodCanvas) renderFoodCategory(makanan);
      if (timelineCanvas) renderMoodTimeline(moods);
      if (cycleCanvas) renderCycleChart(siklus);
    }, 150);
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
        labels: labels.map(l => `${MOOD_EMOJI[l] || ''} ${(tr().makanan.moods as any)[l] || l}`),
        datasets: [{ data: labels.map(l => map[l]), backgroundColor: labels.map(l => MOOD_COLORS[l] || '#94a3b8') }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
  }

  function renderFoodCategory(makanan: any[]) {
    const map: Record<string, number> = {};
    for (const m of makanan) map[m.kategori] = (map[m.kategori] || 0) + 1;
    const entries = Object.entries(map);
    new Chart(foodCanvas, {
      type: 'polarArea',
      data: {
        labels: entries.map(e => (tr().makanan.categories as any)[e[0]] || e[0]),
        datasets: [{ data: entries.map(e => e[1]), backgroundColor: ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#8b5cf6'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
  }

  function renderMoodTimeline(moods: any[]) {
    const last30 = [...Array(30)].map((_, i) => dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'));
    const moodMap: Record<string, any> = {};
    for (const m of moods) moodMap[m.tanggal] = m;

    const data = last30.map(d => {
      const m = moodMap[d];
      return m ? MOOD_VALUES[m.mood] || 3 : null;
    });

    new Chart(timelineCanvas, {
      type: 'line',
      data: {
        labels: last30.map(d => dayjs(d).format('DD/MM')),
        datasets: [{
          data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: data.map(v => v !== null ? 3 : 1),
          pointBackgroundColor: data.map(v => v !== null ? '#6366f1' : '#94a3b8'),
          spanGaps: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 5, ticks: {
            font: { size: 10 },
            callback: (v: any) => ['', '😢', '😤', '😐', '', '😊'][v] || ''
          }},
          x: { ticks: { font: { size: 9 }, maxTicksLimit: 6 } }
        }
      }
    });
  }

  function renderCycleChart(siklus: any[]) {
    if (siklus.length < 2) return;
    const data = siklus.slice(0, 6).reverse();
    const cycles: number[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      const days = dayjs(data[i + 1].tgl_mulai).diff(dayjs(data[i].tgl_mulai), 'day');
      if (days > 0 && days < 50) cycles.push(days);
    }
    if (cycles.length === 0) return;

    new Chart(cycleCanvas, {
      type: 'bar',
      data: {
        labels: cycles.map((_, i) => `#${i + 1}`),
        datasets: [{
          data: cycles,
          backgroundColor: cycles.map((d, i) => {
            const colors = ['#6366f1','#8b5cf6','#a855f7','#c084fc','#e879f9','#f0abfc'];
            return colors[i % colors.length];
          }),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 20, max: 35, ticks: { font: { size: 10 }, callback: (v: any) => `${v}d` } },
          x: { ticks: { font: { size: 10 } } }
        }
      }
    });
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">{tr().stats.heading}</h1>
  {#if !loaded}
    <div class="flex justify-center py-20"><span class="loading loading-spinner loading-lg"></span></div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-primary">{foodCount}</p><p class="text-xs text-text-soft">{tr().stats.foods}</p></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-secondary">{logCount}</p><p class="text-xs text-text-soft">{tr().stats.meals}</p></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-accent">{moodCount}</p><p class="text-xs text-text-soft">{tr().stats.moods}</p></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center"><p class="text-3xl font-bold text-success">{streak}d</p><p class="text-xs text-text-soft">{tr().stats.streak}</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow"><div class="card-body"><h2 class="font-bold mb-3">😊 Mood Timeline (30d)</h2><canvas bind:this={timelineCanvas}></canvas></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body"><h2 class="font-bold mb-3">{tr().stats.moodDistribution}</h2><canvas bind:this={moodCanvas}></canvas></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body"><h2 class="font-bold mb-3">🍕 Food Categories</h2><canvas bind:this={foodCanvas}></canvas></div></div>
      <div class="card bg-base-100 shadow"><div class="card-body"><h2 class="font-bold mb-3">🩸 Cycle Pattern</h2><canvas bind:this={cycleCanvas}></canvas></div></div>
    </div>
  {/if}
</div>
