import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            VERIFYING CREDENTIALS...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
