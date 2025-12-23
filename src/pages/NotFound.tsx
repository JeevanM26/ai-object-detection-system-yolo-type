import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg">
      <div className="text-center space-y-6">
        <AlertTriangle className="h-16 w-16 text-accent mx-auto" />
        <h1 className="font-display text-4xl font-bold neon-text">404</h1>
        <p className="text-muted-foreground">Sector not found in station database</p>
        <Button onClick={() => navigate('/')} className="font-display gap-2">
          <Home className="h-4 w-4" />
          Return to Base
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
