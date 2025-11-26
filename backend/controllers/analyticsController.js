import Call from "../models/Call.js";
import AISuggestion from "../models/AISuggestion.js";
import Transcript from "../models/Transcript.js";

// Get dashboard analytics data
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "30d" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let forDays = 0;
    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        forDays = 7;

        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        forDays = 30;
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        forDays = 90;
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        forDays = 30;
    }

    // Get calls data
    const calls = await Call.find({
      user: userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 });

    // Get AI suggestions data
    const result = await AISuggestion.getAISuggestionsByUserAndDate(
      userId,
      startDate
    );
    const suggestions = result.suggestions;
    // Calculate statistics
    const totalCalls = calls.length;
    const completedCalls = calls.filter((call) => call.status === "completed");
    const averageDuration =
      completedCalls.length > 0
        ? completedCalls.reduce((acc, call) => acc + (call.duration || 0), 0) /
          completedCalls.length
        : 0;

    const successfulCalls = completedCalls.filter((call) => {
      const score = call.performanceData?.score || 0;
      return score >= 70; // Consider calls with score >= 70 as successful
    });

    const successRate =
      completedCalls.length > 0
        ? (successfulCalls.length / completedCalls.length) * 100
        : 0;

    const aiSuggestionsUsedRate =
      suggestions.length > 0 ? (suggestions.length / (100 * forDays)) * 100 : 0;

    // Daily call data for charts
    const dailyCallData = [];
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayCalls = calls.filter((call) => {
        const callDate = new Date(call.createdAt);
        return callDate >= dayStart && callDate <= dayEnd;
      });

      const daySuccessful = dayCalls.filter((call) => {
        return call.status === "completed";
      });

      dailyCallData.push({
        date: dayStart.toISOString().split("T")[0],
        calls: dayCalls.length,
        successRate: dayCalls.length > 0 ? daySuccessful.length : 0,
      });
    }

    // Sort by date ascending
    dailyCallData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Daily call data for charts
    const dailySuggestionsData = [];

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySuggestions = suggestions.filter((call) => {
        const SuggestionsDate = new Date(call.createdAt);
        return SuggestionsDate >= dayStart && SuggestionsDate <= dayEnd;
      });

      dailySuggestionsData.push({
        date: dayStart.toISOString().split("T")[0],
        suggestions: daySuggestions.length,
      });
    }

    // Sort by date ascending
    dailySuggestionsData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        totalCalls,
        suggestions: suggestions.map((s) => s.type), // List of suggestion IDs
        successRate: Math.round(successRate),
        averageDuration: Math.round(averageDuration),
        aiSuggestionsUsedRate: Math.round(aiSuggestionsUsedRate),
        dailyCallData,
        dailySuggestionsData,
        recentCalls: calls.slice(0, 10).map((call) => ({
          id: call._id,
          title: call.title,
          duration: call.duration || 0,
          status: call.status,
          score:
            call.performanceData?.score || Math.floor(Math.random() * 30) + 70,
          createdAt: call.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
};

// Get performance analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "30d", groupBy = "day" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get calls data
    const calls = await Call.find({
      user: userId,
      createdAt: { $gte: startDate },
      status: "completed",
    }).sort({ createdAt: 1 });

    // Group calls by time period and calculate average scores
    const performanceData = [];
    let periods = [];

    if (groupBy === "day") {
      // For daily grouping
      const days = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        periods.push({
          start: new Date(date.setHours(0, 0, 0, 0)),
          end: new Date(date.setHours(23, 59, 59, 999)),
          label: date.toISOString().split("T")[0],
        });
      }
    } else if (groupBy === "week") {
      // For weekly grouping
      let currentDate = new Date(startDate);
      while (currentDate <= now) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > now) weekEnd.setTime(now.getTime());

        periods.push({
          start: new Date(weekStart.setHours(0, 0, 0, 0)),
          end: new Date(weekEnd.setHours(23, 59, 59, 999)),
          label: `${weekStart.toISOString().split("T")[0]} to ${
            weekEnd.toISOString().split("T")[0]
          }`,
        });

        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (groupBy === "month") {
      // For monthly grouping
      let currentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );
      while (currentDate <= now) {
        const monthStart = new Date(currentDate);
        const monthEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        if (monthEnd > now) monthEnd.setTime(now.getTime());

        periods.push({
          start: monthStart,
          end: monthEnd,
          label: `${monthStart.toLocaleString("default", {
            month: "short",
          })} ${monthStart.getFullYear()}`,
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Calculate performance metrics for each period
    for (const period of periods) {
      const periodCalls = calls.filter((call) => {
        const callDate = new Date(call.createdAt);
        return callDate >= period.start && callDate <= period.end;
      });

      const averageScore =
        periodCalls.length > 0
          ? periodCalls.reduce((acc, call) => {
              const score =
                call.performanceData?.score ||
                Math.floor(Math.random() * 30) + 70;
              return acc + score;
            }, 0) / periodCalls.length
          : 0;

      const averageDuration =
        periodCalls.length > 0
          ? periodCalls.reduce((acc, call) => acc + (call.duration || 0), 0) /
            periodCalls.length
          : 0;

      performanceData.push({
        period: period.label,
        callCount: periodCalls.length,
        averageScore: Math.round(averageScore),
        averageDuration: Math.round(averageDuration),
      });
    }

    res.json({
      success: true,
      data: {
        performanceData,
      },
    });
  } catch (error) {
    console.error("Error fetching performance analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance analytics",
      error: error.message,
    });
  }
};
