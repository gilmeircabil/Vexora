import { Types } from 'mongoose';
import { CreditAccount, type ICreditAccount } from '../models/CreditAccount.js';
import { CreditTransaction, type ICreditTransaction } from '../models/CreditTransaction.js';
import { AIToolConfig } from '../models/AIToolConfig.js';
import { DEFAULT_TOOL_COSTS, type PlanTier, PLANS_CONFIG } from '../config/plans.js';

export function getUtcMidnight(date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export interface CreditBalanceInfo {
  dailyAllowance: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyAllowance: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  reservedCredits: number;
  totalAvailable: number;
  nextDailyResetUtc: Date;
}

export class CreditService {
  /**
   * Initializes or fetches a user's credit account, performing daily UTC reset if needed.
   */
  static async getOrCreateAccount(userId: string | Types.ObjectId): Promise<ICreditAccount> {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    let account = await CreditAccount.findOne({ userId: uid });

    if (!account) {
      const todayMidnight = getUtcMidnight();
      account = await CreditAccount.create({
        userId: uid,
        dailyAllowance: PLANS_CONFIG.free.dailyCredits,
        dailyUsed: 0,
        dailyResetAt: todayMidnight,
        monthlyAllowance: 0,
        monthlyUsed: 0,
        reservedCredits: 0,
      });

      // Record initial daily credit grant transaction
      await CreditTransaction.create({
        userId: uid,
        type: 'daily_reset',
        amount: PLANS_CONFIG.free.dailyCredits,
        description: `Initial daily free credit grant (${PLANS_CONFIG.free.dailyCredits} credits)`,
        status: 'committed',
      });
    } else {
      await this.ensureDailyReset(uid);
      account = (await CreditAccount.findOne({ userId: uid }))!;
    }

    return account;
  }

  /**
   * Ensures daily credits reset at 00:00 UTC atomically.
   */
  static async ensureDailyReset(userId: string | Types.ObjectId): Promise<boolean> {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const todayMidnight = getUtcMidnight();

    // Atomic update: only updates if dailyResetAt is earlier than today's UTC midnight
    const updated = await CreditAccount.findOneAndUpdate(
      {
        userId: uid,
        dailyResetAt: { $lt: todayMidnight },
      },
      {
        $set: {
          dailyUsed: 0,
          dailyResetAt: todayMidnight,
        },
      },
      { new: true },
    );

    if (updated) {
      await CreditTransaction.create({
        userId: uid,
        type: 'daily_reset',
        amount: updated.dailyAllowance,
        description: `Daily credit reset at ${todayMidnight.toISOString()} (UTC)`,
        status: 'committed',
      });
      return true;
    }

    return false;
  }

  /**
   * Calculates comprehensive credit balance info.
   */
  static calculateBalance(account: ICreditAccount): CreditBalanceInfo {
    const dailyRemaining = Math.max(0, account.dailyAllowance - account.dailyUsed);
    const monthlyRemaining = Math.max(0, account.monthlyAllowance - account.monthlyUsed);
    const totalAvailable = Math.max(0, dailyRemaining + monthlyRemaining - account.reservedCredits);

    const nextDailyReset = new Date(account.dailyResetAt);
    nextDailyReset.setUTCDate(nextDailyReset.getUTCDate() + 1);

    return {
      dailyAllowance: account.dailyAllowance,
      dailyUsed: account.dailyUsed,
      dailyRemaining,
      monthlyAllowance: account.monthlyAllowance,
      monthlyUsed: account.monthlyUsed,
      monthlyRemaining,
      reservedCredits: account.reservedCredits,
      totalAvailable,
      nextDailyResetUtc: nextDailyReset,
    };
  }

  /**
   * Retrieves credit cost for a given tool.
   */
  static async getToolCost(toolId: string): Promise<number> {
    const dbConfig = await AIToolConfig.findOne({ toolId, isEnabled: true });
    if (dbConfig) {
      return dbConfig.creditCost;
    }
    const defaultConfig = DEFAULT_TOOL_COSTS[toolId];
    return defaultConfig?.creditCost ?? 1;
  }

  /**
   * Phase 1 of 2-Phase Atomic Credit Reservation:
   * Checks balance and atomically reserves credits.
   */
  static async reserveCredits(params: {
    userId: string | Types.ObjectId;
    amount: number;
    tool: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; transaction?: ICreditTransaction; error?: string }> {
    const uid =
      typeof params.userId === 'string' ? new Types.ObjectId(params.userId) : params.userId;

    if (params.amount <= 0) {
      return { success: false, error: 'Credit amount must be greater than zero.' };
    }

    // Check idempotency: if transaction already reserved with same key, return it
    if (params.idempotencyKey) {
      const existingTx = await CreditTransaction.findOne({
        userId: uid,
        idempotencyKey: params.idempotencyKey,
      });
      if (existingTx) {
        if (existingTx.status === 'reserved' || existingTx.status === 'committed') {
          return { success: true, transaction: existingTx };
        }
      }
    }

    // Ensure account is up to date with daily UTC reset
    await this.ensureDailyReset(uid);

    // Atomic reservation query: checks available balance and increments reservedCredits atomically
    const updatedAccount = await CreditAccount.findOneAndUpdate(
      {
        userId: uid,
        $expr: {
          $gte: [
            {
              $subtract: [
                {
                  $add: [
                    { $subtract: ['$dailyAllowance', '$dailyUsed'] },
                    { $subtract: ['$monthlyAllowance', '$monthlyUsed'] },
                  ],
                },
                '$reservedCredits',
              ],
            },
            params.amount,
          ],
        },
      },
      {
        $inc: { reservedCredits: params.amount },
      },
      { new: true },
    );

    if (!updatedAccount) {
      return {
        success: false,
        error:
          "Insufficient credits. Upgrade your plan or wait for tomorrow's daily reset to continue generating.",
      };
    }

    // Record the reservation transaction
    const transaction = await CreditTransaction.create({
      userId: uid,
      type: 'reservation',
      amount: params.amount,
      tool: params.tool,
      idempotencyKey: params.idempotencyKey,
      description: `Reserved ${params.amount} credit(s) for ${params.tool}`,
      status: 'reserved',
    });

    return { success: true, transaction };
  }

  /**
   * Phase 2: Commit Credit Reservation:
   * Finalizes consumption upon successful AI processing.
   */
  static async commitReservation(params: {
    userId: string | Types.ObjectId;
    transactionId: string | Types.ObjectId;
    jobId?: string | Types.ObjectId;
  }): Promise<boolean> {
    const uid =
      typeof params.userId === 'string' ? new Types.ObjectId(params.userId) : params.userId;
    const txId =
      typeof params.transactionId === 'string'
        ? new Types.ObjectId(params.transactionId)
        : params.transactionId;

    const tx = await CreditTransaction.findOne({ _id: txId, userId: uid, status: 'reserved' });
    if (!tx) {
      return false;
    }

    const account = await CreditAccount.findOne({ userId: uid });
    if (!account) return false;

    // Deduct from daily credits first, then monthly credits
    const cost = tx.amount;
    const availableDaily = Math.max(0, account.dailyAllowance - account.dailyUsed);
    const deductDaily = Math.min(availableDaily, cost);
    const deductMonthly = cost - deductDaily;

    await CreditAccount.updateOne(
      { userId: uid },
      {
        $inc: {
          dailyUsed: deductDaily,
          monthlyUsed: deductMonthly,
          reservedCredits: -cost,
        },
      },
    );

    tx.status = 'committed';
    tx.type = 'consumption';
    if (params.jobId) {
      tx.jobId = typeof params.jobId === 'string' ? new Types.ObjectId(params.jobId) : params.jobId;
    }
    tx.description = `Consumed ${cost} credit(s) for ${tx.tool || 'AI Tool'}`;
    await tx.save();

    return true;
  }

  /**
   * Phase 2 Alternative: Refund / Release Credit Reservation:
   * Reverts reserved credits if AI processing fails.
   */
  static async refundReservation(params: {
    userId: string | Types.ObjectId;
    transactionId: string | Types.ObjectId;
    reason: string;
    jobId?: string | Types.ObjectId;
  }): Promise<boolean> {
    const uid =
      typeof params.userId === 'string' ? new Types.ObjectId(params.userId) : params.userId;
    const txId =
      typeof params.transactionId === 'string'
        ? new Types.ObjectId(params.transactionId)
        : params.transactionId;

    const tx = await CreditTransaction.findOne({ _id: txId, userId: uid, status: 'reserved' });
    if (!tx) {
      return false; // Already handled, prevents duplicate refund
    }

    const cost = tx.amount;

    // Release the reserved credits
    await CreditAccount.updateOne(
      { userId: uid },
      {
        $inc: {
          reservedCredits: -cost,
        },
      },
    );

    tx.status = 'refunded';
    tx.description = `Refunded ${cost} credit(s): ${params.reason}`;
    if (params.jobId) {
      tx.jobId = typeof params.jobId === 'string' ? new Types.ObjectId(params.jobId) : params.jobId;
    }
    await tx.save();

    return true;
  }

  /**
   * Updates allowance for paid subscriptions (Pro: 300, Premium: 1000).
   */
  static async applySubscriptionAllowance(
    userId: string | Types.ObjectId,
    plan: PlanTier,
  ): Promise<ICreditAccount> {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const planConfig = PLANS_CONFIG[plan];
    const monthlyCredits = planConfig?.monthlyCredits ?? 0;

    const account = await this.getOrCreateAccount(uid);
    account.monthlyAllowance = monthlyCredits;
    account.monthlyUsed = 0; // Reset monthly usage for new billing period
    await account.save();

    await CreditTransaction.create({
      userId: uid,
      type: 'monthly_grant',
      amount: monthlyCredits,
      description: `Monthly credit grant for ${planConfig.name} plan (${monthlyCredits} credits)`,
      status: 'committed',
    });

    return account;
  }

  /**
   * Admin-audited manual credit adjustment.
   */
  static async adjustCreditsAdmin(params: {
    userId: string | Types.ObjectId;
    adminId: string | Types.ObjectId;
    amount: number;
    reason: string;
  }): Promise<CreditBalanceInfo> {
    const uid =
      typeof params.userId === 'string' ? new Types.ObjectId(params.userId) : params.userId;
    const adminUid =
      typeof params.adminId === 'string' ? new Types.ObjectId(params.adminId) : params.adminId;

    if (!params.reason || params.reason.trim().length < 5) {
      throw new Error(
        'An audit reason of at least 5 characters is required for credit adjustments.',
      );
    }

    const account = await this.getOrCreateAccount(uid);

    if (params.amount > 0) {
      account.monthlyAllowance += params.amount;
    } else {
      // Deducting
      const deduction = Math.abs(params.amount);
      account.monthlyAllowance = Math.max(0, account.monthlyAllowance - deduction);
    }

    await account.save();

    await CreditTransaction.create({
      userId: uid,
      adminId: adminUid,
      type: 'admin_adjustment',
      amount: params.amount,
      auditReason: params.reason,
      description: `Admin adjustment (${params.amount > 0 ? '+' : ''}${params.amount} credits): ${params.reason}`,
      status: 'committed',
    });

    return this.calculateBalance(account);
  }
}
