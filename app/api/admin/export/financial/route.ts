/**
 * API ROUTE - EXPORT RAPPORT FINANCIER CSV
 * GET /api/admin/export/financial
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    // Récupérer les paiements par mois
    const payments = await prisma.payment.findMany({
      where: { status: 'succeeded' },
      orderBy: { createdAt: 'desc' },
    });

    // Récupérer les try-ons par mois
    const tryOns = await prisma.tryOn.findMany({
      where: { status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
    });

    // Grouper par mois
    const monthlyData: Record<string, {
      revenue: number;
      apiCost: number;
      tryOns: number;
    }> = {};

    payments.forEach(payment => {
      const month = format(payment.createdAt, 'yyyy-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, apiCost: 0, tryOns: 0 };
      }
      monthlyData[month].revenue += payment.amount;
    });

    tryOns.forEach(tryOn => {
      const month = format(tryOn.createdAt, 'yyyy-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, apiCost: 0, tryOns: 0 };
      }
      monthlyData[month].apiCost += tryOn.aiCost || 0;
      monthlyData[month].tryOns += 1;
    });

    // Générer le CSV
    const headers = [
      'Month',
      'Revenue (USD)',
      'API Cost (USD)',
      'Net Profit (USD)',
      'Margin (%)',
      'Try-Ons Count',
    ];

    const rows = Object.entries(monthlyData)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => {
        const netProfit = data.revenue - data.apiCost;
        const margin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;

        return [
          month,
          data.revenue.toFixed(2),
          data.apiCost.toFixed(2),
          netProfit.toFixed(2),
          margin.toFixed(1),
          data.tryOns,
        ];
      });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="financial-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting financial report:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
