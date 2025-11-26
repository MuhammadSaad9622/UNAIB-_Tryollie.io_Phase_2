import express from "express";
import { catchAsync } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
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
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-user-id"
  );
  next();
});

// Get Zoom OAuth authorization URL
router.get(
  "/zoom/oauth/auth-url",
  authenticate,
  catchAsync(async (req, res) => {
    // Validate that client ID and secret are configured
    if (!config.ZOOM_CLIENT_ID || !config.ZOOM_CLIENT_SECRET) {
      return res.status(400).json({
        success: false,
        message: "Zoom OAuth is not configured. Please set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET in your environment variables.",
      });
    }

    // Use the redirect URI that matches Zoom app configuration
    // IMPORTANT: This must match EXACTLY what's configured in your Zoom app settings
    const redirectUri = `${req.protocol}://${req.get("host")}/api/zoom/callback`;
    const state = req.user._id.toString(); // Use user ID as state for security

    console.log("🔗 Generating Zoom OAuth URL:", {
      redirectUri,
      clientId: config.ZOOM_CLIENT_ID?.substring(0, 10) + "...",
      clientIdLength: config.ZOOM_CLIENT_ID?.length,
      state,
      host: req.get("host"),
      protocol: req.protocol,
    });

    // Validate Client ID format (Zoom Client IDs are typically 32 characters)
    if (config.ZOOM_CLIENT_ID && config.ZOOM_CLIENT_ID.length < 20) {
      console.warn("⚠️ Warning: Zoom Client ID seems too short. Typical Client IDs are 32 characters.");
    }

    // Get scopes from config (can be set via ZOOM_OAUTH_SCOPES env variable)
    // Default is empty string, which means no scope parameter is sent
    // This allows Zoom to use the app's default scopes configured in Zoom Marketplace
    // If you want to specify scopes, set ZOOM_OAUTH_SCOPES="meeting:write user:read" in .env
    const scopes = config.ZOOM_OAUTH_SCOPES;
    
    // Build auth URL with or without scope parameter
    let authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${config.ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    // Only add scope parameter if scopes are specified
    if (scopes && scopes.trim() !== "") {
      authUrl += `&scope=${encodeURIComponent(scopes)}`;
    }

    console.log("✅ Zoom OAuth URL generated successfully");
    console.log("📋 Full OAuth URL (first 100 chars):", authUrl.substring(0, 100) + "...");
    console.log("💡 TROUBLESHOOTING: If you get 'Application not found' error:");
    console.log("   1. Verify your Client ID is correct in .env file");
    console.log("   2. Go to Zoom Marketplace → Your App → Check App Credentials");
    console.log("   3. For unpublished apps: Add user email to 'Allowed Users' list");
    console.log("   4. Verify redirect URI in Zoom app matches:", redirectUri);

    res.json({
      success: true,
      data: {
        authUrl,
        redirectUri, // Return redirect URI so frontend can verify it matches
      },
    });
  })
);

// Note: OAuth callback is handled at /api/zoom/callback (see routes/zoom.js)
// This route is kept for backward compatibility but redirects to the correct endpoint

// Get user's Zoom connection status
router.get(
  "/zoom/oauth/status",
  authenticate,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).select("+zoomOAuth");

    res.json({
      success: true,
      data: {
        connected: user.zoomOAuth?.connected || false,
        zoomEmail: user.zoomOAuth?.zoomEmail || null,
        zoomUserId: user.zoomOAuth?.zoomUserId || null,
      },
    });
  })
);

// Diagnostic endpoint to verify Zoom OAuth configuration
router.get(
  "/zoom/oauth/diagnostic",
  authenticate,
  catchAsync(async (req, res) => {
    const redirectUri = `${req.protocol}://${req.get("host")}/api/zoom/callback`;
    const hasClientId = !!config.ZOOM_CLIENT_ID;
    const hasClientSecret = !!config.ZOOM_CLIENT_SECRET;
    const clientIdLength = config.ZOOM_CLIENT_ID?.length || 0;
    
    // Build the auth URL that would be used
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${config.ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=test`;

    res.json({
      success: true,
      data: {
        configuration: {
          hasClientId,
          hasClientSecret,
          clientIdLength,
          clientIdPreview: config.ZOOM_CLIENT_ID ? config.ZOOM_CLIENT_ID.substring(0, 10) + "..." : null,
          redirectUri,
          protocol: req.protocol,
          host: req.get("host"),
        },
        expectedAuthUrl: authUrl.substring(0, 150) + "...",
        troubleshooting: {
          "Application not found": [
            "1. Verify Client ID in .env matches Zoom Marketplace exactly",
            "2. Check that your OAuth app exists in Zoom Marketplace",
            "3. For unpublished apps: Add user email to 'Allowed Users' in app settings",
            "4. Verify redirect URI in Zoom app matches exactly: " + redirectUri,
            "5. Ensure app type is 'OAuth' (not 'Server-to-Server OAuth')",
          ],
          "Redirect URI mismatch": [
            "1. Go to Zoom Marketplace → Your App → App Credentials",
            "2. Add this exact redirect URI: " + redirectUri,
            "3. Save and wait a few minutes for changes to propagate",
          ],
        },
      },
    });
  })
);

// Disconnect Zoom account
router.post(
  "/zoom/oauth/disconnect",
  authenticate,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);

    user.zoomOAuth = {
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      zoomUserId: null,
      zoomEmail: null,
      connected: false,
    };

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Zoom account disconnected successfully",
    });
  })
);

// Refresh Zoom access token
router.post(
  "/zoom/oauth/refresh",
  authenticate,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).select("+zoomOAuth");

    if (!user.zoomOAuth?.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "No refresh token available",
      });
    }

    try {
      const authString = Buffer.from(
        `${config.ZOOM_CLIENT_ID}:${config.ZOOM_CLIENT_SECRET}`
      ).toString("base64");

      const tokenResponse = await axios.post(
        "https://zoom.us/oauth/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: user.zoomOAuth.refreshToken,
        }),
        {
          headers: {
            Authorization: `Basic ${authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      user.zoomOAuth.accessToken = access_token;
      if (refresh_token) {
        user.zoomOAuth.refreshToken = refresh_token;
      }
      user.zoomOAuth.tokenExpiry = new Date(Date.now() + expires_in * 1000);

      await user.save({ validateBeforeSave: false });

      res.json({
        success: true,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      console.error("Failed to refresh token:", error.response?.data || error.message);
      
      // If refresh fails, disconnect the account
      user.zoomOAuth.connected = false;
      await user.save({ validateBeforeSave: false });

      res.status(401).json({
        success: false,
        message: "Token refresh failed. Please reconnect your Zoom account.",
      });
    }
  })
);

export default router;

