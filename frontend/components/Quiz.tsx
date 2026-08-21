"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/api";

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{ background: "#1f1a14", border: "1px solid rgba(232,168,56,0.1)" }}
      >
        <p className="text-parchment-600 italic text-sm">No quiz questions available for this video.</p>
      </div>
    );
  }

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitted(true);
    const finalScore = questions.filter((q, i) => answers[i] === q.correct).length;
    onComplete?.(finalScore, questions.length);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : 0;

  const pct = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-5">
      {/* Score banner */}
      {submitted && (
        <div
          className="rounded-2xl p-6 flex items-center gap-4"
          style={{
            background: pct >= 70 ? "rgba(126,168,126,0.08)" : "rgba(201,100,66,0.08)",
            border: `1px solid ${pct >= 70 ? "rgba(126,168,126,0.25)" : "rgba(201,100,66,0.25)"}`,
          }}
        >
          {/* Trophy icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(232,168,56,0.12)", border: "1px solid rgba(232,168,56,0.2)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.09 6.26L20 9.27l-4.5 4.14 1.18 6.32L12 17l-4.68 2.73 1.18-6.32L4 9.27l5.91-.01L12 2z" stroke="#e8a838" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div
              className="text-parchment-100 text-2xl"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              {score} / {questions.length}{" "}
              <span className="text-parchment-500 text-base font-normal">correct</span>
            </div>
            <div className="text-parchment-500 text-sm mt-0.5 font-light">
              {pct === 100
                ? "Perfect! You nailed it."
                : pct >= 70
                ? "Great work — review the explanations below."
                : "Keep at it — watch the video again."}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-parchment-500 hover:text-parchment-300 text-sm transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qIndex) => {
        const userAnswer = answers[qIndex];
        const isCorrect  = submitted && userAnswer === q.correct;

        return (
          <div
            key={qIndex}
            className="rounded-2xl p-6"
            style={{ background: "#1f1a14", border: "1px solid rgba(232,168,56,0.1)" }}
          >
            {/* Question header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="step-num w-7 h-7 text-xs shrink-0">{qIndex + 1}</div>
              <p className="text-parchment-100 font-medium leading-relaxed">{q.question}</p>
              {submitted && (
                <div className="ml-auto shrink-0">
                  {isCorrect ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#7ea87e" strokeWidth="1.5"/>
                      <path d="M6 10l3 3 5-6" stroke="#7ea87e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#c96442" strokeWidth="1.5"/>
                      <path d="M7 7l6 6M13 7l-6 6" stroke="#c96442" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 ml-10">
              {q.options.map((option, oIndex) => {
                const isSelected       = userAnswer === oIndex;
                const isCorrectOption  = submitted && oIndex === q.correct;
                const isWrongSelected  = submitted && isSelected && !isCorrect;

                let bg     = "rgba(232,168,56,0.04)";
                let border = "rgba(232,168,56,0.08)";
                let color  = "#a89070";

                if (!submitted && isSelected) {
                  bg     = "rgba(232,168,56,0.1)";
                  border = "rgba(232,168,56,0.35)";
                  color  = "#fdf6e3";
                } else if (isCorrectOption) {
                  bg     = "rgba(126,168,126,0.1)";
                  border = "rgba(126,168,126,0.3)";
                  color  = "#a3c4a3";
                } else if (isWrongSelected) {
                  bg     = "rgba(201,100,66,0.1)";
                  border = "rgba(201,100,66,0.3)";
                  color  = "#d4886a";
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(qIndex, oIndex)}
                    disabled={submitted}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 border",
                      !submitted && "hover:border-gold-400/30 hover:bg-gold-400/[0.06]",
                      submitted && "cursor-default"
                    )}
                    style={{ background: bg, borderColor: border, color }}
                  >
                    <span
                      className="font-semibold mr-2 text-xs"
                      style={{
                        color: isCorrectOption ? "#7ea87e" : isWrongSelected ? "#c96442" : "#5a4535",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {String.fromCharCode(65 + oIndex)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {submitted && (
              <div
                className="ml-10 mt-4 p-3.5 rounded-xl"
                style={{ background: "rgba(232,168,56,0.04)", border: "1px solid rgba(232,168,56,0.08)" }}
              >
                <p className="text-parchment-500 text-xs leading-relaxed font-light">
                  <span className="text-parchment-400 font-medium">Explanation: </span>
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Submit */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="btn-gold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{ display: "flex" }}
        >
          Submit answers ({Object.keys(answers).length}/{questions.length} answered)
        </button>
      )}
    </div>
  );
}
