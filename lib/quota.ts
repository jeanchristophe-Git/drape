import { prisma } from '@/lib/prisma';

export interface QuotaCheckResult {
  canUse: boolean;
  remaining: number | 'unlimited';
  plan: 'FREE' | 'PREMIUM';
  renewsAt?: Date;
  reason?: string;
}

export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error('User not found');

  // Vérifier si banni
  if (user.isBanned) {
    return {
      canUse: false,
      remaining: 0,
      plan: user.plan,
      reason: user.banReason || 'Account suspended'
    };
  }

  // ===== PREMIUM =====
  if (user.isPremium) {
    // Vérifier si abonnement encore actif
    const now = new Date();
    if (user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd < now) {
      // Abonnement expiré → Downgrade automatique
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          plan: 'FREE',
          freeUsed: 0, // Reset les 2 gratuits
          dailyUsed: 0
        }
      });

      return {
        canUse: true,
        remaining: 2,
        plan: 'FREE',
        reason: 'Subscription expired. You have 2 free try-ons again.'
      };
    }

    // Reset journalier (anti-abus)
    if (now > user.dailyResetAt) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyUsed: 0,
          dailyResetAt: new Date(now.setDate(now.getDate() + 1))
        }
      });
      user.dailyUsed = 0;
    }

    // Vérifier limite anti-abus (100/jour)
    if (user.dailyUsed >= 100) {
      return {
        canUse: false,
        remaining: 'unlimited',
        plan: 'PREMIUM',
        renewsAt: user.dailyResetAt,
        reason: 'Daily limit reached (100/day). Resets tomorrow.'
      };
    }

    return {
      canUse: true,
      remaining: 'unlimited',
      plan: 'PREMIUM',
      renewsAt: user.stripeCurrentPeriodEnd || undefined
    };
  }

  // ===== FREE =====
  const remaining = Math.max(0, 2 - user.freeUsed);
  const canUse = remaining > 0;

  return {
    canUse,
    remaining,
    plan: 'FREE',
    reason: canUse ? undefined : 'Free quota exhausted. Upgrade to Premium for unlimited try-ons.'
  };
}

export async function decrementQuota(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true }
  });

  if (!user) throw new Error('User not found');

  if (user.isPremium) {
    // Incrémenter compteur journalier
    await prisma.user.update({
      where: { id: userId },
      data: { dailyUsed: { increment: 1 } }
    });
  } else {
    // Incrémenter compteur gratuit
    await prisma.user.update({
      where: { id: userId },
      data: { freeUsed: { increment: 1 } }
    });
  }
}

export async function getUserQuota(userId: string): Promise<{
  used: number;
  limit: number | 'unlimited';
  plan: 'FREE' | 'PREMIUM';
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      plan: true,
      freeUsed: true,
      dailyUsed: true
    }
  });

  if (!user) throw new Error('User not found');

  if (user.isPremium) {
    return {
      used: user.dailyUsed,
      limit: 100,
      plan: 'PREMIUM'
    };
  }

  return {
    used: user.freeUsed,
    limit: 2,
    plan: 'FREE'
  };
}
