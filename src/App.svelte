<script lang="ts">
  import Landing from './lib/components/Landing.svelte';
  import Layout from './lib/components/Layout.svelte';
  import PinGuard from './lib/components/PinGuard.svelte';
  import { handleAuthCallback } from './lib/sync/supabase';
  import { isPinEnabled } from './lib/stores/pin.svelte';
  import './app.css';

  let started = $state(false);
  let unlocked = $state(false);

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
</script>

{#if !started}
  <Landing {onStart} />
{:else if isPinEnabled() && !unlocked}
  <PinGuard {onUnlock} />
{:else}
  <Layout />
{/if}
