<script lang="ts">
  import { getAllOrang, createOrang, updateOrang, deleteOrang, type OrangPenting } from '../lib/db/orang';
  import { Plus, Trash2, Edit3, User } from 'lucide-svelte';

  let items: OrangPenting[] = $state([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let editId: number | null = $state(null);
  let form = $state({ nama: '', relasi: '', role: 'teman', notes: '' });

  const ROLES = ['teman', 'keluarga', 'coworker', 'saudara', 'lainnya'];
  const ROLE_ICONS: Record<string, string> = {
    'teman': '👫', 'keluarga': '👨‍👩‍👧', 'coworker': '💼', 'saudara': '👧', 'lainnya': '👤'
  };

  $effect(() => { loadData(); });

  async function loadData() {
    items = await getAllOrang();
    loaded = true;
  }

  function openAdd() {
    editId = null;
    form = { nama: '', relasi: '', role: 'teman', notes: '' };
    showForm = true;
  }

  function openEdit(item: OrangPenting) {
    editId = item.id;
    form = { nama: item.nama, relasi: item.relasi, role: item.role, notes: item.notes };
    showForm = true;
  }

  async function save() {
    if (editId) await updateOrang(editId, form);
    else await createOrang(form);
    showForm = false;
    await loadData();
  }

  async function remove(id: number) {
    if (confirm('Hapus orang ini?')) { await deleteOrang(id); await loadData(); }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">👥 Orang Penting</h1>
      <p class="text-sm text-base-content/50">Catat temen, keluarga, coworker dia biar gak lupa pas dia cerita</p>
    </div>
    <button onclick={openAdd} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> Tambah</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">{editId ? 'Edit' : 'Tambah'} Orang</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Nama</span></label>
            <input type="text" class="input input-bordered" bind:value={form.nama} placeholder="Nama lengkap" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Relasi ke Dia</span></label>
            <input type="text" class="input input-bordered" bind:value={form.relasi} placeholder="Contoh: Sahabat SMA, Kakak, Bos" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Role</span></label>
            <select class="select select-bordered" bind:value={form.role}>
              {#each ROLES as r}<option value={r}>{ROLE_ICONS[r]} {r}</option>{/each}
            </select>
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Catatan</span></label>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={form.notes} placeholder="Info tambahan: ultah, karakter, hubungan, dll"></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick={save} class="btn btn-primary" disabled={!form.nama}>Simpan</button>
          <button onclick={() => showForm = false} class="btn btn-ghost">Batal</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else if items.length === 0}
    <div class="text-center py-12 text-base-content/50">
      <p class="text-4xl mb-4">👥</p>
      <p>Belum ada data orang penting.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each items as item}
        <div class="card bg-base-100 shadow hover:shadow-md transition-shadow">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-10">
                    <span class="text-lg">{ROLE_ICONS[item.role] || '👤'}</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-bold">{item.nama}</h3>
                  <p class="text-xs text-base-content/50">{item.relasi || item.role}</p>
                </div>
              </div>
              <div class="flex gap-1">
                <button onclick={() => openEdit(item)} class="btn btn-xs btn-ghost"><Edit3 class="w-3 h-3" /></button>
                <button onclick={() => remove(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
              </div>
            </div>
            {#if item.notes}
              <p class="text-sm text-base-content/60 mt-2">{item.notes}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
