import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PaperPost, type PaperPostData } from "@/components/diary/PaperPost";
import { Loader2 } from "lucide-react";
import { hydratePost } from "@/lib/hydrate-posts";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PaperPostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("post:posts(*, profiles:author_id(username, display_name, avatar_url), post_stickers(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const rows = (data ?? []) as { post: unknown | null }[];
      setPosts(rows.filter((r) => r.post).map((r) => hydratePost(r.post as Parameters<typeof hydratePost>[0], { is_bookmarked: true })));
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      <header>
        <p className="hand text-2xl text-clay">your shelf</p>
        <h1 className="text-4xl">Saved whispers.</h1>
      </header>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-ink-muted" /></div>
      ) : posts.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border bg-paper/60 p-10 text-center text-ink-muted">
          Nothing saved yet. Tap the bookmark icon on a page to keep it here.
        </p>
      ) : (
        <div className="space-y-10">{posts.map((p) => <PaperPost key={p.id} post={p} interactive={false} />)}</div>
      )}
    </div>
  );
}
