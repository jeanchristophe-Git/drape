'use client';

import { TryOn } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TryOnCardProps {
  tryOn: TryOn;
}

export function TryOnCard({ tryOn }: TryOnCardProps) {
  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: 'Pending',
      variant: 'secondary' as const,
      className: '',
    },
    PROCESSING: {
      icon: Loader2,
      label: 'Processing',
      variant: 'default' as const,
      className: 'animate-spin',
    },
    SUCCESS: {
      icon: CheckCircle2,
      label: 'Success',
      variant: 'default' as const,
      className: '',
    },
    FAILED: {
      icon: XCircle,
      label: 'Failed',
      variant: 'destructive' as const,
      className: '',
    },
  };

  const status = statusConfig[tryOn.status];
  const StatusIcon = status.icon;

  return (
    <Link href={tryOn.status === 'SUCCESS' ? `/result/${tryOn.id}` : '#'}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex gap-2">
              <div className="relative w-20 h-24 rounded overflow-hidden bg-muted">
                <Image
                  src={tryOn.inputPhoto}
                  alt="Person"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative w-20 h-24 rounded overflow-hidden bg-muted">
                {tryOn.resultPhoto ? (
                  <Image
                    src={tryOn.resultPhoto}
                    alt="Result"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <StatusIcon className={cn("h-8 w-8 text-muted-foreground", status.className)} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className={cn("h-3 w-3", status.className)} />
                  {status.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(tryOn.createdAt)}
                </span>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span className="font-medium">{tryOn.resolution}</span>
                </div>
                {tryOn.processingTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Processing time:</span>
                    <span className="font-medium">{tryOn.processingTime}s</span>
                  </div>
                )}
              </div>

              {tryOn.status === 'FAILED' && tryOn.errorMessage && (
                <p className="text-xs text-destructive">{tryOn.errorMessage}</p>
              )}

              {tryOn.expiresAt && (
                <p className="text-xs text-amber-600">
                  Expires: {formatDateTime(tryOn.expiresAt)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Helper function
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
