"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Save, LogOut, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code:"en", label:"English" },
  { code:"es", label:"Español" },
  { code:"fr", label:"Français" },
  { code:"de", label:"Deutsch" },
  { code:"ja", label:"日本語" },
  { code:"zh", label:"中文" },
  { code:"ar", label:"العربية" },
  { code:"pt", label:"Português" },
  { code:"ko", label:"한국어" },
  { code:"it", label:"Italiano" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage]   = useState("en");
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      const user = data.session.user;
      setEmail(user.email ?? "");
      const meta = user.user_metadata ?? {};
      setDisplayName(meta.display_name ?? user.email?.split("@")[0] ?? "");
      setLanguage(meta.preferred_language ?? "en");
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName, preferred_language: language },
      });
      if (error) throw error;
      toast.success("Settings saved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-parchment-600 hover:text-gold-400 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to library
        </Link>

        <div className="mb-10">
          <div className="section-label mb-4">Account</div>
          <h1 className="text-4xl text-parchment-100" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
            Settings
          </h1>
        </div>

        {loading ? (
          <div className="rounded-2xl h-64 animate-pulse" style={{ background:"#1f1a14" }} />
        ) : (
          <div className="space-y-5">

            {/* Profile card */}
            <div className="rounded-2xl p-6" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.12)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(232,168,56,0.1)", border:"1px solid rgba(232,168,56,0.2)" }}>
                  <User className="w-4 h-4 text-gold-400" />
                </div>
                <h2 className="text-parchment-200 font-medium">Profile</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-parchment-400 text-sm font-medium mb-1.5">Email</label>
                  <input value={email} disabled className="input-warm opacity-50 cursor-not-allowed" />
                  <p className="text-parchment-700 text-xs mt-1">Your email cannot be changed here.</p>
                </div>

                <div>
                  <label className="block text-parchment-400 text-sm font-medium mb-1.5">Display name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we greet you?"
                    className="input-warm"
                  />
                </div>
              </div>
            </div>

            {/* Preferences card */}
            <div className="rounded-2xl p-6" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.12)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(126,168,126,0.1)", border:"1px solid rgba(126,168,126,0.2)" }}>
                  <span className="text-sage-400 text-sm">🌐</span>
                </div>
                <h2 className="text-parchment-200 font-medium">Preferences</h2>
              </div>

              <div>
                <label className="block text-parchment-400 text-sm font-medium mb-1.5">Podcast language</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-warm appearance-none pr-8 cursor-pointer"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-parchment-600">▾</div>
                </div>
                <p className="text-parchment-700 text-xs mt-1.5">
                  Future podcast videos will be generated in this language.
                </p>
              </div>
            </div>

            {/* Data card */}
            <div className="rounded-2xl p-6" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.12)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(201,100,66,0.1)", border:"1px solid rgba(201,100,66,0.2)" }}>
                  <span className="text-clay-400 text-sm">🗂</span>
                </div>
                <h2 className="text-parchment-200 font-medium">Local data</h2>
              </div>
              <p className="text-parchment-500 text-sm font-light mb-4">
                Notes, flashcard progress, and quiz scores are stored in your browser. Clear them here if needed.
              </p>
              <button
                onClick={() => {
                  if (!confirm("Clear all local notes, flashcard progress, and quiz scores? This cannot be undone.")) return;
                  Object.keys(localStorage).filter(k => k.startsWith("notes_") || k.startsWith("flashcards_") || k === "quiz_scores" || k === "study_days").forEach(k => localStorage.removeItem(k));
                  toast.success("Local data cleared");
                }}
                className="text-clay-400 hover:text-clay-300 text-sm transition-colors border border-clay-500/20 px-4 py-2 rounded-xl hover:border-clay-500/40"
              >
                Clear local data
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-gold flex-1 justify-center disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed" style={{ display:"flex" }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </button>
              <button onClick={handleSignOut} className="btn-ghost flex items-center gap-2 text-sm">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
