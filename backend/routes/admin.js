import express from "express";
import { catchAsync } from "../middleware/errorHandler.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Call from "../models/Call.js";
import AISuggestion from "../models/AISuggestion.js";
import Subscription from "../models/Subscription.js";
import mongoose from "mongoose";

const router = express.Router();

// Health check endpoint (no auth required for debugging)
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Admin routes are working",
    path: req.path,
    baseUrl: req.baseUrl
  });
});

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// ========== DASHBOARD/ANALYTICS ==========

// Get admin dashboard stats
router.get(
  "/dashboard/stats",
  (req, res, next) => {
    console.log("📊 Admin dashboard stats route matched!");
    console.log("   Request path:", req.path);
    console.log("   Request originalUrl:", req.originalUrl);
    next();
  },
  catchAsync(async (req, res) => {
    console.log("📊 Admin dashboard stats handler executing");
    
    try {
      const [
        totalUsers,
        activeUsers,
        totalCalls,
        completedCalls,
        totalSuggestions,
        usedSuggestions,
        subscriptionStats,
        recentUsers,
      ] = await Promise.all([
        User.countDocuments().catch(err => {
          console.error("Error counting users:", err);
          return 0;
        }),
        User.countDocuments({ isActive: true }).catch(err => {
          console.error("Error counting active users:", err);
          return 0;
        }),
        Call.countDocuments().catch(err => {
          console.error("Error counting calls:", err);
          return 0;
        }),
        Call.countDocuments({ status: "completed" }).catch(err => {
          console.error("Error counting completed calls:", err);
          return 0;
        }),
        AISuggestion.countDocuments().catch(err => {
          console.error("Error counting suggestions:", err);
          return 0;
        }),
        AISuggestion.countDocuments({ used: true }).catch(err => {
          console.error("Error counting used suggestions:", err);
          return 0;
        }),
        Subscription.getStats().catch(err => {
          console.error("Error getting subscription stats:", err);
          return { byPlan: [], total: 0, active: 0, inactive: 0 };
        }),
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("name email createdAt lastLogin")
          .catch(err => {
            console.error("Error fetching recent users:", err);
            return [];
          }),
      ]);

    // Get calls by status
    const callsByStatus = await Call.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get users by department
    const usersByDepartment = await User.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentCalls,
      recentSuggestions,
      newUsersThisWeek,
    ] = await Promise.all([
      Call.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      AISuggestion.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          inactiveUsers: (totalUsers || 0) - (activeUsers || 0),
          totalCalls: totalCalls || 0,
          completedCalls: completedCalls || 0,
          totalSuggestions: totalSuggestions || 0,
          usedSuggestions: usedSuggestions || 0,
          suggestionUsageRate:
            (totalSuggestions || 0) > 0 
              ? (usedSuggestions || 0) / (totalSuggestions || 0) 
              : 0,
        },
        subscriptions: subscriptionStats || {
          byPlan: [],
          total: 0,
          active: 0,
          inactive: 0,
        },
        callsByStatus: (callsByStatus || []).reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByDepartment: (usersByDepartment || []).reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentActivity: {
          recentCalls: recentCalls || 0,
          recentSuggestions: recentSuggestions || 0,
          newUsersThisWeek: newUsersThisWeek || 0,
        },
        recentUsers: recentUsers || [],
      },
    });
    } catch (error) {
      console.error("❌ Error in admin dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
    }
  })
);

// Get analytics data with filters
router.get(
  "/analytics",
  catchAsync(async (req, res) => {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Calls over time
    const callsOverTime = await Call.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === "day" ? "%Y-%m-%d" : "%Y-%m",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
          avgDuration: { $avg: "$duration" },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Users over time
    const usersOverTime = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === "day" ? "%Y-%m-%d" : "%Y-%m",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // AI Suggestions over time
    const suggestionsOverTime = await AISuggestion.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === "day" ? "%Y-%m-%d" : "%Y-%m",
              date: "$createdAt",
            },
          },
          total: { $sum: 1 },
          used: {
            $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] },
          },
          avgConfidence: { $avg: "$confidence" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        callsOverTime,
        usersOverTime,
        suggestionsOverTime,
        dateRange: { start, end },
      },
    });
  })
);

