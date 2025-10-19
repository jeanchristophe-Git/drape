'use client';

import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LoadingAI() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simuler une progression sur 18 secondes (temps moyen IDM-VTON)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 180); // 18000ms / 100 = 180ms par %

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/10" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Generating your virtual try-on...</h3>
        <p className="text-sm text-muted-foreground">
          This usually takes around 18 seconds
        </p>
      </div>

      <div className="w-full max-w-md space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">{progress}%</p>
      </div>

      <div className="text-xs text-muted-foreground max-w-md text-center">
        Our AI is carefully fitting the clothing to match your body shape and pose.
        Please don't close this page.
      </div>
    </div>
  );
}
