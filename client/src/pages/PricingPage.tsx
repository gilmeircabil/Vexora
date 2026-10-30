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
    a: "If you exhaust your daily free credits, you can upgrade to Pro or Premium for instant monthly credits. Otherwise, your free allowance will automatically replenish tomorrow at 00:00 UTC. Your access to ToolNest's offline utilities is never blocked.",
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent, No-Nonsense Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Supercharge your productivity with AI
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
          All offline utility tools remain completely free forever. Upgrade only when you need
          high-performance neural AI processing and high-volume workloads.
        </p>

        {/* Billing Switch */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${
              billingInterval === 'monthly'
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500'
            }`}
          >
            Monthly billing
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-full p-1 cursor-pointer transition-colors"
            role="switch"
            aria-checked={billingInterval === 'yearly'}
            aria-label="Toggle annual billing"
          >
            <div
              className={`bg-indigo-600 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium flex items-center gap-1.5 ${
              billingInterval === 'yearly'
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500'
            }`}
          >
            <span>Annual billing</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
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
              className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl transition-all ${
                p.isPopular
                  ? 'bg-white dark:bg-neutral-900 border-2 border-indigo-600 shadow-xl dark:shadow-indigo-950/20'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {p.name}
                  </h2>
                  {isCurrent && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">{p.tagline}</p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {billingSuffix}
                  </span>
                </div>

                <div className="p-3 mb-6 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>
                      {p.id === 'free'
                        ? '3 Daily AI Generation Credits'
                        : `${p.monthlyCredits} Monthly AI Generation Credits`}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 text-xs text-neutral-600 dark:text-neutral-300">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  disabled={isCurrent || loadingPlan === p.id}
                  onClick={() => handleSelectPlan(p)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                      : p.isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
                        : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900'
                  }`}
                >
                  {loadingPlan === p.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    <>
                      <span>{p.id === 'free' ? 'Get Started' : `Upgrade to ${p.name}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs text-neutral-500">
            Everything you need to know about credits, renewals, and privacy.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800"
            >
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
