<script lang="ts">
  let { lines = 3, className = '' }: { lines?: number; className?: string } = $props();
</script>

<div class="animate-pulse space-y-3 {className}">
  {#each Array(lines) as _}
    <div class="h-4 rounded" style="background: var(--bg-hover)"></div>
  {/each}
</div>
