<script lang="ts">
  import { getSetting, setSetting } from '../lib/db/settings';
  import { Bot, Send, Key } from 'lucide-svelte';

  let apiKey = $state('');
  let provider = $state('openai');
  let configured = $state(false);
  let messages: { role: 'user' | 'assistant'; text: string }[] = $state([]);
  let input = $state('');
  let loading = $state(false);

  $effect(() => { loadConfig(); });

  async function loadConfig() {
    const key = await getSetting('llm_api_key');
    const prov = await getSetting('llm_provider');
    if (key) apiKey = key;
    if (prov) provider = prov;
    configured = !!key;
  }

  async function saveConfig() {
    await setSetting('llm_api_key', apiKey);
    await setSetting('llm_provider', provider);
    configured = !!apiKey;
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    messages = [...messages, { role: 'user', text: userMsg }];
    input = '';
    loading = true;

    try {
      const response = await callLLM(apiKey, provider, userMsg, messages.slice(0, -1));
      messages = [...messages, { role: 'assistant', text: response }];
    } catch (e: any) {
      messages = [...messages, { role: 'assistant', text: 'Error: ' + (e.message || String(e)) }];
    }
    loading = false;
  }

  async function callLLM(key: string, prov: string, prompt: string, history: any[]): Promise<string> {
    const system = 'You are a compassionate relationship advisor. Give short, practical, warm advice (2-3 sentences). Be culturally aware. Respond in the same language the user uses. Never judge.';

    if (prov === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: system }, ...history.map((m:any) => ({ role: m.role, content: m.text })), { role: 'user', content: prompt }],
          max_tokens: 300, temperature: 0.8
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.choices[0].message.content;
    }

    if (prov === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'system', content: system }, ...history.map((m:any) => ({ role: m.role, content: m.text })), { role: 'user', content: prompt }],
          max_tokens: 300, temperature: 0.8
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.choices[0].message.content;
    }

    throw new Error('Unknown provider');
  }
</script>

<div class="space-y-6 max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold">🤖 AI Advisor</h1>

  {#if !configured}
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-3">
        <h2 class="font-semibold flex items-center gap-2"><Key class="w-5 h-5" /> Setup — Bring Your Own API Key</h2>
        <p class="text-sm text-text-soft">Your key stays on your device. Choose:</p>
        <div class="form-control">
          <label class="label"><span class="label-text">Provider</span></label>
          <select class="select" bind:value={provider}>
            <option value="openai">OpenAI (gpt-4o-mini)</option>
            <option value="openrouter">OpenRouter (Gemini Flash — free tier available)</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text">API Key</span></label>
          <input type="password" class="input input-bordered font-mono text-xs" bind:value={apiKey} placeholder="sk-... or OR-..." />
        </div>
        <button onclick={saveConfig} class="btn btn-primary" disabled={!apiKey}>Save & Start</button>
      </div>
    </div>
  {:else}
    <div class="card bg-base-100 shadow min-h-[400px] flex flex-col">
      <div class="card-body flex-1 flex flex-col">
        <div class="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[500px]">
          {#each messages as msg}
            <div class="flex" class:justify-end={msg.role === 'user'}>
              <div class="max-w-[80%] px-4 py-2 rounded-xl text-sm" class:bg-primary={msg.role === 'user'} class:text-white={msg.role === 'user'} class:bg-base-200={msg.role === 'assistant'}>
                {msg.text}
              </div>
            </div>
          {/each}
          {#if messages.length === 0}
            <p class="text-center text-text-soft pt-12">👋 Ask me anything about your relationship. I\'ll give practical, warm advice.</p>
          {/if}
          {#if loading}
            <div class="flex"><div class="bg-base-200 px-4 py-2 rounded-xl"><span class="loading loading-spinner loading-sm"></span></div></div>
          {/if}
        </div>
        <div class="flex gap-2">
          <input type="text" class="input input-bordered flex-1" bind:value={input} placeholder="Ask for relationship advice..."
                 onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') send(); }} />
          <button onclick={send} class="btn btn-primary" disabled={!input.trim() || loading}><Send class="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  {/if}
</div>
