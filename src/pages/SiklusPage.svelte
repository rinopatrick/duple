<script lang="ts">
  import { getAllHaidHarian, setHaidHarian, deleteHaidHarian, type HaidHarian } from '../lib/db/haid_harian';
  import { getLastSiklus } from '../lib/db/siklus';
  import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-svelte';
  import { formatDate, today } from '../lib/utils/date';
  import dayjs from 'dayjs';

  let currentMonth = $state(dayjs().format('YYYY-MM'));
  let haidData: Record<string, HaidHarian> = $state({});
  let loaded = $state(false);
  let processing = $state(false);
  let selectedDay: string | null = $state(null);
  let selectedFlow = $state(3);

  $effect(() => { loadMonth(); });

  async function loadMonth() {
    const data = await getAllHaidHarian(currentMonth);
    const map: Record<string, HaidHarian> = {};
    for (const d of data) map[d.tanggal] = d;
    haidData = map;
    loaded = true;
  }

  function daysInMonth(): dayjs.Dayjs[] {
    const start = dayjs(currentMonth + '-01');
    const days: dayjs.Dayjs[] = [];
    const firstDow = start.day();
    const totalDays = start.daysInMonth();

    for (let i = firstDow - 1; i >= 0; i--) days.push(start.subtract(i + 1, 'day'));
    for (let i = 1; i <= totalDays; i++) days.push(start.date(i));
    const lastDow = start.date(totalDays).day();
    for (let i = 1; i < 7 - lastDow; i++) days.push(start.date(totalDays).add(i, 'day'));
    return days;
  }

  async function toggleDay(dateStr: string) {
    if (processing || dateStr > today()) return;
    processing = true;

    const rec = haidData[dateStr];

    try {
      if (!rec) {
        await setHaidHarian(dateStr, 'haid', 3);
        selectedDay = dateStr;
        selectedFlow = 3;
      } else if (rec.status === 'haid') {
        await setHaidHarian(dateStr, 'bersih', 0);
        selectedDay = null;
      } else {
        await deleteHaidHarian(dateStr);
        selectedDay = null;
      }
      await loadMonth();
    } finally {
      processing = false;
    }
  }

  async function changeFlow(dateStr: string, delta: number) {
    const rec = haidData[dateStr];
    if (!rec || rec.status !== 'haid') return;
    const newFlow = Math.max(1, Math.min(5, (rec.flow_level || 3) + delta));
    await setHaidHarian(dateStr, 'haid', newFlow);
    selectedFlow = newFlow;
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
    return Object.values(haidData)
      .filter(h => h.status === 'haid')
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }

  function getRingkasan(): string {
    const haids = getHaids();
    if (haids.length === 0) return 'Belum ada data. Klik tanggal untuk mencatat.';
    const t = today();
    const todayRec = haidData[t];

    if (todayRec?.status === 'haid') {
      return `Hari ini sedang haid. Flow: ${'🔴'.repeat(todayRec.flow_level || 3)}${'⚪'.repeat(5 - (todayRec.flow_level || 3))}`;
    }

    const latest = haids[haids.length - 1];
    const daysSince = dayjs(t).diff(dayjs(latest.tanggal), 'day') + 1;
    return `Hari ke-${daysSince} sejak mulai haid terakhir (${formatDate(latest.tanggal, 'DD MMM')}). Flow: ${'🔴'.repeat(latest.flow_level || 3)}`;
  }

  const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">🩸 Siklus Haid</h1>
    <button onclick={goToday} class="btn btn-sm btn-ghost">Hari Ini</button>
  </div>

  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <p class="font-medium">{getRingkasan()}</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <button onclick={prevMonth} class="btn btn-sm btn-ghost btn-square"><ChevronLeft class="w-4 h-4" /></button>
              <h2 class="font-bold text-lg">{dayjs(currentMonth + '-01').format('MMMM YYYY')}</h2>
              <button onclick={nextMonth} class="btn btn-sm btn-ghost btn-square"><ChevronRight class="w-4 h-4" /></button>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm inline-block border" style="background:#ef4444"></span> Haid</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm inline-block border" style="background:#22c55e"></span> Bersih</span>
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
                {@const rec = haidData[dateStr]}
                {@const dimmed = !isCurrentMonth(day) || isFuture(day)}
                {@const isHaid = rec?.status === 'haid'}
                {@const isBersih = rec?.status === 'bersih'}
                {@const bgClass = isHaid ? 'bg-error text-white' : isBersih ? 'bg-success text-white' : dimmed ? '' : 'bg-base-200'}
                <button
                  onclick={() => toggleDay(dateStr)}
                  disabled={isFuture(day) || processing}
                  class="aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all {bgClass} {!rec && !dimmed ? 'hover:bg-base-300' : ''} {isToday(day) ? 'ring-2 ring-primary' : ''} {dimmed ? 'opacity-25' : ''} {processing ? 'opacity-60 pointer-events-none' : ''}"
                >
                  <span class="font-medium">{day.format('D')}</span>
                  {#if isHaid}
                    <span class="text-[7px] leading-none mt-0.5">{'🔴'.repeat(rec.flow_level || 3)}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="space-y-4">
      {#if selectedDay && haidData[selectedDay]?.status === 'haid'}
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="font-semibold mb-2">{formatDate(selectedDay, 'DD MMM YYYY')}</h3>
            <p class="text-sm text-text-soft mb-3">Atur Flow Level:</p>
            <div class="flex items-center gap-3 justify-center">
              <button onclick={() => changeFlow(selectedDay, -1)} class="btn btn-sm btn-ghost btn-square" disabled={haidData[selectedDay].flow_level <= 1}><Minus class="w-4 h-4" /></button>
              <span class="text-2xl">{'🔴'.repeat(haidData[selectedDay].flow_level || 3)}{'⚪'.repeat(5 - (haidData[selectedDay].flow_level || 3))}</span>
              <button onclick={() => changeFlow(selectedDay, 1)} class="btn btn-sm btn-ghost btn-square" disabled={haidData[selectedDay].flow_level >= 5}><Plus class="w-4 h-4" /></button>
            </div>
            <p class="text-xs text-center text-text-soft mt-2">Level {(haidData[selectedDay].flow_level || 3)}/5</p>
          </div>
        </div>
      {/if}

      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="font-semibold mb-2">📋 Riwayat Bulan Ini</h3>
          {#if getHaids().length === 0}
            <p class="text-sm text-text-soft">Belum ada catatan bulan ini.</p>
          {:else}
            <div class="space-y-1 max-h-64 overflow-y-auto">
              {#each getHaids() as h}
                <div class="flex items-center justify-between text-sm py-1 px-2 rounded bg-base-200">
                  <span>{formatDate(h.tanggal, 'DD MMM')}</span>
                  <span class="text-xs">{'🔴'.repeat(h.flow_level)}{'⚪'.repeat(5 - h.flow_level)}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
