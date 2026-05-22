import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PAPER_STYLES, PAPER_COLORS, FONT_OPTIONS, type PaperStyle, type FontKey } from "@/lib/papers";
import { MOODS, type Mood } from "@/lib/moods";
import { PaperPost } from "@/components/diary/PaperPost";
import { StickerLayer, type PlacedSticker } from "@/components/diary/StickerLayer";
import { StickerDrawer } from "@/components/diary/StickerDrawer";
import { ImageUploader } from "@/components/diary/ImageUploader";
import { loadDraft, saveDraft, clearDraft, isMeaningfulDraft, type DraftState } from "@/lib/drafts";
import { Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { PAPER_BY_KEY } from "@/lib/papers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/compose")({
  component: ComposePage,
});

function ComposePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("notebook");
  const [paperColor, setPaperColor] = useState(PAPER_COLORS[0]);
  const [fontKey, setFontKey] = useState<FontKey>("serif");
  const [anonymous, setAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const restoredOnce = useRef(false);

  // Restore draft once we know the user
  useEffect(() => {
    if (!user || restoredOnce.current) return;
    restoredOnce.current = true;
    const d = loadDraft(user.id);
    if (isMeaningfulDraft(d) && d) {
      setTitle(d.title);
      setContent(d.content);
      setMood((d.mood as Mood) ?? null);
      setPaperStyle(d.paperStyle as PaperStyle);
      setPaperColor(d.paperColor);
      setFontKey(d.fontKey as FontKey);
      setAnonymous(d.anonymous);
      setIsPrivate(d.isPrivate);
      setRotation(d.rotation);
      setImageUrl(d.imageUrl);
      setBackgroundImage(d.backgroundImage);
      setStickers(d.stickers.map((s) => ({ ...s, id: crypto.randomUUID() })));
      setDraftRestored(true);
    }
  }, [user]);

  // Autosave
  useEffect(() => {
    if (!user) return;
    const draft: DraftState = {
      title, content, mood, paperStyle, paperColor, fontKey,
      anonymous, isPrivate, rotation, imageUrl, backgroundImage,
      stickers: stickers.map(({ id: _id, ...rest }) => rest),
    };
    const t = setTimeout(() => saveDraft(user.id, draft), 400);
    return () => clearTimeout(t);
  }, [user, title, content, mood, paperStyle, paperColor, fontKey, anonymous, isPrivate, rotation, imageUrl, backgroundImage, stickers]);

  const resetAll = () => {
    if (!user) return;
    setTitle(""); setContent(""); setMood(null);
    setPaperStyle("notebook"); setPaperColor(PAPER_COLORS[0]); setFontKey("serif");
    setAnonymous(false); setIsPrivate(false); setRotation(0);
    setImageUrl(null); setBackgroundImage(null); setStickers([]);
    clearDraft(user.id);
    setDraftRestored(false);
  };

  const addSticker = (key: string) => {
    setStickers((cur) => [
      ...cur,
      { id: crypto.randomUUID(), key, x: 70 + Math.random() * 10, y: 20 + Math.random() * 10, scale: 1, rotation: -5 + Math.random() * 10, z: (cur[cur.length - 1]?.z ?? 10) + 1 },
    ]);
  };

  const publish = async () => {
    if (!user) return;
    if (!content.trim()) { toast.error("Write a few words first"); return; }
    const trimmedSpotify = spotifyUrl.trim();
    if (trimmedSpotify) {
      const { isValidSpotifyUrl } = await import("@/lib/spotify");
      if (!isValidSpotifyUrl(trimmedSpotify)) {
        toast.error("That doesn't look like a Spotify link.");
        return;
      }
    }
    let publishAtIso: string | null = null;
    if (publishAt.trim()) {
      const t = new Date(publishAt);
      if (Number.isNaN(t.getTime())) { toast.error("Invalid release date"); return; }
      if (t.getTime() <= Date.now()) { toast.error("Pick a future release date"); return; }
      publishAtIso = t.toISOString();
    }
    setSaving(true);
    const { data: inserted, error } = await supabase.from("posts").insert({
      author_id: user.id,
      title: title.trim() || null,
      content: content.trim(),
      mood,
      paper_style: paperStyle,
      paper_color: paperColor,
      font_family: fontKey,
      rotation,
      is_anonymous: anonymous,
      visibility: isPrivate ? "private" : "public",
      image_url: imageUrl,
      background_image: backgroundImage,
      spotify_url: trimmedSpotify || null,
      publish_at: publishAtIso,
    }).select("id").single();
    if (error || !inserted) {
      setSaving(false);
      toast.error(error?.message ?? "Could not save");
      return;
    }
    if (stickers.length > 0) {
      const rows = stickers.map((s) => ({
        post_id: inserted.id,
        sticker_key: s.key,
        x: s.x, y: s.y, scale: s.scale, rotation: s.rotation, z_index: s.z,
      }));
      await supabase.from("post_stickers").insert(rows);
    }
    clearDraft(user.id);
    setSaving(false);
    toast.success("Page added to your diary");
    nav({ to: "/feed" });
  };

  const paper = PAPER_BY_KEY[paperStyle] ?? PAPER_BY_KEY.hvs;
  const fontFamily = FONT_OPTIONS.find((f) => f.key === fontKey)?.family;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <header>
          <p className="hand text-2xl text-clay">a new page</p>
          <h1 className="text-4xl">Write what you truly feel.</h1>
        </header>

        {draftRestored && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-clay/40 bg-paper/60 px-4 py-2 text-xs text-ink-muted">
            <span className="hand text-base text-clay">draft restored</span>
            <button onClick={resetAll} className="flex items-center gap-1 rounded-full px-2 py-1 hover:text-foreground">
              <X className="h-3 w-3" /> Start over
            </button>
          </div>
        )}

        {/* Live editable preview with sticker layer */}
        <article className="ink-rise" style={{ transform: `rotate(${rotation}deg)` }}>
          <div
            className={cn("relative isolate overflow-hidden rounded-2xl paper-edge grain", paper.className)}
            style={{ ["--paper-color" as never]: paperColor, backgroundColor: paperColor, padding: "2rem 2.25rem 1.75rem", minHeight: 360 } as React.CSSProperties}
          >
            {backgroundImage && (
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.55, mixBlendMode: "multiply", zIndex: 0 }} />
            )}
            <span className="tape" style={{ top: -10, left: "12%", width: 70, height: 22, transform: "rotate(-6deg)", zIndex: 6 }} />
            <div className="relative z-[2] space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full bg-transparent text-2xl outline-none placeholder:text-ink-muted/60"
                style={{ fontFamily }}
              />
              {imageUrl && (
                <div className="relative">
                  <img src={imageUrl} alt="" className="max-h-72 w-full rounded-md object-cover paper-edge" />
                  <button onClick={() => setImageUrl(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 shadow-soft" aria-label="Remove image">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Today, I felt..."
                rows={10}
                className="w-full resize-none bg-transparent text-base leading-[1.7] outline-none placeholder:text-ink-muted/60"
                style={{ fontFamily }}
              />
              {mood && (
                <span className="inline-block rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide" style={{ background: MOODS.find((m) => m.key === mood)?.color }}>
                  {MOODS.find((m) => m.key === mood)?.emoji} {MOODS.find((m) => m.key === mood)?.label}
                </span>
              )}
            </div>
            <StickerLayer stickers={stickers} onChange={setStickers} editable />
          </div>
        </article>

        {/* Hidden preview for sanity — not needed since editor IS the preview */}
        <details className="rounded-2xl border border-border bg-paper/40 px-4 py-2 text-xs text-ink-muted">
          <summary className="cursor-pointer">Read-only preview</summary>
          <div className="mt-3">
            <PaperPost
              interactive={false}
              post={{
                id: "preview",
                title: title || null,
                content: content || "Start typing here...",
                mood,
                paper_style: paperStyle,
                paper_color: paperColor,
                font_family: fontKey,
                rotation: 0,
                is_anonymous: anonymous,
                image_url: imageUrl,
                background_image: backgroundImage,
                stickers,
                created_at: new Date().toISOString(),
                author: anonymous ? null : { username: "you", display_name: null, avatar_url: null },
              }}
            />
          </div>
        </details>
      </div>

      {/* Sidebar editor */}
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
        <Section title="Mood">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(mood === m.key ? null : m.key)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  mood === m.key ? "border-clay bg-paper shadow-soft" : "border-border bg-paper/60 hover:bg-paper"
                }`}
                style={mood === m.key ? { background: m.color } : undefined}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Paper">
          <div className="grid grid-cols-3 gap-2">
            {PAPER_STYLES.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPaperStyle(p.key); setPaperColor(p.defaultColor); }}
                className={`relative h-16 overflow-hidden rounded-xl border text-[10px] font-medium uppercase tracking-wide transition ${
                  paperStyle === p.key ? "border-clay ring-2 ring-clay/30" : "border-border"
                } ${p.className}`}
                style={{ ["--paper-color" as never]: p.defaultColor, backgroundColor: p.defaultColor }}
              >
                <span className="absolute inset-x-0 bottom-1 text-ink/70">{p.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Color">
          <div className="flex flex-wrap gap-2">
            {PAPER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPaperColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition ${paperColor === c ? "border-clay scale-110" : "border-border"}`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </Section>

        <Section title="Font">
          <div className="flex gap-2">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFontKey(f.key)}
                className={`flex-1 rounded-full border px-3 py-2 text-sm transition ${
                  fontKey === f.key ? "border-clay bg-paper" : "border-border bg-paper/60"
                }`}
                style={{ fontFamily: f.family }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Tilt">
          <input
            type="range" min={-6} max={6} step={0.5} value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full accent-[var(--clay)]"
          />
        </Section>

        <Section title="Photo">
          <ImageUploader bucket="post-images" value={imageUrl} onChange={setImageUrl} label="Add a photo" />
        </Section>

        <Section title="Background">
          <ImageUploader bucket="post-backgrounds" value={backgroundImage} onChange={setBackgroundImage} label="Add background" />
        </Section>

        <Section title="Stickers">
          <StickerDrawer onPick={addSticker} />
        </Section>

        <Section title="Music">
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="Paste a Spotify link"
            className="w-full rounded-xl border border-border bg-paper/60 px-3 py-2 text-sm outline-none focus:border-clay"
          />
          <p className="mt-1.5 text-[11px] text-ink-muted">Track, album, or playlist — embeds on the page.</p>
        </Section>

        <Section title="Time capsule">
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="w-full rounded-xl border border-border bg-paper/60 px-3 py-2 text-sm outline-none focus:border-clay"
          />
          <p className="mt-1.5 text-[11px] text-ink-muted">Hide this page until the chosen moment. Leave empty to publish now.</p>
        </Section>

        <div className="space-y-2 rounded-2xl border border-border bg-paper/60 p-4">
          <Toggle checked={anonymous} onChange={setAnonymous} label="Post anonymously" />
          <Toggle checked={isPrivate} onChange={setIsPrivate} label="Private (only you)" />
        </div>

        <button
          onClick={publish}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-clay py-3 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Add to my diary
        </button>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-paper/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      <span>{label}</span>
      <button
        type="button" onClick={() => onChange(!checked)}
        className={`h-5 w-9 rounded-full transition ${checked ? "bg-clay" : "bg-border"}`}
      >
        <span className={`block h-4 w-4 translate-y-0.5 rounded-full bg-paper transition ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
