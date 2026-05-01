<script lang="ts">
  import { setRoute, getRoute, NAV_ITEMS, getFeature } from '../stores/app.svelte';
  import { getLocale, t } from '../i18n';
  import type { Route } from '../stores/app.svelte';

  const currentRoute = $derived(getRoute());

  function filterItems(items: typeof NAV_ITEMS) {
    return items.filter(item => {
      if (item.route === 'siklus') return getFeature('siklus');
      return true;
    });
  }

  function label(item: typeof NAV_ITEMS[number]): string {
    const translations = t().nav;
    return (translations as any)[item.route] || item.label;
  }

  const visibleItems = $derived(filterItems(NAV_ITEMS));

  function navigate(route: Route) {
    setRoute(route);
  }
</script>

<aside class="w-64 bg-base-100 border-r border-base-300 flex flex-col h-full">
  <div class="p-4 border-b border-base-300">
    <h1 class="text-xl font-bold text-primary flex items-center gap-2">
      <span>💙</span> Duple
    </h1>
  </div>
  <nav class="flex-1 overflow-y-auto p-2">
    {#each visibleItems as item}
      <button
        onclick={() => navigate(item.route)}
        class="w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-3 transition-colors"
        class:bg-primary={currentRoute === item.route}
        class:text-primary-content={currentRoute === item.route}
        class:hover:bg-base-200={currentRoute !== item.route}
        class:font-semibold={currentRoute === item.route}
      >
        <span class="text-lg">{item.icon}</span>
        <span class="text-sm">{label(item)}</span>
      </button>
    {/each}
  </nav>
  <div class="p-4 border-t border-base-300">
    <p class="text-xs text-base-content/50 text-center">Duple v0.1.0</p>
  </div>
</aside>
