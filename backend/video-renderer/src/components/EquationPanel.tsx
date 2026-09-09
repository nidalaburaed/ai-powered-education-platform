import React from "react";
import katex from "katex";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface EquationPanelProps {
  equation: string;
  title?: string;
}

export const EquationPanel: React.FC<EquationPanelProps> = ({ equation, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, fps / 2.5], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, fps / 2.5], [20, 0], { extrapolateRight: "clamp" });

  let html = equation;
  try {
    // Try rendering as LaTeX
    const cleanEq = equation.replace(/^\$\$?/, "").replace(/\$\$?$/, "");
    html = katex.renderToString(cleanEq, {
      throwOnError: false,
      output: "html",
      displayMode: true,
    });
  } catch {
    // Fallback: render as plain text
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, calc(-50% + ${translateY}px))`,
        opacity,
        textAlign: "center",
        maxWidth: 700,
        width: "80%",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 12,
            color: "rgba(56,189,248,0.8)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          background: "rgba(15,23,42,0.85)",
          border: "1.5px solid rgba(56,189,248,0.2)",
          borderRadius: 20,
          padding: "32px 40px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 60px rgba(56,189,248,0.08)",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            color: "#f1f5f9",
            fontSize: 28,
            fontFamily: equation === html ? "monospace" : undefined,
            lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  );
};
