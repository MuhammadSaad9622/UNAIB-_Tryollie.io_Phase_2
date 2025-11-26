import mongoose from "mongoose";

const aiSuggestionSchema = new mongoose.Schema(
  {
    call: {
      type: mongoose.Schema.Types.Mixed, // Allow both String and ObjectId
      required: [true, "AI suggestion must belong to a call"],
    },
    user: {
      type: mongoose.Schema.Types.Mixed, // Allow both String and ObjectId
      required: [true, "AI suggestion must belong to a user"],
    },
    type: {
      type: String,
      required: [true, "Suggestion type is required"],
      enum: [
        "objection_handling",
        "closing",
        "question",
        "pricing",
        "feature_highlight",
        "rapport_building",
        "next_steps",
        "follow_up",
      ],
    },
    text: {
      type: String,
      required: [true, "Suggestion text is required"],
      maxlength: [10000, "Suggestion text cannot exceed 10000 characters"],
    },
    confidence: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: [0, "Confidence cannot be less than 0"],
      max: [1, "Confidence cannot be greater than 1"],
    },
    context: {
      type: String,
      maxlength: [2000, "Context cannot exceed 2000 characters"],
    },
    reasoning: {
      type: String,
      maxlength: [1000, "Reasoning cannot exceed 1000 characters"],
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: [1, "Rating cannot be less than 1"],
        max: [5, "Rating cannot be greater than 5"],
      },
      comment: {
        type: String,
        maxlength: [500, "Feedback comment cannot exceed 500 characters"],
      },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    triggerContext: {
      lastTranscripts: [String],
      detectedIntent: String,
      emotionalState: String,
      conversationPhase: {
        type: String,
        enum: [
          "opening",
          "discovery",
          "presentation",
          "objection",
          "closing",
          "follow_up",
        ],
      },
    },
    metadata: {
      modelVersion: String,
      processingTime: Number,
      documentSources: [String],
      relatedSuggestions: [mongoose.Schema.Types.ObjectId],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
aiSuggestionSchema.index({ call: 1, createdAt: -1 });
aiSuggestionSchema.index({ user: 1, createdAt: -1 });
aiSuggestionSchema.index({ type: 1 });
aiSuggestionSchema.index({ used: 1 });
aiSuggestionSchema.index({ confidence: -1 });
aiSuggestionSchema.index({ priority: 1 });

// Virtual for suggestion age
aiSuggestionSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware to set usedAt when used is set to true
aiSuggestionSchema.pre("save", function (next) {
  if (this.isModified("used") && this.used && !this.usedAt) {
    this.usedAt = new Date();
  }
  next();
});

// Instance method to mark as used
aiSuggestionSchema.methods.markAsUsed = function (feedback = null) {
  this.used = true;
  this.usedAt = new Date();
  if (feedback) {
    this.feedback = feedback;
  }
  return this.save();
};

// Static method to get suggestion statistics
aiSuggestionSchema.statics.getUserStats = async function (
  userId,
  timeRange = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);

  // Handle both string and ObjectId for userId
  const userQuery = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const stats = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSuggestions: { $sum: 1 },
        usedSuggestions: {
          $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] },
        },
        averageConfidence: { $avg: "$confidence" },
        suggestionsByType: {
          $push: {
            type: "$type",
            used: "$used",
          },
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
  ]);

  const result = stats[0] || {
    totalSuggestions: 0,
    usedSuggestions: 0,
    averageConfidence: 0,
    suggestionsByType: [],
    averageRating: 0,
  };

  // Process suggestions by type
  const typeStats = {};
  result.suggestionsByType.forEach((item) => {
    if (!typeStats[item.type]) {
      typeStats[item.type] = { total: 0, used: 0 };
    }
    typeStats[item.type].total += 1;
    if (item.used) {
      typeStats[item.type].used += 1;
    }
  });
  result.suggestionsByType = typeStats;

  return result;
};

