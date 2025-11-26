import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import zoomRTMSService from "./services/zoomRTMSService.js";

// Import configuration and database
import config from "./config/config.js";
import database from "./config/database.js";

// Import middleware
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

// Import routes
import authRoutes from "./routes/auth.js";
import callRoutes from "./routes/calls.js";
import meetingRoutes from "./routes/meetings.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/admin.js";
import billingRoutes from "./routes/billing.js";
import zoomRoutes from "./routes/zoom.js";

// Import services
import aiService from "./services/aiService.js";
import zoomService from "./services/zoomService.js";
// import googleMeetService from "./services/googleMeetService.js";
import TranscriptAnalyzer from "./services/transcriptAnalyzer.js";
import mongoose from "mongoose";
import { text } from "stream/consumers";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "https://www.tryollie.io",
      "https://tryollie.io",
      "http://localhost:5173",
      "chrome-extension://*",
    ],

    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize RTMS service
// Set up RTMS transcript handler to follow same flow as existing transcription
zoomRTMSService.onTranscript(async (transcriptData) => {
  try {
    // Convert text to string if it's a Buffer
    const textData = Buffer.isBuffer(transcriptData.text)
      ? transcriptData.text.toString("utf8")
      : transcriptData.text;

    // Use the globalCallId exactly as set when user joins call
    const callId = globalCallId;

    console.log(
      `📝 RTMS transcript received - Using callId: ${callId}, globalCallId: ${globalCallId}`
    );

    // Ensure text is properly converted before processing
    const processedTranscriptData = {
      ...transcriptData,
      text: textData,
    };

    // Delegate to unified handler which will persist, broadcast and analyze
    await handleNewTranscript(callId, processedTranscriptData);
  } catch (error) {
    console.error("❌ Error handling RTMS transcript:", error);
  }
});

// Set up RTMS meeting end handler
zoomRTMSService.onMeetingEnd(async (meetingEndData) => {
  try {
    const { meetingId, endTime, reason } = meetingEndData;

    console.log(
      `🏁 Meeting ended via RTMS - Meeting: ${meetingId}, Reason: ${reason}`
    );

    // Find and update the call document
    const Call = (await import("./models/Call.js")).default;
    let callDoc = null;

    // Try to find call by meeting ID or global call ID
    if (globalCallDoc && globalCallDoc.meetingId === meetingId) {
      callDoc = globalCallDoc;
    } else {
      try {
        callDoc = await Call.findOne({ meetingId: meetingId });
      } catch (error) {
        console.error("Error finding call by meetingId:", error);
      }
    }

    if (callDoc) {
      try {
        // Update call status to completed
        await Call.findByIdAndUpdate(callDoc._id, {
          status: "completed",
          endTime: endTime,
          lastActivity: endTime,
          completedAt: endTime,
        });

        console.log(`✅ Call ${callDoc._id} marked as completed`);

        // Emit meeting end event to all connected clients
        const meetingEndEvent = {
          type: "meeting_ended",
          meetingId: meetingId,
          callId: callDoc._id,
          endTime: endTime,
          reason: reason,
          platform: "zoom",
        };

        // Broadcast to specific call room and globally
        if (globalCallId) {
          io.to(globalCallId).emit("meetingEnded", meetingEndEvent);
        }
        io.emit("meetingEnded", meetingEndEvent);

        console.log(`📡 Meeting end event broadcasted for call ${callDoc._id}`);

        // Clear global call variables since meeting has ended
        globalCallId = null;
        globalCallDoc = null;

        // Clear processed transcripts for this call
        const keysToRemove = Array.from(processedTranscripts).filter(
          (key) =>
            key.startsWith(`${callDoc._id}-`) || key.startsWith(`${meetingId}-`)
        );
        keysToRemove.forEach((key) => processedTranscripts.delete(key));
        console.log(
          `🧹 Cleared ${keysToRemove.length} processed transcripts for ended meeting`
        );
      } catch (updateError) {
        console.error("Error updating call on meeting end:", updateError);
      }
    } else {
      console.log(`⚠️ No call document found for meeting ${meetingId}`);
    }
  } catch (error) {
    console.error("❌ Error handling meeting end:", error);
  }
});

// Initialize transcript analyzer for AI suggestions
const transcriptAnalyzer = new TranscriptAnalyzer();

// Global variable to store current call ID for RTMS
let globalCallId = null;
let globalCallDoc = null; // Store the entire call document for easy access

