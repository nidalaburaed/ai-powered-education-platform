import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ScriptLine } from "../types";

interface TextPanelProps {
  line: ScriptLine;
}

export const TextPanel: React.FC<TextPanelProps> = ({ line }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, fps / 3], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, fps / 3], [0.95, 1], { extrapolateRight: "clamp" });

  if (line.visual_cue === "show_list" && line.bullet_points && line.bullet_points.length > 0) {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          width: "70%",
          maxWidth: 680,
        }}
      >
        <div
          style={{
            background: "rgba(15,23,42,0.85)",
            border: "1.5px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "32px 36px",
            backdropFilter: "blur(12px)",
          }}
        >
          {line.bullet_points.map((point, i) => {
            const bulletOpacity = interpolate(frame, [(i * fps) / 7.5, (i * fps) / 7.5 + fps / 3.75], [0, 1], {
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: i < line.bullet_points!.length - 1 ? 16 : 0,
                  opacity: bulletOpacity,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #38bdf8, #8b5cf6)",
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: 20,
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {point}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: decorative background visual with gradient
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: opacity * 0.6,
        background:
          "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
  );
};
