"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { listVideos, type Video } from "@/lib/api";
import { formatDuration, formatDate, SUBJECT_COLORS } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { Play, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Decorative subject icons
const SUBJECT_ICONS: Record<string, string> = {
  Mathematics:       "∑",
  Physics:           "⚛",
  Chemistry:         "⚗",
  Biology:           "🧬",
  History:           "📜",
  Geography:         "🌍",
  Economics:         "📈",
  "Computer Science":"💻",
  Philosophy:        "🤔",
  Language:          "💬",
  Other:             "✦",
};

const SUBJECT_ACCENTS: Record<string, string> = {
  Mathematics:       "#e8a838",
  Physics:           "#c96442",
  Chemistry:         "#7ea87e",
  Biology:           "#7ea87e",
  History:           "#e8a838",
  Geography:         "#7ea87e",
  Economics:         "#c96442",
  "Computer Science":"#e8a838",
  Philosophy:        "#c96442",
  Language:          "#7ea87e",
  Other:             "#a89070",
};

export default function SubjectsPage() {
  const router = useRouter();
  const [videos, setVideos]   = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      listVideos().then(setVideos).catch(() => toast.error("Failed to load videos")).finally(() => setLoading(false));
    });
  }, [router]);

  const grouped = useMemo(() => {
    const map: Record<string, Video[]> = {};
    for (const v of videos) {
      (map[v.subject] ??= []).push(v);
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [videos]);

  const displayed = active ? grouped.filter(([s]) => s === active) : grouped;

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-parchment-600 hover:text-gold-400 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to library
        </Link>

        <div className="mb-10">
          <div className="section-label mb-4">Browse</div>
          <h1 className="text-4xl text-parchment-100 mb-2" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
            Your <em className="text-warm not-italic">subjects</em>
          </h1>
          <p className="text-parchment-500 text-base font-light">All your podcast videos, organised by subject.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[1,2,3,4].map(i => <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background:"#1f1a14" }} />)}
          </div>
        ) : (
          <>
            {/* Subject chips / selector */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={() => setActive(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-150"
                style={{
                  background: !active ? "rgba(232,168,56,0.15)" : "rgba(232,168,56,0.05)",
                  border:`1px solid ${!active ? "rgba(232,168,56,0.4)" : "rgba(232,168,56,0.1)"}`,
                  color: !active ? "#e8a838" : "#7a6548",
                }}>
                All subjects
                <span className="text-xs rounded-full px-1.5 py-0.5" style={{ background:"rgba(232,168,56,0.15)", color:"#e8a838" }}>
                  {videos.length}
                </span>
              </button>
              {grouped.map(([subj, vids]) => {
                const accent = SUBJECT_ACCENTS[subj] ?? "#a89070";
                const isActive = active === subj;
                return (
                  <button key={subj} onClick={() => setActive(isActive ? null : subj)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-150"
                    style={{
                      background: isActive ? `${accent}18` : "rgba(232,168,56,0.04)",
                      border:`1px solid ${isActive ? `${accent}40` : "rgba(232,168,56,0.1)"}`,
                      color: isActive ? accent : "#7a6548",
                    }}>
                    <span>{SUBJECT_ICONS[subj] ?? "✦"}</span>
                    {subj}
                    <span className="text-xs rounded-full px-1.5 py-0.5" style={{ background:`${accent}15`, color:accent }}>
                      {vids.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subject sections */}
            {displayed.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-parchment-500 text-sm italic">No videos yet. Upload some homework first!</p>
                <Link href="/upload" className="btn-gold mt-6 inline-flex">Upload homework</Link>
              </div>
            ) : (
              <div className="space-y-14">
                {displayed.map(([subj, vids]) => {
                  const accent = SUBJECT_ACCENTS[subj] ?? "#a89070";
                  return (
                    <div key={subj}>
                      {/* Section header */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ background:`${accent}12`, border:`1px solid ${accent}20` }}>
                          {SUBJECT_ICONS[subj] ?? "✦"}
                        </div>
                        <div>
                          <h2 className="text-parchment-100 text-xl" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>{subj}</h2>
                          <p className="text-parchment-600 text-xs">{vids.length} episode{vids.length!==1?"s":""}</p>
                        </div>
                        <div className="flex-1 h-px ml-2" style={{ background:`linear-gradient(to right,${accent}20,transparent)` }} />
                      </div>

                      {/* Video cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vids.map((video) => (
                          <Link key={video.id} href={`/video/${video.id}`}>
                            <div className="rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 hover:-translate-y-1"
                              style={{ background:"#1f1a14", border:`1px solid ${accent}15` }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 24px ${accent}15`; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow="none"; }}>
                              <div className="relative h-28 flex items-center justify-center"
                                style={{ background:`linear-gradient(135deg,${accent}08,${accent}04)` }}>
                                <div className="absolute inset-0 dot-grid opacity-15" style={{ backgroundSize:"16px 16px" }} />
                                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 relative z-10"
                                  style={{ background:`${accent}18`, border:`1px solid ${accent}30` }}>
                                  <Play className="w-4 h-4 ml-0.5" style={{ color:accent }} />
                                </div>
                                {video.duration_seconds && (
                                  <span className="absolute bottom-2 right-2 text-xs px-1.5 py-0.5 rounded"
                                    style={{ background:"rgba(14,11,8,0.8)", color:"#a89070", fontFamily:'"JetBrains Mono",monospace' }}>
                                    {formatDuration(video.duration_seconds)}
                                  </span>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="text-parchment-200 text-xs font-medium line-clamp-2 leading-snug mb-1.5">{video.title}</p>
                                <p className="text-parchment-700 text-xs">{formatDate(video.created_at)}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
