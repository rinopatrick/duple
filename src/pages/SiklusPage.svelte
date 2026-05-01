<script lang="ts">
  import { getAllSiklus, createSiklus, updateSiklus, deleteSiklus, type SiklusHaid } from '../lib/db/siklus';
  import { Plus, Trash2, Edit3 } from 'lucide-svelte';
  import { formatDate, today, daysBetween, addDays } from '../lib/utils/date';
  import dayjs from 'dayjs';

  let items: SiklusHaid[] = $state([]);
  let loaded = $state(false);
  let showForm = $state(false);
  let editId: number | null = $state(null);
  let form = $state({ tgl_mulai: '', tgl_selesai: '', flow_intensity: 3, symptoms: '[]', notes: '' });
  let selectedSymptoms: string[] = $state([]);

  const SYMPTOMS = ['Kram', 'Pusing', 'Mual', 'Sakit Punggung', 'Ngidam', 'Lelah', 'Sensitif', 'Nyeri Payudara'];

  $effect(() => { loadData(); });

  async function loadData() {
    items = await getAllSiklus();
    loaded = true;
  }

  function openAdd() {
    editId = null;
    form = { tgl_mulai: today(), tgl_selesai: '', flow_intensity: 3, symptoms: '[]', notes: '' };
    selectedSymptoms = [];
    showForm = true;
  }

  function openEdit(item: SiklusHaid) {
    editId = item.id;
    form = { tgl_mulai: item.tgl_mulai, tgl_selesai: item.tgl_selesai, flow_intensity: item.flow_intensity, symptoms: item.symptoms, notes: item.notes };
    selectedSymptoms = JSON.parse(item.symptoms || '[]');
    showForm = true;
  }

  async function save() {
    const data = { ...form, symptoms: JSON.stringify(selectedSymptoms) };
    if (editId) await updateSiklus(editId, data);
    else await createSiklus(data);
    showForm = false;
    await loadData();
  }

  async function remove(id: number) {
    if (confirm('Hapus data siklus ini?')) {
      await deleteSiklus(id);
      await loadData();
    }
  }

  function toggleSymptom(s: string) {
    selectedSymptoms = selectedSymptoms.includes(s)
      ? selectedSymptoms.filter(x => x !== s)
      : [...selectedSymptoms, s];
  }

  function durasiSiklus(item: SiklusHaid) {
    return daysBetween(item.tgl_mulai, item.tgl_selesai) || 0;
  }

  function prediksiBerikutnya(): string {
    if (items.length < 2) return 'Minimal 2 siklus untuk prediksi';
    const cycles: number[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      const d = dayjs(items[i].tgl_mulai).diff(dayjs(items[i + 1].tgl_mulai), 'day');
      if (d > 0) cycles.push(d);
    }
    if (cycles.length === 0) return 'Data tidak cukup';
    const avg = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    const next = dayjs(items[0].tgl_mulai).add(avg, 'day');
    const days = next.diff(dayjs(), 'day');
    if (days < 0) return 'Sudah lewat';
    if (days === 0) return 'Prediksi: Hari ini';
    return `Prediksi: ${days} hari lagi (${next.format('DD MMM YYYY')}) — Siklus rata-rata ${avg} hari`;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">🩸 Siklus Haid Tracker</h1>
    <button onclick={openAdd} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> Tambah Siklus</button>
  </div>

  <div class="alert alert-info">
    <div class="flex-1">
      <p class="font-bold">🔮 Prediksi Siklus</p>
      <p class="text-sm">{prediksiBerikutnya()}</p>
    </div>
  </div>

  {#if items.length >= 2}
    <div class="card bg-base-100 shadow p-4">
      <div class="flex gap-1 overflow-x-auto">
        {#each Array.from({ length: 35 }, (_, i) => dayjs().subtract(7, 'day').add(i, 'day')) as day}
          {@const dstr = day.format('YYYY-MM-DD')}
          {@const isHaid = items.find(item => dstr >= item.tgl_mulai && dstr <= item.tgl_selesai)}
          {@const isPredicted = (() => {
            if (items.length < 2) return false;
            const cycles: number[] = [];
            for (let i = 0; i < items.length - 1; i++) {
              const d = dayjs(items[i].tgl_mulai).diff(dayjs(items[i + 1].tgl_mulai), 'day');
              if (d > 0) cycles.push(d);
            }
            if (cycles.length === 0) return false;
            const avg = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
            const predicted = dayjs(items[0].tgl_mulai).add(avg, 'day');
            const nextEnd = items[0].tgl_selesai
              ? predicted.add(daysBetween(items[0].tgl_mulai, items[0].tgl_selesai), 'day')
              : predicted.add(5, 'day');
            return dstr >= predicted.format('YYYY-MM-DD') && dstr <= nextEnd.format('YYYY-MM-DD');
          })()}
          <div class="flex flex-col items-center min-w-[36px]">
            <span class="text-xs text-base-content/50">{day.format('DD')}</span>
            <span class="text-[10px] text-base-content/30">{day.format('ddd')}</span>
            <div
              class="w-7 h-7 rounded-full mt-1 flex items-center justify-center text-xs {isHaid ? 'bg-error text-error-content' : isPredicted ? 'bg-error/20' : 'bg-base-200'}"
            >
              {day.format('D')}
            </div>
          </div>
        {/each}
      </div>
      <div class="flex gap-4 mt-2 text-xs">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-error inline-block"></span> Haid</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-error/20 inline-block"></span> Prediksi</span>
      </div>
    </div>
  {/if}

  {#if showForm}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h3 class="card-title">{editId ? 'Edit' : 'Tambah'} Siklus Haid</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Tanggal Mulai</span></label>
            <input type="date" class="input input-bordered" bind:value={form.tgl_mulai} />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Tanggal Selesai</span></label>
            <input type="date" class="input input-bordered" bind:value={form.tgl_selesai} />
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Intensitas Flow (1-5)</span></label>
          <input type="range" min="1" max="5" class="range range-error" bind:value={form.flow_intensity} />
          <span class="text-xs text-center">{form.flow_intensity}</span>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">Gejala</span></label>
          <div class="flex gap-2 flex-wrap">
            {#each SYMPTOMS as s}
              <button
                class="btn btn-xs"
                class:btn-error={selectedSymptoms.includes(s)}
                class:btn-outline={!selectedSymptoms.includes(s)}
                onclick={() => toggleSymptom(s)}
              >{s}</button>
            {/each}
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
      <p class="text-4xl mb-4">📅</p>
      <p>Belum ada data siklus. Tambahin siklus pertama!</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each items as item}
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-3 px-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">
                  {formatDate(item.tgl_mulai)} → {formatDate(item.tgl_selesai)}
                  <span class="badge badge-sm ml-2">{(item.tgl_selesai && item.tgl_mulai) ? durasiSiklus(item) + ' hari' : ''}</span>
                </p>
                <div class="flex gap-1 mt-1">
                  <span class="text-xs">Flow: {'🔴'.repeat(item.flow_intensity)}{'⚪'.repeat(5 - item.flow_intensity)}</span>
                </div>
                {#if item.symptoms && item.symptoms !== '[]'}
                  <div class="flex gap-1 flex-wrap mt-1">
                    {#each JSON.parse(item.symptoms) as s}
                      <span class="badge badge-xs badge-outline">{s}</span>
                    {/each}
                  </div>
                {/if}
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
