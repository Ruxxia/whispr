import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  listLibrary,
  setEquipped,
  applyProfileTheme,
  KIND_META,
  type LibraryEntry,
  type MarketItem,
} from "@/lib/marketplace";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/library")({
  component: LibraryPage,
});

type Row = LibraryEntry & { item: MarketItem };

function LibraryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listLibrary(user.id)
      .then(setRows)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = async (row: Row) => {
    if (!user) return;
    setPending(row.item_id);
    try {
      const next = !row.equipped;
      await setEquipped(user.id, row.item_id, next);
      if (next && row.item.kind === "profile_theme") {
        await applyProfileTheme(user.id, (row.item.payload ?? {}) as Record<string, unknown>);
      }
      setRows((prev) => prev.map((r) => (r.item_id === row.item_id ? { ...r, equipped: next } : r)));
      toast.success(next ? "Equipped" : "Unequipped");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-ink-muted">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.2em]">Your library</span>
        </div>
        <h1 className="serif text-4xl">Stuff you own</h1>
        <p className="text-ink-muted">
          Equip themes and packs to use them on your pages and profile.{" "}
          <Link to="/market" className="underline-offset-4 hover:underline">Find more →</Link>
        </p>
      </header>

      {loading ? (
        <div className="grid place-items-center py-16 text-ink-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-paper/40 p-10 text-center text-ink-muted">
          Your library is empty. <Link to="/market" className="underline">Browse the marketplace</Link>.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <li
              key={row.item_id}
              className="flex flex-col rounded-2xl border border-border/70 bg-paper p-5 shadow-soft"
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                {KIND_META[row.item.kind].label}
              </div>
              <Link
                to="/market/$slug"
                params={{ slug: row.item.slug }}
                className="serif mt-1 text-xl hover:underline"
              >
                {row.item.title}
              </Link>
              {row.item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{row.item.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  Acquired {new Date(row.acquired_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => toggle(row)}
                  disabled={pending === row.item_id}
                  className={`rounded-full px-4 py-1.5 text-sm transition disabled:opacity-50 ${
                    row.equipped
                      ? "bg-clay text-paper"
                      : "border border-border/70 bg-paper text-ink-muted hover:text-foreground"
                  }`}
                >
                  {row.equipped ? "Equipped" : "Equip"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
