import { useState, useCallback, useMemo } from "react";
import type { KanaItem, KanaMode } from "@/constants/kana";
import {
  VOCABULARY_LIST,
  type WordItem,
  canFormWord,
  getWordCharacters,
} from "@/constants/vocabulary";

export type QuizType = "chars" | "vocab";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  romaji: string;
  meaning?: string;
  characters: string[];
  mode: KanaMode;
}

export interface QuizFeedback {
  status: "correct" | "try_again";
  message: string;
  score?: number;
}

interface UseKanaQuizProps {
  mode: KanaMode;
  activeItems: KanaItem[];
}

function createQuestion(
  quizType: QuizType,
  mode: KanaMode,
  activeItems: KanaItem[],
  charCount: number,
  repeatAllowed: boolean,
): QuizQuestion | null {
  if (quizType === "vocab") {
    const activeChars = new Set(
      activeItems.map((item) =>
        mode === "hiragana" ? item.hiragana : item.katakana,
      ),
    );

    const eligibleWords = VOCABULARY_LIST.filter(
      (v) => v.mode === mode && canFormWord(v.word, activeChars),
    );

    if (eligibleWords.length === 0) return null;

    const randomWord =
      eligibleWords[Math.floor(Math.random() * eligibleWords.length)] as WordItem;

    const characters = getWordCharacters(randomWord.word);

    return {
      id: `vocab_${randomWord.id}_${Date.now()}`,
      type: "vocab",
      prompt: randomWord.word,
      romaji: randomWord.romaji,
      meaning: randomWord.meaning,
      characters,
      mode,
    };
  }

  const pool = activeItems.length > 0 ? activeItems : [];
  if (pool.length === 0) return null;

  const count = Math.min(charCount, Math.max(1, pool.length));
  const selected: KanaItem[] = [];

  if (repeatAllowed) {
    for (let i = 0; i < count; i++) {
      const item = pool[Math.floor(Math.random() * pool.length)] as KanaItem;
      selected.push(item);
    }
  } else {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, count));
  }

  const characters = selected.map((item) =>
    mode === "hiragana" ? item.hiragana : item.katakana,
  );
  const romajiList = selected.map((item) => item.romaji);

  return {
    id: `chars_${Date.now()}`,
    type: "chars",
    prompt: characters.join(""),
    romaji: romajiList.join(""),
    characters,
    mode,
  };
}

export function useKanaQuiz({ mode, activeItems }: UseKanaQuizProps) {
  const [quizType, setQuizTypeState] = useState<QuizType>("chars");
  const [charCount, setCharCountState] = useState<number>(2);
  const [repeatAllowed, setRepeatAllowed] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);

  const activeCharKeys = activeItems
    .map((i) => i.id)
    .sort()
    .join(",");
  const [prevDeckKey, setPrevDeckKey] = useState(`${mode}_${activeCharKeys}`);

  const [question, setQuestion] = useState<QuizQuestion | null>(() =>
    createQuestion("chars", mode, activeItems, 2, true),
  );

  // Available vocab count based on active deck
  const availableVocabCount = useMemo(() => {
    const activeChars = new Set(
      activeItems.map((item) =>
        mode === "hiragana" ? item.hiragana : item.katakana,
      ),
    );
    return VOCABULARY_LIST.filter(
      (v) => v.mode === mode && canFormWord(v.word, activeChars),
    ).length;
  }, [mode, activeItems]);

  // Synchronize question when deck selection or mode changes
  const currentDeckKey = `${mode}_${activeCharKeys}`;
  if (currentDeckKey !== prevDeckKey) {
    setPrevDeckKey(currentDeckKey);
    setQuestion(
      createQuestion(quizType, mode, activeItems, charCount, repeatAllowed),
    );
  }

  // Re-generate question on demand
  const nextQuestion = useCallback(() => {
    setShowHint(false);
    setFeedback(null);
    setQuestion(
      createQuestion(quizType, mode, activeItems, charCount, repeatAllowed),
    );
  }, [quizType, mode, activeItems, charCount, repeatAllowed]);

  const setQuizType = useCallback(
    (type: QuizType) => {
      setQuizTypeState(type);
      setShowHint(false);
      setFeedback(null);
      setQuestion(
        createQuestion(type, mode, activeItems, charCount, repeatAllowed),
      );
    },
    [mode, activeItems, charCount, repeatAllowed],
  );

  const setCharCount = useCallback(
    (count: number) => {
      setCharCountState(count);
      setShowHint(false);
      setFeedback(null);
      setQuestion(
        createQuestion(quizType, mode, activeItems, count, repeatAllowed),
      );
    },
    [quizType, mode, activeItems, repeatAllowed],
  );

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatAllowed((prev) => !prev);
  }, []);

  // Mock verification (pre-AI integration)
  const verifyDrawing = useCallback(() => {
    const mockScore = Math.floor(Math.random() * 11) + 89;
    setFeedback({
      status: "correct",
      message: "Bagus banget! Goresanmu rapi.",
      score: mockScore,
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    question,
    quizType,
    setQuizType,
    charCount,
    setCharCount,
    repeatAllowed,
    toggleRepeat,
    showHint,
    toggleHint,
    feedback,
    verifyDrawing,
    clearFeedback,
    nextQuestion,
    availableVocabCount,
  };
}
