import * as React from "react";
import { cn } from "@/lib/utils";
import type { QuizQuestion, QuizType } from "@/hooks/useKanaQuiz";
import {
  ShuffleIcon,
  LightbulbIcon,
  VolumeUpIcon,
} from "@/components/Icon";

export interface QuizPromptCardProps {
  question: QuizQuestion | null;
  quizType: QuizType;
  onQuizTypeChange: (type: QuizType) => void;
  charCount: number;
  onCharCountChange: (count: number) => void;
  showHint: boolean;
  onToggleHint: () => void;
  onNextQuestion: () => void;
  availableVocabCount?: number;
  className?: string;
}

export function QuizPromptCard({
  question,
  quizType,
  onQuizTypeChange,
  charCount,
  onCharCountChange,
  showHint,
  onToggleHint,
  onNextQuestion,
  availableVocabCount = 0,
  className,
}: QuizPromptCardProps) {
  const speakPrompt = React.useCallback(() => {
    if (!question) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = question.characters.join("");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "ja-JP";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, [question]);

  if (!question) {
    const isVocabEmpty = quizType === "vocab" && availableVocabCount === 0;
    return (
      <div
        className={cn(
          "fixed top-14 sm:top-16 lg:top-5 left-1/2 -translate-x-1/2 z-20",
          "w-[92vw] max-w-sm sm:max-w-md",
          "bg-white/95 dark:bg-google-grey-800/95 backdrop-blur-md",
          "border border-google-grey-200 dark:border-google-grey-700",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          "rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2.5 select-none",
          className,
        )}
      >
        {/* Switcher so user is never trapped */}
        <div className="flex items-center justify-between w-full text-xs">
          <div className="inline-flex items-center p-0.5 rounded-full bg-google-grey-100 dark:bg-google-grey-900 border border-google-grey-200/60 dark:border-google-grey-700/60">
            <button
              type="button"
              onClick={() => onQuizTypeChange("chars")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                quizType === "chars"
                  ? "bg-white dark:bg-google-grey-700 text-google-blue-600 dark:text-google-blue-300 shadow-xs font-semibold"
                  : "text-google-grey-600 dark:text-google-grey-400 hover:text-google-grey-900 dark:hover:text-google-grey-100",
              )}
            >
              Random
            </button>
            <button
              type="button"
              onClick={() => onQuizTypeChange("vocab")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all",
                quizType === "vocab"
                  ? "bg-white dark:bg-google-grey-700 text-google-blue-600 dark:text-google-blue-300 shadow-xs font-semibold"
                  : "text-google-grey-600 dark:text-google-grey-400 hover:text-google-grey-900 dark:hover:text-google-grey-100",
              )}
            >
              Vocabulary ({availableVocabCount})
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-google-grey-600 dark:text-google-grey-300 py-1 font-medium">
          {isVocabEmpty
            ? "No vocabulary available for this combination. Unlock more kana in the top-right deck!"
            : "Select characters from the deck to start practicing."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-14 sm:top-16 lg:top-5 left-1/2 -translate-x-1/2 z-20",
        "w-[92vw] max-w-sm sm:max-w-md",
        "bg-white/95 dark:bg-google-grey-800/95 backdrop-blur-md",
        "border border-google-grey-200 dark:border-google-grey-700",
        "rounded-2xl p-3 sm:p-4 shadow-xl shadow-black/5 dark:shadow-black/30",
        "flex flex-col gap-2.5 transition-all duration-200 select-none",
        className,
      )}
    >
      {/* Top Bar: Controls & Mode Switcher */}
      <div className="flex items-center justify-between gap-1 text-xs">
        {/* Quiz Type Toggle */}
        <div className="inline-flex items-center p-0.5 rounded-full bg-google-grey-100 dark:bg-google-grey-900 border border-google-grey-200/60 dark:border-google-grey-700/60">
          <button
            type="button"
            onClick={() => onQuizTypeChange("chars")}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
              quizType === "chars"
                ? "bg-white dark:bg-google-grey-700 text-google-blue-600 dark:text-google-blue-300 shadow-xs font-semibold"
                : "text-google-grey-600 dark:text-google-grey-400 hover:text-google-grey-900 dark:hover:text-google-grey-100",
            )}
          >
            Random
          </button>
          <button
            type="button"
            onClick={() => onQuizTypeChange("vocab")}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
              quizType === "vocab"
                ? "bg-white dark:bg-google-grey-700 text-google-blue-600 dark:text-google-blue-300 shadow-xs font-semibold"
                : "text-google-grey-600 dark:text-google-grey-400 hover:text-google-grey-900 dark:hover:text-google-grey-100",
            )}
          >
            Vocabulary ({availableVocabCount})
          </button>
        </div>

        {/* Character count selector (only in "chars" mode) */}
        {quizType === "chars" && (
          <div className="flex items-center gap-1 sm:gap-1.5 ml-0.5 sm:ml-1">
            <span className="hidden sm:inline text-[11px] text-google-grey-500 dark:text-google-grey-400 font-medium">
              Length:
            </span>
            <div className="flex items-center gap-0.5 bg-google-grey-100 dark:bg-google-grey-900 p-0.5 rounded-lg border border-google-grey-200/60 dark:border-google-grey-700/60">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => onCharCountChange(cnt)}
                  className={cn(
                    "w-5 h-5 flex items-center justify-center rounded-md text-xs font-mono cursor-pointer transition-all",
                    charCount === cnt
                      ? "bg-google-blue-600 dark:bg-google-blue-500 text-white font-bold shadow-xs"
                      : "text-google-grey-600 dark:text-google-grey-400 hover:bg-google-grey-200 dark:hover:bg-google-grey-700 hover:text-google-grey-900 dark:hover:text-google-grey-100",
                  )}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-0.5 ml-auto">
          {/* Audio voice pronunciation */}
          <button
            type="button"
            onClick={speakPrompt}
            title="Pronounce (Audio)"
            aria-label="Pronounce audio"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-google-grey-600 dark:text-google-grey-300 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 transition-all cursor-pointer"
          >
            <VolumeUpIcon className="w-4 h-4" />
          </button>

          {/* Hint toggle */}
          <button
            type="button"
            onClick={onToggleHint}
            title={showHint ? "Hide Hint" : "Show Kana Hint"}
            aria-label="Show kana hint"
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer",
              showHint
                ? "bg-google-yellow-100 dark:bg-google-yellow-900/50 text-google-yellow-700 dark:text-google-yellow-300 border border-google-yellow-300 dark:border-google-yellow-700/60"
                : "text-google-grey-600 dark:text-google-grey-300 hover:bg-google-grey-100 dark:hover:bg-google-grey-700",
            )}
          >
            <LightbulbIcon className="w-4 h-4" />
          </button>

          {/* Shuffle / Next */}
          <button
            type="button"
            onClick={onNextQuestion}
            title="Next Prompt (Shuffle)"
            aria-label="Next prompt"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-google-grey-600 dark:text-google-grey-300 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 transition-all cursor-pointer"
          >
            <ShuffleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Target Display */}
      <div className="flex flex-col items-center justify-center py-2">
        {/* Combined Romaji Target (e.g. "ioieu", "kakiku", "sensei") */}
        <span className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-google-grey-900 dark:text-google-grey-100 select-none">
          {question.romaji}
        </span>

        {/* Real word meaning badge (if vocab mode) */}
        {question.meaning && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-google-grey-600 dark:text-google-grey-300 bg-google-grey-100 dark:bg-google-grey-700/60 px-2.5 py-0.5 rounded-full mt-1 border border-google-grey-200/50 dark:border-google-grey-700/50">
            {question.meaning}
          </span>
        )}

        {/* Kana Hint (only revealed when lightbulb is toggled) */}
        {showHint && (
          <div className="flex items-center justify-center gap-2 mt-2 text-google-blue-600 dark:text-google-blue-400 font-japanese font-bold text-2xl sm:text-3xl animate-in fade-in zoom-in-95 duration-150">
            {question.characters.join(" ")}
          </div>
        )}
      </div>
    </div>
  );
}
