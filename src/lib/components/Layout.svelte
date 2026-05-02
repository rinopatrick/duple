<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import TopBar from './TopBar.svelte';
  import Dashboard from '../../pages/Dashboard.svelte';
  import MakananPage from '../../pages/MakananPage.svelte';
  import LogMakananPage from '../../pages/LogMakananPage.svelte';
  import SiklusPage from '../../pages/SiklusPage.svelte';
  import MoodPage from '../../pages/MoodPage.svelte';
  import RekomendasiPage from '../../pages/RekomendasiPage.svelte';
  import RencanaPage from '../../pages/RencanaPage.svelte';
  import MomenPage from '../../pages/MomenPage.svelte';
  import WishlistPage from '../../pages/WishlistPage.svelte';
  import TriggerPage from '../../pages/TriggerPage.svelte';
  import OrangPage from '../../pages/OrangPage.svelte';
  import DateGeneratorPage from '../../pages/DateGeneratorPage.svelte';
  import StatsPage from '../../pages/StatsPage.svelte';
  import ApologyPage from '../../pages/ApologyPage.svelte';
  import LoveQuizPage from '../../pages/LoveQuizPage.svelte';
  import HealthCheckPage from '../../pages/HealthCheckPage.svelte';
  import CalendarExportPage from '../../pages/CalendarExportPage.svelte';
  import LLMPage from '../../pages/LLMPage.svelte';
  import SettingsPage from '../../pages/SettingsPage.svelte';
  import { getRoute, getSidebarOpen, toggleSidebar } from '../stores/app.svelte';
  import { sendDesktopNotifications } from '../engine/reminders';

  const route = $derived(getRoute());
  const sidebarOpen = $derived(getSidebarOpen());

  $effect(() => {
    sendDesktopNotifications();
  });
</script>

<div class="flex h-screen overflow-hidden bg-base-200">
  <!-- Desktop sidebar (always visible) -->
  <div class="hidden lg:flex shrink-0">
    {#if sidebarOpen}
      <Sidebar />
    {/if}
  </div>

  <!-- Mobile sidebar (overlay) -->
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
      {#if route === 'dashboard'}
        <Dashboard />
      {:else if route === 'makanan'}
        <MakananPage />
      {:else if route === 'log-makanan'}
        <LogMakananPage />
      {:else if route === 'siklus'}
        <SiklusPage />
      {:else if route === 'mood'}
        <MoodPage />
      {:else if route === 'rekomendasi'}
        <RekomendasiPage />
      {:else if route === 'rencana'}
        <RencanaPage />
      {:else if route === 'momen'}
        <MomenPage />
      {:else if route === 'wishlist'}
        <WishlistPage />
      {:else if route === 'trigger'}
        <TriggerPage />
      {:else if route === 'orang'}
        <OrangPage />
      {:else if route === 'date-generator'}
        <DateGeneratorPage />
      {:else if route === 'stats'}
        <StatsPage />
      {:else if route === 'apology'}
        <ApologyPage />
      {:else if route === 'quiz'}
        <LoveQuizPage />
      {:else if route === 'health'}
        <HealthCheckPage />
      {:else if route === 'calendar'}
        <CalendarExportPage />
      {:else if route === 'ai'}
        <LLMPage />
      {:else if route === 'settings'}
        <SettingsPage />
      {/if}
      </div>
    </main>
  </div>
</div>
