import "dotenv/config";
import http from "http";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Conditionally import @zoom/rtms (not available on Windows)
let rtms = null;
let rtmsLoadAttempted = false;

async function loadRTMS() {
  if (rtmsLoadAttempted) {
    return rtms;
  }
  rtmsLoadAttempted = true;
  try {
    const rtmsModule = await import("@zoom/rtms");
    rtms = rtmsModule.default || rtmsModule;
    console.log("✅ @zoom/rtms loaded successfully");
  } catch (error) {
    console.warn("⚠️ @zoom/rtms package not available (this is expected on Windows). Zoom RTMS features will be disabled.");
    console.warn("⚠️ Error:", error.message);
    rtms = null;
  }
  return rtms;
}

const PORT = 8080;
const SECRET_TOKEN = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

class ZoomRTMSService {
  constructor() {
    console.log("🚀 ZoomRTMSService constructor started");
    this.transcriptHandlers = [];
    this.meetingEndHandlers = [];
    this.activeTranscriptions = new Map();

    console.log("📋 Initialized empty arrays and maps");
    this.initializeServer();
    // Initialize RTMS asynchronously (don't await to avoid blocking constructor)
    this.initializeRTMS().catch(err => {
      console.error("❌ Error initializing RTMS:", err);
    });
    console.log("✅ ZoomRTMSService constructor completed");
  }

  initializeServer() {
    console.log("🌐 Initializing HTTP server...");
    const server = http.createServer((req, res) => {
      console.log(`📥 Received ${req.method} request to ${req.url}`);

      if (req.method !== "POST") {
        console.log("❌ Method not allowed:", req.method);
        res.statusCode = 405;
        return res.end("Method Not Allowed");
      }

      let body = "";
      req.on("data", (chunk) => {
        console.log("📦 Received data chunk, size:", chunk.length);
        body += chunk;
      });

      req.on("end", () => {
        console.log("📝 Request body complete, size:", body.length);
        try {
          const event = JSON.parse(body);
          console.log("✅ Successfully parsed JSON webhook payload");

          // Process webhook through custom handler
          this.handleWebhookEvent(event, req.headers, res);
        } catch (err) {
          console.error("❌ Error parsing webhook JSON:", err);
          res.statusCode = 400;
          res.end("Bad Request");
        }
      });
    });

    server.listen(PORT, () => {
      console.log(
        `✅ Zoom webhook server listening on http://localhost:${PORT}`
      );
    });
  }