// Track processed transcripts to prevent duplicates
const processedTranscripts = new Set();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    // Allow development tokens for testing
    if (token.startsWith("dev-token-")) {
      socket.user = { id: "dev-user", name: "Development User" };
      socket.userId = "dev-user";
      console.log("🔧 Development token accepted");
      return next();
    }

    // Verify JWT token for production
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return next(new Error("Invalid token"));
    }

    // Get user from database
    const User = (await import("./models/User.js")).default;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = userId;

    next();
  } catch (error) {
    console.error("Socket.IO authentication error:", error);
    next(new Error("Authentication failed"));
  }
});

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://www.tryollie.io",
        "https://tryollie.io",
        "https://api.tryollie.io",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
      ];

      // Allow any localhost origin in development
      if (config.NODE_ENV === "development" && origin.includes("localhost")) {
        return callback(null, true);
      }

      // Allow chrome extensions
      if (origin && origin.startsWith("chrome-extension://")) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Access-Control-Allow-Origin"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Add explicit preflight handling for all routes
app.options("*", cors());

// Add CORS headers middleware as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow localhost origins in development
  if (
    config.NODE_ENV === "development" &&
    origin &&
    origin.includes("localhost")
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (config.CORS_ORIGIN.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rate limiting
app.use(generalLimiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve static files
app.use("/uploads", express.static(uploadsDir));
app.use(express.static(publicDir));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists before storing files
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|mp4/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/zoom", zoomRoutes); // Zoom OAuth callback route
// Debug middleware to log all /api/admin requests (before routes)
app.use("/api/admin", (req, res, next) => {
  console.log(`🔍 Admin route request: ${req.method} ${req.originalUrl}`);
  console.log(`   Path: ${req.path}, Base URL: ${req.baseUrl}`);
  next();
});

app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);

// Debug: Log all registered admin routes
console.log("✅ Admin routes mounted at /api/admin");
console.log("📋 Available admin endpoints:");
console.log("   GET /api/admin/dashboard/stats");
console.log("   GET /api/admin/users");
console.log("   GET /api/admin/meetings");
console.log("   GET /api/admin/suggestions");
console.log("   GET /api/admin/subscriptions");
console.log("   GET /api/admin/analytics");

// Endpoint: Generate call summary using OpenAI
app.post("/api/calls/:id/summary", async (req, res) => {
  try {
    const { id } = req.params;

    const CallModel = (await import("./models/Call.js")).default;
    const Transcript = (await import("./models/Transcript.js")).default;

    // Try to resolve a Call document by _id or meetingId
    let callDoc = null;
    try {
      callDoc = await CallModel.findById(id)
        .lean()
        .catch(() => null);
    } catch (e) {
      callDoc = null;
    }
    if (!callDoc) {
      try {
        callDoc = await CallModel.findOne({ meetingId: id })
          .lean()
          .catch(() => null);
      } catch (e) {
        callDoc = null;
      }
    }

    // Build query keys for transcripts
    const callKeys = [id];
    if (callDoc && callDoc._id) callKeys.push(String(callDoc._id));

    const objectId = new mongoose.Types.ObjectId(id);

    const transcripts = await Transcript.find({ call: objectId })
      .sort({ timestamp: 1 })
      .lean()
      .limit(500);

    if (!transcripts || transcripts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transcripts found for this call",
      });
    }

    // Convert transcripts to conversation text
    const conversationText = transcripts
      .map((t) => `${t.speaker}: ${t.text}`)
      .join("\n");

    if (!conversationText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No conversation content found",
      });
    }

    // Generate summary using AI service
    const prompt = `You are a professional business analyst specializing in meeting documentation and call analysis. 

Generate a comprehensive, well-structured call summary report that is easy to read and understand. Follow this exact format:

**MEETING OVERVIEW**
- Brief 2-3 sentence description of the meeting purpose and outcome

**PARTICIPANTS**
- List all speakers/participants mentioned in the call
- Include their roles if identifiable from context

**KEY DISCUSSION POINTS**
- Main topics discussed (use bullet points)
- Important concepts and ideas presented
- Questions raised and addressed

**DECISIONS MADE**
- Specific decisions reached during the call
- Agreements or consensus points
- Approved actions or changes

**ACTION ITEMS**
- Clear list of tasks assigned
- Who is responsible for each action (if mentioned)
- Deadlines or timelines (if mentioned)

**NEXT STEPS**
- Follow-up meetings or calls planned
- Immediate next actions required
- Future considerations discussed

**ADDITIONAL NOTES**
- Any other relevant information
- Concerns or risks mentioned
- Opportunities identified

Use clear, professional language. Make extensive use of bullet points and numbered lists for easy reading. Keep sentences concise but informative.

Call conversation to analyze:

${conversationText}`;

    const summary = await aiService.generateCompletion(prompt, {
      model: "gpt-4o-mini",
      maxTokens: 1000,
      temperature: 0.7,
    });

    if (!summary || !summary.content) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate summary",
      });
    }

    // Update call document with summary if it exists
    if (callDoc) {
      try {
        await CallModel.findByIdAndUpdate(callDoc._id, {
          summary: summary.content,
          summaryGeneratedAt: new Date(),
        });
      } catch (updateError) {
        console.error("Error updating call with summary:", updateError);
      }
    }

    return res.json({
      success: true,
      data: {
        summary: summary.content,
        transcriptCount: transcripts.length,
        callTitle: callDoc?.title || `Call ${id}`,
      },
    });
  } catch (error) {
    console.error("Error generating call summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate call summary",
      error: error.message,
    });
  }
});

