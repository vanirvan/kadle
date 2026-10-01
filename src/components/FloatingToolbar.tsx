import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";
import {
  UndoIcon,
  RedoIcon,
  DeleteIcon,
  EditIcon,
  InkEraserIcon,
} from "@/components/Icon";

export type DrawingTool = "pen" | "eraser";

export interface FloatingToolbarProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  className?: string;
}

interface ToolbarActionProps {
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  active?: boolean;
}

function ToolbarAction({
  label,
  shortcut,
  icon,
  onClick,
  disabled = false,
  destructive = false,
  active = false,
}: ToolbarActionProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={250}
        render={
          <Toolbar.Button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            className={cn(
              "flex items-center justify-center w-6 h-6 sm:w-6 sm:h-6 rounded-md transition-all",
              "focus-visible:outline-2 focus-visible:outline-google-blue-500 focus-visible:outline-offset-1",
              disabled
                ? "text-google-grey-400 dark:text-google-grey-600 opacity-40 cursor-not-allowed"
                : active
                  ? "bg-google-blue-50 text-google-blue-600 dark:bg-google-blue-950/70 dark:text-google-blue-400 font-semibold shadow-xs ring-1 ring-google-blue-200 dark:ring-google-blue-800"
                  : destructive
                    ? "text-google-grey-800 dark:text-google-grey-100 hover:text-google-red-600 dark:hover:text-google-red-400 hover:bg-google-red-50 dark:hover:bg-google-red-950/40 active:scale-95 cursor-pointer"
                    : "text-google-grey-800 dark:text-google-grey-100 hover:bg-google-grey-100 dark:hover:bg-google-grey-700 active:scale-95 cursor-pointer",
            )}
          />
        }
      >
        {icon}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={10}>
          <Tooltip.Popup className="z-50 px-2.5 py-1 text-xs font-medium text-white bg-google-grey-900 dark:bg-google-grey-700 dark:text-google-grey-100 rounded-lg shadow-lg border border-google-grey-700/60 pointer-events-none select-none transition-[opacity,transform] duration-150 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 flex items-center gap-1.5">
            <span>{label}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/15 dark:bg-black/30 rounded border border-white/10 dark:border-white/5">
                {shortcut}
              </kbd>
            )}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function FloatingToolbar({
  tool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  className,
}: FloatingToolbarProps) {
  return (
    <Tooltip.Provider>
      <Toolbar.Root
        aria-label="Canvas Actions"
        className={cn(
          "fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-20",
          "flex items-center gap-1.5 p-1.5 sm:p-2",
          "bg-white/95 dark:bg-google-grey-800/95 backdrop-blur-md",
          "border border-google-grey-200 dark:border-google-grey-700",
          "rounded-xl transition-all duration-200 shadow-sm",
          className,
        )}
      >
        <ToolbarAction
          label="Pen"
          shortcut="P"
          active={tool === "pen"}
          icon={<EditIcon className="w-4 h-4" />}
          onClick={() => onToolChange("pen")}
        />

        <ToolbarAction
          label="Eraser"
          shortcut="E"
          active={tool === "eraser"}
          icon={<InkEraserIcon className="w-4 h-4" />}
          onClick={() => onToolChange("eraser")}
        />

        <Toolbar.Separator className="w-px h-4 bg-google-grey-200 dark:bg-google-grey-700 mx-0.5" />

        <ToolbarAction
          label="Undo"
          shortcut="Ctrl+Z"
          icon={<UndoIcon className="w-4 h-4" />}
          onClick={onUndo}
          disabled={!canUndo}
        />

        <ToolbarAction
          label="Redo"
          shortcut="Ctrl+Y"
          icon={<RedoIcon className="w-4 h-4" />}
          onClick={onRedo}
          disabled={!canRedo}
        />

        <Toolbar.Separator className="w-px h-4 bg-google-grey-200 dark:bg-google-grey-700 mx-0.5" />

        <ToolbarAction
          label="Clear All"
          icon={<DeleteIcon className="w-4 h-4" />}
          onClick={onClear}
          disabled={!canUndo}
          destructive
        />
      </Toolbar.Root>
    </Tooltip.Provider>
  );
}
