// STUB – replaced by generator agent
import type { Generator, GenItem } from './types';

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const L = ['A', 'B', 'C', 'D', 'E'];

export const numerical: Generator = {
  type: 'numerical',
  categories: [{ id: 'prozent', label: 'Prozent' }],
  generate(seed): GenItem {
    const r = rng(seed);
    const a = 100 + Math.floor(r() * 400), p = 5 * (2 + Math.floor(r() * 8));
    const res = (a * p) / 100;
    const answer = Math.floor(r() * 5);
    const options = L.map((_, i) => String(res + (i - answer) * 5));
    return {
      id: `num-${seed}`, type: 'numerical', seed, difficulty: 1, category: 'prozent',
      prompt: `Wie viel sind ${p} % von ${a}?`,
      stimulusHtml: `<table><caption>Umsatz</caption><tr><th>Jahr</th><th>Wert</th></tr><tr><td>2024</td><td>${a}</td></tr><tr><td>Anteil</td><td>${p} %</td></tr></table>`,
      options, answer,
      explanation: { steps: [`${a} × ${p} / 100 = ${res}`], tip: 'Erst 10 % bilden.' },
    };
  },
};

function square(x: number, dir: number, hl = false) {
  const rot = dir * 90;
  return `<g transform="translate(${x},0)"><rect x="2" y="2" width="56" height="56" fill="none" stroke="currentColor" stroke-width="${hl ? 3 : 1.5}"/><path transform="rotate(${rot} 30 30)" d="M12 30h36M40 22l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2"/></g>`;
}
export const abstract: Generator = {
  type: 'abstract',
  categories: [{ id: 'rotation', label: 'Rotation' }],
  generate(seed): GenItem {
    const r = rng(seed);
    const start = Math.floor(r() * 4), answer = Math.floor(r() * 5);
    const series = [0, 1, 2, 3].map((i) => square(i * 70, start + i)).join('');
    const right = (start + 4) % 4;
    const dirs = [0, 1, 2, 3, 0].map((_, i) => (i === answer ? right : (right + 1 + (i % 3)) % 4));
    const opts = dirs.map((d, i) => square(i * 70, d)).join('');
    return {
      id: `abs-${seed}`, type: 'abstract', seed, difficulty: 1, category: 'rotation',
      prompt: 'Welche Figur setzt die Reihe fort?',
      stimulusHtml: `<svg viewBox="0 0 280 60" role="img">${series}</svg>`,
      optionsHtml: `<svg viewBox="0 0 350 60" role="img">${opts}</svg>`,
      options: [...L], answer,
      explanation: { steps: ['Der Pfeil dreht sich je Feld um 90°.'], rules: ['Rotation um 90° im Uhrzeigersinn'],
        solutionHtml: `<svg viewBox="0 0 350 60" role="img">${series}${square(280, right, true)}</svg>` },
    };
  },
};
