export interface PendingSession { title: string; ids: string[]; mode: string; perQuestionSec: number | null }
let pending: PendingSession | null = null;
export const setPending = (p: PendingSession | null) => { pending = p; };
export const takePending = () => pending;
