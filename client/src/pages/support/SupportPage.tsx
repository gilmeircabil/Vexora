import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  Lock,
  Wallet,
  CreditCard,
  QrCode
} from 'lucide-react';
import { donationApi } from '../../services/donationApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

export const SupportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [amount, setAmount] = useState<number | ''>(100);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Status from checkout return
  const checkoutStatus = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  const [verifiedDonation, setVerifiedDonation] = useState<any>(null);

  useEffect(() => {
    if (checkoutStatus === 'success' && sessionId) {
      donationApi.getStatus(sessionId).then((res) => {
        if (res.success && res.data) {
          setVerifiedDonation(res.data);
        }
      });
    }
  }, [checkoutStatus, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount === '' || isNaN(Number(amount)) || Number(amount) < 20) {
      setErrorMessage('Please enter a donation amount of at least ₱20.');
      return;
    }

    if (Number(amount) > 500000) {
      setErrorMessage('Maximum single donation amount is ₱500,000.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await donationApi.createCheckout({
        amount: Number(amount),
        displayName: isAnonymous ? 'Anonymous Supporter' : displayName.trim() || 'Supporter',
        isAnonymous,
        message: message.trim(),
        donorEmail: donorEmail.trim() || undefined,
        successUrl: window.location.origin + '/support?status=success',
        cancelUrl: window.location.origin + '/support?status=canceled',
      });

      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        throw new Error(res.error || 'Failed to create payment checkout');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment provider error. Please try again.');
      toast(err.message || 'Payment initiation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Banner if returning from checkout */}
        {checkoutStatus === 'success' && (
          <div className="bg-[#4ADE80]/20 border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_#000]">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black">Thank you for your generous support! ❤️</h3>
                <p className="text-xs font-bold text-neutral-700">
                  Your voluntary contribution helps keep VexoraMods 100% free, open source, and accessible to everyone worldwide.
                </p>
              </div>
            </div>
            {verifiedDonation && (
              <div className="mt-3 p-3.5 bg-white border-2 border-black rounded-xl font-mono text-xs space-y-1">
                <div>Donor: <strong>{verifiedDonation.displayName}</strong></div>
                <div>Amount: <strong>₱{Number(verifiedDonation.amount).toLocaleString()} {verifiedDonation.currency}</strong></div>
                {verifiedDonation.message && <div>Note: "{verifiedDonation.message}"</div>}
              </div>
            )}
            <div className="pt-2">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-[#FACC15] hover:text-black border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000] transition-colors"
              >
                <Trophy className="w-4 h-4 text-[#FACC15]" />
                <span>View Public Leaderboard &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {checkoutStatus === 'canceled' && (
          <div className="bg-amber-50 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="text-xs font-bold text-neutral-800">
              Checkout was canceled. No charges were made. You can try again whenever you're ready!
            </p>
          </div>
        )}

        {/* Hero Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#FACC15] border-2 border-black font-black text-xs uppercase tracking-wider text-black shadow-[2.5px_2.5px_0px_#000]">
            <Heart className="w-4 h-4 text-red-600 fill-red-500" />
            <span>COMMUNITY BACKED · 100% FREE SOFTWARE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
            Support VexoraMods ❤️
          </h1>
          <p className="text-sm sm:text-base font-bold text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            VexoraMods is built to make useful online tools accessible to everyone. Your voluntary contribution
            helps us maintain, improve, and keep the platform free and open source.
          </p>
        </div>

        {/* Main Donation Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Donation Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase font-mono text-black">
                  Choose or Enter Donation Amount (PHP ₱)
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2.5 rounded-xl border-2 border-black font-mono font-black text-xs transition-all ${
                        amount === amt
                          ? 'bg-[#FACC15] shadow-[2.5px_2.5px_0px_#000] -translate-y-0.5'
                          : 'bg-[#FAF7F2] hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      ₱{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Field */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-black text-lg text-black">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="20"
                    max="500000"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Enter custom amount..."
                    className="w-full pl-9 pr-4 py-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-mono text-base font-black text-black shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    required
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-500">
                  <span>Min: ₱20</span>
                  <span>Max: ₱500,000</span>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase font-mono text-black">
                  Your Display Name (Optional)
                </label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maria Santos or Studio XYZ"
                  maxLength={60}
                  className="w-full p-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-bold text-xs sm:text-sm text-black shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FACC15] disabled:opacity-50"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-[#FAF7F2] border-2 border-black rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-black rounded border-2 border-black"
                />
                <div className="text-xs">
                  <span className="font-black text-black block">Make my donation anonymous</span>
                  <span className="font-medium text-neutral-600 block">
                    Your contribution will count toward the total but will display as "Anonymous Supporter" on the leaderboard.
                  </span>
                </div>
              </label>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-black uppercase font-mono text-black">
                  <span>Support Message (Optional)</span>
                  <span className="text-neutral-500 font-normal">{message.length}/280</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="Write an encouraging note or message for the community..."
                  className="w-full p-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-medium text-xs sm:text-sm text-black shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>

              {/* Email (Guest receipt) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase font-mono text-black">
                  Email Address for Receipt (Optional)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="your.email@example.com (Never published publicly)"
                  className="w-full p-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-medium text-xs sm:text-sm text-black shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border-2 border-black rounded-xl text-xs font-bold text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-sm font-black text-black shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-red-600 fill-red-500" />
                    <span>Proceed to Donate ₱{amount ? Number(amount).toLocaleString() : '0'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Information & Transparency Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Accepted Methods Card */}
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
              <h3 className="font-black text-base text-black flex items-center gap-2">
                <Wallet className="w-5 h-5 text-black" />
                <span>Supported Payment Methods</span>
              </h3>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                We accept Philippine mobile wallets and universal payment options via secure gateway:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>GCash</span>
                </div>
                <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  <span>Maya</span>
                </div>
                <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-black" />
                  <span>Visa / MC</span>
                </div>
                <div className="p-2.5 bg-[#FAF7F2] border border-black rounded-xl flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-black" />
                  <span>GrabPay</span>
                </div>
              </div>
            </div>

            {/* Principles & Guarantee Card */}
            <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-700 stroke-[2.5]" />
                <h3 className="font-black text-base text-black">Donation Principles</h3>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>100% Voluntary:</strong> Donating never unlocks exclusive tools. All 33+ tools remain completely free for everyone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Privacy Protected:</strong> We never display or sell your email address or transaction identifiers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Subscriptions:</strong> Every donation is a single, one-time voluntary gift with zero recurring charges.</span>
                </li>
              </ul>
            </div>

            {/* Leaderboard CTA Card */}
            <div className="bg-[#FAF7F2] border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h3 className="font-black text-base text-black">Public Supporter Leaderboard</h3>
              </div>
              <p className="text-xs font-semibold text-neutral-600">
                Check out the all-time and monthly top contributors who help keep our open-source servers running.
              </p>
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 text-xs font-mono font-black text-black underline hover:text-neutral-700"
              >
                <span>Browse the Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
