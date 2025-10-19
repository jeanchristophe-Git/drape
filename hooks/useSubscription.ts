import { useState, useEffect } from 'react';
import { User } from '@prisma/client';

// Type pour l'utilisateur avec les counts
type UserWithCounts = User & {
  _count?: {
    tryOns: number;
    payments: number;
  };
};

export function useSubscription() {
  const [user, setUser] = useState<UserWithCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isPremium = user?.isPremium || false;
  const plan = user?.plan || 'FREE';
  const subscriptionEnd = user?.stripeCurrentPeriodEnd
    ? new Date(user.stripeCurrentPeriodEnd)
    : null;

  return {
    user,
    loading,
    error,
    isPremium,
    plan,
    subscriptionEnd,
    refresh: fetchUser,
  };
}
