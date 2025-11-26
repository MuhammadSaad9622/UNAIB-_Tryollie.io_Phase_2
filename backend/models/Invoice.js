import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Invoice must belong to a user"],
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      sparse: true,
    },
    invoiceNumber: {
      type: String,
      required: false, // Will be auto-generated in pre-save hook
      unique: true,
      sparse: true, // Allow null values for uniqueness
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Invoice amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "usd",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "unpaid", "overdue", "cancelled"],
      default: "draft",
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    paidDate: {
      type: Date,
    },
    stripeInvoiceId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1, min: 1 },
        price: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    notes: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who sent the invoice
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
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

// Virtual for days until due
invoiceSchema.virtual("daysUntilDue").get(function () {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
});

// Virtual for isOverdue
invoiceSchema.virtual("isOverdue").get(function () {
  if (this.status === "paid" || this.status === "cancelled") return false;
  if (!this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Pre-save middleware to generate invoice number
invoiceSchema.pre("save", async function (next) {
  try {
    // Only generate invoice number if it doesn't exist (for new documents)
    if (!this.invoiceNumber) {
      const InvoiceModel = this.constructor;
      
      // Generate unique invoice number
      let invoiceNumber;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        const count = await InvoiceModel.countDocuments();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, "0")}-${timestamp}`;
        
        // Check if this invoice number already exists
        const exists = await InvoiceModel.findOne({ invoiceNumber });
        if (!exists) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        return next(new Error("Failed to generate unique invoice number"));
      }
      
      this.invoiceNumber = invoiceNumber;
    }

    // Auto-update status to overdue if past due date
    if (this.status !== "paid" && this.status !== "cancelled" && this.dueDate) {
      if (new Date() > this.dueDate) {
        this.status = "overdue";
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find overdue invoices
invoiceSchema.statics.findOverdue = function () {
  return this.find({
    status: { $in: ["sent", "unpaid"] },
    dueDate: { $lt: new Date() },
  });
};

// Static method to get invoice statistics
invoiceSchema.statics.getStats = async function (userId = null) {
  try {
    const match = userId ? { user: userId } : {};
    
    const stats = await this.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const total = await this.countDocuments(match);
    const paid = await this.countDocuments({ ...match, status: "paid" });
    const unpaid = await this.countDocuments({
      ...match,
      status: { $in: ["sent", "unpaid", "overdue"] },
    });
    const overdue = await this.countDocuments({
      ...match,
      status: "overdue",
    });

    const totalAmount = await this.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const paidAmount = await this.aggregate([
      { $match: { ...match, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return {
      byStatus: stats || [],
      total: total || 0,
      paid: paid || 0,
      unpaid: unpaid || 0,
      overdue: overdue || 0,
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
    };
  } catch (error) {
    console.error("Error getting invoice stats:", error);
    return {
      byStatus: [],
      total: 0,
      paid: 0,
      unpaid: 0,
      overdue: 0,
      totalAmount: 0,
      paidAmount: 0,
    };
  }
};

export default mongoose.model("Invoice", invoiceSchema);

