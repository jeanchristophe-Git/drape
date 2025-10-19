/**
 * API ROUTE - EXPORT UTILISATEURS CSV
 * GET /api/admin/export/users
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Générer le CSV
    const headers = [
      'ID',
      'Email',
      'Name',
      'Plan',
      'Is Premium',
      'Free Used',
      'Is Banned',
      'Ban Reason',
      'Created At',
      'Premium Since',
    ];

    const rows = users.map(user => [
      user.id,
      user.email,
      user.name || '',
      user.plan,
      user.isPremium,
      user.freeUsed,
      user.isBanned,
      user.banReason || '',
      user.createdAt.toISOString(),
      user.premiumSince?.toISOString() || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
