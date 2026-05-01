<script lang="ts">
  import { getSetting, setSetting } from '../lib/db/settings';
  import { getAllMakanan } from '../lib/db/makanan';
  import { getAllLogMakanan } from '../lib/db/log_makanan';
  import { getAllTriggerWords } from '../lib/db/trigger';
  import { getLastSiklus } from '../lib/db/siklus';
  import { getAllMoodLogs } from '../lib/db/mood';
  import { Bot, Send, Key, Settings2, BookOpen, MessageCircle, Brain, LogIn } from 'lucide-svelte';

  let tab: 'chat' | 'wiki' = $state('chat');
  let apiKey = $state('');
  let provider = $state('openai');
  let model = $state('gpt-4o-mini');
  let configured = $state(false);
  let useRAG = $state(true);
  let messages: { role: 'user' | 'assistant'; text: string }[] = $state([]);
  let input = $state('');
  let loading = $state(false);

  const PROVIDERS: Record<string, { name: string; models: string[]; baseURL: string; header: string; getKey: string }> = {
    openai: { name: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-nano'], baseURL: 'https://api.openai.com/v1/chat/completions', header: 'Bearer', getKey: 'https://platform.openai.com/api-keys' },
    anthropic: { name: 'Anthropic (Claude)', models: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'], baseURL: 'https://api.anthropic.com/v1/messages', header: 'x-api-key', getKey: 'https://console.anthropic.com/keys' },
    google: { name: 'Google AI Studio', models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro-exp-03-25'], baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/', header: 'key', getKey: 'https://aistudio.google.com/apikey' },
    groq: { name: 'Groq (fast & free tier)', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'], baseURL: 'https://api.groq.com/openai/v1/chat/completions', header: 'Bearer', getKey: 'https://console.groq.com/keys' },
    openrouter: { name: 'OpenRouter (any model)', models: ['google/gemini-2.0-flash-001', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct'], baseURL: 'https://openrouter.ai/api/v1/chat/completions', header: 'Bearer', getKey: 'https://openrouter.ai/keys' },
    ollama: { name: 'Ollama (local)', models: ['llama3.2', 'mistral', 'gemma2', 'phi3'], baseURL: 'http://localhost:11434/v1/chat/completions', header: 'none', getKey: 'https://ollama.com/download' },
  };

  const WIKI_TOPICS = [
    { title: 'Active Listening', emoji: '👂', tip: 'Listen to understand, not to respond. Repeat back what they said: "So what I hear is..." This alone de-escalates 80% of arguments.' },
    { title: 'The 5:1 Ratio', emoji: '⚖️', tip: 'For every negative interaction, you need 5 positive ones to maintain a healthy relationship. Small compliments count.' },
    { title: 'Validate Feelings First', emoji: '🫂', tip: '"I understand why you feel that way" goes further than "Here\'s how to fix it." Emotional validation before problem-solving.' },
    { title: 'PMS Survival Guide', emoji: '🩸', tip: 'Days before: extra patience, comfort food ready, no debates. During: warm drinks, lower back rubs, quiet time. Never joke about PMS.' },
    { title: 'Love Languages 101', emoji: '❤️', tip: 'Words · Acts · Gifts · Time · Touch. Your partner likely has a different love language than you. Learn theirs, speak it daily.' },
    { title: 'The Soft Start-Up', emoji: '🌱', tip: 'Start difficult conversations gently. Instead of "You never help," try "I\'m feeling overwhelmed — could we figure out chores together?"' },
    { title: 'Bids for Connection', emoji: '🤝', tip: 'Small "bids" (a comment, a glance, a touch) are attempts to connect. Turning toward these bids builds trust. Ignoring them erodes it.' },
    { title: 'Repair After Fights', emoji: '🔧', tip: 'After arguments: take a 20-min break, then return calmly. Use "I felt..." not "You did..." A sincere apology + a hug rebuilds connection.' },
    { title: 'Random Kindness', emoji: '💝', tip: 'Surprise with their favorite snack. Leave a note. Send a random "thinking of you" text. These micro-moments build relationship wealth over time.' },
    { title: 'Handling Their Stress', emoji: '🧘', tip: 'When they\'re stressed, don\'t offer solutions unless asked. Say: "That sounds really hard. I\'m here." Physical presence + validation = comfort.' },
  ];

  $effect(() => { loadConfig(); });

  async function loadConfig() {
    const key = await getSetting('llm_api_key');
    const prov = await getSetting('llm_provider');
    const mod = await getSetting('llm_model');
    if (key) apiKey = key;
    if (prov) { provider = prov; model = PROVIDERS[prov]?.models[0] || model; }
    if (mod) model = mod;
    configured = !!key;
  }

  async function saveConfig() {
    await setSetting('llm_api_key', apiKey);
    await setSetting('llm_provider', provider);
    await setSetting('llm_model', model);
    configured = !!apiKey;
  }

  async function buildContext(): Promise<string> {
    if (!useRAG) return '';
    const [makanan, siklus, moods, triggers] = await Promise.all([
      getAllMakanan(), getLastSiklus(3), getAllMoodLogs(''), getAllTriggerWords()
    ]);
    let ctx = '\n\n[USER DATA CONTEXT]\n';
    if (makanan.length > 0) ctx += `Favorite foods: ${makanan.map(m => m.nama + ' (' + m.kategori + ', rating ' + m.rating + '/5)').join(', ')}.\n`;
    if (siklus.length > 0) ctx += `Cycle: last started ${siklus[0]?.tgl_mulai}, ended ${siklus[0]?.tgl_selesai}.\n`;
    if (moods.length > 0) ctx += `Recent moods: ${moods.slice(-5).map(m => m.mood + ' (' + m.tanggal + ')').join(', ')}.\n`;
    if (triggers.length > 0) ctx += `Known triggers/words to avoid: ${triggers.map(t => `"${t.kata_kalimat_jangan}" (safe: "${t.alternatif_aman}")`).join('; ')}.\n`;
    return ctx;
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    messages = [...messages, { role: 'user', text: userMsg }];
    input = '';
    loading = true;
    try {
      const ctx = await buildContext();
      const response = await callLLM(apiKey, provider, model, userMsg + ctx, messages.slice(0, -1));
      messages = [...messages, { role: 'assistant', text: response }];
    } catch (e: any) {
      messages = [...messages, { role: 'assistant', text: 'Error: ' + (e.message || String(e)) }];
    }
    loading = false;
  }

  async function callLLM(key: string, prov: string, mdl: string, prompt: string, history: any[]): Promise<string> {
    const system = 'You are a compassionate, wise relationship advisor. Give short, practical advice (2-4 sentences). Be culturally aware and non-judgmental. Respond in the same language the user uses. If user data context is provided, incorporate it into personalized advice.';

    if (prov === 'anthropic') {
      const res = await fetch(PROVIDERS[prov].baseURL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: mdl, max_tokens: 300,
          system: system,
          messages: [...history.map((m:any) => ({ role: m.role, content: m.text })), { role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.content?.[0]?.text || 'No response';
    }

    if (prov === 'google') {
      const url = `${PROVIDERS[prov].baseURL}${mdl}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [...history.map((m:any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.8 }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    }

    if (prov === 'ollama') {
      const res = await fetch(PROVIDERS[prov].baseURL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: mdl, messages: [{ role: 'system', content: system }, ...history.map((m:any) => ({ role: m.role, content: m.text })), { role: 'user', content: prompt }],
          stream: false
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.choices?.[0]?.message?.content || 'No response';
    }

    const res = await fetch(PROVIDERS[prov].baseURL, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `${PROVIDERS[prov].header} ${key}` },
      body: JSON.stringify({
        model: mdl, messages: [{ role: 'system', content: system }, ...history.map((m:any) => ({ role: m.role, content: m.text })), { role: 'user', content: prompt }],
        max_tokens: 300, temperature: 0.8
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  }
</script>

<div class="space-y-6 max-w-3xl mx-auto">
  <h1 class="text-2xl font-bold">🤖 AI Advisor</h1>

  <div class="tabs tabs-boxed">
    <button class="tab" class:tab-active={tab === 'chat'} onclick={() => tab = 'chat'}><MessageCircle class="w-4 h-4" /> Chat</button>
    <button class="tab" class:tab-active={tab === 'wiki'} onclick={() => tab = 'wiki'}><BookOpen class="w-4 h-4" /> Wiki</button>
    <button class="tab" class:tab-active={tab === 'settings'} onclick={() => tab = 'settings'}><Settings2 class="w-4 h-4" /> Setup</button>
  </div>

  {#if tab === 'chat' && !configured}
    <div class="card bg-base-100 shadow"><div class="card-body text-center text-text-soft py-12">
      <Bot class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p class="font-medium">AI Advisor needs setup first</p>
      <p class="text-sm mt-2">Click the <strong>Setup</strong> tab above — bring your own API key from any provider. Free tiers available.</p>
      <button onclick={() => tab = 'settings'} class="btn btn-primary btn-sm mt-4">Go to Setup</button>
    </div></div>
  {:else if tab === 'chat'}
    <div class="card bg-base-100 shadow min-h-[450px] flex flex-col">
      <div class="card-body flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-2 text-xs text-text-soft">
          <span class="flex items-center gap-1"><Brain class="w-3 h-3" /> {PROVIDERS[provider]?.name} · {model}</span>
          <label class="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" class="toggle" checked={useRAG} onchange={() => useRAG = !useRAG} />
            <span>Context-aware</span>
          </label>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[500px]">
          {#each messages as msg}
            <div class="flex" class:justify-end={msg.role === 'user'}>
              <div class="max-w-[85%] px-4 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                   class:bg-primary={msg.role === 'user'}
                   class:text-white={msg.role === 'user'}
                   class:bg-base-200={msg.role === 'assistant'}>
                {msg.text}
              </div>
            </div>
          {/each}
          {#if messages.length === 0}
            <div class="text-center text-text-soft pt-12 space-y-2">
              <Bot class="w-10 h-10 mx-auto opacity-40" />
              <p>Ask me anything about your relationship.</p>
              <p class="text-xs">Try: "My partner is upset because I forgot our anniversary. What should I do?"</p>
            </div>
          {/if}
          {#if loading}
            <div class="flex"><div class="bg-base-200 px-4 py-2 rounded-xl"><span class="loading loading-spinner loading-sm"></span></div></div>
          {/if}
        </div>
        <div class="flex gap-2">
          <input type="text" class="input input-bordered flex-1" bind:value={input} placeholder="Ask anything..."
                 onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') send(); }} />
          <button onclick={send} class="btn btn-primary" disabled={!input.trim() || loading}><Send class="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  {:else if tab === 'wiki'}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each WIKI_TOPICS as topic}
        <div class="card bg-base-100 shadow hover:shadow-md transition-shadow">
          <div class="card-body">
            <h3 class="font-semibold flex items-center gap-2">{topic.emoji} {topic.title}</h3>
            <p class="text-sm text-text-soft leading-relaxed mt-1">{topic.tip}</p>
          </div>
        </div>
      {/each}
    </div>
  {:else if tab === 'settings'}
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-4">
        <h2 class="font-semibold flex items-center gap-2"><Key class="w-5 h-5" /> Setup — Bring Your Own API Key</h2>
        <p class="text-sm text-text-soft">Your key stays 100% local. Pick any provider:</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Provider</span></label>
            <select class="select" bind:value={provider} onchange={() => { model = PROVIDERS[provider]?.models[0] || model; }}>
              {#each Object.entries(PROVIDERS) as [k, v]}
                <option value={k}>{v.name}</option>
              {/each}
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Model</span></label>
            <select class="select" bind:value={model}>
              {#each (PROVIDERS[provider]?.models || []) as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
          </div>
        </div>

        {#if provider === 'ollama'}
          <div class="alert alert-info text-sm">
            Ollama runs locally on your machine. <a href="https://ollama.com/download" target="_blank" rel="noopener" class="link">Download Ollama</a> first, then run <code class="bg-base-200 px-1 rounded">ollama pull {model}</code>.
            Leave API key empty for local use. Base URL: http://localhost:11434
          </div>
        {:else}
          <div class="form-control">
            <label class="label">
              <span class="label-text">API Key</span>
              <a href={PROVIDERS[provider]?.getKey} target="_blank" rel="noopener" class="link text-xs">Get key →</a>
            </label>
            <input type="password" class="input input-bordered font-mono text-xs" bind:value={apiKey}
                   placeholder={provider === 'openai' ? 'sk-...' : provider === 'anthropic' ? 'sk-ant-...' : provider === 'google' ? 'AIza...' : 'key...'} />
          </div>
        {/if}

        <div class="flex items-center justify-between text-sm">
          <div>
            <p class="font-medium flex items-center gap-1"><Brain class="w-4 h-4" /> Context-aware (RAG)</p>
            <p class="text-xs text-text-soft">Send food favorites, mood history & trigger words for personalized advice</p>
          </div>
          <input type="checkbox" class="toggle" checked={useRAG} onchange={() => useRAG = !useRAG} />
        </div>

        <button onclick={saveConfig} class="btn btn-primary" disabled={!apiKey && provider !== 'ollama'}>
          <Key class="w-4 h-4" /> Save & Start Chat
        </button>
      </div>
    </div>
  {/if}
</div>
