import { useRef, useState, useEffect } from "react";
import { STICKER_BY_KEY } from "@/lib/stickers";
import { Trash2, RotateCw, Plus, Minus } from "lucide-react";

export interface PlacedSticker {
  key: string;       // sticker key
  x: number;         // 0..100 percent of paper width
  y: number;         // 0..100 percent of paper height
  scale: number;     // 0.5..3
  rotation: number;  // deg
  z: number;
  id?: string;       // unique local id
}

interface Props {
  stickers: PlacedSticker[];
  onChange?: (next: PlacedSticker[]) => void;
  editable?: boolean;
}

export function StickerLayer({ stickers, onChange, editable = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!editable) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-sticker]") && !t.closest("[data-sticker-toolbar]")) setSelected(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [editable]);

  const update = (id: string, patch: Partial<PlacedSticker>) => {
    onChange?.(stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
  const remove = (id: string) => onChange?.(stickers.filter((s) => s.id !== id));

  const startDrag = (e: React.PointerEvent, id: string) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker) return;
    const startPxX = (sticker.x / 100) * rect.width;
    const startPxY = (sticker.y / 100) * rect.height;
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const move = (ev: PointerEvent) => {
      const nx = startPxX + (ev.clientX - startClientX);
      const ny = startPxY + (ev.clientY - startClientY);
      update(id, {
        x: Math.max(0, Math.min(100, (nx / rect.width) * 100)),
        y: Math.max(0, Math.min(100, (ny / rect.height) * 100)),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 5 }}
    >
      {stickers.map((s) => {
        const def = STICKER_BY_KEY[s.key];
        if (!def) return null;
        const isSel = editable && selected === s.id;
        return (
          <div
            key={s.id}
            data-sticker
            onPointerDown={(e) => startDrag(e, s.id!)}
            className={editable ? "pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-grab select-none active:cursor-grabbing" : "absolute -translate-x-1/2 -translate-y-1/2 select-none"}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
              fontSize: "2.5rem",
              lineHeight: 1,
              filter: "drop-shadow(0 2px 3px rgba(60,40,20,0.15))",
              zIndex: s.z,
              outline: isSel ? "2px dashed rgba(139,115,85,0.7)" : undefined,
              outlineOffset: 6,
              borderRadius: 8,
            }}
          >
            <span aria-hidden>{def.emoji}</span>
            {isSel && (
              <div
                data-sticker-toolbar
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-1/2 top-full mt-3 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-paper/95 px-1.5 py-1 shadow-soft backdrop-blur"
                style={{ fontSize: "0.75rem", transform: `translateX(-50%) rotate(${-s.rotation}deg) scale(${1 / Math.max(s.scale, 0.01)})`, transformOrigin: "top center" }}
              >
                <button type="button" onClick={() => update(s.id!, { scale: Math.max(0.4, s.scale - 0.15) })} className="rounded-full p-1.5 hover:bg-paper-warm" aria-label="Shrink">
                  <Minus className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => update(s.id!, { scale: Math.min(3, s.scale + 0.15) })} className="rounded-full p-1.5 hover:bg-paper-warm" aria-label="Grow">
                  <Plus className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => update(s.id!, { rotation: s.rotation + 15 })} className="rounded-full p-1.5 hover:bg-paper-warm" aria-label="Rotate">
                  <RotateCw className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => remove(s.id!)} className="rounded-full p-1.5 text-destructive hover:bg-paper-warm" aria-label="Remove">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
