import type { PaperPostData } from "@/components/diary/PaperPost";
import type { PlacedSticker } from "@/components/diary/StickerLayer";

type RawSticker = { id: string; sticker_key: string; x: number; y: number; scale: number; rotation: number; z_index: number };

type RawPost = {
  id: string; title: string | null; content: string;
  mood: PaperPostData["mood"]; paper_style: PaperPostData["paper_style"];
  paper_color: string; font_family: string; rotation: number;
  is_anonymous: boolean; image_url: string | null;
  background_image: string | null; created_at: string;
  publish_at?: string | null;
  spotify_url?: string | null;
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null;
  post_stickers?: RawSticker[] | null;
};

export function hydratePost(p: RawPost, extra?: { my_reactions?: PaperPostData["my_reactions"]; is_bookmarked?: boolean }): PaperPostData {
  const stickers: PlacedSticker[] = (p.post_stickers ?? []).map((s) => ({
    id: s.id, key: s.sticker_key, x: s.x, y: s.y, scale: s.scale, rotation: s.rotation, z: s.z_index,
  }));
  return {
    id: p.id, title: p.title, content: p.content, mood: p.mood,
    paper_style: p.paper_style, paper_color: p.paper_color,
    font_family: p.font_family, rotation: p.rotation,
    is_anonymous: p.is_anonymous, image_url: p.image_url,
    background_image: p.background_image,
    publish_at: p.publish_at ?? null,
    spotify_url: p.spotify_url ?? null,
    stickers,
    created_at: p.created_at,
    author: p.is_anonymous ? null : p.profiles,
    ...extra,
  };
}

export function hydratePosts(rows: unknown[], lookups?: { reactions?: Map<string, PaperPostData["my_reactions"]>; bookmarks?: Set<string> }): PaperPostData[] {
  return (rows as RawPost[]).map((p) => hydratePost(p, {
    my_reactions: lookups?.reactions?.get(p.id),
    is_bookmarked: lookups?.bookmarks?.has(p.id),
  }));
}
