import { render } from 'preact';
import { App } from './App';
import { initStore } from './store';
import { getKV } from './store';
import { applyTheme } from './state';
import { initSync } from './sync';
import '../styles.css';

async function boot() {
  await initStore();
  applyTheme(getKV<string>('theme', 'system'));
  render(<App />, document.getElementById('app')!);
  initSync().catch(() => {});
  if (import.meta.env.PROD) {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true });
  }
}
boot();
