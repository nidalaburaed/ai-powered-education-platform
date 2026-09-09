import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface ChartData {
  type: "bar" | "line";
  labels: string[];
  values: number[];
  title?: string;
}

interface ChartPanelProps {
  data: ChartData;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, fps / 2.5], [0, 1], { extrapolateRight: "clamp" });
  const maxValue = Math.max(...data.values);
  const CHART_H = 180;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity,
        width: "70%",
        maxWidth: 640,
      }}
    >
      <div
        style={{
          background: "rgba(15,23,42,0.85)",
          border: "1.5px solid rgba(56,189,248,0.2)",
          borderRadius: 20,
          padding: "28px 32px",
          backdropFilter: "blur(12px)",
        }}
      >
        {data.title && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#38bdf8",
              fontFamily: "Inter, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {data.title}
          </div>
        )}

        {/* Bar chart */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            height: CHART_H,
            borderBottom: "1.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {data.values.map((val, i) => {
            const heightPct = maxValue > 0 ? val / maxValue : 0;
            const barHeight = interpolate(
              frame,
              [(i * fps) / 10, (i * fps) / 10 + fps / 2],
              [0, CHART_H * heightPct],
              { extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: 4,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: barHeight,
                    background: `linear-gradient(to top, #0ea5e9, #8b5cf6)`,
                    borderRadius: "6px 6px 0 0",
                    minHeight: 2,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 10,
          }}
        >
          {data.labels.map((label, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 11,
                color: "#64748b",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
