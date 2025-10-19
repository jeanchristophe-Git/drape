import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: {
            tryOns: true,
            payments: true
          }
        }
      }
    });

    if (!dbUser) {
      // Créer l'utilisateur s'il n'existe pas encore
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0],
          image: user.user_metadata?.avatar_url,
        },
        include: {
          _count: {
            select: {
              tryOns: true,
              payments: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: newUser
      });
    }

    return NextResponse.json({
      success: true,
      data: dbUser
    });

  } catch (error: any) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, image } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error: any) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
