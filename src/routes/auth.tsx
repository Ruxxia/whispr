import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({ redirect: s.redirect as string | undefined }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: search.redirect ?? "/feed" });
  },
  component: AuthPage,
});

const STATIC_PARTICLES = [
  { left: 15, delay: 0.5, size: 3, duration: 7 },
  { left: 35, delay: 2.1, size: 4, duration: 9 },
  { left: 55, delay: 1.2, size: 2, duration: 6 },
  { left: 75, delay: 3.4, size: 5, duration: 8 },
  { left: 88, delay: 0.8, size: 3, duration: 7.5 },
  { left: 22, delay: 4.5, size: 4.5, duration: 10 },
  { left: 62, delay: 2.8, size: 2.5, duration: 8.5 },
  { left: 45, delay: 5.2, size: 3.5, duration: 9.5 },
];

function AuthPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("force_splash") === "true") {
        sessionStorage.removeItem("whispr_auth_splash_seen");
        return true;
      }
      const seen = sessionStorage.getItem("whispr_auth_splash_seen");
      return !seen;
    }
    return true;
  });
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("whispr_auth_splash_seen", "true");
    }
    setTimeout(() => {
      setShowSplash(false);
    }, 900); // matches the duration of the exit animation splash-slide-up (0.9s)
  };

  useEffect(() => {
    if (!showSplash || isExiting) return;
    const timer = setTimeout(() => {
      handleExit();
    }, 2800);
    return () => clearTimeout(timer);
  }, [showSplash, isExiting]);


  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin + "/feed",
            data: { username: username || undefined },
          },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email ✉️");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        nav({ to: search.redirect ?? "/feed" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/feed",
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-warm opacity-70" />
      <div aria-hidden className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-clay/15 blur-3xl" />
      <div aria-hidden className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sand/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-5 py-10">
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Brand side */}
          <div className="hidden flex-col justify-between md:flex">
            <a href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-clay text-paper hand text-xl">w</span>
              <span className="serif text-3xl">Whispr</span>
            </a>
            <div className="space-y-4">
              <p className="hand text-3xl text-clay">a quiet little place</p>
              <h1 className="text-5xl leading-[1.05]">Your feelings deserve a beautiful page.</h1>
              <p className="max-w-md text-ink-muted">
                Whispr is a calm, aesthetic diary for the moments too tender for social media.
                No likes. No noise. Just you, on paper.
              </p>
            </div>
            <p className="text-xs text-ink-muted">© Whispr — Share what you truly feel.</p>
          </div>

          {/* Form */}
          <div className="relative">
            <div className="rounded-3xl border border-border/60 bg-paper/80 p-7 paper-edge-lg backdrop-blur-xl sm:p-9">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl">{mode === "signup" ? "Begin your diary" : "Welcome back"}</h2>
                <button
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="text-xs text-clay underline-offset-4 hover:underline"
                >
                  {mode === "signup" ? "I have an account" : "Create one"}
                </button>
              </div>

              <button
                type="button"
                onClick={google}
                disabled={loading}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-4 py-3 text-sm font-medium transition hover:bg-paper-warm disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#EA4335" d="M12 10v3.6h5.1c-.2 1.3-1.6 3.8-5.1 3.8a5.4 5.4 0 1 1 0-10.8c1.7 0 2.8.7 3.5 1.3l2.4-2.3C16.4 4.2 14.4 3.3 12 3.3a8.7 8.7 0 1 0 0 17.4c5 0 8.4-3.5 8.4-8.5 0-.6-.1-1.1-.2-1.6H12z"/></svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
                <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <input
                    type="text" required minLength={3} value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-clay/30 transition focus:border-clay focus:ring-4"
                  />
                )}
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@diary.com"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-clay/30 transition focus:border-clay focus:ring-4"
                />
                <input
                  type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-clay/30 transition focus:border-clay focus:ring-4"
                />
                <button
                  type="submit" disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-clay px-4 py-3 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signup" ? "Open my diary" : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-ink-muted">
                By continuing you agree to be gentle with yourself.
              </p>
            </div>
          </div>
        </div>
      </div>
      {showSplash && (
        <div
          onClick={handleExit}
          className={`splash-overlay grain ${isExiting ? "splash-exit-slide" : ""}`}
        >
          <div className="splash-glow" />

          {STATIC_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="splash-particle"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}

          <div className="splash-logo-container">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-clay text-paper hand text-2xl shadow-lg select-none">
                w
              </span>
              <span className="serif text-4xl font-semibold tracking-wide select-none">Whispr</span>
            </div>
            <div className="splash-line" />
            <p className="hand text-2xl text-clay/90 splash-subheading select-none">
              a quiet little place
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExit();
            }}
            className="splash-skip-btn cursor-pointer font-sans"
          >
            Click to enter
          </button>
        </div>
      )}
    </div>
  );
}
