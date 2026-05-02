<script lang="ts">
  import { Download, Monitor, Apple, Terminal, X } from 'lucide-svelte';
  import { tr } from '../i18n/index.svelte';

  let { show = false, onClose }: { show: boolean; onClose: () => void } = $props();

  const BASE = 'https://github.com/rinopatrick/duple/releases/latest/download';

  function detectOS(): 'win' | 'mac' | 'linux' {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'mac';
    if (ua.includes('linux') || ua.includes('x11')) return 'linux';
    return 'win';
  }

  function download(platform: string) {
    const files: Record<string, string> = {
      win: `${BASE}/Duple_0.1.1_x64-setup.exe`,
      mac: `${BASE}/Duple_0.1.1_x64.dmg`,
      linux: `${BASE}/Duple_0.1.1_amd64.AppImage`,
    };
    window.open(files[platform] || files.win, '_blank');
  }

  $effect(() => {
    if (show) {
      const os = detectOS();
      setTimeout(() => download(os), 800);
    }
  });
</script>

{#if show}
  <button class="fixed inset-0 bg-black/50 z-50" onclick={onClose}></button>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 p-6 rounded-2xl shadow-2xl space-y-4" style="background: var(--bg-card)">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">Download Duple</h3>
      <button onclick={onClose} class="btn btn-ghost btn-xs btn-square"><X class="w-4 h-4" /></button>
    </div>
    <p class="text-sm text-base-content/60">Download otomatis mendeteksi OS kamu. Atau pilih manual:</p>
    <div class="space-y-2">
      <button onclick={() => download('win')} class="btn btn-outline btn-sm w-full justify-start gap-3">
        <Monitor class="w-4 h-4" /> Windows (.exe)
      </button>
      <button onclick={() => download('mac')} class="btn btn-outline btn-sm w-full justify-start gap-3">
        <Apple class="w-4 h-4" /> macOS (.dmg)
      </button>
      <button onclick={() => download('linux')} class="btn btn-outline btn-sm w-full justify-start gap-3">
        <Terminal class="w-4 h-4" /> Linux (.AppImage)
      </button>
    </div>
    <p class="text-xs text-base-content/40 text-center">Auto-downloading for {detectOS() === 'win' ? 'Windows' : detectOS() === 'mac' ? 'macOS' : 'Linux'}...</p>
  </div>
{/if}