// Endpoint: Get call transcripts and AI suggestions by call ID
app.get("/api/calls/:id/log", async (req, res) => {
  try {
    const { id } = req.params;

    const CallModel = (await import("./models/Call.js")).default;
    const Transcript = (await import("./models/Transcript.js")).default;
    const AISuggestion = (await import("./models/AISuggestion.js")).default;

    // Try to resolve a Call document by _id or meetingId
    let callDoc = null;
    try {
      callDoc = await CallModel.findById(id)
        .lean()
        .catch(() => null);
    } catch (e) {
      callDoc = null;
    }

    if (!callDoc) {
      try {
        callDoc = await CallModel.findOne({ meetingId: id })
          .lean()
          .catch(() => null);
      } catch (e) {
        callDoc = null;
      }
    }

    // Build query keys for transcripts and suggestions
    const callKeys = [id];
    if (callDoc && callDoc._id) callKeys.push(String(callDoc._id));

    // Fetch transcripts and suggestions
    const objectId = new mongoose.Types.ObjectId(id);

    const transcripts = await Transcript.find({ call: objectId })
      .sort({ timestamp: 1 })
      .lean()
      .limit(500);

    const suggestions = await AISuggestion.find({ call: objectId })
      .sort({ timestamp: 1 })
      .lean()
      .limit(500);

    return res.json({
      success: true,
      data: { call: callDoc, transcripts, suggestions },
    });
  } catch (error) {
    console.error("Error fetching call log:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch call log",
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      services: {
        database: dbHealth,
        ai: !!config.OPENAI_API_KEY,
        ai_model: "gpt-4o-mini", // Using cost-effective GPT-4o-mini
        transcription: "zoom_rtms", // Only using Zoom RTMS for transcription
        zoom: !!config.ZOOM_SDK_KEY,
        meet: !!config.GOOGLE_CLIENT_ID,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    });
  }
});

