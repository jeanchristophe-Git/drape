import { useState, useEffect } from 'react';

interface QuotaData {
  canUse: boolean;
  remaining: number | 'unlimited';
  plan: 'FREE' | 'PREMIUM';
  used: number;
  limit: number | 'unlimited';
  renewsAt?: Date;
  reason?: string;
}

export function useQuota() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching quota from /api/quota...');
      const response = await fetch('/api/quota');

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Quota API error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to fetch quota');
      }

      const data = await response.json();
      console.log('✅ Quota data received:', data);
      setQuota(data.data);
      setError(null);
    } catch (err) {
      console.error('💥 Quota fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  return {
    quota,
    loading,
    error,
    refresh: fetchQuota,
  };
}
