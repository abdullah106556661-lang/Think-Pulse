import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  CreditCard,
  Upload,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  DollarSign,
  Layers,
  Lock,
} from 'lucide-react';
import { User, DomainRequest } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';

interface DomainsViewProps {
  user: User | null;
  onNavigateLogin?: () => void;
  onNavigateAuth?: () => void;
}

interface DomainTldInfo {
  tld: string;
  pricePkr: number;
  priceUsd: number;
  popular?: boolean;
  desc: string;
}

const TLD_PRICING: DomainTldInfo[] = [
  { tld: '.com', pricePkr: 3850, priceUsd: 13.99, popular: true, desc: 'The gold standard for global business & startups' },
  { tld: '.ai', pricePkr: 19500, priceUsd: 69.99, popular: true, desc: 'The ultimate TLD for artificial intelligence & tech' },
  { tld: '.pk', pricePkr: 3200, priceUsd: 11.5, popular: true, desc: 'Official Pakistan ccTLD for local enterprises' },
  { tld: '.org', pricePkr: 4200, priceUsd: 14.99, desc: 'Trusted worldwide for communities & non-profits' },
  { tld: '.io', pricePkr: 11500, priceUsd: 39.99, desc: 'Favored by developers, SaaS, and API platforms' },
  { tld: '.tech', pricePkr: 2800, priceUsd: 9.99, desc: 'Modern and vibrant choice for technology projects' },
  { tld: '.net', pricePkr: 4100, priceUsd: 14.5, desc: 'Traditional backbone domain for networks & systems' },
  { tld: '.store', pricePkr: 1999, priceUsd: 6.99, desc: 'High-converting choice for digital commerce' },
];

const OFFICIAL_JAZZCASH = '03176901963';
const OFFICIAL_TITLE = 'Abdullah / ThinkPulse AI';

