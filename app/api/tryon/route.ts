import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkQuota, decrementQuota } from '@/lib/quota';
import { generateVirtualTryOn, COST_PER_GENERATION } from '@/lib/ai/pixazo-vton';
import { uploadToSupabase } from '@/lib/supabase/storage';
import { addWatermark } from '@/lib/watermark';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 300; // 5 minutes max pour la génération IDM-VTON

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Rate limiting (30s cooldown)
    const { success: canProceed } = await rateLimit(user.id, {
      interval: 30000, // 30 secondes
      uniqueTokenPerInterval: 500
    });

    if (!canProceed) {
      return NextResponse.json(
        { error: 'Please wait 30 seconds between generations' },
        { status: 429 }
      );
    }

    // 3. Vérifier quota
    const quotaCheck = await checkQuota(user.id);

    if (!quotaCheck.canUse) {
      return NextResponse.json(
        {
          error: 'Quota exceeded',
          reason: quotaCheck.reason,
          remaining: quotaCheck.remaining,
          plan: quotaCheck.plan
        },
        { status: 403 }
      );
    }

    // 4. Parser les images
    const formData = await req.formData();
    const personImage = formData.get('personImage') as File;
    const clothImage = formData.get('clothImage') as File;

    if (!personImage || !clothImage) {
      return NextResponse.json(
        { error: 'Both images are required' },
        { status: 400 }
      );
    }

    // Valider taille des fichiers (max 10MB chacun)
    if (personImage.size > 10 * 1024 * 1024 || clothImage.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Images must be under 10MB' },
        { status: 400 }
      );
    }

    // 5. Upload vers Supabase Storage
    const [personUrl, clothUrl] = await Promise.all([
      uploadToSupabase(personImage, user.id, 'person'),
      uploadToSupabase(clothImage, user.id, 'cloth')
    ]);

    // 6. Récupérer infos user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isPremium: true, plan: true }
    });

    const resolution = dbUser?.isPremium ? '1024x1024' : '768x768';
    const hasWatermark = !dbUser?.isPremium;

    // 7. Créer l'enregistrement TryOn
    const tryOn = await prisma.tryOn.create({
      data: {
        userId: user.id,
        inputPhoto: personUrl,
        clothPhoto: clothUrl,
        status: 'PROCESSING',
        resolution,
        hasWatermark,
        aiProvider: 'pixazo-kolors-vton'
      }
    });

    // 8. Lancer génération IA (background process)
    (async () => {
      try {
        // Génération avec Pixazo Kolors Virtual Try-On (rapide et fiable)
        const result = await generateVirtualTryOn({
          personImageUrl: personUrl,
          clothImageUrl: clothUrl
        });

        let finalImageUrl = result.imageUrl;

        // Ajouter watermark si FREE
        if (hasWatermark) {
          const watermarkedImage = await addWatermark(result.imageUrl, 'DRAPE');
          // Convertir le base64 en Blob pour upload
          const base64Data = watermarkedImage.split(',')[1];
          const blob = Buffer.from(base64Data, 'base64');
          const file = new File([blob], 'watermarked.jpg', { type: 'image/jpeg' });
          finalImageUrl = await uploadToSupabase(file, user.id, 'result');
        } else {
          // Upload résultat final vers Supabase
          finalImageUrl = await uploadToSupabase(result.imageUrl, user.id, 'result');
        }

        // Update TryOn avec succès
        await prisma.tryOn.update({
          where: { id: tryOn.id },
          data: {
            resultPhoto: finalImageUrl,
            status: 'SUCCESS',
            processingTime: result.processingTime,
            aiCost: COST_PER_GENERATION
          }
        });

        // Décrémenter quota
        await decrementQuota(user.id);

        // Analytics
        await prisma.usage.create({
          data: {
            userId: user.id,
            action: 'tryon_success',
            metadata: {
              tryOnId: tryOn.id,
              plan: dbUser?.plan,
              resolution,
              processingTime: result.processingTime
            }
          }
        });

        // Auto-delete après 7j si FREE
        if (!dbUser?.isPremium) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          await prisma.tryOn.update({
            where: { id: tryOn.id },
            data: { expiresAt }
          });
        }

      } catch (error: any) {
        // Gestion d'erreur
        console.error('AI generation failed:', error);

        await prisma.tryOn.update({
          where: { id: tryOn.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message || 'AI generation failed'
          }
        });

        await prisma.usage.create({
          data: {
            userId: user.id,
            action: 'tryon_failed',
            metadata: {
              tryOnId: tryOn.id,
              error: error.message
            }
          }
        });
      }
    })();

    // 9. Retourner immédiatement
    return NextResponse.json({
      success: true,
      tryOnId: tryOn.id,
      status: 'processing',
      message: 'Generation started. Check status at /api/tryon/' + tryOn.id
    });

  } catch (error: any) {
    console.error('Try-on API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
