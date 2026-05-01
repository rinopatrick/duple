<script lang="ts">
  import { getAllRencana, createRencana, updateRencana, deleteRencana, type RencanaTempat } from '../lib/db/rencana';
  import { Plus, Trash2, Edit3, MapPin, ExternalLink, Navigation } from 'lucide-svelte';
  import { formatCurrency } from '../lib/utils/date';

  let items: RencanaTempat[] = $state([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let editId: number | null = $state(null);
  let form = $state({ nama: '', kategori: 'kuliner', lokasi: '', maps_url: '', status: 'wishlist', estimasi_biaya: 0, notes: '' });

  const KATEGORI = ['kuliner', 'wisata', 'outdoor', 'indoor', 'belanja', 'hiburan', 'lainnya'];
  const STATUSES = ['wishlist', 'rencana', 'booked', 'visited'];
  const STATUS_LABELS: Record<string, string> = {
    'wishlist': 'Wishlist', 'rencana': 'Rencana', 'booked': 'Sudah Booking', 'visited': 'Sudah Dikunjungi'
  };
  const STATUS_COLORS: Record<string, string> = {
    'wishlist': 'badge-ghost', 'rencana': 'badge-info', 'booked': 'badge-warning', 'visited': 'badge-success'
  };

  $effect(() => { loadData(); });

  async function loadData() {
    items = await getAllRencana();
    loaded = true;
  }

  function openAdd() {
    editId = null;
    form = { nama: '', kategori: 'kuliner', lokasi: '', maps_url: '', status: 'wishlist', estimasi_biaya: 0, notes: '' };
    showForm = true;
  }

  function openEdit(item: RencanaTempat) {
    editId = item.id;
    form = { nama: item.nama, kategori: item.kategori, lokasi: item.lokasi, maps_url: item.maps_url || '', status: item.status, estimasi_biaya: item.estimasi_biaya, notes: item.notes };
    showForm = true;
  }

  function getGoogleMapsUrl(item: RencanaTempat): string {
    if (item.maps_url) return item.maps_url;
    const query = encodeURIComponent(`${item.nama} ${item.lokasi}`.trim());
    return `https://www.google.com/maps/search/${query}`;
  }

  function getDirectionsUrl(item: RencanaTempat): string {
    if (item.maps_url) {
      return item.maps_url.replace('/place/', '/dir/');
    }
    const query = encodeURIComponent(`${item.nama} ${item.lokasi}`.trim());
    return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  }

  async function save() {
    if (editId) await updateRencana(editId, form);
    else await createRencana(form);
    showForm = false;
    await loadData();
  }

  async function remove(id: number) {
    if (confirm('Hapus tempat ini?')) { await deleteRencana(id); await loadData(); }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">📅 Rencana Tempat</h1>
    <button onclick={openAdd} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> Tambah</button>
  </div>

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">{editId ? 'Edit' : 'Tambah'} Tempat</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Nama Tempat</span></label>
            <input type="text" class="input input-bordered" bind:value={form.nama} placeholder="Nama tempat" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Kategori</span></label>
            <select class="select select-bordered" bind:value={form.kategori}>
              {#each KATEGORI as k}<option value={k}>{k}</option>{/each}
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Lokasi</span></label>
            <input type="text" class="input input-bordered" bind:value={form.lokasi} placeholder="Alamat/area" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Status</span></label>
            <select class="select select-bordered" bind:value={form.status}>
              {#each STATUSES as s}<option value={s}>{STATUS_LABELS[s] || s}</option>{/each}
            </select>
          </div>
          <div class="form-control md:col-span-2">
            <label class="label"><span class="label-text">Google Maps URL</span></label>
            <input type="url" class="input input-bordered" bind:value={form.maps_url} placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/place/..." />
            <span class="text-xs text-base-content/50 mt-1">Share link dari Google Maps → copy paste di sini</span>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Estimasi Biaya</span></label>
            <input type="number" class="input input-bordered" bind:value={form.estimasi_biaya} />
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Catatan</span></label>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={form.notes}></textarea>
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick={save} class="btn btn-primary">Simpan</button>
          <button onclick={() => showForm = false} class="btn btn-ghost">Batal</button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else if items.length === 0}
    <div class="text-center py-12 text-base-content/50">
      <p class="text-4xl mb-4">🗺️</p>
      <p>Belum ada rencana tempat.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each items as item}
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <h3 class="font-bold">{item.nama}</h3>
              <span class="badge {STATUS_COLORS[item.status] || 'badge-ghost'}">{STATUS_LABELS[item.status] || item.status}</span>
            </div>
            <div class="space-y-1 mt-2">
              <span class="badge badge-sm badge-outline">{item.kategori}</span>
              {#if item.lokasi}
                <p class="text-xs flex items-center gap-1 text-base-content/60"><MapPin class="w-3 h-3" /> {item.lokasi}</p>
              {/if}
              {#if item.estimasi_biaya > 0}
                <p class="text-xs font-medium">{formatCurrency(item.estimasi_biaya)}</p>
              {/if}
              {#if item.notes}
                <p class="text-xs text-base-content/50">{item.notes}</p>
              {/if}
            </div>
            <div class="flex gap-1 justify-between items-center mt-2">
              <div class="flex gap-1">
                <a href={getGoogleMapsUrl(item)} target="_blank" rel="noopener" class="btn btn-xs btn-ghost" title="Buka di Google Maps">
                  <ExternalLink class="w-3 h-3" /> Maps
                </a>
                <a href={getDirectionsUrl(item)} target="_blank" rel="noopener" class="btn btn-xs btn-ghost" title="Petunjuk arah">
                  <Navigation class="w-3 h-3" /> Arah
                </a>
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
