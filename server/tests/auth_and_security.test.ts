import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import crypto from 'node:crypto';
import { DonationService } from '../src/services/donationService.js';
import { AuthService } from '../src/services/authService.js';
import { AuthController } from '../src/controllers/authController.js';
import { TurnstileService } from '../src/services/turnstileService.js';
import { User, validateUsername } from '../src/models/User.js';
import { authenticate, requireAdmin } from '../src/middleware/authMiddleware.js';
import {
  registrationRateLimiter,
  loginRateLimiter,
  resetAllRateLimiters,
} from '../src/middleware/rateLimitMiddleware.js';
import { DEFAULT_TOOL_COSTS } from '../src/config/plans.js';

function createMockRes() {
  const res: any = {
    statusCode: 200,
    body: null,
    headers: {} as Record<string, any>,
    cookies: {} as Record<string, any>,
    clearedCookies: [] as string[],
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
    setHeader(key: string, val: any) {
      this.headers[key] = val;
      return this;
    },
    cookie(name: string, val: any, opts?: any) {
      this.cookies[name] = { val, opts };
      return this;
    },
    clearCookie(name: string) {
      this.clearedCookies.push(name);
      delete this.cookies[name];
      return this;
    },
  };
  return res;
}

describe('Open Source Plan & Free Quotas', () => {
  it('should declare free and zero credit costs for all tools', () => {
    for (const [toolId, config] of Object.entries(DEFAULT_TOOL_COSTS)) {
      expect(config.creditCost, `Tool ${toolId} should cost 0 credits`).toBe(0);
      expect(config.minPlan).toBe('free');
    }
  });
});

