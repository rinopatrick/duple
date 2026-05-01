<script lang="ts">
  import { getAllHaidHarian, setHaidHarian, deleteHaidHarian, type HaidHarian } from '../lib/db/haid_harian';
  import { getLastSiklus } from '../lib/db/siklus';
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
  import { formatDate, today } from '../lib/utils/date';
  import dayjs from 'dayjs';

  let currentMonth = $state(dayjs().format('YYYY-MM'));
  let haidMap = $state<Map<string, HaidHarian>>(new Map());
  let loaded = $state(false);
  let processing = $state(false);
  let activeDay: string | null = $state(null);

  $effect(() => { loadMonth(); });

  async function loadMonth() {
    const data = await getAllHaidHarian(currentMonth);
    haidMap = new Map(data.map(d => [d.tanggal, d]));
    loaded = true;
  }

  function daysInMonth(): dayjs.Dayjs[] {
    const start = dayjs(currentMonth + '-01');
    const days: dayjs.Dayjs[] = [];
    const firstDow = start.day(); // 0=Sun
    const totalDays = start.daysInMonth();

    for (let i = firstDow - 1; i >= 0; i--) {
      days.push(start.subtract(i + 1, 'day'));
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(start.date(i));
    }
    const lastDow = start.date(totalDays).day();
    for (let i = 1; i < 7 - lastDow; i++) {
      days.push(start.date(totalDays).add(i, 'day'));
    }
    return days;
  }

  async function toggleDay(dateStr: string) {
    if (processing) return;
    const existing = haidMap.get(dateStr);
    if (dateStr > today()) return;

    processing = true;
    try {
      if (!existing) {
        await setHaidHarian(dateStr, 'haid', 3);
      } else if (existing.status === 'haid') {
        await setHaidHarian(dateStr, 'bersih', 0);
      } else {
        await deleteHaidHarian(dateStr);
      }
      await loadMonth();
    } finally {
      processing = false;
    }
  }

  async function markRange(start: string, end: string, status: string) {
    let d = dayjs(start);
    const endD = dayjs(end);
    while (d.isBefore(endD) || d.isSame(endD, 'day')) {
      await setHaidHarian(d.format('YYYY-MM-DD'), status, status === 'haid' ? 3 : 0);
      d = d.add(1, 'day');
    }
    await loadMonth();
  }

  function prevMonth() {
    currentMonth = dayjs(currentMonth + '-01').subtract(1, 'month').format('YYYY-MM');
  }

  function nextMonth() {
    currentMonth = dayjs(currentMonth + '-01').add(1, 'month').format('YYYY-MM');
  }

  function goToday() {
    currentMonth = dayjs().format('YYYY-MM');
  }

  function isCurrentMonth(day: dayjs.Dayjs): boolean {
    return day.format('YYYY-MM') === currentMonth;
  }

  function isToday(day: dayjs.Dayjs): boolean {
    return day.format('YYYY-MM-DD') === today();
  }

  function isFuture(day: dayjs.Dayjs): boolean {
    return day.format('YYYY-MM-DD') > today();
  }

  function getHaids(): HaidHarian[] {
    return Array.from(haidMap.values())
      .filter(h => h.status === 'haid')
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }

  function getRingkasan(): string {
    const haids = getHaids();
    if (haids.length === 0) return 'Belum ada data. Klik tanggal untuk mencatat.';

    const todayStr = today();
    const todayHaids = haids.filter(h => h.tanggal <= todayStr);

    if (todayHaids.length === 0) {
      const nextHaid = haids[0];
      const daysUntil = dayjs(nextHaid.tanggal).diff(dayjs(todayStr), 'day');
      return `Haid berikutnya dalam ${daysUntil} hari (${formatDate(nextHaid.tanggal, 'DD MMM')})`;
    }

    const latestHaid = todayHaids[todayHaids.length - 1];
    const todayHaid = haids.find(h => h.tanggal === todayStr);

    if (todayHaid) {
      return `Hari ini sedang haid. Flow level: ${'🔴'.repeat(todayHaid.flow_level)}${'⚪'.repeat(5 - todayHaid.flow_level)}`;
    }

    const daysSinceStart = dayjs(todayStr).diff(dayjs(haids[0].tanggal), 'day') + 1;
    return `Hari ke-${daysSinceStart} sejak mulai. Terakhir tercatat ${formatDate(latestHaid.tanggal, 'DD MMM')}`;
  }

  const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">🩸 Siklus Haid</h1>
    <div class="flex gap-1">
      <button onclick={goToday} class="btn btn-sm btn-ghost">Hari Ini</button>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <p class="font-medium">{getRingkasan()}</p>
    </div>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button onclick={prevMonth} class="btn btn-sm btn-ghost btn-square"><ChevronLeft class="w-4 h-4" /></button>
          <h2 class="font-bold text-lg">{dayjs(currentMonth + '-01').format('MMMM YYYY')}</h2>
          <button onclick={nextMonth} class="btn btn-sm btn-ghost btn-square"><ChevronRight class="w-4 h-4" /></button>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm inline-block bg-error"></span> Haid</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm inline-block bg-success"></span> Bersih</span>
        </div>
      </div>

      {#if !loaded}
        <div class="flex justify-center py-8"><span class="loading loading-spinner"></span></div>
      {:else}
        <div class="grid grid-cols-7 gap-1">
          {#each DAY_LABELS as label}
            <div class="text-center text-xs font-medium text-text-soft py-1">{label}</div>
          {/each}
          {#each daysInMonth() as day}
            {@const dateStr = day.format('YYYY-MM-DD')}
            {@const haidData = haidMap.get(dateStr)}
            {@const dimmed = !isCurrentMonth(day) || isFuture(day)}
            <button
              onclick={() => toggleDay(dateStr)}
              disabled={isFuture(day) || processing}
              class="aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all cursor-pointer {haidData?.status === 'haid' ? 'bg-error text-white' : haidData?.status === 'bersih' ? 'bg-success text-white' : !haidData ? 'bg-base-200' : ''} {!haidData && !dimmed ? 'hover:bg-base-300' : ''} {isToday(day) ? 'ring-2 ring-primary' : ''} {dimmed ? 'opacity-30' : ''} {isFuture(day) ? 'opacity-50' : ''} {processing ? 'opacity-60' : ''}">
              <span class="font-medium">{day.format('D')}</span>
              {#if haidData?.status === 'haid'}
                <span class="text-[8px]">{'🔴'.repeat(haidData.flow_level || 1)}</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  {#if getHaids().length > 0}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="font-semibold mb-2">📋 Riwayat Bulan Ini</h3>
        <div class="space-y-1 max-h-48 overflow-y-auto">
          {#each getHaids() as h}
            <div class="flex items-center justify-between text-sm py-1 px-2 rounded bg-base-200">
              <span>{formatDate(h.tanggal, 'DD MMM')}</span>
              <span class="text-xs text-text-soft">Flow: {'🔴'.repeat(h.flow_level)}{'⚪'.repeat(5 - h.flow_level)}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
