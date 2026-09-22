import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  CreditCard,
  Flame,
} from 'lucide-react';
import { PricingPlan, User, ViewMode } from '../types';

interface PricingViewProps {
  user: User | null;
  onSelectPlan: (plan: PricingPlan) => void;
  onNavigate: (view: ViewMode) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  user,
  onSelectPlan,
  onNavigate,
}) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const OFFICIAL_JAZZCASH_NUMBER = '03176901963';
  const OFFICIAL_JAZZCASH_TITLE = 'Abdullah / ThinkPulse AI';

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pricing/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const defaultPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Starter Explorer',
      pricePkr: 0,
      priceUsd: 0,
      billingPeriod: 'monthly',
      tokenLimit: 100000,
      status: 'active',
      description: 'Ideal for trying out core ThinkPulse reasoning, chat, and rapid prototyping.',
      features: [
        '100,000 Monthly AI Reasoning Tokens',
        'Access to Gemini 3.8 Flash & Pro Preview',
        'Basic Code & App Synthesis',
        'Standard Response Speeds',
        'Export Conversations (Markdown/JSON)',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Creator & Strategist',
      pricePkr: 4999,
      priceUsd: 24,
      billingPeriod: 'monthly',
      tokenLimit: 1000000,
      status: 'active',
      isPopular: true,
      description: 'Engineered for power users, developers, sports analysts, and creative studios.',
      features: [
        '1,000,000 High-Speed Monthly Tokens',
        'Sport Team AI Tactical Engine (Cricket & Football)',
        'DALL-E 3 & Imagen High-Resolution Studio',
        'Veo Cinematic AI Video Generation (Fast Lane)',
        'Full-Stack Canvas Website & App Sandbox',
        'Voice Studio & Multi-Speaker Audio Synthesis',
        'Priority Neural GPU Execution',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise / Sovereign',
      pricePkr: 19999,
      priceUsd: 89,
      billingPeriod: 'monthly',
      tokenLimit: 5000000,
      status: 'active',
      description: 'Full sovereign computational capacity, unlimited teams, and bespoke integrations.',
      features: [
        '5,000,000 Compute Tokens / Flexible Pooling',
        'Full Live Audio Call & Multi-Agent Orchestration',
        'Dedicated VIP Tactical Playbook Generation',
        'Custom Fine-Tuning & Knowledge Base Embeddings',
        'Direct 24/7 WhatsApp & VIP Engineer Hotline',
        '256-bit Encrypted Sovereign Workspace',
        'Custom Invoicing & SLA Guarantee',
      ],
    },
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-y-auto selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header Banner */}
      <div className="py-12 px-6 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Transparent, Developer-Friendly Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
          Supercharge Your Workspace with ThinkPulse
        </h1>

        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select the optimal plan for your workflow. Domestic users in Pakistan can effortlessly upgrade using manual JazzCash transfers with instant admin verification.
        </p>

        {/* Currency & Frequency Toggle */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setCurrency('PKR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'PKR'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PKR (Pakistani Rupee)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* JazzCash Official Account Notice Box */}
      <div className="max-w-5xl mx-auto px-6 mb-8 w-full">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-red-950/40 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Official Pakistan JazzCash Payment Gateway
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Send funds to Mobile: <strong className="text-amber-300 font-mono text-sm">{OFFICIAL_JAZZCASH_NUMBER}</strong> • Title:{' '}
                <strong className="text-white">{OFFICIAL_JAZZCASH_TITLE}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const proPlan = displayPlans.find((p) => p.id === 'pro') || displayPlans[1];
              onSelectPlan(proPlan);
            }}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Submit Payment Proof</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPlans.map((plan) => {
          const isUserPlan = user?.plan?.toLowerCase() === plan.id.toLowerCase();
          const isPopular = Boolean(plan.isPopular);
          const priceDisplay =
            currency === 'PKR'
              ? plan.pricePkr === 0
                ? 'Free'
                : `PKR ${plan.pricePkr.toLocaleString()}`
              : plan.priceUsd === 0
              ? 'Free'
              : `$${plan.priceUsd}`;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? 'bg-slate-900 border-2 border-cyan-400/80 shadow-2xl shadow-cyan-950/60'
                  : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Flame className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white font-heading">{plan.name}</h3>
                  {isUserPlan && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                      Current
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 min-h-[36px] mb-4 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-heading">{priceDisplay}</span>
                  {plan.pricePkr > 0 && <span className="text-xs text-slate-400">/ month</span>}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 flex items-center gap-2.5 text-xs text-cyan-300">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>{(plan.tokenLimit || 100000).toLocaleString()}</strong> AI tokens included
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Plan Capabilities:
                  </div>
                  {(plan.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => onSelectPlan(plan)}
                  disabled={isUserPlan && plan.id === 'free'}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isUserPlan
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                      : isPopular
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  {isUserPlan ? (
                    <span>Active Plan</span>
                  ) : plan.id === 'free' ? (
                    <span>Get Started Free</span>
                  ) : (
                    <>
                      <span>Upgrade via JazzCash</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