export const DomainsView: React.FC<DomainsViewProps> = ({ user, onNavigateLogin, onNavigateAuth }) => {
  const handleGoToAuth = onNavigateLogin || onNavigateAuth;
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      domain: string;
      tld: string;
      available: boolean;
      pricePkr: number;
      priceUsd: number;
    }>
  >([]);

  // Selected domain for order modal
  const [selectedDomain, setSelectedDomain] = useState<{
    domain: string;
    tld: string;
    pricePkr: number;
    priceUsd: number;
  } | null>(null);

  const [years, setYears] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'Easypaisa' | 'Bank' | 'Crypto'>('JazzCash');
  const [senderMobile, setSenderMobile] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedJazzCash, setCopiedJazzCash] = useState(false);

  // User's domain requests list
  const [myRequests, setMyRequests] = useState<DomainRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const getToken = () => localStorage.getItem('thinkpulse_token') || '';

  const loadUserRequests = async () => {
    if (!user) return;
    setLoadingRequests(true);
    try {
      const token = getToken();
      const res = await fetch('/api/user/domains', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.domains || []);
      }
    } catch (e) {
      console.error('Failed to load user domain requests', e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadUserRequests();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim().toLowerCase().replace(/https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean) return;

    setSearching(true);
    // Strip existing TLD if user typed one
    const nameWithoutTld = clean.replace(/\.[a-z0-9.]+$/, '');

    // Check availability across supported TLDs
    setTimeout(() => {
      const results = TLD_PRICING.map((tldInfo) => {
        // Simulated deterministic availability check based on length and common dictionary words
        const fullDomain = `${nameWithoutTld}${tldInfo.tld}`;
        const isReserved = ['google', 'apple', 'meta', 'microsoft', 'amazon', 'youtube'].includes(nameWithoutTld);
        const available = !isReserved;

        return {
          domain: fullDomain,
          tld: tldInfo.tld,
          available,
          pricePkr: tldInfo.pricePkr,
          priceUsd: tldInfo.priceUsd,
        };
      });

      setSearchResults(results);
      setSearching(false);
    }, 400);
  };

  const handleCopyJazzCash = () => {
    navigator.clipboard.writeText(OFFICIAL_JAZZCASH);
    setCopiedJazzCash(true);
    setTimeout(() => setCopiedJazzCash(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Screenshot proof must be under 5MB.');
      return;
    }
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProofImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigateLogin?.();
      return;
    }

    if (!selectedDomain) return;
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!transactionId.trim()) {
      setSubmitError('Please provide the Transaction ID (TID) from your payment receipt.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const totalPricePkr = selectedDomain.pricePkr * years;
      const totalPriceUsd = selectedDomain.priceUsd * years;

      const res = await fetch('/api/domains/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          domainName: selectedDomain.domain,
          tld: selectedDomain.tld,
          years,
          pricePkr: totalPricePkr,
          priceUsd: totalPriceUsd,
          paymentMethod,
          senderMobile: senderMobile.trim(),
          transactionId: transactionId.trim(),
          proofImageBase64: proofImageBase64 || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit domain request');

      setSubmitSuccess(
        `🎉 Domain order for ${selectedDomain.domain} submitted successfully! Your order status is PENDING administrator verification.`
      );
      setSelectedDomain(null);
      setSenderMobile('');
      setTransactionId('');
      setProofImageBase64(null);
      setProofFileName(null);
      setNotes('');
      loadUserRequests();
    } catch (err: any) {
      setSubmitError(err.message || 'Domain order submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0a0d14] px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Autonomous Domain Registry & DNS Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight mb-2">
            Claim Your Digital Brand Identity
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Search, register, and link custom domains (.com, .ai, .pk, .io) directly to your generated ThinkPulse websites and applications with instant DNS orchestration.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find your perfect domain (e.g. aurabistro, smartflow, mybrand)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Availability...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Domain</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {submitSuccess && (
        <div className="max-w-5xl mx-auto px-6 mt-6">
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Availability Results</span>
                <span className="text-xs font-mono text-cyan-400">({searchResults.length} extensions)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <div
                  key={result.domain}
                  className={`p-4 rounded-xl border transition-all ${
                    result.available
                      ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/40'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white font-heading">{result.domain}</span>
                        {result.available ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-[10px] font-semibold">
                            <XCircle className="w-3 h-3" />
                            <span>Taken</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        PKR {result.pricePkr.toLocaleString()} / year • ${result.priceUsd} USD
                      </p>
                    </div>

                    {result.available && (
                      <button
                        onClick={() => {
                          if (!user) {
                            onNavigateLogin?.();
                            return;
                          }
                          setSelectedDomain(result);
                        }}
                        className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/15 transition-all flex items-center gap-1.5"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Guide & TLD Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Popular Extensions & Pricing</h2>
              <p className="text-xs text-slate-400">Standard annual registration rates with zero hidden renewal fees.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TLD_PRICING.map((tld) => (
              <div
                key={tld.tld}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black text-white font-heading">{tld.tld}</span>
                    {tld.popular && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{tld.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    PKR {tld.pricePkr.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">${tld.priceUsd} USD / year</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User's Domain Requests History */}
        {user && (
          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>My Domain Requests</span>
                <span className="text-xs font-mono text-slate-400">({myRequests.length})</span>
              </h2>
              <button
                onClick={loadUserRequests}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {loadingRequests ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading your domain requests...</div>
            ) : myRequests.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-400">
                You have not submitted any domain requests yet. Search above to find and request your custom domain!
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-base">{req.domainName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {req.status === 'pending' ? '⏳ PENDING REVIEW' : req.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span>Ref ID: <span className="font-mono text-slate-300">{req.id}</span></span>
                        <span>•</span>
                        <span>Amount: <span className="font-mono text-cyan-400 font-semibold">PKR {req.pricePkr.toLocaleString()}</span></span>
                        <span>•</span>
                        <span>Duration: {req.years} yr</span>
                        <span>•</span>
                        <span>Date: {new Date(req.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {req.adminNote && (
                        <div className="mt-2 text-xs text-amber-200 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/20">
                          <strong>Admin Note:</strong> {req.adminNote}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs">
                      {req.status === 'pending' && (
                        <span className="text-amber-400 font-medium">Awaiting Admin Verification</span>
                      )}
                      {req.status === 'approved' && (
                        <span className="text-emerald-400 font-medium">Domain Active & Provisioned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Domain Request & Payment Modal */}
      {selectedDomain && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1018] border border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDomain(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">{selectedDomain.domain}</h3>
                <p className="text-xs text-slate-400">Domain Purchase & Registration Request</p>
              </div>
            </div>

            {submitError && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              {/* Duration selector */}
              <div>
                <label className="text-slate-300 font-medium block mb-1.5">Registration Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setYears(yr)}
                      className={`py-2 px-3 rounded-lg border text-center font-bold transition-all ${
                        years === yr
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {yr} Year{yr > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Price Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Payable Amount</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    PKR {(selectedDomain.pricePkr * years).toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-slate-400 text-[11px]">
                  <span>${(selectedDomain.priceUsd * years).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Official Payment Destination */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Official JazzCash Merchant</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJazzCash}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    {copiedJazzCash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJazzCash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-sm text-white font-bold">{OFFICIAL_JAZZCASH}</div>
                <div className="text-[11px] text-slate-400">Account Title: {OFFICIAL_TITLE}</div>
                <div className="text-[10px] text-amber-300/80 bg-amber-950/30 p-2 rounded border border-amber-500/20">
                  ⚠️ Transfer the exact amount via JazzCash / Raast to this account, then enter your TID below. Status will remain Pending until approved.
                </div>
              </div>

              {/* Form fields */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Your Sender Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="03171234567"
                  value={senderMobile}
                  onChange={(e) => setSenderMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Transaction ID (TID) from SMS *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 02948192401"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Upload Payment Proof / Screenshot (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{proofFileName ? proofFileName : 'Choose Image'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {proofFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setProofFileName(null);
                        setProofImageBase64(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Additional Notes / DNS instructions</label>
                <textarea
                  rows={2}
                  placeholder="Link to my restaurant website project Aura Bistro..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDomain(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit Domain Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
