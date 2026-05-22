import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MOOD_BY_KEY, MOODS, type Mood } from "@/lib/moods";
import { FeedList } from "@/components/diary/FeedList";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mood/$mood")({
  component: MoodChannel,
  beforeLoad: ({ params }) => {
    if (!MOODS.find((m) => m.key === params.mood as Mood)) throw notFound();
  },
});

function MoodChannel() {
  const { mood: moodParam } = Route.useParams();
  const mood = moodParam as Mood;
  const m = MOOD_BY_KEY[mood];

  return (
    <div className="space-y-8">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> back to feed
      </Link>
      <header
        className="rounded-3xl border border-border p-8 paper-edge"
        style={{ background: `linear-gradient(135deg, ${m.color}, var(--paper))` }}
      >
        <p className="hand text-2xl text-clay">a channel for the</p>
        <h1 className="mt-1 text-5xl">{m.emoji} {m.label}</h1>
        <p className="mt-3 max-w-prose text-sm text-foreground/70">
          Pages from everyone feeling {m.label} right now. Read gently.
        </p>
      </header>

      <FeedList
        kind="mood"
        mood={mood}
        emptyHint={
          <>
            <p className="hand text-3xl text-clay">no one feels {m.label} right now</p>
            <p className="mt-2 text-ink-muted">Be the first voice in this room.</p>
          </>
        }
      />
    </div>
  );
}
