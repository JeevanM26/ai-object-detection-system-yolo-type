import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetectionCanvas } from '@/components/DetectionCanvas';
import { SafetyLog } from '@/components/SafetyLog';
import { InferenceMetrics } from '@/components/InferenceMetrics';
import { loadModel, runInference, isModelLoaded, Detection } from '@/lib/onnxInference';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut, Camera, Upload, Activity, Cpu, Play, Square, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [allDetections, setAllDetections] = useState<Detection[]>([]);
  const [metrics, setMetrics] = useState({ inference: 0, preprocess: 0, postprocess: 0, fps: 0 });
  const [imageSource, setImageSource] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    loadModel('/best.onnx').then(success => {
      setModelLoaded(success);
      if (!success) {
        toast({ title: 'Model Loading', description: 'Place best.onnx in /public folder', variant: 'destructive' });
      }
    });
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setImageSource(videoRef.current);
        setCanvasSize({ width: videoRef.current.videoWidth, height: videoRef.current.videoHeight });
      }
    } catch (err) {
      toast({ title: 'Camera Error', description: 'Could not access webcam', variant: 'destructive' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => { setImageSource(img); setCanvasSize({ width: img.width, height: img.height }); };
      img.src = URL.createObjectURL(file);
    }
  };

  const runDetectionLoop = useCallback(async () => {
    if (!isModelLoaded() || !imageSource) return;
    const now = performance.now();
    try {
      const result = await runInference(imageSource);
      setDetections(result.detections);
      setAllDetections(prev => [...result.detections, ...prev].slice(0, 100));
      const fps = 1000 / (now - lastTimeRef.current);
      setMetrics({ inference: result.inferenceTimeMs, preprocess: result.preprocessTimeMs, postprocess: result.postprocessTimeMs, fps: lastTimeRef.current ? fps : 0 });
      lastTimeRef.current = now;
    } catch (err) { console.error(err); }
    if (isRunning) animationRef.current = requestAnimationFrame(runDetectionLoop);
  }, [imageSource, isRunning]);

  useEffect(() => { if (isRunning && imageSource) runDetectionLoop(); }, [isRunning, imageSource, runDetectionLoop]);

  const toggleDetection = () => {
    if (isRunning) { setIsRunning(false); if (animationRef.current) cancelAnimationFrame(animationRef.current); }
    else { setIsRunning(true); lastTimeRef.current = 0; }
  };

  return (
    <div className="min-h-screen grid-bg">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary neon-text" />
            <h1 className="font-display text-xl font-bold tracking-wider hidden sm:block">STATION SAFETY</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="detection" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="detection" className="gap-2"><Activity className="h-4 w-4" />Detection</TabsTrigger>
            <TabsTrigger value="health" className="gap-2"><Cpu className="h-4 w-4" />System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={startWebcam} variant="outline"><Camera className="h-4 w-4 mr-2" />Webcam</Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline"><Upload className="h-4 w-4 mr-2" />Upload</Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button onClick={toggleDetection} disabled={!imageSource || !modelLoaded} variant={isRunning ? 'destructive' : 'default'}>
                {isRunning ? <><Square className="h-4 w-4 mr-2" />Stop</> : <><Play className="h-4 w-4 mr-2" />Start</>}
              </Button>
              <Button onClick={() => setAllDetections([])} variant="secondary"><RefreshCw className="h-4 w-4 mr-2" />Clear Log</Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-panel p-4 neon-border relative overflow-hidden">
                  <video ref={videoRef} className="hidden" playsInline muted />
                  {imageSource ? (
                    <DetectionCanvas imageSource={imageSource} detections={detections} width={Math.min(canvasSize.width, 800)} height={Math.min(canvasSize.height, 600)} />
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-secondary/50 rounded-lg">
                      <p className="text-muted-foreground font-mono">Select input source</p>
                    </div>
                  )}
                </div>
                <InferenceMetrics inferenceTime={metrics.inference} preprocessTime={metrics.preprocess} postprocessTime={metrics.postprocess} fps={metrics.fps} detectionsCount={detections.length} modelLoaded={modelLoaded} />
              </div>
              <div className="h-[600px]"><SafetyLog detections={allDetections} /></div>
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="glass-panel p-8 neon-border max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold mb-6 neon-text">THE FALCON LOOP</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">This AI is powered by <span className="text-accent font-semibold">Duality AI's Falcon</span>. If a new safety item is added to the station, we import its 3D twin into Falcon to generate 1,000+ synthetic training images, updating the model without needing real photos.</p>
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div className="stat-card"><p className="text-3xl font-display font-bold text-primary">1,000+</p><p className="text-xs text-muted-foreground">Synthetic Images</p></div>
                <div className="stat-card"><p className="text-3xl font-display font-bold text-accent">7</p><p className="text-xs text-muted-foreground">Safety Classes</p></div>
                <div className="stat-card"><p className="text-3xl font-display font-bold text-success">1280px</p><p className="text-xs text-muted-foreground">Resolution</p></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
