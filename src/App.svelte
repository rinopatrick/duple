<script lang="ts">
  import Landing from './lib/components/Landing.svelte';
  import Layout from './lib/components/Layout.svelte';
  import { handleAuthCallback } from './lib/sync/supabase';
  import './app.css';

  let started = $state(false);

  function onStart() {
    started = true;
    localStorage.setItem('duple_landed', '1');
  }

  // Auto-skip landing on return visits
  $effect(() => {
    if (localStorage.getItem('duple_landed') === '1') started = true;
  });

  // Handle OAuth callback on page load
  $effect(() => {
    handleAuthCallback();
  });
</script>

{#if started}
  <Layout />
{:else}
  <Landing {onStart} />
{/if}
