'use client';

import { Badge } from '@/components/ui/badge';
import { useQuota } from '@/hooks/useQuota';
import { Loader2 } from 'lucide-react';

export function QuotaBadge() {
  const { quota, loading } = useQuota();

  if (loading) {
    return (
      <Badge variant="outline" className="gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </Badge>
    );
  }

  if (!quota) {
    return null;
  }

  const remainingText =
    quota.remaining === 'unlimited'
      ? 'Unlimited'
      : `${quota.remaining}/${quota.limit}`;

  const variant = quota.plan === 'PREMIUM' ? 'default' : 'secondary';

  return (
    <Badge variant={variant} className="gap-2">
      {quota.plan === 'PREMIUM' ? '⚡' : '🎁'} {remainingText} {quota.plan === 'PREMIUM' ? 'Premium' : 'Free'}
    </Badge>
  );
}
