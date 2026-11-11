import type { GenItem } from '../gen/types';

export type QType = 'verbal' | 'numerical' | 'abstract' | 'frmcq';

export interface VerbalItem {
  id: string; topic: string; difficulty: number; text: string; question: string;
  options: string[]; answer: number; why: string[]; traps: string[];
}
export interface FrmcqItem {
  id: string; pkg: string; area: string; difficulty: number; question: string;
  options: string[]; answer: number; explanation: string; source?: { title: string; url: string };
}
export interface PackageArea { id: string; label: string; target: number }
export interface Pkg {
  id: string; title: string; competition?: string; grade?: string; areas: PackageArea[];
  frmcq: { questions: number; minutes: number; pass: number; options: number } | null;
  essay?: unknown;
  logicOnly?: boolean;
}

/** Einheitliche Frage für Runner und Feedback. */
export interface Q {
  id: string; type: QType; area?: string; pkg?: string; category?: string;
  prompt: string; text?: string; stimulusHtml?: string; optionsHtml?: string;
  options: string[]; answer: number;
  verbal?: VerbalItem; frmcq?: FrmcqItem; gen?: GenItem;
}

export interface AnswerPayload {
  itemId: string; type: QType; pkg?: string; area?: string; category?: string;
  correct: boolean; ms: number; mode: string; at: number;
}
export interface AppEvent { id: string; kind: string; payload: any; created_at: number }
