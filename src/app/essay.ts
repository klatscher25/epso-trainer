/** Aufsatz-Trainer: Aufgaben, EPSO-Anker, Wortzählung, KI-Bewertung (Client). */
import { GRADE_ESSAY_URL, SUPABASE_KEY } from './supabaseConfig';
import type { AppEvent } from './types';

export interface EssayMaterial { title: string; text: string; source?: { title: string; url: string } }
export interface EssayTask {
  id: string; title: string; task: string; material: EssayMaterial[];
  model_answer?: string; checklist?: string[]; custom?: boolean;
}

export const ESSAY_MINUTES = 40;
export const ESSAY_TARGET = { min: 350, max: 500 };
export const ESSAY_PASS = 5;

/** Die fünf offiziellen EPSO-Anker für schriftliche Kommunikation. */
export const ANCHORS = [
  { id: 1, label: 'Logischer Aufbau', en: 'Structures written communication with a logical flow of ideas' },
  { id: 2, label: 'Knapp', en: 'Writes concisely, avoiding unnecessary words and sentences' },
  { id: 3, label: 'Klar und verständlich', en: 'Presents subject matter in a clear and understandable way' },
  { id: 4, label: 'Zielgruppe und Zweck', en: 'Adapts and tailors writing to suit the intended audience and purpose' },
  { id: 5, label: 'Material genutzt', en: 'Uses the information provided effectively to address the assignment' },
] as const;

export function wordCount(text: string): number {
  const t = (text ?? '').trim();
  return t ? t.split(/\s+/).length : 0;
}

const files = import.meta.glob('../../data/essay/*.json', { eager: true, import: 'default' }) as Record<string, EssayTask | EssayTask[]>;
function loadTasks(): EssayTask[] {
  const all = Object.entries(files);
  const real = all.filter(([p]) => !p.split('/').pop()!.startsWith('_'));
  return (real.length ? real : all).flatMap(([, v]) => (Array.isArray(v) ? v : [v]));
}
export const essayTasks: EssayTask[] = loadTasks();

export interface AnchorScore { id: number; score: number; justification?: string }
export interface AiResult {
  anchors: AnchorScore[]; total: number; pass: boolean; improvements: string[];
  rewrite_example?: { original: string; improved: string }; summary?: string;
}
export interface EssayPayload {
  taskId: string; words: number; minutes: number; total: number; pass: boolean;
  anchors: AnchorScore[]; at: number; selfAssessed?: boolean;
}

export const essaysOf = (events: AppEvent[]): AppEvent[] => events.filter((e) => e.kind === 'essay');

export async function gradeEssay(token: string, task: EssayTask, essay: string): Promise<AiResult> {
  const res = await fetch(GRADE_ESSAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY },
    body: JSON.stringify({
      taskId: task.id, task: task.task,
      material: task.material.map((m) => ({ title: m.title, text: m.text })),
      essay,
    }),
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok || !data || data.error) throw new Error(data?.error || data?.message || `Fehler ${res.status}`);
  return data as AiResult;
}
