<script lang="ts">
  import { getAllMakanan, type MakananFavorit } from '../lib/db/makanan';
  import { getAllRencana, type RencanaTempat } from '../lib/db/rencana';
  import { getAllMoodLogs, type MoodLog } from '../lib/db/mood';
  import { tr } from '../lib/i18n';
  import { setRoute } from '../lib/stores/app.svelte';
  import { Shuffle, Sparkles, MapPin, Utensils, Heart } from 'lucide-svelte';

  let makanan: MakananFavorit[] = $state([]);
  let places: RencanaTempat[] = $state([]);
  let pickedFood: MakananFavorit | null = $state(null);
  let pickedPlace: RencanaTempat | null = $state(null);
  let mood: string = $state('');
  let loaded = $state(false);

  const moodLabels = $derived(tr().dategenerator.moodLabels);

  $effect(() => { load(); });

  async function load() {
    const [m, p] = await Promise.all([getAllMakanan(), getAllRencana()]);
    makanan = m;
    places = p.filter((p: RencanaTempat) => p.status !== 'visited');
    loaded = true;
  }

  function generate() {
    if (makanan.length === 0 && places.length === 0) return;
    pickedFood = makanan.length > 0 ? makanan[Math.floor(Math.random() * makanan.length)] : null;
    pickedPlace = places.length > 0 ? places[Math.floor(Math.random() * places.length)] : null;
    const moods = ['romantis', 'adventurous', 'cozy', 'fun', 'chill'];
    mood = moods[Math.floor(Math.random() * moods.length)];
  }

  function getMapUrl(place: RencanaTempat): string {
    if (place.maps_url) return place.maps_url;
    return `https://www.google.com/maps/search/${encodeURIComponent(place.nama + ' ' + place.lokasi)}`;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">{tr().dategenerator.heading}</h1>
  </div>

  {#if !loaded}
    <div class="flex justify-center"><span class="loading loading-spinner"></span></div>
  {:else}
    {#if makanan.length === 0 && places.length === 0}
      <div class="text-center py-12 text-base-content/50">
        <p class="text-4xl mb-4">🎲</p>
        <p class="mb-2">{tr().dategenerator.empty}</p>
        <div class="flex gap-2 justify-center">
          <button onclick={() => setRoute('makanan')} class="btn btn-primary btn-sm">{tr().dategenerator.addFood}</button>
          <button onclick={() => setRoute('rencana')} class="btn btn-secondary btn-sm">{tr().dategenerator.addPlace}</button>
        </div>
      </div>
    {:else}
      <div class="text-center">
        <button onclick={generate} class="btn btn-primary btn-lg">
          <Shuffle class="w-5 h-5" /> {tr().dategenerator.generate}
        </button>
        <p class="text-xs text-base-content/50 mt-2">
          {tr().dategenerator.available.replace('{nFood}', String(makanan.length)).replace('{nPlace}', String(places.length))}
        </p>
      </div>

      {#if pickedFood || pickedPlace}
        <div class="max-w-lg mx-auto space-y-4">
          <div class="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow border border-primary/20">
            <div class="card-body text-center">
              <Sparkles class="w-8 h-8 mx-auto text-primary" />
              <p class="text-lg font-bold capitalize mt-2">{moodLabels[mood] || mood} date night ✨</p>
            </div>
          </div>

          {#if pickedPlace}
            <div class="card bg-base-100 shadow">
              <div class="card-body">
                <div class="flex items-center gap-3">
                  <div class="bg-primary/10 p-3 rounded-lg">
                    <MapPin class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 class="font-bold text-lg">{pickedPlace.nama}</h2>
                    {#if pickedPlace.lokasi}
                      <p class="text-sm text-base-content/60">{pickedPlace.lokasi}</p>
                    {/if}
                    <span class="badge badge-sm badge-outline mt-1">{pickedPlace.kategori}</span>
                    {#if pickedPlace.estimasi_biaya > 0}
                      <span class="text-xs ml-2">~Rp {pickedPlace.estimasi_biaya.toLocaleString('id')}</span>
                    {/if}
                  </div>
                </div>
                <div class="flex gap-2 mt-3">
                  <a href={getMapUrl(pickedPlace)} target="_blank" rel="noopener" class="btn btn-outline btn-sm flex-1">
                    {tr().dategenerator.openMaps}
                  </a>
                  <a href={getMapUrl(pickedPlace).replace('/place/', '/dir/').replace('/search/', '/dir/?api=1&destination=')} target="_blank" rel="noopener" class="btn btn-outline btn-sm flex-1">
                    {tr().dategenerator.directions}
                  </a>
                </div>
              </div>
            </div>
          {/if}

          {#if pickedFood}
            <div class="card bg-base-100 shadow">
              <div class="card-body">
                <div class="flex items-center gap-3">
                  <div class="bg-secondary/10 p-3 rounded-lg">
                    <Utensils class="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 class="font-bold text-lg">{pickedFood.nama}</h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="badge badge-sm">{pickedFood.kategori}</span>
                      <span class="text-yellow-500 text-xs">{'★'.repeat(pickedFood.rating)}{'☆'.repeat(5 - pickedFood.rating)}</span>
                    </div>
                    {#if pickedFood.notes}
                      <p class="text-xs text-base-content/50 mt-1">{pickedFood.notes}</p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <div class="text-center">
            <button onclick={generate} class="btn btn-ghost">
              <Shuffle class="w-4 h-4" /> {tr().dategenerator.retry}
            </button>
          </div>
        </div>
      {:else}
        <div class="text-center py-8 text-base-content/50">
          <p class="text-4xl mb-2">🎲</p>
          <p>{tr().dategenerator.prompt}</p>
        </div>
      {/if}
    {/if}
  {/if}
</div>
