import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { User, validateUsername } from '../models/User.js';
import { TurnstileService } from './turnstileService.js';

export class AuthSecurityError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthSecurityError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface TokenPayload {
  userId: string;
  username: string;
  email?: string;
  role: 'user' | 'admin';
  tokenVersion?: number;
  jti?: string;
}

export interface AuthResult {
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    role: 'user' | 'admin';
    educationRole?: 'student' | 'teacher' | 'educator';
    emailVerified: boolean;
    accountStatus: string;
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
  recoveryCode?: string;
}

const COMMON_COMPROMISED_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  'password123!',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  'welcome123',
  'admin123',
  'letmein123',
  'iloveyou1',
  'monkey123',
  'dragon123',
  'sunshine1',
  'princess1',
  'football1',
  'vexora123',
  'vexoramods',
]);

// Dummy bcrypt hash for constant-time comparison when user does not exist
const DUMMY_PASSWORD_HASH = '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';

// Revoked JWT hashes (by SHA-256 of token string) with expiration timestamp
const revokedTokens = new Map<string, number>();

export class AuthService {
  /**
   * Resets in-memory revocation and rate state (for automated tests).
   */
  static resetSecurityState(): void {
    revokedTokens.clear();
  }

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
   * Validates password complexity and checks against commonly compromised passwords.
   */
  static validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (password.length > 128) {
      return { valid: false, message: 'Password must not exceed 128 characters.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (COMMON_COMPROMISED_PASSWORDS.has(password.toLowerCase().trim())) {
      return {
        valid: false,
        message:
          'This password is too common or has appeared in data breaches. Please choose a stronger password.',
      };
    }
    return { valid: true };
  }

