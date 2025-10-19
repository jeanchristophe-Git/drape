'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ResultViewerProps {
  beforeImage: string;
  afterImage: string;
  hasWatermark?: boolean;
}

export function ResultViewer({ beforeImage, afterImage, hasWatermark }: ResultViewerProps) {
  const [sliderValue, setSliderValue] = useState([50]);

  const handleDownload = async () => {
    try {
      const response = await fetch(afterImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drape-tryon-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Virtual Try-On Result</h3>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Before/After Comparison */}
          <div className="relative aspect-[3/4] max-h-[600px] mx-auto overflow-hidden rounded-lg bg-muted">
            {/* Before Image */}
            <div className="absolute inset-0">
              <Image
                src={beforeImage}
                alt="Before"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* After Image avec clip-path */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)`,
              }}
            >
              <Image
                src={afterImage}
                alt="After"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Ligne de séparation */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
              style={{ left: `${sliderValue[0]}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="w-1 h-4 bg-gray-400 rounded" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
              Before
            </div>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
              After
            </div>
          </div>

          {/* Slider */}
          <div className="px-4">
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Original</span>
              <span>With Clothing</span>
            </div>
          </div>

          {hasWatermark && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
              <p className="text-amber-900 dark:text-amber-100">
                This image has a watermark. Upgrade to Premium for watermark-free, high-resolution downloads.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
