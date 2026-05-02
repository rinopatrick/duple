<script lang="ts">
  import { toggleSidebar, toggleTheme, getTheme, setRoute, NAV_MAIN, NAV_MORE, getFeature } from '../stores/app.svelte';
  import { getLocale, setLocale, tr, type Locale } from '../i18n/index.svelte';
  import { Moon, Sun, PanelLeft, Globe, Search, X, Download, Heart } from 'lucide-svelte';
  import DownloadModal from './DownloadModal.svelte';

  const theme = $derived(getTheme());
  let locale = $derived(getLocale());
  let searchOpen = $state(false);
  let query = $state('');
  let showDownload = $state(false);

  const LANG_LABELS: Record<Locale, string> = { en: 'EN', id: 'ID', es: 'ES', fr: 'FR', pt: 'PT', jp: '日本語' };
  const LANGS: Locale[] = ['en', 'id', 'es', 'fr', 'pt', 'jp'];

  function cycleLang() {
    const idx = LANGS.indexOf(locale);
    setLocale(LANGS[(idx + 1) % LANGS.length]);
  }

  function goToRoute(r: any) { setRoute(r); searchOpen = false; query = ''; }

  const allNav = $derived([
    ...NAV_MAIN,
    ...(NAV_MORE.filter(i => { if (i.route === 'siklus') return getFeature('siklus'); return true; }))
  ]);

  const results = $derived(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allNav.filter((item: any) => item.label.toLowerCase().includes(q) || item.route.includes(q)).slice(0, 8);
  });
</script>

<div class="h-12 border-b flex items-center justify-between px-3 shrink-0" style="background: var(--bg-card); border-color: var(--border)">
  <div class="flex items-center gap-2">
    <button onclick={toggleSidebar} class="btn btn-ghost btn-sm btn-square" title="Toggle sidebar">
      <PanelLeft class="w-4 h-4" />
    </button>
    {#if searchOpen}
      <div class="flex items-center gap-2 relative">
        <Search class="w-3.5 h-3.5 absolute left-2" style="color: var(--text-muted)" />
        <input type="text" class="w-48 text-sm py-1 pl-7 pr-6 rounded-md border outline-none"
               style="background: var(--bg); border-color: var(--border); color: var(--text)"
               bind:value={query} placeholder={tr().common.search} autofocus
               onkeydown={(e: KeyboardEvent) => { if (e.key === 'Escape') { searchOpen = false; query = ''; } }} />
        <button onclick={() => { searchOpen = false; query = ''; }} class="btn btn-ghost btn-xs btn-square"><X class="w-3 h-3" /></button>
        {#if results.length > 0}
          <div class="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-lg border z-50 max-h-64 overflow-y-auto" style="background: var(--bg-card); border-color: var(--border)">
            {#each results as item}
              <button onclick={() => goToRoute(item.route)} class="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex items-center gap-2" style="color: var(--text)">
                <Search class="w-3 h-3 opacity-50" />
                {item.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <button onclick={() => searchOpen = true} class="btn btn-ghost btn-sm hidden md:flex items-center gap-2 text-xs" style="color: var(--text-muted)">
        <Search class="w-3.5 h-3.5" />
        <span>{tr().common.search}</span>
      </button>
    {/if}
  </div>
  <div class="flex items-center gap-1">
    <button onclick={() => showDownload = true} class="btn btn-ghost btn-sm btn-square" title="Download Desktop App">
      <Download class="w-4 h-4" />
    </button>
    <a href="https://saweria.co/rinopatrick" target="_blank" rel="noopener" class="btn btn-ghost btn-sm btn-square text-warning/70" title="Support Duple">
      <Heart class="w-4 h-4" />
    </a>
    <button onclick={cycleLang} class="btn btn-ghost btn-sm flex items-center gap-1" title="Cycle language">
      <Globe class="w-3.5 h-3.5" />
      <span class="text-xs font-medium">{LANG_LABELS[locale]}</span>
    </button>
    <button onclick={toggleTheme} class="btn btn-ghost btn-sm btn-square" title="Toggle theme">
      {#if theme === 'light'}<Moon class="w-4 h-4" />{:else}<Sun class="w-4 h-4" />{/if}
    </button>
  </div>
</div>

<DownloadModal show={showDownload} onClose={() => showDownload = false} />
