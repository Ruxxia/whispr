import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProductKind = Database["public"]["Enums"]["product_kind"];
export type MarketItem = Database["public"]["Tables"]["marketplace_items"]["Row"];
export type LibraryEntry = Database["public"]["Tables"]["user_library"]["Row"];

export const KIND_META: Record<ProductKind, { label: string; tagline: string }> = {
  sticker_pack: { label: "Sticker packs", tagline: "Tiny art for your pages" },
  paper_theme: { label: "Paper themes", tagline: "New textures and tones" },
  profile_theme: { label: "Profile themes", tagline: "Dress up your corner" },
  collection: { label: "Collections", tagline: "Curated seasonal drops" },
};

export const KIND_ORDER: ProductKind[] = ["sticker_pack", "paper_theme", "profile_theme", "collection"];

export async function listItems(kind?: ProductKind) {
  let q = supabase
    .from("marketplace_items")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MarketItem[];
}

export async function getItemBySlug(slug: string) {
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as MarketItem | null;
}

export async function listLibrary(userId: string) {
  const { data, error } = await supabase
    .from("user_library")
    .select("*, item:marketplace_items(*)")
    .eq("user_id", userId)
    .order("acquired_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as (LibraryEntry & { item: MarketItem })[];
}

export async function getOwnedIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_library")
    .select("item_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.item_id));
}

export async function claimFree(itemId: string) {
  const { data, error } = await supabase.rpc("claim_free_item" as never, { _item_id: itemId } as never);
  if (error) throw error;
  return data;
}

export async function setEquipped(userId: string, itemId: string, equipped: boolean) {
  const { error } = await supabase
    .from("user_library")
    .update({ equipped })
    .eq("user_id", userId)
    .eq("item_id", itemId);
  if (error) throw error;
}

/** When equipping a profile_theme, mirror its accent_color onto the profile. */
export async function applyProfileTheme(userId: string, payload: Record<string, unknown>) {
  const accent = typeof payload.accent_color === "string" ? payload.accent_color : null;
  if (!accent) return;
  await supabase.from("profiles").update({ accent_color: accent }).eq("id", userId);
}
