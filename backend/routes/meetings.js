import express from "express";
import axios from "axios";
import config from "../config/config.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { validateObjectId } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import zoomService from "../services/zoomService.js";
// import googleMeetService from "../services/googleMeetService.js";
import emailService from "../services/emailService.js";
import zoomOAuthRoutes from "./zoomOAuth.js";

const router = express.Router();

// Apply CORS headers to all routes in this router
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  next();
});

// Apply authentication to all routes except webhooks and OAuth callbacks
router.use((req, res, next) => {
  // Skip authentication for webhook endpoints and OAuth callbacks
  if (req.path.includes("/webhook") || req.path.includes("/rtms") || req.path.includes("/zoom/oauth/callback")) {
    return next();
  }
  // Apply authentication to other routes
  authenticate(req, res, next);
});

// ==================== ZOOM ROUTES ====================

// Create Zoom meeting
router.post(
  "/zoom/create",
  catchAsync(async (req, res) => {
    const { meetingData } = req.body;

    if (!meetingData) {
      return res.status(400).json({
        success: false,
        message: "Meeting data is required",
      });
    }

    // Create meeting directly using backend's Zoom app credentials
    // No OAuth connection required - meetings are created with the app's account
    console.log("🔗 Creating Zoom meeting using backend app credentials (no user OAuth required)");

    let meeting;
    
    try {
      // Use the backend's Zoom service to create meeting
      // This uses Server-to-Server OAuth or the app's own credentials
      const zoomUserId = "me"; // Use "me" to create for the app's account
        meeting = await zoomService.createMeeting(zoomUserId, meetingData);
      console.log("✅ Created meeting successfully with backend app credentials");
      } catch (error) {
      console.error("❌ Failed to create meeting");
        console.error("Error type:", error.constructor?.name || typeof error);
        console.error("Error message:", error.message);
        console.error("Error status:", error.response?.status);
        if (error.response?.data) {
          try {
            console.error("Error response data:", JSON.stringify(error.response.data, null, 2));
          } catch (e) {
            console.error("Error response data (could not stringify):", error.response.data);
          }
        }
        
        // Extract error message and provide helpful guidance
        let errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to create Zoom meeting";
        
      // Provide more helpful error messages
      if (error.message?.includes("Server-to-Server OAuth") || error.message?.includes("unsupported_grant_type")) {
        errorMessage = "To create meetings automatically, you need a Server-to-Server OAuth app in Zoom Marketplace. Your current app appears to be a regular OAuth app. Please create a Server-to-Server OAuth app or configure your existing Server-to-Server app with ZOOM_ACCOUNT_ID in your .env file.";
      } else if (error.message?.includes("Zoom credentials not configured")) {
        errorMessage = "Zoom credentials are not configured. Please set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET in your .env file.";
        }
        
        const errorCode = error.response?.status || error.response?.data?.code || 500;
        
        return res.status(errorCode >= 400 && errorCode < 600 ? errorCode : 500).json({
          success: false,
          message: errorMessage,
          error: errorMessage,
          details: error.response?.data ? {
            ...error.response.data,
            status: error.response.status
          } : { 
            status: errorCode,
            message: error.message || "Unknown error occurred"
          },
        });
    }

    // Disable email notifications for the newly created meeting
    try {
      await zoomService.disableEmailNotifications(meeting.id);
      console.log("✅ Email notifications disabled for new meeting");
    } catch (error) {
      console.warn("⚠️ Failed to disable email notifications:", error.message);
      // Don't fail the request if disabling notifications fails
    }

    res.status(201).json({
      success: true,
      message: "Zoom meeting created successfully",
      data: {
        meeting,
      },
    });
  })
);

// Get Zoom meeting details
router.get(
  "/zoom/:meetingId",
  validateObjectId("meetingId"),
  catchAsync(async (req, res) => {
    const { meetingId } = req.params;

    const meeting = await zoomService.getMeeting(meetingId);

    res.json({
      success: true,
      data: {
        meeting,
      },
    });
  })
);

