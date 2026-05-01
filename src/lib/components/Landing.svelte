<script lang="ts">
  let { onStart }: { onStart: () => void } = $props();
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" style="background: var(--bg)">
  <div class="max-w-lg space-y-8">
    <div class="space-y-3">
      <div class="text-6xl">💙</div>
      <h1 class="text-4xl font-bold" style="color: var(--text)">Duple</h1>
      <p class="text-lg" style="color: var(--text-muted)">Your relationship sidekick</p>
    </div>

    <div class="space-y-4 text-left">
      <div class="flex items-start gap-3">
        <span class="text-2xl">🍕</span>
        <div>
          <p class="font-semibold" style="color: var(--text)">Never forget their favorites</p>
          <p class="text-sm" style="color: var(--text-muted)">Log their favorite foods, drinks, and comfort meals.</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-2xl">🩸</span>
        <div>
          <p class="font-semibold" style="color: var(--text)">Cycle-aware recommendations</p>
          <p class="text-sm" style="color: var(--text-muted)">Smart reminders when PMS is near, with food suggestions that actually help.</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-2xl">💡</span>
        <div>
          <p class="font-semibold" style="color: var(--text)">What to say when they're upset</p>
          <p class="text-sm" style="color: var(--text-muted)">Trigger word warnings + safe alternatives. Never make it worse again.</p>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-2xl">🔒</span>
        <div>
          <p class="font-semibold" style="color: var(--text)">100% local. 100% private.</p>
          <p class="text-sm" style="color: var(--text-muted)">All data stays on your device. No accounts, no servers, no tracking.</p>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <button onclick={onStart} class="btn btn-primary btn-lg w-full" style="font-size:1.125rem; padding: 1rem 2rem;">
        Get Started — It's Free
      </button>
      <p class="text-xs" style="color: var(--text-soft)">
        Open source. No signup required. Data stays on your device.
      </p>
    </div>
  </div>
</div>
