"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-stretch">
      {/* ── Left panel — decorative warm side ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1f1a14 0%, #2a2118 100%)" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 dot-grid opacity-40"
          style={{ maskImage: "radial-gradient(ellipse at 30% 50%, black 40%, transparent 80%)" }}
        />

        {/* Warm glow blobs */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #e8a838, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #c96442, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="#e8a838" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M10 16 Q16 10 22 16 Q16 22 10 16Z" fill="#e8a838" opacity="0.7" />
          </svg>
          <span
            className="text-parchment-100 text-xl"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            EduCast
          </span>
        </Link>

        {/* Centre quote */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="text-gold-400 text-5xl mb-6" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>&ldquo;</div>
          <blockquote
            className="text-parchment-200 text-2xl leading-snug mb-6"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Learning that sounds like a conversation always makes more sense than one that reads like a textbook.
          </blockquote>
          <p className="text-parchment-600 text-sm italic">— the idea behind EduCast</p>
        </div>

        {/* Steps hint */}
        <div className="relative z-10 space-y-3">
          {["Upload homework", "AI writes the script", "You get a podcast video"].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="step-num w-6 h-6 text-xs">{i + 1}</div>
              <span className="text-parchment-500 text-sm">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        {/* Paper texture feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(232,168,56,0.6) 32px)",
          }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="#e8a838" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M10 16 Q16 10 22 16 Q16 22 10 16Z" fill="#e8a838" opacity="0.7" />
            </svg>
            <span className="text-parchment-100 text-xl" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>EduCast</span>
          </Link>

          {/* Heading */}
          <h1
            className="text-3xl text-parchment-100 mb-2"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            {isSignUp ? "Join EduCast" : "Welcome back"}
          </h1>
          <p className="text-parchment-500 text-sm mb-8 font-light">
            {isSignUp
              ? "Create an account and start turning homework into podcasts."
              : "Sign in to pick up where you left off."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-parchment-400 text-sm font-medium mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-warm"
              />
            </div>

            <div>
              <label className="block text-parchment-400 text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="at least 8 characters"
                className="input-warm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ display: "flex" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-parchment-600 text-sm mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up — it's free"}
            </button>
          </p>

          {/* Back to landing */}
          <div className="text-center mt-8">
            <Link href="/" className="text-parchment-700 hover:text-parchment-500 text-xs transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
