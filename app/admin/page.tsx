/**
 * ADMIN DASHBOARD - PAGE PRINCIPALE
 * Vue d'ensemble des analytics et métriques clés
 */

import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Image, AlertCircle } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import RevenueChart from './components/RevenueChart';
import UsageChart from './components/UsageChart';

/**
 * Récupère les statistiques pour le dashboard
 */
async function getDashboardStats() {
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));

  // 1. STATS UTILISATEURS
  const totalUsers = await prisma.user.count();
  const premiumUsers = await prisma.user.count({
    where: { isPremium: true },
  });
  const usersThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });

  // 2. STATS TRY-ONS
  const totalTryOns = await prisma.tryOn.count();
  const tryOnsThisMonth = await prisma.tryOn.count({
    where: {
      createdAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });
  const successfulTryOns = await prisma.tryOn.count({
    where: {
      status: 'SUCCESS',
      createdAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });
  const successRate = tryOnsThisMonth > 0
    ? ((successfulTryOns / tryOnsThisMonth) * 100).toFixed(1)
    : '0';

  // 3. STATS FINANCIÈRES
  const paymentsThisMonth = await prisma.payment.findMany({
    where: {
      createdAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
      status: 'succeeded',
    },
  });
  const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

  // MRR = nombre de Premium users * 9.99
  const mrr = premiumUsers * 9.99;

  // Coût API total ce mois
  const tryOnsWithCost = await prisma.tryOn.findMany({
    where: {
      createdAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
      status: 'SUCCESS',
    },
    select: {
      aiCost: true,
    },
  });
  const apiCostThisMonth = tryOnsWithCost.reduce((sum, t) => sum + (t.aiCost || 0), 0);
  const netProfit = revenueThisMonth - apiCostThisMonth;

  // 4. GRAPHIQUES - Derniers 7 jours
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const revenueData = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const payments = await prisma.payment.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'succeeded',
        },
      });

      return {
        date: format(date, 'MMM dd'),
        revenue: payments.reduce((sum, p) => sum + p.amount, 0),
      };
    })
  );

  const usageData = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const tryOns = await prisma.tryOn.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      });

      return {
        date: format(date, 'MMM dd'),
        tryOns,
      };
    })
  );

  // 5. ALERTS
  const failedTryOns = await prisma.tryOn.count({
    where: {
      status: 'FAILED',
      createdAt: {
        gte: startOfThisMonth,
      },
    },
  });

  const pendingModeration = await prisma.moderationFlag.count({
    where: {
      status: 'PENDING',
    },
  });

  return {
    totalUsers,
    premiumUsers,
    usersThisMonth,
    totalTryOns,
    tryOnsThisMonth,
    successRate,
    revenueThisMonth,
    mrr,
    apiCostThisMonth,
    netProfit,
    revenueData,
    usageData,
    failedTryOns,
    pendingModeration,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500">Vue d'ensemble de votre SaaS DRAPE</p>
      </div>

      {/* Alerts */}
      {(stats.failedTryOns > 10 || stats.pendingModeration > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900">Alertes</p>
            <ul className="text-sm text-orange-700 mt-1 space-y-1">
              {stats.failedTryOns > 10 && (
                <li>• {stats.failedTryOns} try-ons échoués ce mois-ci</li>
              )}
              {stats.pendingModeration > 0 && (
                <li>• {stats.pendingModeration} contenus en attente de modération</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilisateurs
            </CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              +{stats.usersThisMonth} ce mois
            </p>
            <p className="text-xs text-primary font-medium mt-1">
              {stats.premiumUsers} Premium
            </p>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              MRR
            </CardTitle>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.mrr.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              ${stats.revenueThisMonth.toFixed(2)} ce mois
            </p>
          </CardContent>
        </Card>

        {/* Try-Ons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Try-Ons
            </CardTitle>
            <Image className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTryOns}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.tryOnsThisMonth} ce mois
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">
              {stats.successRate}% succès
            </p>
          </CardContent>
        </Card>

        {/* Profit Net */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profit Net
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Coût API: ${stats.apiCostThisMonth.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus (7 derniers jours)</CardTitle>
            <CardDescription>
              Évolution des revenus quotidiens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.revenueData} />
          </CardContent>
        </Card>

        {/* Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisation (7 derniers jours)</CardTitle>
            <CardDescription>
              Nombre de try-ons générés par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageChart data={stats.usageData} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Taux de conversion</p>
              <p className="text-xl font-bold">
                {stats.totalUsers > 0
                  ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenu moyen/user</p>
              <p className="text-xl font-bold">
                ${stats.totalUsers > 0
                  ? (stats.revenueThisMonth / stats.totalUsers).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Coût moyen/try-on</p>
              <p className="text-xl font-bold">
                ${stats.tryOnsThisMonth > 0
                  ? (stats.apiCostThisMonth / stats.tryOnsThisMonth).toFixed(3)
                  : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marge bénéficiaire</p>
              <p className="text-xl font-bold">
                {stats.revenueThisMonth > 0
                  ? ((stats.netProfit / stats.revenueThisMonth) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
