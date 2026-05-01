<script lang="ts">
  import { Download } from 'lucide-svelte';
  import { exportICS, downloadICS } from '../lib/engine/ical';
  import { getAllMomen } from '../lib/db/momen';
  import { getLastSiklus } from '../lib/db/siklus';
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
  <h1 class="text-2xl font-bold text-center">📅 Calendar Export</h1>
  <div class="card bg-base-100 shadow text-center">
    <div class="card-body space-y-4">
      <span class="text-5xl">📅</span>
      <p class="text-text-soft">{eventCount} events available for export</p>
      <p class="text-sm text-text-soft">Exports your special moments + predicted cycle as an .ics file that can be imported into Google Calendar, Apple Calendar, Outlook, etc.</p>
      <button onclick={handleExport} class="btn btn-primary btn-lg" disabled={exporting}>
        <Download class="w-5 h-5" /> Download .ics File
      </button>
    </div>
  </div>
</div>
