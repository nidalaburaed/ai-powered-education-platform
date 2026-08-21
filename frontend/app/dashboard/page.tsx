"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { listVideos, deleteVideo, type Video, recordStudyDay } from "@/lib/api";
import { formatDuration, formatDate, SUBJECT_COLORS } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { Play, Trash2, Upload, BookOpen, Clock, Layers, Search, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const ALL_SUBJECTS = [
  "Mathematics","Physics","Chemistry","Biology","History",
  "Geography","Economics","Computer Science","Philosophy","Language","Other",
];

type SortKey = "newest" | "oldest" | "subject" | "duration";

export default function DashboardPage() {
  const router = useRouter();
  const [videos, setVideos]         = useState<Video[]>([]);
  const [loading, setLoading]       = useState(true);
  const [userName, setUserName]     = useState("");
  const [query, setQuery]           = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [sort, setSort]             = useState<SortKey>("newest");
  const [sortOpen, setSortOpen]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      setUserName(data.session.user.email?.split("@")[0] ?? "Student");
      fetchVideos();
    });
    recordStudyDay();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const data = await listVideos();
      setVideos(data);
    } catch {
      toast.error("Failed to load your videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this podcast video?")) return;
    try {
      await deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success("Video deleted");
    } catch { toast.error("Failed to delete video"); }
  };

  // Derived subjects from actual videos
  const presentSubjects = useMemo(
    () => [...new Set(videos.map((v) => v.subject))].sort(),
    [videos]
  );

  const filtered = useMemo(() => {
    let list = [...videos];
    if (activeSubject) list = list.filter((v) => v.subject === activeSubject);
    if (query.trim())  list = list.filter((v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.subject.toLowerCase().includes(query.toLowerCase())
    );
    switch (sort) {
      case "oldest":   list.sort((a,b) => a.created_at.localeCompare(b.created_at)); break;
      case "subject":  list.sort((a,b) => a.subject.localeCompare(b.subject)); break;
      case "duration": list.sort((a,b) => (b.duration_seconds ?? 0) - (a.duration_seconds ?? 0)); break;
      default:         list.sort((a,b) => b.created_at.localeCompare(a.created_at));
    }
    return list;
  }, [videos, activeSubject, query, sort]);

  const totalSeconds  = videos.reduce((acc, v) => acc + (v.duration_seconds ?? 0), 0);
  const subjectCount  = new Set(videos.map((v) => v.subject)).size;

  const SORT_LABELS: Record<SortKey, string> = {
    newest:"Newest first", oldest:"Oldest first", subject:"By subject", duration:"Longest first",
  };

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-parchment-600 text-sm font-light mb-1 italic">Your library</p>
            <h1 className="text-4xl text-parchment-100 leading-tight" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
              Morning, <em className="text-warm not-italic">{userName}</em> ✦
            </h1>
          </div>
          <Link href="/upload" className="btn-gold flex-shrink-0">
            <Upload className="w-4 h-4" /> New podcast
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { value: videos.length, label: "Podcast videos",   icon: <BookOpen className="w-4 h-4"/>, accent:"#e8a838" },
            { value: formatDuration(totalSeconds), label:"Total watch time", icon:<Clock className="w-4 h-4"/>, accent:"#c96442" },
            { value: subjectCount, label:"Subjects covered",   icon:<Layers className="w-4 h-4"/>, accent:"#7ea87e" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background:"#1f1a14", border:`1px solid ${stat.accent}18` }}>
              <div className="text-3xl mb-3 font-bold" style={{ fontFamily:'"DM Serif Display",Georgia,serif', color:stat.accent }}>{stat.value}</div>
              <div className="text-sm flex items-center gap-1.5" style={{ color:`${stat.accent}99` }}>{stat.icon}{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search + Filter + Sort ── */}
        <div className="mb-7 space-y-3">
          {/* Search row */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-600 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos..."
                className="input-warm pl-9 pr-9"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-600 hover:text-parchment-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-parchment-500 hover:text-parchment-300 text-sm transition-colors px-3 py-2.5 rounded-xl"
                style={{ background:"rgba(232,168,56,0.05)", border:"1px solid rgba(232,168,56,0.12)" }}
              >
                {SORT_LABELS[sort]}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden min-w-[160px]"
                  style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.15)", boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                    <button key={k} onClick={() => { setSort(k); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                      style={{ color: sort===k ? "#e8a838" : "#a89070", background: sort===k ? "rgba(232,168,56,0.08)":"transparent" }}>
                      {SORT_LABELS[k]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject chips */}
          {presentSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveSubject(null)}
                className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
                style={{
                  background: !activeSubject ? "rgba(232,168,56,0.15)" : "rgba(232,168,56,0.05)",
                  border:`1px solid ${!activeSubject ? "rgba(232,168,56,0.35)" : "rgba(232,168,56,0.1)"}`,
                  color: !activeSubject ? "#e8a838" : "#7a6548",
                }}
              >
                All
              </button>
              {presentSubjects.map((s) => (
                <button key={s} onClick={() => setActiveSubject(activeSubject===s ? null : s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
                  style={{
                    background: activeSubject===s ? "rgba(232,168,56,0.15)" : "rgba(232,168,56,0.05)",
                    border:`1px solid ${activeSubject===s ? "rgba(232,168,56,0.35)" : "rgba(232,168,56,0.1)"}`,
                    color: activeSubject===s ? "#e8a838" : "#7a6548",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ornament-divider mb-8">
          <span className="text-xs text-parchment-700 tracking-widest uppercase">
            {filtered.length} episode{filtered.length !== 1 ? "s" : ""}
            {(query || activeSubject) ? " found" : ""}
          </span>
        </div>

        {/* ── Video grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-2xl h-56 animate-pulse" style={{ background:"#1f1a14" }} />
            ))}
          </div>
        ) : filtered.length === 0 && videos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-[20px]"
              style={{ background:"rgba(232,168,56,0.08)", border:"1px dashed rgba(232,168,56,0.25)" }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M6 10a3 3 0 013-3h18a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V10z" stroke="#e8a838" strokeWidth="1.5"/>
                <path d="M13 18l5-5 5 5" stroke="#e8a838" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 13v10" stroke="#e8a838" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-2xl text-parchment-200 mb-2" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>Nothing here yet</h3>
            <p className="text-parchment-500 text-sm mb-8 font-light max-w-xs mx-auto">Upload your first homework and we&apos;ll turn it into a full podcast video.</p>
            <Link href="/upload" className="btn-gold"><Upload className="w-4 h-4" /> Upload homework</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-parchment-500 text-sm italic">No videos match your search.</p>
            <button onClick={() => { setQuery(""); setActiveSubject(null); }} className="text-gold-400 hover:text-gold-300 text-sm mt-3 transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((video) => (
              <Link key={video.id} href={`/video/${video.id}`}>
                <div className="rounded-2xl overflow-hidden group cursor-pointer transition-all duration-200 hover:-translate-y-1"
                  style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.1)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 12px 32px rgba(232,168,56,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow="none"; }}>
                  {/* Thumbnail */}
                  <div className="relative h-40 flex items-center justify-center"
                    style={{ background:"linear-gradient(135deg,rgba(232,168,56,0.08),rgba(201,100,66,0.06))" }}>
                    <div className="absolute inset-0 dot-grid opacity-20" style={{ backgroundSize:"18px 18px" }} />
                    <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 relative z-10"
                      style={{ background:"rgba(232,168,56,0.15)", border:"1px solid rgba(232,168,56,0.25)" }}>
                      <Play className="w-6 h-6 text-gold-400 ml-0.5" />
                    </div>
                    {video.duration_seconds && (
                      <span className="absolute bottom-2.5 right-2.5 text-xs px-2 py-0.5 rounded-lg"
                        style={{ background:"rgba(14,11,8,0.8)", color:"#a89070", fontFamily:'"JetBrains Mono",monospace' }}>
                        {formatDuration(video.duration_seconds)}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-parchment-200 text-sm font-medium leading-snug line-clamp-2 flex-1">{video.title}</h3>
                      <button onClick={(e) => handleDelete(video.id, e)} className="shrink-0 text-parchment-700 hover:text-clay-400 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${SUBJECT_COLORS[video.subject] ?? SUBJECT_COLORS["Other"]}`}>
                        {video.subject}
                      </span>
                      <span className="text-parchment-700 text-xs">{formatDate(video.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
