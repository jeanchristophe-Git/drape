'use client';

import { useEffect, useState } from 'react';
import { TryOn } from '@prisma/client';
import { ResultViewer } from '@/components/dashboard/ResultViewer';
import { LoadingAI } from '@/components/dashboard/LoadingAI';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tryOn, setTryOn] = useState<TryOn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchTryOn = async () => {
      try {
        const response = await fetch(`/api/tryon/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch try-on');
        }

        setTryOn(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTryOn();
  }, [id]);

  if (loading) {
    return <LoadingAI />;
  }

  if (error || !tryOn) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-destructive mb-4">{error || 'Try-on not found'}</p>
        <Button onClick={() => router.push('/history')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
      </div>
    );
  }

  if (tryOn.status === 'PROCESSING' || tryOn.status === 'PENDING') {
    return <LoadingAI />;
  }

  if (tryOn.status === 'FAILED') {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-destructive mb-4">
          Generation failed: {tryOn.errorMessage || 'Unknown error'}
        </p>
        <Button onClick={() => router.push('/tryon')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.push('/history')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to History
      </Button>

      {tryOn.resultPhoto && (
        <ResultViewer
          beforeImage={tryOn.inputPhoto}
          afterImage={tryOn.resultPhoto}
          hasWatermark={tryOn.hasWatermark}
        />
      )}
    </div>
  );
}
