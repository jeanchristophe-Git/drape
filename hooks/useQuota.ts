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
      const response = await fetch('/api/quota');

      if (!response.ok) {
        throw new Error('Failed to fetch quota');
      }

      const data = await response.json();
      setQuota(data.data);
      setError(null);
    } catch (err) {
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
