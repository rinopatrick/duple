<script lang="ts">
  import { getAllMakanan, createMakanan, updateMakanan, deleteMakanan, type MakananFavorit } from '../lib/db/makanan';
  import { Plus, Trash2, Edit3, Star } from 'lucide-svelte';
  import { tr } from '../lib/i18n';

  let items: MakananFavorit[] = $state([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let editId: number | null = $state(null);
  let form = $state({ nama: '', kategori: 'makanan', rating: 3, mood_tags: '[]', notes: '' });

  const KATEGORI = ['makanan', 'minuman', 'snack', 'dessert'];
  const MOODS = ['senang', 'sedih', 'kesel', 'biasa', 'gaenak'];
  let selectedMoods: string[] = $state([]);

  $effect(() => { loadData(); });

  async function loadData() {
    items = await getAllMakanan();
    loaded = true;
  }

  function openAdd() {
    editId = null;
    form = { nama: '', kategori: 'makanan', rating: 3, mood_tags: '[]', notes: '' };
    selectedMoods = [];
    showForm = true;
  }

  function openEdit(item: MakananFavorit) {
    editId = item.id;
    form = { nama: item.nama, kategori: item.kategori, rating: item.rating, mood_tags: item.mood_tags, notes: item.notes };
    selectedMoods = JSON.parse(item.mood_tags || '[]');
    showForm = true;
  }

  async function save() {
    const data = { ...form, mood_tags: JSON.stringify(selectedMoods) };
    if (editId) await updateMakanan(editId, data);
    else await createMakanan(data);
    showForm = false;
    await loadData();
  }

  async function remove(id: number) {
    if (confirm(tr().makanan.deleteConfirm)) {
      await deleteMakanan(id);
      await loadData();
    }
  }

  function toggleMood(mood: string) {
    if (selectedMoods.includes(mood)) {
      selectedMoods = selectedMoods.filter(m => m !== mood);
    } else {
      selectedMoods = [...selectedMoods, mood];
    }
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆').join('');
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">{tr().makanan.heading}</h1>
    <button onclick={openAdd} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> {tr().makanan.add}</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">{editId ? tr().makanan.editTitle : tr().makanan.addTitle}</h3>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().makanan.name}</span></label>
          <input type="text" class="input input-bordered" bind:value={form.nama} placeholder={tr().makanan.namePlaceholder} />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().makanan.category}</span></label>
          <select class="select select-bordered" bind:value={form.kategori}>
            {#each KATEGORI as k}
              <option value={k}>{tr().makanan.categories[k] || k}</option>
            {/each}
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().makanan.rating} ({renderStars(form.rating)})</span></label>
          <input type="range" min="1" max="5" class="range range-primary" bind:value={form.rating} />
          <div class="flex w-full justify-between px-2 text-xs">
            <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().makanan.moodTags}</span></label>
          <div class="flex gap-2 flex-wrap">
            {#each MOODS as mood}
              <button
                class="btn btn-sm"
                class:btn-primary={selectedMoods.includes(mood)}
                class:btn-outline={!selectedMoods.includes(mood)}
                onclick={() => toggleMood(mood)}
              >{tr().makanan.moods[mood] || mood}</button>
            {/each}
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">{tr().common.notes}</span></label>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={form.notes}></textarea>
        </div>
        <div class="flex gap-2 mt-4">
          <button onclick={save} class="btn btn-primary">{tr().common.save}</button>
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
      <p>{tr().makanan.empty}</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each items as item}
        <div class="card bg-base-100 shadow hover:shadow-md transition-shadow">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg">{item.nama}</h3>
                <span class="badge badge-sm">{tr().makanan.categories[item.kategori] || item.kategori}</span>
              </div>
              <div class="text-yellow-500 text-sm">{renderStars(item.rating)}</div>
            </div>
            {#if item.mood_tags && item.mood_tags !== '[]'}
              <div class="flex gap-1 flex-wrap mt-2">
                {#each JSON.parse(item.mood_tags) as tag}
                  <span class="badge badge-xs badge-outline">{tr().makanan.moods[tag] || tag}</span>
                {/each}
              </div>
            {/if}
            {#if item.notes}
              <p class="text-xs text-base-content/60 mt-1">{item.notes}</p>
            {/if}
            <div class="flex gap-1 justify-end mt-2">
              <button onclick={() => openEdit(item)} class="btn btn-xs btn-ghost"><Edit3 class="w-3 h-3" /></button>
              <button onclick={() => remove(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
