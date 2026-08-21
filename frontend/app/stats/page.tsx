"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { listVideos, getQuizScores, getStudyStreak, getStudyDays, type Video, type QuizScore } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { BookOpen, Clock, Brain, Flame, ArrowLeft, Trophy } from "lucide-react";

function heatmapColor(count: number): string {
  if (count === 0) return "rgba(232,168,56,0.06)";
  if (count === 1) return "rgba(232,168,56,0.25)";
  if (count === 2) return "rgba(232,168,56,0.50)";
  return "rgba(232,168,56,0.80)";
}

function getLast52Weeks(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function StatsPage() {
  const router = useRouter();
  const [videos, setVideos]       = useState<Video[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [studyDays, setStudyDays]   = useState<string[]>([]);
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      listVideos().then(setVideos).finally(() => setLoading(false));
    });
    setQuizScores(getQuizScores());
    setStudyDays(getStudyDays());
    setStreak(getStudyStreak());
  }, [router]);

  const totalSeconds  = videos.reduce((acc, v) => acc + (v.duration_seconds ?? 0), 0);
  const avgQuizScore  = quizScores.length
    ? Math.round((quizScores.reduce((a, s) => a + s.score / s.total, 0) / quizScores.length) * 100)
    : null;

  // Subject breakdown
  const subjectMap = videos.reduce<Record<string, number>>((acc, v) => {
    acc[v.subject] = (acc[v.subject] ?? 0) + 1;
    return acc;
  }, {});
  const subjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);
  const maxCount = subjects[0]?.[1] ?? 1;

  // Heatmap: days studied from studyDays set
  const studySet = new Set(studyDays);
  const heatDays = getLast52Weeks();
  // Group into weeks of 7
  const weeks: string[][] = [];
  for (let i = 0; i < heatDays.length; i += 7) {
    weeks.push(heatDays.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-parchment-600 hover:text-gold-400 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to library
        </Link>

        <div className="mb-10">
          <div className="section-label mb-4">Learning stats</div>
          <h1 className="text-4xl text-parchment-100" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
            Your progress, <em className="text-warm not-italic">at a glance</em>
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background:"#1f1a14" }} />
            ))}
          </div>
        ) : (
          <>
            {/* ── Top stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon:<BookOpen className="w-5 h-5"/>, label:"Videos watched", value: videos.length, accent:"#e8a838" },
                { icon:<Clock className="w-5 h-5"/>,    label:"Watch time",      value: formatDuration(totalSeconds), accent:"#c96442" },
                { icon:<Flame className="w-5 h-5"/>,    label:"Study streak",    value: `${streak} day${streak!==1?"s":""}`, accent:"#f5a623" },
                { icon:<Brain className="w-5 h-5"/>,    label:"Avg quiz score",  value: avgQuizScore !== null ? `${avgQuizScore}%` : "—", accent:"#7ea87e" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-5" style={{ background:"#1f1a14", border:`1px solid ${s.accent}18` }}>
                  <div className="mb-3" style={{ color:s.accent }}>{s.icon}</div>
                  <div className="text-2xl font-bold mb-1" style={{ fontFamily:'"DM Serif Display",Georgia,serif', color:s.accent }}>{s.value}</div>
                  <div className="text-parchment-600 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Study heatmap ── */}
            <div className="rounded-2xl p-6 mb-8" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.1)" }}>
              <h2 className="text-parchment-200 font-medium mb-4 text-sm">Study activity — last 52 weeks</h2>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <div key={day} title={day}
                        className="w-3 h-3 rounded-sm transition-colors"
                        style={{ background: heatmapColor(studySet.has(day) ? 1 : 0) }} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-parchment-700 text-xs">
                <span>Less</span>
                {[0,1,2,3].map(n => (
                  <div key={n} className="w-3 h-3 rounded-sm" style={{ background: heatmapColor(n) }} />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── Subject breakdown ── */}
              <div className="rounded-2xl p-6" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.1)" }}>
                <h2 className="text-parchment-200 font-medium mb-5 text-sm">Videos by subject</h2>
                {subjects.length === 0 ? (
                  <p className="text-parchment-600 text-sm italic">No videos yet.</p>
                ) : (
                  <div className="space-y-3">
                    {subjects.map(([subj, count]) => (
                      <div key={subj}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-parchment-400">{subj}</span>
                          <span className="text-parchment-600" style={{ fontFamily:'"JetBrains Mono",monospace' }}>{count}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(232,168,56,0.08)" }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width:`${(count/maxCount)*100}%`, background:"linear-gradient(90deg,#c4872c,#e8a838)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Recent quiz scores ── */}
              <div className="rounded-2xl p-6" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.1)" }}>
                <h2 className="text-parchment-200 font-medium mb-5 text-sm">Recent quiz results</h2>
                {quizScores.length === 0 ? (
                  <p className="text-parchment-600 text-sm italic">Complete a quiz to see results here.</p>
                ) : (
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {quizScores.slice(0, 20).map((s, i) => {
                      const pct = Math.round((s.score / s.total) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{
                              background: pct>=80 ? "rgba(126,168,126,0.12)" : pct>=60 ? "rgba(232,168,56,0.12)" : "rgba(201,100,66,0.12)",
                              color:      pct>=80 ? "#7ea87e"                 : pct>=60 ? "#e8a838"                 : "#c96442",
                              fontFamily: '"JetBrains Mono",monospace',
                            }}>
                            {pct}%
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-parchment-300 text-xs truncate">{s.videoTitle}</p>
                            <p className="text-parchment-700 text-xs">{s.score}/{s.total} · {new Date(s.date).toLocaleDateString()}</p>
                          </div>
                          <Trophy className="w-3.5 h-3.5 shrink-0" style={{ color: pct===100 ? "#e8a838" : "#3d3020" }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
