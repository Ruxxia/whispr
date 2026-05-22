import { useState } from "react";
import { STICKERS, CATEGORIES, type StickerCategory } from "@/lib/stickers";

export function StickerDrawer({ onPick }: { onPick: (key: string) => void }) {
  const [cat, setCat] = useState<StickerCategory>("cottagecore");
  const list = STICKERS.filter((s) => s.category === cat);
  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-full border border-border bg-paper/60 p-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCat(c.key)}
            className={`flex-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${
              cat === c.key ? "bg-clay text-paper" : "text-ink-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {list.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onPick(s.key)}
            title={s.label}
            className="aspect-square rounded-lg border border-border bg-paper/80 text-2xl leading-none transition hover:-translate-y-0.5 hover:bg-paper hover:shadow-soft"
          >
            <span aria-hidden>{s.emoji}</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-ink-muted">Tap to drop on your page. Drag to move, then resize or rotate.</p>
    </div>
  );
}
