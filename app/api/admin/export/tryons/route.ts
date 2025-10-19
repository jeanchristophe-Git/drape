/**
 * API ROUTE - EXPORT TRY-ONS CSV
 * GET /api/admin/export/tryons
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    // Récupérer tous les try-ons
    const tryOns = await prisma.tryOn.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Générer le CSV
    const headers = [
      'ID',
      'User Email',
      'Status',
      'Resolution',
      'Has Watermark',
      'AI Provider',
      'AI Cost',
      'Processing Time (s)',
      'Error Message',
      'Created At',
    ];

    const rows = tryOns.map(tryOn => [
      tryOn.id,
      tryOn.user.email,
      tryOn.status,
      tryOn.resolution,
      tryOn.hasWatermark,
      tryOn.aiProvider || '',
      tryOn.aiCost || '',
      tryOn.processingTime || '',
      tryOn.errorMessage || '',
      tryOn.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tryons-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting try-ons:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
