import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Unregister any old service worker that may be caching stale files
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
}

mount(App, { target: document.getElementById('app')! })

export default {}
