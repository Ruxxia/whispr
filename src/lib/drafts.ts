export interface DraftState {
  title: string;
  content: string;
  mood: string | null;
  paperStyle: string;
  paperColor: string;
  fontKey: string;
  anonymous: boolean;
  isPrivate: boolean;
  rotation: number;
  imageUrl: string | null;
  backgroundImage: string | null;
  stickers: { key: string; x: number; y: number; scale: number; rotation: number; z: number }[];
}

const KEY = (uid: string) => `whispr:draft:${uid}`;

export function loadDraft(uid: string): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY(uid));
    return raw ? (JSON.parse(raw) as DraftState) : null;
  } catch { return null; }
}

export function saveDraft(uid: string, draft: DraftState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY(uid), JSON.stringify(draft)); } catch { /* ignore */ }
}

export function clearDraft(uid: string) {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY(uid)); } catch { /* ignore */ }
}

export function isMeaningfulDraft(d: DraftState | null): boolean {
  if (!d) return false;
  return !!(d.title.trim() || d.content.trim() || d.stickers.length || d.imageUrl || d.backgroundImage);
}
