import express from "express";
import { catchAsync } from "../middleware/errorHandler.js";
import axios from "axios";
import config from "../config/config.js";
import User from "../models/User.js";

const router = express.Router();

// Apply CORS headers
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

// Handle Zoom OAuth callback - this route should NOT require authentication
router.get(
  "/callback",
  catchAsync(async (req, res) => {
    const { code, state } = req.query;

    // Determine frontend URL based on environment
    // Priority: 1. FRONTEND_URL env var, 2. localhost in dev, 3. first CORS_ORIGIN in prod
    const getFrontendUrl = () => {
      // If FRONTEND_URL is explicitly set, use it
      if (config.FRONTEND_URL) {
        return config.FRONTEND_URL;
      }
      // In development, always use localhost
      if (config.NODE_ENV === "development") {
        return "http://localhost:5173";
      }
      // In production, use the first CORS origin or fallback to localhost
      return config.CORS_ORIGIN?.[0] || "http://localhost:5173";
    };

    const frontendUrl = getFrontendUrl();

    if (!code) {
      return res.redirect(
        `${frontendUrl}/call?error=zoom_oauth_failed`
      );
    }

    try {
      // Validate configuration
      if (!config.ZOOM_CLIENT_ID || !config.ZOOM_CLIENT_SECRET) {
        throw new Error("Zoom OAuth is not configured. Please set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET.");
      }

      // Exchange code for tokens
      const redirectUri = `${req.protocol}://${req.get("host")}/api/zoom/callback`;
      
      console.log("🔄 Exchanging authorization code for tokens:", {
        redirectUri,
        hasCode: !!code,
        hasState: !!state,
      });

      const authString = Buffer.from(
        `${config.ZOOM_CLIENT_ID}:${config.ZOOM_CLIENT_SECRET}`
      ).toString("base64");

      const tokenResponse = await axios.post(
        "https://zoom.us/oauth/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("✅ Successfully obtained access token from Zoom");

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get user info from Zoom
      const userResponse = await axios.get("https://api.zoom.us/v2/users/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const zoomUser = userResponse.data;

      // Find user by state (user ID)
      const user = await User.findById(state);
      if (!user) {
        return res.redirect(
          `${frontendUrl}/call?error=user_not_found`
        );
      }

      // Store tokens and user info
      user.zoomOAuth = {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        zoomUserId: zoomUser.id,
        zoomEmail: zoomUser.email,
        connected: true,
      };

      await user.save({ validateBeforeSave: false });

      console.log("✅ Zoom OAuth connection successful:", {
        userId: user._id,
        zoomEmail: zoomUser.email,
        zoomUserId: zoomUser.id,
      });

      // Redirect back to frontend
      res.redirect(
        `${frontendUrl}/call?zoom_connected=true`
      );
    } catch (error) {
      console.error("Zoom OAuth callback error:", error.response?.data || error.message);
      
      // Provide detailed error information
      let errorMessage = "zoom_oauth_failed";
      let errorDetails = "";
      
      if (error.response?.data) {
        const zoomError = error.response.data;
        console.error("Zoom API Error Details:", JSON.stringify(zoomError, null, 2));
        
        if (zoomError.error === "invalid_client") {
          errorMessage = "zoom_invalid_client";
          errorDetails = "Invalid client ID or secret. Please check your Zoom app credentials.";
        } else if (zoomError.error === "invalid_grant" || zoomError.reason === "Invalid authorization code") {
          errorMessage = "zoom_invalid_code";
          errorDetails = "Authorization code expired or invalid. Please try connecting again.";
        } else if (zoomError.error === "invalid_redirect_uri") {
          errorMessage = "zoom_invalid_redirect";
          errorDetails = `Redirect URI mismatch. Expected: ${redirectUri}. Please update your Zoom app settings.`;
        } else if (zoomError.reason === "Internal Error" && zoomError.error === "unsupported_grant_type") {
          errorMessage = "zoom_wrong_app_type";
          errorDetails = "Your Zoom app is configured as Server-to-Server OAuth, but this requires a regular OAuth app. Please create an OAuth app (not Server-to-Server) in Zoom Marketplace.";
        } else if (error.response?.status === 404 || zoomError.error === "application_not_found") {
          errorMessage = "zoom_app_not_found";
          errorDetails = `Application not found. This usually means: 1) The Client ID (${config.ZOOM_CLIENT_ID?.substring(0, 10)}...) is incorrect, 2) The app doesn't exist or was deleted, 3) For unpublished apps, your email must be added to 'Allowed Users' in Zoom app settings. Please check your Zoom Marketplace app configuration.`;
        } else {
          errorDetails = zoomError.reason || zoomError.error_description || zoomError.error || "Unknown error";
        }
      } else {
        errorDetails = error.message || "Unknown error occurred";
      }
      
      // Redirect with error details
      const errorParams = new URLSearchParams({
        error: errorMessage,
        details: encodeURIComponent(errorDetails),
      });
      
      res.redirect(
        `${frontendUrl}/call?${errorParams.toString()}`
      );
    }
  })
);

export default router;

