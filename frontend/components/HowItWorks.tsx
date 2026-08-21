"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Drop your homework",
    body: "Snap a photo, upload a scan, or paste a PDF. Any subject — math, essays, chemistry problems, you name it. We're not picky.",
    detail: "Supported: PDF, JPG, PNG, HEIC",
    accent: "#e8a838",
    accentBg: "rgba(232,168,56,0.07)",
    side: "left",
  },
  {
    num: "02",
    title: "AI reads and thinks",
    body: "Claude pulls out every concept, equation, and tricky bit, then writes a natural two-person conversation — like two friends who actually know the subject.",
    detail: "Powered by Claude AI",
    accent: "#c96442",
    accentBg: "rgba(201,100,66,0.07)",
    side: "right",
  },
  {
    num: "03",
    title: "Real voices are recorded",
    body: "ElevenLabs brings the dialogue to life with two distinct voices — a patient teacher and a curious student. No robotic monotone. Real back-and-forth.",
    detail: "Powered by ElevenLabs",
    accent: "#7ea87e",
    accentBg: "rgba(126,168,126,0.07)",
    side: "left",
  },
  {
    num: "04",
    title: "A full video lands in your library",
    body: "Equations, key points, and subtitles appear on screen exactly when they're spoken. Plus: flashcards and a quiz auto-generated and ready to go.",
    detail: "MP4 · Flashcards · Quiz · Transcript",
    accent: "#e8a838",
    accentBg: "rgba(232,168,56,0.07)",
    side: "right",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading — off-center, slightly loose */}
        <div className="mb-20">
          <div className="section-label mb-6">The process</div>
          <h2
            className="text-4xl lg:text-5xl text-parchment-100 max-w-lg leading-tight"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Here&apos;s exactly{" "}
            <em className="text-warm not-italic">how it works</em>
          </h2>
          <p className="text-parchment-500 text-lg mt-4 max-w-md font-light">
            Four steps, roughly three minutes, zero guesswork.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical dashed connector line — desktop only */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{
              background: "repeating-linear-gradient(to bottom, rgba(232,168,56,0.25) 0px, rgba(232,168,56,0.25) 6px, transparent 6px, transparent 14px)",
            }}
          />

          <div className="space-y-16">
            {steps.map((step, i) => {
              const isLeft = step.side === "left";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center ${
                    !isLeft ? "lg:[&>*:first-child]:order-last" : ""
                  }`}
                >
                  {/* Card */}
                  <div
                    className="rounded-2xl p-7 relative overflow-hidden"
                    style={{
                      background: step.accentBg,
                      border: `1px solid ${step.accent}22`,
                    }}
                  >
                    {/* Step number — large background watermark */}
                    <div
                      className="absolute -top-3 -right-2 text-[7rem] font-bold leading-none select-none pointer-events-none opacity-[0.04]"
                      style={{
                        fontFamily: '"DM Serif Display", Georgia, serif',
                        color: step.accent,
                      }}
                    >
                      {step.num}
                    </div>

                    {/* Small numbered circle */}
                    <div
                      className="step-num mb-5"
                      style={{ borderColor: step.accent, color: step.accent, background: `${step.accent}12` }}
                    >
                      {i + 1}
                    </div>

                    <h3
                      className="text-parchment-100 text-2xl mb-3"
                      style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-parchment-500 text-sm leading-relaxed font-light mb-5">
                      {step.body}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-1.5"
                      style={{
                        color: step.accent,
                        background: `${step.accent}12`,
                        border: `1px solid ${step.accent}20`,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {step.detail}
                    </div>
                  </div>

                  {/* Centre dot on timeline line — desktop */}
                  <div className="hidden lg:flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        background: step.accent,
                        borderColor: "#16120e",
                        boxShadow: `0 0 0 4px ${step.accent}30`,
                      }}
                    />
                  </div>

                  {/* Empty opposite side placeholder for grid */}
                  <div className="hidden lg:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Outro nudge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-parchment-600 text-sm italic">
            That&apos;s genuinely it. No setup, no subscriptions required to start.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
