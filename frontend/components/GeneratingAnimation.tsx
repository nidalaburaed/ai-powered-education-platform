"use client";

import { motion } from "framer-motion";

interface GeneratingAnimationProps {
  status: string;
  progress: number;
  isDone: boolean;
}

const PIPELINE_STEPS = [
  { key: "ocr",       label: "Reading your homework",    minProgress: 10,  maxProgress: 24  },
  { key: "scripting", label: "Writing podcast script",   minProgress: 25,  maxProgress: 44  },
  { key: "audio",     label: "Generating voices",        minProgress: 45,  maxProgress: 59  },
  { key: "video",     label: "Rendering video",          minProgress: 60,  maxProgress: 84  },
  { key: "uploading", label: "Uploading to library",     minProgress: 85,  maxProgress: 99  },
];

// Fixed heights for the waveform bars (avoids random values on re-render)
const BAR_HEIGHTS = [18, 38, 52, 44, 58, 32, 50, 40, 62, 28, 46, 36];

export default function GeneratingAnimation({ status, progress, isDone }: GeneratingAnimationProps) {
  return (
    <div
      className="rounded-3xl p-10 text-center"
      style={{ background: "#1f1a14", border: "1px solid rgba(232,168,56,0.12)" }}
    >
      {isDone ? (
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-5"
        >
          {/* Done checkmark */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(126,168,126,0.15)",
              border: "2px solid rgba(126,168,126,0.4)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M9 18l6 6 12-12" stroke="#7ea87e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p
              className="text-parchment-100 text-2xl"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              Your podcast is ready!
            </p>
            <p className="text-parchment-500 text-sm mt-2 font-light">Redirecting you now...</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Animated warm waveform */}
          <div className="flex items-end justify-center gap-1.5 h-16 mb-8">
            {BAR_HEIGHTS.map((h, i) => (
              <motion.div
                key={i}
                className="w-2 rounded-full"
                style={{
                  background: `linear-gradient(to top, #c4872c, #e8a838, #f5d080)`,
                }}
                animate={{ height: ["8px", `${h}px`, "8px"] }}
                transition={{
                  duration: 0.8 + i * 0.05,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Status label */}
          <div className="flex items-center justify-center gap-2.5 mb-7">
            {/* Warm spinning ring */}
            <div
              className="w-4 h-4 rounded-full border-2 border-gold-400 border-t-transparent animate-spin flex-shrink-0"
            />
            <p
              className="text-parchment-200 text-lg"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              {status}
            </p>
          </div>

          {/* Progress bar */}
          <div className="max-w-sm mx-auto mb-8">
            <div className="flex justify-between text-xs mb-2" style={{ color: "#7a6548" }}>
              <span>Progress</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{progress}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(232,168,56,0.1)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #c4872c, #e8a838, #f5d080)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps checklist */}
          <div className="space-y-2.5 max-w-xs mx-auto text-left">
            {PIPELINE_STEPS.map((step) => {
              const isComplete = progress >= step.maxProgress;
              const isCurrent  = progress >= step.minProgress && progress < step.maxProgress;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  {/* Status dot */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: isComplete
                        ? "rgba(126,168,126,0.15)"
                        : isCurrent
                        ? "rgba(232,168,56,0.15)"
                        : "rgba(232,168,56,0.05)",
                      border: isComplete
                        ? "1px solid rgba(126,168,126,0.3)"
                        : isCurrent
                        ? "1px solid rgba(232,168,56,0.3)"
                        : "1px solid rgba(232,168,56,0.08)",
                    }}
                  >
                    {isComplete ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#7ea87e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : isCurrent ? (
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#e8a838" }}
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 0.9 }}
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(232,168,56,0.15)" }} />
                    )}
                  </div>

                  <span
                    className="text-sm transition-colors duration-200"
                    style={{
                      color: isComplete ? "#5a4535" : isCurrent ? "#fdf6e3" : "#3d3020",
                      textDecoration: isComplete ? "line-through" : "none",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
