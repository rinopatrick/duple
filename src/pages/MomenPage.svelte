<script lang="ts">
  import { getAllMomen, createMomen, deleteMomen, type Momen } from '../lib/db/momen';
  import { Plus, Trash2, Calendar } from 'lucide-svelte';
  import { formatDate, addDays, daysBetween } from '../lib/utils/date';
  import dayjs from 'dayjs';

  let items: Momen[] = $state([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let form = $state({ nama: '', tanggal: '', kategori: 'date', notes: '' });

  const KATEGORI = ['anniversary', 'date', 'special', 'ultah', 'random'];
  const ICONS: Record<string, string> = {
    'anniversary': '💝', 'date': '🌹', 'special': '✨', 'ultah': '🎂', 'random': '📌'
  };

  $effect(() => { loadData(); });

  async function loadData() {
    items = await getAllMomen();
    loaded = true;
  }

  function openAdd() {
    form = { nama: '', tanggal: dayjs().format('YYYY-MM-DD'), kategori: 'date', notes: '' };
    showForm = true;
  }

  async function save() {
    await createMomen(form);
    showForm = false;
    await loadData();
  }

  async function remove(id: number) {
    if (confirm('Hapus momen ini?')) { await deleteMomen(id); await loadData(); }
  }

  function countdown(tanggal: string): string {
    const today = dayjs().format('YYYY-MM-DD');
    const days = daysBetween(today, tanggal);
    if (days === 0) return 'Hari ini! 🎉';
    if (days < 0) return `${Math.abs(days)} hari yang lalu`;
    return `${days} hari lagi`;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">❤️ Momen Spesial</h1>
    <button onclick={openAdd} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> Tambah</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">Tambah Momen</h3>
        <div class="form-control">
          <label class="label"><span class="label-text">Nama Momen</span></label>
          <input type="text" class="input input-bordered" bind:value={form.nama} placeholder="Contoh: Anniversary, First Date, dll" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Tanggal</span></label>
            <input type="date" class="input input-bordered" bind:value={form.tanggal} />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Kategori</span></label>
            <select class="select select-bordered" bind:value={form.kategori}>
              {#each KATEGORI as k}<option value={k}>{ICONS[k]} {k}</option>{/each}
            </select>
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Catatan</span></label>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={form.notes}></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick={save} class="btn btn-primary" disabled={!form.nama || !form.tanggal}>Simpan</button>
          <button onclick={() => showForm = false} class="btn btn-ghost">Batal</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else if items.length === 0}
    <div class="text-center py-12 text-base-content/50">
      <p class="text-4xl mb-4">💝</p>
      <p>Belum ada momen spesial.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each items as item}
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-3 px-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{ICONS[item.kategori] || '📌'}</span>
                <div>
                  <p class="font-medium">{item.nama}</p>
                  <p class="text-xs text-base-content/50">{formatDate(item.tanggal)}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="badge badge-sm">{countdown(item.tanggal)}</span>
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
