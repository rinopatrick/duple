<script lang="ts">
  import { getAllWishlist, createWishlist, updateWishlist, deleteWishlist, getAllUkuran, createUkuran, deleteUkuran, type WishlistHadiah, type UkuranPasangan } from '../lib/db/wishlist';
  import { tr } from '../lib/i18n';
  import { Plus, Trash2, Edit3, Gift, Ruler } from 'lucide-svelte';
  import { formatCurrency } from '../lib/utils/date';

  let wishlists: WishlistHadiah[] = $state([]);
  let ukurans: UkuranPasangan[] = $state([]);
  let loaded = $state(false);
  let tab = $state<'wishlist' | 'ukuran'>('wishlist');
  let showFormWishlist = $state(false);
  let showFormUkuran = $state(false);
  let editWishlistId: number | null = $state(null);

  let formWishlist = $state({ nama_barang: '', harga_estimasi: 0, status: 'belum_dibeli', occasion: 'random', notes: '' });
  let formUkuran = $state({ kategori: 'baju', ukuran: '', brand_favorit: '', notes: '' });

  const OCCASIONS = ['ultah', 'anniv', 'valentine', 'random', 'lainnya'];
  const STATUS_OPTIONS = ['belum_dibeli', 'sudah_dibeli', 'diberikan'];
  const UKURAN_KATEGORI = ['baju', 'celana', 'sepatu', 'cincin', 'rok', 'dress', 'jaket'];

  const occasionLabels = $derived(tr().wishlist.occasions);
  const statusLabels = $derived(tr().wishlist.statuses);
  const sizeCategoryLabels = $derived(tr().wishlist.sizeCategories);

  $effect(() => { loadData(); });

  async function loadData() {
    [wishlists, ukurans] = await Promise.all([getAllWishlist(), getAllUkuran()]);
    loaded = true;
  }

  async function saveWishlist() {
    if (editWishlistId) await updateWishlist(editWishlistId, formWishlist);
    else await createWishlist(formWishlist);
    showFormWishlist = false;
    editWishlistId = null;
    await loadData();
  }

  async function removeWishlist(id: number) {
    if (confirm(tr().wishlist.deleteWishlist)) { await deleteWishlist(id); await loadData(); }
  }

  function editWishlist(item: WishlistHadiah) {
    editWishlistId = item.id;
    formWishlist = { nama_barang: item.nama_barang, harga_estimasi: item.harga_estimasi, status: item.status, occasion: item.occasion, notes: item.notes };
    showFormWishlist = true;
  }

  async function saveUkuran() {
    await createUkuran(formUkuran);
    showFormUkuran = false;
    formUkuran = { kategori: 'baju', ukuran: '', brand_favorit: '', notes: '' };
    await loadData();
  }

  async function removeUkuran(id: number) {
    if (confirm(tr().wishlist.deleteSize)) { await deleteUkuran(id); await loadData(); }
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">{tr().wishlist.heading}</h1>

  <div class="tabs tabs-boxed">
    <button class="tab" class:tab-active={tab === 'wishlist'} onclick={() => tab = 'wishlist'}>{tr().wishlist.tabGifts}</button>
    <button class="tab" class:tab-active={tab === 'ukuran'} onclick={() => tab = 'ukuran'}>{tr().wishlist.tabSizes}</button>
  </div>

  {#if tab === 'wishlist'}
    <div class="flex justify-end">
      <button onclick={() => { editWishlistId = null; formWishlist = { nama_barang: '', harga_estimasi: 0, status: 'belum_dibeli', occasion: 'random', notes: '' }; showFormWishlist = true; }}
              class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> {tr().wishlist.addGift}</button>
    </div>

    {#if showFormWishlist}
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">{editWishlistId ? tr().wishlist.editGiftTitle : tr().wishlist.addGiftTitle}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">{tr().wishlist.itemName}</span></label>
              <input type="text" class="input input-bordered" bind:value={formWishlist.nama_barang} placeholder={tr().wishlist.itemPlaceholder} />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{tr().wishlist.estimatedPrice}</span></label>
              <input type="number" class="input input-bordered" bind:value={formWishlist.harga_estimasi} />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{tr().wishlist.occasion}</span></label>
              <select class="select select-bordered" bind:value={formWishlist.occasion}>
                {#each OCCASIONS as o}<option value={o}>{occasionLabels[o]}</option>{/each}
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{tr().wishlist.status}</span></label>
              <select class="select select-bordered" bind:value={formWishlist.status}>
                {#each STATUS_OPTIONS as s}<option value={s}>{statusLabels[s]}</option>{/each}
              </select>
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().common.notes}</span></label>
            <textarea class="textarea textarea-bordered" rows="2" bind:value={formWishlist.notes}></textarea>
          </div>
          <div class="flex gap-2 mt-3">
            <button onclick={saveWishlist} class="btn btn-primary">{tr().common.save}</button>
            <button onclick={() => showFormWishlist = false} class="btn btn-ghost">{tr().common.cancel}</button>
          </div>
        </div>
      </div>
    {/if}

    {#if !loaded}
      <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
    {:else if wishlists.length === 0}
      <div class="text-center py-12 text-base-content/50"><p class="text-4xl mb-4">🎁</p><p>{tr().wishlist.emptyWishlist}</p></div>
    {:else}
      <div class="space-y-2">
        {#each wishlists as item}
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body py-3 px-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <Gift class="w-5 h-5 text-secondary" />
                  <div>
                    <p class="font-medium">{item.nama_barang}</p>
                    <div class="flex gap-2 mt-1">
                      <span class="badge badge-xs">{occasionLabels[item.occasion]}</span>
                      <span class="badge badge-xs" class:badge-success={item.status === 'sudah_dibeli'} class:badge-ghost={item.status === 'belum_dibeli'}>{statusLabels[item.status]}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  {#if item.harga_estimasi > 0}
                    <span class="text-sm font-medium">{formatCurrency(item.harga_estimasi)}</span>
                  {/if}
                  <button onclick={() => editWishlist(item)} class="btn btn-xs btn-ghost"><Edit3 class="w-3 h-3" /></button>
                  <button onclick={() => removeWishlist(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

  {:else}
    <div class="flex justify-end">
      <button onclick={() => showFormUkuran = true} class="btn btn-primary btn-sm"><Plus class="w-4 h-4" /> {tr().wishlist.addSize}</button>
    </div>

    {#if showFormUkuran}
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">{tr().wishlist.addSize}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">{tr().wishlist.sizeCategory}</span></label>
              <select class="select select-bordered" bind:value={formUkuran.kategori}>
                {#each UKURAN_KATEGORI as k}<option value={k}>{sizeCategoryLabels[k]}</option>{/each}
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">{tr().wishlist.sizeValue}</span></label>
              <input type="text" class="input input-bordered" bind:value={formUkuran.ukuran} placeholder={tr().wishlist.sizeValuePlaceholder} />
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().wishlist.brandFav}</span></label>
            <input type="text" class="input input-bordered" bind:value={formUkuran.brand_favorit} />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().common.notes}</span></label>
            <textarea class="textarea textarea-bordered" rows="2" bind:value={formUkuran.notes}></textarea>
          </div>
          <div class="flex gap-2 mt-3">
            <button onclick={saveUkuran} class="btn btn-primary" disabled={!formUkuran.ukuran}>{tr().common.save}</button>
            <button onclick={() => showFormUkuran = false} class="btn btn-ghost">{tr().common.cancel}</button>
          </div>
        </div>
      </div>
    {/if}

    {#if ukurans.length === 0}
      <div class="text-center py-12 text-base-content/50"><p class="text-4xl mb-4">📏</p><p>{tr().wishlist.emptySizes}</p></div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each ukurans as item}
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <div class="flex justify-between items-start">
                <h3 class="font-bold">{sizeCategoryLabels[item.kategori]}</h3>
                <button onclick={() => removeUkuran(item.id)} class="btn btn-xs btn-ghost text-error"><Trash2 class="w-3 h-3" /></button>
              </div>
              <p class="text-2xl font-bold text-primary">{item.ukuran}</p>
              {#if item.brand_favorit}
                <p class="text-xs text-base-content/50">{tr().wishlist.brandPrefix}{item.brand_favorit}</p>
              {/if}
              {#if item.notes}
                <p class="text-xs text-base-content/60">{item.notes}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
