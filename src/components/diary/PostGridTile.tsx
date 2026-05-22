import { PAPER_BY_KEY, FONT_OPTIONS, type FontKey } from "@/lib/papers";
import { MOOD_BY_KEY } from "@/lib/moods";
import { cn } from "@/lib/utils";
import type { PaperPostData } from "./PaperPost";
import { formatDate } from "@/lib/format";

export function PostGridTile({ post, onOpen }: { post: PaperPostData; onOpen?: () => void }) {
  const paper = PAPER_BY_KEY[post.paper_style] ?? PAPER_BY_KEY.hvs;
  const fontFamily =
    FONT_OPTIONS.find((f) => f.key === (post.font_family as FontKey))?.family ?? "var(--font-serif)";
  const mood = post.mood ? MOOD_BY_KEY[post.mood] : null;

  return (
    <button
      onClick={onOpen}
      className="group relative block w-full text-left ink-rise"
      style={{ transform: `rotate(${post.rotation * 0.4}deg)` }}
    >
      <div
        className={cn(
          "relative isolate flex aspect-square flex-col overflow-hidden rounded-2xl paper-edge grain p-4 transition group-hover:-translate-y-0.5 group-hover:shadow-paper-lg",
          paper.className,
        )}
        style={
          {
            ["--paper-color" as never]: post.paper_color,
            backgroundColor: post.paper_color,
          } as React.CSSProperties
        }
      >
        {post.background_image && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${post.background_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.45,
              mixBlendMode: "multiply",
              zIndex: 0,
            }}
          />
        )}
        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="absolute inset-0 -z-0 h-full w-full object-cover opacity-80"
          />
        )}

        <div className="relative z-[2] flex items-center justify-between text-[10px] text-ink-muted" style={{ fontFamily: "var(--font-sans)" }}>
          <span className="truncate">
            {post.is_anonymous ? "anonymous" : post.author ? `@${post.author.username}` : ""}
          </span>
          {mood && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px]"
              style={{ background: mood.color }}
              title={mood.label}
            >
              {mood.emoji}
            </span>
          )}
        </div>

        {post.title && (
          <h4
            className="relative z-[2] mt-2 line-clamp-2 text-lg leading-snug"
            style={{ fontFamily }}
          >
            {post.title}
          </h4>
        )}

        <p
          className="relative z-[2] mt-2 line-clamp-5 flex-1 text-sm leading-snug text-foreground/80"
          style={{ fontFamily }}
        >
          {post.content}
        </p>

        <span className="relative z-[2] mt-2 text-[10px] text-ink-muted" style={{ fontFamily: "var(--font-sans)" }}>
          {formatDate(post.created_at)}
        </span>
      </div>
    </button>
  );
}
