import express from "express";
import { authenticate } from "../middleware/auth.js"; // Import the named export
import { catchAsync } from "../middleware/errorHandler.js";

const router = express.Router();

// GET /api/calls - Get all calls for user
router.get(
  "/",
  authenticate, // Use the authenticate middleware
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      platform,
      sort = "createdAt:desc",
    } = req.query;

    const Call = (await import("../models/Call.js")).default;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    const [sortField, sortOrder] = sort.split(":");
    const sortOptions = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    const calls = await Call.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Call.countDocuments(filter);

    res.json({
      success: true,
      data: {
        calls,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  })
);

// GET /api/calls/:id - Get specific call
router.get(
  "/:id",
  authenticate,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const Call = (await import("../models/Call.js")).default;

    let call = null;
    try {
      call = await Call.findById(id);
    } catch (error) {
      // Try by meetingId if not found by _id
      call = await Call.findOne({ meetingId: id });
    }

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (call.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this call",
      });
    }

    res.json({
      success: true,
      data: call,
    });
  })
);

// POST /api/calls - Create new call and return real database ID only
router.post(
  "/",
  authenticate,
  catchAsync(async (req, res) => {
    const Call = (await import("../models/Call.js")).default;
    const Subscription = (await import("../models/Subscription.js")).default;

    // Check subscription call limit
    let subscription = await Subscription.findOne({ user: req.user._id });
    
    // If no subscription exists, create a free tier subscription
    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user._id,
        plan: "free",
        status: "active",
        callLimit: 5, // Free tier gets 5 calls
        callsUsed: 0,
        billingPeriod: "monthly",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }
    
    // Check if subscription is active
    if (subscription.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your subscription is not active. Please subscribe to a plan.",
        error: "NO_ACTIVE_SUBSCRIPTION",
      });
    }
    
    // Check call limit if subscription has a limit
    if (subscription.callLimit > 0) {
      // Get call count for current billing period
      const periodStart = subscription.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const callCount = await Call.countDocuments({
        user: req.user._id,
        startTime: { $gte: periodStart },
      });

      if (callCount >= subscription.callLimit) {
        return res.status(403).json({
          success: false,
          message: `You have reached your call limit of ${subscription.callLimit} calls for this billing period. Please upgrade your plan or wait for the next billing cycle.`,
          error: "CALL_LIMIT_EXCEEDED",
          data: {
            callLimit: subscription.callLimit,
            callsUsed: callCount,
            periodStart: periodStart,
            periodEnd: subscription.currentPeriodEnd,
          },
        });
      }
    }

    // Remove any fake ID generation - only use database-generated IDs
    const callData = {
      ...req.body,
      user: req.user._id,
    };

    // Remove any fake meetingId if present
    if (
      callData.meetingId &&
      (callData.meetingId.includes("call_") ||
        callData.meetingId.includes("meeting_"))
    ) {
      delete callData.meetingId;
    }

    const call = await Call.create(callData);

    // Update subscription callsUsed if subscription exists
    if (subscription && subscription.callLimit > 0) {
      const periodStart = subscription.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const updatedCallCount = await Call.countDocuments({
        user: req.user._id,
        startTime: { $gte: periodStart },
      });
      subscription.callsUsed = updatedCallCount;
      await subscription.save();
    }

    console.log(
      `✅ Call created with real database ID: ${call._id} for user: ${req.user._id}`
    );

    res.status(201).json({
      success: true,
      message: "Call created successfully",
      data: call, // This contains the real _id from MongoDB
    });
  })
);

