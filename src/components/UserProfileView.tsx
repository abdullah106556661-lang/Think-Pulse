import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  Sparkles,
  Zap,
  Lock,
  Mail,
  RefreshCw,
  Bell,
  Crown,
  FileCheck,
  Check,
  Smartphone,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { User, ViewMode, PaymentRecord, UserNotification, PricingPlan } from '../types';

interface UserProfileViewProps {
  user: User | null;
  onUpdateUser: (updated: User) => void;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
  onOpenJazzCash: (plan: any) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  onLogout,
  onOpenJazzCash,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'payments' | 'notifications'>('overview');
  
  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Dashboard data
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const getToken = () => localStorage.getItem('thinkpulse_token') || '';

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const token = getToken();
      const res = await fetch('/api/user/dashboard-data', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onUpdateUser(data.user);
          setName(data.user.name);
        }
        if (data.subscription) setSubscription(data.subscription);
        if (data.payments) setPayments(data.payments);
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'Full name cannot be empty.' });
      return;
    }

    setUpdatingProfile(true);
    try {
      const token = getToken();
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      onUpdateUser(data.user);
      localStorage.setItem('thinkpulse_user', JSON.stringify(data.user));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Profile update failed.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Both current and new passwords are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const token = getToken();
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordMsg({ type: 'success', text: 'Password changed successfully! Keep your new password safe.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    setDeletingAccount(true);
    try {
      const token = getToken();
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      localStorage.removeItem('thinkpulse_token');
      localStorage.removeItem('thinkpulse_auth_token');
      localStorage.removeItem('thinkpulse_user');
      onLogout();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`/api/user/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const tokensRemaining = user?.tokensRemaining ?? 100000;
  const monthlyLimit = user?.monthlyLimit ?? 100000;
  const tokensUsed = user?.tokensUsed ?? 0;
  const isUnlimited = Boolean(user?.unlimited || user?.unlimitedAccess);
  const usagePercent = isUnlimited ? 0 : Math.min(100, Math.round((tokensUsed / (monthlyLimit || 1)) * 100));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] overflow-y-auto selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <div className="px-6 py-6 border-b border-slate-800 bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-cyan-950/50">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white font-heading">{user?.name || 'My Account'}</h1>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
              {isUnlimited && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> Unlimited
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard-pricing')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Upgrade / View Plans</span>
          </button>
          <button
            onClick={loadDashboardData}
            disabled={loadingDashboard}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Account Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDashboard ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b border-slate-800/80 bg-[#07090e]/40 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscriptions & JazzCash ({payments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password & Security</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 max-w-5xl space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Profile Edit & Quota Card */}
            <div className="md:col-span-2 space-y-6">
              {/* Token & Plan Quota Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">AI Token & Compute Quota</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase">
                    {user?.plan || 'Free'} Plan
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Usage This Billing Period</span>
                    <span className="text-white font-mono font-semibold">
                      {isUnlimited
                        ? 'Unlimited Active (Super Admin)'
                        : `${tokensUsed.toLocaleString()} / ${monthlyLimit.toLocaleString()} tokens`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usagePercent > 85 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: isUnlimited ? '100%' : `${usagePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Remaining: {isUnlimited ? '∞' : tokensRemaining.toLocaleString()} tokens</span>
                    <span>{isUnlimited ? 'Full Access' : `${100 - usagePercent}% available`}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Need more compute power, sports tactical models, or high-res Veo video?
                  </div>
                  <button
                    onClick={() => onNavigate('dashboard-pricing')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Edit Profile Info */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Edit Profile Information</h3>

                {profileMsg && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/50 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {profileMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Email address is tied to your account identity and cannot be edited.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {updatingProfile ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col: Account Metadata & Security Summary */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Account Security</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Account ID</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[120px]">
                      {user?.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Account Status</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      {user?.status || 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Role</span>
                    <span className="text-slate-200 capitalize font-medium">{user?.role || 'User'}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Member Since</span>
                    <span className="text-slate-300">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Password Encryption</span>
                    <span className="text-cyan-400 font-medium">Bcrypt 10-Salt</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('security')}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Quick JazzCash Payment Gateway Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 to-red-950/30 border border-amber-500/30 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Smartphone className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">JazzCash Direct Pay</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upgrade your plan quickly in Pakistan with direct manual JazzCash transfers.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/20 text-xs">
                  <div className="text-[10px] text-slate-400 uppercase">Merchant Number:</div>
                  <div className="text-amber-300 font-mono font-bold text-sm">03176901963</div>
                  <div className="text-[11px] text-slate-400">Title: Abdullah / ThinkPulse AI</div>
                </div>
                <button
                  onClick={() => onOpenJazzCash('pro')}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Submit Payment Reference
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS & SUBSCRIPTIONS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Active Plan & Subscription</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Current plan: <strong className="text-cyan-400 uppercase">{user?.plan || 'Free'}</strong>
                  {subscription && ` • Renews / Valid until: ${new Date(subscription.expiresAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => onNavigate('dashboard-pricing')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>View All Plans</span>
              </button>
            </div>

            {/* Payment history list */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Manual Payment Submissions (JazzCash)</h3>
                <span className="text-xs text-slate-400">{payments.length} submissions recorded</span>
              </div>

              {payments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No payment submissions found.</p>
                  <button
                    onClick={() => onOpenJazzCash('pro')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                  >
                    Submit New JazzCash Payment
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {payments.map((p) => (
                    <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{p.transactionId}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'approved'
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                                : p.status === 'rejected'
                                ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                                : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {p.status === 'approved'
                              ? '✓ Approved'
                              : p.status === 'rejected'
                              ? '✗ Rejected'
                              : '⏳ Pending Review'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Plan: <span className="text-slate-200">{p.planName}</span> • Amount:{' '}
                          <strong className="text-cyan-300 font-mono">PKR {p.amountPkr.toLocaleString()}</strong> • Sender:{' '}
                          <span className="font-mono text-slate-300">{p.senderMobile}</span>
                        </p>
                        {p.adminNote && (
                          <p className="text-[11px] text-amber-300/90 mt-1 italic">
                            Admin Note: {p.adminNote}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-slate-500">
                        <div>Submitted: {new Date(p.submittedAt).toLocaleDateString()}</div>
                        {p.reviewedAt && (
                          <div>Reviewed: {new Date(p.reviewedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECURITY & PASSWORD TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-xl">
            {/* Change Password Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter your current password followed by your new chosen password.
              </p>

              {passwordMsg && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
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

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {changingPassword ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-bold">Danger Zone: Delete Account</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanently deletes your account, conversations, and quota. This action is irreversible.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition-colors"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Your Notifications</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No notifications at this time.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markNotificationRead(n.id)}
                    className={`p-4 rounded-xl border text-xs transition-colors cursor-pointer ${
                      n.read
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                        : 'bg-cyan-950/30 border-cyan-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete your account? All your chats, library generations, and remaining tokens will be permanently erased.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter Your Password to Confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-900/50 flex items-center gap-2"
                >
                  {deletingAccount ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