describe('Payment Provider Signature Verification', () => {
  const webhookSecret = 'whsec_test_secret_key_12345';

  it('DonationService.verifyPayMongoSignature verifies genuine signatures and rejects invalid ones', () => {
    const rawBody = JSON.stringify({
      data: { id: 'evt_pm_123', attributes: { type: 'payment.paid' } },
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const hmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const validHeader = `t=${timestamp},te=${hmac}`;
    const forgedHeader = `t=${timestamp},te=fake_signature_hash`;

    expect(DonationService.verifyPayMongoSignature(rawBody, validHeader, webhookSecret)).toBe(true);
    expect(DonationService.verifyPayMongoSignature(rawBody, forgedHeader, webhookSecret)).toBe(
      false,
    );
    expect(DonationService.verifyPayMongoSignature(rawBody, '', webhookSecret)).toBe(false);
  });
});

describe('Authentication & Password Hashing', () => {
  it('hashes passwords securely and compares them accurately', async () => {
    const plain = 'SecurePass123!';
    const hash = await AuthService.hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix

    const isValid = await AuthService.comparePassword(plain, hash);
    const isInvalid = await AuthService.comparePassword('WrongPassword', hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('generates verifiable JWT access and refresh tokens', () => {
    const payload = {
      userId: '652391028392102938475812',
      username: 'alice_dev',
      email: 'test@vexoramods.local',
      role: 'user' as const,
    };

    const tokens = AuthService.generateTokens(payload);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    const decodedAccess = AuthService.verifyAccessToken(tokens.accessToken);
    expect(decodedAccess?.userId).toBe(payload.userId);
    expect(decodedAccess?.username).toBe(payload.username);
    expect(decodedAccess?.role).toBe('user');

    const decodedRefresh = AuthService.verifyRefreshToken(tokens.refreshToken);
    expect(decodedRefresh?.userId).toBe(payload.userId);
  });
});

describe('Username Validation & Security Rules', () => {
  it('validates username rules (min 3, max 20, letters, numbers, underscores)', () => {
    expect(validateUsername('alice').valid).toBe(true);
    expect(validateUsername('dev_123').valid).toBe(true);
    expect(validateUsername('gilmier_dev').valid).toBe(true);

    expect(validateUsername('ab').valid).toBe(false); // too short
    expect(validateUsername('a'.repeat(21)).valid).toBe(false); // too long
    expect(validateUsername('user name').valid).toBe(false); // spaces
    expect(validateUsername('user@name').valid).toBe(false); // invalid symbol
  });

  it('rejects reserved system usernames', () => {
    expect(validateUsername('admin').valid).toBe(false);
    expect(validateUsername('ADMIN').valid).toBe(false);
    expect(validateUsername('administrator').valid).toBe(false);
    expect(validateUsername('support').valid).toBe(false);
    expect(validateUsername('root').valid).toBe(false);
    expect(validateUsername('system').valid).toBe(false);
  });
});

describe('VexoraMods Username & Password Auth Suite', () => {
  const usersDb = new Map<string, any>();

  beforeEach(() => {
    usersDb.clear();
    TurnstileService.resetState();
    AuthService.resetSecurityState();
    resetAllRateLimiters();
    vi.restoreAllMocks();

    vi.spyOn(User, 'findOne').mockImplementation((async (query: any) => {
      if (query?.username) {
        return usersDb.get(query.username.toLowerCase()) || null;
      }
      if (query?.email) {
        for (const u of usersDb.values()) {
          if (u.email && u.email.toLowerCase() === query.email.toLowerCase()) return u;
        }
      }
      if (query?.$or) {
        for (const cond of query.$or) {
          if (cond.username && usersDb.has(cond.username.toLowerCase())) {
            return usersDb.get(cond.username.toLowerCase());
          }
          if (cond.email) {
            for (const u of usersDb.values()) {
              if (u.email && u.email.toLowerCase() === cond.email.toLowerCase()) return u;
            }
          }
        }
      }
      return null;
    }) as any);

    vi.spyOn(User, 'findById').mockImplementation(((id: any) => {
      const idStr = id.toString();
      let found: any = null;
      for (const u of usersDb.values()) {
        if (u._id.toString() === idStr) {
          found = u;
          break;
        }
      }
      const promise = Promise.resolve(found);
      (promise as any).select = () => Promise.resolve(found);
      return promise as any;
    }) as any);

    vi.spyOn(User, 'create').mockImplementation((async (doc: any) => {
      const _id = new Types.ObjectId();
      const record: any = {
        _id,
        username: doc.username.toLowerCase(),
        name: doc.name || doc.username,
        email: doc.email?.toLowerCase(),
        passwordHash: doc.passwordHash,
        recoveryCodeHash: doc.recoveryCodeHash,
        role: doc.role || 'user',
        emailVerified: true,
        accountStatus: doc.accountStatus || 'active',
        failedLoginAttempts: doc.failedLoginAttempts || 0,
        lockoutUntil: doc.lockoutUntil || null,
        lastLoginAt: doc.lastLoginAt || null,
        tokenVersion: doc.tokenVersion || 0,
        isSuspended: false,
        async save() {
          usersDb.set(this.username, this);
          return this;
        },
      };
      // Ensure confirmPassword is NEVER passed to User.create
      expect((doc as any).confirmPassword).toBeUndefined();
      usersDb.set(record.username, record);
      return record;
    }) as any);
  });

  it('1. Registration with valid username & password succeeds and returns single-use recovery code', async () => {
    const req: any = {
      headers: { 'x-forwarded-for': '10.0.0.1' },
      body: {
        username: 'alice_creator',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
        turnstileToken: 'cf-turnstile-valid-reg-1',
      },
    };
    const res = createMockRes();

    await AuthController.register(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe('alice_creator');
    expect(res.body.data.recoveryCode).toMatch(/^VEX(-[A-Z0-9]{4}){3,4}$/);

    const savedUser = usersDb.get('alice_creator');
    expect(savedUser).toBeDefined();
    expect(savedUser.confirmPassword).toBeUndefined();
    expect(savedUser.passwordHash).not.toBe('StrongPassword123!');
    expect(savedUser.recoveryCodeHash).toBeDefined();
  });

  it('2. Registration with duplicate or case-insensitive existing username is rejected', async () => {
    usersDb.set('charlie_dev', {
      _id: new Types.ObjectId(),
      username: 'charlie_dev',
      role: 'user',
      async save() {},
    });

    const req: any = {
      headers: { 'x-forwarded-for': '10.0.0.2' },
      body: {
        username: 'CHARLIE_DEV',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
        turnstileToken: 'cf-turnstile-valid-reg-2',
      },
    };
    const res = createMockRes();

    await AuthController.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('3. Registration with mismatched passwords is rejected', async () => {
    const req: any = {
      headers: { 'x-forwarded-for': '10.0.0.2' },
      body: {
        username: 'bob_builder',
        password: 'StrongPassword123!',
        confirmPassword: 'DifferentPassword123!',
        turnstileToken: 'cf-turnstile-valid-reg-3',
      },
    };
    const res = createMockRes();

    await AuthController.register(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('PASSWORD_MISMATCH');
  });

  it('4. Missing Turnstile token is rejected on both registration and login', async () => {
    const regReq: any = {
      headers: { 'x-forwarded-for': '10.0.0.3' },
      body: {
        username: 'bot_user',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
      },
    };
    const regRes = createMockRes();
    await AuthController.register(regReq, regRes);
    expect(regRes.statusCode).toBe(400);
    expect(regRes.body.code).toBe('MISSING_TOKEN');

    const loginReq: any = {
      headers: { 'x-forwarded-for': '10.0.0.3' },
      body: {
        username: 'bot_user',
        password: 'StrongPassword123!',
      },
    };
    const loginRes = createMockRes();
    await AuthController.login(loginReq, loginRes);
    expect(loginRes.statusCode).toBe(400);
    expect(loginRes.body.code).toBe('MISSING_TOKEN');
  });

  it('5. Login with valid username and password succeeds and issues tokens', async () => {
    const passwordHash = await AuthService.hashPassword('SecretPass123!');
    usersDb.set('valid_user', {
      _id: new Types.ObjectId(),
      username: 'valid_user',
      name: 'Valid User',
      passwordHash,
      role: 'user',
      accountStatus: 'active',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      tokenVersion: 0,
      async save() {
        usersDb.set(this.username, this);
        return this;
      },
    });

    const loginReq: any = {
      headers: { 'x-forwarded-for': '10.0.0.5' },
      body: {
        username: 'valid_user',
        password: 'SecretPass123!',
        turnstileToken: 'cf-valid-turnstile-login',
      },
    };
    const loginRes = createMockRes();

    await AuthController.login(loginReq, loginRes);

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.body.data.user.username).toBe('valid_user');
  });

  it('6. Login with incorrect password fails and increments failedLoginAttempts', async () => {
    const passwordHash = await AuthService.hashPassword('CorrectPass123!');
    usersDb.set('attempt_user', {
      _id: new Types.ObjectId(),
      username: 'attempt_user',
      name: 'Attempt User',
      passwordHash,
      role: 'user',
      accountStatus: 'active',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      tokenVersion: 0,
      async save() {
        usersDb.set(this.username, this);
        return this;
      },
    });

    const loginReq: any = {
      headers: { 'x-forwarded-for': '10.0.0.6' },
      body: {
        username: 'attempt_user',
        password: 'WrongPassword999!',
        turnstileToken: 'cf-valid-turnstile-login',
      },
    };
    const loginRes = createMockRes();

    await AuthController.login(loginReq, loginRes);

    expect(loginRes.statusCode).toBe(401);
    expect(loginRes.body.success).toBe(false);
    expect(usersDb.get('attempt_user').failedLoginAttempts).toBe(1);
  });

  it('7. 5 consecutive failed logins trigger 15-minute temporary lockout', async () => {
    const passwordHash = await AuthService.hashPassword('MasterPass123!');
    usersDb.set('lock_user', {
      _id: new Types.ObjectId(),
      username: 'lock_user',
      passwordHash,
      role: 'user',
      accountStatus: 'active',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      tokenVersion: 0,
      async save() {
        usersDb.set(this.username, this);
        return this;
      },
    });

    for (let i = 1; i <= 5; i++) {
      await expect(
        AuthService.login({
          username: 'lock_user',
          password: 'BadPassword!',
          ip: '10.0.0.7',
        }),
      ).rejects.toThrow();
    }

    const user = usersDb.get('lock_user');
    expect(user.accountStatus).toBe('locked');
    expect(user.lockoutUntil).toBeInstanceOf(Date);

    // Blocked even with correct password during lockout
    await expect(
      AuthService.login({
        username: 'lock_user',
        password: 'MasterPass123!',
        ip: '10.0.0.7',
      }),
    ).rejects.toThrow(/temporarily locked/i);
  });

  it('8. Account recovery using username + recovery code updates password and rotates recovery code', async () => {
    const rawRecoveryCode = AuthService.generateRecoveryCode();
    const recoveryCodeHash = AuthService.hashRecoveryCode(rawRecoveryCode);
    const oldPasswordHash = await AuthService.hashPassword('OldPass123!');

    usersDb.set('recover_user', {
      _id: new Types.ObjectId(),
      username: 'recover_user',
      passwordHash: oldPasswordHash,
      recoveryCodeHash,
      role: 'user',
      accountStatus: 'active',
      failedLoginAttempts: 0,
      tokenVersion: 0,
      async save() {
        usersDb.set(this.username, this);
        return this;
      },
    });

    const recoverReq: any = {
      headers: { 'x-forwarded-for': '10.0.0.8' },
      body: {
        username: 'recover_user',
        recoveryCode: rawRecoveryCode,
        password: 'NewStrongPassword456!',
        confirmPassword: 'NewStrongPassword456!',
        turnstileToken: 'cf-valid-turnstile-recover',
      },
    };
    const recoverRes = createMockRes();

    await AuthController.recoverAccount(recoverReq, recoverRes);

    expect(recoverRes.statusCode).toBe(200);
    expect(recoverRes.body.success).toBe(true);
    expect(recoverRes.body.data.newRecoveryCode).toBeDefined();
    expect(recoverRes.body.data.newRecoveryCode).not.toBe(rawRecoveryCode); // Rotated!

    // Using the old recovery code now fails
    const reusedReq: any = {
      headers: { 'x-forwarded-for': '10.0.0.8' },
      body: {
        username: 'recover_user',
        recoveryCode: rawRecoveryCode,
        password: 'AnotherPassword789!',
        confirmPassword: 'AnotherPassword789!',
        turnstileToken: 'cf-valid-turnstile-recover',
      },
    };
    const reusedRes = createMockRes();
    await AuthController.recoverAccount(reusedReq, reusedRes);
    expect(reusedRes.statusCode).toBe(400);
  });

  it('9. Session expiration and logout invalidate tokens', async () => {
    const expiredTokens = AuthService.generateTokens(
      {
        userId: '652391028392102938475812',
        username: 'expired_user',
        role: 'user',
      },
      { accessExpiresIn: '-5s' },
    );
    expect(AuthService.verifyAccessToken(expiredTokens.accessToken)).toBeNull();

    const validTokens = AuthService.generateTokens({
      userId: '652391028392102938475812',
      username: 'active_user',
      role: 'user',
    });
    expect(AuthService.verifyAccessToken(validTokens.accessToken)).not.toBeNull();

    const logoutReq: any = {
      headers: { authorization: `Bearer ${validTokens.accessToken}` },
      cookies: { refreshToken: validTokens.refreshToken },
    };
    const logoutRes = createMockRes();
    await AuthController.logout(logoutReq, logoutRes);

    expect(logoutRes.statusCode).toBe(200);
    expect(AuthService.verifyAccessToken(validTokens.accessToken)).toBeNull();
  });

  it('10. Admin login and permissions check remain fully functional', async () => {
    const adminHash = await AuthService.hashPassword('AdminPass123!');
    usersDb.set('admin', {
      _id: new Types.ObjectId(),
      username: 'admin',
      name: 'Platform Admin',
      passwordHash: adminHash,
      role: 'admin',
      accountStatus: 'active',
      failedLoginAttempts: 0,
      tokenVersion: 0,
      async save() {
        usersDb.set(this.username, this);
        return this;
      },
    });

    const adminLogin = await AuthService.login({
      username: 'admin',
      password: 'AdminPass123!',
    });
    expect(adminLogin.user.role).toBe('admin');

    const adminReq: any = {
      headers: { authorization: `Bearer ${adminLogin.accessToken}` },
    };
    const adminRes = createMockRes();
    let adminPassed = false;
    authenticate(adminReq, adminRes, () => {
      requireAdmin(adminReq, adminRes, () => {
        adminPassed = true;
      });
    });
    expect(adminPassed).toBe(true);
  });
});
