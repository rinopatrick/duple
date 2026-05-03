<script lang="ts">
  import Landing from './lib/components/Landing.svelte';
  import Layout from './lib/components/Layout.svelte';
  import PinGuard from './lib/components/PinGuard.svelte';
  import { handleAuthCallback } from './lib/sync/supabase';
  import { isPinEnabled } from './lib/stores/pin.svelte';
  import './app.css';

  let started = $state(false);
  let unlocked = $state(false);
  let fatalError = $state('');

  function onStart() {
    started = true;
    localStorage.setItem('duple_landed', '1');
  }

  $effect(() => {
    if (localStorage.getItem('duple_landed') === '1') started = true;
  });

  $effect(() => {
    handleAuthCallback();
  });

  function onUnlock() {
    unlocked = true;
  }

  $effect(() => {
    window.onerror = (_msg, _url, _line, _col, err) => {
      fatalError = err?.message || String(_msg);
      return true;
    };
    window.onunhandledrejection = (e) => {
      fatalError = e.reason?.message || String(e.reason);
    };
    return () => { window.onerror = null; window.onunhandledrejection = null; };
  });

  function reload() { window.location.reload(); }
  function resetApp() {
    localStorage.removeItem('duple_landed');
    window.location.reload();
  }
</script>

{#if fatalError}
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--bg)">
    <div class="max-w-md text-center space-y-4">
      <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style="background: var(--error)">
        <span class="text-white text-2xl font-bold">!</span>
      </div>
      <h1 class="text-2xl font-bold" style="color: var(--text)">Something went wrong</h1>
      <p class="text-sm" style="color: var(--text-muted)">Duple encountered an unexpected error.</p>
      <div class="p-3 rounded-lg text-xs font-mono text-left max-h-24 overflow-y-auto" style="background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border)">
        {fatalError}
      </div>
      <div class="flex gap-2 justify-center">
        <button onclick={reload} class="btn btn-primary">Reload</button>
        <button onclick={resetApp} class="btn btn-ghost">Reset & Reload</button>
      </div>
    </div>
  </div>
{:else if !started}
  <Landing {onStart} />
{:else if isPinEnabled() && !unlocked}
  <PinGuard {onUnlock} />
{:else}
  <Layout />
{/if}
