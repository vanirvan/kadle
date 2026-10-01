import * as React from "react";
import * as ort from "onnxruntime-web";
import type { Stroke } from "@/components/DrawingCanvas";

// Configure ONNX Runtime Web
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";

export type AiLoadingStatus = "idle" | "downloading" | "compiling" | "ready" | "error";

export interface AiLoadingProgress {
  status: AiLoadingStatus;
  progress: number; // 0..100
  receivedMB: string;
  totalMB: string;
  error?: string;
}

export interface CharacterRecognitionResult {
  expectedChar: string;
  predictedChar: string;
  confidence: number;
  isMatch: boolean;
  topMatches: { char: string; confidence: number }[];
}

export interface EvaluationResult {
  status: "correct" | "try_again";
  score: number;
  message: string;
  details: CharacterRecognitionResult[];
}

interface LabelEntry {
  index: number;
  char: string;
  codepoint: string;
}

let session: ort.InferenceSession | null = null;
let labels: LabelEntry[] | null = null;
let confusableMap: Map<string, Set<string>> | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

// Progress tracking & subscribers
type ProgressListener = (progress: AiLoadingProgress) => void;
const progressListeners = new Set<ProgressListener>();

let currentProgress: AiLoadingProgress = {
  status: "idle",
  progress: 0,
  receivedMB: "0.0",
  totalMB: "14.5",
};

export function getAiLoadingProgress(): AiLoadingProgress {
  return currentProgress;
}

export function subscribeAiLoadingProgress(listener: ProgressListener): () => void {
  progressListeners.add(listener);
  listener(currentProgress);
  return () => {
    progressListeners.delete(listener);
  };
}

function updateProgress(update: Partial<AiLoadingProgress>) {
  currentProgress = { ...currentProgress, ...update };
  for (const listener of progressListeners) {
    listener(currentProgress);
  }
}

export function useAiLoadingProgress(): AiLoadingProgress {
  return React.useSyncExternalStore(
    subscribeAiLoadingProgress,
    getAiLoadingProgress,
    getAiLoadingProgress,
  );
}

const CACHE_NAME = "kadle-ai-cache-v1";
const MODEL_URL = "/model.fp16.onnx";

/**
 * Downloads model.fp16.onnx with streaming progress and stores into CacheStorage.
 */
async function fetchModelBufferWithProgress(): Promise<ArrayBuffer> {
  // 1. Try Cache API first for instant load on repeat visits
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(MODEL_URL);
      if (cachedResponse) {
        updateProgress({
          status: "compiling",
          progress: 100,
          receivedMB: "14.5",
          totalMB: "14.5",
        });
        return await cachedResponse.arrayBuffer();
      }
    } catch (e) {
      console.warn("Cache API lookup failed, falling back to network fetch:", e);
    }
  }

  // 2. Fetch from network with streaming progress
  updateProgress({
    status: "downloading",
    progress: 0,
    receivedMB: "0.0",
    totalMB: "14.5",
  });

  const response = await fetch(MODEL_URL);
  if (!response.ok) {
    throw new Error(`Failed to download model.fp16.onnx (${response.status})`);
  }

  const contentLength = response.headers.get("content-length");
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 15249584; // ~14.5 MB
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  if (!response.body) {
    const buf = await response.arrayBuffer();
    return buf;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedBytes += value.length;

    const progress = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
    const receivedMB = (receivedBytes / (1024 * 1024)).toFixed(1);

    updateProgress({
      status: "downloading",
      progress,
      receivedMB,
      totalMB,
    });
  }

  // Combine chunks into single ArrayBuffer
  const fullBuffer = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    fullBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  // 3. Cache the downloaded model in CacheStorage for future instant loads
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(
        MODEL_URL,
        new Response(fullBuffer.buffer.slice(0), {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": String(receivedBytes),
          },
        }),
      );
    } catch (e) {
      console.warn("Failed to cache model in Cache API:", e);
    }
  }

  updateProgress({
    status: "compiling",
    progress: 100,
    receivedMB: totalMB,
    totalMB,
  });

  return fullBuffer.buffer;
}

