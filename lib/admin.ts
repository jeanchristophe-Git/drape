/**
 * ADMIN UTILITIES
 * Fonctions pour vérifier les permissions admin et logger les actions
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';

/**
 * Récupère l'utilisateur actuel depuis Supabase Auth
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // La méthode `setAll` a été appelée depuis un Server Component.
            // Cela peut être ignoré si vous avez un middleware qui rafraîchit les sessions utilisateur.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Récupérer les infos complètes depuis la DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isPremium: true,
      plan: true,
    },
  });

  return dbUser;
}

/**
 * Vérifie si l'utilisateur actuel est admin
 * Retourne l'utilisateur si admin, sinon redirect vers /
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  if (user.role !== 'ADMIN') {
    redirect('/'); // Redirect vers la home si pas admin
  }

  return user;
}

/**
 * Vérifie si l'utilisateur actuel est admin (sans redirect)
 * Retourne true/false
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}

/**
 * Logger une action admin dans la base de données
 */
export async function logAdminAction({
  adminId,
  action,
  targetType,
  targetId,
  metadata,
}: {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: any;
}) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });
}
