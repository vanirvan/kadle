import { DrawingCanvas } from "@/components/DrawingCanvas";
import { DeckSelectorModal } from "@/components/DeckSelectorModal";
import { useKanaDeck } from "@/hooks/useKanaDeck";

export function App() {
  const deck = useKanaDeck();

  return (
    <main className="relative w-full h-full overflow-hidden">
      <DrawingCanvas />

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
    </main>
  );
}

export default App;
