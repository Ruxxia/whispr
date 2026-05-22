import { supabase } from "@/integrations/supabase/client";
import { hydratePosts } from "@/lib/hydrate-posts";
import type { PaperPostData } from "@/components/diary/PaperPost";
import type { Mood, ReactionKind } from "@/lib/moods";

export type FeedKind = "all" | "following" | "tonight" | "mood";
export const PAGE_SIZE = 12;

const SELECT = "*, profiles:author_id(username, display_name, avatar_url), post_stickers(*)";

export async function loadFeedPage(opts: {
  kind: FeedKind;
  cursor?: string | null;
  mood?: Mood | null;
  userId?: string | null;
}): Promise<{ posts: PaperPostData[]; nextCursor: string | null }> {
  const { kind, cursor, mood, userId } = opts;

  let q = supabase
    .from("posts")
    .select(SELECT)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) q = q.lt("created_at", cursor);
  if (kind === "tonight") {
    const since = new Date(Date.now() - 12 * 3600 * 1000).toISOString();
    q = q.gte("created_at", since);
  }
  if (kind === "mood" && mood) q = q.eq("mood", mood);

  if (kind === "following" && userId) {
    const { data: follows } = await supabase
      .from("follows").select("following_id").eq("follower_id", userId);
    const ids = (follows ?? []).map((f) => f.following_id);
    if (ids.length === 0) return { posts: [], nextCursor: null };
    q = q.in("author_id", ids);
  }

  const { data, error } = await q;
  if (error) throw error;

  const ids = (data ?? []).map((p) => p.id);
  const [reactions, bookmarks] = await Promise.all([
    userId && ids.length
      ? supabase.from("reactions").select("post_id, kind").eq("user_id", userId).in("post_id", ids)
      : Promise.resolve({ data: [] as { post_id: string; kind: string }[] }),
    userId && ids.length
      ? supabase.from("bookmarks").select("post_id").eq("user_id", userId).in("post_id", ids)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
  ]);
  const myReacts = new Map<string, ReactionKind[]>();
  (reactions.data ?? []).forEach((r) => {
    const arr = myReacts.get(r.post_id) ?? []; arr.push(r.kind as ReactionKind); myReacts.set(r.post_id, arr);
  });
  const bms = new Set((bookmarks.data ?? []).map((b) => b.post_id));

  const posts = hydratePosts(data ?? [], { reactions: myReacts, bookmarks: bms });
  const nextCursor = posts.length === PAGE_SIZE ? posts[posts.length - 1].created_at : null;
  return { posts, nextCursor };
}

export async function fetchPostsByIds(ids: string[], userId?: string | null): Promise<PaperPostData[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase.from("posts").select(SELECT).in("id", ids).eq("visibility", "public");
  const myReacts = new Map<string, ReactionKind[]>();
  let bms = new Set<string>();
  if (userId) {
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase.from("reactions").select("post_id, kind").eq("user_id", userId).in("post_id", ids),
      supabase.from("bookmarks").select("post_id").eq("user_id", userId).in("post_id", ids),
    ]);
    (r ?? []).forEach((row) => {
      const arr = myReacts.get(row.post_id) ?? []; arr.push(row.kind as ReactionKind); myReacts.set(row.post_id, arr);
    });
    bms = new Set((b ?? []).map((x) => x.post_id));
  }
  return hydratePosts(data ?? [], { reactions: myReacts, bookmarks: bms });
}
