import { Link } from "@tanstack/react-router";
import { PAPER_BY_KEY, type PaperStyle, FONT_OPTIONS, type FontKey } from "@/lib/papers";
import { MOOD_BY_KEY, REACTIONS, type Mood, type ReactionKind } from "@/lib/moods";
import { cn } from "@/lib/utils";
import { Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { spotifyEmbedUrl } from "@/lib/spotify";
import { StickerLayer, type PlacedSticker } from "./StickerLayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export interface PaperPostData {
  id: string;
  title?: string | null;
  content: string;
  mood?: Mood | null;
  paper_style: PaperStyle;
  paper_color: string;
  font_family: string;
  rotation: number;
  is_anonymous: boolean;
  image_url?: string | null;
  background_image?: string | null;
  publish_at?: string | null;
  spotify_url?: string | null;
  stickers?: PlacedSticker[];
  created_at: string;
  author: { username: string; display_name: string | null; avatar_url: string | null } | null;
  my_reactions?: ReactionKind[];
  is_bookmarked?: boolean;
}

export function PaperPost({
  post,
  interactive = true,
  onReact,
  onBookmark,
  compact = false,
  truncate = false,
  onOpen,
  canDelete = false,
  onDelete,
}: {
  post: PaperPostData;
  interactive?: boolean;
  onReact?: (k: ReactionKind) => void;
  onBookmark?: () => void;
  compact?: boolean;
  truncate?: boolean;
  onOpen?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
}) {

  const paper = PAPER_BY_KEY[post.paper_style] ?? PAPER_BY_KEY.hvs;
  const fontFamily =
    FONT_OPTIONS.find((f) => f.key === (post.font_family as FontKey))?.family ?? "var(--font-serif)";
  const mood = post.mood ? MOOD_BY_KEY[post.mood] : null;
  const dateStr = formatDate(post.created_at);

  return (
    <article className="ink-rise" style={{ transform: `rotate(${post.rotation}deg)` }}>
      <div
        onClick={onOpen}
        className={cn(
          "relative isolate overflow-hidden rounded-2xl paper-edge grain",
          paper.className,
          onOpen && "cursor-pointer transition hover:-translate-y-0.5",
        )}
        style={
          {
            ["--paper-color" as never]: post.paper_color,
            backgroundColor: post.paper_color,
            padding: compact ? "1.25rem 1.5rem" : "2rem 2.25rem 1.75rem",
          } as React.CSSProperties
        }
      >

        {/* background image layer */}
        {post.background_image && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${post.background_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.55,
              mixBlendMode: "multiply",
              zIndex: 0,
            }}
          />
        )}

        {/* decorative tape */}
        <span className="tape" style={{ top: -10, left: "12%", width: 70, height: 22, transform: "rotate(-6deg)", zIndex: 6 }} />

        {/* header */}
        <div className="relative z-[2] mb-4 flex items-center justify-between gap-3" style={{ fontFamily: "var(--font-sans)" }}>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            {post.is_anonymous ? (
              <span className="hand text-base text-clay">anonymous</span>
            ) : post.author ? (
              <Link
                to="/u/$username"
                params={{ username: post.author.username }}
                className="flex items-center gap-2 hover:text-foreground"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-warm text-[11px] font-semibold text-clay">
                  {(post.author.display_name ?? post.author.username).slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium text-foreground">@{post.author.username}</span>
              </Link>
            ) : null}
            <span className="opacity-60">· {dateStr}</span>
          </div>
          <div className="flex items-center gap-2">
            {mood && (
              <span
                className="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide"
                style={{ background: mood.color }}
              >
                {mood.emoji} {mood.label}
              </span>
            )}
            {canDelete && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full p-1.5 text-ink-muted transition hover:bg-paper-warm hover:text-foreground"
                  aria-label="Post options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onSelect={() => onDelete()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {post.title && (
          <h3 className="relative z-[2] mb-3 text-2xl leading-tight" style={{ fontFamily }}>
            {post.title}
          </h3>
        )}

        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="relative z-[2] mb-4 max-h-80 w-full rounded-md object-cover paper-edge"
          />
        )}

        <div className="relative">
          <p
            className={cn(
              "relative z-[2] whitespace-pre-wrap text-[1.05rem] leading-[1.7] text-foreground/90",
              truncate && "line-clamp-6",
            )}
            style={{ fontFamily }}
          >
            {post.content}
          </p>
          {truncate && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
              className="relative z-[2] mt-2 text-xs font-medium text-clay underline-offset-2 hover:underline"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Read more
            </button>
          )}
        </div>

        {/* spotify embed */}
        {(() => {
          const embed = spotifyEmbedUrl(post.spotify_url);
          if (!embed) return null;
          return (
            <div className="relative z-[2] mt-4 overflow-hidden rounded-xl paper-edge" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={embed}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
                title="Spotify"
                style={{ border: 0 }}
              />
            </div>
          );
        })()}

        {/* time-capsule indicator (only the author can ever see this, since RLS hides it from others) */}
        {post.publish_at && new Date(post.publish_at) > new Date() && (
          <div className="relative z-[2] mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-clay/50 bg-paper/70 px-3 py-1 text-[11px] text-clay" style={{ fontFamily: "var(--font-sans)" }}>
            <span>⏳</span>
            <span>Sealed until {formatDate(post.publish_at)}</span>
          </div>
        )}

        {/* stickers layer (read-only) */}
        {post.stickers && post.stickers.length > 0 && (
          <StickerLayer stickers={post.stickers} />
        )}



        {/* footer reactions */}
        {interactive && (
          <div className="relative z-[2] mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4" style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex flex-wrap gap-2">
              {REACTIONS.map((r) => {
                const active = post.my_reactions?.includes(r.key);
                return (
                  <button
                    key={r.key}
                    onClick={(e) => { e.stopPropagation(); onReact?.(r.key); }}
                    className={cn(
                      "group rounded-full border border-foreground/15 bg-paper/60 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-paper",
                      active && "border-clay/60 bg-paper text-clay",
                    )}
                  >
                    <span className="mr-1">{r.emoji}</span>{r.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark?.(); }}
              className={cn(
                "rounded-full border border-foreground/15 bg-paper/60 p-2 transition hover:bg-paper",
                post.is_bookmarked && "border-clay/60 bg-paper text-clay",
              )}
              aria-label="Bookmark"
            >
              <Bookmark className="h-4 w-4" fill={post.is_bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
