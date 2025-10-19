/**
 * API ROUTE - EXPORT LOGS ADMIN CSV
 * GET /api/admin/export/admin-logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    // Récupérer tous les logs admin
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limite à 1000 derniers logs
    });

    // Générer le CSV
    const headers = [
      'ID',
      'Admin ID',
      'Action',
      'Target Type',
      'Target ID',
      'Metadata',
      'Created At',
    ];

    const rows = logs.map(log => [
      log.id,
      log.adminId,
      log.action,
      log.targetType || '',
      log.targetId || '',
      JSON.stringify(log.metadata || {}),
      log.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="admin-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting admin logs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
