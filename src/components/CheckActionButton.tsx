import { cn } from "@/lib/utils";
import { CheckIcon, ArrowForwardIcon } from "@/components/Icon";
import type { QuizFeedback } from "@/hooks/useKanaQuiz";
import type { AiLoadingProgress } from "@/services/aiEngine";

export interface CheckActionButtonProps {
  feedback: QuizFeedback | null;
  isLoading?: boolean;
  aiProgress?: AiLoadingProgress;
  onCheck: () => void;
  onNext: () => void;
  onRetry?: () => void;
  className?: string;
}

export function CheckActionButton({
  feedback,
  isLoading = false,
  aiProgress,
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
                ? `${feedback.score}% Accurate`
                : isCorrect
                  ? "Correct!"
                  : "Keep Trying"}
            </span>
            <span className="text-[11px] text-google-grey-600 dark:text-google-grey-300 truncate">
              {feedback.message}
            </span>
          </div>
        </div>

        {/* Action Button: Only 'Try Again' when incorrect, and 'Next' when correct */}
        {!isCorrect ? (
          <div className="w-full sm:w-auto flex items-center shrink-0">
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto py-2 sm:py-1.5 px-4 sm:px-3.5 rounded-xl border border-google-grey-300 dark:border-google-grey-700 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 active:scale-95 text-google-grey-700 dark:text-google-grey-200 text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-center justify-center"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="w-full sm:w-auto flex items-center shrink-0">
            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto py-2 sm:py-1.5 px-4 sm:px-3.5 rounded-xl bg-google-blue-600 hover:bg-google-blue-700 active:scale-95 text-white font-medium text-xs sm:text-sm cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Next</span>
              <ArrowForwardIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  const isAiReady = !aiProgress || aiProgress.status === "ready";
  const isDownloading = aiProgress?.status === "downloading";
  const isCompiling = aiProgress?.status === "compiling";
  const isError = aiProgress?.status === "error";
  const isAiBusy = !isAiReady;

  return (
    <button
      type="button"
      onClick={onCheck}
      disabled={isLoading || isAiBusy}
      aria-label="Check Drawing"
      className={cn(
        "fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-20",
        "flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3",
        isLoading
          ? "bg-google-blue-500/80 text-white cursor-wait"
          : isAiBusy
            ? "bg-white/90 dark:bg-google-grey-800/90 border border-google-grey-200 dark:border-google-grey-700 text-google-grey-600 dark:text-google-grey-300 cursor-not-allowed shadow-md shadow-black/5 backdrop-blur-md"
            : "bg-google-blue-600 hover:bg-google-blue-700 active:scale-95 text-white cursor-pointer shadow-lg shadow-google-blue-600/25",
        "font-medium text-xs sm:text-sm rounded-2xl transition-all duration-200 select-none",
        className,
      )}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          <span>Checking...</span>
        </>
      ) : isDownloading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-google-blue-600/30 border-t-google-blue-600 rounded-full animate-spin shrink-0" />
          <span className="sm:hidden">
            Downloading AI ({aiProgress.progress}%)
          </span>
          <span className="hidden sm:inline">
            Downloading AI ({aiProgress.progress}% · {aiProgress.receivedMB}/{aiProgress.totalMB} MB)
          </span>
        </>
      ) : isCompiling ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-google-blue-600/30 border-t-google-blue-600 rounded-full animate-spin shrink-0" />
          <span>Preparing AI...</span>
        </>
      ) : isError ? (
        <span>Failed to Load AI</span>
      ) : (
        <>
          <CheckIcon className="w-5 h-5" />
          <span>Check</span>
        </>
      )}
    </button>
  );
}
