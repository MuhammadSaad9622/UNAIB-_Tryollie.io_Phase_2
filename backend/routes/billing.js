import express from "express";
import { catchAsync } from "../middleware/errorHandler.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import config from "../config/config.js";

const router = express.Router();

// Plan configuration - prices can be overridden via environment variables
const PLANS = {
  free: {
    name: "Free",
    price: 0, // Free tier
    callLimit: parseInt(process.env.PLAN_FREE_CALLS || "5", 10),
    stripePriceId: null, // No Stripe for free tier
  },
  basic: {
    name: "Basic",
    price: parseFloat(process.env.PLAN_BASIC_PRICE || "10"), // $10/month
    callLimit: parseInt(process.env.PLAN_BASIC_CALLS || "15", 10),
    stripePriceId: process.env.STRIPE_PRICE_ID_BASIC || null,
  },
  standard: {
    name: "Standard",
    price: parseFloat(process.env.PLAN_STANDARD_PRICE || "20"), // $20/month
    callLimit: parseInt(process.env.PLAN_STANDARD_CALLS || "25", 10),
    stripePriceId: process.env.STRIPE_PRICE_ID_STANDARD || null,
  },
  premium: {
    name: "Premium",
    price: parseFloat(process.env.PLAN_PREMIUM_PRICE || "30"), // $30/month
    callLimit: parseInt(process.env.PLAN_PREMIUM_CALLS || "50", 10),
    stripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM || null,
  },
};

// Initialize Stripe (optional - gracefully handle if not configured)
let stripe = null;
let stripeAvailable = false;
let stripeInitPromise = null;

async function initializeStripe() {
  if (stripeInitPromise) {
    return stripeInitPromise;
  }
  
  stripeInitPromise = (async () => {
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const Stripe = (await import("stripe")).default;
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-11-20.acacia",
        });
        stripeAvailable = true;
        console.log("✅ Stripe initialized successfully");
      } else {
        console.warn("⚠️ Stripe secret key not found. Billing features will be limited.");
      }
    } catch (error) {
      console.warn("⚠️ Failed to initialize Stripe:", error.message);
      stripeAvailable = false;
    }
  })();
  
  return stripeInitPromise;
}

// Initialize Stripe on module load
initializeStripe().catch(err => {
  console.error("❌ Error initializing Stripe:", err);
});

// ========== ADMIN ROUTES (Stripe Management) ==========

// Get Stripe configuration (public for users, admin for admin)
router.get(
  "/config",
  authenticate,
  catchAsync(async (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    res.json({
      success: true,
      data: {
        publishableKey,
        isConfigured: !!publishableKey && !!process.env.STRIPE_SECRET_KEY,
        plans: PLANS,
      },
    });
  })
);

// Get available plans (public endpoint for users)
router.get(
  "/plans",
  authenticate,
  catchAsync(async (req, res) => {
    res.json({
      success: true,
      data: {
        plans: Object.entries(PLANS).map(([key, plan]) => ({
          id: key,
          name: plan.name,
          price: plan.price,
          callLimit: plan.callLimit,
          stripePriceId: plan.stripePriceId,
        })),
      },
    });
  })
);

// Get user's current subscription
router.get(
  "/subscription",
  authenticate,
  catchAsync(async (req, res) => {
    const subscription = await Subscription.findOne({ user: req.user._id })
      .populate("user", "name email");

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          subscription: null,
          plan: null,
        },
      });
    }

    // Get call count for current period
    const Call = (await import("../models/Call.js")).default;
    const periodStart = subscription.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const callCount = await Call.countDocuments({
      user: req.user._id,
      startTime: { $gte: periodStart },
    });

    res.json({
      success: true,
      data: {
        subscription: {
          ...subscription.toObject(),
          callsUsed: callCount,
        },
        plan: subscription.plan ? PLANS[subscription.plan] : null,
      },
    });
  })
);

// Create Stripe customer for user (admin)
router.post(
  "/customers",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    if (!stripeAvailable || !stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
      });
    }

    const { userId, email, name } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let customer;
    let subscription = await Subscription.findOne({ user: user._id });

    if (subscription?.stripeCustomerId) {
      // Customer already exists
      customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: email || user.email,
        name: name || user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      // Update or create subscription
      if (subscription) {
        subscription.stripeCustomerId = customer.id;
        await subscription.save();
      } else {
        subscription = await Subscription.create({
          user: user._id,
          stripeCustomerId: customer.id,
          plan: "free",
          status: "inactive",
        });
      }
    }

    res.json({
      success: true,
      data: { customer, subscription },
    });
  })
);

