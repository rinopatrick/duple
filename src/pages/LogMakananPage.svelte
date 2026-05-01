<script lang="ts">
  import { getAllLogMakanan, createLogMakanan, deleteLogMakanan, type LogMakanan } from '../lib/db/log_makanan';
  import { getAllMakanan } from '../lib/db/makanan';
  import { Plus, Trash2 } from 'lucide-svelte';
  import { today, formatDate } from '../lib/utils/date';
  import dayjs from 'dayjs';
  import { tr } from '../lib/i18n';

  let items: LogMakanan[] = $state([]);
  let loaded = $state(false);
  let selectedDate = $state(today());
  let showForm = $state(false);
  let makananList: string[] = $state([]);
  let form = $state({ makanan: '', mood_sebelum: '', mood_sesudah: '', waktu: '', notes: '' });

  const MOOD_OPTIONS = ['', 'senang', 'biasa', 'kesel', 'sedih', 'gaenak'];
  const MOOD_EMOJI: Record<string, string> = {
    'senang': '😊', 'biasa': '😐', 'kesel': '😤', 'sedih': '😢', 'gaenak': '🤒'
  };
  const WAKTU_OPTIONS = ['pagi', 'siang', 'sore', 'malam', 'snack'];

  $effect(() => { loadData(); });
  $effect(() => { loadLogs(); });

  async function loadData() {
    const m = await getAllMakanan();
    makananList = m.map(m => m.nama);
    loaded = true;
  }

  async function loadLogs() {
    items = await getAllLogMakanan(selectedDate);
  }

  async function addLog() {
    await createLogMakanan({
      tanggal: selectedDate,
      makanan: form.makanan,
      waktu: form.waktu,
      mood_sebelum: form.mood_sebelum,
      mood_sesudah: form.mood_sesudah,
      notes: form.notes,
    });
    form = { makanan: '', mood_sebelum: '', mood_sesudah: '', waktu: '', notes: '' };
    showForm = false;
    await loadLogs();
  }

  async function remove(id: number) {
    await deleteLogMakanan(id);
    await loadLogs();
  }

  function changeDate(days: number) {
    selectedDate = dayjs(selectedDate).add(days, 'day').format('YYYY-MM-DD');
    loadLogs();
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">{tr().logmakanan.heading}</h1>
    <button onclick={() => showForm = !showForm} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> {tr().logmakanan.add}</button>
  </div>

  <div class="flex items-center gap-3 justify-center">
    <button onclick={() => changeDate(-1)} class="btn btn-sm btn-ghost">←</button>
    <span class="font-medium">{formatDate(selectedDate, 'dddd, DD MMM YYYY')}</span>
    <button onclick={() => changeDate(1)} class="btn btn-sm btn-ghost">→</button>
    <button onclick={() => { selectedDate = today(); loadLogs(); }} class="btn btn-sm btn-outline">{tr().logmakanan.today}</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">{tr().logmakanan.addTitle}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().logmakanan.time}</span></label>
            <select class="select select-bordered" bind:value={form.waktu}>
              <option value="">{tr().logmakanan.timePlaceholder}</option>
              {#each WAKTU_OPTIONS as w}
                <option value={w}>{tr().logmakanan.times[w]}</option>
              {/each}
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().logmakanan.food}</span></label>
            <input type="text" class="input input-bordered" bind:value={form.makanan} list="makanan-datalist" placeholder={tr().logmakanan.foodPlaceholder} />
            <datalist id="makanan-datalist">
              {#each makananList as m}
                <option value={m} />
              {/each}
            </datalist>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().logmakanan.moodBefore}</span></label>
            <select class="select select-bordered" bind:value={form.mood_sebelum}>
              {#each MOOD_OPTIONS as m}
                <option value={m}>{m ? MOOD_EMOJI[m] + ' ' + (tr().logmakanan.moods[m] || m) : '--'}</option>
              {/each}
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().logmakanan.moodAfter}</span></label>
            <select class="select select-bordered" bind:value={form.mood_sesudah}>
              {#each MOOD_OPTIONS as m}
                <option value={m}>{m ? MOOD_EMOJI[m] + ' ' + (tr().logmakanan.moods[m] || m) : '--'}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().common.notes}</span></label>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={form.notes}></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick={addLog} class="btn btn-primary" disabled={!form.makanan || !form.waktu}>{tr().common.save}</button>
          <button onclick={() => showForm = false} class="btn btn-ghost">{tr().common.cancel}</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else if items.length === 0}
    <div class="text-center py-12 text-base-content/50">
      <p class="text-4xl mb-4">🍽️</p>
      <p>{tr().logmakanan.empty}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each items as item}
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-3 px-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="badge badge-sm">{tr().logmakanan.times[item.waktu] || item.waktu}</span>
                <span class="font-medium">{item.makanan}</span>
              </div>
              <div class="flex items-center gap-2">
                {#if item.mood_sebelum}
                  <span class="text-sm">{MOOD_EMOJI[item.mood_sebelum] || ''}</span>
                {/if}
                {#if item.mood_sesudah}
                  <span class="text-xs">→ {MOOD_EMOJI[item.mood_sesudah] || ''}</span>
                {/if}
                <button onclick={() => remove(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
              </div>
            </div>
            {#if item.notes}
              <p class="text-xs text-base-content/60 mt-1">{item.notes}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
