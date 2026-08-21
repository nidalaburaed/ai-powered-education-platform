"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getVideo, type Video, recordStudyDay, saveQuizScore } from "@/lib/api";
import { SUBJECT_COLORS } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import FlashCards from "@/components/FlashCards";
import Quiz from "@/components/Quiz";
import Notes from "@/components/Notes";
import AskAI from "@/components/AskAI";
import { ArrowLeft, FileText, Brain, Play, Layers, StickyNote, Bot } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type Tab = "video" | "flashcards" | "quiz" | "transcript" | "notes" | "ask";

export default function VideoPage() {
  const router  = useRouter();
  const params  = useParams();
  const videoId = params.id as string;

  const [video, setVideo]   = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState<Tab>("video");
  const [currentTime, setCurrentTime] = useState(0);
  const videoTimeRef = useRef(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      loadVideo();
    });
    recordStudyDay();
  }, [videoId, router]);

  const loadVideo = async () => {
    try {
      const data = await getVideo(videoId);
      setVideo(data);
    } catch {
      toast.error("Video not found");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Callback from VideoPlayer to track current time for Notes timestamps
  const handleTimeUpdate = (t: number) => {
    videoTimeRef.current = t;
    setCurrentTime(t);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background:"rgba(232,168,56,0.5)" }} />
          <div className="relative w-12 h-12 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!video) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:"video",      label:"Watch",                                         icon:<Play className="w-3.5 h-3.5"/>        },
    { id:"transcript", label:"Transcript",                                    icon:<FileText className="w-3.5 h-3.5"/>    },
    { id:"flashcards", label:`Flashcards (${video.flashcards?.length ?? 0})`, icon:<Layers className="w-3.5 h-3.5"/>     },
    { id:"quiz",       label:`Quiz (${video.quiz?.length ?? 0})`,             icon:<Brain className="w-3.5 h-3.5"/>      },
    { id:"notes",      label:"Notes",                                         icon:<StickyNote className="w-3.5 h-3.5"/> },
    { id:"ask",        label:"Ask AI",                                        icon:<Bot className="w-3.5 h-3.5"/>        },
  ];

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-parchment-600 hover:text-gold-400 text-sm mb-7 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to library
        </Link>

        {/* Title */}
        <div className="mb-7">
          <h1 className="text-3xl text-parchment-100 leading-snug mb-3" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
            {video.title}
          </h1>
          <div className="flex items-center gap-2.5">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${SUBJECT_COLORS[video.subject] ?? SUBJECT_COLORS["Other"]}`}>
              {video.subject}
            </span>
            {video.grade_level && (
              <span className="text-parchment-600 text-xs font-light italic">{video.grade_level}</span>
            )}
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="mb-7 overflow-x-auto">
          <div className="flex gap-1 p-1 rounded-xl w-fit min-w-full"
            style={{ background:"rgba(14,11,8,0.5)", border:"1px solid rgba(232,168,56,0.08)" }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`tab-warm whitespace-nowrap ${tab===t.id ? "active" : ""}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === "video" && (
          <VideoPlayer src={video.video_url} title={video.title} onTimeUpdate={handleTimeUpdate} />
        )}

        {tab === "transcript" && (
          <div className="rounded-2xl p-6 space-y-4 max-h-[600px] overflow-y-auto"
            style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.1)" }}>
            {video.transcript && video.transcript.length > 0 ? (
              video.transcript.map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg h-fit mt-0.5 whitespace-nowrap"
                    style={line.speaker==="HOST_ALEX"
                      ? { background:"rgba(232,168,56,0.12)", color:"#e8a838", fontFamily:'"JetBrains Mono",monospace' }
                      : { background:"rgba(126,168,126,0.12)", color:"#7ea87e", fontFamily:'"JetBrains Mono",monospace' }}>
                    {line.speaker==="HOST_ALEX" ? "Alex" : "Sam"}
                  </span>
                  <p className="text-parchment-300 text-sm leading-relaxed font-light">{line.text}</p>
                </div>
              ))
            ) : (
              <p className="text-parchment-600 text-sm italic text-center py-8">No transcript available.</p>
            )}
          </div>
        )}

        {tab === "flashcards" && (
          <FlashCards flashcards={video.flashcards ?? []} videoId={videoId} />
        )}

        {tab === "quiz" && (
          <Quiz
            questions={video.quiz ?? []}
            onComplete={(score, total) => {
              saveQuizScore({
                videoId,
                videoTitle: video.title,
                subject: video.subject,
                score,
                total,
                date: new Date().toISOString(),
              });
            }}
          />
        )}

        {tab === "notes" && (
          <Notes videoId={videoId} videoTitle={video.title} currentTime={currentTime} />
        )}

        {tab === "ask" && (
          <AskAI videoId={videoId} />
        )}
      </div>
    </div>
  );
}
