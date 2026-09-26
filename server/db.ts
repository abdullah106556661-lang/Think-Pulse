import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  plan: string;
  tokensUsed: number;
  monthlyLimit: number;
  tokensRemaining: number;
  unlimited?: boolean;
  unlimitedAccess?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface DbSession {
  token: string;
  userId: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
  ip?: string;
}

export interface DbPricingPlan {
  id: string;
  name: string;
  pricePkr: number;
  priceUsd: number;
  billingPeriod: string;
  features: string[];
  tokenLimit: number;
  status: 'active' | 'archived';
  isDefault?: boolean;
  isPopular?: boolean;
  description?: string;
}

export interface DbSubscription {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  startDate: string;
  endDate: string;
  paymentMethod: string;
  paymentRequestId?: string;
  amountPkr?: number;
}

export interface DbPaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amountPkr: number;
  jazzCashNumber: string;
  senderMobile: string;
  transactionId: string;
  depositSlipRef?: string;
  proofImageBase64?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface DbAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target?: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ip?: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  read: boolean;
  createdAt: string;
}

export interface DbSiteSettings {
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  officialJazzCashNumber: string;
  officialJazzCashTitle: string;
  announcement: {
    enabled: boolean;
    text: string;
    type: 'info' | 'warning' | 'success';
  };
  toolAccess: {
    chat: boolean;
    image: boolean;
    video: boolean;
    sport: boolean;
    website: boolean;
    app: boolean;
    voice: boolean;
    docs: boolean;
  };
}

export interface DbSystemError {
  id: string;
  timestamp: string;
  endpoint: string;
  message: string;
  stack?: string;
}

export interface DbProject {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'website' | 'app';
  title: string;
  prompt: string;
  description: string;
  category?: string;
  theme?: any;
  files: {
    html: string;
    css?: string;
    js?: string;
  };
  isDeployed?: boolean;
  deploySlug?: string;
  liveUrl?: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
  revisions?: any[];
}

export interface DbDomainRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  domainName: string;
  tld: string;
  years: number;
  pricePkr: number;
  priceUsd: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  senderMobile?: string;
  transactionId?: string;
  proofImageBase64?: string;
  notes?: string;
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface DbGenerationRecord {
  id: string;
  userId: string;
  userEmail?: string;
  tool: 'chat' | 'image' | 'video' | 'website' | 'app' | 'doc' | 'sport' | 'voice';
  prompt: string;
  status: 'success' | 'failed';
  outputPreview?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: Record<string, DbUser>; // keyed by email (lowercase)
  sessions: Record<string, DbSession>; // keyed by token
  plans: Record<string, DbPricingPlan>; // keyed by planId
  subscriptions: Record<string, DbSubscription>; // keyed by subId
  payments: DbPaymentRequest[];
  auditLogs: DbAuditLog[];
  notifications: DbNotification[];
  siteSettings: DbSiteSettings;
  systemErrors: DbSystemError[];
  loginAttempts: Record<string, { count: number; lockedUntil?: number }>;
  projects: Record<string, DbProject>;
  domains: DbDomainRequest[];
  generations: DbGenerationRecord[];
}

const isVercelEnvironment = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_DIR = isVercelEnvironment ? '/tmp' : path.join(process.cwd(), 'data');

// Safely determine database file: If DATABASE_PATH is a remote URL (e.g. Supabase https://...), do NOT treat as local file path
const rawDbEnv = (process.env.DATABASE_PATH || process.env.DATABASE_URL || '').trim();
const isRemoteUrl = rawDbEnv.startsWith('http://') || rawDbEnv.startsWith('https://') || rawDbEnv.includes('://');
export const REMOTE_DATABASE_URL = isRemoteUrl ? rawDbEnv : (process.env.SUPABASE_URL || '');

const DB_FILE = isVercelEnvironment
  ? path.join('/tmp', 'thinkpulse_db.json')
  : (!isRemoteUrl && rawDbEnv
      ? path.resolve(process.cwd(), rawDbEnv)
      : path.join(DB_DIR, 'thinkpulse_db.json'));