// List Zoom meetings
router.get(
  "/zoom/user/list",
  catchAsync(async (req, res) => {
    const { type = "scheduled", pageSize = 30 } = req.query;
    const zoomUserId = req.user.email;

    const meetings = await zoomService.listMeetings(
      zoomUserId,
      type,
      parseInt(pageSize)
    );

    res.json({
      success: true,
      data: meetings,
    });
  })
);

// Update Zoom meeting
router.patch(
  "/zoom/:meetingId",
  validateObjectId("meetingId"),
  catchAsync(async (req, res) => {
    const { meetingId } = req.params;
    const updateData = req.body;

    const meeting = await zoomService.updateMeeting(meetingId, updateData);

    res.json({
      success: true,
      message: "Zoom meeting updated successfully",
      data: {
        meeting,
      },
    });
  })
);

// Delete Zoom meeting
router.delete(
  "/zoom/:meetingId",
  validateObjectId("meetingId"),
  catchAsync(async (req, res) => {
    const { meetingId } = req.params;

    await zoomService.deleteMeeting(meetingId);

    res.json({
      success: true,
      message: "Zoom meeting deleted successfully",
    });
  })
);

// Get Zoom meeting recordings
router.get(
  "/zoom/:meetingId/recordings",
  validateObjectId("meetingId"),
  catchAsync(async (req, res) => {
    const { meetingId } = req.params;

    const recordings = await zoomService.getMeetingRecordings(meetingId);

    res.json({
      success: true,
      data: {
        recordings,
      },
    });
  })
);

// Get Zoom meeting participants
router.get(
  "/zoom/:meetingId/participants",
  validateObjectId("meetingId"),
  catchAsync(async (req, res) => {
    const { meetingId } = req.params;

    const participants = await zoomService.getMeetingParticipants(meetingId);

    res.json({
      success: true,
      data: participants,
    });
  })
);

// Generate Zoom SDK signature
router.post(
  "/zoom/sdk-signature",
  catchAsync(async (req, res) => {
    const { meetingNumber, role = 0 } = req.body;

    if (!meetingNumber) {
      return res.status(400).json({
        success: false,
        message: "Meeting number is required",
      });
    }

    try {
      console.log(
        "Generating SDK signature for meeting:",
        meetingNumber,
        "role:",
        role
      );
      const signature = zoomService.generateSDKSignature(meetingNumber, role);

      res.json({
        success: true,
        data: {
          signature,
        },
      });
    } catch (error) {
      console.error("Failed to generate SDK signature:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate SDK signature",
        error: error.message,
      });
    }
  })
);

// Generate Zoom ZAK token for authenticated user join
router.post(
  "/zoom/generate-zak",
  catchAsync(async (req, res) => {
    const { meetingNumber } = req.body;

    if (!meetingNumber) {
      return res.status(400).json({
        success: false,
        message: "Meeting number is required",
      });
    }

    try {
      console.log("Generating ZAK token for meeting:", meetingNumber);
      const zakData = await zoomService.generateZAK(meetingNumber);

      res.json({
        success: true,
        message: "ZAK token generated successfully",
        data: zakData,
      });
    } catch (error) {
      console.error("Failed to generate ZAK token:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate ZAK token",
        error: error.message,
      });
    }
  })
);

// Zoom webhook endpoint
router.post(
  "/zoom/webhook",
  catchAsync(async (req, res) => {
    const signature = req.headers["authorization"];
    const timestamp = req.headers["x-zm-request-timestamp"];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!zoomService.verifyWebhookSignature(body, signature, timestamp)) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const { event, payload } = req.body;

    // Handle webhook event
    zoomService.handleWebhook(event, payload);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  })
);

// Send Zoom meeting invite via email
router.post(
  "/zoom/send-invite",
  catchAsync(async (req, res) => {
    const { meetingId, meetingTopic, joinUrl, password, startTime, emails } =
      req.body;

    if (
      !meetingId ||
      !emails ||
      !Array.isArray(emails) ||
      emails.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Meeting ID and recipient emails are required",
      });
    }

    try {
      const meetingData = {
        meetingId,
        meetingTopic: meetingTopic || "AI Sales Meeting",
        joinUrl,
        password,
        startTime: startTime || new Date().toISOString(),
      };

      const result = await emailService.sendMeetingInvite(meetingData, emails);

      res.json({
        success: true,
        message: "Meeting invites sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Failed to send meeting invites:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send meeting invites",
        error: error.message,
      });
    }
  })
);

