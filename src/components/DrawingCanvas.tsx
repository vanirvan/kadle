import { useRef, useEffect, useCallback, useState } from "react";
import { FloatingToolbar } from "@/components/FloatingToolbar";

export interface Point {
  x: number;
  y: number;
  width: number;
}

export interface Stroke {
  points: Point[];
  color?: string;
}

const EMPTY_STROKES: Stroke[] = [];

/**
 * Configure 2D canvas context with DPR-aware scale and round stroke joins.
 */
function setupContext(ctx: CanvasRenderingContext2D, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

/**
 * Full-screen drawing canvas using PointerEvents with Undo, Redo,
 * and Clear All support.
 */
export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
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

  const startStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    setupContext(ctx, dpr);

    canvas.setPointerCapture(e.pointerId);

    const pt = getPoint(e);

    isDrawing.current = true;
    lastPoint.current = pt;
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

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current || !currentStroke.current)
      return;

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

  const endStroke = () => {
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

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 bg-white dark:bg-google-grey-900 cursor-crosshair"
        style={{ touchAction: "none" }}
        onPointerDown={startStroke}
        onPointerMove={draw}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onPointerCancel={endStroke}
      />

      <FloatingToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />
    </div>
  );
}
