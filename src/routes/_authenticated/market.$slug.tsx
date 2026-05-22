import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { claimFree, getItemBySlug, getOwnedIds, KIND_META, type MarketItem } from "@/lib/marketplace";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/market/$slug")({
  component: ItemDetail,
});

function ItemDetail() {
  const { slug } = useParams({ from: "/_authenticated/market/$slug" });
  const { user } = useAuth();
  const [item, setItem] = useState<MarketItem | null>(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getItemBySlug(slug), user ? getOwnedIds(user.id) : Promise.resolve(new Set<string>())])
      .then(([it, own]) => {
        setItem(it);
        if (it) setOwned(own.has(it.id));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleClaim = async () => {
    if (!item) return;
    setClaiming(true);
    try {
      await claimFree(item.id);
      setOwned(true);
      toast.success(`Added "${item.title}" to your library`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!item) {
    return (
      <div className="py-24 text-center text-ink-muted">
        Item not found.
        <div className="mt-4">
          <Link to="/market" className="underline">Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const contents = renderPayload(item);

  return (
    <div className="space-y-8">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Marketplace
      </Link>

      <header className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          {KIND_META[item.kind].label}
          {item.season && <span> · {item.season}</span>}
        </div>
        <h1 className="serif text-4xl leading-tight">{item.title}</h1>
        {item.description && <p className="text-ink-muted">{item.description}</p>}
      </header>

      <section className="rounded-2xl border border-border/70 bg-paper p-6 shadow-soft">
        <div className="mb-4 text-xs uppercase tracking-[0.18em] text-ink-muted">What's inside</div>
        {contents}
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-paper/60 p-5">
        <div>
          <div className="serif text-2xl text-clay">
            {item.is_free ? "Free" : `$${(item.price_cents / 100).toFixed(2)}`}
          </div>
          <div className="text-xs text-ink-muted">Yours forever once claimed</div>
        </div>
        {owned ? (
          <Link
            to="/library"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2 text-sm"
          >
            <Check className="h-4 w-4" /> In library
          </Link>
        ) : (
          <button
            onClick={handleClaim}
            disabled={claiming || !item.is_free}
            className="rounded-full bg-clay px-6 py-2.5 text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {claiming ? "Claiming…" : item.is_free ? "Claim for free" : "Buy"}
          </button>
        )}
      </div>
    </div>
  );
}

function renderPayload(item: MarketItem) {
  const p = (item.payload ?? {}) as Record<string, unknown>;
  if (item.kind === "sticker_pack" && Array.isArray(p.stickers)) {
    return (
      <ul className="flex flex-wrap gap-2 text-sm">
        {(p.stickers as string[]).map((s) => (
          <li key={s} className="rounded-full bg-secondary px-3 py-1 text-ink-muted">
            {s.replaceAll("-", " ")}
          </li>
        ))}
      </ul>
    );
  }
  if (item.kind === "paper_theme") {
    return (
      <div className="flex items-center gap-4">
        <div
          className="h-24 w-24 rounded-lg border border-border/70 shadow-inner"
          style={{ background: (p.paper_color as string) ?? "#faf8f5" }}
        />
        <div className="text-sm text-ink-muted">
          <div>Style: <span className="text-foreground">{String(p.paper_style ?? "—")}</span></div>
          <div>Font: <span className="text-foreground">{String(p.font_family ?? "—")}</span></div>
        </div>
      </div>
    );
  }
  if (item.kind === "profile_theme") {
    return (
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-full border border-border/70"
          style={{ background: (p.accent_color as string) ?? "#8b7355" }}
        />
        <div className="text-sm text-ink-muted">Accent color: {String(p.accent_color)}</div>
      </div>
    );
  }
  if (item.kind === "collection" && Array.isArray(p.includes)) {
    return (
      <ul className="space-y-2 text-sm">
        {(p.includes as string[]).map((slug) => (
          <li key={slug}>
            <Link to="/market/$slug" params={{ slug }} className="underline-offset-4 hover:underline">
              · {slug.replaceAll("-", " ")}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-ink-muted">Details coming soon.</p>;
}
