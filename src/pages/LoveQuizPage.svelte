<script lang="ts">
  import { Heart, Gift, Clock, Hand, Star } from 'lucide-svelte';
  import { setRoute } from '../lib/stores/app.svelte';

  let step = $state(0);
  let answers: number[] = $state([0,0,0,0,0]);
  let result: 'words' | 'acts' | 'gifts' | 'time' | 'touch' | null = $state(null);

  const Q = [
    { q: 'A love note makes my day', cat: 0 },
    { q: 'When they do a chore without asking, I feel loved', cat: 1 },
    { q: 'I love receiving surprise gifts', cat: 2 },
    { q: 'Quality time together recharges me', cat: 3 },
    { q: 'Physical touch communicates more than words', cat: 4 },
    { q: 'A genuine compliment stays with me', cat: 0 },
    { q: 'Actions speak louder than words for me', cat: 1 },
    { q: 'The thought behind a gift matters most', cat: 2 },
    { q: 'Undivided attention is my love language', cat: 3 },
    { q: 'Holding hands makes me feel connected', cat: 4 },
  ];

  const RESULTS = [
    { key: 'words', icon: '💬', title: 'Words of Affirmation', desc: 'Compliments, love notes, verbal encouragement. Say "I love you" often.', tip: 'Leave a voice note. Send a random text saying what you appreciate. Compliment in public.' },
    { key: 'acts', icon: '🛠️', title: 'Acts of Service', desc: 'Actions over words. Small help, fixing things, easing their burden.', tip: 'Do a chore they hate without being asked. Make their morning coffee. Handle something stressful for them.' },
    { key: 'gifts', icon: '🎁', title: 'Receiving Gifts', desc: 'Thoughtful, meaningful gifts. Not about money — about attention to detail.', tip: 'Check the Wishlist tab. Surprise with their favorite snack. Write a card with a memory.' },
    { key: 'time', icon: '⏰', title: 'Quality Time', desc: 'Undivided attention, deep conversations, shared experiences.', tip: 'Plan a date night with no phones. Go for a walk together. Cook together at home.' },
    { key: 'touch', icon: '🤗', title: 'Physical Touch', desc: 'Hugs, holding hands, cuddling. Physical closeness is their language.', tip: 'More hugs throughout the day. Shoulder rub when they\'re stressed. Hold hands while walking.' },
  ];

  function answer(val: number) {
    const cat = Q[step].cat;
    answers[cat] += val;
    if (step < Q.length - 1) { step++; return; }
    let max = 0, idx = 0;
    answers.forEach((v, i) => { if (v > max) { max = v; idx = i; } });
    result = RESULTS[idx].key as any;
  }

  function reset() { step = 0; answers = [0,0,0,0,0]; result = null; }
</script>

<div class="space-y-6 max-w-xl mx-auto">
  <h1 class="text-2xl font-bold text-center">❤️ Love Language Quiz</h1>

  {#if result}
    {@const r = RESULTS.find(r => r.key === result)!}
    <div class="card bg-base-100 shadow text-center space-y-4">
      <div class="card-body">
        <span class="text-6xl">{r.icon}</span>
        <h2 class="text-2xl font-bold">{r.title}</h2>
        <p class="text-text-soft">{r.desc}</p>
        <div class="alert alert-info text-left"><p class="text-sm font-medium">💡 Quick Tip: {r.tip}</p></div>
        <div class="flex gap-2 justify-center mt-4">
          <button onclick={() => setRoute('wishlist')} class="btn btn-primary btn-sm"><Gift class="w-4 h-4" /> Wishlist</button>
          <button onclick={() => setRoute('rekomendasi')} class="btn btn-secondary btn-sm"><Heart class="w-4 h-4" /> Rekomendasi</button>
          <button onclick={reset} class="btn btn-ghost btn-sm">Retake Quiz</button>
        </div>
      </div>
    </div>
  {:else}
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <p class="text-sm text-text-soft mb-4">Question {step + 1} of {Q.length}</p>
        <p class="text-lg font-medium mb-6">{Q[step].q}</p>
        <div class="flex gap-2">
          {#each [1,2,3,4,5] as n}
            <button onclick={() => answer(n)} class="btn btn-outline flex-1">{n}</button>
          {/each}
        </div>
        <div class="flex justify-between text-xs text-text-soft mt-2">
          <span>Not me</span><span>Very me</span>
        </div>
      </div>
    </div>
  {/if}
</div>
