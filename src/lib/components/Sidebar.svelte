<script lang="ts">
  import { setRoute, getRoute, NAV_ITEMS, getFeature } from '../stores/app.svelte';
  import { getLocale, t } from '../i18n';
  import type { Route } from '../stores/app.svelte';
  import * as Icons from 'lucide-svelte';

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

  function iconComponent(name: string): any {
    const icons = Icons as any;
    return icons[name] || icons.HelpCircle;
  }

  const visibleItems = $derived(filterItems(NAV_ITEMS));
</script>

<aside class="w-64 border-r flex flex-col h-full transition-all" style="background: var(--bg-card); border-color: var(--border)">
  <div class="p-4 border-b" style="border-color: var(--border)">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--primary)">
        <span class="text-white font-bold text-sm">D</span>
      </div>
      <div>
        <h1 class="text-lg font-bold" style="color: var(--text)">Duple</h1>
        <p class="text-xs" style="color: var(--text-muted)">v0.1.0</p>
      </div>
    </div>
  </div>
  <nav class="flex-1 overflow-y-auto p-2 space-y-0.5">
    {#each visibleItems as item}
      {@const IconComp = iconComponent(item.icon)}
      <button
        onclick={() => navigate(item.route)}
        class="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150 active:scale-[0.98] {currentRoute === item.route ? '' : 'hover:bg-primary/10'}"
        style={currentRoute === item.route ? 'background: var(--primary); color: var(--primary-text)' : ''}
        class:font-semibold={currentRoute === item.route}
      >
        <IconComp class="w-4.5 h-4.5 flex-shrink-0" />
        <span class="text-sm truncate">{label(item)}</span>
      </button>
    {/each}
  </nav>
</aside>
