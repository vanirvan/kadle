import * as React from "react";
import { DrawingCanvas, type DrawingCanvasRef } from "@/components/DrawingCanvas";
import { DeckSelectorModal } from "@/components/DeckSelectorModal";
import { QuizPromptCard } from "@/components/QuizPromptCard";
import { CheckActionButton } from "@/components/CheckActionButton";
import { useKanaDeck } from "@/hooks/useKanaDeck";
import { useKanaQuiz } from "@/hooks/useKanaQuiz";

import { evaluateDrawing, initAiEngine, useAiLoadingProgress } from "@/services/aiEngine";

export function App() {
  const canvasRef = React.useRef<DrawingCanvasRef>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const aiProgress = useAiLoadingProgress();

  const deck = useKanaDeck();
  const quiz = useKanaQuiz({
    mode: deck.mode,
    activeItems: deck.activeItems,
  });

  // Pre-warm the ONNX AI engine in background on mount
  React.useEffect(() => {
    initAiEngine().catch((err) => {
      console.warn("AI engine prewarm warning:", err);
    });
  }, []);

  const handleNextQuestion = React.useCallback(() => {
    canvasRef.current?.clear();
    quiz.nextQuestion();
  }, [quiz]);

  const handleRetry = React.useCallback(() => {
    quiz.clearFeedback();
  }, [quiz]);

  const handleCheck = React.useCallback(async () => {
    if (!quiz.question) return;
    const strokes = canvasRef.current?.getStrokes() ?? [];

    if (strokes.length === 0) {
      quiz.setEvaluationFeedback({
        status: "try_again",
        score: 0,
        message: "Canvas is empty. Draw the characters first!",
      });
      return;
    }

    setIsChecking(true);
    try {
      const result = await evaluateDrawing(strokes, quiz.question.characters);
      quiz.setEvaluationFeedback({
        status: result.status,
        score: result.score,
        message: result.message,
      });
    } catch (err) {
      console.error("AI inference error:", err);
      quiz.setEvaluationFeedback({
        status: "try_again",
        score: 0,
        message: "An error occurred while evaluating your drawing.",
      });
    } finally {
      setIsChecking(false);
    }
  }, [quiz]);

  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      {/* Full-screen Canvas */}
      <DrawingCanvas ref={canvasRef} />

      {/* Brand mark (Top Left) */}
      <div className="fixed top-3.5 left-3 sm:top-5 sm:left-6 z-20 flex items-center gap-1.5 select-none pointer-events-none">
        <span className="font-bold text-sm tracking-tight text-google-grey-800 dark:text-google-grey-200">
          Kadle<span className="text-google-blue-600 dark:text-google-blue-400">.</span>
        </span>
      </div>

      {/* Floating Prompt Card (Top Center) */}
      <QuizPromptCard
        question={quiz.question}
        quizType={quiz.quizType}
        onQuizTypeChange={quiz.setQuizType}
        charCount={quiz.charCount}
        onCharCountChange={quiz.setCharCount}
        showHint={quiz.showHint}
        onToggleHint={quiz.toggleHint}
        onNextQuestion={handleNextQuestion}
        availableVocabCount={quiz.availableVocabCount}
      />

      {/* Floating Deck Selector (Top Right) */}
      <DeckSelectorModal
        mode={deck.mode}
        onModeChange={deck.setMode}
        selectedIds={deck.selectedIds}
        onToggleChar={deck.toggleChar}
        onToggleRow={deck.toggleRow}
        onSelectAll={deck.selectAll}
        onDeselectAll={deck.deselectAll}
        isCharSelected={deck.isCharSelected}
        isRowAllSelected={deck.isRowAllSelected}
        selectedCount={deck.selectedCount}
        totalCount={deck.totalCount}
      />

      {/* Floating Check Button (Bottom Right) */}
      <CheckActionButton
        feedback={quiz.feedback}
        isLoading={isChecking}
        aiProgress={aiProgress}
        onCheck={handleCheck}
        onNext={handleNextQuestion}
        onRetry={handleRetry}
      />
    </main>
  );
}

export default App;
