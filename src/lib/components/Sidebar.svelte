<script lang="ts">
  import { setRoute, getRoute, NAV_MAIN, NAV_MORE, getFeature } from '../stores/app.svelte';
  import type { Route } from '../stores/app.svelte';
  import * as Icons from 'lucide-svelte';
  import { ChevronDown, MoreHorizontal } from 'lucide-svelte';
  import { tr } from '../i18n/index.svelte';

  let currentRoute = $derived(getRoute());
  let showMore = $state(false);

  function iconComponent(name: string): any {
    return (Icons as any)[name] || Icons.HelpCircle;
  }

  function filter(items: typeof NAV_MAIN) {
    return items.filter(item => {
      if (item.route === 'siklus') return getFeature('siklus');
      return true;
    });
  }

  const mainItems = $derived(filter(NAV_MAIN));
  const moreItems = $derived(filter(NAV_MORE as any));

  function navigate(route: Route) { setRoute(route); }
</script>

<aside class="w-56 border-r flex flex-col h-full text-sm" style="background: var(--bg-card); border-color: var(--border)">
  <div class="p-3.5 border-b" style="border-color: var(--border)">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--primary)">
        <span class="text-white font-bold text-base">D</span>
      </div>
      <div>
        <span class="font-bold text-base" style="color: var(--text)">Duple</span>
      </div>
    </div>
  </div>

  <nav class="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
    {#each mainItems as item}
      {@const IconComp = iconComponent(item.icon)}
      <button
        onclick={() => navigate(item.route)}
        class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97] {currentRoute !== item.route ? 'hover:bg-primary/10 hover:text-primary' : ''}"
        style={currentRoute === item.route ? 'background: var(--primary); color: var(--primary-text)' : 'color: var(--text)'}
      >
        <IconComp class="w-4.5 h-4.5 flex-shrink-0" />
        <span class="text-sm font-medium">{(tr().nav as any)[item.route] || item.label}</span>
      </button>
    {/each}

    <div class="border-t my-2" style="border-color: var(--border)"></div>

    <button
      onclick={() => showMore = !showMore}
      class="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all hover:bg-primary/10"
      style="color: var(--text-muted)"
    >
      <span class="flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider">
        <MoreHorizontal class="w-4 h-4" />
        {tr().common.more}
      </span>
      <ChevronDown class="w-3.5 h-3.5 transition-transform duration-150" style="transform: {showMore ? 'rotate(0deg)' : 'rotate(-90deg)'}" />
    </button>

    {#if showMore}
      <div class="space-y-0.5 pb-1">
        {#each moreItems as item}
          {@const IconComp = iconComponent(item.icon)}
          <button
            onclick={() => navigate(item.route)}
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 active:scale-[0.97] {currentRoute !== item.route ? 'hover:bg-primary/5' : ''}"
            style={currentRoute === item.route ? 'background: var(--primary); color: var(--primary-text)' : 'color: var(--text)'}
          >
            <IconComp class="w-4 h-4 flex-shrink-0 opacity-70" />
            <span class="text-xs">{(tr().nav as any)[item.route] || item.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </nav>
</aside>