// Enhanced static method to get comprehensive suggestion statistics by user
aiSuggestionSchema.statics.getDetailedUserStats = async function (
  userId,
  timeRange = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);

  // Handle both string and ObjectId for userId
  const userQuery = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // Main statistics aggregation
  const mainStats = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSuggestions: { $sum: 1 },
        usedSuggestions: {
          $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] },
        },
        averageConfidence: { $avg: "$confidence" },
        highConfidenceSuggestions: {
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
        totalWithFeedback: {
          $sum: {
            $cond: [{ $ne: ["$feedback.rating", null] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Statistics by type
  const typeStats = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: 1 },
        used: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
        averageConfidence: { $avg: "$confidence" },
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

  // Statistics by priority
  const priorityStats = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$priority",
        total: { $sum: 1 },
        used: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);

  // Daily usage trends
  const dailyTrends = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalSuggestions: { $sum: 1 },
        usedSuggestions: {
          $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const result = mainStats[0] || {
    totalSuggestions: 0,
    usedSuggestions: 0,
    averageConfidence: 0,
    highConfidenceSuggestions: 0,
    averageRating: 0,
    totalWithFeedback: 0,
  };

  return {
    ...result,
    usageRate:
      result.totalSuggestions > 0
        ? result.usedSuggestions / result.totalSuggestions
        : 0,
    highConfidenceRate:
      result.totalSuggestions > 0
        ? result.highConfidenceSuggestions / result.totalSuggestions
        : 0,
    feedbackRate:
      result.totalSuggestions > 0
        ? result.totalWithFeedback / result.totalSuggestions
        : 0,
    byType: typeStats,
    byPriority: priorityStats,
    dailyTrends: dailyTrends,
    timeRange: timeRange,
  };
};

// Static method to get simple suggestion count by user
aiSuggestionSchema.statics.getUserSuggestionCount = async function (
  userId,
  filters = {}
) {
  // Handle both string and ObjectId for userId
  const userQuery = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const query = { user: userQuery, ...filters };

  const counts = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        used: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
        unused: { $sum: { $cond: [{ $eq: ["$used", false] }, 1, 0] } },
      },
    },
  ]);

  return counts[0] || { total: 0, used: 0, unused: 0 };
};

// Static method to get daily quota usage for a user
aiSuggestionSchema.statics.getDailyQuotaUsage = async function (
  userId,
  date = new Date()
) {
  // Get start and end of the specified day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Handle both string and ObjectId for userId
  const userQuery = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const dailyStats = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalSuggestions: { $sum: 1 },
        usedSuggestions: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
        byType: {
          $push: {
            type: "$type",
            used: "$used",
            confidence: "$confidence",
            priority: "$priority",
          },
        },
        averageConfidence: { $avg: "$confidence" },
        highPriorityCount: {
          $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
        },
      },
    },
  ]);

  const result = dailyStats[0] || {
    totalSuggestions: 0,
    usedSuggestions: 0,
    byType: [],
    averageConfidence: 0,
    highPriorityCount: 0,
  };

  // Process type statistics
  const typeStats = {};
  result.byType.forEach((item) => {
    if (!typeStats[item.type]) {
      typeStats[item.type] = { total: 0, used: 0, avgConfidence: 0 };
    }
    typeStats[item.type].total += 1;
    if (item.used) {
      typeStats[item.type].used += 1;
    }
  });

  // Calculate average confidence by type
  Object.keys(typeStats).forEach((type) => {
    const typeItems = result.byType.filter((item) => item.type === type);
    const avgConfidence =
      typeItems.reduce((sum, item) => sum + item.confidence, 0) /
      typeItems.length;
    typeStats[type].avgConfidence = avgConfidence;
  });

  const DAILY_QUOTA = 100;

  return {
    date: startOfDay,
    quota: DAILY_QUOTA,
    used: result.totalSuggestions,
    remaining: Math.max(0, DAILY_QUOTA - result.totalSuggestions),
    usagePercentage: (result.totalSuggestions / DAILY_QUOTA) * 100,
    quotaExceeded: result.totalSuggestions >= DAILY_QUOTA,
    usedSuggestions: result.usedSuggestions,
    usageRate:
      result.totalSuggestions > 0
        ? result.usedSuggestions / result.totalSuggestions
        : 0,
    averageConfidence: result.averageConfidence,
    highPriorityCount: result.highPriorityCount,
    byType: typeStats,
  };
};

