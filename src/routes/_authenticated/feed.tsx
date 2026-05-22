import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MOODS, type Mood } from "@/lib/moods";
import { FeedList } from "@/components/diary/FeedList";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedKind } from "@/lib/feeds";

export const Route = createFileRoute("/_authenticated/feed")({
  component: FeedPage,
});

const TABS: { key: FeedKind; label: string; hint: string }[] = [
  { key: "all", label: "For you", hint: "Quiet pages from people, like you." },
  { key: "following", label: "Following", hint: "Pages from souls you follow." },
  { key: "tonight", label: "Tonight", hint: "Whispers from the last twelve hours." },
];

function FeedPage() {
  const [tab, setTab] = useState<FeedKind>("all");
  const [mood, setMood] = useState<Mood | null>(null);
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="hand text-2xl text-clay">today</p>
        <h1 className="text-4xl sm:text-5xl">{active.hint}</h1>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full border border-border bg-paper/60 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition",
              tab === t.key ? "bg-clay text-paper shadow-soft" : "text-ink-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mood chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={!mood} onClick={() => setMood(null)}>All moods</FilterChip>
        {MOODS.map((m) => (
          <Link
            key={m.key}
            to="/mood/$mood"
            params={{ mood: m.key }}
            className="whitespace-nowrap rounded-full border border-border bg-paper/60 px-3.5 py-1.5 text-xs font-medium text-ink-muted transition hover:text-foreground"
            style={{ background: m.color }}
          >
            <span className="mr-1">{m.emoji}</span>{m.label}
          </Link>
        ))}
      </div>

      <FeedList
        kind={tab === "all" && mood ? "mood" : tab}
        mood={mood}
        emptyHint={
          tab === "following" ? (
            <>
              <p className="hand text-3xl text-clay">no follows yet</p>
              <p className="mt-2 text-ink-muted">Find writers whose words feel like home.</p>
            </>
          ) : (
            <>
              <p className="hand text-3xl text-clay">no whispers yet</p>
              <p className="mt-2 text-ink-muted">Be the first to share something tender.</p>
              <Link to="/compose" className="mt-5 inline-flex items-center gap-2 rounded-full bg-clay px-5 py-2.5 text-sm text-paper">
                <PenLine className="h-4 w-4" /> Write a page
              </Link>
            </>
          )
        }
      />
    </div>
  );
}

function FilterChip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
        active ? "border-clay bg-paper text-foreground shadow-soft" : "border-border bg-paper/60 text-ink-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
