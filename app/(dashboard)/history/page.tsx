'use client';

import { useEffect, useState } from 'react';
import { TryOn } from '@prisma/client';
import { TryOnCard } from '@/components/dashboard/TryOnCard';
import { Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const [tryOns, setTryOns] = useState<TryOn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();

        // This would need a separate API route for fetching try-ons
        // For now, this is a placeholder
        setTryOns([]);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">History</h1>
        <p className="text-muted-foreground">
          View all your previous virtual try-ons
        </p>
      </div>

      {tryOns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No try-ons yet. Start by creating your first virtual try-on!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tryOns.map((tryOn) => (
            <TryOnCard key={tryOn.id} tryOn={tryOn} />
          ))}
        </div>
      )}
    </div>
  );
}
