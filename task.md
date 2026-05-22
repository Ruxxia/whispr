# Whispr — Development Roadmap

A cozy, aesthetic diary platform where Gen-Z shares honest feelings on customizable paper.

**Stack:** TanStack Start (React 19, TypeScript), Tailwind v4, shadcn/ui, ble Cloud (Supabase).

---

## ✅ Phase 1 — MVP Foundation (Current build)

### Backend
- [x] ble Cloud enabled (auth, Postgres, RLS)
- [x] `profiles` table with auto-create trigger on signup
- [x] `posts` table (title, content, mood, paper style/color/texture, font, rotation, anonymous, visibility)
- [x] `post_stickers` table (drag-and-drop position, scale, rotation, z-index)
- [x] `reactions` table (relate / strong / support) with unique constraint
- [x] `follows` table (mutual relationships)
- [x] `bookmarks` table
- [x] RLS policies for every table (only authors can mutate; visibility-aware reads)
- [x] Security: search_path locked, SECURITY DEFINER execute revoked
- [x] Mood + paper-style + visibility enums

### Auth
- [x] Email/password sign-up + sign-in (email verification on by default)
- [x] Google OAuth via ble broker
- [x] Auth guard via `_authenticated` layout route
- [x] Session restored across reloads

### UI / UX
- [x] Warm Sand design system (oklch tokens, Cormorant + Karla + Caveat)
- [x] 9 paper textures (CSS-driven): HVS, notebook, dotted, vintage, sticky, crumpled, torn, perforated, scrapbook
- [x] 10 paper colors, 3 font families, rotation slider, decorative tape
- [x] Landing page: hero with floating papers, features, moods, paper showcase, marketplace teaser, testimonials, CTA
- [x] Auth page (sign-up / sign-in, Google)
- [x] App shell with top nav + mobile bottom nav
- [x] Feed: mood filter, reactions, bookmarks
- [x] Compose: live preview, paper picker, color, font, mood, anonymous, private, tilt
- [x] Profile page with follow, bio editor, page count
- [x] Bookmarks page

### Quality
- [x] Responsive (mobile bottom nav, sticky compose sidebar on desktop)
- [x] SEO meta + OG tags
- [x] Toast notifications (sonner)

---

## ✅ Phase 2 — Customization

- [x] Image upload to posts (ble Cloud storage bucket `post-images`)
- [x] Sticker system: 30-sticker registry across 3 packs, drag-to-place, resize, rotate, remove, z-index
- [x] Custom background image upload per post (`post-backgrounds`)
- [x] Three new paper textures: parchment, linen, graph
- [x] Draft autosave to localStorage with "draft restored" chip
- [x] Accent color customization on profile
- [x] Avatar upload (`avatars` bucket)
- [x] Edit profile dialog (display name, bio, avatar, accent)
- [x] Hydration-stable date formatter


## ✅ Phase 3 — Social Expansion

- [x] Realtime feed (Supabase Realtime channel + "new whispers" pill)
- [x] Notifications table + bell icon + drawer (auto-created via triggers)
- [x] Following tab on feed
- [x] Mood channels (`/mood/$mood`)
- [x] "Tonight" tab (last 12h)
- [x] Infinite scroll with keyset pagination
- [x] Search: usernames + content (Postgres ilike)

## ✅ Phase 4 — Marketplace (free tier)

- [x] `marketplace_items` + `user_library` tables, RLS, `claim_free_item` RPC
- [x] Storefront UI (`/market`) with featured row and kind filters
- [x] Item detail page (`/market/$slug`) with payload preview
- [x] User library (`/library`) with equip/unequip toggle
- [x] Seasonal collections (e.g. Autumn 2026 drop) seeded
- [x] Equipping a profile theme mirrors accent color onto profile
- [ ] Stripe checkout — deferred to a follow-up pass
- [ ] Creator dashboard (upload, royalty stats) — deferred

## ✅ Phase 5 — Advanced Experience (AI deferred)

- [ ] ble AI: emotional insight summary — deferred (intentionally skipped this pass)
- [x] Time-capsule posts (`publish_at`, hidden by RLS until release)
- [x] Music attachment (Spotify embed on the page, link in composer)
- [x] Streak + page-count gamification with gentle badges on profile
- [x] Public profile themes (delivered via Phase 4 marketplace, equipping a theme syncs accent)
- [x] Export diary as PDF (print-ready window from own profile)
- [x] Subtle paper animations (`ink-rise`, ambient grain, hover lift)

---

## Technical milestones

- [x] TanStack file-based routing + auth-guarded layout
- [x] Auth attacher middleware wired in start.ts (default)
- [x] Single design-token source (`src/styles.css`)
- [ ] Server functions for ranked feeds
- [ ] Realtime presence on "tonight" channel
- [ ] Image pipeline (resize + WebP at upload)

## Deployment

- [x] Preview on ble
- [ ] Publish to production
- [ ] Custom domain (whispr.app)
- [ ] OG share image
- [x] PWA manifest + icons

---

> "Share what you truly feel. Your emotions deserve a safe space."
