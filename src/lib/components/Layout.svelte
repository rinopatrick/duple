<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';
  import { getRoute, getSidebarOpen, toggleSidebar } from '../stores/app.svelte';
  import { tr } from '../i18n/index.svelte';
  import type { SvelteComponent } from 'svelte';

  // Lazy-loaded pages for code splitting
  const pageLoaders: Record<string, () => Promise<{ default: typeof SvelteComponent<any> }>> = {
    dashboard: () => import('../../pages/Dashboard.svelte'),
    makanan: () => import('../../pages/MakananPage.svelte'),
    'log-makanan': () => import('../../pages/LogMakananPage.svelte'),
    siklus: () => import('../../pages/SiklusPage.svelte'),
    mood: () => import('../../pages/MoodPage.svelte'),
    rekomendasi: () => import('../../pages/RekomendasiPage.svelte'),
    rencana: () => import('../../pages/RencanaPage.svelte'),
    momen: () => import('../../pages/MomenPage.svelte'),
    wishlist: () => import('../../pages/WishlistPage.svelte'),
    trigger: () => import('../../pages/TriggerPage.svelte'),
    orang: () => import('../../pages/OrangPage.svelte'),
    'date-generator': () => import('../../pages/DateGeneratorPage.svelte'),
    stats: () => import('../../pages/StatsPage.svelte'),
    apology: () => import('../../pages/ApologyPage.svelte'),
    quiz: () => import('../../pages/LoveQuizPage.svelte'),
    health: () => import('../../pages/HealthCheckPage.svelte'),
    calendar: () => import('../../pages/CalendarExportPage.svelte'),
    ai: () => import('../../pages/LLMPage.svelte'),
    settings: () => import('../../pages/SettingsPage.svelte'),
  };

  const route = $derived(getRoute());
  const sidebarOpen = $derived(getSidebarOpen());

  let PageComponent: typeof SvelteComponent<any> | null = $state(null);
  let pageError = $state('');

  $effect(() => {
    const loader = pageLoaders[route];
    if (loader) {
      pageError = '';
      loader().then(m => { PageComponent = m.default; }).catch(() => {
        pageError = tr().dashboard.loadError;
      });
    }
  });

</script>

<div class="flex h-screen overflow-hidden bg-base-200">
  <div class="hidden lg:flex shrink-0">
    {#if sidebarOpen}
      <Sidebar />
    {/if}
  </div>

  {#if sidebarOpen}
    <div class="lg:hidden fixed inset-0 z-40 flex">
      <div class="absolute inset-0 bg-black/40" onclick={toggleSidebar}></div>
      <div class="relative z-50">
        <Sidebar />
      </div>
    </div>
  {/if}

  <div class="flex flex-col flex-1 overflow-hidden">
    <TopBar />
    <main class="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
      <div style="animation: fadeSlideIn 0.2s ease-out">
        {#if pageError}
          <div class="alert alert-error">{pageError}</div>
        {:else if PageComponent}
          <PageComponent />
        {:else}
          <div class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        {/if}
      </div>
    </main>
  </div>
</div>
