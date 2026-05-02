<script lang="ts">
  import { UtensilsCrossed, Calendar, Lightbulb, Lock, Download } from 'lucide-svelte';
  import { tr } from '../i18n/index.svelte';
  import DownloadModal from './DownloadModal.svelte';

  let { onStart }: { onStart: () => void } = $props();
  let showDownload = $state(false);

  function doDownload(e: Event) {
    e.preventDefault();
    showDownload = true;
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" style="background: var(--bg)">
  <div class="max-w-lg space-y-8">
    <div class="space-y-3">
      <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style="background: var(--primary)">
        <span class="text-white text-2xl font-bold">D</span>
      </div>
      <h1 class="text-4xl font-bold" style="color: var(--text)">Duple</h1>
      <p class="text-lg" style="color: var(--text-muted)">{tr().landing.title}</p>
    </div>

    <div class="space-y-4 text-left">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--primary)">
          <UtensilsCrossed class="w-5 h-5" style="color: var(--primary-text)" />
        </div>
        <div>
          <p class="font-semibold" style="color: var(--text)">{tr().landing.f1t}</p>
          <p class="text-sm" style="color: var(--text-muted)">{tr().landing.f1d}</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--error)">
          <Calendar class="w-5 h-5" style="color: var(--error-text)" />
        </div>
        <div>
          <p class="font-semibold" style="color: var(--text)">{tr().landing.f2t}</p>
          <p class="text-sm" style="color: var(--text-muted)">{tr().landing.f2d}</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--warning)">
          <Lightbulb class="w-5 h-5" style="color: var(--warning-text)" />
        </div>
        <div>
          <p class="font-semibold" style="color: var(--text)">{tr().landing.f3t}</p>
          <p class="text-sm" style="color: var(--text-muted)">{tr().landing.f3d}</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background: var(--secondary)">
          <Lock class="w-5 h-5" style="color: var(--secondary-text)" />
        </div>
        <div>
          <p class="font-semibold" style="color: var(--text)">{tr().landing.f4t}</p>
          <p class="text-sm" style="color: var(--text-muted)">{tr().landing.f4d}</p>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <button onclick={onStart} class="btn btn-primary btn-lg w-full" style="font-size:1.125rem; padding: 1rem 2rem;">
        {tr().landing.start}
      </button>
      <div class="flex gap-2">
        <button onclick={doDownload} class="btn btn-outline btn-sm flex-1 gap-1">
          <Download class="w-3.5 h-3.5" /> Desktop App
        </button>
        <a href="https://saweria.co/rinopatrick" target="_blank" rel="noopener" class="btn btn-outline btn-sm flex-1 gap-1 text-warning">
          💰 Support
        </a>
      </div>
      <p class="text-xs" style="color: var(--text-soft)">{tr().landing.sub}</p>
    </div>
  </div>
  <DownloadModal show={showDownload} onClose={() => showDownload = false} />
</div>
