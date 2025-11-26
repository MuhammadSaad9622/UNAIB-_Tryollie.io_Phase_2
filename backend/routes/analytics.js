import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getDashboardAnalytics,
  getPerformanceAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get dashboard analytics data
router.get("/", getDashboardAnalytics);

// Get performance analytics
router.get("/performance", getPerformanceAnalytics);

// Get AI suggestion statistics for the authenticated user
router.get("/ai-suggestions", authenticate, async (req, res) => {
  try {
    const { timeRange = 30, detailed = false } = req.query;
    const userId = req.user._id.toString();

    console.log(
      `📊 Getting AI suggestion stats for user: ${userId}, timeRange: ${timeRange}days`
    );

    const AISuggestion = (await import("../models/AISuggestion.js")).default;

    let stats;
    if (detailed === "true") {
      stats = await AISuggestion.getDetailedUserStats(
        userId,
        parseInt(timeRange)
      );
    } else {
      stats = await AISuggestion.getUserSuggestionCount(userId);
    }

    console.log(`✅ AI suggestion stats retrieved:`, {
      userId,
      totalSuggestions: stats.total || stats.totalSuggestions,
      usedSuggestions: stats.used || stats.usedSuggestions,
      timeRange,
    });

    res.json({
      success: true,
      data: {
        userId,
        timeRange: parseInt(timeRange),
        ...stats,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching AI suggestion statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI suggestion statistics",
      error: error.message,
    });
  }
});

// Get AI suggestion statistics by type for the authenticated user
router.get("/ai-suggestions/by-type", authenticate, async (req, res) => {
  try {
    const { timeRange = 30 } = req.query;
    const userId = req.user._id.toString();

    console.log(`📊 Getting AI suggestion stats by type for user: ${userId}`);

    const AISuggestion = (await import("../models/AISuggestion.js")).default;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const typeStats = await AISuggestion.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          used: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
          averageConfidence: { $avg: "$confidence" },
          highConfidence: {
            $sum: { $cond: [{ $gte: ["$confidence", 0.8] }, 1, 0] },
          },
          averageRating: {
            $avg: {
              $cond: [
                { $ne: ["$feedback.rating", null] },
                "$feedback.rating",
                null,
              ],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    console.log(`✅ AI suggestion type stats retrieved for user: ${userId}`);

    res.json({
      success: true,
      data: {
        userId,
        timeRange: parseInt(timeRange),
        byType: typeStats,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching AI suggestion type statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI suggestion type statistics",
      error: error.message,
    });
  }
});

// NEW: Get daily quota usage for AI suggestions
router.get("/quota/daily", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();

    const AISuggestion = (await import("../models/AISuggestion.js")).default;
    const quotaUsage = await AISuggestion.getDailyQuotaUsage(
      userId,
      targetDate
    );

    res.json({
      success: true,
      data: quotaUsage,
    });
  } catch (error) {
    console.error("Error fetching daily quota usage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily quota usage",
      error: error.message,
    });
  }
});

// NEW: Get weekly quota trends
router.get("/quota/weekly", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate } = req.query;

    const targetStartDate = startDate ? new Date(startDate) : new Date();

    const AISuggestion = (await import("../models/AISuggestion.js")).default;
    const weeklyTrends = await AISuggestion.getWeeklyQuotaTrends(
      userId,
      targetStartDate
    );

    res.json({
      success: true,
      data: {
        trends: weeklyTrends,
        summary: {
          totalDays: weeklyTrends.length,
          averageDailyUsage:
            weeklyTrends.reduce((sum, day) => sum + day.used, 0) /
            Math.max(1, weeklyTrends.length),
          daysOverQuota: weeklyTrends.filter((day) => day.quotaExceeded).length,
          bestUsageDay: weeklyTrends.reduce(
            (best, day) =>
              day.usageRate > (best?.usageRate || 0) ? day : best,
            null
          ),
          peakUsageDay: weeklyTrends.reduce(
            (peak, day) => (day.used > (peak?.used || 0) ? day : peak),
            null
          ),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching weekly quota trends:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly quota trends",
      error: error.message,
    });
  }
});

// NEW: Check current quota status
router.get("/quota/status", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const AISuggestion = (await import("../models/AISuggestion.js")).default;
    const quotaStatus = await AISuggestion.checkDailyQuotaAvailable(userId);

    res.json({
      success: true,
      data: quotaStatus,
    });
  } catch (error) {
    console.error("Error checking quota status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check quota status",
      error: error.message,
    });
  }
});
// Get dashboard analytics data
router.get("/", getDashboardAnalytics);

// Get performance analytics
router.get("/performance", getPerformanceAnalytics);

export default router;