const MASTER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'abdullah106556661@gmail.com').toLowerCase().trim();
const MASTER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1065566b';
const OFFICIAL_JAZZCASH_NUMBER = process.env.OFFICIAL_JAZZCASH_NUMBER || '03176901963';
const OFFICIAL_JAZZCASH_TITLE = process.env.OFFICIAL_JAZZCASH_TITLE || 'Abdullah / ThinkPulse AI';

class PersistentDatabase {
  private data: DatabaseSchema;
  private isLoaded: boolean = false;

  constructor() {
    this.data = this.getDefaultSchema();
    this.load();
  }

  private getDefaultSchema(): DatabaseSchema {
    const adminHash = bcrypt.hashSync(MASTER_ADMIN_PASSWORD, 10);
    const demoHash = bcrypt.hashSync('password123', 10);

    const defaultPlans: Record<string, DbPricingPlan> = {
      free: {
        id: 'free',
        name: 'Free Starter',
        pricePkr: 0,
        priceUsd: 0,
        billingPeriod: 'Forever Free',
        features: [
          'Standard ThinkPulse Flash Model',
          'Code Generation & Debugging',
          'Standard Response Latency',
          '100,000 Monthly AI Tokens',
          'Export Conversations (JSON / MD)',
        ],
        tokenLimit: 100000,
        status: 'active',
        isDefault: true,
        description: 'Ideal for everyday queries, students, and light exploration.',
      },
      basic: {
        id: 'basic',
        name: 'Basic Plan',
        pricePkr: 1999,
        priceUsd: 9,
        billingPeriod: 'Monthly',
        features: [
          'ThinkPulse Flash + Lite Models',
          '300,000 Monthly AI Tokens',
          'Image Studio High-Definition Visuals',
          'App & Website Builders (Standard)',
          'Community Discord / Email Support',
        ],
        tokenLimit: 300000,
        status: 'active',
        description: 'Essential toolkit for creative hobbyists and junior developers.',
      },
      pro: {
        id: 'pro',
        name: 'Pro Strategist',
        pricePkr: 4999,
        priceUsd: 29,
        billingPeriod: 'Monthly',
        features: [
          'Full Multimodal Reasoning (Deep Thinking)',
          '1,000,000 Monthly AI Tokens',
          'Sport Team AI Strategy & Lineup Engine',
          'Video Studio Clip Generation',
          'Document AI & PDF Analysis',
          'Priority Server Pipeline & Faster Speeds',
        ],
        tokenLimit: 1000000,
        status: 'active',
        isPopular: true,
        description: 'Designed for professionals, tactical sports analysts, and creators.',
      },
      premium: {
        id: 'premium',
        name: 'Enterprise Ultra',
        pricePkr: 14999,
        priceUsd: 79,
        billingPeriod: 'Monthly',
        features: [
          'Unlimited Multimodal Generation',
          'Unlimited Monthly AI Tokens',
          'Interactive Live Voice Call (Two-way)',
          'Dedicated High-Priority Compute Node',
          'Full White-label Project Exports',
          'VIP 24/7 Dedicated Administrator Support',
        ],
        tokenLimit: 999999999,
        status: 'active',
        description: 'Complete unrestricted power for enterprises and high-scale production.',
      },
    };

    const initialUsers: Record<string, DbUser> = {
      [MASTER_ADMIN_EMAIL]: {
        id: 'usr_master_admin',
        name: 'Abdullah (System Administrator)',
        email: MASTER_ADMIN_EMAIL,
        passwordHash: adminHash,
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        plan: 'premium',
        tokensUsed: 0,
        monthlyLimit: 999999999,
        tokensRemaining: 999999999,
        unlimited: true,
        unlimitedAccess: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      'demo@thinkpulse.ai': {
        id: 'usr_demo_account',
        name: 'Alex Rivera (Demo Account)',
        email: 'demo@thinkpulse.ai',
        passwordHash: demoHash,
        role: 'user',
        status: 'active',
        isEmailVerified: true,
        plan: 'pro',
        tokensUsed: 12500,
        monthlyLimit: 1000000,
        tokensRemaining: 987500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    return {
      users: initialUsers,
      sessions: {},
      plans: defaultPlans,
      subscriptions: {},
      payments: [
        {
          id: 'JC-892401',
          userId: 'usr_demo_account',
          userEmail: 'client.karachi@gmail.com',
          userName: 'Zubair Khan',
          planId: 'pro',
          planName: 'Pro Strategist',
          amountPkr: 4999,
          jazzCashNumber: OFFICIAL_JAZZCASH_NUMBER,
          senderMobile: '0300-9876543',
          transactionId: 'TXN-JC-982142',
          status: 'approved',
          adminNote: 'Verified with JazzCash SMS receipt.',
          submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          reviewedAt: new Date(Date.now() - 3600000 * 23).toISOString(),
          reviewedBy: MASTER_ADMIN_EMAIL,
        },
      ],
      auditLogs: [
        {
          id: 'audit_init',
          timestamp: new Date().toISOString(),
          actorEmail: 'system',
          action: 'SYSTEM_INITIALIZATION',
          status: 'success',
          details: 'Secure persistent database initialized with bcrypt encryption.',
        },
      ],
      notifications: [],
      siteSettings: {
        maintenanceMode: false,
        allowRegistrations: true,
        officialJazzCashNumber: OFFICIAL_JAZZCASH_NUMBER,
        officialJazzCashTitle: OFFICIAL_JAZZCASH_TITLE,
        announcement: {
          enabled: true,
          text: 'Welcome to ThinkPulse AI 2.0! Upgrade via JazzCash (03176901963) for instant verification.',
          type: 'info',
        },
        toolAccess: {
          chat: true,
          image: true,
          video: true,
          sport: true,
          website: true,
          app: true,
          voice: true,
          docs: true,
        },
      },
      systemErrors: [],
      loginAttempts: {},
      projects: {},
      domains: [],
      generations: [],
    };
  }

  private load(): void {
    try {
      const targetDir = path.dirname(DB_FILE);
      if (!fs.existsSync(targetDir)) {
        try { fs.mkdirSync(targetDir, { recursive: true }); } catch {}
      }

      // If on Vercel and /tmp DB does not exist yet, copy from packaged data/thinkpulse_db.json if available
      if (isVercelEnvironment && !fs.existsSync(DB_FILE)) {
        const bundledFile = path.join(process.cwd(), 'data', 'thinkpulse_db.json');
        if (fs.existsSync(bundledFile)) {
          try {
            fs.copyFileSync(bundledFile, DB_FILE);
          } catch {}
        }
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.getDefaultSchema(),
          ...parsed,
          siteSettings: { ...this.getDefaultSchema().siteSettings, ...(parsed.siteSettings || {}) },
          plans: { ...this.getDefaultSchema().plans, ...(parsed.plans || {}) },
          projects: parsed.projects || {},
          domains: parsed.domains || [],
          generations: parsed.generations || [],
        };
      } else {
        this.save();
      }

      // Ensure Master Admin account exists and is always active
      this.ensureMasterAdmin();
      this.isLoaded = true;
    } catch (err) {
      console.warn('[Database] Using memory-based fallback schema:', err);
      this.data = this.getDefaultSchema();
      this.ensureMasterAdmin();
      this.isLoaded = true;
    }
  }

  public save(): void {
    try {
      const targetDir = path.dirname(DB_FILE);
      if (!fs.existsSync(targetDir)) {
        try { fs.mkdirSync(targetDir, { recursive: true }); } catch {}
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.warn('[Database] Storage write skipped (in-memory mode active):', err);
    }
  }

  private ensureMasterAdmin(): void {
    const existing = this.data.users[MASTER_ADMIN_EMAIL];
    if (!existing) {
      const hash = bcrypt.hashSync(MASTER_ADMIN_PASSWORD, 10);
      this.data.users[MASTER_ADMIN_EMAIL] = {
        id: 'usr_master_admin',
        name: 'Abdullah (System Administrator)',
        email: MASTER_ADMIN_EMAIL,
        passwordHash: hash,
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        plan: 'premium',
        tokensUsed: 0,
        monthlyLimit: 999999999,
        tokensRemaining: 999999999,
        unlimited: true,
        unlimitedAccess: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.save();
    } else {
      // Ensure admin role and privileges are never revoked
      existing.role = 'admin';
      existing.unlimited = true;
      existing.unlimitedAccess = true;
      existing.status = 'active';
      existing.plan = 'premium';
    }
  }

  // --- Security & Rate Limiting ---
  public checkLoginAttempts(key: string): { allowed: boolean; waitSeconds?: number } {
    const attempt = this.data.loginAttempts[key];
    if (!attempt) return { allowed: true };

    const now = Date.now();
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      const waitSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds };
    }

    if (attempt.lockedUntil && attempt.lockedUntil <= now) {
      delete this.data.loginAttempts[key];
      return { allowed: true };
    }

    return { allowed: true };
  }

  public recordFailedLogin(key: string): { locked: boolean; waitSeconds?: number } {
    const now = Date.now();
    const attempt = this.data.loginAttempts[key] || { count: 0 };
    attempt.count += 1;

    // Lock after 5 failed attempts for 10 minutes (600,000 ms)
    if (attempt.count >= 5) {
      attempt.lockedUntil = now + 10 * 60 * 1000;
      this.data.loginAttempts[key] = attempt;
      this.save();
      return { locked: true, waitSeconds: 600 };
    }

    this.data.loginAttempts[key] = attempt;
    return { locked: false };
  }

  public clearFailedLogin(key: string): void {
    if (this.data.loginAttempts[key]) {
      delete this.data.loginAttempts[key];
      this.save();
    }
  }

  // --- Users ---
  public getUserByEmail(email: string): DbUser | null {
    if (!email) return null;
    return this.data.users[email.toLowerCase().trim()] || null;
  }

  public getUserById(id: string): DbUser | null {
    const users = Object.values(this.data.users);
    return users.find((u) => u.id === id) || null;
  }

  public getAllUsers(): DbUser[] {
    return Object.values(this.data.users);
  }

  public createUser(userData: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): DbUser {
    const emailNorm = userData.email.toLowerCase().trim();
    if (this.data.users[emailNorm]) {
      throw new Error('User already exists');
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: DbUser = {
      ...userData,
      id,
      email: emailNorm,
      createdAt: now,
      updatedAt: now,
    };

    this.data.users[emailNorm] = newUser;
    this.save();
    return newUser;
  }

  public updateUser(email: string, updates: Partial<DbUser>): DbUser {
    const user = this.getUserByEmail(email);
    if (!user) throw new Error('User not found');

    const updated: DbUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.users[email.toLowerCase().trim()] = updated;
    this.save();
    return updated;
  }

  public deleteUser(id: string): boolean {
    const user = this.getUserById(id);
    if (!user) return false;
    if (user.email === MASTER_ADMIN_EMAIL) {
      throw new Error('Master administrator account cannot be deleted');
    }

    delete this.data.users[user.email];

    // Remove any active sessions
    for (const [token, s] of Object.entries(this.data.sessions)) {
      if (s.userId === id) {
        delete this.data.sessions[token];
      }
    }

    this.save();
    return true;
  }

  // --- Sessions ---
  public createSession(user: DbUser, userAgent?: string, ip?: string, rememberMe?: boolean): DbSession {
    const token = `tp_${user.role === 'admin' ? 'adm' : 'usr'}_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const now = new Date();
    // 30 days if rememberMe, otherwise 7 days
    const durationDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const session: DbSession = {
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: now.toISOString(),
      expiresAt,
      userAgent,
      ip,
    };

    this.data.sessions[token] = session;
    this.save();
    return session;
  }

  public getSession(token: string): DbSession | null {
    if (!token) return null;
    const session = this.data.sessions[token];
    if (!session) return null;

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      delete this.data.sessions[token];
      this.save();
      return null;
    }

    return session;
  }

  public removeSession(token: string): void {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  // --- Plans ---
  public getPlans(): DbPricingPlan[] {
    return Object.values(this.data.plans);
  }

  public getPlanById(planId: string): DbPricingPlan | null {
    return this.data.plans[planId] || null;
  }

  public savePlan(plan: DbPricingPlan): DbPricingPlan {
    this.data.plans[plan.id] = plan;
    this.save();
    return plan;
  }

  public deletePlan(planId: string): boolean {
    if (planId === 'free') throw new Error('Cannot delete default free tier');
    if (this.data.plans[planId]) {
      delete this.data.plans[planId];
      this.save();
      return true;
    }
    return false;
  }

  // --- Payments & Subscriptions ---
  public getPayments(): DbPaymentRequest[] {
    return [...this.data.payments];
  }

  public getPaymentsByUser(userId: string): DbPaymentRequest[] {
    return this.data.payments.filter((p) => p.userId === userId);
  }

  public getPaymentById(id: string): DbPaymentRequest | null {
    return this.data.payments.find((p) => p.id === id) || null;
  }

  public createPaymentRequest(reqData: Omit<DbPaymentRequest, 'id' | 'status' | 'submittedAt'>): DbPaymentRequest {
    const id = `JC-${Date.now().toString().slice(-6)}`;
    const newPayment: DbPaymentRequest = {
      ...reqData,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    this.data.payments.unshift(newPayment);
    this.save();
    return newPayment;
  }

  public reviewPayment(
    paymentId: string,
    status: 'approved' | 'rejected',
    adminNote?: string,
    adminEmail?: string
  ): DbPaymentRequest {
    const payment = this.getPaymentById(paymentId);
    if (!payment) throw new Error('Payment request not found');

    payment.status = status;
    payment.adminNote = adminNote;
    payment.reviewedAt = new Date().toISOString();
    payment.reviewedBy = adminEmail || MASTER_ADMIN_EMAIL;

    // If approved, automatically upgrade user subscription and tokens!
    if (status === 'approved') {
      const user = this.getUserById(payment.userId) || this.getUserByEmail(payment.userEmail);
      if (user) {
        const plan = this.getPlanById(payment.planId);
        user.plan = payment.planId;
        if (plan) {
          user.monthlyLimit = plan.tokenLimit;
          user.tokensRemaining = (user.tokensRemaining || 0) + plan.tokenLimit;
          if (plan.id === 'premium') {
            user.unlimited = true;
            user.unlimitedAccess = true;
          }
        }
        this.updateUser(user.email, user);

        // Record active subscription
        const subId = `sub_${Date.now()}`;
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        this.data.subscriptions[subId] = {
          id: subId,
          userId: user.id,
          userEmail: user.email,
          planId: payment.planId,
          planName: payment.planName,
          status: 'active',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          paymentMethod: 'JazzCash Manual Transfer',
          paymentRequestId: payment.id,
          amountPkr: payment.amountPkr,
        };

        // Notify user
        this.addNotification({
          userId: user.id,
          title: '🎉 Payment Verified & Plan Activated',
          message: `Your JazzCash payment of PKR ${payment.amountPkr.toLocaleString()} has been verified! Your ${payment.planName} plan is now active.`,
          type: 'payment',
        });
      }
    } else if (status === 'rejected') {
      // Notify user of rejection with admin note
      const user = this.getUserById(payment.userId) || this.getUserByEmail(payment.userEmail);
      if (user) {
        this.addNotification({
          userId: user.id,
          title: '⚠️ Payment Request Update',
          message: `Your JazzCash payment request for PKR ${payment.amountPkr.toLocaleString()} was rejected.${adminNote ? ` Reason: ${adminNote}` : ' Please verify your transaction details and re-submit.'}`,
          type: 'warning',
        });
      }
    }

    this.save();
    return payment;
  }

  public getSubscriptions(): DbSubscription[] {
    return Object.values(this.data.subscriptions);
  }

  public getUserSubscription(userId: string): DbSubscription | null {
    const subs = Object.values(this.data.subscriptions).filter((s) => s.userId === userId);
    return subs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0] || null;
  }

  // --- Audit Logs ---
  public addAuditLog(log: Omit<DbAuditLog, 'id' | 'timestamp'>): DbAuditLog {
    const newLog: DbAuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    // Cap audit logs to latest 500
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return newLog;
  }

  public getAuditLogs(limit = 100): DbAuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- Notifications ---
  public addNotification(notif: Omit<DbNotification, 'id' | 'createdAt' | 'read'>): DbNotification {
    const newNotif: DbNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  public getUserNotifications(userId: string): DbNotification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public markNotificationRead(notifId: string): void {
    const n = this.data.notifications.find((item) => item.id === notifId);
    if (n) {
      n.read = true;
      this.save();
    }
  }

  // --- Site Settings ---
  public getSettings(): DbSiteSettings {
    return { ...this.data.siteSettings };
  }

  public updateSettings(updates: Partial<DbSiteSettings>): DbSiteSettings {
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...updates,
    };
    this.save();
    return this.data.siteSettings;
  }

  // --- System Errors ---
  public logError(endpoint: string, message: string, stack?: string): void {
    const err: DbSystemError = {
      id: `err_${Date.now()}`,
      timestamp: new Date().toISOString(),
      endpoint,
      message,
      stack,
    };
    this.data.systemErrors.unshift(err);
    if (this.data.systemErrors.length > 100) {
      this.data.systemErrors = this.data.systemErrors.slice(0, 100);
    }
    this.save();
  }

  public getSystemErrors(): DbSystemError[] {
    return [...this.data.systemErrors];
  }

  public clearSystemErrors(): void {
    this.data.systemErrors = [];
    this.save();
  }

  // --- Projects & Deployments ---
  public saveProject(project: Omit<DbProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DbProject {
    const now = new Date().toISOString();
    const id = project.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const existing = this.data.projects[id];

    const saved: DbProject = {
      ...project,
      id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      revisions: [
        ...(existing?.revisions || []),
        { timestamp: now, prompt: project.prompt || 'Save Project' }
      ]
    };

    this.data.projects[id] = saved;
    this.save();
    return saved;
  }

  public getProject(id: string): DbProject | null {
    return this.data.projects[id] || null;
  }

  public getProjectBySlug(slug: string): DbProject | null {
    return Object.values(this.data.projects).find(
      (p) => p.deploySlug === slug || p.id === slug
    ) || null;
  }

  public getUserProjects(userId: string): DbProject[] {
    return Object.values(this.data.projects)
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getAllProjects(): DbProject[] {
    return Object.values(this.data.projects).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public deleteProject(id: string, userId?: string): boolean {
    const proj = this.data.projects[id];
    if (!proj) return false;
    if (userId && proj.userId !== userId) return false;
    delete this.data.projects[id];
    this.save();
    return true;
  }

  public deployProject(id: string, hostUrl: string, userId?: string): { success: boolean; liveUrl?: string; slug?: string; error?: string } {
    const proj = this.data.projects[id];
    if (!proj) return { success: false, error: 'Project not found' };
    if (userId && proj.userId !== userId) return { success: false, error: 'Unauthorized to deploy this project' };

    // Generate clean semantic slug
    const cleanTitle = (proj.title || 'site')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);
    const shortHash = Math.random().toString(36).substring(2, 6);
    const slug = proj.deploySlug || `${cleanTitle}-${shortHash}`;
    
    // Determine route prefix based on type
    const prefix = proj.type === 'app' ? 'app' : 'site';
    const liveUrl = `${hostUrl}/${prefix}/${slug}`;

    proj.isDeployed = true;
    proj.deploySlug = slug;
    proj.liveUrl = liveUrl;
    proj.deployedAt = new Date().toISOString();
    proj.updatedAt = new Date().toISOString();

    this.save();

    // Log deployment
    this.addAuditLog({
      actorEmail: proj.userEmail || 'user',
      action: 'DEPLOY_PROJECT',
      target: liveUrl,
      status: 'success',
      details: `Project "${proj.title}" deployed successfully to ${liveUrl}`,
    });

    return { success: true, liveUrl, slug };
  }

  // --- Domain Requests ---
  public createDomainRequest(req: Omit<DbDomainRequest, 'id' | 'status' | 'submittedAt'>): DbDomainRequest {
    const id = `dom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReq: DbDomainRequest = {
      ...req,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    this.data.domains.unshift(newReq);

    // Also create a linked payment request so it appears in the Payments queue
    this.data.payments.unshift({
      id: `PAY-${id.toUpperCase()}`,
      userId: req.userId,
      userEmail: req.userEmail,
      userName: req.userName,
      planId: `domain_${req.tld}`,
      planName: `Domain Registration (${req.domainName})`,
      amountPkr: req.pricePkr,
      jazzCashNumber: OFFICIAL_JAZZCASH_NUMBER,
      senderMobile: req.senderMobile || 'N/A',
      transactionId: req.transactionId || 'PENDING_DOM',
      proofImageBase64: req.proofImageBase64,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      adminNote: `Domain registration request for ${req.domainName} (${req.years} year)`,
    });

    this.addNotification({
      userId: req.userId,
      title: '🌐 Domain Purchase Request Submitted',
      message: `Your domain purchase request for ${req.domainName} (PKR ${req.pricePkr.toLocaleString()}) has been submitted. Status: PENDING Admin review.`,
      type: 'info',
    });

    this.addAuditLog({
      actorEmail: req.userEmail,
      action: 'DOMAIN_PURCHASE_REQUEST',
      target: req.domainName,
      status: 'info',
      details: `User requested domain "${req.domainName}" for PKR ${req.pricePkr}`,
    });

    this.save();
    return newReq;
  }

  public getUserDomainRequests(userId: string): DbDomainRequest[] {
    return this.data.domains.filter((d) => d.userId === userId);
  }

  public getAllDomainRequests(): DbDomainRequest[] {
    return [...this.data.domains];
  }

  public reviewDomainRequest(id: string, status: 'approved' | 'rejected', adminNote?: string, adminEmail?: string): DbDomainRequest | null {
    const dom = this.data.domains.find((d) => d.id === id);
    if (!dom) return null;

    dom.status = status;
    dom.reviewedAt = new Date().toISOString();
    dom.reviewedBy = adminEmail || 'Super Admin';
    if (adminNote) dom.adminNote = adminNote;

    // Send user notification
    this.addNotification({
      userId: dom.userId,
      title: status === 'approved' ? '🎉 Domain Request Approved!' : '⚠️ Domain Request Update',
      message: status === 'approved'
        ? `Your domain request for ${dom.domainName} has been approved by admin! DNS provisioning is active.`
        : `Your domain request for ${dom.domainName} was rejected.${adminNote ? ` Note: ${adminNote}` : ''}`,
      type: status === 'approved' ? 'success' : 'warning',
    });

    this.addAuditLog({
      actorEmail: adminEmail || 'admin',
      action: status === 'approved' ? 'DOMAIN_APPROVE' : 'DOMAIN_REJECT',
      target: dom.domainName,
      status: status === 'approved' ? 'success' : 'warning',
      details: `Admin ${status} domain request for ${dom.domainName}. Note: ${adminNote || 'None'}`,
    });

    this.save();
    return dom;
  }

  // --- Generation Activity Records ---
  public addGenerationRecord(record: Omit<DbGenerationRecord, 'id' | 'createdAt'>): DbGenerationRecord {
    const rec: DbGenerationRecord = {
      ...record,
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.generations.unshift(rec);
    if (this.data.generations.length > 500) {
      this.data.generations = this.data.generations.slice(0, 500);
    }
    this.save();
    return rec;
  }

  public getUserGenerations(userId: string, limit = 50): DbGenerationRecord[] {
    return this.data.generations.filter((g) => g.userId === userId).slice(0, limit);
  }

  public getAllGenerations(limit = 100): DbGenerationRecord[] {
    return this.data.generations.slice(0, limit);
  }
}

export const db = new PersistentDatabase();
export { MASTER_ADMIN_EMAIL, OFFICIAL_JAZZCASH_NUMBER, OFFICIAL_JAZZCASH_TITLE };
