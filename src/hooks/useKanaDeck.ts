import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type KanaMode,
  type KanaItem,
  KANA_ROWS,
  ALL_KANA_ITEMS,
  KANA_BY_ID,
} from "@/constants/kana";

const STORAGE_KEY_MODE = "kadle_deck_mode";
const STORAGE_KEY_SELECTED = "kadle_deck_selected_ids";
const DEFAULT_SELECTED_IDS = ["a", "i", "u", "e", "o"];

export function useKanaDeck() {
  const [mode, setModeState] = useState<KanaMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE);
      if (saved === "hiragana" || saved === "katakana") return saved;
    } catch {
      // ignore storage access errors
    }
    return "hiragana";
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SELECTED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set<string>(parsed);
        }
      }
    } catch {
      // ignore parsing errors
    }
    return new Set<string>(DEFAULT_SELECTED_IDS);
  });

  // Persist mode
  const setMode = useCallback((newMode: KanaMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist selectedIds
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SELECTED,
        JSON.stringify(Array.from(selectedIds)),
      );
    } catch {
      // ignore storage errors
    }
  }, [selectedIds]);

  const toggleChar = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleRow = useCallback((rowKey: string) => {
    const row = KANA_ROWS.find((r) => r.key === rowKey);
    if (!row) return;

    const rowItems = row.items.filter(
      (item): item is KanaItem => item !== null,
    );

    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isAllSelected = rowItems.every((item) => next.has(item.id));

      if (isAllSelected) {
        // Deselect entire row
        for (const item of rowItems) {
          next.delete(item.id);
        }
      } else {
        // Select entire row
        for (const item of rowItems) {
          next.add(item.id);
        }
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(ALL_KANA_ITEMS.map((item) => item.id)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isCharSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const isRowAllSelected = useCallback(
    (rowKey: string) => {
      const row = KANA_ROWS.find((r) => r.key === rowKey);
      if (!row) return false;
      const rowItems = row.items.filter(
        (item): item is KanaItem => item !== null,
      );
      if (rowItems.length === 0) return false;
      return rowItems.every((item) => selectedIds.has(item.id));
    },
    [selectedIds],
  );

  const activeItems = useMemo<KanaItem[]>(() => {
    return Array.from(selectedIds)
      .map((id) => KANA_BY_ID.get(id))
      .filter((item): item is KanaItem => item !== undefined);
  }, [selectedIds]);

  return {
    mode,
    setMode,
    selectedIds,
    selectedCount: selectedIds.size,
    totalCount: ALL_KANA_ITEMS.length,
    activeItems,
    toggleChar,
    toggleRow,
    selectAll,
    deselectAll,
    isCharSelected,
    isRowAllSelected,
  };
}