// Create checkout session for user (self-service)
router.post(
  "/checkout",
  authenticate,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    if (!stripeAvailable || !stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
      });
    }

    const { planId } = req.body;
    const userId = req.user._id.toString();

    // Check if user is admin trying to create for another user
    const targetUserId = req.user.role === "admin" && req.body.userId ? req.body.userId : userId;
    const isAdmin = req.user.role === "admin";

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const plan = PLANS[planId];
    if (!plan.stripePriceId) {
      return res.status(400).json({
        success: false,
        message: "Stripe price ID not configured for this plan. Please contact support.",
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let subscription = await Subscription.findOne({ user: targetUserId });
    
    // Ensure customer exists
    if (!subscription?.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: targetUserId,
        },
      });

      if (subscription) {
        subscription.stripeCustomerId = customer.id;
        await subscription.save();
      } else {
        subscription = await Subscription.create({
          user: targetUserId,
          stripeCustomerId: customer.id,
          plan: "free",
          status: "inactive",
        });
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = isAdmin 
      ? `${frontendUrl}/admin/subscriptions?success=true`
      : `${frontendUrl}/billing?success=true`;
    const cancelUrl = isAdmin
      ? `${frontendUrl}/admin/subscriptions?canceled=true`
      : `${frontendUrl}/billing?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: targetUserId,
        planId: planId,
      },
    });

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  })
);

// Create checkout session (admin can create for any user) - DEPRECATED, use above
router.post(
  "/checkout/admin",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    if (!stripeAvailable || !stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
      });
    }

    const { userId, priceId, successUrl, cancelUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let subscription = await Subscription.findOne({ user: user._id });
    
    // Ensure customer exists
    if (!subscription?.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      if (subscription) {
        subscription.stripeCustomerId = customer.id;
        await subscription.save();
      } else {
        subscription = await Subscription.create({
          user: user._id,
          stripeCustomerId: customer.id,
          plan: "free",
          status: "inactive",
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/subscriptions?success=true`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/subscriptions?canceled=true`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  })
);

// Handle Stripe webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    if (!stripeAvailable || !stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured",
      });
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("⚠️ Stripe webhook secret not configured");
      return res.status(400).send("Webhook secret not configured");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        // Check if this is an invoice payment or subscription
        if (session.metadata?.type === "invoice_payment") {
          await handleInvoicePaymentCompleted(session);
        } else {
          await handleCheckoutCompleted(session);
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  })
);

// Helper functions
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  if (!userId) return;

  const subscription = await Subscription.findOne({ user: userId });
  const plan = planId ? PLANS[planId] : null;

  if (subscription) {
    subscription.stripeSubscriptionId = session.subscription;
    subscription.status = "active";
    
    if (planId && plan) {
      subscription.plan = planId;
      subscription.callLimit = plan.callLimit;
      subscription.callsUsed = 0; // Reset calls used for new subscription
    }
    
    // Set billing period dates
    if (session.subscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
        subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
        subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        subscription.stripePriceId = stripeSubscription.items.data[0]?.price?.id;
        
        // Create invoice for the subscription payment
        try {
          const invoice = await Invoice.create({
            user: userId,
            subscription: subscription._id,
            amount: plan ? plan.price : 0,
            currency: "usd",
            dueDate: new Date(stripeSubscription.current_period_end * 1000),
            status: "paid",
            paidDate: new Date(),
            items: [
              {
                description: `${plan ? plan.name : "Subscription"} Plan - ${new Date().toLocaleDateString()}`,
                quantity: 1,
                price: plan ? plan.price : 0,
                total: plan ? plan.price : 0,
              },
            ],
            notes: `Subscription payment for ${plan ? plan.name : "plan"} plan`,
          });
          console.log(`✅ Invoice created for user ${userId}: ${invoice.invoiceNumber}`);
        } catch (invoiceError) {
          console.error("Error creating invoice on checkout:", invoiceError);
        }
      } catch (error) {
        console.error("Error fetching subscription details:", error);
        // Set default period (1 month from now)
        subscription.currentPeriodStart = new Date();
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }
    
    await subscription.save();
  } else {
    // Create new subscription
    const customer = await stripe.customers.retrieve(session.customer);
    const newSubscription = await Subscription.create({
      user: userId,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: session.subscription,
      plan: planId || "free",
      status: "active",
      callLimit: plan ? plan.callLimit : 0,
      callsUsed: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    // Create invoice for new subscription
    try {
      const invoice = await Invoice.create({
        user: userId,
        subscription: newSubscription._id,
        amount: plan ? plan.price : 0,
        currency: "usd",
        dueDate: newSubscription.currentPeriodEnd,
        status: "paid",
        paidDate: new Date(),
        items: [
          {
            description: `${plan ? plan.name : "Subscription"} Plan - ${new Date().toLocaleDateString()}`,
            quantity: 1,
            price: plan ? plan.price : 0,
            total: plan ? plan.price : 0,
          },
        ],
        notes: `Initial subscription payment for ${plan ? plan.name : "plan"} plan`,
      });
      console.log(`✅ Invoice created for new subscription: ${invoice.invoiceNumber}`);
    } catch (invoiceError) {
      console.error("Error creating invoice for new subscription:", invoiceError);
    }
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id,
  });

  if (subscription) {
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    subscription.stripePriceId = stripeSubscription.items.data[0]?.price?.id;

    // Map Stripe status to our status
    if (stripeSubscription.status === "active") {
      subscription.status = "active";
      // Reset calls used when new period starts
      if (subscription.currentPeriodStart && subscription.currentPeriodStart > new Date(subscription.updatedAt || 0)) {
        subscription.callsUsed = 0;
      }
    } else if (stripeSubscription.status === "trialing") {
      subscription.status = "trialing";
    } else if (stripeSubscription.status === "past_due") {
      subscription.status = "past_due";
    } else if (stripeSubscription.status === "canceled") {
      subscription.status = "cancelled";
    }

    await subscription.save();
  }
}

async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id,
  });

  if (subscription) {
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const subscription = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
  });

  if (subscription) {
    subscription.status = "active";
    subscription.currentPeriodStart = new Date(invoice.period_start * 1000);
    subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);
    
    // Reset calls used when new period starts
    subscription.callsUsed = 0;
    
    await subscription.save();

    // Create or update invoice record
    try {
      let invoiceRecord = await Invoice.findOne({ stripeInvoiceId: invoice.id });
      if (!invoiceRecord) {
        // Don't set invoiceNumber - let pre-save hook generate it
        invoiceRecord = await Invoice.create({
          user: subscription.user,
          subscription: subscription._id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency,
          status: "paid",
          paidDate: new Date(invoice.status_transitions.paid_at * 1000),
          dueDate: new Date(invoice.due_date * 1000),
          stripeInvoiceId: invoice.id,
          items: invoice.lines.data.map((line) => ({
            description: line.description || "Subscription",
            quantity: line.quantity || 1,
            price: line.price.unit_amount / 100,
            total: (line.price.unit_amount * (line.quantity || 1)) / 100,
          })),
        });
        console.log(`✅ Invoice created from Stripe webhook: ${invoiceRecord.invoiceNumber}`);
      } else {
        invoiceRecord.status = "paid";
        invoiceRecord.paidDate = new Date(invoice.status_transitions.paid_at * 1000);
        await invoiceRecord.save();
      }
    } catch (error) {
      console.error("Error creating invoice record:", error);
    }
  }
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const subscription = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
  });

  if (subscription) {
    subscription.status = "past_due";
    await subscription.save();
  }
}

// Handle invoice payment completion from Stripe checkout
async function handleInvoicePaymentCompleted(session) {
  const invoiceId = session.metadata?.invoiceId;
  if (!invoiceId) return;

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      console.error(`Invoice not found: ${invoiceId}`);
      return;
    }

    // Update invoice status to paid
    invoice.status = "paid";
    invoice.paidDate = new Date();
    invoice.stripePaymentIntentId = session.payment_intent;
    await invoice.save();

    console.log(`✅ Invoice ${invoice.invoiceNumber} marked as paid via Stripe checkout`);
  } catch (error) {
    console.error("Error updating invoice after payment:", error);
  }
}

// Get subscription details with Stripe info (admin)
router.get(
  "/subscriptions/:id",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    const subscription = await Subscription.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    let stripeData = null;
    if (stripeAvailable && stripe && subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );
        stripeData = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          price: stripeSubscription.items.data[0]?.price,
        };
      } catch (error) {
        console.error("Error fetching Stripe subscription:", error);
      }
    }

    res.json({
      success: true,
      data: {
        subscription,
        stripe: stripeData,
      },
    });
  })
);

// Cancel subscription (admin)
router.post(
  "/subscriptions/:id/cancel",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (stripeAvailable && stripe && subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        subscription.cancelAtPeriodEnd = true;
        await subscription.save();
      } catch (error) {
        console.error("Error canceling Stripe subscription:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to cancel subscription in Stripe",
        });
      }
    } else {
      subscription.status = "cancelled";
      subscription.cancelledAt = new Date();
      await subscription.save();
    }

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: { subscription },
    });
  })
);

// ========== INVOICE ROUTES ==========

// Get user's invoices
router.get(
  "/invoices",
  authenticate,
  catchAsync(async (req, res) => {
    const userId = req.user.role === "admin" && req.query.userId ? req.query.userId : req.user._id;
    
    const invoices = await Invoice.find({ user: userId })
      .populate("subscription", "plan status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invoices,
    });
  })
);

// Get single invoice
router.get(
  "/invoices/:id",
  authenticate,
  catchAsync(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
      .populate("user", "name email")
      .populate("subscription", "plan status");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Check if user has access (own invoice or admin)
    if (invoice.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  })
);

// Create invoice (admin only)
router.post(
  "/invoices",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    const { userId, amount, currency, dueDate, items, notes } = req.body;

    if (!userId || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "userId, amount, and dueDate are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subscription = await Subscription.findOne({ user: userId });

    const invoice = await Invoice.create({
      user: userId,
      subscription: subscription?._id,
      amount,
      currency: currency || "usd",
      dueDate: new Date(dueDate),
      items: items || [
        {
          description: "Subscription payment",
          quantity: 1,
          price: amount,
          total: amount,
        },
      ],
      notes,
      status: "draft",
      sentBy: req.user._id,
    });

    res.json({
      success: true,
      data: invoice,
    });
  })
);

// Send invoice (admin only)
router.post(
  "/invoices/:id/send",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    const invoice = await Invoice.findById(req.params.id).populate("user");
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice is already paid",
      });
    }

    // If Stripe is configured, create Stripe invoice
    if (stripeAvailable && stripe) {
      const subscription = await Subscription.findOne({ user: invoice.user._id });
      
      if (subscription?.stripeCustomerId) {
        try {
          // Create invoice item
          const invoiceItem = await stripe.invoiceItems.create({
            customer: subscription.stripeCustomerId,
            amount: Math.round(invoice.amount * 100), // Convert to cents
            currency: invoice.currency,
            description: invoice.items.map((item) => item.description).join(", "),
          });

          // Create and finalize invoice
          const stripeInvoice = await stripe.invoices.create({
            customer: subscription.stripeCustomerId,
            collection_method: "send_invoice",
            days_until_due: Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
          });

          await stripe.invoices.finalizeInvoice(stripeInvoice.id);
          await stripe.invoices.sendInvoice(stripeInvoice.id);

          invoice.stripeInvoiceId = stripeInvoice.id;
        } catch (error) {
          console.error("Error creating Stripe invoice:", error);
          // Continue with manual invoice sending
        }
      }
    }

    invoice.status = "sent";
    invoice.sentAt = new Date();
    invoice.sentBy = req.user._id;
    await invoice.save();

    res.json({
      success: true,
      message: "Invoice sent successfully",
      data: invoice,
    });
  })
);

// Mark invoice as paid (admin only)
router.post(
  "/invoices/:id/mark-paid",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    invoice.status = "paid";
    invoice.paidDate = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: "Invoice marked as paid",
      data: invoice,
    });
  })
);

// Cancel invoice (admin only)
router.post(
  "/invoices/:id/cancel",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a paid invoice",
      });
    }

    invoice.status = "cancelled";
    await invoice.save();

    res.json({
      success: true,
      message: "Invoice cancelled",
      data: invoice,
    });
  })
);

// Get invoice statistics (admin only)
router.get(
  "/invoices/stats/overview",
  authenticate,
  requireAdmin,
  catchAsync(async (req, res) => {
    const stats = await Invoice.getStats();
    res.json({
      success: true,
      data: stats,
    });
  })
);

// Pay invoice (user can pay their own invoice)
router.post(
  "/invoices/:id/pay",
  authenticate,
  catchAsync(async (req, res) => {
    await initializeStripe();
    
    if (!stripeAvailable || !stripe) {
      return res.status(503).json({
        success: false,
        message: "Stripe is not configured. Please contact support.",
      });
    }

    const invoice = await Invoice.findById(req.params.id).populate("user");
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Check if user has access (own invoice or admin)
    if (invoice.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if invoice is already paid
    if (invoice.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice is already paid",
      });
    }

    // Check if invoice is cancelled
    if (invoice.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invoice is cancelled",
      });
    }

    // Get or create Stripe customer
    const subscription = await Subscription.findOne({ user: invoice.user._id });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: invoice.user.email,
        name: invoice.user.name,
        metadata: {
          userId: invoice.user._id.toString(),
        },
      });
      customerId = customer.id;

      // Update or create subscription with customer ID
      if (subscription) {
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      } else {
        await Subscription.create({
          user: invoice.user._id,
          stripeCustomerId: customerId,
          plan: "free",
          status: "inactive",
        });
      }
    }

    // Create Stripe checkout session for invoice payment
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: invoice.items.map((item) => ({
        price_data: {
          currency: invoice.currency,
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${frontendUrl}/invoices?success=true&invoiceId=${invoice._id}`,
      cancel_url: `${frontendUrl}/invoices?canceled=true&invoiceId=${invoice._id}`,
      metadata: {
        invoiceId: invoice._id.toString(),
        userId: invoice.user._id.toString(),
        type: "invoice_payment",
      },
      invoice_creation: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  })
);

export default router;