// Disable email notifications for a meeting
router.patch(
  "/zoom/:meetingId/disable-notifications",
  validateObjectId("meetingId"),
  catchAsync(async (req, res) => {
    const { meetingId } = req.params;

    try {
      await zoomService.disableEmailNotifications(meetingId);

      res.json({
        success: true,
        message: "Email notifications disabled successfully",
      });
    } catch (error) {
      console.error("Failed to disable email notifications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to disable email notifications",
        error: error.message,
      });
    }
  })
);

// ==================== GOOGLE MEET ROUTES ====================

// Get Google OAuth URL
router.get(
  "/google/auth-url",
  catchAsync(async (req, res) => {
    const { state } = req.query;

    const authUrl = googleMeetService.generateAuthUrl(state);

    res.json({
      success: true,
      data: {
        authUrl,
      },
    });
  })
);

// Handle Google OAuth callback
router.get(
  "/google/callback",
  catchAsync(async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    const tokens = await googleMeetService.getTokens(code);

    // In a real application, you would store these tokens securely
    // associated with the user account
    res.json({
      success: true,
      message: "Google authorization successful",
      data: {
        tokens,
        state,
      },
    });
  })
);

// Exchange Google OAuth code for tokens
router.post(
  "/google/exchange-code",
  catchAsync(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    const tokens = await googleMeetService.getTokens(code);

    res.json({
      success: true,
      message: "Tokens exchanged successfully",
      data: {
        tokens,
      },
    });
  })
);

// Refresh Google tokens
router.post(
  "/google/refresh-token",
  catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const tokens = await googleMeetService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        tokens,
      },
    });
  })
);

// Create Google Meet meeting
router.post(
  "/google/create",
  catchAsync(async (req, res) => {
    const { userTokens, meetingData } = req.body;

    if (!userTokens || !meetingData) {
      return res.status(400).json({
        success: false,
        message: "User tokens and meeting data are required",
      });
    }

    const meeting = await googleMeetService.createMeeting(
      userTokens,
      meetingData
    );

    res.status(201).json({
      success: true,
      message: "Google Meet created successfully",
      data: {
        meeting,
      },
    });
  })
);

// Get Google Meet details
router.get(
  "/google/:eventId",
  catchAsync(async (req, res) => {
    const { eventId } = req.params;
    const { userTokens } = req.query;

    if (!userTokens) {
      return res.status(400).json({
        success: false,
        message: "User tokens are required",
      });
    }

    const parsedTokens =
      typeof userTokens === "string" ? JSON.parse(userTokens) : userTokens;
    const meeting = await googleMeetService.getMeeting(parsedTokens, eventId);

    res.json({
      success: true,
      data: {
        meeting,
      },
    });
  })
);

// List Google Meet meetings
router.get(
  "/google/user/list",
  catchAsync(async (req, res) => {
    res.json({
      success: true,
      data: meetings,
    });
  })
);

// Update Google Meet
router.patch(
  "/google/:eventId",
  catchAsync(async (req, res) => {
    const { eventId } = req.params;
    const { userTokens, updateData } = req.body;

    if (!userTokens || !updateData) {
      return res.status(400).json({
        success: false,
        message: "User tokens and update data are required",
      });
    }

    const meeting = await googleMeetService.updateMeeting(
      userTokens,
      eventId,
      updateData
    );

    res.json({
      success: true,
      message: "Google Meet updated successfully",
      data: {
        meeting,
      },
    });
  })
);

// Delete Google Meet
router.delete(
  "/google/:eventId",
  catchAsync(async (req, res) => {
    const { eventId } = req.params;
    const { userTokens } = req.body;

    if (!userTokens) {
      return res.status(400).json({
        success: false,
        message: "User tokens are required",
      });
    }

    await googleMeetService.deleteMeeting(userTokens, eventId);

    res.json({
      success: true,
      message: "Google Meet deleted successfully",
    });
  })
);

