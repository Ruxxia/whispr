import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Home, PenLine, User as UserIcon, LogOut, Bookmark, Search, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { NotificationBell } from "./NotificationBell";

export function AppShell() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      .then(({ data }) => data?.username && setUsername(data.username));
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-gradient-sun" />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/feed" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-clay text-paper">
              <span className="hand text-lg leading-none">w</span>
            </span>
            <span className="serif text-2xl tracking-tight">Whispr</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/feed" icon={<Home className="h-4 w-4" />} label="Feed" />
            <NavLink to="/compose" icon={<PenLine className="h-4 w-4" />} label="Write" />
            <NavLink to="/search" icon={<Search className="h-4 w-4" />} label="Search" />
            <NavLink to="/bookmarks" icon={<Bookmark className="h-4 w-4" />} label="Saved" />
            <NavLink to="/market" icon={<Store className="h-4 w-4" />} label="Shop" />
            {username && (
              <NavLink to="/u/$username" params={{ username }} icon={<UserIcon className="h-4 w-4" />} label="You" />
            )}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={logout}
              className="rounded-full border border-border/70 bg-paper/70 p-2 text-ink-muted transition hover:bg-paper hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-5 pb-32 pt-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/70 bg-background/85 px-2 py-2 shadow-soft backdrop-blur-xl md:hidden">
        <NavLink to="/feed" icon={<Home className="h-5 w-5" />} compact />
        <NavLink to="/search" icon={<Search className="h-5 w-5" />} compact />
        <NavLink to="/compose" icon={<PenLine className="h-5 w-5" />} compact />
        <NavLink to="/bookmarks" icon={<Bookmark className="h-5 w-5" />} compact />
        <NavLink to="/market" icon={<Store className="h-5 w-5" />} compact />
        {username && <NavLink to="/u/$username" params={{ username }} icon={<UserIcon className="h-5 w-5" />} compact />}
      </nav>
    </div>
  );
}

function NavLink({
  to, params, icon, label, compact = false,
}: { to: string; params?: Record<string, string>; icon: React.ReactNode; label?: string; compact?: boolean }) {
  return (
    <Link
      to={to as never}
      params={params as never}
      activeProps={{ className: "bg-secondary text-foreground" }}
      activeOptions={{ exact: false }}
      className={`flex items-center gap-2 rounded-full px-${compact ? 3 : 4} py-2 text-sm text-ink-muted transition hover:text-foreground`}
    >
      {icon}
      {label && <span className="hidden md:inline">{label}</span>}
    </Link>
  );
}