// PATCH /api/calls/:id - Update call (only accept real database IDs)
router.patch(
  "/:id",
  authenticate,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate that we're using a real database ID
    if (!id || id.includes("call_") || id.includes("meeting_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID: Only real database IDs are allowed",
      });
    }

    console.log(`📝 PATCH /calls/${id} - Real database ID updates:`, updates);

    try {
      const Call = (await import("../models/Call.js")).default;

      // Find call by real database ID only
      const call = await Call.findById(id);

      if (!call) {
        console.log(`❌ No call found for real database ID: ${id}`);
        return res.status(404).json({
          success: false,
          message: "Call not found",
        });
      }

      // Check if user owns the call
      if (call.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this call",
        });
      }

      // Update the call with provided data
      Object.keys(updates).forEach((key) => {
        if (key !== "_id" && key !== "user" && key !== "createdAt") {
          call[key] = updates[key];
        }
      });

      const updatedCall = await call.save();

      res.json({
        success: true,
        message: "Call updated successfully",
        data: updatedCall,
      });
    } catch (error) {
      console.error(`❌ Failed to update call ${id}:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to update call",
        error: error.message,
      });
    }
  })
);

// DELETE /api/calls/:id - Delete call
router.delete(
  "/:id",
  authenticate,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const Call = (await import("../models/Call.js")).default;

    let call = null;
    try {
      call = await Call.findById(id);
    } catch (error) {
      call = await Call.findOne({ meetingId: id });
    }

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (call.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this call",
      });
    }

    await Call.findByIdAndDelete(call._id);

    res.json({
      success: true,
      message: "Call deleted successfully",
    });
  })
);

// Start call (update status to active)
router.patch(
  "/:id/start",
  authenticate,
  catchAsync(async (req, res) => {
    const Call = (await import("../models/Call.js")).default;

    const call = await Call.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: "active",
        startTime: new Date(),
      },
      { new: true }
    );

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.json({
      success: true,
      message: "Call started successfully",
      data: {
        call,
      },
    });
  })
);

// End call (update status to completed)
router.patch(
  "/:id/end",
  authenticate,
  catchAsync(async (req, res) => {
    const Call = (await import("../models/Call.js")).default;

    const call = await Call.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: "completed",
        endTime: new Date(),
      },
      { new: true }
    );

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.json({
      success: true,
      message: "Call ended successfully",
      data: {
        call,
      },
    });
  })
);

// POST /api/calls/:id/summary - Generate call summary
router.post(
  "/:id/summary",
  authenticate,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const mongoose = (await import("mongoose")).default;
    const Call = (await import("../models/Call.js")).default;
    const aiService = (await import("../services/aiService.js")).default;
    const Transcript = (await import("../models/Transcript.js")).default;

    // Try to find call by ID or meetingId
    let call = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      call = await Call.findById(id);
    }
    
    if (!call) {
      call = await Call.findOne({ meetingId: id });
    }

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (call.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this call",
      });
    }

    // Get transcripts for this call - handle both ObjectId and string call IDs
    const callId = call._id;
    const transcripts = await Transcript.find({
      $or: [
        { call: callId },
        { call: callId.toString() },
        { call: id },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    if (!transcripts || transcripts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transcripts available for this call",
      });
    }

    // Generate summary using AI service
    const transcriptHistory = transcripts
      .filter((t) => t.text && t.text.trim().length > 0) // Filter out empty transcripts
      .map((t) => ({
        speaker: t.speaker || "Speaker",
        text: t.text || "",
        timestamp: t.timestamp || new Date(),
      }));

    if (transcriptHistory.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid transcript content available to summarize",
      });
    }

    const summary = await aiService.generateSummary(transcriptHistory);

    res.json({
      success: true,
      data: {
        summary,
        callId: call._id.toString(),
      },
    });
  })
);

// POST /api/calls/:id/share - Share call summary via email
router.post(
  "/:id/share",
  authenticate,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { email, summary } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    const mongoose = (await import("mongoose")).default;
    const Call = (await import("../models/Call.js")).default;
    const Transcript = (await import("../models/Transcript.js")).default;
    const emailService = (await import("../services/emailService.js")).default;

    // Try to find call by ID or meetingId
    let call = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      call = await Call.findById(id);
    }
    
    if (!call) {
      call = await Call.findOne({ meetingId: id });
    }

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    if (call.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to share this call",
      });
    }

    // Get transcripts for this call - handle both ObjectId and string call IDs
    const callId = call._id;
    const transcripts = await Transcript.find({
      $or: [
        { call: callId },
        { call: callId.toString() },
        { call: id },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    // Generate summary if not provided
    let callSummary = summary;
    if (!callSummary) {
      const aiService = (await import("../services/aiService.js")).default;
      const transcriptHistory = transcripts.map((t) => ({
        speaker: t.speaker,
        text: t.text,
        timestamp: t.timestamp,
      }));
      callSummary = await aiService.generateSummary(transcriptHistory);
    }

    // Prepare call data for email
    const callData = {
      callTitle: call.title || `Call ${id}`,
      summary: callSummary,
      callDate: call.startTime || call.createdAt,
      callDuration: call.duration || 0,
      transcripts: transcripts.map((t) => ({
        speaker: t.speaker,
        text: t.text,
        timestamp: t.timestamp,
      })),
    };

    // Send email
    const result = await emailService.sendCallSummary(callData, email);

    res.json({
      success: true,
      message: "Call summary sent successfully",
      data: result,
    });
  })
);

export default router;
