import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, Sparkles, LayoutGrid, Rows3 } from "lucide-react";
import { PaperPost, type PaperPostData } from "@/components/diary/PaperPost";
import { PostGridTile } from "@/components/diary/PostGridTile";
import { PostDialog } from "@/components/diary/PostDialog";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimePosts } from "@/hooks/use-realtime-posts";
import { loadFeedPage, fetchPostsByIds, type FeedKind } from "@/lib/feeds";
import { supabase } from "@/integrations/supabase/client";
import type { ReactionKind, Mood } from "@/lib/moods";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "list" | "grid";

export function FeedList({ kind, mood, emptyHint }: { kind: FeedKind; mood?: Mood | null; emptyHint?: React.ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PaperPostData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [openId, setOpenId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const since = posts[0]?.created_at ?? null;
  const realtimeEnabled = kind !== "following";
  const { pendingCount, drain } = useRealtimePosts(since, realtimeEnabled);

  const reset = useCallback(async () => {
    setLoading(true);
    setPosts([]); setCursor(null); setDone(false);
    try {
      const page = await loadFeedPage({ kind, cursor: null, mood, userId: user?.id ?? null });
      setPosts(page.posts);
      setCursor(page.nextCursor);
      if (!page.nextCursor) setDone(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  }, [kind, mood, user?.id]);

  useEffect(() => { void reset(); }, [reset]);

  const loadMore = useCallback(async () => {
    if (loadingMore || done || loading) return;
    setLoadingMore(true);
    try {
      const page = await loadFeedPage({ kind, cursor, mood, userId: user?.id ?? null });
      setPosts((cur) => [...cur, ...page.posts]);
      setCursor(page.nextCursor);
      if (!page.nextCursor) setDone(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoadingMore(false); }
  }, [cursor, done, kind, loading, loadingMore, mood, user?.id]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) void loadMore();
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const showNew = async () => {
    const ids = drain();
    if (!ids.length) return;
    const fresh = await fetchPostsByIds(ids, user?.id ?? null);
    setPosts((cur) => {
      const seen = new Set(cur.map((p) => p.id));
      return [...fresh.filter((p) => !seen.has(p.id)), ...cur];
    });
  };

  const react = async (postId: string, k: ReactionKind) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    const has = post?.my_reactions?.includes(k);
    setPosts((cur) => cur.map((p) => p.id === postId
      ? { ...p, my_reactions: has ? p.my_reactions?.filter((x) => x !== k) : [...(p.my_reactions ?? []), k] }
      : p));
    if (has) await supabase.from("reactions").delete().match({ post_id: postId, user_id: user.id, kind: k });
    else await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind: k });
  };
  const bookmark = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    const has = post?.is_bookmarked;
    setPosts((cur) => cur.map((p) => p.id === postId ? { ...p, is_bookmarked: !has } : p));
    if (has) await supabase.from("bookmarks").delete().match({ post_id: postId, user_id: user.id });
    else await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id });
  };
  const remove = async (postId: string) => {
    if (!user) return;
    if (!confirm("Tear out this page? This cannot be undone.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) { toast.error(error.message); return; }
    setPosts((cur) => cur.filter((p) => p.id !== postId));
    setOpenId((id) => (id === postId ? null : id));
    toast.success("Page torn out.");
  };

  const openPost = posts.find((p) => p.id === openId) ?? null;

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-ink-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  if (posts.length === 0) {
    return <div className="rounded-3xl border border-dashed border-border bg-paper/60 p-12 text-center">{emptyHint ?? <p className="hand text-3xl text-clay">it's quiet here</p>}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="inline-flex rounded-full border border-border bg-paper/60 p-1">
          <button
            onClick={() => setView("list")}
            className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition", view === "list" ? "bg-clay text-paper" : "text-ink-muted hover:text-foreground")}
            aria-label="List view"
          >
            <Rows3 className="h-3.5 w-3.5" /> Pages
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition", view === "grid" ? "bg-clay text-paper" : "text-ink-muted hover:text-foreground")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="sticky top-20 z-30 flex justify-center">
          <button
            onClick={showNew}
            className="inline-flex items-center gap-2 rounded-full border border-clay/40 bg-paper px-4 py-2 text-sm text-clay shadow-soft transition hover:-translate-y-0.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {pendingCount} new whisper{pendingCount > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {view === "list" ? (
        <div className="space-y-10">
          {posts.map((p) => {
            const mine = !!user && !!p.author && p.author.username !== undefined && false; // author id not on hydrated post
            return (
              <PaperPost
                key={p.id}
                post={p}
                truncate
                onOpen={() => setOpenId(p.id)}
                onReact={(k) => react(p.id, k)}
                onBookmark={() => bookmark(p.id)}
                canDelete={mine}
                onDelete={() => remove(p.id)}
              />
            );
          })}
        </div>

      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {posts.map((p) => (
            <PostGridTile key={p.id} post={p} onOpen={() => setOpenId(p.id)} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex items-center justify-center py-8 text-ink-muted">
        {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <span className="hand text-lg text-clay">end of today's pages</span> : null}
      </div>

      <PostDialog
        post={openPost}
        open={!!openPost}
        onOpenChange={(o) => !o && setOpenId(null)}
        onReact={openPost ? (k) => react(openPost.id, k) : undefined}
        onBookmark={openPost ? () => bookmark(openPost.id) : undefined}
        canDelete={false}
        onDelete={openPost ? () => remove(openPost.id) : undefined}
      />
    </div>
  );
}
