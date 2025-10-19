import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const tryOn = await prisma.tryOn.findUnique({
      where: { id },
    });

    if (!tryOn) {
      return NextResponse.json(
        { error: 'Try-on not found' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire
    if (tryOn.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tryOn
    });

  } catch (error: any) {
    console.error('Try-on status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
