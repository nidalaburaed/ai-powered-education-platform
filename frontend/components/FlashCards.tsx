"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Flashcard } from "@/lib/api";
import { getFlashcardProgress, saveFlashcardProgress, clearFlashcardProgress } from "@/lib/api";

interface FlashCardsProps {
  flashcards: Flashcard[];
  videoId?: string;
}

export default function FlashCards({ flashcards, videoId }: FlashCardsProps) {
  const [index, setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown]   = useState<Set<number>>(new Set());
  const [learning, setLearning] = useState<Set<number>>(new Set());
  const [done, setDone]     = useState(false);

  // Load saved progress
  useEffect(() => {
    if (!videoId) return;
    const p = getFlashcardProgress(videoId);
    setKnown(new Set(p.known));
    setLearning(new Set(p.learning));
  }, [videoId]);

  const persist = (k: Set<number>, l: Set<number>) => {
    if (videoId) saveFlashcardProgress(videoId, { known:[...k], learning:[...l] });
  };

  if (flashcards.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.1)" }}>
        <p className="text-parchment-600 italic text-sm">No flashcards available for this video.</p>
      </div>
    );
  }

  const card = flashcards[index];
  const studied = known.size + learning.size;

  // Summary screen
  if (done) {
    const pct = Math.round((known.size / flashcards.length) * 100);
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.15)" }}>
        <div className="text-5xl mb-5">{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📖"}</div>
        <h3 className="text-2xl text-parchment-100 mb-2" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
          Round complete!
        </h3>
        <p className="text-parchment-500 text-sm mb-8 font-light">
          You knew <strong className="text-gold-400">{known.size}</strong> of {flashcards.length} cards.
          {learning.size > 0 && ` ${learning.size} still to review.`}
        </p>

        {/* Score bar */}
        <div className="max-w-xs mx-auto mb-8">
          <div className="h-3 rounded-full overflow-hidden" style={{ background:"rgba(232,168,56,0.1)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${pct}%`, background:"linear-gradient(90deg,#c4872c,#e8a838,#f5d080)" }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5 text-parchment-600">
            <span>{known.size} known</span><span>{learning.size} learning</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={() => {
            setIndex(0); setFlipped(false); setDone(false);
            const newK = new Set<number>(); const newL = new Set<number>();
            setKnown(newK); setLearning(newL); persist(newK, newL);
          }} className="btn-ghost text-sm py-2.5 px-5">
            <RotateCcw className="w-3.5 h-3.5" /> Start over
          </button>
          {learning.size > 0 && (
            <button onClick={() => {
              // Only study "learning" cards again
              const learningArr = [...learning];
              const firstLearning = flashcards.findIndex((_, i) => learningArr.includes(i));
              setIndex(firstLearning >= 0 ? firstLearning : 0);
              setFlipped(false); setDone(false);
            }} className="btn-gold text-sm py-2.5 px-5">
              Review {learning.size} remaining
            </button>
          )}
        </div>
      </div>
    );
  }

  const goNext = () => {
    setFlipped(false);
    if (index < flashcards.length - 1) {
      setTimeout(() => setIndex(index + 1), 150);
    } else {
      setDone(true);
    }
  };

  const markKnown = () => {
    const k = new Set(known).add(index);
    const l = new Set(learning);
    l.delete(index);
    setKnown(k); setLearning(l); persist(k, l);
    goNext();
  };

  const markLearning = () => {
    const l = new Set(learning).add(index);
    const k = new Set(known);
    k.delete(index);
    setKnown(k); setLearning(l); persist(k, l);
    goNext();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Progress bar */}
      <div className="w-full max-w-xl">
        <div className="flex justify-between text-xs text-parchment-600 mb-1.5">
          <span>{studied} / {flashcards.length} studied</span>
          <span style={{ fontFamily:'"JetBrains Mono",monospace' }}>Card {index+1} of {flashcards.length}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(232,168,56,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width:`${(studied/flashcards.length)*100}%`, background:"linear-gradient(90deg,#c4872c,#e8a838)" }} />
        </div>
        {/* Known/Learning legend */}
        <div className="flex gap-4 mt-1.5 text-xs text-parchment-700">
          <span style={{ color:"#7ea87e" }}>✓ {known.size} known</span>
          <span style={{ color:"#c96442" }}>↻ {learning.size} learning</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl cursor-pointer" style={{ perspective:"1000px" }}
        onClick={() => setFlipped(!flipped)}>
        <motion.div
          style={{ transformStyle:"preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration:0.45, ease:"easeInOut" }}
          className="relative w-full">
          {/* Front */}
          <div className="rounded-2xl p-10 min-h-[210px] flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility:"hidden", background:"#1f1a14", border:`1px solid ${known.has(index) ? "rgba(126,168,126,0.3)" : learning.has(index) ? "rgba(201,100,66,0.3)" : "rgba(232,168,56,0.15)"}` }}>
            {/* Status badge */}
            {(known.has(index) || learning.has(index)) && (
              <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full"
                style={known.has(index)
                  ? { background:"rgba(126,168,126,0.12)", color:"#7ea87e" }
                  : { background:"rgba(201,100,66,0.12)", color:"#c96442" }}>
                {known.has(index) ? "Know it" : "Still learning"}
              </div>
            )}
            <div className="text-gold-500 text-xs uppercase tracking-widest mb-5 font-medium" style={{ fontFamily:'"JetBrains Mono",monospace' }}>Question</div>
            <p className="text-parchment-100 text-xl leading-relaxed" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>{card.question}</p>
            <p className="text-parchment-700 text-xs mt-7 italic">tap to reveal answer</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-2xl p-10 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility:"hidden", transform:"rotateY(180deg)", background:"linear-gradient(135deg,rgba(232,168,56,0.08),rgba(201,100,66,0.05))", border:"1px solid rgba(232,168,56,0.25)" }}>
            <div className="text-gold-400 text-xs uppercase tracking-widest mb-5 font-medium" style={{ fontFamily:'"JetBrains Mono",monospace' }}>Answer</div>
            <p className="text-parchment-100 text-xl leading-relaxed" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>{card.answer}</p>
          </div>
        </motion.div>
      </div>

      {/* Know it / Still learning buttons */}
      {flipped && (
        <div className="flex gap-3 w-full max-w-xl">
          <button onClick={(e) => { e.stopPropagation(); markLearning(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:-translate-y-0.5"
            style={{ background:"rgba(201,100,66,0.1)", border:"1px solid rgba(201,100,66,0.3)", color:"#d4886a" }}>
            <ThumbsDown className="w-4 h-4" /> Still learning
          </button>
          <button onClick={(e) => { e.stopPropagation(); markKnown(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:-translate-y-0.5"
            style={{ background:"rgba(126,168,126,0.1)", border:"1px solid rgba(126,168,126,0.3)", color:"#a3c4a3" }}>
            <ThumbsUp className="w-4 h-4" /> Know it!
          </button>
        </div>
      )}

      {/* Nav arrows */}
      <div className="flex items-center gap-4">
        <button onClick={() => { setFlipped(false); if (index > 0) setTimeout(() => setIndex(index-1), 150); }}
          disabled={index === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ background:"rgba(232,168,56,0.08)", border:"1px solid rgba(232,168,56,0.15)" }}>
          <ChevronLeft className="w-5 h-5 text-parchment-300" />
        </button>
        <div className="flex gap-1.5">
          {flashcards.map((_, i) => (
            <button key={i} onClick={() => { setIndex(i); setFlipped(false); }}
              className="rounded-full transition-all duration-200"
              style={{ width: i===index ? "20px" : "8px", height:"8px",
                background: known.has(i) ? "#7ea87e" : learning.has(i) ? "#c96442" : i===index ? "#e8a838" : "rgba(232,168,56,0.2)" }} />
          ))}
        </div>
        <button onClick={goNext} disabled={index === flashcards.length - 1 && studied < flashcards.length}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ background:"rgba(232,168,56,0.08)", border:"1px solid rgba(232,168,56,0.15)" }}>
          <ChevronRight className="w-5 h-5 text-parchment-300" />
        </button>
      </div>

      <button onClick={() => { setIndex(0); setFlipped(false); setDone(false); const k=new Set<number>(); const l=new Set<number>(); setKnown(k); setLearning(l); if(videoId) clearFlashcardProgress(videoId); }}
        className="flex items-center gap-1.5 text-parchment-600 hover:text-parchment-400 text-sm transition-colors">
        <RotateCcw className="w-3.5 h-3.5" /> Reset progress
      </button>
    </div>
  );
}
