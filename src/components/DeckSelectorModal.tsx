import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Tabs } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";
import {
  type KanaMode,
  type KanaCategory,
  type KanaItem,
  KANA_ROWS,
  ALL_KANA_ITEMS,
} from "@/constants/kana";
import { TuneIcon, CloseIcon, CheckIcon } from "@/components/Icon";

export interface DeckSelectorModalProps {
  mode: KanaMode;
  onModeChange: (mode: KanaMode) => void;
  selectedIds: Set<string>;
  onToggleChar: (id: string) => void;
  onToggleRow: (rowKey: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isCharSelected: (id: string) => boolean;
  isRowAllSelected: (rowKey: string) => boolean;
  selectedCount: number;
  totalCount: number;
}

type CategoryFilter = "all" | KanaCategory;

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "main", label: "Dasar" },
  { key: "dakuon", label: "Dakuon" },
  { key: "combo", label: "Kombinasi" },
];

export function DeckSelectorModal({
  mode,
  onModeChange,
  selectedIds: _selectedIds,
  onToggleChar,
  onToggleRow,
  onSelectAll,
  onDeselectAll,
  isCharSelected,
  isRowAllSelected,
  selectedCount,
  totalCount,
}: DeckSelectorModalProps) {
  const [open, setOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>("all");

  const modeLabel = mode === "hiragana" ? "Hiragana" : "Katakana";
  const modeSampleChar = mode === "hiragana" ? "あ" : "ア";

  const filteredRows = React.useMemo(() => {
    if (activeCategory === "all") return KANA_ROWS;
    return KANA_ROWS.filter((row) => row.category === activeCategory);
  }, [activeCategory]);

  const categoryCounts = React.useMemo(
    () => ({
      all: ALL_KANA_ITEMS.length,
      main: ALL_KANA_ITEMS.filter((i) => i.category === "main").length,
      dakuon: ALL_KANA_ITEMS.filter((i) => i.category === "dakuon").length,
      combo: ALL_KANA_ITEMS.filter((i) => i.category === "combo").length,
    }),
    [],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Floating Trigger at Top-Right */}
      <Dialog.Trigger
        aria-label="Pilih Deck Huruf"
        className={cn(
          "fixed top-3 right-3 sm:top-5 sm:right-6 z-20",
          "flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5",
          "bg-white/95 dark:bg-google-grey-800/95 backdrop-blur-md",
          "border border-google-grey-200 dark:border-google-grey-700",
          "rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-xs",
          "text-google-grey-800 dark:text-google-grey-100 hover:bg-google-grey-100 dark:hover:bg-google-grey-700",
          "text-xs sm:text-sm font-medium",
        )}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-google-blue-50 dark:bg-google-blue-900 text-google-blue-600 dark:text-google-blue-300 font-bold text-xs">
          {modeSampleChar}
        </span>
        <span className="font-medium">{modeLabel}</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-google-grey-100 dark:bg-google-grey-700 text-google-grey-600 dark:text-google-grey-300">
          {selectedCount}/{totalCount}
        </span>
        <TuneIcon className="w-4 h-4 text-google-grey-500" />
      </Dialog.Trigger>

      {/* Modal Dialog */}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />

        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
            "w-[94vw] max-w-xl max-h-[88vh]",
            "bg-white dark:bg-google-grey-900",
            "border border-google-grey-200 dark:border-google-grey-800",
            "rounded-2xl flex flex-col overflow-hidden",
            "transition-[opacity,transform] duration-200",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          )}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-google-grey-200 dark:border-google-grey-800 flex-shrink-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold text-google-grey-900 dark:text-google-grey-100">
                  Pilih Huruf Latihan
                </Dialog.Title>
                <Dialog.Description className="text-xs text-google-grey-500 dark:text-google-grey-400 mt-0.5">
                  Pilih huruf Dasar, Dakuon (゛゜), atau Kombinasi (Yōon)
                </Dialog.Description>
              </div>

              <Dialog.Close
                aria-label="Tutup"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-google-grey-500 hover:text-google-grey-900 dark:hover:text-google-grey-100 hover:bg-google-grey-100 dark:hover:bg-google-grey-800 transition-all cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Mode Switch Tabs using Base UI */}
            <Tabs.Root
              value={mode}
              onValueChange={(val) => onModeChange(val as KanaMode)}
              className="w-full mb-3"
            >
              <Tabs.List className="grid grid-cols-2 p-1 bg-google-grey-100 dark:bg-google-grey-800 rounded-xl gap-1">
                <Tabs.Tab
                  value="hiragana"
                  className={cn(
                    "py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer text-center",
                    "text-google-grey-600 dark:text-google-grey-400 hover:text-google-grey-900 dark:hover:text-google-grey-100",
                    "data-[active]:bg-white dark:data-[active]:bg-google-grey-700 data-[active]:text-google-blue-600 dark:data-[active]:text-google-blue-300 data-[active]:font-semibold data-[active]:shadow-xs",
                  )}
                >
                  Hiragana (あ)
                </Tabs.Tab>

                <Tabs.Tab
                  value="katakana"
                  className={cn(
                    "py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer text-center",
                    "text-google-grey-600 dark:text-google-grey-400 hover:text-google-grey-900 dark:hover:text-google-grey-100",
                    "data-[active]:bg-white dark:data-[active]:bg-google-grey-700 data-[active]:text-google-blue-600 dark:data-[active]:text-google-blue-300 data-[active]:font-semibold data-[active]:shadow-xs",
                  )}
                >
                  Katakana (ア)
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.Root>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                    activeCategory === cat.key
                      ? "bg-google-blue-50 dark:bg-google-blue-900/60 text-google-blue-600 dark:text-google-blue-300 border border-google-blue-200 dark:border-google-blue-700"
                      : "bg-google-grey-100/70 dark:bg-google-grey-800/70 text-google-grey-600 dark:text-google-grey-400 hover:bg-google-grey-200 dark:hover:bg-google-grey-700 border border-transparent",
                  )}
                >
                  {cat.label} ({categoryCounts[cat.key]})
                </button>
              ))}
            </div>

            {/* Quick Actions & Counter */}
            <div className="flex items-center justify-between mt-3 pt-2 text-xs border-t border-google-grey-100 dark:border-google-grey-800">
              <span className="font-medium text-google-grey-700 dark:text-google-grey-300">
                <strong className="text-google-blue-600 dark:text-google-blue-400">
                  {selectedCount}
                </strong>{" "}
                dari {totalCount} huruf dipilih
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-google-blue-600 dark:text-google-blue-400 hover:underline font-medium cursor-pointer"
                >
                  Pilih Semua ({totalCount})
                </button>
                <span className="text-google-grey-300 dark:text-google-grey-700">
                  •
                </span>
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="text-google-grey-500 hover:text-google-red-600 dark:hover:text-google-red-400 font-medium cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Characters Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {filteredRows.map((row) => {
              const isAllRowSelected = isRowAllSelected(row.key);
              const isCombo = row.category === "combo";

              return (
                <div key={row.key} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-google-grey-500 uppercase tracking-wider">
                      {row.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleRow(row.key)}
                      className="text-[11px] font-medium text-google-blue-600 dark:text-google-blue-400 hover:underline cursor-pointer"
                    >
                      {isAllRowSelected ? "Batalkan Baris" : "Pilih Baris"}
                    </button>
                  </div>

                  <div
                    className={cn(
                      "grid gap-2",
                      isCombo ? "grid-cols-3" : "grid-cols-5",
                    )}
                  >
                    {row.items.map((item: KanaItem | null, idx) => {
                      if (!item) {
                        return (
                          <div
                            key={`empty-${row.key}-${idx}`}
                            className="h-16 rounded-xl border border-dashed border-google-grey-200/50 dark:border-google-grey-800/60 bg-google-grey-50/20 dark:bg-google-grey-850/20"
                            aria-hidden="true"
                          />
                        );
                      }

                      const selected = isCharSelected(item.id);
                      const displayChar =
                        mode === "hiragana" ? item.hiragana : item.katakana;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onToggleChar(item.id)}
                          aria-pressed={selected}
                          className={cn(
                            "relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none",
                            "h-16 min-w-0 active:scale-95",
                            selected
                              ? "bg-google-blue-600 text-white border-google-blue-500 shadow-xs dark:bg-google-blue-600 dark:border-google-blue-400 dark:text-white"
                              : "bg-google-grey-50/50 dark:bg-google-grey-800/40 border-google-grey-200 dark:border-google-grey-800 text-google-grey-700 dark:text-google-grey-300 hover:bg-google-grey-100 dark:hover:bg-google-grey-800",
                          )}
                        >
                          {selected && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-google-blue-600 flex items-center justify-center shadow-xs">
                              <CheckIcon className="w-2.5 h-2.5" />
                            </span>
                          )}

                          <span
                            className={cn(
                              "font-japanese font-bold leading-none tracking-tight",
                              isCombo
                                ? "text-lg sm:text-xl"
                                : "text-xl sm:text-2xl",
                            )}
                          >
                            {displayChar}
                          </span>

                          <span
                            className={cn(
                              "text-[10px] font-mono mt-1",
                              selected
                                ? "text-white/80"
                                : "text-google-grey-500 dark:text-google-grey-400",
                            )}
                          >
                            {item.romaji}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-google-grey-200 dark:border-google-grey-800 bg-google-grey-50/80 dark:bg-google-grey-900/80 flex-shrink-0 flex items-center justify-between gap-3">
            {selectedCount === 0 ? (
              <span className="text-xs text-google-red-500 font-medium">
                Pilih minimal 1 huruf untuk mulai
              </span>
            ) : (
              <span className="text-xs text-google-grey-500 dark:text-google-grey-400">
                Latihan siap dimulai
              </span>
            )}

            <Dialog.Close
              disabled={selectedCount === 0}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all",
                selectedCount > 0
                  ? "bg-google-blue-600 hover:bg-google-blue-700 active:scale-95 text-white shadow-xs cursor-pointer"
                  : "bg-google-grey-200 dark:bg-google-grey-800 text-google-grey-400 dark:text-google-grey-600 cursor-not-allowed opacity-60",
              )}
            >
              Mulai Latihan ({selectedCount} Huruf)
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
