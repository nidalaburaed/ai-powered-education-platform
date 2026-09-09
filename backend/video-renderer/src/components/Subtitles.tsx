import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ScriptLine } from "../types";

interface SubtitlesProps {
  line: ScriptLine | null;
}

const SPEAKER_COLORS: Record<string, string> = {
  HOST_ALEX: "#38bdf8",
  HOST_SAM: "#a78bfa",
};

export const Subtitles: React.FC<SubtitlesProps> = ({ line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!line) return null;

  const opacity = interpolate(frame, [0, fps / 3.75], [0, 1], { extrapolateRight: "clamp" });
  const color = SPEAKER_COLORS[line.speaker] ?? "#ffffff";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 80,
        right: 80,
        opacity,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          borderRadius: 12,
          padding: "10px 20px",
          maxWidth: 800,
        }}
      >
        <span
          style={{
            color,
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            marginRight: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {line.speaker === "HOST_ALEX" ? "Alex" : "Sam"}:
        </span>
        <span
          style={{
            color: "#f1f5f9",
            fontSize: 17,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          {line.text}
        </span>
      </div>
    </div>
  );
};
