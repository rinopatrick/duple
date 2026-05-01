<script lang="ts">
  import { getSetting, setSetting } from '../lib/db/settings';
  import { getAllMakanan } from '../lib/db/makanan';
  import { getAllLogMakanan } from '../lib/db/log_makanan';
  import { getAllTriggerWords } from '../lib/db/trigger';
  import { getLastSiklus } from '../lib/db/siklus';
  import { getAllMoodLogs } from '../lib/db/mood';
  import { Bot, Send, Key, Settings2, BookOpen, MessageCircle, Brain, LogIn } from 'lucide-svelte';
  import { tr } from '../lib/i18n';

  let tab: 'chat' | 'wiki' | 'settings' = $state('chat');
  let apiKey = $state('');
  let provider = $state('openai');
  let model = $state('gpt-4o-mini');
  let configured = $state(false);
  let useRAG = $state(true);
  let messages: { role: 'user' | 'assistant'; text: string }[] = $state([]);
  let input = $state('');
  let loading = $state(false);

  const PROVIDERS: Record<string, { name: string; models: string[]; baseURL: string; header: string; getKey: string }> = {
    openai: { name: tr().llm.providers.openai, models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-nano'], baseURL: 'https://api.openai.com/v1/chat/completions', header: 'Bearer', getKey: 'https://platform.openai.com/api-keys' },
    anthropic: { name: tr().llm.providers.anthropic, models: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'], baseURL: 'https://api.anthropic.com/v1/messages', header: 'x-api-key', getKey: 'https://console.anthropic.com/keys' },
    google: { name: tr().llm.providers.google, models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-pro-exp-03-25'], baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/', header: 'key', getKey: 'https://aistudio.google.com/apikey' },
    groq: { name: tr().llm.providers.groq, models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'], baseURL: 'https://api.groq.com/openai/v1/chat/completions', header: 'Bearer', getKey: 'https://console.groq.com/keys' },
    openrouter: { name: tr().llm.providers.openrouter, models: ['google/gemini-2.0-flash-001', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct'], baseURL: 'https://openrouter.ai/api/v1/chat/completions', header: 'Bearer', getKey: 'https://openrouter.ai/keys' },
    ollama: { name: tr().llm.providers.ollama, models: ['llama3.2', 'mistral', 'gemma2', 'phi3'], baseURL: 'http://localhost:11434/v1/chat/completions', header: 'none', getKey: 'https://ollama.com/download' },
  };

  const WIKI_TOPICS = tr().llm.wiki;

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
  <h1 class="text-2xl font-bold">{tr().llm.heading}</h1>

  <div class="tabs tabs-boxed">
    <button class="tab" class:tab-active={tab === 'chat'} onclick={() => tab = 'chat'}><MessageCircle class="w-4 h-4" /> {tr().llm.tabs.chat}</button>
    <button class="tab" class:tab-active={tab === 'wiki'} onclick={() => tab = 'wiki'}><BookOpen class="w-4 h-4" /> {tr().llm.tabs.wiki}</button>
    <button class="tab" class:tab-active={tab === 'settings'} onclick={() => tab = 'settings'}><Settings2 class="w-4 h-4" /> {tr().llm.tabs.setup}</button>
  </div>

  {#if tab === 'chat' && !configured}
    <div class="card bg-base-100 shadow"><div class="card-body text-center text-text-soft py-12">
      <Bot class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p class="font-medium">{tr().llm.setupNeeded}</p>
      <p class="text-sm mt-2">{tr().llm.setupDesc}</p>
      <button onclick={() => tab = 'settings'} class="btn btn-primary btn-sm mt-4">{tr().llm.goSetup}</button>
    </div></div>
  {:else if tab === 'chat'}
    <div class="card bg-base-100 shadow min-h-[450px] flex flex-col">
      <div class="card-body flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-2 text-xs text-text-soft">
          <span class="flex items-center gap-1"><Brain class="w-3 h-3" /> {PROVIDERS[provider]?.name} · {model}</span>
          <label class="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" class="toggle" checked={useRAG} onchange={() => useRAG = !useRAG} />
            <span>{tr().llm.contextAware}</span>
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
              <p>{tr().llm.chatPlaceholder}</p>
              <p class="text-xs">{tr().llm.chatSuggestion}</p>
            </div>
          {/if}
          {#if loading}
            <div class="flex"><div class="bg-base-200 px-4 py-2 rounded-xl"><span class="loading loading-spinner loading-sm"></span></div></div>
          {/if}
        </div>
        <div class="flex gap-2">
          <input type="text" class="input input-bordered flex-1" bind:value={input} placeholder={tr().llm.inputPlaceholder}
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
            <h3 class="font-semibold">{topic.title}</h3>
            <p class="text-sm text-text-soft leading-relaxed mt-1">{topic.tip}</p>
          </div>
        </div>
      {/each}
    </div>
  {:else if tab === 'settings'}
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-4">
        <h2 class="font-semibold flex items-center gap-2"><Key class="w-5 h-5" /> {tr().llm.setupHeading}</h2>
        <p class="text-sm text-text-soft">{tr().llm.setupDesc}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().llm.provider}</span></label>
            <select class="select" bind:value={provider} onchange={() => { model = PROVIDERS[provider]?.models[0] || model; }}>
              {#each Object.entries(PROVIDERS) as [k, v]}
                <option value={k}>{v.name}</option>
              {/each}
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">{tr().llm.model}</span></label>
            <select class="select" bind:value={model}>
              {#each (PROVIDERS[provider]?.models || []) as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
          </div>
        </div>

        {#if provider === 'ollama'}
          <div class="alert alert-info text-sm">
            {tr().llm.ollamaInfo.replace('{model}', model)}
          </div>
        {:else}
          <div class="form-control">
            <label class="label">
              <span class="label-text">{tr().llm.apiKey}</span>
              <a href={PROVIDERS[provider]?.getKey} target="_blank" rel="noopener" class="link text-xs">{tr().llm.getKey} →</a>
            </label>
            <input type="password" class="input input-bordered font-mono text-xs" bind:value={apiKey}
                   placeholder={provider === 'openai' ? 'sk-...' : provider === 'anthropic' ? 'sk-ant-...' : provider === 'google' ? 'AIza...' : 'key...'} />
          </div>
        {/if}

        <div class="flex items-center justify-between text-sm">
          <div>
            <p class="font-medium flex items-center gap-1"><Brain class="w-4 h-4" /> {tr().llm.contextAware} (RAG)</p>
            <p class="text-xs text-text-soft">{tr().llm.contextDesc}</p>
          </div>
          <input type="checkbox" class="toggle" checked={useRAG} onchange={() => useRAG = !useRAG} />
        </div>

        <button onclick={saveConfig} class="btn btn-primary" disabled={!apiKey && provider !== 'ollama'}>
          <Key class="w-4 h-4" /> {tr().llm.saveStart}
        </button>
      </div>
    </div>
  {/if}
</div>