/**
 * Initialize model and labels if not already loaded.
 */
export async function initAiEngine(): Promise<void> {
  if (session && labels) {
    updateProgress({ status: "ready", progress: 100 });
    return;
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    isInitializing = true;
    try {
      // Load labels
      const labelsRes = await fetch("/labels.json");
      if (!labelsRes.ok) throw new Error("Failed to download labels.json");
      labels = (await labelsRes.json()) as LabelEntry[];

      // Load confusable pairs
      try {
        const confRes = await fetch("/confusable.json");
        if (confRes.ok) {
          const confList = (await confRes.json()) as { chars: string[] }[];
          confusableMap = new Map();
          for (const item of confList) {
            if (item.chars && item.chars.length === 2) {
              const [c1, c2] = item.chars;
              if (!confusableMap.has(c1)) confusableMap.set(c1, new Set());
              if (!confusableMap.has(c2)) confusableMap.set(c2, new Set());
              confusableMap.get(c1)!.add(c2);
              confusableMap.get(c2)!.add(c1);
            }
          }
        }
      } catch {
        // Confusables optional
      }

      // Download / read from Cache API
      const modelBuffer = await fetchModelBufferWithProgress();

      // Create ONNX session from buffer
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });

      updateProgress({
        status: "ready",
        progress: 100,
        receivedMB: currentProgress.totalMB,
        totalMB: currentProgress.totalMB,
      });
    } catch (err) {
      initPromise = null;
      updateProgress({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load AI",
      });
      throw err;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Cluster strokes into N groups along the horizontal (X) axis from left to right.
 * Uses agglomerative merging based on horizontal bounding box overlap.
 */
export function clusterStrokes(strokes: Stroke[], targetCount: number): Stroke[][] {
  const validStrokes = strokes.filter((s) => s.points && s.points.length > 0);
  if (validStrokes.length === 0) return [];
  if (targetCount <= 1 || validStrokes.length <= 1) return [validStrokes];

  interface ClusterItem {
    strokes: Stroke[];
    minX: number;
    maxX: number;
    centerX: number;
  }

  let clusters: ClusterItem[] = validStrokes.map((s) => {
    let minX = Infinity;
    let maxX = -Infinity;
    for (const pt of s.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
    }
    return {
      strokes: [s],
      minX,
      maxX,
      centerX: (minX + maxX) / 2,
    };
  });

  // Sort clusters left-to-right by centerX
  clusters.sort((a, b) => a.centerX - b.centerX);

  // Iteratively merge the two closest adjacent clusters until targetCount remain
  while (clusters.length > targetCount) {
    let minGap = Infinity;
    let mergeIdx = 0;

    for (let i = 0; i < clusters.length - 1; i++) {
      const left = clusters[i];
      const right = clusters[i + 1];

      // Distance between horizontal intervals
      const intervalGap = right.minX - left.maxX;
      const centerGap = right.centerX - left.centerX;
      // Overlapping bounding boxes have negative/zero interval gap and merge first
      const effectiveGap = intervalGap <= 0 ? intervalGap : centerGap;

      if (effectiveGap < minGap) {
        minGap = effectiveGap;
        mergeIdx = i;
      }
    }

    // Merge clusters at mergeIdx and mergeIdx + 1
    const left = clusters[mergeIdx];
    const right = clusters[mergeIdx + 1];
    const merged: ClusterItem = {
      strokes: [...left.strokes, ...right.strokes],
      minX: Math.min(left.minX, right.minX),
      maxX: Math.max(left.maxX, right.maxX),
      centerX: (Math.min(left.minX, right.minX) + Math.max(left.maxX, right.maxX)) / 2,
    };

    clusters.splice(mergeIdx, 2, merged);
  }

  // Final sort left-to-right by minX
  clusters.sort((a, b) => a.minX - b.minX);
  return clusters.map((c) => c.strokes);
}

/**
 * Render a cluster of strokes centered onto a 128x128 grayscale Float32Array (0..255).
 */
export function renderClusterToTensorData(
  strokes: Stroke[],
  targetSize = 128,
): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D context");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetSize, targetSize);

  // Compute bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const s of strokes) {
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }

  const boxW = Math.max(1, maxX - minX);
  const boxH = Math.max(1, maxY - minY);
  const maxDim = Math.max(boxW, boxH);

  // Leave 15% margin on each side
  const margin = 0.15;
  const availableSize = targetSize * (1 - 2 * margin);
  const scale = availableSize / maxDim;

  const charCenterX = (minX + maxX) / 2;
  const charCenterY = (minY + maxY) / 2;
  const targetCenterX = targetSize / 2;
  const targetCenterY = targetSize / 2;

  ctx.save();
  ctx.translate(targetCenterX, targetCenterY);
  ctx.scale(scale, scale);
  ctx.translate(-charCenterX, -charCenterY);

  // Standard stroke width matching ETL9G dataset (~5.5px at 128x128)
  const strokeWidth = 5.5 / scale;
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const s of strokes) {
    if (s.points.length === 0) continue;
    if (s.points.length === 1) {
      // Single tap / dot stroke (e.g. dakuten / small dots)
      ctx.beginPath();
      ctx.arc(s.points[0].x, s.points[0].y, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  // Extract pixel luminance
  const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
  const px = imgData.data;
  const tensorData = new Float32Array(targetSize * targetSize);
  for (let i = 0, j = 0; i < px.length; i += 4, j++) {
    // Rec.601 luminance
    tensorData[j] = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
  }

  return tensorData;
}

function softmax(logits: Float32Array): Float32Array {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }
  let sum = 0;
  const exp = new Float32Array(logits.length);
  for (let i = 0; i < logits.length; i++) {
    exp[i] = Math.exp(logits[i] - max);
    sum += exp[i];
  }
  for (let i = 0; i < logits.length; i++) {
    exp[i] /= sum;
  }
  return exp;
}

/**
 * Check if predicted character matches expected character (including homoglyphs & small variants).
 */
function isCharacterMatch(expected: string, predicted: string): boolean {
  if (expected === predicted) return true;

  // Check confusable pairs (e.g. へ / ヘ, 二 / ニ)
  if (confusableMap) {
    const confusables = confusableMap.get(expected);
    if (confusables && confusables.has(predicted)) return true;
  }

  // Small kana variants: model normalizes small っ/っ, ゃ/や, etc. to full-size
  const smallMap: Record<string, string> = {
    "っ": "つ", "ッ": "ツ",
    "ゃ": "や", "ャ": "ヤ",
    "ゅ": "ゆ", "ュ": "ユ",
    "ょ": "よ", "ョ": "ヨ",
    "ぁ": "あ", "ァ": "ア",
    "ぃ": "い", "ィ": "イ",
    "ぅ": "う", "ゥ": "ウ",
    "ぇ": "え", "ェ": "エ",
    "ぉ": "お", "ォ": "オ",
  };
  if (smallMap[expected] === predicted) return true;

  return false;
}

/**
 * Main evaluation function: clusters strokes, runs batched ONNX inference,
 * and compares with expected characters.
 */
export async function evaluateDrawing(
  strokes: Stroke[],
  expectedCharacters: string[],
): Promise<EvaluationResult> {
  const validStrokes = strokes.filter((s) => s.points && s.points.length > 0);

  if (validStrokes.length === 0) {
    return {
      status: "try_again",
      score: 0,
      message: "Canvas is empty. Draw the characters first!",
      details: [],
    };
  }

  await initAiEngine();

  if (!session || !labels) {
    throw new Error("AI model is not ready yet. Please wait a moment.");
  }

  const targetCount = expectedCharacters.length;
  const clusters = clusterStrokes(validStrokes, targetCount);

  // If user drew fewer clusters than expected
  const actualCount = clusters.length;
  const batchSize = actualCount;
  const SIZE = 128;
  const batchedData = new Float32Array(batchSize * 1 * SIZE * SIZE);

  for (let i = 0; i < batchSize; i++) {
    const singleData = renderClusterToTensorData(clusters[i], SIZE);
    batchedData.set(singleData, i * SIZE * SIZE);
  }

  const inputTensor = new ort.Tensor("float32", batchedData, [
    batchSize,
    1,
    SIZE,
    SIZE,
  ]);

  const outputMap = await session.run({ input: inputTensor });
  const logitsTensor = outputMap.logits;
  const logitsData = logitsTensor.data as Float32Array;
  const numClasses = labels.length;

  const details: CharacterRecognitionResult[] = [];
  let totalScore = 0;
  let allMatched = true;

  for (let i = 0; i < targetCount; i++) {
    const expected = expectedCharacters[i];

    if (i >= actualCount) {
      // Missing character
      details.push({
        expectedChar: expected,
        predictedChar: "",
        confidence: 0,
        isMatch: false,
        topMatches: [],
      });
      allMatched = false;
      continue;
    }

    const charLogits = logitsData.subarray(
      i * numClasses,
      (i + 1) * numClasses,
    );
    const probs = softmax(charLogits);

    // Find top-5 matches
    const indexed = Array.from(probs).map((p, idx) => ({ p, idx }));
    indexed.sort((a, b) => b.p - a.p);
    const top5 = indexed.slice(0, 5).map((item) => ({
      char: labels![item.idx].char,
      confidence: item.p,
    }));

    const top1 = top5[0];
    const isDirectMatch = isCharacterMatch(expected, top1.char);

    // Also check if expected is in top 3 with high confidence
    const inTop3 = top5.slice(0, 3).some((t) => isCharacterMatch(expected, t.char) && t.confidence > 0.15);
    const isMatch = isDirectMatch || inTop3;

    if (!isMatch) {
      allMatched = false;
    }

    const charConfidence = isMatch ? Math.max(top1.confidence, 0.85) : top1.confidence;
    const charScore = isMatch ? Math.round(charConfidence * 100) : Math.round(top1.confidence * 40);
    totalScore += charScore;

    details.push({
      expectedChar: expected,
      predictedChar: top1.char,
      confidence: top1.confidence,
      isMatch,
      topMatches: top5,
    });
  }

  const finalScore = Math.min(100, Math.round(totalScore / targetCount));

  if (allMatched && finalScore >= 70) {
    const compliments = [
      "Great job! Your strokes are very neat.",
      "Awesome! Your kana writing is very precise.",
      "Nice! The character shape looks spot on.",
      "Excellent! Keep up the smooth strokes.",
    ];
    const message = compliments[Math.floor(Math.random() * compliments.length)];
    return {
      status: "correct",
      score: finalScore,
      message,
      details,
    };
  }

  // Construct helpful failure message identifying what was mismatched without leaking hints
  const mismatches = details
    .map((d, index) => ({ detail: d, index: index + 1 }))
    .filter((item) => !item.detail.isMatch);

  let failureMessage = "Stroke shape does not match. Check the kana hint and try again!";
  if (mismatches.length > 0) {
    const firstMismatch = mismatches[0];
    const charLabel = targetCount > 1 ? `character #${firstMismatch.index}` : "character";
    if (!firstMismatch.detail.predictedChar) {
      failureMessage = targetCount > 1 ? `Character #${firstMismatch.index} has not been drawn yet.` : "Character has not been drawn yet.";
    } else {
      failureMessage = `AI recognized ${charLabel} as '${firstMismatch.detail.predictedChar}'.`;
    }
  }

  return {
    status: "try_again",
    score: Math.max(10, finalScore),
    message: failureMessage,
    details,
  };
}

export function isAiEngineInitializing(): boolean {
  return isInitializing;
}

export function isAiEngineReady(): boolean {
  return session !== null && labels !== null;
}
