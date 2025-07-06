import React, { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";

interface FallbackUIProps {
  error?: Error | null;
  resetError?: () => void;
  message?: string;
  isLoading?: boolean;
}

/**
 * FallbackUI Component
 * 
 * A fallback UI component that displays when the main UI fails to load,
 * showing appropriate error messages or loading indicators.
 */
const FallbackUI: React.FC<FallbackUIProps> = ({ 
  error = null, 
  resetError, 
  message = "Loading Melani OS...", 
  isLoading = false 
}) => {
  const [countdown, setCountdown] = useState<number>(0);
  
  // Auto-retry countdown if there's an error
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (error && resetError) {
      setCountdown(10);
      
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            resetError();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [error, resetError]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="space-y-6 max-w-md">
        {/* Logo */}
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">M</span>
        </div>
        
        {/* Status Message */}
        <h1 className="text-2xl font-semibold tracking-tight">
          {error ? 'Something went wrong' : message}
        </h1>
        
        {/* Loading indicator or error details */}
        <div className="space-y-4">
          {isLoading && !error && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-md text-sm text-destructive">
                <p className="font-medium">Error Details:</p>
                <p className="font-mono text-xs overflow-auto max-h-32 mt-2">
                  {error.message || 'Unknown error occurred'}
                </p>
              </div>
              
              {resetError && (
                <div className="space-y-2">
                  <button
                    onClick={resetError}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {countdown > 0 ? `Retrying in ${countdown}s...` : 'Retry Now'}
                  </button>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    You can try refreshing the page if the problem persists.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-xs text-muted-foreground">
        <p>Melani OS &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default FallbackUI;
