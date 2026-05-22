# Whispr

**Your feelings, on beautiful paper.**

Whispr is a calm, aesthetic diary platform built for honest self-expression. Share your thoughts on customizable paper with stickers, moods, and music — all in a cozy, intimate space without the noise of traditional social media.

## Features

- **Beautiful Paper Posts** — Write on textured papers with custom fonts, colors, and rotations.
- **Stickers & Decorations** — Drag-and-drop curated sticker packs to decorate your pages.
- **Moods & Reactions** — Tag posts with gentle moods and reactions (no public like counts).
- **Bookmarks** — Save posts that resonate with you.
- **Time Capsules** — Schedule posts to be published at a future date.
- **Music Integration** — Embed Spotify tracks, albums, and playlists directly into your posts.
- **Marketplace** — Browse and claim free sticker packs, paper themes, and profile themes.
- **Library** — Manage your owned items and equip themes to customize your experience.
- **Writing Streaks** — Track your journaling habits with gentle badges and stats.
- **PDF Export** — Export your diary as a beautiful PDF for offline keepsakes.
- **PWA Support** — Install Whispr as a standalone app on mobile and desktop.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React + SSR)
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase Cloud (PostgreSQL, Auth, Realtime)
- **Fonts:** Cormorant Garamond, Karla, Caveat
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev
```

## Project Structure

```
src/
  components/     # UI components (diary, profile, app shell)
  hooks/          # Custom React hooks (auth, notifications, mobile)
  integrations/   # Supabase client
  lib/            # Utilities (papers, moods, stickers, marketplace, stats)
  routes/         # TanStack file-based routes
  styles.css      # Global styles + design tokens
public/           # Static assets (icons, manifest)
supabase/         # Migrations and config
```

## License

MIT
