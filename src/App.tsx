import * as React from "react";
import { DrawingCanvas, type DrawingCanvasRef } from "@/components/DrawingCanvas";
import { DeckSelectorModal } from "@/components/DeckSelectorModal";
import { QuizPromptCard } from "@/components/QuizPromptCard";
import { CheckActionButton } from "@/components/CheckActionButton";
import { useKanaDeck } from "@/hooks/useKanaDeck";
import { useKanaQuiz } from "@/hooks/useKanaQuiz";

export function App() {
  const canvasRef = React.useRef<DrawingCanvasRef>(null);

  const deck = useKanaDeck();
  const quiz = useKanaQuiz({
    mode: deck.mode,
    activeItems: deck.activeItems,
  });

  const handleNextQuestion = React.useCallback(() => {
    canvasRef.current?.clear();
    quiz.nextQuestion();
  }, [quiz]);

  const handleCheck = React.useCallback(() => {
    quiz.verifyDrawing();
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
        onCheck={handleCheck}
        onNext={handleNextQuestion}
      />
    </main>
  );
}

export default App;
