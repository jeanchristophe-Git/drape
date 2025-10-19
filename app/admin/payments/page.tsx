/**
 * ADMIN - GESTION DES PAIEMENTS
 * Liste tous les paiements et abonnements
 */

import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Récupère tous les paiements
 */
async function getPayments() {
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100, // Limite à 100 derniers paiements
  });

  return payments.map(payment => ({
    id: payment.id,
    userEmail: payment.user.email,
    userName: payment.user.name || 'N/A',
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    billingReason: payment.billingReason || 'N/A',
    stripePaymentId: payment.stripePaymentId,
    createdAt: format(payment.createdAt, 'dd MMM yyyy HH:mm', { locale: fr }),
  }));
}

/**
 * Récupère les stats de paiements
 */
async function getPaymentStats() {
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);

  // Total revenus all time
  const allPayments = await prisma.payment.findMany({
    where: { status: 'succeeded' },
  });
  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

  // Revenus ce mois
  const thisMonthPayments = await prisma.payment.findMany({
    where: {
      status: 'succeeded',
      createdAt: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });
  const monthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Nombre de paiements réussis
  const successfulPayments = await prisma.payment.count({
    where: { status: 'succeeded' },
  });

  // Nombre de paiements échoués
  const failedPayments = await prisma.payment.count({
    where: { status: 'failed' },
  });

  return {
    totalRevenue,
    monthRevenue,
    successfulPayments,
    failedPayments,
    totalPayments: allPayments.length,
  };
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments();
  const stats = await getPaymentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des paiements</h1>
        <p className="text-gray-500">Historique et statistiques des paiements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenus totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats.monthRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paiements réussis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulPayments}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paiements échoués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failedPayments}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers paiements (100)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Stripe ID</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.userEmail}</p>
                          <p className="text-sm text-gray-500">{payment.userName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'succeeded'
                              ? 'default'
                              : payment.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.billingReason}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {payment.stripePaymentId.substring(0, 20)}...
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {payment.createdAt}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
