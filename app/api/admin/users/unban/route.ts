/**
 * API ROUTE - DÉBANNIR UN UTILISATEUR
 * POST /api/admin/users/unban
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const admin = await requireAdmin();

    // Récupérer les données
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // Débannir l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
      },
    });

    // Logger l'action admin
    await logAdminAction({
      adminId: admin.id,
      action: 'unbanned_user',
      targetType: 'User',
      targetId: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'Erreur lors du débannissement' },
      { status: 500 }
    );
  }
}
