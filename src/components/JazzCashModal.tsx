import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Download,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Upload,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { User, PricingPlan } from '../types';

interface JazzCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'pro' | 'enterprise' | string | PricingPlan;
  user: User | null;
  onPaymentSuccess: (upgradedPlan: string, transaction: any) => void;
}

export const JazzCashModal: React.FC<JazzCashModalProps> = ({
  isOpen,
  onClose,
  plan,
  user,
  onPaymentSuccess,
}) => {
  const OFFICIAL_JAZZCASH_NUMBER = '03176901963';
  const OFFICIAL_ACCOUNT_TITLE = 'Abdullah / ThinkPulse AI';

  // Determine plan details
  const planObj: any = typeof plan === 'object' && plan !== null ? plan : null;
  const planId = planObj?.id || (typeof plan === 'string' ? plan : 'pro');
  const planName = planObj?.name || (planId === 'enterprise' ? 'ThinkPulse Enterprise Sovereign' : 'ThinkPulse Pro Creator');
  const pricePkr = planObj?.pricePkr || (planId === 'enterprise' ? 19999 : 4999);

  const [senderMobile, setSenderMobile] = useState('');
  const [trxId, setTrxId] = useState('');
  const [depositSlipRef, setDepositSlipRef] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(OFFICIAL_JAZZCASH_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Proof screenshot must be less than 5MB.');
      return;
    }

    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProofImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSender = senderMobile.replace(/[^0-9]/g, '');
    if (cleanSender.length < 11) {
      setError('Please provide a valid 11-digit sender JazzCash number (e.g. 03171234567).');
      return;
    }

    if (!trxId.trim()) {
      setError('Please provide the JazzCash Transaction ID (TID) received via SMS.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('thinkpulse_token') || '';
      const res = await fetch('/api/payment/submit-jazzcash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          planId,
          planName,
          amountPkr: pricePkr,
          senderMobile: cleanSender,
          transactionId: trxId.trim(),
          depositSlipRef: depositSlipRef.trim() || undefined,
          proofImageBase64: proofImageBase64 || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment submission failed');
      }

      setSubmissionResult(data.payment);
      onPaymentSuccess(planId, data.payment);
    } catch (err: any) {
      setError(err.message || 'JazzCash transaction could not be recorded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSlip = () => {
    if (!submissionResult) return;
    const content = `================================================
    THINKPULSE AI - JAZZCASH MANUAL DEPOSIT RECEIPT
================================================
Payment Ref ID:       ${submissionResult.id}
Transaction TID:      ${submissionResult.transactionId}
Official Merchant:    ${OFFICIAL_JAZZCASH_NUMBER} (${OFFICIAL_ACCOUNT_TITLE})
Sender Account:       ${submissionResult.senderMobile}
Plan Requested:       ${submissionResult.planName}
Amount Paid:          PKR ${submissionResult.amountPkr.toLocaleString()}
Status:               ${submissionResult.status.toUpperCase()}
Submitted At:         ${new Date(submissionResult.submittedAt).toLocaleString()}
User Email:           ${submissionResult.userEmail}
------------------------------------------------
Note: Your payment proof has been submitted to the
verification team. Plans are automatically unlocked
upon validation.
================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ThinkPulse_JazzCash_${submissionResult.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0a0d14] border border-amber-500/40 shadow-2xl shadow-amber-950/40 overflow-hidden text-slate-100 font-sans max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#b30006] via-[#d31820] to-[#f99b1c] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md flex items-center justify-center">
              <span className="font-extrabold text-[#b30006] text-xs tracking-tighter">Jazz</span>
              <span className="font-extrabold text-slate-900 text-xs tracking-tighter">Cash</span>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">JazzCash Payment Verification</h3>
              <p className="text-[11px] text-white/90">Manual Bank & Mobile Wallet Deposit (Pakistan)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {submissionResult ? (
            /* Submission Success Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white font-heading">
                  ادائیگی کا اندراج ہو گیا ہے!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Payment reference recorded. Status is currently <strong className="text-amber-400 uppercase">Pending Review</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Transaction ID (TID):</span>
                  <span className="text-amber-400 font-bold">{submissionResult.transactionId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Plan:</span>
                  <span className="text-white">{submissionResult.planName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="text-emerald-400 font-bold">PKR {submissionResult.amountPkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-500">Sender Number:</span>
                  <span className="text-slate-300">{submissionResult.senderMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold uppercase">
                    ⏳ Pending Review
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                The administrative team will verify your JazzCash TID against official statements. Your plan quota will be activated immediately upon approval.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDownloadSlip}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Reference</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <span>Back to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Selected Plan Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-mono uppercase font-bold tracking-wider">
                    Plan Selected
                  </span>
                  <h4 className="text-sm font-bold text-white">{planName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-amber-400 font-heading">
                    ₨ {pricePkr.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">PKR / Monthly</span>
                </div>
              </div>

              {/* Official Receiver Account Notice */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 via-[#1c0809] to-amber-950/60 border border-red-500/40">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-amber-300 font-mono uppercase tracking-wider">
                      Official Receiver Account Details
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                    Verified Merchant
                  </span>
                </div>

                <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-red-500/20">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">JazzCash Mobile No:</span>
                    <span className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider">
                      {OFFICIAL_JAZZCASH_NUMBER}
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      Account Title: <strong className="text-white">{OFFICIAL_ACCOUNT_TITLE}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1 leading-relaxed">
                <p className="font-semibold text-amber-300 text-[11px]">
                  طریقہ کار (3-Step Payment Process):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>
                    اوپر دیے گئے نمبر <strong className="text-amber-400">{OFFICIAL_JAZZCASH_NUMBER}</strong> پر ₨ {pricePkr.toLocaleString()} بھیجیں۔
                  </li>
                  <li>
                    رقم کی ادائیگی کے بعد SMS سے موصولہ 10 سے 12 ہندسوں کی <strong className="text-white">Transaction ID (TID)</strong> اور اپنا موبائل نمبر درج کریں۔
                  </li>
                  <li>
                    فارم جمع کروائیں۔ ایڈمن تصدیق کے فوراً بعد آپ کا پلان خودکار طور پر چالو ہو جائے گا۔
                  </li>
                </ol>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your JazzCash Sender Mobile Number (بھیجنے والے کا موبائل نمبر)
                  </label>
                  <input
                    type="text"
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="03171234567"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    JazzCash Transaction ID (TID / Trx ID)
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 0824910283 or 1092837162"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank Reference / Deposit Slip No. (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={depositSlipRef}
                    onChange={(e) => setDepositSlipRef(e.target.value)}
                    placeholder="e.g. REF-482910"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Proof Screenshot / Receipt Image (اختیاری لیکن تجویز کردہ)
                  </label>
                  <div className="relative">
                    <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/60 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{proofFileName || 'Upload payment screenshot (PNG/JPG, Max 5MB)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#b30006] via-[#d31820] to-[#f99b1c] hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Payment Proof...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Payment Proof for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
