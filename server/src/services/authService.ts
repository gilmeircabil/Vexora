import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { User, type IUser } from '../models/User.js';

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
    avatarUrl?: string;
    bio?: string;
    role: 'user' | 'admin';
    oauthProviders?: {
      google?: boolean;
      github?: boolean;
      facebook?: boolean;
    };
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

    // Free open-source user - no subscription or credit restrictions
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
          plan: 'free',
          status: 'active',
        },
        credits: {
          dailyRemaining: 999999,
          monthlyRemaining: 999999,
          totalAvailable: 999999,
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

    if (!user.passwordHash) {
      throw new Error('This account was created with social login. Please sign in with Google, GitHub, or Facebook.');
    }

    const validPassword = await this.comparePassword(params.password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid email or password.');
    }

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
          plan: 'free',
          status: 'active',
        },
        credits: {
          dailyRemaining: 999999,
          monthlyRemaining: 999999,
          totalAvailable: 999999,
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

    return {
      id: (user._id as Types.ObjectId).toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      oauthProviders: {
        google: Boolean(user.oauthProviders?.google?.id),
        github: Boolean(user.oauthProviders?.github?.id),
        facebook: Boolean(user.oauthProviders?.facebook?.id),
      },
      subscription: {
        plan: 'free',
        status: 'active',
      },
      credits: {
        dailyRemaining: 999999,
        monthlyRemaining: 999999,
        totalAvailable: 999999,
      },
    };
  }

  /**
   * Authenticates or registers a user via OAuth (Google, GitHub, Facebook).
   */
  static async authenticateOAuth(params: {
    provider: 'google' | 'github' | 'facebook';
    providerId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<AuthResult> {
    const cleanEmail = params.email.toLowerCase().trim();
    const cleanName = params.name?.trim() || cleanEmail.split('@')[0];

    // Find user by email or by existing oauth provider id
    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { [`oauthProviders.${params.provider}.id`]: params.providerId },
      ],
    });

    if (user) {
      // Bind or update provider details
      if (!user.oauthProviders) user.oauthProviders = {};
      user.oauthProviders[params.provider] = {
        id: params.providerId,
        email: cleanEmail,
        picture: params.avatarUrl,
        linkedAt: new Date(),
      };
      if (!user.avatarUrl && params.avatarUrl) {
        user.avatarUrl = params.avatarUrl;
      }
      await user.save();
    } else {
      // Create new user authenticated via OAuth
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        avatarUrl: params.avatarUrl || '',
        role: cleanEmail === env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
        oauthProviders: {
          [params.provider]: {
            id: params.providerId,
            email: cleanEmail,
            picture: params.avatarUrl,
            linkedAt: new Date(),
          },
        },
      });
    }

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
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        oauthProviders: {
          google: Boolean(user.oauthProviders?.google?.id),
          github: Boolean(user.oauthProviders?.github?.id),
          facebook: Boolean(user.oauthProviders?.facebook?.id),
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
        credits: {
          dailyRemaining: 999999,
          monthlyRemaining: 999999,
          totalAvailable: 999999,
        },
      },
      ...tokens,
    };
  }

  /**
   * Binds an OAuth provider (Google, GitHub, Facebook) to an existing authenticated user.
   */
  static async bindOAuthProvider(
    userId: string | Types.ObjectId,
    params: {
      provider: 'google' | 'github' | 'facebook';
      providerId: string;
      email?: string;
      username?: string;
      avatarUrl?: string;
    },
  ) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const user = await User.findById(uid);
    if (!user) throw new Error('User not found.');

    if (!user.oauthProviders) user.oauthProviders = {};
    user.oauthProviders[params.provider] = {
      id: params.providerId,
      email: params.email?.trim().toLowerCase(),
      username: params.username,
      picture: params.avatarUrl,
      linkedAt: new Date(),
    };

    if (!user.avatarUrl && params.avatarUrl) {
      user.avatarUrl = params.avatarUrl;
    }

    await user.save();
    return {
      success: true,
      provider: params.provider,
      linkedAt: user.oauthProviders[params.provider]?.linkedAt,
    };
  }

  /**
   * Unbinds an OAuth provider from an existing user.
   */
  static async unbindOAuthProvider(
    userId: string | Types.ObjectId,
    provider: 'google' | 'github' | 'facebook',
  ) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const user = await User.findById(uid);
    if (!user) throw new Error('User not found.');

    // Ensure user has a password or at least one other login method
    const remainingProviders = ['google', 'github', 'facebook'].filter(
      (p) => p !== provider && user.oauthProviders?.[p as 'google' | 'github' | 'facebook']?.id,
    );

    if (!user.passwordHash && remainingProviders.length === 0) {
      throw new Error(
        'Cannot disconnect this provider because you do not have a password or other connected provider.',
      );
    }

    if (user.oauthProviders) {
      delete user.oauthProviders[provider];
      user.markModified('oauthProviders');
      await user.save();
    }

    return { success: true };
  }

  /**
   * Updates basic user profile info (name, bio, avatarUrl).
   */
  static async updateProfile(
    userId: string | Types.ObjectId,
    params: {
      name?: string;
      avatarUrl?: string;
      bio?: string;
    },
  ) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const user = await User.findById(uid);
    if (!user) throw new Error('User not found.');

    if (params.name && params.name.trim()) {
      user.name = params.name.trim().slice(0, 100);
    }
    if (params.avatarUrl !== undefined) {
      user.avatarUrl = params.avatarUrl;
    }
    if (params.bio !== undefined) {
      user.bio = params.bio.slice(0, 500);
    }

    await user.save();
    return this.getCurrentUser(user._id as Types.ObjectId);
  }
}
