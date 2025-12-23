import * as ort from 'onnxruntime-web';

// Configure ONNX Runtime for WebAssembly - match installed package version 1.23.2
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';

export const CLASS_NAMES = [
  'OxygenTank',
  'NitrogenTank', 
  'FirstAidBox',
  'FireAlarm',
  'SafetySwitchPanel',
  'EmergencyPhone',
  'FireExtinguisher'
] as const;

export type ClassName = typeof CLASS_NAMES[number];

export interface Detection {
  id: string;
  classId: number;
  className: ClassName;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: Date;
}

export interface InferenceResult {
  detections: Detection[];
  inferenceTimeMs: number;
  preprocessTimeMs: number;
  postprocessTimeMs: number;
}

const CLASS_COLORS: Record<ClassName, string> = {
  OxygenTank: '#00f0ff',
  NitrogenTank: '#00ff88',
  FirstAidBox: '#ff6b35',
  FireAlarm: '#ff3366',
  SafetySwitchPanel: '#ffdd00',
  EmergencyPhone: '#aa66ff',
  FireExtinguisher: '#ff0066'
};

export const getClassColor = (className: ClassName): string => {
  return CLASS_COLORS[className] || '#00f0ff';
};

let session: ort.InferenceSession | null = null;

export async function loadModel(modelPath: string = '/best.onnx'): Promise<boolean> {
  try {
    console.log('Loading ONNX model from:', modelPath);
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    console.log('Model loaded successfully');
    console.log('Input names:', session.inputNames);
    console.log('Output names:', session.outputNames);
    return true;
  } catch (error) {
    console.error('Failed to load model:', error);
    return false;
  }
}

export function isModelLoaded(): boolean {
  return session !== null;
}

export async function preprocessImage(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  targetSize: number = 1280
): Promise<{ tensor: ort.Tensor; originalWidth: number; originalHeight: number; timeMs: number }> {
  const startTime = performance.now();
  
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d')!;
  
  // Get original dimensions
  const originalWidth = imageSource instanceof HTMLVideoElement 
    ? imageSource.videoWidth 
    : imageSource.width;
  const originalHeight = imageSource instanceof HTMLVideoElement 
    ? imageSource.videoHeight 
    : imageSource.height;
  
  // Calculate scaling to maintain aspect ratio
  const scale = Math.min(targetSize / originalWidth, targetSize / originalHeight);
  const scaledWidth = Math.round(originalWidth * scale);
  const scaledHeight = Math.round(originalHeight * scale);
  
  // Center the image with letterboxing
  const offsetX = (targetSize - scaledWidth) / 2;
  const offsetY = (targetSize - scaledHeight) / 2;
  
  // Fill with gray background (standard YOLO letterbox)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, targetSize, targetSize);
  
  // Draw scaled image
  ctx.drawImage(imageSource, offsetX, offsetY, scaledWidth, scaledHeight);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;
  
  // Convert to Float32 NCHW tensor normalized to [0, 1]
  const tensorData = new Float32Array(3 * targetSize * targetSize);
  
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const pixelIndex = (y * targetSize + x) * 4;
      const tensorIndex = y * targetSize + x;
      
      // RGB channels normalized to [0, 1]
      tensorData[0 * targetSize * targetSize + tensorIndex] = data[pixelIndex] / 255.0;     // R
      tensorData[1 * targetSize * targetSize + tensorIndex] = data[pixelIndex + 1] / 255.0; // G
      tensorData[2 * targetSize * targetSize + tensorIndex] = data[pixelIndex + 2] / 255.0; // B
    }
  }
  
  const tensor = new ort.Tensor('float32', tensorData, [1, 3, targetSize, targetSize]);
  
  return {
    tensor,
    originalWidth,
    originalHeight,
    timeMs: performance.now() - startTime
  };
}

function iou(box1: number[], box2: number[]): number {
  const x1 = Math.max(box1[0], box2[0]);
  const y1 = Math.max(box1[1], box2[1]);
  const x2 = Math.min(box1[2], box2[2]);
  const y2 = Math.min(box1[3], box2[3]);
  
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = (box1[2] - box1[0]) * (box1[3] - box1[1]);
  const area2 = (box2[2] - box2[0]) * (box2[3] - box2[1]);
  const union = area1 + area2 - intersection;
  
  return intersection / (union + 1e-6);
}

