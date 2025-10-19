/**
 * API ROUTE - DONNER DES CRÉDITS GRATUITS
 * POST /api/admin/users/credits
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const admin = await requireAdmin();

    // Récupérer les données
    const { userId, credits } = await req.json();

    if (!userId || typeof credits !== 'number') {
      return NextResponse.json(
        { error: 'userId et credits (number) requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Réinitialiser le compteur free pour donner des crédits
    // (on met freeUsed à 0 et on laisse la limite à 2 + credits)
    // Pour donner des crédits additionnels, on peut aussi créer un champ customCredits
    // Pour simplifier, on reset juste freeUsed à 0 pour redonner 2 crédits
    await prisma.user.update({
      where: { id: userId },
      data: {
        freeUsed: Math.max(0, user.freeUsed - credits),
      },
    });

    // Logger l'action admin
    await logAdminAction({
      adminId: admin.id,
      action: 'gave_credits',
      targetType: 'User',
      targetId: userId,
      metadata: { credits },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error giving credits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de crédits' },
      { status: 500 }
    );
  }
}
