import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface SpeakerWaveProps {
  speaker: "HOST_ALEX" | "HOST_SAM";
  isActive: boolean;
}

const SPEAKER_CONFIG = {
  HOST_ALEX: {
    name: "Alex",
    role: "Teacher",
    color: "#38bdf8", // sky-400
    bgColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.3)",
  },
  HOST_SAM: {
    name: "Sam",
    role: "Student",
    color: "#a78bfa", // violet-400
    bgColor: "rgba(167,139,250,0.12)",
    borderColor: "rgba(167,139,250,0.3)",
  },
};

export const SpeakerWave: React.FC<SpeakerWaveProps> = ({ speaker, isActive }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const config = SPEAKER_CONFIG[speaker];
  const BAR_COUNT = 7;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 16,
        background: isActive ? config.bgColor : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${isActive ? config.borderColor : "rgba(255,255,255,0.08)"}`,
        transition: "all 0.3s ease",
        minWidth: 140,
      }}
    >
      {/* Wave bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 24 }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const amplitude = isActive
            ? Math.abs(Math.sin((frame / (fps / 5) + i * 0.7) * 1.8)) * 16 + 4
            : 4;
          return (
            <div
              key={i}
              style={{
                width: 3,
                height: amplitude,
                background: isActive ? config.color : "rgba(255,255,255,0.2)",
                borderRadius: 2,
                transition: "height 0.05s ease",
              }}
            />
          );
        })}
      </div>

      {/* Name */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isActive ? config.color : "rgba(255,255,255,0.4)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {config.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {config.role}
        </div>
      </div>
    </div>
  );
};
