import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, type NotificationRow } from "@/hooks/use-notifications";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/format";
import { useState } from "react";

export function NotificationBell() {
  const { items, unread, loading, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v && unread > 0) void markAllRead();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-full border border-border/70 bg-paper/70 p-2 text-ink-muted transition hover:bg-paper hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-semibold text-paper">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="serif text-lg">Whispers about you</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="p-6 text-center text-sm text-ink-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-muted">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((n) => <NotifItem key={n.id} n={n} onNavigate={() => setOpen(false)} />)}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotifItem({ n, onNavigate }: { n: NotificationRow; onNavigate: () => void }) {
  const actor = n.actor;
  const name = actor ? `@${actor.username}` : "someone";
  const text =
    n.kind === "reaction" ? `${name} reacted to your page` :
    n.kind === "bookmark" ? `${name} saved your page` :
    `${name} followed you`;

  const inner = (
    <div className={`flex gap-3 px-4 py-3 transition hover:bg-paper-warm/60 ${!n.read_at ? "bg-paper-warm/30" : ""}`}>
      {actor?.avatar_url ? (
        <img src={actor.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="grid h-9 w-9 place-items-center rounded-full bg-paper-warm text-sm font-semibold text-clay">
          {(actor?.display_name ?? actor?.username ?? "?").slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground/90">{text}</p>
        <p className="mt-0.5 text-[11px] text-ink-muted">{formatDate(n.created_at)}</p>
      </div>
      {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" aria-hidden />}
    </div>
  );

  if (n.kind === "follow" && actor) {
    return (
      <li>
        <Link to="/u/$username" params={{ username: actor.username }} onClick={onNavigate} className="block">
          {inner}
        </Link>
      </li>
    );
  }
  if (actor) {
    return (
      <li>
        <Link to="/u/$username" params={{ username: actor.username }} onClick={onNavigate} className="block">
          {inner}
        </Link>
      </li>
    );
  }
  return <li>{inner}</li>;
}
