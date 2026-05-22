import { createFileRoute, Link } from "@tanstack/react-router";
import { PaperPost } from "@/components/diary/PaperPost";
import { MOODS } from "@/lib/moods";
import { PAPER_STYLES } from "@/lib/papers";
import { ArrowRight, Sparkles, Heart, Shield, Feather } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Whispr — Your feelings, on beautiful paper" },
      { name: "description", content: "A calm, aesthetic diary platform where Gen-Z journals honest feelings on customizable paper. No likes. No noise. Just you, on the page." },
      { property: "og:title", content: "Whispr — A safe place for your feelings" },
      { property: "og:description", content: "Share honest feelings on beautiful diary papers. Cozy, intimate, premium." },
    ],
  }),
  component: Landing,
});

const SAMPLE_POSTS = [
  {
    id: "s1", title: "11:47 pm", content: "Some days I just want to be a softer person. Tonight is one of those nights. Tea, lamplight, and the sound of rain on the window — that's enough.",
    mood: "healing" as const, paper_style: "notebook" as const, paper_color: "#fbf9f3",
    font_family: "serif", rotation: -1.5, is_anonymous: false,
    created_at: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    author: { username: "moonbeam", display_name: "Aiko", avatar_url: null },
  },
  {
    id: "s2", title: null, content: "i cried in the shower again and somehow felt lighter after.\nmaybe that's healing too.",
    mood: "lonely" as const, paper_style: "sticky" as const, paper_color: "#fff4a3",
    font_family: "hand", rotation: 2.2, is_anonymous: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    author: null,
  },
  {
    id: "s3", title: "grateful, mostly", content: "Got the smallest job offer today. It doesn't pay much. But someone believed in me, and after this year, that's everything.",
    mood: "grateful" as const, paper_style: "vintage" as const, paper_color: "#f0e6d2",
    font_family: "serif", rotation: -0.8, is_anonymous: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    author: { username: "sunday.kid", display_name: "Theo", avatar_url: null },
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-warm opacity-80" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-clay/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-[60vh] h-[28rem] w-[28rem] rounded-full bg-sand/30 blur-3xl" />

      <Nav />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="ink-rise">
            <p className="hand text-3xl text-clay">a quiet little place</p>
            <h1 className="mt-3 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] tracking-tight">
              Your feelings,<br />
              <span className="italic text-clay">on beautiful paper.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-muted">
              Whispr is a cozy, aesthetic diary for the moments too tender for social media.
              No likes. No noise. Just you, on the page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="group inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-medium text-paper transition hover:opacity-90">
                Begin your diary
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#feed" className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/70 px-6 py-3 text-sm font-medium backdrop-blur-sm transition hover:bg-paper">
                Read tonight's whispers
              </a>
            </div>
            <p className="mt-6 text-xs text-ink-muted">Free forever · Anonymous mode · End your day soft</p>
          </div>

          {/* stacked papers */}
          <div className="relative h-[520px]">
            <FloatingPaper className="absolute right-4 top-0 w-[88%]" rot={-3} delay={0}>
              <PaperPost post={SAMPLE_POSTS[0]} interactive={false} />
            </FloatingPaper>
            <FloatingPaper className="absolute left-0 top-44 w-[70%]" rot={2.5} delay={1}>
              <PaperPost post={SAMPLE_POSTS[1]} interactive={false} compact />
            </FloatingPaper>
            <FloatingPaper className="absolute right-2 bottom-0 w-[78%]" rot={-1.5} delay={2}>
              <PaperPost post={SAMPLE_POSTS[2]} interactive={false} compact />
            </FloatingPaper>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative mx-auto mt-32 max-w-3xl px-5 text-center">
        <p className="serif text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.25] text-foreground/90">
          “Not everything needs to be perfect.<br />Some pages are just for breathing.”
        </p>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto mt-32 max-w-6xl px-5">
        <SectionHead kicker="why whispr" title="A diary that feels like a hug." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Shield className="h-5 w-5" />} title="Emotionally safe" desc="No public like counts. No vanity metrics. Reactions are gentle — 'I relate', 'Stay strong', 'Sending support'." />
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Customizable paper" desc="HVS, notebook, vintage, sticky notes and more. Pick the texture, colour and font that matches your mood." />
          <Feature icon={<Feather className="h-5 w-5" />} title="Anonymous mode" desc="Some thoughts need to leave your chest without leaving your name behind. We hold them carefully." />
          <Feature icon={<Heart className="h-5 w-5" />} title="Mood channels" desc="Find people feeling what you're feeling. Lonely. Hopeful. Healing. Everything is welcome here." />
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Sticker scrapbook" desc="Drag, tilt, layer. Make every page yours — like a real journal you'd never throw away." />
          <Feature icon={<Feather className="h-5 w-5" />} title="Built for calm" desc="No notifications screaming. No infinite scroll bait. Just soft pages, when you want them." />
        </div>
      </section>

      {/* MOODS */}
      <section className="relative mx-auto mt-32 max-w-5xl px-5 text-center">
        <SectionHead kicker="moods" title="However you feel — there's a page for it." />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {MOODS.map((m) => (
            <span key={m.key} className="rounded-full border border-border px-5 py-2.5 text-sm" style={{ background: m.color }}>
              {m.emoji} {m.label}
            </span>
          ))}
        </div>
      </section>

      {/* PAPERS */}
      <section className="relative mx-auto mt-32 max-w-6xl px-5">
        <SectionHead kicker="paper styles" title="Nine textures. Endless tilts. One you." />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PAPER_STYLES.map((p, i) => (
            <div
              key={p.key}
              className={`relative h-40 overflow-hidden rounded-2xl border border-border paper-edge ${p.className}`}
              style={{ ["--paper-color" as never]: p.defaultColor, backgroundColor: p.defaultColor, transform: `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)` }}
            >
              <span className="absolute bottom-3 left-3 hand text-xl text-ink/70">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="relative mx-auto mt-32 max-w-6xl px-5">
        <SectionHead kicker="coming soon" title="A marketplace for collectors of feeling." />
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-muted">
          Premium themes, seasonal sticker packs and paper styles by indie artists. Your diary, your aesthetic.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { name: "Midnight Brew", tag: "Theme pack", color: "linear-gradient(135deg, #2d2d44, #1a1a2e)" },
            { name: "Kawaii Soft", tag: "Sticker pack", color: "linear-gradient(135deg, #ffe5ec, #ffc2d1)" },
            { name: "Vintage Garden", tag: "Paper pack", color: "linear-gradient(135deg, #e8dfc7, #c9b99a)" },
          ].map((t) => (
            <div key={t.name} className="group overflow-hidden rounded-3xl border border-border paper-edge">
              <div className="aspect-[5/3]" style={{ background: t.color }} />
              <div className="flex items-center justify-between bg-paper p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">{t.tag}</p>
                  <p className="serif text-xl">{t.name}</p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs">Soon</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative mx-auto mt-32 max-w-5xl px-5">
        <SectionHead kicker="quiet words" title="From the people already journaling here." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { q: "First app in years that didn't make me feel worse after opening it.", a: "@softmoth" },
            { q: "Wrote three pages last night. Slept like I haven't in months.", a: "@river.k" },
            { q: "It's like Tumblr and a journal had a really cozy baby.", a: "@kindling" },
          ].map((t) => (
            <blockquote key={t.a} className="rounded-3xl border border-border bg-paper/70 p-6 paper-edge">
              <p className="serif text-lg leading-relaxed">"{t.q}"</p>
              <footer className="mt-4 text-xs text-ink-muted">{t.a}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto mt-32 max-w-3xl px-5 text-center">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-paper p-12 paper-edge-lg sm:p-16">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sand/40 blur-3xl" />
          <p className="hand text-3xl text-clay">your turn</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Share what you truly feel.</h2>
          <p className="mx-auto mt-4 max-w-md text-ink-muted">
            Begin your diary in under a minute. Whispr is free, forever.
          </p>
          <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3.5 text-sm font-medium text-paper transition hover:opacity-90">
            Open my first page <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pb-10 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-clay text-paper hand text-sm">w</span>
          <span>Whispr © {new Date().getFullYear()}</span>
        </div>
        <p>Made with quiet love.</p>
      </footer>
    </div>
  );
}

function Nav() {
  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-clay text-paper hand text-lg">w</span>
          <span className="serif text-2xl">Whispr</span>
        </a>
        <Link to="/auth" className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background transition hover:opacity-90">
          Open Whispr
        </Link>
      </div>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <p className="hand text-2xl text-clay">{kicker}</p>
      <h2 className="mt-1 text-[clamp(2rem,4vw,3rem)] leading-tight">{title}</h2>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-3xl border border-border bg-paper/70 p-6 transition hover:-translate-y-0.5 hover:bg-paper paper-edge">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-secondary text-clay">{icon}</div>
      <h3 className="text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </div>
  );
}

function FloatingPaper({
  children, className, rot, delay,
}: { children: React.ReactNode; className?: string; rot: number; delay: number }) {
  return (
    <div
      className={`float-soft ${className}`}
      style={{ ["--r" as never]: `${rot}deg`, animationDelay: `${delay}s`, transform: `rotate(${rot}deg)` }}
    >
      {children}
    </div>
  );
}
