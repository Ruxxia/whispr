import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type NotificationRow = {
  id: string;
  recipient_id: string;
  actor_id: string;
  kind: "reaction" | "bookmark" | "follow";
  post_id: string | null;
  reaction_kind: string | null;
  read_at: string | null;
  created_at: string;
  actor?: { username: string; display_name: string | null; avatar_url: string | null } | null;
};

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);
    const rows = (data ?? []) as NotificationRow[];
    const actorIds = Array.from(new Set(rows.map((r) => r.actor_id)));
    let actors = new Map<string, NotificationRow["actor"]>();
    if (actorIds.length) {
      const { data: profs } = await supabase
        .from("profiles").select("id, username, display_name, avatar_url").in("id", actorIds);
      (profs ?? []).forEach((p) => actors.set(p.id, { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url }));
    }
    setItems(rows.map((r) => ({ ...r, actor: actors.get(r.actor_id) ?? null })));
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${user.id}` },
        () => { void load(); }
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [user, load]);

  const unread = items.filter((i) => !i.read_at).length;

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const ids = items.filter((i) => !i.read_at).map((i) => i.id);
    if (!ids.length) return;
    setItems((cur) => cur.map((i) => i.read_at ? i : { ...i, read_at: new Date().toISOString() }));
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
  }, [user, items]);

  return { items, unread, loading, markAllRead, reload: load };
}