// ========== USER MANAGEMENT ==========

// Get all users with pagination and filters
router.get(
  "/users",
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      department,
      isActive,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: parseInt(sortOrder) };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(query),
    ]);

    // Get subscription info for each user
    const userIds = users.map((u) => u._id);
    const subscriptions = await Subscription.find({ user: { $in: userIds } });
    const subscriptionMap = subscriptions.reduce((acc, sub) => {
      acc[sub.user.toString()] = sub;
      return acc;
    }, {});

    const usersWithSubs = users.map((user) => ({
      ...user.toObject(),
      subscription: subscriptionMap[user._id.toString()] || null,
    }));

    res.json({
      success: true,
      data: {
        users: usersWithSubs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  })
);

// Get single user details
router.get(
  "/users/:id",
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [subscription, callStats, suggestionStats] = await Promise.all([
      Subscription.findOne({ user: user._id }),
      Call.getUserStats(user._id),
      AISuggestion.getDetailedUserStats(user._id),
    ]);

    res.json({
      success: true,
      data: {
        user,
        subscription,
        callStats,
        suggestionStats,
      },
    });
  })
);

// Update user
router.patch(
  "/users/:id",
  catchAsync(async (req, res) => {
    const { name, email, role, department, isActive, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  })
);

// Delete user
router.delete(
  "/users/:id",
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Don't allow deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin user",
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  })
);