  // Custom webhook handler
  handleWebhookEvent(payload, headers, res) {
    console.log("🔄 handleWebhookEvent started");
    console.log("📡 Custom Webhook received:", payload.event);
    console.log("📋 Full Payload:", JSON.stringify(payload, null, 2));
    console.log("Event timestamp:", payload.event_ts);
    console.log("\n");

    // Handle endpoint validation
    if (payload.event === "endpoint.url_validation") {
      console.log("🔍 Processing endpoint validation");
      const plainToken = payload.payload?.plainToken;

      if (!plainToken) {
        console.log("❌ No plainToken found in validation payload");
        res.statusCode = 400;
        return res.end("Missing plainToken");
      }

      console.log("🔐 Creating encrypted token for validation");
      const encryptedToken = crypto
        .createHmac("sha256", SECRET_TOKEN)
        .update(plainToken)
        .digest("hex");

      const response = {
        plainToken: plainToken,
        encryptedToken: encryptedToken,
      };

      console.log("✅ Endpoint validation successful:", response);
      console.log("📤 Sending validation response");

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
    }

    console.log("🔒 Starting webhook signature validation");
    // Validate webhook signature for other events
    if (!this.validateWebhookSignature(payload, headers)) {
      console.log("❌ Webhook signature validation failed");
      res.statusCode = 401;
      return res.end("Unauthorized");
    }

    console.log("✅ Webhook validation passed");
    console.log("🔄 Calling processRTMSWebhook");

    // Process through custom RTMS handler (not using rtms.onWebhookEvent)
    this.processRTMSWebhook(payload).catch(err => {
      console.error("❌ Error processing RTMS webhook:", err);
    });

    console.log("📤 Sending success response");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Authorized request to Zoom Webhook sample." })
    );
    console.log("✅ handleWebhookEvent completed");
  }

  // Custom RTMS webhook processor (replaces rtms.onWebhookEvent)
  async processRTMSWebhook(webhookPayload) {
    console.log("🔄 processRTMSWebhook started");
    // Ensure RTMS is loaded before processing
    await loadRTMS();

    // Transform webhook payload to RTMS payload format
    let payload;
    if (webhookPayload.event === "meeting.rtms_started") {
      // For start events, extract the RTMS payload
      payload = {
        ...webhookPayload.payload,
        event: webhookPayload.event,
        event_ts: webhookPayload.event_ts,
      };
    } else if (webhookPayload.event === "meeting.rtms_stopped") {
      // For stop events, use the nested payload structure
      payload = {
        ...webhookPayload.payload,
        event: webhookPayload.event,
        event_ts: webhookPayload.event_ts,
      };
    } else {
      console.log("ℹ️ Unknown webhook event type:", webhookPayload.event);
      return;
    }

    console.log(
      "📡 Processing RTMS payload:",
      JSON.stringify(payload, null, 2)
    );

    // Check if this is a stop event
    if (payload.stop_reason) {
      console.log("🛑 RTMS stopping...");
      console.log("🛑 Stop reason:", payload.stop_reason);
      console.log("\n");

      // Get meeting info before cleanup using meeting_uuid
      const meetingId = payload.object?.id || payload.object?.uuid;

      console.log("📢 Notifying meeting end handlers");
      // Emit meeting end event to all registered handlers
      this.meetingEndHandlers.forEach((handler, index) => {
        console.log(`📢 Calling meeting end handler ${index + 1}`);
        try {
          handler({
            meetingId,
            endTime: new Date(),
            reason: "meeting_ended",
            payload: payload,
          });
          console.log(`✅ Meeting end handler ${index + 1} completed`);
        } catch (error) {
          console.error(`❌ Error in meeting end handler ${index + 1}:`, error);
        }
      });

      console.log("🔗 Calling rtms.leave()");
      if (rtms) {
        try {
          rtms.leave();
          console.log("🛑 RTMS stopped and cleared - ready for next session");
        } catch (leaveError) {
          console.error("❌ Error leaving RTMS:", leaveError);
        }
      } else {
        console.warn("⚠️ RTMS not available, skipping leave()");
      }
      console.log("\n");

      // Clean up active transcriptions
      if (meetingId) {
        console.log("🧹 Cleaning up transcription data");
        this.activeTranscriptions.delete(meetingId);
        console.log("🧹 Cleaned up transcription for meeting:", meetingId);
      }
      return;
    }

    // For start events, set up transcript handler and join
    if (payload.event === "meeting.rtms_started") {
      console.log("🚀 Processing RTMS start event");

      if (!rtms) {
        console.warn("⚠️ RTMS not available, cannot process start event");
        return;
      }

      // Set up transcript data handler for this session
      rtms.onTranscriptData((data, size, timestamps, metadata) => {
        console.log("📝 onTranscriptData callback triggered");
        try {
          // Validate input data
          if (!data || (Buffer.isBuffer(data) && data.length === 0)) {
            console.log("⚠️ Empty transcript data received, skipping");
            return;
          }

          const textData = Buffer.isBuffer(data)
            ? data.toString("utf8")
            : String(data);

          // Skip empty or whitespace-only text
          if (!textData || textData.trim().length === 0) {
            console.log("⚠️ Empty text content, skipping");
            return;
          }

          // Validate metadata
          if (!metadata) {
            console.log("⚠️ No metadata provided with transcript");
          }

          console.log(`👤 ${metadata?.userName || "Unknown"} : ${textData}`);

          const transcriptData = {
            id: uuidv4(),
            text: textData.trim(),
            speaker: metadata?.userName || "Unknown Speaker",
            timestamp: new Date(),
            meetingId: payload.meeting_uuid,
            confidence: 0.9, // Default confidence for RTMS
            isFinal: true, // RTMS typically provides final transcripts
            metadata: metadata || {},
          };

          // Validate transcript data before processing
          if (!transcriptData.text || transcriptData.text.length < 2) {
            console.log(
              "⚠️ Transcript too short, skipping:",
              transcriptData.text
            );
            return;
          }

          console.log(
            "📢 Notifying transcript handlers, count:",
            this.transcriptHandlers.length
          );
          // Send to all registered handlers
          this.transcriptHandlers.forEach((handler, index) => {
            console.log(`📢 Calling transcript handler ${index + 1}`);
            try {
              handler(transcriptData);
              console.log(`✅ Transcript handler ${index + 1} completed`);
            } catch (error) {
              console.error(
                `❌ Error in transcript handler ${index + 1}:`,
                error
              );
              console.error("❌ Handler error details:", {
                message: error.message,
                stack: error.stack,
              });
            }
          });
        } catch (error) {
          console.error("❌ Error processing transcript data:", error);
          console.error("❌ Raw data:", { data, size, timestamps, metadata });
        }
      });

      console.log("🔗 Calling rtms.join()");
      if (rtms) {
        try {
          const joinResult = rtms.join(payload);
          console.log("📊 RTMS join result:", joinResult);

        // Track active transcription
        const meetingId = payload.meeting_uuid;
        if (meetingId) {
          this.activeTranscriptions.set(meetingId, {
            payload,
            startTime: new Date(),
          });
          console.log("✅ RTMS transcription started for meeting:", meetingId);
          console.log(
            "📊 Active transcriptions:",
            Array.from(this.activeTranscriptions.keys())
          );
        } else {
          console.log("⚠️ No meeting ID found in payload");
        }
      } catch (joinError) {
        console.error("❌ Error joining RTMS session:", joinError);
      }
    } else {
      console.warn("⚠️ RTMS not available, skipping join()");
    }
    }

    console.log("✅ processRTMSWebhook completed");
  }

  // Validate webhook signature
  validateWebhookSignature(payload, headers) {
    console.log("🔒 validateWebhookSignature started");
    try {
      if (!headers["x-zm-request-timestamp"] || !headers["x-zm-signature"]) {
        console.log("⚠️ Missing required headers for validation");
        console.log("Headers present:", Object.keys(headers));
        return false;
      }

      console.log("🔐 Creating signature hash");
      const message = `v0:${headers["x-zm-request-timestamp"]}:${JSON.stringify(
        payload
      )}`;

      const hashForVerify = crypto
        .createHmac("sha256", SECRET_TOKEN)
        .update(message)
        .digest("hex");

      const signature = `v0=${hashForVerify}`;

      console.log("🔍 Comparing signatures");
      console.log("Expected:", signature);
      console.log("Received:", headers["x-zm-signature"]);

      const isValid = headers["x-zm-signature"] === signature;
      console.log("✅ Signature validation result:", isValid);
      return isValid;
    } catch (error) {
      console.error("❌ Error validating webhook signature:", error);
      return false;
    }
  }

  async initializeRTMS() {
    console.log("🔄 Attempting to load @zoom/rtms...");
    await loadRTMS();
    if (rtms) {
      console.log("✅ Zoom RTMS service initialized with custom webhook handling");
    } else {
      console.log("⚠️ Zoom RTMS service initialized without RTMS package (Windows compatibility)");
    }
  }

  onTranscript(handler) {
    console.log("📝 onTranscript called, registering handler");
    if (typeof handler !== "function") {
      console.log("❌ Handler is not a function:", typeof handler);
      return;
    }
    this.transcriptHandlers.push(handler);
    console.log(
      "✅ Transcript handler registered, total count:",
      this.transcriptHandlers.length
    );
  }

  onMeetingEnd(handler) {
    console.log("🛑 onMeetingEnd called, registering handler");
    if (typeof handler !== "function") {
      console.log("❌ Handler is not a function:", typeof handler);
      return;
    }
    this.meetingEndHandlers.push(handler);
    console.log(
      "✅ Meeting end handler registered, total count:",
      this.meetingEndHandlers.length
    );
  }

  async stopRTMSTranscription(meetingId) {
    try {
      if (this.activeTranscriptions.has(meetingId)) {
        this.activeTranscriptions.delete(meetingId);
        console.log(`🛑 Stopped RTMS transcription for meeting: ${meetingId}`);
      }
      return true;
    } catch (error) {
      console.error("❌ Error stopping RTMS transcription:", error);
      return false;
    }
  }

  getActiveTranscriptions() {
    return Array.from(this.activeTranscriptions.keys());
  }

  isTranscribing(meetingId) {
    return this.activeTranscriptions.has(meetingId);
  }
}

export default new ZoomRTMSService();
