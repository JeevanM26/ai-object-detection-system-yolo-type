import { useRef, useEffect, useState, useCallback } from 'react';
import { Detection, getClassColor } from '@/lib/onnxInference';

interface DetectionCanvasProps {
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null;
  detections: Detection[];
  width: number;
  height: number;
}

export function DetectionCanvas({ imageSource, detections, width, height }: DetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const drawDetections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSource) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw source image/video
    ctx.drawImage(imageSource, 0, 0, width, height);

    // Calculate scale factors
    const sourceWidth = imageSource instanceof HTMLVideoElement 
      ? imageSource.videoWidth 
      : imageSource.width;
    const sourceHeight = imageSource instanceof HTMLVideoElement 
      ? imageSource.videoHeight 
      : imageSource.height;
    
    const scaleX = width / sourceWidth;
    const scaleY = height / sourceHeight;

    // Draw detections
    detections.forEach((det) => {
      const x = det.x * scaleX;
      const y = det.y * scaleY;
      const w = det.width * scaleX;
      const h = det.height * scaleY;
      const color = getClassColor(det.className);

      // Animated border effect
      const dashOffset = (animationFrame * 2) % 20;

      // Draw box with glow
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.lineDashOffset = dashOffset;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();

      // Draw solid corners
      const cornerLength = Math.min(20, w / 4, h / 4);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLength);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLength, y);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLength);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLength);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLength, y + h);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLength);
      ctx.stroke();

      // Draw label background
      const label = `${det.className} ${(det.confidence * 100).toFixed(1)}%`;
      ctx.font = 'bold 12px "IBM Plex Mono", monospace';
      const textMetrics = ctx.measureText(label);
      const labelHeight = 20;
      const labelWidth = textMetrics.width + 16;
      const labelX = x;
      const labelY = y - labelHeight - 4;

      ctx.fillStyle = color;
      ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

      // Draw label text
      ctx.fillStyle = '#000';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX + 8, labelY + labelHeight / 2);
    });
  }, [imageSource, detections, width, height, animationFrame]);

  useEffect(() => {
    drawDetections();
  }, [drawDetections]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
    />
  );
}
