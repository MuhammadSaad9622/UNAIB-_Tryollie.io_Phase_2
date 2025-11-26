import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Subscription must belong to a user"],
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "standard", "premium", "starter", "professional", "enterprise"],
      default: "free",
    },
    callLimit: {
      type: Number,
      default: 0, // 0 means unlimited or no limit
    },
    callsUsed: {
      type: Number,
      default: 0,
    },
    billingPeriod: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "past_due", "trialing"],
      default: "inactive",
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripePriceId: {
      type: String,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

// Virtual for subscription active status
subscriptionSchema.virtual("isActive").get(function () {
  if (this.status !== "active" && this.status !== "trialing") {
    return false;
  }
  if (this.currentPeriodEnd && new Date() > this.currentPeriodEnd) {
    return false;
  }
  return true;
});

// Virtual for days remaining
subscriptionSchema.virtual("daysRemaining").get(function () {
  if (!this.currentPeriodEnd) return null;
  const now = new Date();
  const end = new Date(this.currentPeriodEnd);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

// Pre-save middleware
subscriptionSchema.pre("save", function (next) {
  // Auto-update status based on dates
  if (this.currentPeriodEnd && new Date() > this.currentPeriodEnd) {
    if (this.status === "active" || this.status === "trialing") {
      this.status = "inactive";
    }
  }
  next();
});

// Static method to find active subscriptions
subscriptionSchema.statics.findActive = function () {
  return this.find({
    status: { $in: ["active", "trialing"] },
    currentPeriodEnd: { $gt: new Date() },
  });
};

// Static method to get subscription statistics
subscriptionSchema.statics.getStats = async function () {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $in: ["$status", ["active", "trialing"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    const total = await this.countDocuments();
    const active = await this.countDocuments({
      status: { $in: ["active", "trialing"] },
    });

    return {
      byPlan: stats || [],
      total: total || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
    };
  } catch (error) {
    console.error("Error getting subscription stats:", error);
    return {
      byPlan: [],
      total: 0,
      active: 0,
      inactive: 0,
    };
  }
};

export default mongoose.model("Subscription", subscriptionSchema);

