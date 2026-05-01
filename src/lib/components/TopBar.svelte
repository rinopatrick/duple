<script lang="ts">
  import { toggleSidebar, getSidebarOpen, toggleTheme, getTheme } from '../stores/app.svelte';
  import { getLocale, setLocale } from '../i18n';
  import { Moon, Sun, Menu, Globe } from 'lucide-svelte';

  const sidebarOpen = $derived(getSidebarOpen());
  const theme = $derived(getTheme());
  const locale = $derived(getLocale());

  function toggleLang() {
    setLocale(locale === 'en' ? 'id' : 'en');
  }
</script>

<div class="h-14 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 shrink-0">
  <button
    onclick={toggleSidebar}
    class="btn btn-ghost btn-sm btn-square"
    title="Toggle sidebar"
  >
    <Menu class="w-4 h-4" />
  </button>
  <div class="flex items-center gap-2">
    <button
      onclick={toggleLang}
      class="btn btn-ghost btn-sm"
      title="Toggle language"
    >
      <Globe class="w-4 h-4" />
      <span class="text-xs font-medium">{locale === 'en' ? 'EN' : 'ID'}</span>
    </button>
    <button
      onclick={toggleTheme}
      class="btn btn-ghost btn-sm btn-square"
      title="Toggle theme"
    >
      {#if theme === 'light'}
        <Moon class="w-4 h-4" />
      {:else}
        <Sun class="w-4 h-4" />
      {/if}
    </button>
  </div>
</div>
