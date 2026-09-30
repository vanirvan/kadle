import { cn } from "@/lib/utils";
import { CheckIcon, ArrowForwardIcon } from "@/components/Icon";
import type { QuizFeedback } from "@/hooks/useKanaQuiz";

export interface CheckActionButtonProps {
  feedback: QuizFeedback | null;
  onCheck: () => void;
  onNext: () => void;
  className?: string;
}

export function CheckActionButton({
  feedback,
  onCheck,
  onNext,
  className,
}: CheckActionButtonProps) {
  if (feedback) {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20",
          "flex items-center gap-2 p-1.5 sm:p-2",
          "bg-white/95 dark:bg-google-grey-850/95 backdrop-blur-md",
          "border border-google-green-200 dark:border-google-green-800",
          "shadow-xl shadow-google-green-500/10 dark:shadow-black/40",
          "rounded-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
          className,
        )}
      >
        {/* Score & message badge */}
        <div className="flex items-center gap-2 px-2.5 py-1">
          <span className="w-6 h-6 rounded-full bg-google-green-500 text-white flex items-center justify-center font-bold text-xs">
            ✓
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-google-green-700 dark:text-google-green-400">
              {feedback.score}% Akurat!
            </span>
            <span className="text-[10px] text-google-grey-500 dark:text-google-grey-400">
              {feedback.message}
            </span>
          </div>
        </div>

        {/* Lanjut button */}
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-google-blue-600 hover:bg-google-blue-700 active:scale-95 text-white font-medium text-xs sm:text-sm cursor-pointer transition-all shadow-xs"
        >
          <span>Lanjut</span>
          <ArrowForwardIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onCheck}
      aria-label="Periksa Hasil Tulisan"
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20",
        "flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3",
        "bg-google-blue-600 hover:bg-google-blue-700 active:scale-95",
        "text-white font-medium text-xs sm:text-sm rounded-2xl",
        "shadow-lg shadow-google-blue-600/25 transition-all duration-200 cursor-pointer select-none",
        className,
      )}
    >
      <CheckIcon className="w-5 h-5" />
      <span>Periksa</span>
    </button>
  );
}
