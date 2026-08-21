"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, LogOut, Upload, Menu, X, BarChart2, Layers, Settings } from "lucide-react";

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState<{ email?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isLanding = pathname === "/";
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-ink-900/90 backdrop-blur-xl border-b border-parchment-700/10 py-3" : "bg-transparent py-5"
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="transition-transform duration-300 group-hover:rotate-12">
              <circle cx="16" cy="16" r="13" stroke="#e8a838" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M10 16 Q16 10 22 16 Q16 22 10 16Z" fill="#e8a838" opacity="0.7" />
            </svg>
          </div>
          <span className="text-parchment-100 text-xl leading-none" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
            EduCast
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard"
                className={`nav-link flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${isActive("/dashboard") ? "text-parchment-100 bg-gold-400/8" : ""}`}>
                <LayoutDashboard className="w-3.5 h-3.5" /> Library
              </Link>
              <Link href="/subjects"
                className={`nav-link flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${isActive("/subjects") ? "text-parchment-100 bg-gold-400/8" : ""}`}>
                <Layers className="w-3.5 h-3.5" /> Subjects
              </Link>
              <Link href="/stats"
                className={`nav-link flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${isActive("/stats") ? "text-parchment-100 bg-gold-400/8" : ""}`}>
                <BarChart2 className="w-3.5 h-3.5" /> Stats
              </Link>
              <div className="w-px h-4 mx-1 bg-parchment-700/30" />
              <Link href="/upload" className="btn-gold text-sm py-2.5 px-5">
                <Upload className="w-3.5 h-3.5" /> Upload
              </Link>
              <Link href="/settings"
                className={`nav-link p-2 rounded-lg transition-colors ml-1 ${isActive("/settings") ? "text-parchment-100" : ""}`}
                title="Settings">
                <Settings className="w-4 h-4" />
              </Link>
              <button onClick={handleSignOut} className="nav-link flex items-center gap-1.5 px-3 py-2 rounded-lg" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {isLanding && (
                <>
                  <a href="#how-it-works" className="nav-link px-3 py-2">How it works</a>
                  <a href="#pricing" className="nav-link px-3 py-2">Pricing</a>
                </>
              )}
              <Link href="/auth" className="nav-link px-3 py-2">Sign in</Link>
              <Link href="/auth" className="btn-gold text-sm py-2.5 px-5">Try for free</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-parchment-400 hover:text-parchment-100 transition-colors p-1"
          onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink-800/98 backdrop-blur-xl border-t border-parchment-700/10 px-6 py-5 space-y-2">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Library
              </Link>
              <Link href="/subjects" className="flex items-center gap-2 text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <Layers className="w-4 h-4" /> Subjects
              </Link>
              <Link href="/stats" className="flex items-center gap-2 text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <BarChart2 className="w-4 h-4" /> Stats
              </Link>
              <Link href="/upload" className="flex items-center gap-2 text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <Upload className="w-4 h-4" /> Upload homework
              </Link>
              <Link href="/settings" className="flex items-center gap-2 text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 text-parchment-400 hover:text-parchment-100 py-2 text-sm w-full text-left transition-colors">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              {isLanding && (
                <>
                  <a href="#how-it-works" className="block text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>How it works</a>
                  <a href="#pricing" className="block text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>Pricing</a>
                </>
              )}
              <Link href="/auth" className="block text-parchment-400 hover:text-parchment-100 py-2 text-sm transition-colors" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/auth" className="inline-block btn-gold text-sm mt-2" onClick={() => setMenuOpen(false)}>Try for free →</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
