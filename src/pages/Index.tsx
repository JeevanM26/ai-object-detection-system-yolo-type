import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Rocket, Zap, Activity } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
      
      <div className="container relative z-10 flex flex-col items-center justify-center min-h-screen py-12 text-center">
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-24 w-24 text-primary neon-text" />
              <Activity className="absolute -bottom-2 -right-2 h-8 w-8 text-accent animate-pulse" />
            </div>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-wider neon-text">
            STATION SAFETY
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Mission-critical AI detection for space station safety equipment
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="xl" onClick={() => navigate('/auth')} className="font-display">
              <Rocket className="h-5 w-5 mr-2" />
              LAUNCH MISSION
            </Button>
            <Button size="xl" variant="neon" onClick={() => navigate('/auth')}>
              <Zap className="h-5 w-5 mr-2" />
              ACCESS SYSTEM
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-12 max-w-lg mx-auto text-sm">
            <div className="stat-card text-center">
              <p className="text-2xl font-display font-bold text-primary">1280px</p>
              <p className="text-xs text-muted-foreground">Resolution</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-display font-bold text-accent">7</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-display font-bold text-success">YOLOv8</p>
              <p className="text-xs text-muted-foreground">Model</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