// WebSocket for real-time features
io.on("connection", (socket) => {
  console.log(`👤 User connected: ${socket.id} (User: ${socket.userId})`);

  // Handle authentication errors
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    socket.emit("error", { message: "Connection failed: " + error.message });
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", { message: "Socket error: " + error.message });
  });

  socket.on("joinCall", async (data) => {
    try {
      const { callId, userId, platform } = data;

      if (!callId || !userId) {
        socket.emit("error", { message: "Call ID and User ID are required" });
        return;
      }

      socket.join(callId);
      console.log(
        `📞 User ${socket.id} joined call ${callId} on ${
          platform || "unknown"
        } platform`
      );

      // CRITICAL: Use the callId directly if it's already a valid MongoDB ObjectId
      try {
        const Call = (await import("./models/Call.js")).default;
        let callDoc = null;

        // The callId passed should already be the database ObjectId
        if (mongoose.Types.ObjectId.isValid(callId)) {
          callDoc = await Call.findById(callId);
          console.log(`📋 Found call by ObjectId: ${callDoc?._id}`);

          // If not found, try by meetingId
          if (!callDoc) {
            callDoc = await Call.findOne({ meetingId: callId });
            console.log(`📋 Found call by meetingId: ${callDoc?._id}`);
          }

          if (callDoc) {
            // Store the ACTUAL MongoDB ObjectId globally - THIS IS THE KEY FIX
            globalCallId = callDoc._id; // This should be 68d30879209b6db6a58c678d, NOT call_1758660725615
            globalCallDoc = callDoc;
            console.log(
              `🔗 Global call ObjectId set to: ${globalCallId} (Database ID)`
            );
            console.log(`🔗 Meeting ID was: ${callId} (Socket room ID)`);
            console.log(
              `🔗 Global call document stored with user: ${globalCallDoc.user}`
            );
          } else {
            console.log(`❌ No call document found for ${callId}`);
            globalCallId = null; // Don't set to callId - set to null if no database record
            globalCallDoc = null;
          }
        }
      } catch (error) {
        console.error("Error finding call document:", error);
        globalCallId = null;
        globalCallDoc = null;
      }

      // Start platform-specific monitoring
      if (platform === "zoom") {
        await zoomService.startAIMonitoring(data.meetingId, callId, io);
      } else if (platform === "google_meet") {
        await googleMeetService.startAIMonitoring(data.meetingId, callId, io);
      }

      // Store socket user ID for later use
      socket.userId = userId;
      socket.callId = callId;
      socket.platform = platform;
      socket.meetingId = data.meetingId;

      // Emit successful join
      socket.emit("callJoined", { callId, platform });
    } catch (error) {
      console.error("Error joining call:", error);
      socket.emit("error", { message: "Failed to join call" });
    }
  });

  socket.on("leaveCall", async (data) => {
    try {
      const { callId } = data;
      socket.leave(callId);

      // Stop RTMS transcription if active
      if (socket.platform === "zoom" && socket.meetingId) {
        await zoomRTMSService.stopRTMSTranscription(socket.meetingId);
      }

      // Clear AI conversation context
      aiService.clearConversationContext(callId);

      console.log(`📞 User ${socket.id} left call ${callId}`);
      socket.emit("callLeft", { callId });
    } catch (error) {
      console.error("Error leaving call:", error);
    }
  });

  // Add explicit meeting end handler for WebSocket events
  socket.on("meetingEnded", async (data) => {
    try {
      const { callId, meetingId, platform, duration } = data;

      console.log(
        `🏁 Meeting ended via WebSocket - Call: ${callId}, Meeting: ${meetingId}, Platform: ${platform}`
      );

      // Update call status if we have a call document
      if (globalCallDoc) {
        const Call = (await import("./models/Call.js")).default;

        try {
          await Call.findByIdAndUpdate(globalCallDoc._id, {
            status: "completed",
            endTime: new Date(),
            duration: duration || globalCallDoc.duration,
            completedAt: new Date(),
          });

          console.log(`✅ Call ${globalCallDoc._id} updated on meeting end`);
        } catch (updateError) {
          console.error(
            "Error updating call on WebSocket meeting end:",
            updateError
          );
        }
      }

      // Broadcast meeting ended event to other participants
      socket.to(callId).emit("meetingEnded", {
        callId,
        meetingId,
        platform,
        endTime: new Date(),
        reason: "user_ended",
      });
    } catch (error) {
      console.error("Error handling WebSocket meeting end:", error);
    }
  });

  socket.on("useSuggestion", async (data) => {
    try {
      const { suggestionId, callId, feedback } = data;

      console.log(
        `📝 Suggestion ${suggestionId} marked as used for call ${callId}`
      );

      // Broadcast to all clients that suggestion was used
      io.to(callId).emit("suggestionUsed", { suggestionId, feedback });
    } catch (error) {
      console.error("Error marking suggestion as used:", error);
      socket.emit("suggestionError", {
        error: "Failed to mark suggestion as used",
      });
    }
  });

  socket.on("audioData", async (data) => {
    try {
      const { callId, audioData, format = "base64" } = data;

      if (!callId || !audioData) {
        return socket.emit("transcriptionError", {
          error: "Missing callId or audioData",
        });
      }

      console.log(
        `🎤 Audio data received for call ${callId} - Using Zoom RTMS for transcription`
      );

      // Audio data is handled by Zoom RTMS automatically
      // No additional processing needed as RTMS captures directly from Zoom
    } catch (error) {
      console.error("Error processing audio data:", error);
      socket.emit("transcriptionError", {
        error: "Failed to process audio data",
      });
    }
  });

  socket.on("meetingEvent", async (data) => {
    try {
      const { callId, event, platform, payload } = data;

      console.log(
        `📹 Meeting event: ${event} on ${platform} for call ${callId}`
      );

      // Handle duration updates with user context
      if (event === "duration_update" && payload?.duration) {
        try {
          const Call = (await import("./models/Call.js")).default;

          // Get user ID from socket
          const userId = socket.userId;
          if (!userId) {
            console.log(`⚠️ No user ID found for socket ${socket.id}`);
            return;
          }

          console.log(
            `📝 WebSocket duration update - Call ID: ${callId}, Duration: ${payload.duration}, User: ${userId}`
          );

          // Find call with user verification to prevent unauthorized updates
          let call = null;

          try {
            call = await Call.findOne({ _id: callId, user: userId });
            if (call) {
              console.log(`📝 Found call by ID: ${call._id}`);
            }
          } catch (error) {
            console.log(`📝 Could not find call by ID: ${callId}`);
          }

          if (!call) {
            call = await Call.findOne({ meetingId: callId });
            if (call) {
              console.log(`📝 Found call by meetingId: ${call._id}`);
            }
          }

          if (call) {
            // Use the model method to update duration safely
            await call.updateDuration(payload.duration, "websocket");
            console.log(
              `✅ Duration updated via WebSocket - Call: ${call._id}, Duration: ${payload.duration}s`
            );
          } else {
            console.log(
              `⚠️ No authorized call found for user ${userId} and call ${callId}`
            );
          }
        } catch (error) {
          console.error("Failed to update duration via WebSocket:", error);
        }
      }

      // Broadcast to all participants in the call
      io.to(callId).emit("meetingEvent", { event, platform, payload });
    } catch (error) {
      console.error("Error handling meeting event:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`👤 User disconnected: ${socket.id}`);

    // Clear processed transcripts for this call when user disconnects
    if (socket.callId) {
      const keysToRemove = Array.from(processedTranscripts).filter((key) =>
        key.startsWith(`${socket.callId}-`)
      );
      keysToRemove.forEach((key) => processedTranscripts.delete(key));
      console.log(
        `🧹 Cleared ${keysToRemove.length} processed transcripts for call ${socket.callId}`
      );
    }

    // Clean up RTMS transcription if user was in a Zoom call
    if (socket.callId && socket.platform === "zoom" && socket.meetingId) {
      zoomRTMSService
        .stopRTMSTranscription(socket.meetingId)
        .catch((error) =>
          console.error(
            "Error stopping RTMS transcription on disconnect:",
            error
          )
        );
    }
  });
});

