import {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  FloatingToolbar,
  type DrawingTool,
} from "@/components/FloatingToolbar";
import { cn } from "@/lib/utils";

export type { DrawingTool };

export interface Point {
  x: number;
  y: number;
  width: number;
}

export interface Stroke {
  points: Point[];
  color?: string;
}

export interface DrawingCanvasRef {
  clear: () => void;
  getCanvas: () => HTMLCanvasElement | null;
  getStrokes: () => Stroke[];
}

export interface DrawingCanvasProps {
  className?: string;
}

const EMPTY_STROKES: Stroke[] = [];
const ERASER_RADIUS = 16;

/**
 * Configure 2D canvas context with DPR-aware scale and round stroke joins.
 */
function setupContext(ctx: CanvasRenderingContext2D, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

/**
 * Calculates Euclidean distance from point (px, py) to line segment (x1, y1)-(x2, y2).
 */
function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/**
 * Checks if any point or segment of a stroke intersects the eraser path from (x0, y0) to (x1, y1).
 */
function strokeIntersectsEraser(
  stroke: Stroke,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
): boolean {
  if (!stroke.points || stroke.points.length === 0) return false;

  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(dist / (radius * 0.75)));

  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const ex = x0 + t * (x1 - x0);
    const ey = y0 + t * (y1 - y0);

    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      if (Math.hypot(ex - p.x, ey - p.y) <= radius + p.width / 2) {
        return true;
      }
    } else {
      for (let i = 1; i < stroke.points.length; i++) {
        const p1 = stroke.points[i - 1];
        const p2 = stroke.points[i];
        const segDist = distanceToSegment(ex, ey, p1.x, p1.y, p2.x, p2.y);
        const maxDist = radius + Math.max(p1.width, p2.width) / 2;
        if (segDist <= maxDist) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Full-screen drawing canvas using PointerEvents with Pen, Eraser,
 * Undo, Redo, and Clear All support.
 */
export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<DrawingTool>("pen");
    const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(
      null,
    );

    const isDrawing = useRef(false);
    const isErasing = useRef(false);
    const hasErasedInCurrentGesture = useRef(false);
    const currentStroke = useRef<Stroke | null>(null);
    const lastPoint = useRef<Point | null>(null);

    // History stores snapshots of strokes array for undo/redo
    const [history, setHistory] = useState<Stroke[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const currentStrokes = history[historyIndex] ?? EMPTY_STROKES;
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // Refs for callbacks that need latest history without re-binding
    const currentStrokesRef = useRef(currentStrokes);
    useEffect(() => {
      currentStrokesRef.current = currentStrokes;
    }, [currentStrokes]);

    // Redraw strokes onto canvas
    const redrawStrokes = useCallback((strokesToDraw: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      // Reset transform to identity to clear entire physical pixel buffer
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Reapply DPR scaling so drawing uses CSS pixel coordinates
      setupContext(ctx, dpr);

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const defaultPenColor = isDark ? "#e8eaed" : "#202124";

      for (const stroke of strokesToDraw) {
        if (!stroke.points || stroke.points.length === 0) continue;

        ctx.globalCompositeOperation = "source-over";
        const strokeColor = stroke.color || defaultPenColor;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = strokeColor;

        if (stroke.points.length === 1) {
          const pt = stroke.points[0];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          for (let i = 1; i < stroke.points.length; i++) {
            const prev = stroke.points[i - 1];
            const curr = stroke.points[i];
            ctx.lineWidth = curr.width;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
          }
        }
      }

      // Ensure context remains scaled for subsequent live drawing
      setupContext(ctx, dpr);
    }, []);

    // Resize canvas to native resolution and redraw active strokes
    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      setupContext(ctx, dpr);
      redrawStrokes(currentStrokesRef.current);
    }, [redrawStrokes]);

    useEffect(() => {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = () => redrawStrokes(currentStrokesRef.current);
      mq.addEventListener("change", handleThemeChange);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        mq.removeEventListener("change", handleThemeChange);
      };
    }, [resizeCanvas, redrawStrokes]);

    // Undo action
    const handleUndo = useCallback(() => {
      if (historyIndex <= 0) return;
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      redrawStrokes(history[nextIndex]);
    }, [historyIndex, history, redrawStrokes]);

    // Redo action
    const handleRedo = useCallback(() => {
      if (historyIndex >= history.length - 1) return;
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      redrawStrokes(history[nextIndex]);
    }, [historyIndex, history, redrawStrokes]);

    // Clear action (undoable)
    const handleClear = useCallback(() => {
      if (currentStrokes.length === 0) return;
      const nextHistory = [...history.slice(0, historyIndex + 1), []];
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      redrawStrokes([]);
    }, [currentStrokes.length, history, historyIndex, redrawStrokes]);

    useImperativeHandle(
      ref,
      () => ({
        clear: handleClear,
        getCanvas: () => canvasRef.current,
        getStrokes: () => currentStrokesRef.current,
      }),
      [handleClear],
    );

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
          e.preventDefault();
          handleRedo();
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          if (e.key.toLowerCase() === "e") {
            setTool("eraser");
          } else if (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "b") {
            setTool("pen");
          } else if (e.key === "Escape") {
            setTool("pen");
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleUndo, handleRedo]);

    const computeStrokeWidth = (pointerPressure: number) => {
      const pressure = Math.max(pointerPressure, 0.25);
      return 2.5 + pressure * 3.5;
    };

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: computeStrokeWidth(e.pressure),
      };
    };

    const isEraserPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Check if hardware stylus eraser tip/button is active
      const isStylusEraser =
        e.pointerType === "pen" && ((e.buttons & 32) !== 0 || e.button === 5);
      return tool === "eraser" || isStylusEraser;
    };

    const eraseAt = (x0: number, y0: number, x1: number, y1: number) => {
      const existing = currentStrokesRef.current;
      if (existing.length === 0) return;

      const remaining = existing.filter(
        (stroke) => !strokeIntersectsEraser(stroke, x0, y0, x1, y1, ERASER_RADIUS),
      );

      if (remaining.length !== existing.length) {
        currentStrokesRef.current = remaining;
        redrawStrokes(remaining);
        hasErasedInCurrentGesture.current = true;
      }
    };

    const startPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0 && e.button !== 5) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(e.pointerId);

      const pt = getPoint(e);
      lastPoint.current = pt;

      if (isEraserPointer(e)) {
        isErasing.current = true;
        hasErasedInCurrentGesture.current = false;
        setEraserPos({ x: e.clientX, y: e.clientY });
        eraseAt(pt.x, pt.y, pt.x, pt.y);
        return;
      }

      // Pen mode
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      setupContext(ctx, dpr);

      isDrawing.current = true;
      currentStroke.current = {
        points: [pt],
      };

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const defaultPenColor = isDark ? "#e8eaed" : "#202124";

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = defaultPenColor;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.width / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const movePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (tool === "eraser") {
        setEraserPos({ x: e.clientX, y: e.clientY });
      }

      if (isErasing.current && lastPoint.current) {
        const currentPoint = getPoint(e);
        eraseAt(
          lastPoint.current.x,
          lastPoint.current.y,
          currentPoint.x,
          currentPoint.y,
        );
        lastPoint.current = currentPoint;
        return;
      }

      if (!isDrawing.current || !lastPoint.current || !currentStroke.current) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      setupContext(ctx, dpr);

      const currentPoint = getPoint(e);
      currentStroke.current.points.push(currentPoint);

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const defaultPenColor = isDark ? "#e8eaed" : "#202124";

      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = defaultPenColor;
      ctx.lineWidth = currentPoint.width;

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      lastPoint.current = currentPoint;
    };

    const endPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "touch") {
        setEraserPos(null);
      }

      if (isErasing.current) {
        isErasing.current = false;
        lastPoint.current = null;

        if (hasErasedInCurrentGesture.current) {
          hasErasedInCurrentGesture.current = false;
          const nextStrokes = currentStrokesRef.current;
          const nextHistory = [
            ...history.slice(0, historyIndex + 1),
            nextStrokes,
          ];
          setHistory(nextHistory);
          setHistoryIndex(nextHistory.length - 1);
        }
        return;
      }

      if (!isDrawing.current) return;
      isDrawing.current = false;
      lastPoint.current = null;

      if (currentStroke.current && currentStroke.current.points.length > 0) {
        const finishedStroke = currentStroke.current;
        currentStroke.current = null;

        const nextStrokes = [...currentStrokes, finishedStroke];
        const nextHistory = [...history.slice(0, historyIndex + 1), nextStrokes];
        setHistory(nextHistory);
        setHistoryIndex(nextHistory.length - 1);
      }
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
      setEraserPos(null);
      endPointer(e);
    };

    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          className={cn(
            "fixed inset-0 bg-white dark:bg-google-grey-900",
            tool === "eraser" ? "cursor-none" : "cursor-crosshair",
          )}
          style={{ touchAction: "none" }}
          onPointerDown={startPointer}
          onPointerMove={movePointer}
          onPointerUp={endPointer}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
        />

        {/* Visual feedback cursor circle for Eraser */}
        {tool === "eraser" && eraserPos && (
          <div
            aria-hidden="true"
            className="fixed pointer-events-none rounded-full border-2 border-google-red-500/70 bg-google-red-500/15 -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-75 shadow-xs z-10"
            style={{
              left: eraserPos.x,
              top: eraserPos.y,
              width: ERASER_RADIUS * 2,
              height: ERASER_RADIUS * 2,
            }}
          />
        )}

        <FloatingToolbar
          tool={tool}
          onToolChange={setTool}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
        />
      </div>
    );
  },
);
