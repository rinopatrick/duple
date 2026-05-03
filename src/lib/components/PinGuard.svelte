<script lang="ts">
  import { Lock, ShieldCheck } from 'lucide-svelte';
  import { tr } from '../i18n/index.svelte';
  import { getPin, setPin, removePin, verifyPin } from '../stores/pin.svelte';

  let { onUnlock }: { onUnlock: () => void } = $props();
  let pin = $state('');
  let error = $state('');
  let mode: 'enter' | 'set' = $state(getPin() ? 'enter' : 'set');
  let confirmPin = $state('');

  async function handleSubmit() {
    if (mode === 'set') {
      if (pin.length < 4) { error = 'Min 4 digits'; return; }
      if (confirmPin && pin !== confirmPin) { error = 'PIN mismatch'; return; }
      if (!confirmPin) { confirmPin = pin; pin = ''; return; }
      await setPin(pin);
      error = '';
    } else {
      if (await verifyPin(pin)) {
        onUnlock();
      } else {
        error = 'Wrong PIN';
        pin = '';
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  function handleForgot() {
    if (confirm('This will reset your PIN. All data remains intact. Continue?')) {
      removePin();
      mode = 'set';
      pin = '';
      confirmPin = '';
      error = '';
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center" style="background: var(--bg)">
  <div class="w-80 space-y-6 text-center">
    <div class="space-y-2">
      <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style="background: var(--primary)">
        {#if mode === 'set'}
          <ShieldCheck class="w-8 h-8" style="color: var(--primary-text)" />
        {:else}
          <Lock class="w-8 h-8" style="color: var(--primary-text)" />
        {/if}
      </div>
      <h1 class="text-xl font-bold" style="color: var(--text)">Duple</h1>
      <p class="text-sm" style="color: var(--text-muted)">
        {#if mode === 'set' && !confirmPin}
          Set a 4-digit PIN to protect your data
        {:else if mode === 'set' && confirmPin}
          Confirm your PIN
        {:else}
          Enter your PIN to unlock
        {/if}
      </p>
    </div>

    <div class="space-y-3">
      <input
        type="password"
        inputmode="numeric"
        maxlength="6"
        class="w-full text-center text-2xl tracking-[0.5em] py-3 rounded-xl border outline-none"
        style="background: var(--bg-card); border-color: var(--border); color: var(--text)"
        bind:value={pin}
        onkeydown={handleKeydown}
        placeholder="****"
        autofocus
      />
      {#if error}
        <p class="text-error text-sm">{error}</p>
      {/if}
      <button onclick={handleSubmit} class="btn btn-primary w-full" disabled={pin.length < 4}>
        {#if mode === 'set' && !confirmPin}
          Set PIN
        {:else if mode === 'set' && confirmPin}
          Confirm
        {:else}
          Unlock
        {/if}
      </button>
      {#if mode === 'enter'}
        <button onclick={handleForgot} class="btn btn-ghost btn-xs text-xs">
          Forgot PIN? (resets lock)
        </button>
      {/if}
    </div>
  </div>
</div>