  /**
   * Generates a cryptographically secure 16-character alphanumeric recovery code.
   * Format: VEX-XXXX-XXXX-XXXX-XXXX
   */
  static generateRecoveryCode(): string {
    const raw = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `VEX-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
  }

  /**
   * Hashes an opaque token or recovery code with SHA-256 so raw secrets are never stored in the database.
   */
  static hashOpaqueToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Normalizes and hashes recovery code.
   */
  static hashRecoveryCode(code: string): string {
    const normalized = (code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Revokes an access or refresh token on logout.
   */
  static revokeToken(token: string | undefined): void {
    if (!token || typeof token !== 'string') return;
    const hash = this.hashOpaqueToken(token.trim());
    revokedTokens.set(hash, Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Checks whether a JWT has been explicitly revoked.
   */
  static isTokenRevoked(token: string | undefined): boolean {
    if (!token) return false;
    const hash = this.hashOpaqueToken(token.trim());
    const exp = revokedTokens.get(hash);
    if (!exp) return false;
    if (exp <= Date.now()) {
      revokedTokens.delete(hash);
      return false;
    }
    return true;
  }

  /**
   * Generates JWT Access and Refresh tokens.
   */
  static generateTokens(
    payload: TokenPayload,
    options?: { accessExpiresIn?: string; refreshExpiresIn?: string },
  ): { accessToken: string; refreshToken: string } {
    const cleanPayload: TokenPayload = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      tokenVersion: payload.tokenVersion ?? 0,
      jti: payload.jti || crypto.randomBytes(12).toString('hex'),
    };
    const accessToken = jwt.sign(cleanPayload, env.JWT_SECRET, {
      expiresIn: (options?.accessExpiresIn || env.JWT_EXPIRES_IN) as any,
    });
    const refreshToken = jwt.sign(cleanPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: (options?.refreshExpiresIn || env.JWT_REFRESH_EXPIRES_IN) as any,
    });
    return { accessToken, refreshToken };
  }

  /**
   * Verifies access token and ensures it has not been revoked.
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      if (this.isTokenRevoked(token)) {
        return null;
      }
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verifies refresh token and ensures it has not been revoked.
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      if (this.isTokenRevoked(token)) {
        return null;
      }
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Registers a new user with username and password.
   * Generates a secure recovery code, hashes it, and returns the one-time raw code.
   */
  static async register(params: {
    username: string;
    password: string;
    confirmPassword?: string;
    name?: string;
    email?: string;
    educationRole?: 'student' | 'teacher' | 'educator';
    ip?: string;
  }): Promise<AuthResult> {
    // 1. Username validation
    const usernameValidation = validateUsername(params.username);
    if (!usernameValidation.valid) {
      throw new AuthSecurityError(
        usernameValidation.error || 'Invalid username.',
        400,
        'INVALID_USERNAME',
      );
    }
    const cleanUsername = params.username.toLowerCase().trim();

    // 2. Check confirmPassword match
    if (params.confirmPassword !== undefined && params.password !== params.confirmPassword) {
      throw new AuthSecurityError('Passwords do not match.', 400, 'PASSWORD_MISMATCH');
    }

    // 3. Password strength validation
    const strength = this.validatePasswordStrength(params.password);
    if (!strength.valid) {
      throw new AuthSecurityError(
        strength.message || 'Password does not meet security requirements.',
        400,
        'WEAK_PASSWORD',
      );
    }

    if (params.ip) {
      TurnstileService.recordSuspiciousActivity(params.ip, 'registration_attempt');
    }

    // 4. Case-insensitive uniqueness check
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      throw new AuthSecurityError(
        'An account with this username already exists.',
        400,
        'USERNAME_EXISTS',
      );
    }

    // 5. Generate secure hashes
    const passwordHash = await this.hashPassword(params.password);
    const rawRecoveryCode = this.generateRecoveryCode();
    const recoveryCodeHash = this.hashRecoveryCode(rawRecoveryCode);

    const isAdmin =
      cleanUsername === 'admin' ||
      (params.email && params.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase());

    const user = await User.create({
      username: cleanUsername,
      name: (params.name || cleanUsername).trim().slice(0, 100),
      email: params.email ? params.email.toLowerCase().trim() : undefined,
      passwordHash,
      recoveryCodeHash,
      role: isAdmin ? 'admin' : 'user',
      educationRole: params.educationRole || 'student',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      accountStatus: 'active',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      tokenVersion: 0,
    });

    const tokens = this.generateTokens({
      userId: (user._id as Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      user: {
        id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        educationRole: user.educationRole || 'student',
        emailVerified: true,
        accountStatus: user.accountStatus,
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
      recoveryCode: rawRecoveryCode,
    };
  }

  /**
   * Authenticates user with username and password.
   * Includes lockout protection and constant-time dummy password check for unknown users.
   */
  static async login(params: {
    username?: string;
    email?: string;
    password: string;
    ip?: string;
  }): Promise<AuthResult> {
    const rawInput = (params.username || params.email || '').trim();
    if (!rawInput) {
      throw new AuthSecurityError('Username is required.', 400, 'INVALID_CREDENTIALS');
    }

    const cleanInput = rawInput.toLowerCase();

    // Look up by username first, fallback to email for legacy existing accounts
    let user = await User.findOne({ username: cleanInput });
    if (!user && cleanInput.includes('@')) {
      user = await User.findOne({ email: cleanInput });
    }

    if (!user) {
      // Constant-time dummy comparison to prevent timing enumeration attacks
      await this.comparePassword(params.password, DUMMY_PASSWORD_HASH);
      if (params.ip) TurnstileService.recordSuspiciousActivity(params.ip, 'failed_login');
      TurnstileService.recordSuspiciousActivity(`acct:${cleanInput}`, 'failed_login');
      throw new AuthSecurityError('Invalid username or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.isSuspended || user.accountStatus === 'suspended') {
      throw new AuthSecurityError(
        'This account has been suspended. Please contact support if you believe this is an error.',
        403,
        'ACCOUNT_SUSPENDED',
      );
    }

    // Check temporary lockout
    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000),
      );
      throw new AuthSecurityError(
        `Account is temporarily locked due to repeated failed sign-in attempts. Please try again in ${remainingMinutes} minute(s) or recover your account.`,
        423,
        'ACCOUNT_LOCKED',
      );
    }

    // Clear expired lockout automatically
    if (user.lockoutUntil && user.lockoutUntil.getTime() <= Date.now()) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;
      if (user.accountStatus === 'locked') {
        user.accountStatus = 'active';
      }
    }

    if (!user.passwordHash) {
      await this.comparePassword(params.password, DUMMY_PASSWORD_HASH);
      throw new AuthSecurityError('Invalid username or password.', 401, 'INVALID_CREDENTIALS');
    }

    const validPassword = await this.comparePassword(params.password, user.passwordHash);
    if (!validPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (params.ip) TurnstileService.recordSuspiciousActivity(params.ip, 'failed_login');
      TurnstileService.recordSuspiciousActivity(`acct:${user.username}`, 'failed_login');

      if (user.failedLoginAttempts >= env.LOGIN_MAX_FAILED_ATTEMPTS) {
        user.lockoutUntil = new Date(Date.now() + env.LOGIN_LOCKOUT_MINUTES * 60 * 1000);
        user.accountStatus = 'locked';
        await user.save();
        throw new AuthSecurityError(
          `Account temporarily locked due to too many failed login attempts. Please try again in ${env.LOGIN_LOCKOUT_MINUTES} minutes or recover your account.`,
          423,
          'ACCOUNT_LOCKED',
        );
      }

      await user.save();
      throw new AuthSecurityError('Invalid username or password.', 401, 'INVALID_CREDENTIALS');
    }

    // Successful login: reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.accountStatus = 'active';
    user.lastLoginAt = new Date();
    await user.save();

    const tokens = this.generateTokens({
      userId: (user._id as Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    });

    return {
      user: {
        id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        educationRole: user.educationRole || 'student',
        emailVerified: true,
        accountStatus: user.accountStatus || 'active',
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
   * Recovers an account using Username + Recovery Code.
   * Upon successful verification, updates the password and rotates the recovery code.
   */
  static async recoverAccount(params: {
    username: string;
    recoveryCode: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; message: string; newRecoveryCode: string }> {
    if (params.confirmPassword !== undefined && params.password !== params.confirmPassword) {
      throw new AuthSecurityError('Passwords do not match.', 400, 'PASSWORD_MISMATCH');
    }

    const strength = this.validatePasswordStrength(params.password);
    if (!strength.valid) {
      throw new AuthSecurityError(
        strength.message || 'Password does not meet security requirements.',
        400,
        'WEAK_PASSWORD',
      );
    }

    const cleanUsername = (params.username || '').toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername });

    if (!user || !user.recoveryCodeHash) {
      // Dummy check to prevent timing analysis
      this.hashRecoveryCode('VEX-0000-0000-0000-0000');
      throw new AuthSecurityError(
        'Invalid username or recovery code.',
        401,
        'INVALID_RECOVERY_CODE',
      );
    }

    const incomingHash = this.hashRecoveryCode(params.recoveryCode);
    if (incomingHash !== user.recoveryCodeHash) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      throw new AuthSecurityError(
        'Invalid username or recovery code.',
        401,
        'INVALID_RECOVERY_CODE',
      );
    }

    // Password reset & Recovery Code Rotation
    const newRecoveryCode = this.generateRecoveryCode();
    user.recoveryCodeHash = this.hashRecoveryCode(newRecoveryCode);
    user.passwordHash = await this.hashPassword(params.password);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    if (user.accountStatus === 'locked') {
      user.accountStatus = 'active';
    }
    await user.save();

    return {
      success: true,
      message:
        'Your password has been reset successfully. Please store your new recovery code safely.',
      newRecoveryCode,
    };
  }

  /**
   * Changes the password for an authenticated user.
   */
  static async changePassword(params: {
    userId: string | Types.ObjectId;
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; message: string }> {
    if (params.confirmPassword !== undefined && params.newPassword !== params.confirmPassword) {
      throw new AuthSecurityError('Passwords do not match.', 400, 'PASSWORD_MISMATCH');
    }

    const strength = this.validatePasswordStrength(params.newPassword);
    if (!strength.valid) {
      throw new AuthSecurityError(
        strength.message || 'Password does not meet security requirements.',
        400,
        'WEAK_PASSWORD',
      );
    }

    const uid = typeof params.userId === 'string' ? new Types.ObjectId(params.userId) : params.userId;
    const user = await User.findById(uid);
    if (!user || !user.passwordHash) {
      throw new AuthSecurityError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await this.comparePassword(params.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AuthSecurityError('Current password is incorrect.', 400, 'INCORRECT_PASSWORD');
    }

    user.passwordHash = await this.hashPassword(params.newPassword);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  }

  /**
   * Retrieves full profile of the authenticated user.
   */
  static async getCurrentUser(userId: string | Types.ObjectId) {
    const uid = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const user = await User.findById(uid).select('-passwordHash -recoveryCodeHash');
    if (!user) {
      throw new Error('User not found.');
    }

    return {
      id: (user._id as Types.ObjectId).toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      educationRole: user.educationRole || 'student',
      emailVerified: true,
      accountStatus: user.accountStatus || 'active',
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
   * Safely migrates existing user accounts that have no username assigned.
   */
  static async migrateExistingUsers(): Promise<number> {
    try {
      const usersToMigrate = await User.find({
        $or: [{ username: { $exists: false } }, { username: null }, { username: '' }],
      });

      let count = 0;
      for (const u of usersToMigrate) {
        let base = (u.name || u.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 15);

        if (base.length < 3) base = `user_${base}`;
        let candidate = base;
        let suffix = 1;

        while (await User.exists({ username: candidate, _id: { $ne: u._id } })) {
          candidate = `${base.slice(0, 15)}_${suffix}`;
          suffix++;
        }

        u.username = candidate;
        if (!u.recoveryCodeHash) {
          const defaultRecoveryCode = this.generateRecoveryCode();
          u.recoveryCodeHash = this.hashRecoveryCode(defaultRecoveryCode);
        }
        await u.save();
        count++;
      }
      return count;
    } catch {
      return 0;
    }
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
