import { cn } from "@/lib/utils";
import { CheckIcon, ArrowForwardIcon } from "@/components/Icon";
import type { QuizFeedback } from "@/hooks/useKanaQuiz";

export interface CheckActionButtonProps {
  feedback: QuizFeedback | null;
  isLoading?: boolean;
  onCheck: () => void;
  onNext: () => void;
  onRetry?: () => void;
  className?: string;
}

export function CheckActionButton({
  feedback,
  isLoading = false,
  onCheck,
  onNext,
  onRetry,
  className,
}: CheckActionButtonProps) {
  if (feedback) {
    const isCorrect = feedback.status === "correct";

    return (
      <div
        className={cn(
          "fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-30",
          "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-2.5",
          "bg-white/95 dark:bg-google-grey-800/95 backdrop-blur-md",
          isCorrect
            ? "border border-google-green-200 dark:border-google-green-800 shadow-xl shadow-google-green-500/10 dark:shadow-black/40"
            : "border border-google-red-200 dark:border-google-red-800 shadow-xl shadow-google-red-500/10 dark:shadow-black/40",
          "rounded-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
          className,
        )}
      >
        {/* Top Row (Mobile) / Left Side (Desktop): Icon + Status Text */}
        <div className="flex items-center gap-2.5 min-w-0 sm:flex-1">
          <span
            className={cn(
              "w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs",
              isCorrect ? "bg-google-green-500" : "bg-google-red-500",
            )}
          >
            {isCorrect ? "✓" : "✕"}
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={cn(
                "text-xs sm:text-sm font-semibold truncate",
                isCorrect
                  ? "text-google-green-700 dark:text-google-green-400"
                  : "text-google-red-700 dark:text-google-red-400",
              )}
            >
              {feedback.score !== undefined
                ? `${feedback.score}% Akurat`
                : isCorrect
                  ? "Benar!"
                  : "Belum Tepat"}
            </span>
            <span className="text-[11px] text-google-grey-600 dark:text-google-grey-300 truncate">
              {feedback.message}
            </span>
          </div>
        </div>

        {/* Action Button: Only 'Coba Lagi' when incorrect, and 'Lanjut' when correct */}
        {!isCorrect ? (
          <div className="w-full sm:w-auto flex items-center shrink-0">
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto py-2 sm:py-1.5 px-4 sm:px-3.5 rounded-xl border border-google-grey-300 dark:border-google-grey-700 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 active:scale-95 text-google-grey-700 dark:text-google-grey-200 text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-center justify-center"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="w-full sm:w-auto flex items-center shrink-0">
            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto py-2 sm:py-1.5 px-4 sm:px-3.5 rounded-xl bg-google-blue-600 hover:bg-google-blue-700 active:scale-95 text-white font-medium text-xs sm:text-sm cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Lanjut</span>
              <ArrowForwardIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onCheck}
      disabled={isLoading}
      aria-label="Periksa Hasil Tulisan"
      className={cn(
        "fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-20",
        "flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3",
        isLoading
          ? "bg-google-blue-500/80 cursor-wait"
          : "bg-google-blue-600 hover:bg-google-blue-700 active:scale-95 cursor-pointer",
        "text-white font-medium text-xs sm:text-sm rounded-2xl",
        "shadow-lg shadow-google-blue-600/25 transition-all duration-200 select-none",
        className,
      )}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Memeriksa...</span>
        </>
      ) : (
        <>
          <CheckIcon className="w-5 h-5" />
          <span>Periksa</span>
        </>
      )}
    </button>
  );
}
