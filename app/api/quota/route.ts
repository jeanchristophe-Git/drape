import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkQuota, getUserQuota } from '@/lib/quota';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier la connexion Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - No user found' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id, user.email);

    // 2. Tester la connexion Prisma
    try {
      await prisma.$connect();
      console.log('Prisma connected successfully');
    } catch (prismaError: any) {
      console.error('Prisma connection error:', prismaError);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: prismaError.message,
          dbUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        },
        { status: 500 }
      );
    }

    // 3. Créer ou mettre à jour l'utilisateur dans Prisma
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          image: user.user_metadata?.avatar_url,
        },
        create: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          image: user.user_metadata?.avatar_url,
        },
      });
      console.log('User upserted successfully');
    } catch (upsertError: any) {
      console.error('User upsert error:', upsertError);
      return NextResponse.json(
        {
          error: 'Failed to create/update user',
          details: upsertError.message
        },
        { status: 500 }
      );
    }

    // 4. Vérifier le quota
    let quotaCheck, quotaInfo;
    try {
      [quotaCheck, quotaInfo] = await Promise.all([
        checkQuota(user.id),
        getUserQuota(user.id)
      ]);
      console.log('Quota checked:', quotaCheck);
    } catch (quotaError: any) {
      console.error('Quota check error:', quotaError);
      return NextResponse.json(
        {
          error: 'Failed to check quota',
          details: quotaError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        canUse: quotaCheck.canUse,
        remaining: quotaCheck.remaining,
        plan: quotaCheck.plan,
        used: quotaInfo.used,
        limit: quotaInfo.limit,
        renewsAt: quotaCheck.renewsAt,
        reason: quotaCheck.reason
      }
    });

  } catch (error: any) {
    console.error('Quota API unexpected error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        stack: error.stack,
        name: error.name
      },
      { status: 500 }
    );
  }
}
