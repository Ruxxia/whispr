import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Counts new public posts that arrived after `since`. */
export function useRealtimePosts(since: string | null, enabled = true) {
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const sinceRef = useRef(since);
  sinceRef.current = since;

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const row = payload.new as { id: string; visibility: string; created_at: string };
          if (row.visibility !== "public") return;
          if (sinceRef.current && row.created_at <= sinceRef.current) return;
          setPendingIds((cur) => (cur.includes(row.id) ? cur : [row.id, ...cur]));
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [enabled]);

  return {
    pendingIds,
    pendingCount: pendingIds.length,
    drain: () => { const ids = pendingIds; setPendingIds([]); return ids; },
  };
}
