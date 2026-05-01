<script lang="ts">
  import { getAllMakanan, type MakananFavorit } from '../lib/db/makanan';
  import { getAllLogMakanan, type LogMakanan } from '../lib/db/log_makanan';
  import { getAllMoodLogs, type MoodLog } from '../lib/db/mood';
  import { getAllRencana } from '../lib/db/rencana';
  import { formatDate } from '../lib/utils/date';
  import dayjs from 'dayjs';

  let foodCount = $state(0);
  let totalLogs = $state(0);
  let totalMoods = $state(0);
  let wishlistCount = $state(0);
  let topFoods: { name: string; count: number }[] = $state([]);
  let moodDistribution: { mood: string; emoji: string; count: number; pct: number }[] = $state([]);
  let recentMoods: MoodLog[] = $state([]);
  let logStreak = $state(0);
  let loaded = $state(false);

  $effect(() => { load(); });

  const MOOD_EMOJI: Record<string, string> = {
    'senang': '😊', 'biasa': '😐', 'kesel': '😤', 'sedih': '😢', 'gaenak': '🤒'
  };
  const MOOD_COLORS: Record<string, string> = {
    'senang': '#22c55e', 'biasa': '#94a3b8', 'kesel': '#f59e0b', 'sedih': '#3b82f6', 'gaenak': '#ef4444'
  };

  async function load() {
    const [makanan, logs, moods, rencana] = await Promise.all([
      getAllMakanan(), getAllLogMakanan(), getAllMoodLogs(''), getAllRencana()
    ]);

    foodCount = makanan.length;
    totalLogs = logs.length;
    totalMoods = moods.length;
    wishlistCount = rencana.filter(r => r.status === 'wishlist').length;

    // Top foods
    const foodMap: Record<string, number> = {};
    for (const log of logs) {
      foodMap[log.makanan] = (foodMap[log.makanan] || 0) + 1;
    }
    topFoods = Object.entries(foodMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Mood distribution
    const moodMap: Record<string, number> = {};
    for (const m of moods) {
      moodMap[m.mood] = (moodMap[m.mood] || 0) + 1;
    }
    moodDistribution = Object.entries(moodMap)
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => ({
        mood, emoji: MOOD_EMOJI[mood] || '😐', count,
        pct: moods.length > 0 ? Math.round((count / moods.length) * 100) : 0
      }));

    recentMoods = moods.slice(-5).reverse();

    // Streak: days with mood logs in a row
    let streak = 0;
    let d = dayjs();
    while (true) {
      const has = logs.some(l => l.tanggal === d.format('YYYY-MM-DD')) ||
                  moods.some(m => m.tanggal === d.format('YYYY-MM-DD'));
      if (has) { streak++; d = d.subtract(1, 'day'); }
      else break;
    }
    logStreak = streak;

    loaded = true;
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">📊 Stats & Insights</h1>

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card bg-base-100 shadow"><div class="card-body text-center">
        <p class="text-3xl font-bold text-primary">{foodCount}</p><p class="text-xs text-text-soft">Foods Tracked</p>
      </div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center">
        <p class="text-3xl font-bold text-secondary">{totalLogs}</p><p class="text-xs text-text-soft">Meals Logged</p>
      </div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center">
        <p class="text-3xl font-bold text-accent">{totalMoods}</p><p class="text-xs text-text-soft">Moods Recorded</p>
      </div></div>
      <div class="card bg-base-100 shadow"><div class="card-body text-center">
        <p class="text-3xl font-bold text-success">{logStreak} days</p><p class="text-xs text-text-soft">Active Streak</p>
      </div></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {#if topFoods.length > 0}
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="font-bold mb-3">🍕 Most Eaten Foods</h2>
            <div class="space-y-2">
              {#each topFoods as food, i}
                <div class="flex items-center gap-3">
                  <span class="w-6 text-right text-sm font-mono text-text-soft">{i + 1}</span>
                  <div class="flex-1">
                    <div class="flex justify-between text-sm mb-0.5">
                      <span>{food.name}</span><span class="text-text-soft">{food.count}x</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-base-200">
                      <div class="h-full rounded-full bg-primary transition-all" style="width:{Math.round((food.count / topFoods[0].count) * 100)}%"></div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        <div class="card bg-base-100 shadow"><div class="card-body text-center text-text-soft">Log makanan dulu untuk lihat stats</div></div>
      {/if}

      {#if moodDistribution.length > 0}
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="font-bold mb-3">😊 Mood Distribution</h2>
            <div class="space-y-3">
              {#each moodDistribution as m}
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span>{m.emoji} {m.mood}</span><span class="text-text-soft">{m.pct}%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-base-200">
                    <div class="h-full rounded-full transition-all" style="width:{m.pct}%; background:{MOOD_COLORS[m.mood] || '#94a3b8'}"></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        <div class="card bg-base-100 shadow"><div class="card-body text-center text-text-soft">Catat mood dulu untuk lihat distribusi</div></div>
      {/if}
    </div>

    {#if recentMoods.length > 0}
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="font-bold mb-2">📋 Recent Moods</h2>
          <div class="flex gap-2 flex-wrap">
            {#each recentMoods as m}
              <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-base-200 text-sm">
                <span>{MOOD_EMOJI[m.mood] || '😐'}</span>
                <span class="text-xs text-text-soft">{formatDate(m.tanggal, 'DD/MM')}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