// Add authentication middleware for API routes
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      // Try to get user ID from header as fallback
      const userId = req.headers["x-user-id"];
      if (userId) {
        req.user = { id: userId };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    // Allow development tokens for testing
    if (token.startsWith("dev-token-")) {
      req.user = { id: "dev-user" };
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Apply authentication middleware to analytics routes
app.use("/api/analytics", authenticateUser);

// Handle new transcript: persist to DB, broadcast, analyze and optionally generate suggestions
async function handleNewTranscript(callId, transcriptData, socket) {
  try {
    // Validate required fields
    if (!callId || !transcriptData.text) {
      console.error("❌ Invalid transcript data: missing callId or text");
      return;
    }

    const formattedTranscript = {
      id: transcriptData.id || Date.now().toString(),
      speaker: transcriptData.speaker || "Unknown",
      text: transcriptData.text.trim(),
      confidence:
        typeof transcriptData.confidence === "number"
          ? Math.max(0, Math.min(1, transcriptData.confidence))
          : 0.9,
      timestamp: transcriptData.timestamp
        ? new Date(transcriptData.timestamp)
        : new Date(),
      isFinal: transcriptData.isFinal !== false,
      startTime: transcriptData.startTime,
      endTime: transcriptData.endTime,
      words: transcriptData.words || [],
      raw: transcriptData.raw,
    };

    // Skip empty or very short transcripts
    if (!formattedTranscript.text || formattedTranscript.text.length < 3) {
      console.log(
        "⚠️ Skipping very short transcript:",
        formattedTranscript.text
      );
      return;
    }

    // Persist transcript to DB
    try {
      const Transcript = (await import("./models/Transcript.js")).default;
      const Call = (await import("./models/Call.js")).default;
      const currentTime = new Date();

      // Resolve call document if possible (support meetingId fallback)
      let callDoc = null;
      try {
        if (mongoose.Types.ObjectId.isValid(callId)) {
          callDoc = await Call.findById(callId);
        }
      } catch (e) {
        callDoc = null;
      }

      if (!callDoc) {
        try {
          callDoc = await Call.findOne({ meetingId: callId });
        } catch (e) {
          callDoc = null;
        }
      }

      const actualCallId = callDoc ? callDoc._id : callId;

      const payload = {
        call: actualCallId,
        speaker: formattedTranscript.speaker,
        text: formattedTranscript.text,
        confidence: formattedTranscript.confidence,
        timestamp: formattedTranscript.timestamp,
        isFinal: formattedTranscript.isFinal,
        startTime: formattedTranscript.startTime,
        endTime: formattedTranscript.endTime,
        words: formattedTranscript.words,
        raw: formattedTranscript.raw,
        createdAt: currentTime,
        updatedAt: currentTime,
        language: "en",
        processed: false,
        entities: [],
      };

      const saved = await Transcript.create(payload);
      console.log(`✅ Transcript saved successfully with ID: ${saved._id}`);

      // Update Call metadata if call found
      if (callDoc) {
        callDoc.lastActivity = payload.timestamp;
        callDoc.transcriptCount = (callDoc.transcriptCount || 0) + 1;
        if (!callDoc.status || callDoc.status === "pending")
          callDoc.status = "in_progress";
        await callDoc.save();
        console.log(`✅ Call metadata updated for call: ${callDoc._id}`);
      }

      formattedTranscript._id = saved._id;
    } catch (dbErr) {
      console.error("❌ Error saving transcript to DB:", dbErr);
    }

    // Broadcast transcript to all clients
    io.to(callId).emit("newTranscript", formattedTranscript);
    io.emit("newTranscript", formattedTranscript);

    // Add to transcript analyzer for AI suggestions
    transcriptAnalyzer.addTranscript(transcriptData);

    // Generate AI suggestion
    if (transcriptData.text && globalCallDoc && globalCallId) {
      const transcriptKey = `${callId}-${transcriptData.text}-${transcriptData.timestamp}`;

      if (processedTranscripts.has(transcriptKey)) {
        return;
      }

      processedTranscripts.add(transcriptKey);

      if (processedTranscripts.size > 100) {
        const entries = Array.from(processedTranscripts);
        processedTranscripts.clear();
        entries.slice(-50).forEach((key) => processedTranscripts.add(key));
      }

      try {
        await generateAndSaveAISuggestion(callId, transcriptData.text);
      } catch (error) {
        console.error("❌ Error generating AI suggestion:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error handling new transcript:", error);
    if (socket) {
      socket.emit("transcriptionError", {
        error: "Failed to process transcript",
        details: error.message,
      });
    }
  }
}

// Generate and save AI suggestions properly with quota check
async function generateAndSaveAISuggestion(originalCallId, transcriptText) {
  try {
    console.log(
      `🤖 Generating AI suggestion for transcript: "${transcriptText}"`
    );

    // Use the stored global call document or resolve it
    let callDoc = globalCallDoc;
    let actualCallId = globalCallId;

    if (!callDoc) {
      const Call = (await import("./models/Call.js")).default;

      try {
        if (mongoose.Types.ObjectId.isValid(originalCallId)) {
          callDoc = await Call.findById(originalCallId);
        }
      } catch (e) {
        callDoc = null;
      }

      if (!callDoc) {
        try {
          callDoc = await Call.findOne({ meetingId: originalCallId });
        } catch (e) {
          callDoc = null;
        }
      }

      if (callDoc) {
        actualCallId = callDoc._id;
      }
    }

    if (!callDoc || !actualCallId) {
      console.log(`❌ No call document found - cannot create AI suggestion`);
      return;
    }

    // Get conversation history for context
    const Transcript = (await import("./models/Transcript.js")).default;
    const conversationHistory = await Transcript.find({
      call: actualCallId,
    })
      .sort({ timestamp: 1 })
      .select("speaker text timestamp confidence")
      .lean()
      .limit(50); // Get last 50 transcripts for context

    console.log(
      `📚 Retrieved ${conversationHistory.length} transcripts for context`
    );

    // Check daily quota before generating suggestion
    const AISuggestion = (await import("./models/AISuggestion.js")).default;
    const quotaStatus = await AISuggestion.checkDailyQuotaAvailable(
      callDoc.user
    );

    if (!quotaStatus.hasQuota) {
      console.log(
        `⚠️ Daily quota exceeded for user ${callDoc.user}. Used: ${quotaStatus.used}/${quotaStatus.quota}`
      );

      // Send quota exceeded notification to client
      const quotaNotification = {
        id: Date.now().toString(),
        type: "quota_exceeded",
        text: `Daily AI suggestion limit reached (${quotaStatus.quota}). Upgrade your plan for unlimited suggestions.`,
        confidence: 1.0,
        reasoning: "Daily quota limit reached",
        priority: "high",
        trigger: "quota_check",
        createdAt: new Date(),
        timestamp: new Date(),
        context: "quota_limit",
        model: "system",
        used: false,
        quotaInfo: quotaStatus,
      };

      io.to(originalCallId).emit("quotaExceeded", quotaNotification);
      io.emit("quotaExceeded", quotaNotification);

      return;
    }

    // Generate AI response with full conversation context
    const aiResponse = await generateSalesAISuggestion(
      transcriptText,
      "User",
      conversationHistory
    );

    if (!aiResponse) {
      console.log("⚠️ No AI response generated");
      return;
    }

    console.log(`💡 AI response generated: "${aiResponse.text}"`);

    const currentTime = new Date();
    const suggestionPayload = {
      call: actualCallId,
      user: callDoc.user,
      type: aiResponse.type || "follow_up",
      text: aiResponse.text,
      confidence: aiResponse.confidence || 0.8,
      reasoning:
        aiResponse.reasoning ||
        `AI response to: "${transcriptText.substring(0, 50)}..."`,
      priority: aiResponse.priority || "medium",
      context: transcriptText.substring(0, 2000),
      triggerContext: {
        lastTranscripts: [transcriptText],
        conversationLength: conversationHistory.length,
      },
      trigger: "transcript_received",
      createdAt: currentTime,
      updatedAt: currentTime,
      used: false,
      metadata: {
        modelVersion: "gpt-4o-mini",
        processingTime: null,
        documentSources: [],
        relatedSuggestions: [],
        quotaUsedAt: currentTime,
        contextTranscripts: conversationHistory.length,
      },
    };

    const saved = await AISuggestion.create(suggestionPayload);
    console.log(`✅ AI suggestion saved successfully: ${saved._id}`);

    // Update call suggestion count
    if (callDoc) {
      callDoc.suggestionCount = (callDoc.suggestionCount || 0) + 1;
      await callDoc.save();
    }

    // Get updated quota status
    const updatedQuotaStatus = await AISuggestion.checkDailyQuotaAvailable(
      callDoc.user
    );

    // Create broadcast object
    const broadcastSuggestion = {
      _id: saved._id,
      id: String(saved._id),
      type: saved.type,
      text: saved.text,
      confidence: saved.confidence,
      reasoning: saved.reasoning,
      priority: saved.priority,
      trigger: saved.trigger,
      context: saved.context,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      used: saved.used,
      model: saved.metadata?.modelVersion || "gpt-4o-mini",
      timestamp: saved.timestamp ? new Date(saved.timestamp) : new Date(),
      quotaInfo: updatedQuotaStatus,
    };

    // Broadcast to clients
    io.to(originalCallId).emit("newSuggestion", broadcastSuggestion);
    io.emit("newSuggestion", broadcastSuggestion);

    // Send quota update if approaching limit
    if (
      updatedQuotaStatus.usagePercentage >= 80 &&
      updatedQuotaStatus.usagePercentage < 100
    ) {
      const quotaWarning = {
        type: "quota_warning",
        message: `AI quota usage: ${Math.round(
          updatedQuotaStatus.usagePercentage
        )}% (${updatedQuotaStatus.used}/${updatedQuotaStatus.quota})`,
        quotaInfo: updatedQuotaStatus,
      };
      io.to(originalCallId).emit("quotaUpdate", quotaWarning);
    }

    console.log(
      `✅ AI suggestion process completed successfully. Quota: ${updatedQuotaStatus.used}/${updatedQuotaStatus.quota}`
    );
  } catch (error) {
    console.error(`❌ Error in generateAndSaveAISuggestion:`, error);

    // Create fallback ephemeral suggestion (doesn't count against quota)
    const fallbackSuggestion = {
      id: Date.now().toString(),
      type: "follow_up",
      text: "I'm here to help with your sales conversation. Please continue.",
      confidence: 0.5,
      reasoning: "Fallback suggestion due to save error",
      priority: "low",
      trigger: "transcript_received",
      createdAt: new Date(),
      timestamp: new Date(),
      context: transcriptText.substring(0, 100) + "...",
      model: "gpt-4o-mini",
      used: false,
      isEphemeral: true,
    };

    io.to(originalCallId).emit("newSuggestion", fallbackSuggestion);
    io.emit("newSuggestion", fallbackSuggestion);
  }
}
// Generate sales-focused AI suggestions
// Generate sales-focused AI suggestions with full conversation context
async function generateSalesAISuggestion(
  transcriptText,
  speaker,
  conversationHistory = []
) {
  try {
    // Build conversation context from history
    const contextText = conversationHistory
      .map((t) => `${t.speaker}: ${t.text}`)
      .join("\n");

    // Analyze conversation for phase and sentiment
    const recentText = conversationHistory
      .slice(-5)
      .map((t) => t.text)
      .join(" ")
      .toLowerCase();

    let conversationPhase = "discovery";
    if (recentText.includes("hello") || recentText.includes("introduction")) {
      conversationPhase = "opening";
    } else if (
      recentText.includes("price") ||
      recentText.includes("cost") ||
      recentText.includes("budget")
    ) {
      conversationPhase = "pricing";
    } else if (
      recentText.includes("concern") ||
      recentText.includes("but") ||
      recentText.includes("however")
    ) {
      conversationPhase = "objection_handling";
    } else if (
      recentText.includes("sign") ||
      recentText.includes("contract") ||
      recentText.includes("agreement")
    ) {
      conversationPhase = "closing";
    } else if (
      recentText.includes("feature") ||
      recentText.includes("benefit") ||
      recentText.includes("how does")
    ) {
      conversationPhase = "presentation";
    }

    const prompt = `You are an expert AI sales assistant providing real-time suggestions during a live sales call.

CONVERSATION HISTORY:
${contextText}

LATEST MESSAGE: "${transcriptText}"

CONVERSATION PHASE: ${conversationPhase}

Based on the full conversation context, provide a helpful, specific, and actionable suggestion (max 100 words).

Consider:
- What has been discussed so far
- The current conversation phase
- Any objections or concerns raised
- Opportunities to move the sale forward
- Appropriate follow-up questions
- Timing for closing techniques

Respond with a brief(2 to 3 lines), contextual suggestion that builds on the conversation history:`;

    const response = await aiService.generateCompletion(prompt, {
      model: "gpt-4o-mini",
      maxTokens: 500,
      temperature: 0.7,
    });

    if (response && response.content) {
      // Determine suggestion type based on content and conversation phase
      const content = response.content.toLowerCase();
      let type = "follow_up";
      let priority = "medium";

      // Advanced type detection based on content and phase
      if (
        conversationPhase === "objection_handling" ||
        content.includes("objection") ||
        content.includes("concern")
      ) {
        type = "objection_handling";
        priority = "high";
      } else if (
        conversationPhase === "closing" ||
        content.includes("close") ||
        content.includes("sign") ||
        content.includes("contract")
      ) {
        type = "closing";
        priority = "high";
      } else if (
        conversationPhase === "pricing" ||
        content.includes("price") ||
        content.includes("cost") ||
        content.includes("budget")
      ) {
        type = "pricing";
        priority = "high";
      } else if (content.includes("question") || content.includes("ask")) {
        type = "question";
        priority = "medium";
      } else if (
        content.includes("feature") ||
        content.includes("benefit") ||
        content.includes("advantage")
      ) {
        type = "feature_highlight";
        priority = "medium";
      } else if (conversationPhase === "opening") {
        type = "rapport_building";
        priority = "medium";
      }

      return {
        type: type,
        text: response.content.trim(),
        reasoning: `Context-aware suggestion based on ${conversationHistory.length} previous messages in ${conversationPhase} phase`,
        priority: priority,
        confidence: Math.min(0.9, 0.6 + conversationHistory.length * 0.01), // Higher confidence with more context
      };
    }

    return null;
  } catch (error) {
    console.error("Error generating context-aware AI suggestion:", error);
    return {
      type: "follow_up",
      text: "I'm analyzing the conversation to provide better suggestions. Please continue.",
      reasoning: "Fallback suggestion - context analysis failed",
      priority: "low",
      confidence: 0.5,
    };
  }
}

// 404 handler for API routes (must be last)
app.all("/api/*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`   Attempted path: ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();

    // Create database indexes
    await database.createIndexes();

    // Start server
    server.listen(config.PORT, () => {
      console.log(
        `🚀 AI Sales Call Assistant Server running on port ${config.PORT}`
      );
      console.log(`📡 WebSocket server ready for real-time communication`);
      console.log(
        `🗄️  Database: ${database.connection ? "✅" : "❌"} Connected`
      );
      console.log(
        `🤖 AI Services: ${config.OPENAI_API_KEY ? "✅" : "❌"} OpenAI`
      );
      console.log(`🎤 Transcription: ✅ Zoom RTMS Only`);
      console.log(
        `📹 Zoom SDK: ${config.ZOOM_SDK_KEY ? "✅" : "❌"} Configured`
      );
      console.log(
        `📱 Google Meet: ${config.GOOGLE_CLIENT_ID ? "✅" : "❌"} Configured`
      );
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
export default app;