// Get Google Meet recordings
router.get(
  "/google/:eventId/recordings",
  catchAsync(async (req, res) => {
    const { eventId } = req.params;
    const { userTokens } = req.query;

    if (!userTokens) {
      return res.status(400).json({
        success: false,
        message: "User tokens are required",
      });
    }

    const parsedTokens =
      typeof userTokens === "string" ? JSON.parse(userTokens) : userTokens;
    const recordings = await googleMeetService.getMeetingRecordings(
      parsedTokens,
      eventId
    );

    res.json({
      success: true,
      data: recordings,
    });
  })
);

// Get user's Google calendars
router.get(
  "/google/calendars",
  catchAsync(async (req, res) => {
    const { userTokens } = req.query;

    if (!userTokens) {
      return res.status(400).json({
        success: false,
        message: "User tokens are required",
      });
    }

    const parsedTokens =
      typeof userTokens === "string" ? JSON.parse(userTokens) : userTokens;
    const calendars = await googleMeetService.getCalendars(parsedTokens);

    res.json({
      success: true,
      data: calendars,
    });
  })
);

// Validate Google tokens
router.post(
  "/google/validate-tokens",
  catchAsync(async (req, res) => {
    const { userTokens } = req.body;

    if (!userTokens) {
      return res.status(400).json({
        success: false,
        message: "User tokens are required",
      });
    }

    const isValid = await googleMeetService.validateTokens(userTokens);

    res.json({
      success: true,
      data: {
        valid: isValid,
      },
    });
  })
);

// Remove the entire duration POST endpoint - we only update existing calls

// Keep only the PATCH endpoint for updating existing calls
router.patch(
  "/duration/:callId",
  authenticate, // Add authentication middleware
  catchAsync(async (req, res) => {
    const { callId } = req.params;
    const { duration, endTime, status, source = "manual" } = req.body;

    console.log(`📝 Duration update request:`, {
      callId,
      duration,
      endTime,
      status,
      source,
      userId: req.user._id,
    });

    if (!duration && duration !== 0) {
      return res.status(400).json({
        success: false,
        message: "Duration is required",
      });
    }

    try {
      const Call = (await import("../models/Call.js")).default;

      // Enhanced call finding with user verification
      let call = null;

      try {
        call = await Call.findOne({
          _id: callId,
          user: req.user._id,
        });
        if (call) {
          console.log(
            `📝 Found call by ID: ${call._id}, current duration: ${call.duration}s, status: ${call.status}`
          );
        }
      } catch (error) {
        console.log(`📝 Could not find call by ID: ${callId}`);
      }

      if (!call) {
        call = await Call.findOne({
          meetingId: callId,
          user: req.user._id,
        });
        if (call) {
          console.log(
            `📝 Found call by meetingId: ${call._id}, current duration: ${call.duration}s, status: ${call.status}`
          );
        }
      }

      if (!call) {
        console.log(
          `❌ No call found for ID: ${callId} and user: ${req.user._id}`
        );
        return res.status(404).json({
          success: false,
          message: "Call not found or access denied",
        });
      }

      // Store old values for comparison
      const oldDuration = call.duration;
      const oldStatus = call.status;

      // Update call using the model method to prevent duplicates
      await call.updateDuration(duration, source);

      // Update additional fields if provided
      if (status) {
        call.status = status;
      }
      if (endTime) {
        call.endTime = new Date(endTime);
      }

      const savedCall = await call.save();

      res.json({
        success: true,
        message: "Call updated successfully",
        data: {
          callId: savedCall._id,
          duration: savedCall.duration,
          status: savedCall.status,
          endTime: savedCall.endTime,
          source: source,
          updated: true,
        },
      });
    } catch (error) {
      console.error("❌ Failed to update call:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update call",
        error: error.message,
      });
    }
  })
);

// ==================== ZOOM OAUTH ROUTES ====================
// Mount Zoom OAuth routes
router.use("/", zoomOAuthRoutes);

export default router;
