import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkQuota, getUserQuota } from '@/lib/quota';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [quotaCheck, quotaInfo] = await Promise.all([
      checkQuota(user.id),
      getUserQuota(user.id)
    ]);

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
    console.error('Quota API error:', error);
    // En dev, retourner plus de détails pour debugging
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
