/**
 * ADMIN - MODÉRATION DE CONTENU
 * Voir et modérer les try-ons et gérer les signalements
 */

import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ModerationContent from './ModerationContent';

/**
 * Récupère les try-ons récents avec images
 */
async function getRecentTryOns() {
  const tryOns = await prisma.tryOn.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // 50 derniers try-ons
  });

  return tryOns;
}

/**
 * Récupère les signalements en attente
 */
async function getModerationFlags() {
  const flags = await prisma.moderationFlag.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return flags;
}

/**
 * Stats de modération
 */
async function getModerationStats() {
  const pendingFlags = await prisma.moderationFlag.count({
    where: { status: 'PENDING' },
  });

  const approvedFlags = await prisma.moderationFlag.count({
    where: { status: 'APPROVED' },
  });

  const removedFlags = await prisma.moderationFlag.count({
    where: { status: 'REMOVED' },
  });

  const failedTryOns = await prisma.tryOn.count({
    where: { status: 'FAILED' },
  });

  return {
    pendingFlags,
    approvedFlags,
    removedFlags,
    failedTryOns,
  };
}

export default async function AdminModerationPage() {
  const tryOns = await getRecentTryOns();
  const flags = await getModerationFlags();
  const stats = await getModerationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Modération de contenu</h1>
        <p className="text-gray-500">
          Gérer les try-ons et les signalements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Signalements en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingFlags}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approuvés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedFlags}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Supprimés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.removedFlags}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Try-ons échoués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.failedTryOns}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signalements en attente */}
      {flags.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">
              Signalements en attente ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flags.map(flag => (
                <div
                  key={flag.id}
                  className="bg-white p-4 rounded-lg border border-orange-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Try-on ID: {flag.tryOnId}</p>
                      <p className="text-sm text-gray-600">Raison: {flag.reason}</p>
                      {flag.reportedBy && (
                        <p className="text-xs text-gray-500">
                          Signalé par: {flag.reportedBy}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      En attente
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Try-ons récents */}
      <Card>
        <CardHeader>
          <CardTitle>Try-ons récents (50 derniers)</CardTitle>
        </CardHeader>
        <CardContent>
          <ModerationContent tryOns={tryOns} />
        </CardContent>
      </Card>
    </div>
  );
}
