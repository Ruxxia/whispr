import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PaperPost, type PaperPostData } from "@/components/diary/PaperPost";
import { hydratePosts } from "@/lib/hydrate-posts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/search")({
  component: SearchPage,
});

type Tab = "people" | "pages";
type Person = { id: string; username: string; display_name: string | null; avatar_url: string | null; bio: string | null };

function SearchPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("people");
  const [debounced, setDebounced] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [pages, setPages] = useState<PaperPostData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!debounced) { setPeople([]); setPages([]); return; }
    let cancel = false;
    (async () => {
      setLoading(true);
      const like = `%${debounced.replace(/[%_]/g, "\\$&")}%`;
      const [{ data: profs }, { data: posts }] = await Promise.all([
        supabase.from("profiles")
          .select("id, username, display_name, avatar_url, bio")
          .or(`username.ilike.${like},display_name.ilike.${like}`)
          .limit(20),
        supabase.from("posts")
          .select("*, profiles:author_id(username, display_name, avatar_url), post_stickers(*)")
          .eq("visibility", "public")
          .or(`content.ilike.${like},title.ilike.${like}`)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (cancel) return;
      setPeople((profs ?? []) as Person[]);
      setPages(hydratePosts(posts ?? []));
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [debounced]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="hand text-2xl text-clay">find</p>
        <h1 className="text-4xl sm:text-5xl">Search the diary.</h1>
      </header>

      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="People or words…"
          className="w-full rounded-full border border-border bg-paper/80 py-3 pl-11 pr-4 text-base outline-none transition focus:border-clay"
        />
      </label>

      <div className="flex gap-1 rounded-full border border-border bg-paper/60 p-1 w-fit">
        {(["people", "pages"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm capitalize transition",
              tab === t ? "bg-clay text-paper shadow-soft" : "text-ink-muted hover:text-foreground",
            )}
          >
            {t} {t === "people" && people.length > 0 ? `· ${people.length}` : ""}
            {t === "pages" && pages.length > 0 ? `· ${pages.length}` : ""}
          </button>
        ))}
      </div>

      {!debounced ? (
        <p className="rounded-3xl border border-dashed border-border bg-paper/60 p-10 text-center text-ink-muted">
          Type to look for kindred spirits or familiar words.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-12 text-ink-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : tab === "people" ? (
        people.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-paper/60 p-10 text-center text-ink-muted">No one with that name.</p>
        ) : (
          <ul className="space-y-3">
            {people.map((p) => (
              <li key={p.id}>
                <Link to="/u/$username" params={{ username: p.username }} className="flex items-center gap-3 rounded-2xl border border-border bg-paper/70 p-4 transition hover:bg-paper">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-paper-warm text-lg font-semibold text-clay">
                      {(p.display_name ?? p.username).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{p.display_name ?? p.username}</p>
                    <p className="text-sm text-ink-muted">@{p.username}</p>
                    {p.bio && <p className="mt-1 line-clamp-1 text-xs text-foreground/70">{p.bio}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        pages.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border bg-paper/60 p-10 text-center text-ink-muted">No pages match.</p>
        ) : (
          <div className="space-y-10">
            {pages.map((p) => <PaperPost key={p.id} post={p} interactive={false} />)}
          </div>
        )
      )}
    </div>
  );
}
