import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface PlanData {
  id: 'free' | 'pro' | 'premium';
  name: string;
  tagline: string;
  dailyCredits: number;
  monthlyCredits: number;
  price: {
    monthly: number;
    yearly: number;
  };
  priority: string;
  features: string[];
  isPopular?: boolean;
}

const DEFAULT_PLANS: PlanData[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everyday tools with essential daily AI credits.',
    dailyCredits: 3,
    monthlyCredits: 0,
    price: { monthly: 0, yearly: 0 },
    priority: 'standard',
    features: [
      '3 AI generation credits per day',
      'Automatic daily credit reset at 00:00 UTC',
      'All 32+ standard offline tools 100% free',
      'Standard processing priority',
      'Access to standard AI enhancement models',
      'No credit card required',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For creators, developers, and power users.',
    dailyCredits: 0,
    monthlyCredits: 300,
    price: { monthly: 9.99, yearly: 99.0 },
    priority: 'fast',
    isPopular: true,
    features: [
      '300 AI credits per billing month',
      'Faster processing priority',
      'High-resolution enhancement (up to 4K)',
      'Processing history & downloadable archives',
      'Priority queue for AI workloads',
      'Email support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Maximum power for businesses and heavy workflows.',
    dailyCredits: 0,
    monthlyCredits: 1000,
    price: { monthly: 24.99, yearly: 249.0 },
    priority: 'highest',
    features: [
      '1,000 AI credits per billing month',
      'Highest processing priority & real-time queue',
      'Advanced AI models & face restoration',
      'Batch processing mode (multi-image)',
      'Complete processing history with 30-day retention',
      'Dedicated priority support',
    ],
  },
];

const FAQS = [
  {
    q: 'How do daily free credits work?',
    a: 'Every free user account receives 3 AI generation credits every day. Unused daily credits reset at 00:00 UTC and do not accumulate indefinitely. Ordinary non-AI tools (like PDF, text, and image editing) remain unlimited and free forever.',
  },
  {
    q: 'What happens if I run out of credits?',
    a: "If you exhaust your daily free credits, you can upgrade to Pro or Premium for instant monthly credits. Otherwise, your free allowance will automatically replenish tomorrow at 00:00 UTC. Your access to VexoraTool's offline utilities is never blocked.",
  },
  {
    q: 'Do paid credits roll over to the next month?',
    a: 'Monthly plan allowances (300 credits for Pro, 1,000 credits for Premium) renew with each billing cycle. Unused monthly credits expire at the end of the billing period.',
  },
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes, absolutely. You can cancel your subscription with a single click from your Dashboard. You will retain all your credits and Pro/Premium benefits until the end of your current paid billing period.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support international credit/debit cards via secure payment providers, as well as Southeast Asian methods including GCash, Maya, and GrabPay via PayMongo.',
  },
];

export const PricingPage: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<PlanData[]>(DEFAULT_PLANS);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/subscriptions/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.plans) {
          setPlans(data.data.plans);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_PLANS
      });
  }, []);

  const handleSelectPlan = async (plan: PlanData) => {
    if (plan.id === 'free') {
      if (!isAuthenticated) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in or create an account to subscribe.', 'info');
      navigate('/login?redirect=/pricing');
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: plan.id,
          interval: billingInterval,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        showToast(data.error || 'Failed to initialize checkout session.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment provider error', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlanId = user?.subscription?.plan || 'free';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FACC15] text-black border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Transparent, No-Nonsense Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
          Supercharge your productivity with AI
        </h1>
        <p className="mt-4 text-base sm:text-lg font-bold text-neutral-700 leading-relaxed">
          All offline utility tools remain completely free forever. Upgrade only when you need
          high-performance neural AI processing and high-volume workloads.
        </p>

        {/* Billing Switch */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-black transition-colors ${
              billingInterval === 'monthly' ? 'text-black' : 'text-neutral-500'
            }`}
          >
            Monthly billing
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 flex items-center bg-white border-2 border-black rounded-full p-1 cursor-pointer transition-all shadow-[2px_2px_0px_#000]"
            role="switch"
            aria-checked={billingInterval === 'yearly'}
            aria-label="Toggle annual billing"
          >
            <div
              className={`bg-black w-4 h-4 rounded-full transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-black flex items-center gap-2 transition-colors ${
              billingInterval === 'yearly' ? 'text-black' : 'text-neutral-500'
            }`}
          >
            <span>Annual billing</span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#4ADE80] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
              Save 17%
            </span>
          </span>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
        {plans.map((p) => {
          const isCurrent = isAuthenticated && currentPlanId === p.id;
          const price = billingInterval === 'yearly' ? p.price.yearly : p.price.monthly;
          const billingSuffix =
            p.id === 'free' ? '' : billingInterval === 'yearly' ? '/ year' : '/ month';

          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white border-2 border-black transition-all ${
                p.isPopular
                  ? 'border-[3px] shadow-[8px_8px_0px_#000000] -translate-y-1'
                  : 'shadow-[6px_6px_0px_#000000]'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black bg-[#FACC15] text-black border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-2xl font-black text-black">
                    {p.name}
                  </h2>
                  {isCurrent && (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#4ADE80] text-black border border-black shadow-[1px_1px_0px_#000]">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-neutral-600 mb-6">{p.tagline}</p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-xs font-black text-neutral-500 font-mono">
                    {billingSuffix}
                  </span>
                </div>

                <div className="p-3 mb-6 rounded-xl bg-[#FACC15]/20 border-2 border-black shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-2 text-xs font-black text-black">
                    <Zap className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>
                      {p.id === 'free'
                        ? '3 Daily AI Generation Credits'
                        : `${p.monthlyCredits} Monthly AI Generation Credits`}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 text-xs font-bold text-neutral-800">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-md bg-[#4ADE80] border border-black flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-black stroke-[3]" />
                      </div>
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  disabled={isCurrent || loadingPlan === p.id}
                  onClick={() => handleSelectPlan(p)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                    isCurrent
                      ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed shadow-none'
                      : p.isPopular
                        ? 'bg-[#FACC15] hover:bg-[#EAB308] text-black shadow-[3px_3px_0px_#000] active:shadow-[1px_1px_0px_#000]'
                        : p.id === 'premium'
                          ? 'bg-[#A78BFA] hover:bg-[#906EE8] text-black shadow-[3px_3px_0px_#000] active:shadow-[1px_1px_0px_#000]'
                          : 'bg-white hover:bg-neutral-100 text-black shadow-[3px_3px_0px_#000] active:shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  {loadingPlan === p.id ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    <>
                      <span>{p.id === 'free' ? 'Get Started' : `Upgrade to ${p.name}`}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-8 border-t-2 border-black/10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-bold text-neutral-600">
            Everything you need to know about credits, renewals, and privacy.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000] transition-all"
            >
              <h3 className="text-sm sm:text-base font-black text-black flex items-center gap-2.5 mb-2">
                <HelpCircle className="w-5 h-5 text-black stroke-[2.5] shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
