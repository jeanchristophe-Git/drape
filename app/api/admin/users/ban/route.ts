/**
 * API ROUTE - BANNIR UN UTILISATEUR
 * POST /api/admin/users/ban
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const admin = await requireAdmin();

    // Récupérer les données
    const { userId, reason } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'userId et reason requis' },
        { status: 400 }
      );
    }

    // Bannir l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
      },
    });

    // Logger l'action admin
    await logAdminAction({
      adminId: admin.id,
      action: 'banned_user',
      targetType: 'User',
      targetId: userId,
      metadata: { reason },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Erreur lors du bannissement' },
      { status: 500 }
    );
  }
}
