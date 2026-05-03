<script lang="ts">
  import { Monitor, Apple, Terminal, X, PlusSquare } from 'lucide-svelte';
  import { tr } from '../i18n/index.svelte';

  let { show = false, onClose }: { show: boolean; onClose: () => void } = $props();

  const BASE = 'https://github.com/rinopatrick/duple/releases/latest/download';

  function installPWA() {
    alert('Click the install icon ⬇️ in your browser address bar. Then click "Install" to add Duple to your desktop.');
    onClose();
  }

  function download(platform: string) {
    const files: Record<string, string> = {
      win: `${BASE}/Duple_0.1.1_x64-setup.exe`,
      mac: `${BASE}/Duple_0.1.1_x64.dmg`,
      linux: `${BASE}/Duple_0.1.1_amd64.AppImage`,
    };
    window.open(files[platform] || files.win, '_blank');
  }
</script>

{#if show}
  <button class="fixed inset-0 bg-black/50 z-50" onclick={onClose} aria-label="Close modal"></button>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 p-6 rounded-2xl shadow-2xl space-y-4" style="background: var(--bg-card)">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">Install Duple</h3>
      <button onclick={onClose} class="btn btn-ghost btn-xs btn-square"><X class="w-4 h-4" /></button>
    </div>
    <p class="text-sm text-base-content/60">No download needed. One-click install from browser:</p>
    <button onclick={installPWA} class="btn btn-primary btn-sm w-full justify-start gap-3">
      <PlusSquare class="w-4 h-4" /> Install as Desktop App (PWA)
    </button>
    <p class="text-xs text-base-content/40 text-center">Works on Windows, Mac, Linux, Chrome, Edge</p>
    <div class="divider text-xs">or download .exe</div>
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
  </div>
{/if}
