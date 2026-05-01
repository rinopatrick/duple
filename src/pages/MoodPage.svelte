<script lang="ts">
  import { getAllMoodLogs, createMoodLog, deleteMoodLog, type MoodLog } from '../lib/db/mood';
  import { Plus, Trash2 } from 'lucide-svelte';
  import { today, formatDate } from '../lib/utils/date';
  import dayjs from 'dayjs';
  import { tr } from '../lib/i18n';

  let items: MoodLog[] = $state([]);
  let loaded = $state(false);
  let selectedDate = $state(today());
  let showForm = $state(false);
  let form = $state({ mood: 'biasa', trigger_penyebab: '', notes: '' });

  const MOODS = [
    { value: 'senang', emoji: '😊' },
    { value: 'biasa', emoji: '😐' },
    { value: 'kesel', emoji: '😤' },
    { value: 'sedih', emoji: '😢' },
    { value: 'gaenak', emoji: '🤒' },
  ];

  const MOOD_COLORS: Record<string, string> = {
    'senang': 'success', 'biasa': 'neutral', 'kesel': 'warning', 'sedih': 'info', 'gaenak': 'error'
  };

  $effect(() => { loadLogs(); });

  async function loadLogs() {
    items = await getAllMoodLogs(selectedDate);
    loaded = true;
  }

  async function add() {
    await createMoodLog({
      tanggal: selectedDate,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      mood: form.mood,
      trigger_penyebab: form.trigger_penyebab,
      notes: form.notes,
    });
    form = { mood: 'biasa', trigger_penyebab: '', notes: '' };
    showForm = false;
    await loadLogs();
  }

  async function remove(id: number) {
    await deleteMoodLog(id);
    await loadLogs();
  }

  function changeDate(days: number) {
    selectedDate = dayjs(selectedDate).add(days, 'day').format('YYYY-MM-DD');
    loadLogs();
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">{tr().mood.heading}</h1>
    <button onclick={() => showForm = !showForm} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> {tr().mood.add}</button>
  </div>

  <div class="flex items-center gap-3 justify-center">
    <button onclick={() => changeDate(-1)} class="btn btn-sm btn-ghost">←</button>
    <span class="font-medium">{formatDate(selectedDate, 'dddd, DD MMM YYYY')}</span>
    <button onclick={() => changeDate(1)} class="btn btn-sm btn-ghost">→</button>
    <button onclick={() => { selectedDate = today(); loadLogs(); }} class="btn btn-sm btn-outline">{tr().mood.today}</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">{tr().mood.addTitle}</h3>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().mood.mood}</span></label>
          <div class="flex gap-2 flex-wrap">
            {#each MOODS as mood}
              <button
                class="btn btn-lg"
                class:btn-primary={form.mood === mood.value}
                class:btn-outline={form.mood !== mood.value}
                onclick={() => form.mood = mood.value}
              >
                <span class="text-2xl">{mood.emoji}</span>
                <span class="text-sm">{tr().mood.moods[mood.value] || mood.value}</span>
              </button>
            {/each}
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().mood.trigger}</span></label>
          <input type="text" class="input input-bordered" bind:value={form.trigger_penyebab} placeholder={tr().mood.triggerPlaceholder} />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().common.notes}</span></label>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={form.notes}></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick={add} class="btn btn-primary">{tr().common.save}</button>
          <button onclick={() => showForm = false} class="btn btn-ghost">{tr().common.cancel}</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else if items.length === 0}
    <div class="text-center py-12 text-base-content/50">
      <p class="text-4xl mb-4">😶</p>
      <p>{tr().mood.empty}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each items as item}
        {@const moodInfo = MOODS.find(m => m.value === item.mood)}
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-3 px-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="badge badge-sm">{item.waktu}</span>
                <span class="text-2xl">{moodInfo?.emoji || '😐'}</span>
                <span class="font-medium">{tr().mood.moods[item.mood] || item.mood}</span>
              </div>
              <button onclick={() => remove(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
            </div>
            {#if item.trigger_penyebab}
              <p class="text-sm text-base-content/70 mt-1">{tr().mood.causePrefix}{item.trigger_penyebab}</p>
            {/if}
            {#if item.notes}
              <p class="text-xs text-base-content/50">{item.notes}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
