"use client";

import { motion } from "framer-motion";

/* Each feature has a hand-drawn SVG icon instead of a generic Lucide one */
const features = [
  {
    id: "dialogue",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 6a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H9l-4 3V6z" stroke="#e8a838" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 14v1a2 2 0 002 2h8l4 3V10a2 2 0 00-2-2h-2" stroke="#e8a838" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="3 2"/>
      </svg>
    ),
    title: "Two-voice dialogue",
    body: "Teacher + student back-and-forth. Concepts stick because you hear them argued, questioned, and explained — not just read aloud.",
    accent: "#e8a838",
    span: "lg:col-span-2",
    big: true,
  },
  {
    id: "visuals",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="3" width="22" height="16" rx="2" stroke="#c96442" strokeWidth="1.5"/>
        <path d="M3 19h22M10 24h8" stroke="#c96442" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 11l3-3 3 3 3-5" stroke="#c96442" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Synced visuals",
    body: "Equations and key points appear exactly when they're spoken. Not a slideshow — a real-time overlay.",
    accent: "#c96442",
    span: "",
    big: false,
  },
  {
    id: "flashcards",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="5" width="20" height="15" rx="2" stroke="#7ea87e" strokeWidth="1.5"/>
        <rect x="6" y="9" width="20" height="15" rx="2" stroke="#7ea87e" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M8 13h8M8 17h5" stroke="#7ea87e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Auto flashcards & quiz",
    body: "Every video generates a ready-to-study flashcard deck and a multiple-choice quiz. No manual work.",
    accent: "#7ea87e",
    span: "",
    big: false,
  },
  {
    id: "transcript",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 4h16a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#e8a838" strokeWidth="1.5"/>
        <path d="M9 10h10M9 14h10M9 18h6" stroke="#e8a838" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="10" r="1" fill="#e8a838"/>
        <circle cx="7" cy="14" r="1" fill="#e8a838"/>
        <circle cx="7" cy="18" r="1" fill="#e8a838"/>
      </svg>
    ),
    title: "Timestamped transcript",
    body: "Jump to any moment in the video directly from the transcript. Great for reviewing a specific concept.",
    accent: "#e8a838",
    span: "",
    big: false,
  },
  {
    id: "multilingual",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="#c96442" strokeWidth="1.5"/>
        <path d="M14 3C14 3 10 8 10 14s4 11 4 11" stroke="#c96442" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 3C14 3 18 8 18 14s-4 11-4 11" stroke="#c96442" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 14h22" stroke="#c96442" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 9h18M5 19h18" stroke="#c96442" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    title: "20+ languages",
    body: "Generate podcast videos in Spanish, French, Japanese, Arabic — wherever you're learning, it speaks your language.",
    accent: "#c96442",
    span: "",
    big: false,
  },
  {
    id: "download",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4v14M8 13l6 6 6-6" stroke="#7ea87e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 22h20" stroke="#7ea87e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Download & share",
    body: "Grab the MP4 or send a link to your study group. Yours to keep.",
    accent: "#7ea87e",
    span: "lg:col-span-2",
    big: true,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 px-6 relative">
      {/* Faint warm stripe */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(232,168,56,0.8) 48px)",
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Heading — right-aligned for variety */}
        <div className="mb-16 lg:text-right">
          <div className="section-label mb-6 lg:ml-auto lg:mr-0 inline-flex">What&apos;s inside every video</div>
          <h2
            className="text-4xl lg:text-5xl text-parchment-100 leading-tight"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Not just a video.{" "}
            <em className="text-warm not-italic">A whole study session.</em>
          </h2>
          <p className="text-parchment-500 text-lg mt-4 font-light lg:ml-auto max-w-md lg:mr-0 lg:text-right">
            Everything you need to actually understand the material — not just watch it.
          </p>
        </div>

        {/* Bento grid — asymmetric sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`paper-card p-6 flex flex-col gap-4 group cursor-default ${f.span} ${
                f.big ? "bento-highlight" : ""
              }`}
            >
              {/* Icon with warm hover ring */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  background: `${f.accent}10`,
                  border: `1px solid ${f.accent}20`,
                }}
              >
                {f.icon}
              </div>

              <div>
                <h3
                  className="text-parchment-100 text-lg mb-2 leading-snug"
                  style={f.big ? { fontFamily: '"DM Serif Display", Georgia, serif', fontSize: "1.35rem" } : {}}
                >
                  {f.title}
                </h3>
                <p className="text-parchment-500 text-sm leading-relaxed font-light">{f.body}</p>
              </div>

              {/* Subtle accent rule on hover */}
              <div
                className="h-[2px] w-0 group-hover:w-10 rounded-full transition-all duration-300 mt-auto"
                style={{ background: f.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
