/**
 * MODERATION CONTENT
 * Affichage et actions sur les try-ons
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Trash2, CheckCircle } from 'lucide-react';

interface TryOn {
  id: string;
  userId: string;
  inputPhoto: string;
  clothPhoto: string;
  resultPhoto: string | null;
  status: string;
  resolution: string;
  createdAt: Date;
  user: {
    email: string;
  };
}

interface ModerationContentProps {
  tryOns: TryOn[];
}

export default function ModerationContent({ tryOns }: ModerationContentProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');

  const filteredTryOns = tryOns.filter(tryOn => {
    if (filter === 'all') return true;
    return tryOn.status.toLowerCase() === filter;
  });

  const handleDeleteTryOn = async (tryOnId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce try-on ?')) return;

    try {
      const response = await fetch('/api/admin/moderation/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tryOnId }),
      });

      if (response.ok) {
        alert('Try-on supprimé avec succès');
        window.location.reload();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Tous
        </Button>
        <Button
          variant={filter === 'success' ? 'default' : 'outline'}
          onClick={() => setFilter('success')}
          size="sm"
        >
          Réussis
        </Button>
        <Button
          variant={filter === 'failed' ? 'default' : 'outline'}
          onClick={() => setFilter('failed')}
          size="sm"
        >
          Échoués
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          En cours
        </Button>
      </div>

      {/* Grid of Try-Ons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTryOns.map(tryOn => (
          <div
            key={tryOn.id}
            className="border rounded-lg p-4 space-y-3 bg-white hover:shadow-md transition-shadow"
          >
            {/* Images */}
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square relative rounded overflow-hidden bg-gray-100">
                <Image
                  src={tryOn.inputPhoto}
                  alt="Person"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Person
                </div>
              </div>
              <div className="aspect-square relative rounded overflow-hidden bg-gray-100">
                <Image
                  src={tryOn.clothPhoto}
                  alt="Garment"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Garment
                </div>
              </div>
              <div className="aspect-square relative rounded overflow-hidden bg-gray-100">
                {tryOn.resultPhoto ? (
                  <Image
                    src={tryOn.resultPhoto}
                    alt="Result"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No result
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Result
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    tryOn.status === 'SUCCESS'
                      ? 'default'
                      : tryOn.status === 'FAILED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {tryOn.status}
                </Badge>
                <span className="text-xs text-gray-500">{tryOn.resolution}</span>
              </div>

              <div className="text-sm">
                <p className="text-gray-600">User: {tryOn.user.email}</p>
                <p className="text-xs text-gray-500">
                  ID: {tryOn.id.substring(0, 8)}...
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeleteTryOn(tryOn.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTryOns.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Aucun try-on trouvé
        </div>
      )}

      <p className="text-sm text-gray-500">
        {filteredTryOns.length} try-on(s) affiché(s)
      </p>
    </div>
  );
}
