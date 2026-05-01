<script lang="ts">
  import { Download } from 'lucide-svelte';
  import { exportICS, downloadICS } from '../lib/engine/ical';
  import { getAllMomen } from '../lib/db/momen';
  import { getLastSiklus } from '../lib/db/siklus';
  import { tr } from '../lib/i18n';
  import dayjs from 'dayjs';

  let exporting = $state(false);
  let eventCount = $state(0);

  $effect(() => { countEvents(); });

  async function countEvents() {
    const [momens, siklus] = await Promise.all([getAllMomen(), getLastSiklus(3)]);
    let count = momens.length;
    if (siklus.length >= 2) count++;
    eventCount = count;
  }

  async function handleExport() {
    exporting = true;
    const ics = await exportICS();
    downloadICS(ics);
    exporting = false;
  }
</script>

<div class="space-y-6 max-w-xl mx-auto">
  <h1 class="text-2xl font-bold text-center">{tr().calendar.heading}</h1>
  <div class="card bg-base-100 shadow text-center">
    <div class="card-body space-y-4">
      <span class="text-5xl">📅</span>
      <p class="text-text-soft">{tr().calendar.count.replace('{n}', String(eventCount))}</p>
      <p class="text-sm text-text-soft">{tr().calendar.desc}</p>
      <button onclick={handleExport} class="btn btn-primary btn-lg" disabled={exporting}>
        <Download class="w-5 h-5" /> {tr().calendar.download}
      </button>
    </div>
  </div>
</div>
