import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { User, type IUser } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { CreditService } from './creditService.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    subscription: {
      plan: string;
      status: string;
      currentPeriodEnd?: Date;
    };
    credits: {
      dailyRemaining: number;
      monthlyRemaining: number;
      totalAvailable: number;
    };
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Hashes password using bcrypt with 12 salt rounds.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compares plain password with stored hash.
   */
  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Generates JWT Access and Refresh tokens.
   */
  static generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });
    return { accessToken, refreshToken };
  }

  /**
   * Verifies access token.
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verifies refresh token.
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Registers a new user, creates their free subscription and initializes their 3 daily free credits.
   */
  static async register(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const existing = await User.findOne({ email: params.email.toLowerCase().trim() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await this.hashPassword(params.password);
    const user = await User.create({
      name: params.name.trim(),
      email: params.email.toLowerCase().trim(),
      passwordHash,
      role: params.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
    });

    // Create default Free subscription
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 10);

    const subscription = await Subscription.create({
      userId: user._id,
      plan: 'free',
      billingInterval: 'monthly',
      provider: 'system',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: nextYear,
    });

    user.subscriptionId = subscription._id as Types.ObjectId;
    await user.save();

    // Initialize Credit Account with 3 free daily credits
    const creditAccount = await CreditService.getOrCreateAccount(user._id as Types.ObjectId);
    const balance = CreditService.calculateBalance(creditAccount);

    const tokens = this.generateTokens({
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: (user._id as Types.ObjectId).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
        credits: {
          dailyRemaining: balance.dailyRemaining,
          monthlyRemaining: balance.monthlyRemaining,
          totalAvailable: balance.totalAvailable,
        },
      },
      ...tokens,
    };
  }

  /**
   * Authenticates user with email and password.
   */
  static async login(params: { email: string; password: string }): Promise<AuthResult> {
    const user = await User.findOne({ email: params.email.toLowerCase().trim() });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const validPassword = await this.comparePassword(params.password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid email or password.');
    }

    const subscription = await Subscription.findOne({ userId: user._id });
    const creditAccount = await CreditService.getOrCreateAccount(user._id as Types.ObjectId);
    const balance = CreditService.calculateBalance(creditAccount);

    const tokens = this.generateTokens({
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: (user._id as Types.ObjectId).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: {
          plan: subscription?.plan || 'free',
          status: subscription?.status || 'active',
          currentPeriodEnd: subscription?.currentPeriodEnd,
        },
        credits: {
          dailyRemaining: balance.dailyRemaining,
          monthlyRemaining: balance.monthlyRemaining,
          totalAvailable: balance.totalAvailable,
        },
      },
      ...tokens,
    };
  }

  /**
   * Retrieves full profile of the authenticated user.
   */
  static async getCurrentUser(userId: string | Types.ObjectId) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const user = await User.findById(uid).select('-passwordHash');
    if (!user) {
      throw new Error('User not found.');
    }

    const subscription = await Subscription.findOne({ userId: uid });
    const creditAccount = await CreditService.getOrCreateAccount(uid);
    const balance = CreditService.calculateBalance(creditAccount);

    return {
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: {
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        billingInterval: subscription?.billingInterval || 'monthly',
        currentPeriodStart: subscription?.currentPeriodStart,
        currentPeriodEnd: subscription?.currentPeriodEnd,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
      },
      credits: balance,
    };
  }
}