function nms(
  detections: { box: number[]; confidence: number; classId: number }[],
  iouThreshold: number = 0.45
): { box: number[]; confidence: number; classId: number }[] {
  // Sort by confidence
  detections.sort((a, b) => b.confidence - a.confidence);
  
  const selected: typeof detections = [];
  const used = new Set<number>();
  
  for (let i = 0; i < detections.length; i++) {
    if (used.has(i)) continue;
    
    selected.push(detections[i]);
    
    for (let j = i + 1; j < detections.length; j++) {
      if (used.has(j)) continue;
      
      // Only suppress same class
      if (detections[i].classId === detections[j].classId) {
        if (iou(detections[i].box, detections[j].box) > iouThreshold) {
          used.add(j);
        }
      }
    }
  }
  
  return selected;
}

export async function runInference(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  confidenceThreshold: number = 0.25,
  iouThreshold: number = 0.45
): Promise<InferenceResult> {
  if (!session) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }
  
  // Preprocess
  const { tensor, originalWidth, originalHeight, timeMs: preprocessTimeMs } = 
    await preprocessImage(imageSource);
  
  // Inference
  const inferenceStart = performance.now();
  const feeds = { [session.inputNames[0]]: tensor };
  const results = await session.run(feeds);
  const inferenceTimeMs = performance.now() - inferenceStart;
  
  // Postprocess
  const postprocessStart = performance.now();
  const output = results[session.outputNames[0]];
  const outputData = output.data as Float32Array;
  
  // YOLOv8 output shape is [1, 11, 33600] for 1280px input
  // Need to transpose to [33600, 11] - each row is [x, y, w, h, class1_conf, class2_conf, ...]
  const numDetections = output.dims[2]; // 33600
  const numFeatures = output.dims[1];   // 11 (4 box + 7 classes)
  
  const rawDetections: { box: number[]; confidence: number; classId: number }[] = [];
  
  for (let i = 0; i < numDetections; i++) {
    // Extract box coordinates (center format)
    const cx = outputData[0 * numDetections + i];
    const cy = outputData[1 * numDetections + i];
    const w = outputData[2 * numDetections + i];
    const h = outputData[3 * numDetections + i];
    
    // Find max class confidence
    let maxConf = 0;
    let maxClassId = 0;
    for (let c = 0; c < CLASS_NAMES.length; c++) {
      const conf = outputData[(4 + c) * numDetections + i];
      if (conf > maxConf) {
        maxConf = conf;
        maxClassId = c;
      }
    }
    
    if (maxConf >= confidenceThreshold) {
      // Convert to corner format and scale back to original image
      const scale = 1280 / Math.max(originalWidth, originalHeight);
      const offsetX = (1280 - originalWidth * scale) / 2;
      const offsetY = (1280 - originalHeight * scale) / 2;
      
      const x1 = (cx - w / 2 - offsetX) / scale;
      const y1 = (cy - h / 2 - offsetY) / scale;
      const x2 = (cx + w / 2 - offsetX) / scale;
      const y2 = (cy + h / 2 - offsetY) / scale;
      
      rawDetections.push({
        box: [x1, y1, x2, y2],
        confidence: maxConf,
        classId: maxClassId
      });
    }
  }
  
  // Apply NMS
  const nmsDetections = nms(rawDetections, iouThreshold);
  const postprocessTimeMs = performance.now() - postprocessStart;
  
  // Convert to Detection objects
  const detections: Detection[] = nmsDetections.map((d, idx) => ({
    id: `det_${Date.now()}_${idx}`,
    classId: d.classId,
    className: CLASS_NAMES[d.classId],
    confidence: d.confidence,
    x: Math.max(0, d.box[0]),
    y: Math.max(0, d.box[1]),
    width: Math.max(0, d.box[2] - d.box[0]),
    height: Math.max(0, d.box[3] - d.box[1]),
    timestamp: new Date()
  }));
  
  return {
    detections,
    inferenceTimeMs,
    preprocessTimeMs,
    postprocessTimeMs
  };
}
