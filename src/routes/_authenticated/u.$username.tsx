import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PaperPost, type PaperPostData } from "@/components/diary/PaperPost";
import { PostGridTile } from "@/components/diary/PostGridTile";
import { PostDialog } from "@/components/diary/PostDialog";
import { Loader2, Pencil, LayoutGrid, Rows3, Download, Flame } from "lucide-react";
import { EditProfileDialog, type EditableProfile } from "@/components/profile/EditProfileDialog";
import { hydratePosts } from "@/lib/hydrate-posts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { computeStreak, gentleBadge, exportDiaryAsPDF } from "@/lib/diary-stats";

export const Route = createFileRoute("/_authenticated/u/$username")({
  component: ProfilePage,
});

type Profile = EditableProfile & { username: string; created_at: string };

function ProfilePage() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PaperPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0, pages: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: prof } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
      if (!prof) { setLoading(false); return; }
      setProfile(prof as Profile);

      const [{ data: rows }, { count: followers }, { count: followingC }] = await Promise.all([
        supabase.from("posts")
          .select("*, profiles:author_id(username, display_name, avatar_url), post_stickers(*)")
          .eq("author_id", prof.id)
          .eq("visibility", "public")
          .order("created_at", { ascending: false }),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", prof.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", prof.id),
      ]);
      const list = hydratePosts(rows ?? []);
      setPosts(list);
      setCounts({ followers: followers ?? 0, following: followingC ?? 0, pages: list.length });

      if (user && user.id !== prof.id) {
        const { data: f } = await supabase.from("follows")
          .select("follower_id").eq("follower_id", user.id).eq("following_id", prof.id).maybeSingle();
        setFollowing(!!f);
      }
      setLoading(false);
    })();
  }, [username, user]);

  const isMe = !!(user && profile && user.id === profile.id);
  const accent = profile?.accent_color ?? "#8b7355";

  const toggleFollow = async () => {
    if (!user || !profile || isMe) return;
    if (following) {
      await supabase.from("follows").delete().match({ follower_id: user.id, following_id: profile.id });
      setFollowing(false); setCounts((c) => ({ ...c, followers: c.followers - 1 }));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      setFollowing(true); setCounts((c) => ({ ...c, followers: c.followers + 1 }));
    }
  };

  const removePost = async (postId: string) => {
    if (!isMe) return;
    if (!confirm("Tear out this page? This cannot be undone.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) { toast.error(error.message); return; }
    setPosts((cur) => cur.filter((p) => p.id !== postId));
    setCounts((c) => ({ ...c, pages: Math.max(0, c.pages - 1) }));
    setOpenId((id) => (id === postId ? null : id));
    toast.success("Page torn out.");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-ink-muted" /></div>;
  if (!profile) return <p className="text-center text-ink-muted">No diary found for @{username}.</p>;

  const openPost = posts.find((p) => p.id === openId) ?? null;

  return (
    <div className="space-y-10">
      <header
        className="relative overflow-hidden rounded-3xl border border-border p-8 paper-edge"
        style={{ background: `linear-gradient(135deg, ${accent}22, var(--paper))` }}
      >
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-2xl" style={{ background: `${accent}55` }} />
        <div className="relative flex flex-wrap items-start gap-6">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover paper-edge" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full text-3xl text-paper" style={{ background: accent }}>
                {(profile.display_name ?? profile.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl">{profile.display_name ?? profile.username}</h1>
              <p className="text-sm text-ink-muted">@{profile.username}</p>
            </div>
          </div>
          <div className="w-full mt-2">
            <p className="max-w-prose text-sm text-foreground/80">
              {profile.bio || <span className="italic text-ink-muted">{isMe ? "Add a bio to introduce your diary." : "no bio yet"}</span>}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted w-full">
              <span><strong className="text-foreground">{counts.pages}</strong> pages</span>
              <span><strong className="text-foreground">{counts.followers}</strong> followers</span>
              <span><strong className="text-foreground">{counts.following}</strong> following</span>
              {(() => {
                const streak = computeStreak(posts);
                if (streak <= 0) return null;
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs text-clay">
                    <Flame className="h-3.5 w-3.5" /> {streak}-day streak
                  </span>
                );
              })()}
              {(() => {
                const badge = gentleBadge(computeStreak(posts), counts.pages);
                if (!badge) return null;
                return (
                  <span className="rounded-full bg-paper-warm px-2.5 py-1 text-[11px] uppercase tracking-wide text-ink-muted">
                    {badge}
                  </span>
                );
              })()}
            </div>
          </div>
          {!isMe && user && (
            <button
              onClick={toggleFollow}
              className={`rounded-full px-5 py-2 text-sm transition ${following ? "border border-border bg-paper" : "text-paper hover:opacity-90"}`}
              style={!following ? { background: accent } : undefined}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
          {isMe && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportDiaryAsPDF({ displayName: profile.display_name ?? profile.username, username: profile.username, posts })}
                disabled={posts.length === 0}
                className="flex items-center gap-1.5 rounded-full border border-border bg-paper px-4 py-2 text-xs hover:bg-paper-warm disabled:opacity-50"
              >
                <Download className="h-3 w-3" /> Export PDF
              </button>
              <button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5 rounded-full border border-border bg-paper px-4 py-2 text-xs hover:bg-paper-warm">
                <Pencil className="h-3 w-3" /> Edit profile
              </button>
            </div>
          )}
        </div>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border bg-paper/60 p-10 text-center text-ink-muted">
          No public pages yet.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="inline-flex rounded-full border border-border bg-paper/60 p-1">
              <button
                onClick={() => setView("list")}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition", view === "list" ? "bg-clay text-paper" : "text-ink-muted hover:text-foreground")}
              >
                <Rows3 className="h-3.5 w-3.5" /> Pages
              </button>
              <button
                onClick={() => setView("grid")}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition", view === "grid" ? "bg-clay text-paper" : "text-ink-muted hover:text-foreground")}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
            </div>
          </div>

          {view === "list" ? (
            <div className="space-y-10">
              {posts.map((p) => (
                <PaperPost
                  key={p.id}
                  post={p}
                  interactive={false}
                  truncate
                  onOpen={() => setOpenId(p.id)}
                  canDelete={isMe}
                  onDelete={() => removePost(p.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {posts.map((p) => (
                <PostGridTile key={p.id} post={p} onOpen={() => setOpenId(p.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      <PostDialog
        post={openPost}
        open={!!openPost}
        onOpenChange={(o) => !o && setOpenId(null)}
        canDelete={isMe}
        onDelete={openPost ? () => removePost(openPost.id) : undefined}
      />

      {isMe && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSaved={(p) => setProfile({ ...profile, ...p })}
        />
      )}
    </div>
  );
}
