import { User, TryOn, Payment, Plan, Status } from '@prisma/client';

export type { User, TryOn, Payment, Plan, Status };

export interface UserWithSubscription extends User {
  isActive: boolean;
  daysUntilRenewal?: number;
}

export interface TryOnWithUser extends TryOn {
  user: User;
}

export interface QuotaInfo {
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
  plan: Plan;
  canUse: boolean;
  renewsAt?: Date;
}

export interface SubscriptionInfo {
  isPremium: boolean;
  plan: Plan;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  status?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;
