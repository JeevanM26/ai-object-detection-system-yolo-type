import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Cpu, Database, Sparkles, Box } from 'lucide-react';

export default function SystemHealth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid-bg">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary neon-text" />
            <h1 className="font-display text-xl font-bold tracking-wider">SYSTEM HEALTH</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-panel p-8 neon-border text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-accent animate-pulse" />
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 neon-text">THE FALCON LOOP</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              This AI is powered by <span className="text-accent font-semibold">Duality AI's Falcon</span>. 
              If a new safety item is added to the station, we import its 3D twin into Falcon to generate 
              <span className="text-primary font-semibold"> 1,000+ synthetic training images</span>, 
              updating the model without needing real photos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card text-center">
              <Cpu className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-display font-bold text-primary">i5</p>
              <p className="text-xs text-muted-foreground mt-1">Optimized Hardware</p>
            </div>
            <div className="stat-card text-center">
              <Box className="h-8 w-8 mx-auto mb-3 text-accent" />
              <p className="text-3xl font-display font-bold text-accent">1,000+</p>
              <p className="text-xs text-muted-foreground mt-1">Synthetic Images</p>
            </div>
            <div className="stat-card text-center">
              <Database className="h-8 w-8 mx-auto mb-3" style={{ color: 'hsl(145 80% 45%)' }} />
              <p className="text-3xl font-display font-bold" style={{ color: 'hsl(145 80% 45%)' }}>7</p>
              <p className="text-xs text-muted-foreground mt-1">Safety Classes</p>
            </div>
            <div className="stat-card text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="text-3xl font-display font-bold text-primary">1280px</p>
              <p className="text-xs text-muted-foreground mt-1">Resolution</p>
            </div>
          </div>

          <div className="glass-panel p-6 neon-border">
            <h3 className="font-display text-xl font-bold mb-4 text-accent">Detected Classes</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { name: 'OxygenTank', color: 'hsl(185 100% 50%)' },
                { name: 'NitrogenTank', color: 'hsl(145 80% 50%)' },
                { name: 'FirstAidBox', color: 'hsl(25 100% 55%)' },
                { name: 'FireAlarm', color: 'hsl(0 85% 55%)' },
                { name: 'SafetySwitchPanel', color: 'hsl(45 100% 55%)' },
                { name: 'EmergencyPhone', color: 'hsl(280 80% 60%)' },
                { name: 'FireExtinguisher', color: 'hsl(340 100% 55%)' },
              ].map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-2 p-2 rounded bg-secondary/50 border border-border"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  />
                  <span className="text-sm font-mono">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/dashboard')} className="font-display gap-2">
              <Cpu className="h-5 w-5" />
              GO TO DETECTION
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
