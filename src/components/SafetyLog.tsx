import { Detection } from '@/lib/onnxInference';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SafetyLogProps {
  detections: Detection[];
  maxItems?: number;
}

export function SafetyLog({ detections, maxItems = 50 }: SafetyLogProps) {
  const sortedDetections = [...detections]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'HIGH', variant: 'success' as const };
    if (confidence >= 0.5) return { label: 'MED', variant: 'warning' as const };
    return { label: 'LOW', variant: 'destructive' as const };
  };

  const formatTime = (date: Date) => {
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + ms;
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <h3 className="font-display text-lg font-semibold">SAFETY LOG</h3>
        </div>
        <Badge variant="outline" className="font-mono">
          {sortedDetections.length} ENTRIES
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        {sortedDetections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-3 text-success/50" />
            <p className="font-mono text-sm">No hazards detected</p>
            <p className="text-xs mt-1">System monitoring active</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-display">TIMESTAMP</TableHead>
                <TableHead className="text-xs font-display">HAZARD TYPE</TableHead>
                <TableHead className="text-xs font-display text-right">CONFIDENCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDetections.map((det, index) => {
                const confLevel = getConfidenceLevel(det.confidence);
                return (
                  <TableRow 
                    key={`${det.id}-${index}`}
                    className="hover:bg-primary/5 border-border animate-fade-in"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatTime(det.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">{det.className}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={confLevel.variant === 'success' ? 'default' : confLevel.variant === 'warning' ? 'secondary' : 'destructive'}
                        className={`font-mono text-xs ${
                          confLevel.variant === 'success' ? 'bg-success text-success-foreground' : 
                          confLevel.variant === 'warning' ? 'bg-warning text-warning-foreground' : ''
                        }`}
                      >
                        {(det.confidence * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}
