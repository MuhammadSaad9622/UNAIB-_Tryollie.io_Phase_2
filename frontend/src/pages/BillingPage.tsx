import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import APIService from "../lib/api";
import { Check, X, CreditCard, Zap, Crown } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  callLimit: number;
  stripePriceId: string | null;
}

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  callLimit: number;
  callsUsed: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [stripeConfig, setStripeConfig] = useState<any>(null);

  useEffect(() => {
    fetchData();
    
    // Check for success/cancel from Stripe
    if (searchParams.get("success") === "true") {
      showToast("Payment successful! Your subscription is now active.", "success");
      navigate("/billing", { replace: true });
    }
    if (searchParams.get("canceled") === "true") {
      showToast("Payment was canceled.", "warning");
      navigate("/billing", { replace: true });
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, plansRes, subscriptionRes] = await Promise.all([
        APIService.getBillingConfig(),
        APIService.getPlans(),
        APIService.getSubscription(),
      ]);

      setStripeConfig(configRes.data);
      setPlans(plansRes.data.plans);
      setSubscription(subscriptionRes.data.subscription);
    } catch (error: any) {
      console.error("Error fetching billing data:", error);
      showToast("Failed to load billing information", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!stripeConfig?.publishableKey) {
      showToast("Stripe is not configured. Please contact support.", "error");
      return;
    }

    try {
      setProcessing(planId);
      const response = await APIService.createCheckoutSession({ planId });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      
      let errorMessage = "Failed to start checkout";
      
      if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
      setProcessing(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Zap className="h-6 w-6" />;
      case "basic":
        return <Zap className="h-6 w-6" />;
      case "standard":
        return <CreditCard className="h-6 w-6" />;
      case "premium":
        return <Crown className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "from-gray-500 to-gray-600";
      case "basic":
        return "from-blue-500 to-blue-600";
      case "standard":
        return "from-purple-500 to-purple-600";
      case "premium":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan === planId && subscription?.status === "active";
  };

  const getUsagePercentage = () => {
    if (!subscription || !subscription.callLimit) return 0;
    return Math.min((subscription.callsUsed / subscription.callLimit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">Choose a plan that fits your needs</p>
        </div>

        {/* Current Subscription Status */}
        {subscription && subscription.status === "active" && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {subscription.currentPeriodEnd
                    ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : "Active subscription"}
                </p>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Cancels at period end
                </span>
              )}
            </div>

            {/* Usage Bar */}
            {subscription.callLimit > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Calls this period</span>
                  <span className="font-medium text-gray-900">
                    {subscription.callsUsed} / {subscription.callLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      getUsagePercentage() >= 90
                        ? "bg-red-500"
                        : getUsagePercentage() >= 70
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  ></div>
                </div>
                {getUsagePercentage() >= 90 && (
                  <p className="text-sm text-red-600 mt-2">
                    You're running low on calls. Consider upgrading your plan.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                isCurrentPlan(plan.id) ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Plan Header */}
              <div className={`bg-gradient-to-r ${getPlanColor(plan.id)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPlanIcon(plan.id)}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  {isCurrentPlan(plan.id) && (
                    <Check className="h-6 w-6" />
                  )}
                </div>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-lg opacity-90">/month</span>
                    </>
                  )}
                </div>
              </div>

              {/* Plan Features */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{plan.callLimit} calls per month</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>AI-powered suggestions</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Real-time transcription</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Call analytics</span>
                  </li>
                  {plan.id === "premium" && (
                    <>
                      <li className="flex items-center text-gray-700">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center text-gray-700">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Advanced analytics</span>
                      </li>
                    </>
                  )}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan(plan.id) || processing !== null || plan.id === "free" || !plan.stripePriceId}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isCurrentPlan(plan.id)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : processing === plan.id
                      ? "bg-gray-400 text-white cursor-wait"
                      : !plan.stripePriceId
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : `bg-gradient-to-r ${getPlanColor(plan.id)} text-white hover:opacity-90`
                  }`}
                >
                  {isCurrentPlan(plan.id)
                    ? "Current Plan"
                    : plan.id === "free"
                    ? "Free Tier"
                    : processing === plan.id
                    ? "Processing..."
                    : !plan.stripePriceId
                    ? "Coming Soon"
                    : "Subscribe"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need help choosing a plan?
          </h3>
          <p className="text-blue-800">
            Contact our support team at{" "}
            <a href="mailto:support@tryollie.io" className="underline">
              support@tryollie.io
            </a>{" "}
            or visit our{" "}
            <a href="/support" className="underline">
              support page
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

