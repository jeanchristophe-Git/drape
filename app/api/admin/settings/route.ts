/**
 * API ROUTE - METTRE À JOUR LES PARAMÈTRES SYSTÈME
 * POST /api/admin/settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction } from '@/lib/admin';

export async function POST(req: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    const admin = await requireAdmin();

    // Récupérer les paramètres à mettre à jour
    const settings = await req.json();

    // Mettre à jour chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: JSON.stringify(value),
          updatedBy: admin.id,
        },
        create: {
          key,
          value: JSON.stringify(value),
          updatedBy: admin.id,
        },
      });

      // Logger l'action admin
      await logAdminAction({
        adminId: admin.id,
        action: 'updated_setting',
        targetType: 'SystemSetting',
        targetId: key,
        metadata: { newValue: value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
