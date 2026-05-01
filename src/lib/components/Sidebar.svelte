<script lang="ts">
  import { setRoute, getRoute, NAV_GROUPS, getFeature } from '../stores/app.svelte';
  import { getLocale, t } from '../i18n';
  import type { Route } from '../stores/app.svelte';
  import * as Icons from 'lucide-svelte';
  import { ChevronDown } from 'lucide-svelte';

  const currentRoute = $derived(getRoute());
  let expanded = $state<Record<string, boolean>>({ Main: true });

  function toggleGroup(label: string) {
    expanded = { ...expanded, [label]: !expanded[label] };
  }

  function isExpanded(label: string): boolean {
    return expanded[label] !== false;
  }

  function label(item: { label: string; route: Route }): string {
    const translations = t().nav;
    return (translations as any)[item.route] || item.label;
  }

  function iconComponent(name: string): any {
    return (Icons as any)[name] || Icons.HelpCircle;
  }

  function filterItems(items: typeof NAV_GROUPS[number]['items']) {
    return items.filter(item => {
      if (item.route === 'siklus') return getFeature('siklus');
      return true;
    });
  }

  function navigate(route: Route) { setRoute(route); }
</script>

<aside class="w-56 border-r flex flex-col h-full text-sm" style="background: var(--bg-card); border-color: var(--border)">
  <div class="p-3 border-b" style="border-color: var(--border)">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style="background: var(--primary)">
        <span class="text-white font-bold text-xs">D</span>
      </div>
      <span class="font-bold" style="color: var(--text)">Duple</span>
    </div>
  </div>

  <nav class="flex-1 overflow-y-auto py-2">
    {#each NAV_GROUPS as group}
      {@const visibleItems = filterItems(group.items)}
      {#if visibleItems.length > 0}
        <button
          onclick={() => toggleGroup(group.label)}
          class="w-full flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style="color: var(--text-soft)"
        >
          <ChevronDown class="w-3 h-3 transition-transform duration-150" style="transform: {isExpanded(group.label) ? 'rotate(0deg)' : 'rotate(-90deg)'}" />
          {group.label}
        </button>
        {#if isExpanded(group.label)}
          <div class="space-y-0.5 px-1.5 mb-1">
            {#each visibleItems as item}
              {@const IconComp = iconComponent(item.icon)}
              <button
                onclick={() => navigate(item.route)}
                class="w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-all duration-150 active:scale-[0.97] {currentRoute !== item.route ? 'hover:bg-primary/10' : ''} {currentRoute === item.route ? 'font-medium' : ''}"
                style={currentRoute === item.route ? 'background: var(--primary); color: var(--primary-text)' : ''}
              >
                <IconComp class="w-4 h-4 flex-shrink-0" />
                <span class="truncate text-xs">{label(item)}</span>
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    {/each}
  </nav>
</aside>
