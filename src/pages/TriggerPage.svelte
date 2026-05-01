<script lang="ts">
  import { getAllTriggerWords, createTriggerWord, updateTriggerWord, deleteTriggerWord, type TriggerWord } from '../lib/db/trigger';
  import { tr } from '../lib/i18n';
  import { Plus, Trash2, Edit3, AlertTriangle } from 'lucide-svelte';

  let items: TriggerWord[] = $state([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let editId: number | null = $state(null);
  let form = $state({ kategori: 'umum', kata_kalimat_jangan: '', konteks: '', alternatif_aman: '' });

  const KATEGORI = ['umum', 'ngambek', 'pms', 'emosi', 'debat', 'sensitif'];

  const categoryLabels = $derived(tr().trigger.categories);

  $effect(() => { loadData(); });

  async function loadData() {
    items = await getAllTriggerWords();
    loaded = true;
  }

  function openAdd() {
    editId = null;
    form = { kategori: 'umum', kata_kalimat_jangan: '', konteks: '', alternatif_aman: '' };
    showForm = true;
  }

  function openEdit(item: TriggerWord) {
    editId = item.id;
    form = { kategori: item.kategori, kata_kalimat_jangan: item.kata_kalimat_jangan, konteks: item.konteks, alternatif_aman: item.alternatif_aman };
    showForm = true;
  }

  async function save() {
    if (editId) await updateTriggerWord(editId, form);
    else await createTriggerWord(form);
    showForm = false;
    await loadData();
  }

  async function remove(id: number) {
    if (confirm(tr().trigger.deleteConfirm)) { await deleteTriggerWord(id); await loadData(); }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">{tr().trigger.heading}</h1>
      <p class="text-sm text-base-content/50">{tr().trigger.subtitle}</p>
    </div>
    <button onclick={openAdd} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> {tr().trigger.add}</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">{editId ? tr().trigger.editTitle : tr().trigger.addTitle}</h3>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().trigger.category}</span></label>
          <select class="select select-bordered" bind:value={form.kategori}>
            {#each KATEGORI as k}<option value={k}>{categoryLabels[k]}</option>{/each}
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().trigger.wordForbidden}</span></label>
          <input type="text" class="input input-bordered input-error" bind:value={form.kata_kalimat_jangan} placeholder={tr().trigger.wordPlaceholder} />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().trigger.context}</span></label>
          <input type="text" class="input input-bordered" bind:value={form.konteks} placeholder={tr().trigger.contextPlaceholder} />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().trigger.safeAlt}</span></label>
          <input type="text" class="input input-bordered input-success" bind:value={form.alternatif_aman} placeholder={tr().trigger.altPlaceholder} />
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick={save} class="btn btn-primary" disabled={!form.kata_kalimat_jangan}>{tr().common.save}</button>
          <button onclick={() => showForm = false} class="btn btn-ghost">{tr().common.cancel}</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else if items.length === 0}
    <div class="text-center py-12 text-base-content/50">
      <p class="text-4xl mb-4">🛡️</p>
      <p>{tr().trigger.empty}</p>
      <p class="text-sm mt-2">{tr().trigger.emptyTip}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each items as item}
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-3 px-4">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3 flex-1">
                <AlertTriangle class="w-5 h-5 text-error mt-0.5 shrink-0" />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="badge badge-sm badge-error">{categoryLabels[item.kategori]}</span>
                  </div>
                  <p class="text-error font-medium">❌ "{item.kata_kalimat_jangan}"</p>
                  {#if item.konteks}
                    <p class="text-xs text-base-content/50">{tr().trigger.contextPrefix}{item.konteks}</p>
                  {/if}
                  {#if item.alternatif_aman}
                    <p class="text-success mt-1">✅ "{item.alternatif_aman}"</p>
                  {/if}
                </div>
              </div>
              <div class="flex gap-1">
                <button onclick={() => openEdit(item)} class="btn btn-xs btn-ghost"><Edit3 class="w-3 h-3" /></button>
                <button onclick={() => remove(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
