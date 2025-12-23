import { Cpu, Monitor, Gauge, Activity, Zap, Database } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
}

function MetricCard({ icon, label, value, unit, status = 'normal' }: MetricCardProps) {
  const statusColors = {
    normal: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3">
        <div className={`${statusColors[status]}`}>{icon}</div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-xl font-display font-bold">
            {value}
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

interface InferenceMetricsProps {
  inferenceTime: number;
  preprocessTime: number;
  postprocessTime: number;
  fps: number;
  detectionsCount: number;
  modelLoaded: boolean;
}

export function InferenceMetrics({
  inferenceTime,
  preprocessTime,
  postprocessTime,
  fps,
  detectionsCount,
  modelLoaded,
}: InferenceMetricsProps) {
  const totalTime = preprocessTime + inferenceTime + postprocessTime;
  
  const getTimeStatus = (time: number) => {
    if (time < 100) return 'normal';
    if (time < 200) return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">SYSTEM METRICS</h3>
        <div className={`ml-auto flex items-center gap-2 ${modelLoaded ? 'text-success' : 'text-warning'}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${modelLoaded ? 'bg-success' : 'bg-warning'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${modelLoaded ? 'bg-success' : 'bg-warning'}`}></span>
          </span>
          <span className="text-xs font-mono uppercase">
            {modelLoaded ? 'MODEL ACTIVE' : 'LOADING...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Inference Speed"
          value={inferenceTime.toFixed(1)}
          unit="ms"
          status={getTimeStatus(inferenceTime)}
        />
        <MetricCard
          icon={<Cpu className="h-5 w-5" />}
          label="Total Processing"
          value={totalTime.toFixed(1)}
          unit="ms"
          status={getTimeStatus(totalTime)}
        />
        <MetricCard
          icon={<Monitor className="h-5 w-5" />}
          label="Resolution"
          value="1280"
          unit="px"
          status="normal"
        />
        <MetricCard
          icon={<Gauge className="h-5 w-5" />}
          label="Frame Rate"
          value={fps.toFixed(1)}
          unit="fps"
          status={fps > 5 ? 'normal' : fps > 2 ? 'warning' : 'critical'}
        />
        <MetricCard
          icon={<Activity className="h-5 w-5" />}
          label="Detections"
          value={detectionsCount}
          status={detectionsCount > 10 ? 'warning' : 'normal'}
        />
        <MetricCard
          icon={<Database className="h-5 w-5" />}
          label="Model"
          value="YOLOv8n"
          status="normal"
        />
      </div>

      {/* Performance bar */}
      <div className="glass-panel p-4 mt-4">
        <p className="text-xs text-muted-foreground mb-2 font-mono">PROCESSING BREAKDOWN</p>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
          <div 
            className="bg-primary transition-all duration-300" 
            style={{ width: `${(preprocessTime / totalTime) * 100}%` }}
            title={`Preprocess: ${preprocessTime.toFixed(1)}ms`}
          />
          <div 
            className="bg-accent transition-all duration-300" 
            style={{ width: `${(inferenceTime / totalTime) * 100}%` }}
            title={`Inference: ${inferenceTime.toFixed(1)}ms`}
          />
          <div 
            className="bg-success transition-all duration-300" 
            style={{ width: `${(postprocessTime / totalTime) * 100}%` }}
            title={`Postprocess: ${postprocessTime.toFixed(1)}ms`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-mono">
          <span className="text-primary">Preprocess</span>
          <span className="text-accent">Inference</span>
          <span className="text-success">Postprocess</span>
        </div>
      </div>
    </div>
  );
}
