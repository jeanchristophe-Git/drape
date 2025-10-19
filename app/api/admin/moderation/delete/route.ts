/**
 * API ROUTE - SUPPRIMER UN TRY-ON
 * POST /api/admin/moderation/delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const admin = await requireAdmin();

    // Récupérer les données
    const { tryOnId } = await req.json();

    if (!tryOnId) {
      return NextResponse.json(
        { error: 'tryOnId requis' },
        { status: 400 }
      );
    }

    // Supprimer le try-on
    // Note: les images dans Supabase Storage ne sont pas supprimées automatiquement
    // Vous pouvez ajouter une logique pour supprimer aussi les images
    await prisma.tryOn.delete({
      where: { id: tryOnId },
    });

    // Logger l'action admin
    await logAdminAction({
      adminId: admin.id,
      action: 'deleted_tryon',
      targetType: 'TryOn',
      targetId: tryOnId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting try-on:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
