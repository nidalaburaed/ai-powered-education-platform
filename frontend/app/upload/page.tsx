"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadHomework, pollJobStatus, type JobStatus } from "@/lib/api";
import { JOB_STATUS_LABELS } from "@/lib/utils";
import DropZone from "@/components/DropZone";
import GeneratingAnimation from "@/components/GeneratingAnimation";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

type Phase = "idle" | "uploading" | "processing" | "done" | "failed";

export default function UploadPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/auth");
    });
  }, [router]);

  useEffect(() => {
    return () => {
      if (stopPolling) stopPolling();
    };
  }, [stopPolling]);

  const handleFile = useCallback(async (file: File) => {
    setPhase("uploading");
    try {
      const { job_id } = await uploadHomework(file);
      setPhase("processing");

      const stop = pollJobStatus(job_id, (status) => {
        setJobStatus(status);
        if (status.status === "done" && status.video_id) {
          setPhase("done");
          toast.success("Your podcast video is ready!");
          setTimeout(() => router.push(`/video/${status.video_id}`), 1500);
        } else if (status.status === "failed") {
          setPhase("failed");
          toast.error(status.error || "Generation failed. Please try again.");
        }
      });

      setStopPolling(() => stop);
    } catch (err: unknown) {
      setPhase("failed");
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }, [router]);

  const handleReset = () => {
    if (stopPolling) stopPolling();
    setPhase("idle");
    setJobStatus(null);
    setStopPolling(null);
  };

  const statusLabel = jobStatus ? JOB_STATUS_LABELS[jobStatus.status] ?? jobStatus.status : "";

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />

      {/* Warm ambient blob */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] opacity-10"
        style={{
          background: "radial-gradient(circle, #e8a838, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-2xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* Heading */}
        <div className="text-center mb-10">
          <div className="section-label mx-auto mb-5">New podcast</div>
          <h1
            className="text-4xl text-parchment-100 mb-3"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Drop your homework.
            <br />
            <em className="text-warm not-italic">We&apos;ll handle the rest.</em>
          </h1>
          <p className="text-parchment-500 text-base font-light max-w-sm mx-auto">
            Photo, scan, or PDF — any subject, any grade. Takes about 3 minutes.
          </p>
        </div>

        {/* ── Phase: idle / failed ── */}
        {(phase === "idle" || phase === "failed") && (
          <div>
            <DropZone onFile={handleFile} disabled={false} />
            {phase === "failed" && (
              <div className="mt-5 text-center">
                <button
                  onClick={handleReset}
                  className="text-gold-400 hover:text-gold-300 text-sm transition-colors underline underline-offset-2"
                >
                  Try again with a different file
                </button>
              </div>
            )}
            {phase === "idle" && (
              <p
                className="text-center text-parchment-600 text-xs mt-5"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                PDF · JPG · PNG · HEIC · WEBP — up to 50 MB
              </p>
            )}
          </div>
        )}

        {/* ── Phase: uploading ── */}
        {phase === "uploading" && (
          <div
            className="rounded-2xl p-14 text-center"
            style={{ background: "#1f1a14", border: "1px solid rgba(232,168,56,0.12)" }}
          >
            {/* Warm pulsing ring */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: "rgba(232,168,56,0.4)" }}
              />
              <div
                className="relative w-16 h-16 rounded-full border-2 border-gold-400 border-t-transparent animate-spin"
              />
            </div>
            <p
              className="text-parchment-200 text-lg"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              Uploading your homework...
            </p>
            <p className="text-parchment-600 text-sm mt-2 font-light">Almost there</p>
          </div>
        )}

        {/* ── Phase: processing / done ── */}
        {(phase === "processing" || phase === "done") && (
          <GeneratingAnimation
            status={statusLabel}
            progress={jobStatus?.progress ?? 0}
            isDone={phase === "done"}
          />
        )}
      </div>
    </div>
  );
}
