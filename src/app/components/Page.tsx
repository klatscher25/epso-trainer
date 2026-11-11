import type { ComponentChildren } from 'preact';
import { go } from '../routes';
import { IconBack } from './icons';

export function Page({ title, children, back = '' }: { title: string; children: ComponentChildren; back?: string }) {
  return (
    <div class="page">
      <header class="phead">
        <button class="icon-btn" aria-label="Zurück" onClick={() => go(back)}><IconBack /></button>
        <h1>{title}</h1>
      </header>
      {children}
    </div>
  );
}
