export type ViewMode = 
  | 'landing' 
  | 'auth-login' 
  | 'auth-signup' 
  | 'auth-forgot-password'
  | 'auth-reset-password'
  | 'dashboard-chat' 
  | 'dashboard-sport'
  | 'dashboard-image' 
  | 'dashboard-video' 
  | 'dashboard-music'
  | 'dashboard-transcribe'
  | 'dashboard-voice' 
  | 'dashboard-website' 
  | 'dashboard-app' 
  | 'dashboard-docs' 
  | 'dashboard-library' 
  | 'dashboard-domains'
  | 'dashboard-support' 
  | 'dashboard-settings'
  | 'dashboard-profile'
  | 'dashboard-pricing'
  | 'dashboard-my-payments'
  | 'dashboard-admin'
  | 'seo-abdullah-brand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'basic' | 'pro' | 'premium' | 'enterprise' | string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  isEmailVerified?: boolean;
  unlimited?: boolean;
  unlimitedAccess?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  tokensUsed?: number;
  monthlyLimit?: number;
  tokensRemaining?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  pricePkr: number;
  priceUsd: number;
  billingPeriod: string;
  features: string[];
  tokenLimit: number;
  status: 'active' | 'archived';
  description?: string;
  isPopular?: boolean;
}

export interface PaymentRecord {
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
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNote?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  createdAt: string;
  read: boolean;
}

export interface JazzCashPaymentRequest {
  mobileNumber: string;
  plan: string;
  amountPkr: number;
  cnicLast6?: string;
  transactionId?: string;
  userEmail: string;
  depositSlipRef?: string;
  proofImageBase64?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinkingProcess?: string;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url?: string;
    base64?: string;
  }[];
  modelUsed?: string;
  isStreaming?: boolean;
  generatedImage?: {
    url: string;
    prompt: string;
    aspectRatio?: string;
  };
  generatedApp?: {
    title: string;
    description: string;
    code: string;
    appType?: string;
  };
  generatingStatus?: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  model: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';
  thinkingEnabled: boolean;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  aspectRatio: string;
  resolution: string;
  createdAt: string;
  tags?: string[];
  referenceImage?: string;
}

export interface GeneratedVideoItem {
  id: string;
  prompt: string;
  videoUrl: string;
  aspectRatio: '16:9' | '9:16';
  durationSeconds?: number;
  duration?: number;
  createdAt: string;
  style?: string;
  thumbnailUrl?: string;
}

export interface GeneratedWebsiteProject {
  id: string;
  title: string;
  prompt: string;
  description: string;
  category: 'restaurant' | 'portfolio' | 'saas' | 'ecommerce' | 'agency' | 'blog' | 'landing';
  theme: {
    primaryColor: string;
    font: string;
    mode: 'dark' | 'light';
  };
  files: {
    html: string;
    css: string;
    js: string;
  };
  isDeployed?: boolean;
  deploySlug?: string;
  liveUrl?: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
  revisions: {
    prompt: string;
    timestamp: string;
  }[];
}

export interface GeneratedAppProject {
  id: string;
  title: string;
  prompt: string;
  description: string;
  appType: 'kanban' | 'notes' | 'calculator' | 'fitness' | 'quiz' | 'custom';
  code: string;
  isDeployed?: boolean;
  deploySlug?: string;
  liveUrl?: string;
  deployedAt?: string;
  createdAt: string;
}

export interface DomainRequest {
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

export interface DeploymentItem {
  id: string;
  projectId: string;
  title: string;
  type: 'website' | 'app';
  liveUrl: string;
  slug: string;
  deployedAt: string;
  status: 'live' | 'inactive';
}

export interface LibraryItem {
  id: string;
  type: 'conversation' | 'image' | 'video' | 'website' | 'app' | 'document' | 'audio';
  title: string;
  createdAt: string;
  size?: string;
  metadata?: Record<string, any>;
  data: any;
}

export type SupportedLanguage = 'en' | 'hi' | 'ur' | 'es' | 'fr' | 'ar';