// Static method to get weekly quota trends
aiSuggestionSchema.statics.getWeeklyQuotaTrends = async function (
  userId,
  startDate = new Date()
) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() - 7);

  // Handle both string and ObjectId for userId
  const userQuery = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const weeklyTrends = await this.aggregate([
    {
      $match: {
        user: userQuery,
        createdAt: { $gte: endDate, $lte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalSuggestions: { $sum: 1 },
        usedSuggestions: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
        averageConfidence: { $avg: "$confidence" },
        highPriorityCount: {
          $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const DAILY_QUOTA = 100;

  return weeklyTrends.map((day) => ({
    date: day._id,
    quota: DAILY_QUOTA,
    used: day.totalSuggestions,
    remaining: Math.max(0, DAILY_QUOTA - day.totalSuggestions),
    usagePercentage: (day.totalSuggestions / DAILY_QUOTA) * 100,
    quotaExceeded: day.totalSuggestions >= DAILY_QUOTA,
    usedSuggestions: day.usedSuggestions,
    usageRate:
      day.totalSuggestions > 0 ? day.usedSuggestions / day.totalSuggestions : 0,
    averageConfidence: day.averageConfidence,
    highPriorityCount: day.highPriorityCount,
  }));
};

// Static method to check if user has quota remaining for today
aiSuggestionSchema.statics.checkDailyQuotaAvailable = async function (
  userId,
  date = new Date()
) {
  const dailyUsage = await this.getDailyQuotaUsage(userId, date);
  return {
    hasQuota: !dailyUsage.quotaExceeded,
    remaining: dailyUsage.remaining,
    used: dailyUsage.used,
    quota: dailyUsage.quota,
    usagePercentage: dailyUsage.usagePercentage,
  };
};

// Static method to get AI suggestions by user ID and starting date
aiSuggestionSchema.statics.getAISuggestionsByUserAndDate = async function (
  userId,
  startDate,
  options = {}
) {
  try {
    // Default options
    const {
      endDate = new Date(),
      limit = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = -1, // -1 for descending, 1 for ascending
      includeUsed = true,
      includeUnused = true,
      types = null, // Array of types to filter by
      priorities = null, // Array of priorities to filter by
      minConfidence = null,
      maxConfidence = null,
      callId = null, // Filter by specific call ID
    } = options;

    // Handle both string and ObjectId for userId
    const userQuery = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Build the base query
    const query = {
      user: userQuery,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    // Add optional filters
    if (!includeUsed && includeUnused) {
      query.used = false;
    } else if (includeUsed && !includeUnused) {
      query.used = true;
    }

    if (types && Array.isArray(types) && types.length > 0) {
      query.type = { $in: types };
    }

    if (priorities && Array.isArray(priorities) && priorities.length > 0) {
      query.priority = { $in: priorities };
    }

    if (minConfidence !== null || maxConfidence !== null) {
      query.confidence = {};
      if (minConfidence !== null) {
        query.confidence.$gte = minConfidence;
      }
      if (maxConfidence !== null) {
        query.confidence.$lte = maxConfidence;
      }
    }

    if (callId) {
      // Handle both string and ObjectId for callId
      query.call = mongoose.Types.ObjectId.isValid(callId)
        ? new mongoose.Types.ObjectId(callId)
        : callId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Execute the query
    const suggestions = await this.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Get total count for pagination
    const totalCount = await this.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(skip / limit) + 1;
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    // Get summary statistics for the filtered results
    const stats = await this.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSuggestions: { $sum: 1 },
          usedSuggestions: {
            $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] },
          },
          averageConfidence: { $avg: "$confidence" },
          highConfidenceSuggestions: {
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
          typeDistribution: {
            $push: "$type",
          },
          priorityDistribution: {
            $push: "$priority",
          },
        },
      },
    ]);

    const summary = stats[0] || {
      totalSuggestions: 0,
      usedSuggestions: 0,
      averageConfidence: 0,
      highConfidenceSuggestions: 0,
      averageRating: 0,
      typeDistribution: [],
      priorityDistribution: [],
    };

    // Process type and priority distributions
    const typeCount = {};
    summary.typeDistribution.forEach((type) => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const priorityCount = {};
    summary.priorityDistribution.forEach((priority) => {
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });

    return {
      suggestions,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
        limit,
        skip,
      },
      summary: {
        ...summary,
        usageRate:
          summary.totalSuggestions > 0
            ? summary.usedSuggestions / summary.totalSuggestions
            : 0,
        highConfidenceRate:
          summary.totalSuggestions > 0
            ? summary.highConfidenceSuggestions / summary.totalSuggestions
            : 0,
        typeDistribution: typeCount,
        priorityDistribution: priorityCount,
      },
      filters: {
        userId,
        startDate,
        endDate,
        includeUsed,
        includeUnused,
        types,
        priorities,
        minConfidence,
        maxConfidence,
        callId,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get AI suggestions: ${error.message}`);
  }
};

// Static method to get AI suggestions for a specific date range (simpler version)
aiSuggestionSchema.statics.getAISuggestionsInDateRange = async function (
  userId,
  startDate,
  endDate = new Date(),
  limit = 20
) {
  try {
    // Handle both string and ObjectId for userId
    const userQuery = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const suggestions = await this.find({
      user: userQuery,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("call", "title meetingId platform")
      .lean();

    const totalCount = await this.countDocuments({
      user: userQuery,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    return {
      suggestions,
      totalCount,
      dateRange: {
        startDate,
        endDate,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to get AI suggestions in date range: ${error.message}`
    );
  }
};

export default mongoose.model("AISuggestion", aiSuggestionSchema);
