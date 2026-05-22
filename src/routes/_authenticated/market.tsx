import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  listItems,
  getOwnedIds,
  claimFree,
  KIND_META,
  KIND_ORDER,
  type MarketItem,
  type ProductKind,
} from "@/lib/marketplace";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/market")({
  component: MarketPage,
});

function MarketPage() {
  const { user } = useAuth();
  const [kind, setKind] = useState<ProductKind | "all">("all");
  const [items, setItems] = useState<MarketItem[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listItems(kind === "all" ? undefined : kind),
      user ? getOwnedIds(user.id) : Promise.resolve(new Set<string>()),
    ])
      .then(([its, own]) => {
        setItems(its);
        setOwned(own);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [kind, user]);

  const featured = useMemo(() => items.filter((i) => i.featured).slice(0, 3), [items]);

  const handleClaim = async (item: MarketItem) => {
    if (!user) return;
    setClaiming(item.id);
    try {
      await claimFree(item.id);
      setOwned(new Set([...owned, item.id]));
      toast.success(`Added "${item.title}" to your library`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-ink-muted">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.2em]">Marketplace</span>
        </div>
        <h1 className="serif text-4xl">The stationery shop</h1>
        <p className="text-ink-muted">Free sticker packs, paper themes, and profile looks. More drops every season.</p>
        <Link to="/library" className="inline-block text-sm underline-offset-4 hover:underline text-ink-muted">
          → Your library
        </Link>
      </header>

      {featured.length > 0 && kind === "all" && (
        <section className="grid gap-4 sm:grid-cols-3">
          {featured.map((it) => (
            <FeaturedCard key={it.id} item={it} owned={owned.has(it.id)} />
          ))}
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <FilterChip active={kind === "all"} onClick={() => setKind("all")} label="All" />
        {KIND_ORDER.map((k) => (
          <FilterChip key={k} active={kind === k} onClick={() => setKind(k)} label={KIND_META[k].label} />
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-ink-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              owned={owned.has(it.id)}
              claiming={claiming === it.id}
              onClaim={() => handleClaim(it)}
            />
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-ink-muted py-12">Nothing here yet — check back soon.</p>
          )}
        </section>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-clay bg-clay text-paper"
          : "border-border/70 bg-paper/70 text-ink-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function FeaturedCard({ item, owned }: { item: MarketItem; owned: boolean }) {
  return (
    <Link
      to="/market/$slug"
      params={{ slug: item.slug }}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-paper p-5 shadow-soft transition hover:-translate-y-0.5"
    >
      <div className="absolute right-3 top-3 rounded-full bg-clay/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-paper">
        Featured
      </div>
      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        {KIND_META[item.kind].label}
      </div>
      <div className="serif text-2xl leading-tight">{item.title}</div>
      <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-clay">{item.is_free ? "Free" : `$${(item.price_cents / 100).toFixed(2)}`}</span>
        {owned && <span className="text-ink-muted">In library</span>}
      </div>
    </Link>
  );
}

function ItemCard({
  item,
  owned,
  claiming,
  onClaim,
}: {
  item: MarketItem;
  owned: boolean;
  claiming: boolean;
  onClaim: () => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/70 bg-paper p-5 shadow-soft">
      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        {KIND_META[item.kind].label}
      </div>
      <Link to="/market/$slug" params={{ slug: item.slug }} className="serif text-xl leading-tight hover:underline">
        {item.title}
      </Link>
      <p className="mt-2 flex-1 line-clamp-3 text-sm text-ink-muted">{item.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-clay">
          {item.is_free ? "Free" : `$${(item.price_cents / 100).toFixed(2)}`}
        </span>
        {owned ? (
          <span className="flex items-center gap-1 text-sm text-ink-muted">
            <Check className="h-4 w-4" /> Owned
          </span>
        ) : (
          <button
            onClick={onClaim}
            disabled={claiming || !item.is_free}
            className="rounded-full bg-clay px-4 py-1.5 text-sm text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {claiming ? "Claiming…" : item.is_free ? "Claim" : "Buy"}
          </button>
        )}
      </div>
    </article>
  );
}
