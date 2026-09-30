import { cn } from "@/lib/utils";
import { UndoIcon, RedoIcon, DeleteIcon } from "@/components/Icon";

export interface FloatingToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  className?: string;
}

export function FloatingToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  className,
}: FloatingToolbarProps) {
  return (
    <nav
      aria-label="Canvas Actions"
      className={cn(
        "fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-20",
        "flex items-center gap-1.5 p-2 sm:p-2.5",
        "bg-white/95 dark:bg-google-grey-800/95 backdrop-blur-md",
        "border border-google-grey-200 dark:border-google-grey-700",
        "rounded-2xl transition-all duration-200",
        className,
      )}
    >
      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo stroke"
        className={cn(
          "flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 rounded-xl transition-all",
          canUndo
            ? "text-google-grey-800 dark:text-google-grey-100 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 active:scale-95 cursor-pointer"
            : "text-google-grey-400 dark:text-google-grey-600 opacity-40 cursor-not-allowed",
        )}
      >
        <UndoIcon className="w-4 h-4" />
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        aria-label="Redo stroke"
        className={cn(
          "flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 rounded-xl transition-all",
          canRedo
            ? "text-google-grey-800 dark:text-google-grey-100 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 active:scale-95 cursor-pointer"
            : "text-google-grey-400 dark:text-google-grey-600 opacity-40 cursor-not-allowed",
        )}
      >
        <RedoIcon className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div
        className="w-px h-6 bg-google-grey-200 dark:bg-google-grey-700 mx-1"
        role="separator"
      />

      {/* Delete All / Clear */}
      <button
        type="button"
        onClick={onClear}
        disabled={!canUndo}
        title="Hapus Semua (Clear Canvas)"
        aria-label="Clear entire canvas"
        className={cn(
          "flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 rounded-xl transition-all",
          canUndo
            ? "text-google-grey-800 dark:text-google-grey-100 hover:text-google-red-600 dark:hover:text-google-red-400 hover:bg-google-red-50 dark:hover:bg-google-red-950/40 active:scale-95 cursor-pointer"
            : "text-google-grey-400 dark:text-google-grey-600 opacity-40 cursor-not-allowed",
        )}
      >
        <DeleteIcon className="w-4 h-4" />
      </button>
    </nav>
  );
}
