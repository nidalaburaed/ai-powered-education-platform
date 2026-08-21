import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { HomeworkPodcastProps } from "./types";
import { getCurrentLine } from "./utils/timing";
import { SpeakerWave } from "./components/SpeakerWave";
import { Subtitles } from "./components/Subtitles";
import { EquationPanel } from "./components/EquationPanel";
import { ChartPanel } from "./components/ChartPanel";
import { TextPanel } from "./components/TextPanel";
import { ProgressBar } from "./components/ProgressBar";

export const HomeworkPodcast: React.FC<HomeworkPodcastProps> = ({
  title,
  subject,
  grade_level,
  audio_url,
  lines,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeSec = frame / fps;
  const currentLine = getCurrentLine(lines, currentTimeSec);
  const audioSrc = audio_url?.startsWith("http://") || audio_url?.startsWith("https://")
    ? audio_url
    : audio_url
      ? staticFile(audio_url)
      : "";

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #030712 0%, #0f172a 60%, #0c0a1a 100%)",
        fontFamily: "Inter, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Audio track */}
      {audioSrc && (
        <Audio src={audioSrc} />
      )}

      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "60%",
          background:
            "radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top bar: subject + grade + title */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 48,
          right: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Logo mark */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "white",
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 600,
              }}
            >
              EduCast
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Educational Podcast
            </div>
          </div>
        </div>

        {/* Subject badge */}
        <div
          style={{
            background: "rgba(14,165,233,0.12)",
            border: "1px solid rgba(14,165,233,0.25)",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 11,
            fontWeight: 600,
            color: "#38bdf8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {subject} · {grade_level}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 48,
          right: 48,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
      </div>

      {/* Speaker indicators */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 48,
          display: "flex",
          gap: 12,
        }}
      >
        <SpeakerWave
          speaker="HOST_ALEX"
          isActive={currentLine?.speaker === "HOST_ALEX"}
        />
        <SpeakerWave
          speaker="HOST_SAM"
          isActive={currentLine?.speaker === "HOST_SAM"}
        />
      </div>

      {/* Main visual content area */}
      {currentLine?.visual_cue === "show_equation" && currentLine.equation && (
        <EquationPanel equation={currentLine.equation} />
      )}

      {currentLine?.visual_cue === "show_chart" && currentLine.chart_data && (
        <ChartPanel data={currentLine.chart_data} />
      )}

      {(currentLine?.visual_cue === "show_text" ||
        currentLine?.visual_cue === "show_list" ||
        !currentLine) && currentLine && (
        <TextPanel line={currentLine} />
      )}

      {/* Subtitles */}
      <Subtitles line={currentLine} />

      {/* Progress bar */}
      <ProgressBar />
    </AbsoluteFill>
  );
};
