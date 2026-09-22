import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  CreditCard,
  Zap,
  Activity,
  Key,
  Lock,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Settings,
  Database,
  Smartphone,
  Eye,
  CheckCircle2,
  Crown,
  Flame,
  ArrowUpRight,
  UserCheck,
  Sliders,
  Trash2,
  Edit2,
  Plus,
  X,
  FileText,
  AlertTriangle,
  Globe,
  Radio,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { User, PricingPlan, PaymentRecord } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';

const SUPER_ADMIN_EMAIL = 'abdullah106556661@gmail.com';

interface AdminPortalProps {
  currentUser: User | null;
  onUpdateCurrentUser: (user: User) => void;
  onNavigateChat?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onNavigateChat,
}) => {
  const isEmailMatch = currentUser?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
  const [serverAuthStatus, setServerAuthStatus] = useState<'checking' | 'authorized' | 'denied'>(
    isEmailMatch ? 'checking' : 'denied'
  );
  const [denialDetails, setDenialDetails] = useState<string>(
    !isEmailMatch
      ? `Current user (${currentUser?.email || 'Guest'}) does not match the authorized Super Admin email.`
      : ''
  );

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'payments' | 'pricing' | 'settings' | 'logs' | 'security'
  >('overview');

  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    activeSubscribers: 0,
    totalRevenuePkr: 0,
    pendingPaymentsCount: 0,
    totalPaymentsCount: 0,
    totalTokensBurned: 0,
    totalPlansCount: 0,
    systemUptime: '99.99%',
    serverStatus: 'Operational',
    masterAdminEmail: SUPER_ADMIN_EMAIL,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({
    maintenanceMode: false,
    allowRegistrations: true,
    officialJazzCashNumber: '03176901963',
    officialJazzCashTitle: 'Abdullah / ThinkPulse AI',
    announcement: '',
    toolAccess: {
      chat: true,
      sportAi: true,
      imageStudio: true,
      videoStudio: true,
      voiceStudio: true,
      websiteBuilder: true,
    },
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemErrors, setSystemErrors] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);

  // Edit User Modal state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editPlan, setEditPlan] = useState<string>('free');
  const [editTokensRemaining, setEditTokensRemaining] = useState<number>(100000);
  const [editUnlimited, setEditUnlimited] = useState<boolean>(false);

  // Plan Edit/Create Modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPricePkr, setPlanPricePkr] = useState(0);
  const [planPriceUsd, setPlanPriceUsd] = useState(0);
  const [planTokenLimit, setPlanTokenLimit] = useState(100000);
  const [planDescription, setPlanDescription] = useState('');
  const [planFeatures, setPlanFeatures] = useState('');
  const [planIsPopular, setPlanIsPopular] = useState(false);

  // Proof image preview modal
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAdminToken = () => localStorage.getItem('thinkpulse_token') || 'thinkpulse_super_admin';

  // Strict server-side verification
  useEffect(() => {
    let active = true;

    const verifyServerAuth = async () => {
      if (!currentUser || currentUser.email?.toLowerCase().trim() !== SUPER_ADMIN_EMAIL) {
        if (active) {
          setServerAuthStatus('denied');
          setDenialDetails('Administrative access is strictly restricted to abdullah106556661@gmail.com.');
        }
        return;
      }

      const token = getAdminToken();
      if (!token) {
        if (active) {
          setServerAuthStatus('denied');
          setDenialDetails('Missing admin authentication session token. Please log in as Super Admin.');
        }
        return;
      }

      try {
        const res = await fetch('/api/admin/verify', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (active) {
            setServerAuthStatus('denied');
            setDenialDetails(errData.error || 'Server rejected administrative credentials.');
          }
          return;
        }

        const data = await res.json();
        if (data.verified && data.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
          if (active) {
            setServerAuthStatus('authorized');
            fetchAdminData();
          }
        } else {
          if (active) {
            setServerAuthStatus('denied');
            setDenialDetails('Server confirmed your session does not possess Super Admin authority.');
          }
        }
      } catch (err: any) {
        if (active) {
          setServerAuthStatus('denied');
          setDenialDetails(err.message || 'Server authentication connection failed.');
        }
      }
    };

    verifyServerAuth();

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Fetch all Admin Data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const [overviewRes, usersRes, paymentsRes, plansRes, settingsRes, auditRes, errorRes] =
        await Promise.all([
          fetch('/api/admin/overview', { headers }),
          fetch('/api/admin/users', { headers }),
          fetch('/api/admin/payments', { headers }),
          fetch('/api/admin/plans', { headers }),
          fetch('/api/admin/settings', { headers }),
          fetch('/api/admin/audit-logs', { headers }),
          fetch('/api/admin/system-errors', { headers }),
        ]);

      if (overviewRes.ok) setStats(await overviewRes.json());
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans || []);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSiteSettings(data.settings || {});
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLogs(data.logs || []);
      }
      if (errorRes.ok) {
        const data = await errorRes.json();
        setSystemErrors(data.errors || []);
      }
    } catch (e) {
      console.warn('Admin fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  // User Management Handlers
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          role: editRole,
          status: editStatus,
          plan: editPlan,
          tokensRemaining: Number(editTokensRemaining),
          unlimited: editUnlimited,
        }),
      });

      if (res.ok) {
        setSelectedUser(null);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (userToDelete.email === SUPER_ADMIN_EMAIL) {
      alert('Master admin account cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user ${userToDelete.email}?`)) {
      return;
    }

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Payment Verification Handlers
  const handleReviewPayment = async (paymentId: string, status: 'approved' | 'rejected') => {
    const adminNote = prompt(
      status === 'approved'
        ? 'Optional note for approval (or leave blank):'
        : 'Reason for rejecting this transaction:'
    );

    if (status === 'rejected' && adminNote === null) return;

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/payments/${paymentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status, adminNote: adminNote || '' }),
      });

      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pricing Plan Handlers
  const handleOpenPlanModal = (plan?: PricingPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name);
      setPlanPricePkr(plan.pricePkr);
      setPlanPriceUsd(plan.priceUsd);
      setPlanTokenLimit(plan.tokenLimit);
      setPlanDescription(plan.description || '');
      setPlanFeatures(plan.features?.join('\n') || '');
      setPlanIsPopular(Boolean(plan.isPopular));
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanPricePkr(4999);
      setPlanPriceUsd(25);
      setPlanTokenLimit(1000000);
      setPlanDescription('');
      setPlanFeatures('1,000,000 AI Tokens\nAccess to Gemini Models\nExport Conversations');
      setPlanIsPopular(false);
    }
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      const featuresArray = planFeatures
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const planData = {
        id: editingPlan?.id || undefined,
        name: planName.trim(),
        pricePkr: Number(planPricePkr),
        priceUsd: Number(planPriceUsd),
        billingPeriod: 'monthly',
        tokenLimit: Number(planTokenLimit),
        description: planDescription.trim(),
        features: featuresArray,
        isPopular: planIsPopular,
      };

      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(planData),
      });

      if (res.ok) {
        setPlanModalOpen(false);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Site Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        alert('Site settings updated successfully.');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Clear Error Logs
  const handleClearErrors = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/system-errors/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) setSystemErrors([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Change Admin Password
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Admin password successfully updated!' });
        setNewPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (e: any) {
      setPasswordMsg({ type: 'error', text: e.message });
    }
  };

  // Render Checking State
  if (serverAuthStatus === 'checking') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-[#07090e]">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <ThinkPulseLogo size="lg" showText={false} animated />
        </div>
        <h3 className="text-lg font-bold text-white font-heading">
          Verifying Super Admin Authorization...
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1.5 max-w-sm leading-relaxed">
          Checking server-side tokens for <span className="text-cyan-400">{SUPER_ADMIN_EMAIL}</span>
        </p>
      </div>
    );
  }

  // Render Denied State
  if (serverAuthStatus === 'denied' || !isEmailMatch) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-[#07090e]">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-4 shadow-2xl shadow-red-950/60">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono font-bold mb-3">
          <span>HTTP 403 FORBIDDEN</span>
        </div>
        <h2 className="text-xl font-extrabold text-white font-heading">
          Administrative Access Denied
        </h2>
        <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
          {denialDetails || 'This portal is restricted to'} <strong className="text-amber-400 font-mono">{SUPER_ADMIN_EMAIL}</strong>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onNavigateChat && (
            <button
              onClick={onNavigateChat}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold shadow-lg"
            >
              Return to Chat
            </button>
          )}
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = payments.filter((p) => {
    if (paymentStatusFilter === 'all') return true;
    return p.status === paymentStatusFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-y-auto font-sans text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-heading">Super Admin Management Suite</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                MASTER_ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as: <strong className="text-amber-300 font-mono">{SUPER_ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-white">Admin Quota:</span>
            <span className="text-xs font-extrabold text-cyan-300 font-mono">∞ Unlimited Usage</span>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh All Admin Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview ({stats.totalUsers} Users)</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Quotas</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4 text-red-400" />
          <span>JazzCash Verification ({stats.pendingPaymentsCount || 0} Pending)</span>
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pricing & Plans ({plans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Site Settings & JazzCash Merchant</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit & System Errors</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Password</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-extrabold text-white font-heading">
                  {stats.totalUsers || 0}
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <span>{stats.activeUsers || 0} Active accounts</span>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Verified Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-heading">
                  PKR {(stats.totalRevenuePkr || 0).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  JazzCash Approved Settlements
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Pending Verifications</span>
                  <Smartphone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-amber-400 font-heading">
                  {stats.pendingPaymentsCount || 0}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Awaiting Admin Approval
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Active Subscribers</span>
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-extrabold text-white font-heading">
                  {stats.activeSubscribers || 0}
                </div>
                <span className="text-[11px] text-cyan-400 mt-1 block">Pro & Enterprise tiers</span>
              </div>
            </div>

            {/* Quick Action Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('payments')}
                className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">Review JazzCash Submissions</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {stats.pendingPaymentsCount || 0} submissions pending verification
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">Manage User Roles & Quotas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inspect, adjust tokens, suspend or promote users
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-cyan-400" />
              </div>

              <div
                onClick={() => setActiveTab('pricing')}
                className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">Configure Pricing Plans</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust PKR / USD prices and token limits
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNTS & QUOTAS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredUsers.length} of {users.length} accounts
              </span>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Role & Status</th>
                      <th className="py-3 px-4">Current Plan</th>
                      <th className="py-3 px-4">Token Quota</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const isMaster = u.email === SUPER_ADMIN_EMAIL;
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name || 'Anonymous User'}</span>
                              {isMaster && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">
                                  MASTER
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === 'admin'
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {u.role || 'user'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.status === 'suspended'
                                    ? 'bg-red-950 text-red-300 border border-red-500/40'
                                    : 'bg-emerald-950/80 text-emerald-300'
                                }`}
                              >
                                {u.status || 'active'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                              {u.plan || 'Free'}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono">
                            {u.unlimited ? (
                              <span className="text-cyan-400 font-bold">∞ Unlimited</span>
                            ) : (
                              <span>{(u.tokensRemaining ?? 100000).toLocaleString()} tokens</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setEditRole(u.role || 'user');
                                  setEditStatus(u.status || 'active');
                                  setEditPlan(u.plan || 'free');
                                  setEditTokensRemaining(u.tokensRemaining ?? 100000);
                                  setEditUnlimited(Boolean(u.unlimited));
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                                title="Edit User"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {!isMaster && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-950 text-red-400 border border-red-500/30 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JAZZCASH PAYMENTS VERIFICATION */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaymentStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    paymentStatusFilter === 'all'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Submissions ({payments.length})
                </button>
                <button
                  onClick={() => setPaymentStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    paymentStatusFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⏳ Pending Review ({payments.filter((p) => p.status === 'pending').length})
                </button>
                <button
                  onClick={() => setPaymentStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    paymentStatusFilter === 'approved'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✓ Approved ({payments.filter((p) => p.status === 'approved').length})
                </button>
                <button
                  onClick={() => setPaymentStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    paymentStatusFilter === 'rejected'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✗ Rejected ({payments.filter((p) => p.status === 'rejected').length})
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Official Merchant Receiver: <strong className="text-amber-300 font-mono">03176901963</strong>
              </span>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                No JazzCash payment submissions matching this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-amber-300">
                          TID: {p.transactionId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : p.status === 'rejected'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="text-slate-300">
                        Sender Mobile: <strong className="font-mono text-white">{p.senderMobile}</strong> • User:{' '}
                        <span className="text-cyan-300 font-mono">{p.userEmail}</span> ({p.userName})
                      </div>

                      <div className="text-slate-400 text-[11px]">
                        Plan: <strong className="text-white">{p.planName}</strong> • Amount:{' '}
                        <strong className="text-emerald-400 font-mono">PKR {p.amountPkr.toLocaleString()}</strong> • Submitted:{' '}
                        {new Date(p.submittedAt).toLocaleString()}
                      </div>

                      {p.depositSlipRef && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Bank Reference Slip: {p.depositSlipRef}
                        </div>
                      )}

                      {p.adminNote && (
                        <div className="text-[11px] text-amber-300 italic">
                          Admin Note: {p.adminNote}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {p.proofImageBase64 && (
                        <button
                          onClick={() => setPreviewProofImage(p.proofImageBase64!)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Proof Screenshot</span>
                        </button>
                      )}

                      {p.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewPayment(p.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Upgrade User</span>
                          </button>
                          <button
                            onClick={() => handleReviewPayment(p.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs"
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRICING & PLANS */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Dynamic Pricing Plans</h3>
                <p className="text-xs text-slate-400">
                  Configure subscription plans, pricing in PKR and USD, token allowances, and features.
                </p>
              </div>
              <button
                onClick={() => handleOpenPlanModal()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-white font-heading">{p.name}</h4>
                      {p.isPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-black text-amber-400 font-mono mb-2">
                      PKR {p.pricePkr.toLocaleString()}
                      <span className="text-xs text-slate-400 font-normal font-sans">
                        {' '}
                        (${p.priceUsd}) / month
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">{p.description}</p>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-cyan-300 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{(p.tokenLimit || 100000).toLocaleString()} AI Tokens Included</span>
                    </div>

                    <div className="space-y-1.5">
                      {(p.features || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenPlanModal(p)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Edit Plan
                    </button>
                    {p.id !== 'free' && (
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-500/30"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SITE SETTINGS & ANNOUNCEMENTS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Global Platform Configuration</h3>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-white block">Maintenance Mode</label>
                  <p className="text-[11px] text-slate-400">
                    When active, non-admin visitors will see a maintenance notice.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.maintenanceMode}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, maintenanceMode: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
              </div>

              {/* Allow Registration */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-white block">Allow New User Registrations</label>
                  <p className="text-[11px] text-slate-400">
                    Enable or disable public signup forms.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.allowRegistrations}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, allowRegistrations: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
              </div>

              {/* Official JazzCash Merchant Configuration */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Official Pakistan JazzCash Merchant Details
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    JazzCash Account Number
                  </label>
                  <input
                    type="text"
                    value={siteSettings.officialJazzCashNumber}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, officialJazzCashNumber: e.target.value })
                    }
                    placeholder="03176901963"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-amber-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    JazzCash Account Title / Merchant Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.officialJazzCashTitle}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, officialJazzCashTitle: e.target.value })
                    }
                    placeholder="Abdullah / ThinkPulse AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Global Site Announcement Banner (Leave blank to hide)
                </label>
                <input
                  type="text"
                  value={siteSettings.announcement || ''}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, announcement: e.target.value })
                  }
                  placeholder="e.g. System upgrade scheduled for tonight at 2:00 AM PKT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
              >
                Save Site Settings
              </button>
            </div>
          </form>
        )}

        {/* TAB 6: AUDIT & SYSTEM ERRORS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Audit Logs */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Security & Admin Audit Logs (Last 100 Actions)</span>
              </h3>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No audit logs recorded yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono flex items-start justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">{log.action}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                              log.status === 'success'
                                ? 'text-emerald-400 bg-emerald-950'
                                : log.status === 'warning'
                                ? 'text-amber-400 bg-amber-950'
                                : 'text-cyan-400 bg-cyan-950'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">{log.details}</p>
                        <p className="text-slate-500 text-[10px]">
                          Actor: {log.actorEmail} {log.target ? `• Target: ${log.target}` : ''}{' '}
                          {log.ip ? `• IP: ${log.ip}` : ''}
                        </p>
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System Errors */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>System Error Telemetry ({systemErrors.length})</span>
                </h3>
                {systemErrors.length > 0 && (
                  <button
                    onClick={handleClearErrors}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Clear Error Logs
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {systemErrors.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No system errors recorded.</p>
                ) : (
                  systemErrors.map((err) => (
                    <div
                      key={err.id}
                      className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-[11px] font-mono"
                    >
                      <div className="flex justify-between text-red-400 font-bold mb-1">
                        <span>{err.endpoint || 'General Error'}</span>
                        <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 font-sans">{err.error}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ADMIN SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="max-w-md space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Update Super Admin Password</span>
              </h3>
              <p className="text-xs text-slate-400">
                Change the password for <strong className="text-amber-300">{SUPER_ADMIN_EMAIL}</strong>.
              </p>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/50 border border-red-500/40 text-red-300'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Confirm & Save Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* EDIT USER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit User Quota & Permissions</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">User: {selectedUser.email}</p>

            <form onSubmit={handleSaveUserEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e: any) => setEditRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Plan</label>
                <select
                  value={editPlan}
                  onChange={(e: any) => setEditPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="free">Free Starter</option>
                  <option value="pro">Pro Creator</option>
                  <option value="enterprise">Enterprise Sovereign</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Remaining Tokens Allowance
                </label>
                <input
                  type="number"
                  value={editTokensRemaining}
                  onChange={(e) => setEditTokensRemaining(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="unlimitedQuota"
                  checked={editUnlimited}
                  onChange={(e) => setEditUnlimited(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500"
                />
                <label htmlFor="unlimitedQuota" className="text-xs text-slate-300">
                  Grant Unlimited AI Tokens (Bypass Quota Limit)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAN CREATE / EDIT MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
              </h3>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Pro Creator & Sports Strategist"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={planPricePkr}
                    onChange={(e) => setPlanPricePkr(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={planPriceUsd}
                    onChange={(e) => setPlanPriceUsd(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly AI Tokens</label>
                <input
                  type="number"
                  value={planTokenLimit}
                  onChange={(e) => setPlanTokenLimit(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Short description for card"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Features List (One per line)
                </label>
                <textarea
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  rows={4}
                  placeholder="1,000,000 Monthly Tokens&#10;Sport Team AI Tactical Engine&#10;Veo Cinematic Video"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularPlan"
                  checked={planIsPopular}
                  onChange={(e) => setPlanIsPopular(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500"
                />
                <label htmlFor="popularPlan" className="text-xs text-slate-300">
                  Highlight as "Most Popular" Plan
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF IMAGE EXPAND MODAL */}
      {previewProofImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Payment Screenshot Proof</span>
              <button
                onClick={() => setPreviewProofImage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/60 rounded-xl p-2">
              <img
                src={previewProofImage}
                alt="JazzCash Deposit Proof"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
