/**
 * ADMIN - GESTION DES UTILISATEURS
 * Liste tous les utilisateurs avec actions (bannir, donner crédits, etc.)
 */

import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import UsersTable from './UsersTable';

/**
 * Récupère tous les utilisateurs avec leurs stats
 */
async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          tryOns: true,
          payments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name || 'N/A',
    plan: user.plan,
    isPremium: user.isPremium,
    isBanned: user.isBanned,
    banReason: user.banReason,
    freeUsed: user.freeUsed,
    tryOnsCount: user._count.tryOns,
    paymentsCount: user._count.payments,
    createdAt: format(user.createdAt, 'dd MMM yyyy', { locale: fr }),
    premiumSince: user.premiumSince
      ? format(user.premiumSince, 'dd MMM yyyy', { locale: fr })
      : null,
  }));
}

async function getUserStats() {
  const totalUsers = await prisma.user.count();
  const premiumUsers = await prisma.user.count({
    where: { isPremium: true },
  });
  const bannedUsers = await prisma.user.count({
    where: { isBanned: true },
  });

  return { totalUsers, premiumUsers, bannedUsers };
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  const stats = await getUserStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-gray-500">Liste complète de tous les utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.premiumUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bannis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.bannedUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
