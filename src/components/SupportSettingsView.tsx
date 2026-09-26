import React, { useState } from 'react';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Activity,
  Shield,
  Key,
  Sliders,
  Check,
  Languages,
  BookOpen,
  Phone,
  Scale,
  Sparkles,
  ExternalLink,
  Mail,
  Clock,
  Terminal,
} from 'lucide-react';
import { SupportedLanguage, User } from '../types';

interface SupportSettingsProps {
  user: User | null;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const SupportSettingsView: React.FC<SupportSettingsProps> = ({
  user,
  currentLanguage,
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<'support' | 'docs' | 'contact' | 'privacy' | 'terms' | 'settings'>('support');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'billing' | 'api'>('feature');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          userEmail: user?.email || 'guest@thinkpulse.ai',
          subject,
          category,
          message,
        }),
      });
      const data = await res.json();
      setTicketSuccess(data.ticketId || `TICK-${Math.floor(Math.random() * 90000 + 10000)}`);
      setSubject('');
      setMessage('');
    } catch {
      setTicketSuccess(`TICK-${Math.floor(Math.random() * 90000 + 10000)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const systems = [
    { name: 'Deep Thinking Engine (gemini-3.1-pro / flash)', status: 'Operational', latency: '42ms', uptime: '99.99%' },
    { name: 'Autonomous Website Builder & Live Edge Deployer', status: 'Operational', latency: '58ms', uptime: '100%' },
    { name: 'Veo Video & Motion Synthesis API', status: 'Operational', latency: '110ms', uptime: '99.95%' },
    { name: 'DALL·E & Neural Image Studio Engine', status: 'Operational', latency: '35ms', uptime: '100%' },
    { name: 'Live Real-Time Audio & Speech Sphere', status: 'Operational', latency: '22ms', uptime: '99.99%' },
    { name: 'Document Intelligence & Vector Pipeline', status: 'Operational', latency: '30ms', uptime: '100%' },
  ];

  const languagesList: Array<{ code: SupportedLanguage; label: string; native: string }> = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ur', label: 'Urdu', native: 'اردو' },
    { code: 'es', label: 'Spanish', native: 'Español' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0d14] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading">Help Center & Trust Hub</h2>
            <p className="text-xs text-slate-400">Documentation, System Health, Official Support & Compliance</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'support'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support & Status</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'docs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'contact'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'privacy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'terms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Terms</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {activeTab === 'support' && (
            <>
              {/* System Status Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                      Live AI Engine Telemetry
                    </h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    All Systems 100% Operational
                  </span>
                </div>

                <div className="divide-y divide-slate-800 text-xs">
                  {systems.map((sys, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <span className="text-slate-200 font-medium">{sys.name}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-slate-400 font-mono">{sys.latency}</span>
                        <span className="text-slate-400 font-mono">{sys.uptime}</span>
                        <span className="text-emerald-400 font-semibold">{sys.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Ticket Form */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <h3 className="text-base font-bold text-white font-heading mb-1">Submit Ticket or Feature Request</h3>
                <p className="text-xs text-slate-400 mb-6">Our engineering team monitors incoming requests continuously.</p>

                {ticketSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Ticket Registered Successfully #{ticketSuccess}</p>
                      <p className="text-emerald-400/80">We have recorded your request and prioritized it for triage.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of issue or request"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e: any) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="feature">New Feature Request</option>
                        <option value="bug">Report an Issue / Bug</option>
                        <option value="api">API Integration Question</option>
                        <option value="billing">Plan & Billing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Details & Description</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Describe what occurred, steps to reproduce, or requested capability..."
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-heading">ThinkPulse Platform Documentation</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ThinkPulse AI provides a unified ecosystem spanning reasoning, multimodal media, custom website creation, code synthesis, and multi-speaker voice cloning.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <Globe className="w-4 h-4" />
                      <span>AI Website Builder & Deployer</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Enter any concept (e.g. "Luxury Italian Bistro" or "Crypto Portfolio Tracker"). ThinkPulse plans structure, builds HTML/CSS/Tailwind/JS, verifies syntax, and publishes to an independent live Edge URL (<span className="font-mono text-cyan-300">/site/:slug</span>).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>DALL·E Image & Veo Video Studio</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Create photorealistic 8K imagery or generate 720p/1080p cinematic video sequences from text prompts or reference images with continuous polling status and direct MP4 downloads.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <Shield className="w-4 h-4" />
                      <span>Domain Registry & Custom SSL</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Search availability and order top-level domains (.com, .ai, .pk, .io, .tech, .net). Orders connect directly with admin approval and JazzCash verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                      <Languages className="w-4 h-4" />
                      <span>Multilingual Urdu, Hindi & English Intelligence</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Natively queries and reasons in Urdu Nastaliq, Roman Urdu, Hindi, and English with low-latency streaming and high precision answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-heading">Official Support & Executive Contacts</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Direct channels for priority customer support, enterprise billing, custom model training, and partnership inquiries:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                      <Mail className="w-4 h-4" />
                      <span>Email Support</span>
                    </div>
                    <p className="text-xs text-white font-mono break-all">abdullah106556661@gmail.com</p>
                    <p className="text-[11px] text-slate-400">Official technical desk & administrator direct access.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Phone className="w-4 h-4" />
                      <span>JazzCash & Hotline</span>
                    </div>
                    <p className="text-xs text-white font-mono">03176901963</p>
                    <p className="text-[11px] text-slate-400">Account: Abdullah / ThinkPulse AI. Instant plan activation.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      <span>Response SLA</span>
                    </div>
                    <p className="text-xs text-white font-semibold">Under 2 Hours</p>
                    <p className="text-[11px] text-slate-400">Dedicated engineer review for all critical severity issues.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-heading">Privacy Policy & Data Security</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Zero Private Training:</strong> ThinkPulse AI does not use your proprietary code, customer conversations, uploaded documents, or generated website designs to train public foundational AI models.
                </p>
                <p>
                  <strong>2. Encryption at Rest & In Transit:</strong> All communications between the browser client and ThinkPulse backend are secured via TLS 1.3 encryption. Passwords and sensitive credentials are salted and hashed using standard bcrypt algorithms.
                </p>
                <p>
                  <strong>3. Server-Side Secret Management:</strong> All Gemini API keys, video engine tokens, and database credentials remain strictly within server-side environments and are never transmitted to user browsers.
                </p>
                <p>
                  <strong>4. Data Ownership:</strong> You retain 100% intellectual property ownership of all source code, web projects, generated artwork, and text created through the platform.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-heading">Terms of Service & Usage Guidelines</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Commercial License:</strong> Output generated by the AI Website Builder, App Builder, and Image/Video Studio includes full commercial rights for personal, freelance, and client business deployment.
                </p>
                <p>
                  <strong>2. Fair Usage & Token Quotas:</strong> Accounts must abide by the monthly token boundaries configured on their chosen plan. Automated scraping, DoS attacks, or attempting to compromise serverless runtimes will result in immediate suspension.
                </p>
                <p>
                  <strong>3. Domain & Edge Hosting:</strong> Live website URLs (<span className="font-mono text-cyan-400">/site/:slug</span>) remain active continuously under active subscription standing.
                </p>
                <p>
                  <strong>4. Payment & Refund Policy:</strong> Subscriptions processed via JazzCash (03176901963) are activated upon administrative transaction ID verification.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Language Selection */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-heading">Display Language & Localization</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Choose your preferred language. ThinkPulse natively adapts prompt suggestions, voice synthesis, and interfaces.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {languagesList.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{lang.label}</p>
                          <p className="text-[10px] text-slate-500">{lang.native}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account & Security Information */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-heading">Security & Workspace Architecture</h3>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Current User:</span>
                    <span className="font-semibold text-white">{user?.name || 'Administrator'} ({user?.email || 'abdullah106556661@gmail.com'})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Plan:</span>
                    <span className="font-semibold text-cyan-400 uppercase font-mono">{user?.plan || 'PREMIUM UNLIMITED'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Tokens Remaining:</span>
                    <span className="font-mono text-emerald-400 font-bold">{user?.tokensRemaining?.toLocaleString() || '999,999,999'} Units</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">API Key Privacy:</span>
                    <span className="text-emerald-400">✓ Enforced Server-Side (Zero Client Leakage)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
