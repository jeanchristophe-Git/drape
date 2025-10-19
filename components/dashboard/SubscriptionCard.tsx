'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, Crown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function SubscriptionCard() {
  const { user, loading, isPremium, subscriptionEnd } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to start checkout:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription</CardTitle>
          <Badge variant={isPremium ? 'default' : 'secondary'} className="gap-1">
            {isPremium && <Crown className="h-3 w-3" />}
            {user?.plan}
          </Badge>
        </div>
        <CardDescription>
          {isPremium
            ? 'You have unlimited access to all features'
            : 'Upgrade to unlock unlimited try-ons'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isPremium ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            {subscriptionEnd && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Renews on</span>
                <span className="font-medium">{formatDate(subscriptionEnd)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">$9.99/month</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Get unlimited virtual try-ons, high-resolution images, and no watermarks.
            </p>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Unlimited try-ons (100/day limit)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>High resolution (1024x1024)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>No watermarks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Unlimited history</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isPremium ? (
          <Button onClick={handleManageSubscription} variant="outline" className="w-full">
            Manage Subscription
          </Button>
        ) : (
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade to Premium - $9.99/month
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
