'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadZone } from '@/components/dashboard/UploadZone';
import { LoadingAI } from '@/components/dashboard/LoadingAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTryOn } from '@/hooks/useTryOn';
import { useQuota } from '@/hooks/useQuota';
import { Sparkles } from 'lucide-react';

export default function TryOnPage() {
  const router = useRouter();
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothImage, setClothImage] = useState<File | null>(null);
  const { loading, error, generateTryOn } = useTryOn();
  const { quota, refresh: refreshQuota } = useQuota();

  const canGenerate = personImage && clothImage && !loading;

  const handleGenerate = async () => {
    if (!personImage || !clothImage) return;

    try {
      await generateTryOn(personImage, clothImage);
      // Refresh quota after generation
      await refreshQuota();
      // Redirect to result page will be handled by useTryOn hook
      // For now, just show success message or redirect
      router.push('/history');
    } catch (err) {
      // Error is handled in useTryOn hook
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingAI />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Virtual Try-On</h1>
        <p className="text-muted-foreground">
          Upload your photo and a clothing item to see how it looks on you
        </p>
      </div>

      {quota && !quota.canUse && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">{quota.reason}</p>
            {quota.plan === 'FREE' && (
              <Button className="mt-4" onClick={() => router.push('/settings')}>
                Upgrade to Premium
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <UploadZone
          label="Your Photo"
          onFileSelect={setPersonImage}
          currentFile={personImage}
        />
        <UploadZone
          label="Clothing Item"
          onFileSelect={setClothImage}
          currentFile={clothImage}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Our AI will analyze your photo and apply the clothing to match your pose and body shape
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li>1. Upload a clear photo of yourself (full body recommended)</li>
            <li>2. Upload an image of the clothing item you want to try on</li>
            <li>3. Click "Generate" and wait ~30-40 seconds for the AI to work its magic</li>
            <li>4. View your result with a before/after comparison slider</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={!canGenerate || !quota?.canUse}
          className="gap-2"
        >
          <Sparkles className="h-5 w-5" />
          Generate Virtual Try-On
        </Button>
      </div>
    </div>
  );
}