// Update user subscription (admin only - can promote/downgrade any user)
router.patch(
  "/users/:id/subscription",
  catchAsync(async (req, res) => {
    const { plan } = req.body;

    // Plan configuration (same as billing.js)
    const PLANS = {
      free: {
        name: "Free",
        callLimit: parseInt(process.env.PLAN_FREE_CALLS || "5", 10),
      },
      basic: {
        name: "Basic",
        callLimit: parseInt(process.env.PLAN_BASIC_CALLS || "15", 10),
      },
      standard: {
        name: "Standard",
        callLimit: parseInt(process.env.PLAN_STANDARD_CALLS || "25", 10),
      },
      premium: {
        name: "Premium",
        callLimit: parseInt(process.env.PLAN_PREMIUM_CALLS || "50", 10),
      },
    };

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Must be one of: ${Object.keys(PLANS).join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find or create subscription
    let subscription = await Subscription.findOne({ user: user._id });

    const selectedPlan = PLANS[plan];

    if (subscription) {
      // Update existing subscription
      subscription.plan = plan;
      subscription.callLimit = selectedPlan.callLimit;
      subscription.status = "active"; // Admin can activate any subscription
      
      // Reset period if needed
      if (!subscription.currentPeriodStart) {
        subscription.currentPeriodStart = new Date();
      }
      if (!subscription.currentPeriodEnd) {
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }
      
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        user: user._id,
        plan: plan,
        status: "active",
        callLimit: selectedPlan.callLimit,
        callsUsed: 0,
        billingPeriod: "monthly",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }

    res.json({
      success: true,
      message: `User subscription updated to ${selectedPlan.name} plan`,
      data: {
        subscription,
        plan: selectedPlan,
      },
    });
  })
);

// ========== MEETINGS/CALLS ==========

// Get all calls with filters
router.get(
  "/calls",
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      userId,
      status,
      platform,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (status) query.status = status;
    if (platform) query.platform = platform;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: parseInt(sortOrder) };

    const [calls, total] = await Promise.all([
      Call.find(query)
        .populate("user", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Call.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        calls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  })
);

// Get single call details
router.get(
  "/calls/:id",
  catchAsync(async (req, res) => {
    const call = await Call.findById(req.params.id)
      .populate("user", "name email")
      .populate("transcripts")
      .populate("suggestions");

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.json({
      success: true,
      data: { call },
    });
  })
);

// ========== AI SUGGESTIONS ==========

// Get all AI suggestions with filters
router.get(
  "/suggestions",
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      userId,
      callId,
      type,
      priority,
      used,
      minConfidence,
      maxConfidence,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    const query = {};

    if (userId) {
      query.user = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    }
    if (callId) {
      query.call = mongoose.Types.ObjectId.isValid(callId)
        ? new mongoose.Types.ObjectId(callId)
        : callId;
    }
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (used !== undefined) query.used = used === "true";
    if (minConfidence || maxConfidence) {
      query.confidence = {};
      if (minConfidence) query.confidence.$gte = parseFloat(minConfidence);
      if (maxConfidence) query.confidence.$lte = parseFloat(maxConfidence);
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: parseInt(sortOrder) };

    const [suggestions, total] = await Promise.all([
      AISuggestion.find(query)
        .populate("user", "name email")
        .populate("call", "title meetingId platform")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AISuggestion.countDocuments(query),
    ]);

    // Manually populate user data if populate didn't work (because user field is Mixed type)
    const userIds = new Set();
    suggestions.forEach((suggestion) => {
      if (suggestion.user) {
        // Check if user is not populated (still an ObjectId or string, or doesn't have name property)
        const isObjectId = suggestion.user.constructor.name === "ObjectId";
        const isString = typeof suggestion.user === "string";
        const isNotPopulated = !suggestion.user.name;

        if (isString || isObjectId || isNotPopulated) {
          let userId;
          if (typeof suggestion.user === "string") {
            userId = suggestion.user;
          } else if (suggestion.user._id) {
            userId = suggestion.user._id.toString();
          } else if (isObjectId) {
            userId = suggestion.user.toString();
          } else {
            userId = String(suggestion.user);
          }

          if (mongoose.Types.ObjectId.isValid(userId)) {
            userIds.add(userId);
          }
        }
      }
    });

    // Fetch users that need to be populated
    let userMap = {};
    if (userIds.size > 0) {
      const userArray = Array.from(userIds);
      const users = await User.find({
        _id: { $in: userArray.map((id) => new mongoose.Types.ObjectId(id)) },
      })
        .select("name email _id")
        .lean();

      users.forEach((user) => {
        userMap[user._id.toString()] = {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      });
    }

    // Replace user data in suggestions
    const populatedSuggestions = suggestions.map((suggestion) => {
      if (suggestion.user) {
        let userId;
        const isObjectId = suggestion.user.constructor?.name === "ObjectId";
        const isString = typeof suggestion.user === "string";
        const isNotPopulated = !suggestion.user.name;

        // Determine user ID
        if (typeof suggestion.user === "string") {
          userId = suggestion.user;
        } else if (suggestion.user._id) {
          userId = suggestion.user._id.toString();
        } else if (isObjectId) {
          userId = suggestion.user.toString();
        } else {
          userId = String(suggestion.user);
        }

        // If user wasn't populated properly, use manually fetched data
        if (isString || isObjectId || isNotPopulated) {
          if (userMap[userId]) {
            suggestion.user = userMap[userId];
          } else {
            // If user not found, set to null
            suggestion.user = null;
          }
        } else {
          // User was populated, ensure proper format
          suggestion.user = {
            _id: suggestion.user._id
              ? suggestion.user._id.toString()
              : userId,
            name: suggestion.user.name || "Unknown",
            email: suggestion.user.email || "No email",
          };
        }
      }
      return suggestion;
    });

    res.json({
      success: true,
      data: {
        suggestions: populatedSuggestions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  })
);

// ========== SUBSCRIPTIONS ==========

// Get all subscriptions
router.get(
  "/subscriptions",
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      plan,
      status,
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    const query = {};
    if (plan) query.plan = plan;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: parseInt(sortOrder) };

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate("user", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Subscription.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  })
);

// Update subscription
router.patch(
  "/subscriptions/:id",
  catchAsync(async (req, res) => {
    const { plan, status, currentPeriodEnd } = req.body;

    const updateData = {};
    if (plan) updateData.plan = plan;
    if (status) updateData.status = status;
    if (currentPeriodEnd) updateData.currentPeriodEnd = new Date(currentPeriodEnd);

    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.json({
      success: true,
      message: "Subscription updated successfully",
      data: { subscription },
    });
  })
);

// Debug route registration
console.log("📋 Admin routes registered:");
console.log("   - GET /dashboard/stats");
console.log("   - GET /users");
console.log("   - GET /users/:id");
console.log("   - GET /calls");
console.log("   - GET /calls/:id");
console.log("   - GET /suggestions");
console.log("   - GET /subscriptions");
console.log("   - GET /analytics");

export default router;

