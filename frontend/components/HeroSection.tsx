"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

/* Decorative SVG elements */
function PlusIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <path d="M8 2v12M2 8h12" stroke="#e8a838" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CircleDot({ className = "" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <circle cx="6" cy="6" r="5" stroke="#c96442" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="6" cy="6" r="2" fill="#c96442" opacity="0.6" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center px-6 pt-28 pb-20">
      {/* Dot grid in top-right quadrant */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[480px] h-[480px] opacity-30 dot-grid"
        style={{ maskImage: "radial-gradient(circle at 80% 20%, black 30%, transparent 70%)" }}
      />

      {/* Floating decorative marks */}
      <PlusIcon className="absolute top-32 left-[12%] opacity-40 animate-float-slow" />
      <CircleDot className="absolute bottom-40 left-[8%] opacity-50 animate-float" />
      <PlusIcon className="absolute top-1/2 right-[6%] opacity-30 animate-float-slow" style={{ animationDelay: "2s" } as React.CSSProperties} />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

        {/* ── Left: Text ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section label / badge */}
          <div className="section-label mb-8">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#e8a838">
              <polygon points="5,0 6.5,3.5 10,3.8 7.5,6.3 8.2,10 5,8 1.8,10 2.5,6.3 0,3.8 3.5,3.5" />
            </svg>
            AI-powered learning, done differently
          </div>

          {/* Headline — serif display, left-aligned, with italic emphasis */}
          <h1
            className="text-5xl lg:text-6xl xl:text-[5.2rem] leading-[1.08] text-parchment-100 mb-8"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Your homework,{" "}
            <br className="hidden sm:block" />
            <em className="squiggle text-warm not-italic">explained</em>
            <br className="hidden sm:block" />
            like a podcast.
          </h1>

          {/* Body copy — casual, genuine */}
          <p className="text-parchment-500 text-lg leading-relaxed max-w-[420px] mb-10 font-light">
            Drop any assignment — math, history, chemistry, whatever.
            We write a two-host script, record the voices, and hand you
            a full podcast video with flashcards baked in.{" "}
            <span className="text-parchment-400 font-medium">Takes about 3 minutes.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link href="/auth" className="btn-gold">
              Upload homework free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="btn-ghost">
              <Play className="w-3.5 h-3.5 fill-current opacity-70" />
              See how it works
            </a>
          </div>

          {/* Social proof nudge */}
          <p className="text-parchment-600 text-sm flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-500" />
            No credit card &nbsp;·&nbsp; 3 free videos / month &nbsp;·&nbsp; Cancel anytime
          </p>
        </motion.div>

        {/* ── Right: Floating mockup card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block animate-float"
        >
          {/* Outer warm glow */}
          <div
            className="absolute inset-0 rounded-[28px] opacity-40"
            style={{
              background: "radial-gradient(ellipse at 50% 60%, rgba(232,168,56,0.35), transparent 65%)",
              filter: "blur(24px)",
              transform: "scale(1.08) translateY(12px)",
            }}
          />

          {/* The card itself */}
          <div
            className="relative rounded-[24px] overflow-hidden"
            style={{
              background: "#1f1a14",
              border: "1px solid rgba(232,168,56,0.18)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,168,56,0.08)",
            }}
          >
            {/* ── Video area ── */}
            <div className="aspect-video relative flex items-center justify-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, #16120e 0%, #1f1a14 50%, #16120e 100%)" }}
            >
              {/* Background subtle texture */}
              <div
                className="absolute inset-0 opacity-5 dot-grid"
                style={{ backgroundSize: "20px 20px" }}
              />

              {/* Wave speaker indicator — top left */}
              <div className="absolute left-5 top-5 flex items-center gap-3">
                <div className="flex items-end gap-[3px] h-7">
                  {[3, 5, 4, 7, 5, 6, 4, 5].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gold-400 rounded-full animate-wave wave-bar opacity-80"
                      style={{ height: `${h * 3.5}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <span
                  className="text-gold-400 text-xs font-medium tracking-wide"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Alex · Teacher
                </span>
              </div>

              {/* Centre formula card */}
              <div
                className="rounded-2xl px-7 py-4 text-center mx-6"
                style={{
                  background: "rgba(31,26,20,0.9)",
                  border: "1px solid rgba(232,168,56,0.18)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="text-parchment-600 text-[10px] uppercase tracking-widest mb-2 font-medium">
                  Quadratic Formula
                </div>
                <div
                  className="text-parchment-100 text-xl"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  x = (−b ± √(b²−4ac)) / 2a
                </div>
              </div>

              {/* Sage listener indicator — bottom right */}
              <div className="absolute right-5 bottom-8 flex items-center gap-2">
                <span
                  className="text-sage-400 text-xs font-medium tracking-wide"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Jamie · Student
                </span>
                <div className="flex items-end gap-[3px] h-5">
                  {[2, 3, 2, 4, 3].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-sage-500 rounded-full opacity-50"
                      style={{ height: `${h * 3}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-ink-700">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "38%",
                    background: "linear-gradient(90deg, #e8a838, #c96442)",
                  }}
                />
              </div>
            </div>

            {/* ── Below video: meta strip ── */}
            <div className="px-5 py-4 flex items-center justify-between gap-4 border-t border-parchment-700/10">
              <div>
                <div
                  className="text-parchment-200 text-sm font-semibold"
                >
                  Understanding Quadratic Equations
                </div>
                <div className="text-parchment-600 text-xs mt-0.5">
                  Mathematics · High School
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {[
                  { label: "Flashcards", color: "rgba(232,168,56,0.12)", textColor: "#e8a838" },
                  { label: "Quiz", color: "rgba(201,100,66,0.1)", textColor: "#c96442" },
                  { label: "Transcript", color: "rgba(126,168,126,0.1)", textColor: "#7ea87e" },
                ].map(({ label, color, textColor }) => (
                  <span
                    key={label}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: color, color: textColor }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Small floating sticker — top right of card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute -top-4 -right-4 rounded-2xl px-3 py-2 text-center"
            style={{
              background: "#e8a838",
              boxShadow: "0 4px 16px rgba(232,168,56,0.35)",
              transform: "rotate(10deg)",
            }}
          >
            <div className="text-ink-900 text-[10px] font-bold uppercase tracking-wide">Ready in</div>
            <div
              className="text-ink-900 text-lg font-bold leading-none"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              3 min
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
