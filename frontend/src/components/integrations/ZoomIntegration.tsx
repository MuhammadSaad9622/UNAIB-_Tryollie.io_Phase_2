import React, { useEffect, useState, useCallback, useRef } from "react";
import { Route, useNavigate } from "react-router-dom";
import {
  Video,
  Settings,
  Users,
  Mic,
  MicOff,
  Share,
  Clock,
} from "lucide-react";
import { Card } from "../ui/Card";
import { InviteModal } from "../ui/InviteModal";
import { Toast } from "../ui/Toast";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAudioCapture } from "../../hooks/useAudioCapture";
import { APIService } from "../../lib/api";

interface ZoomIntegrationProps {
  callId?: string;
  userId?: string;
  onMeetingStart?: (meetingData: any) => void;
  onMeetingEnd?: () => void;
  onTranscriptUpdate?: (transcript: any) => void;
  onSuggestionUpdate?: (suggestion: any) => void;
  shouldCreateCall?: boolean; // New prop to determine if we should create a call
}

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

export const ZoomIntegration: React.FC<ZoomIntegrationProps> = ({
  callId: propCallId,
  userId,
  onMeetingStart,
  onMeetingEnd,
  onTranscriptUpdate,
  onSuggestionUpdate,
  shouldCreateCall = false,
}) => {
  const navigate = useNavigate();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingNumber, setMeetingNumber] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [activeInputMode, setActiveInputMode] = useState<"id" | "url">("id");
  const [error, setError] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [currentCallId, setCurrentCallId] = useState<string>(propCallId || "");
  const [popupOpened, setPopupOpened] = useState(false); // Track if popup has been opened
  const popupWindowRef = useRef<Window | null>(null); // Ref to track popup window
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to track timeout

  // WebSocket connection for real-time features - use actual database call ID
  const {
    transcript: wsTranscripts,
    suggestions: wsSuggestions,
    isConnected: wsConnected,
    meetingEnded: wsMeetingEnded,
    joinCall,
    leaveCall,
    markSuggestionUsed,
    sendAudioData,
    sendDurationUpdate,
    sendMeetingStart,
    sendMeetingEnd,
    setMeetingEndCallback,
  } = useWebSocket(
    currentCallId || "temp-call-id",
    localStorage.getItem("userId") || userId
  );

  // Audio capture for transcription
  const handleAudioData = useCallback(
    (audioData: string) => {
      if (wsConnected) {
        sendAudioData(audioData);
      }
    },
    [wsConnected, sendAudioData]
  );

  const {
    isRecording: isAudioRecording,
    isSupported: isAudioSupported,
    error: audioError,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
  } = useAudioCapture(handleAudioData);

  useEffect(() => {
    // Load Zoom Web SDK
    const loadZoomSDK = () => {
      if (window.ZoomMtg) {
        setIsSDKLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://source.zoom.us/2.18.0/lib/vendor/react.min.js";
      script.onload = () => {
        const zoomScript = document.createElement("script");
        zoomScript.src =
          "https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js";
        zoomScript.onload = () => {
          const mainScript = document.createElement("script");
          mainScript.src =
            "https://source.zoom.us/2.18.0/lib/vendor/redux.min.js";
          mainScript.onload = () => {
            const sdkScript = document.createElement("script");
            sdkScript.src =
              "https://source.zoom.us/2.18.0/lib/vendor/lodash.min.js";
            sdkScript.onload = () => {
              const finalScript = document.createElement("script");
              finalScript.src =
                "https://source.zoom.us/zoom-meeting-2.18.0.min.js";
              finalScript.onload = () => {
                setIsSDKLoaded(true);
                console.log("✅ Zoom SDK loaded successfully");
              };
              finalScript.onerror = () => {
                setError("Failed to load Zoom SDK");
                console.error("❌ Failed to load Zoom SDK");
              };
              document.head.appendChild(finalScript);
            };
            document.head.appendChild(sdkScript);
          };
          document.head.appendChild(mainScript);
        };
        document.head.appendChild(zoomScript);
      };
      document.head.appendChild(script);
    };

    loadZoomSDK();
  }, []);

  // Connect to WebSocket when meeting starts - use actual database call ID
  useEffect(() => {
    if (meetingData && wsConnected) {
      const userId = localStorage.getItem("userId") || "anonymous";
      const actualCallId =
        localStorage.getItem("currentDatabaseCallId") || propCallId;
      console.log(
        `🔌 Connecting to WebSocket with actual database call ID: ${actualCallId}`
      );
      joinCall(actualCallId, userId, "zoom");
      console.log("✅ Connected to WebSocket for real-time features");
    }
  }, [meetingData, wsConnected, propCallId, joinCall]);

  // Update local state with WebSocket data
  useEffect(() => {
    if (wsTranscripts.length > 0) {
      setTranscripts(wsTranscripts);
      // Call the callback for parent components
      wsTranscripts.forEach((transcript) => {
        if (onTranscriptUpdate) {
          onTranscriptUpdate(transcript);
        }
      });
    }
  }, [wsTranscripts, onTranscriptUpdate]);

  useEffect(() => {
    if (wsSuggestions.length > 0) {
      setAiSuggestions(wsSuggestions);
      // Call the callback for parent components
      wsSuggestions.forEach((suggestion) => {
        if (onSuggestionUpdate) {
          onSuggestionUpdate(suggestion);
        }
      });
    }
  }, [wsSuggestions, onSuggestionUpdate]);

  const createCallAndMeeting = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, create a new call session
      console.log("🔄 Creating new call session...");

      const callResponse = await APIService.createCall({
        title: `Tryollie Call - ${new Date().toLocaleString()}`,
        description:
          "Tryollie call with real-time transcription and suggestions",
        platform: "zoom",
        startTime: new Date().toISOString(),
      });

      if (!callResponse.success) {
        throw new Error(
          callResponse.message || "Failed to create call session"
        );
      }

      const activeCallId = callResponse.data._id;
      setCurrentCallId(activeCallId);

      // Store in localStorage and cookie
      localStorage.setItem("currentDatabaseCallId", activeCallId);
      document.cookie = `xczhfba=${activeCallId}; path=/; max-age=3600`;

      console.log("✅ Call session created:", activeCallId);

      // Now create the Zoom meeting
      const meetingData = {
        topic: `Tryollie Call - ${activeCallId}`,
        startTime: new Date().toISOString(),
        duration: 60,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await APIService.createZoomMeeting(meetingData);

      if (response.success) {
        setMeetingData(response.data.meeting);

        // Update the call with meeting details
        localStorage.setItem("currentDatabaseCallId", activeCallId);
        localStorage.setItem(
          "currentMeetingId",
          response.data.meeting.meetingId
        );

        try {
          await APIService.updateCall(activeCallId, {
            meetingId: response.data.meeting.meetingId,
            platform: "zoom",
            status: "scheduled",
          });
          console.log("✅ Updated call with meeting details");
        } catch (updateError) {
          console.error("Failed to update call:", updateError);
          setError(
            "Failed to update call with meeting details. Please try again."
          );
          return;
        }

        // Redirect to the call page with the new call ID
        navigate(`/call/${activeCallId}`, { replace: true });

        if (onMeetingStart) {
          onMeetingStart(response.data.meeting);
        }

        setToast({
          message: "Call and meeting created successfully! Redirecting...",
          type: "success",
          isVisible: true,
        });
      } else {
        setError(response.message || "Failed to create meeting");
      }
    } catch (error: any) {
      console.error("Failed to create call and meeting:", error);
      console.error("Error response:", error?.response);
      console.error("Error response data:", error?.response?.data);
      
      // Extract error message from various possible locations
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to create call session. Please try again.";
      
      console.error("Displaying error message:", errorMessage);
      setError(errorMessage);
      
      // Also show toast notification
      setToast({
        message: errorMessage,
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async () => {
    // Always create both call and meeting when no callId exists
    if (!currentCallId) {
      await createCallAndMeeting();
    } else {
      // If we already have a call ID, just create the meeting
      try {
        setIsLoading(true);
        setError(null);

        const meetingData = {
          topic: `Tryollie Call - ${currentCallId}`,
          startTime: new Date().toISOString(),
          duration: 60,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const response = await APIService.createZoomMeeting(meetingData);

        if (response.success) {
          setMeetingData(response.data.meeting);

          localStorage.setItem("currentDatabaseCallId", currentCallId);
          localStorage.setItem(
            "currentMeetingId",
            response.data.meeting.meetingId
          );

          try {
            await APIService.updateCall(currentCallId, {
              meetingId: response.data.meeting.meetingId,
              platform: "zoom",
              status: "scheduled",
            });
            console.log("✅ Updated existing call with meeting details");
          } catch (updateError) {
            console.error("Failed to update existing call:", updateError);
            setError(
              "Failed to update call with meeting details. Please try again."
            );
            return;
          }

          if (onMeetingStart) {
            onMeetingStart(response.data.meeting);
          }
        } else {
          setError(response.message || "Failed to create meeting");
        }
      } catch (error: any) {
        console.error("Failed to create Zoom meeting:", error);
        console.error("Error response:", error?.response);
        console.error("Error response data:", error?.response?.data);
        
        // Extract error message from various possible locations
        const errorMessage = error?.response?.data?.error || 
                            error?.response?.data?.message || 
                            error?.message || 
                            "Failed to create meeting. Please try again.";
        
        console.error("Displaying error message:", errorMessage);
        setError(errorMessage);
        
        // Also show toast notification
        setToast({
          message: errorMessage,
          type: "error",
          isVisible: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update existing call initialization effect
  useEffect(() => {
    if (propCallId) {
      setCurrentCallId(propCallId);
      localStorage.setItem("currentDatabaseCallId", propCallId);
    }
  }, [propCallId]);

  // Load existing meeting data if call ID is available
  useEffect(() => {
    const loadMeetingData = async () => {
      if (currentCallId && !shouldCreateCall) {
        try {
          setIsLoading(true);
          setError(null);

          // Fetch the call details
          const callResponse = await APIService.getCallById(currentCallId);

          if (callResponse.success) {
            const callData = callResponse.data;

            // Check if meeting ID exists and is valid
            if (callData.meetingId && /^\d{9,11}$/.test(callData.meetingId)) {
              // Fetch the meeting details from Zoom
              const meetingResponse = await APIService.getZoomMeetingById(
                callData.meetingId
              );

              if (meetingResponse.success) {
                setMeetingData(meetingResponse.data);
                console.log("✅ Meeting data loaded:", meetingResponse.data);
              } else {
                console.error(
                  "Failed to fetch meeting details:",
                  meetingResponse
                );
                // Don't show error for failed meeting fetch - user can create new meeting
                console.warn(
                  "⚠️ Could not load meeting details, user can create new meeting"
                );
              }
            } else {
              // Don't show error for missing meeting ID - this is normal for new calls
              console.log(
                "ℹ️ No meeting ID found, user can create new meeting"
              );
            }
          } else {
            console.error("Failed to load call details:", callResponse);
            // Only show error if the call itself doesn't exist and we expected it to
            if (callResponse.status === 404) {
              console.warn("⚠️ Call not found, user can create new meeting");
            } else {
              setError("Failed to load call details. Please try again.");
            }
          }
        } catch (error) {
          console.error("Error loading meeting data:", error);
          // Don't show error for network issues - let user proceed with creating new meeting
          console.warn(
            "⚠️ Network error loading meeting data, user can create new meeting"
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMeetingData();
  }, [currentCallId, shouldCreateCall]);

  // Audio recording effect
  useEffect(() => {
    if (isMeetingActive && isAudioRecording) {
      startAudioRecording();
    } else {
      stopAudioRecording();
    }
  }, [
    isMeetingActive,
    isAudioRecording,
    startAudioRecording,
    stopAudioRecording,
  ]);

  // Join meeting as host with camera/microphone enabled
  const joinMeetingAsHost = async (meetingNumber: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Joining meeting as host:", meetingNumber);

      // Get the host URL from the meeting data
      const hostUrl = meetingData?.startUrl;
      console.log("Meeting Data");
      console.log(meetingData);
      console.log("Host URL");
      console.log(hostUrl);

      if (!hostUrl) {
        setError("Host URL not available. Please create a new meeting.");
        return;
      }

      console.log("Using host URL:", hostUrl);

      // STEP 1: Open Zoom meeting first
      // Reset popup flag for new meeting
      setPopupOpened(false);

      const zoomWindow = window.open(hostUrl, "_blank", "noopener,noreferrer");
      
      // Update UI to show meeting is starting
      setIsMeetingActive(true);

      // Start AI monitoring
      if (onMeetingStart) {
        onMeetingStart({
          meetingId: meetingNumber,
          platform: "zoom",
          callId: propCallId || currentCallId,
          isHost: true,
        });
      }

      setToast({
        message: "Opening Zoom meeting... AI Assistant will appear shortly.",
        type: "info",
        isVisible: true,
      });

      // STEP 2: Wait for Zoom meeting to fully start, then open popup automatically
      // Clear any existing timeout to prevent multiple popups
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }

      // Use a delay to ensure meeting has actually started and user has joined
      popupTimeoutRef.current = setTimeout(() => {
        // Check if popup was already opened (prevent duplicates)
        if (popupOpened || (popupWindowRef.current && !popupWindowRef.current.closed)) {
          console.log("⚠️ Popup already opened, skipping duplicate open");
          return;
        }

        const popupUrl = `/popup/${propCallId || currentCallId}`;
        const popupWidth = Math.floor(screen.width * 0.4); // 40% of screen width
        const popupLeft = Math.floor(screen.width * 0.6); // Start at 60% from left
        
        // Open popup after meeting has started
        // Using same window name "ai-assistant" - browser will reuse existing window if open
        const popupWindow = window.open(
          popupUrl,
          "ai-assistant", // Same window name prevents multiple popups
          `width=${popupWidth},height=${screen.height},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no,left=${popupLeft},top=0`
        );

        // Store popup window reference
        popupWindowRef.current = popupWindow;

        // Check if popup was blocked
        if (
          !popupWindow ||
          popupWindow.closed ||
          typeof popupWindow.closed == "undefined"
        ) {
          popupWindowRef.current = null;
          setError(
            "Popup blocked! Please enable popups for this site in your browser settings."
          );
          setToast({
            message:
              "Popup blocked! Please allow popups to see AI suggestions.",
            type: "warning",
            isVisible: true,
          });
        } else {
          // Mark popup as opened to prevent duplicates
          setPopupOpened(true);
          setToast({
            message: "AI Assistant opened! Connecting to your meeting...",
            type: "success",
            isVisible: true,
          });
          console.log("✅ AI popup opened successfully after meeting started");
        }
      }, 5000); // 5 second delay - ensures Zoom has fully loaded and user has joined the meeting

      console.log("✅ Zoom meeting opening - AI Assistant will appear automatically once meeting starts");
    } catch (error) {
      console.error("Failed to start meeting as host:", error);
      setError("Failed to start meeting as host. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send meeting invites via email
  const sendMeetingInvite = async (emails: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // Send meeting invite via API
      const response = await APIService.sendMeetingInvite({
        meetingId: meetingData.meetingId,
        meetingTopic: meetingData.topic,
        joinUrl: meetingData.joinUrl,
        password: meetingData.password,
        startTime: meetingData.startTime,
        emails: emails,
      });

      if (response.success) {
        setToast({
          message: `Meeting invites sent to ${emails.length} participants!`,
          type: "success",
          isVisible: true,
        });
        setIsInviteModalOpen(false);
      } else {
        setToast({
          message: "Failed to send meeting invites",
          type: "error",
          isVisible: true,
        });
      }
    } catch (error) {
      console.error("Failed to send meeting invites:", error);
      setError("Failed to send meeting invites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinExistingMeeting = () => {
    if (!meetingNumber.trim()) {
      setError("Please enter a meeting ID");
      return;
    }
    joinMeeting(meetingNumber);
  };

  // NEW: Function to parse Zoom meeting URL
  const parseZoomUrl = (
    url: string
  ): { meetingId: string; password?: string } | null => {
    try {
      // Clean up the URL
      const cleanUrl = url.trim();

      // Match different Zoom URL formats
      const patterns = [
        /zoom\.us\/j\/(\d+)(?:\?pwd=([^&]+))?/,
        // https://zoom.us/j/5085847232?pwd=password
        /zoom\.us\/j\/(\d+)(?:\?pwd=([^&]+))?/,
        // zoom.us/j/5085847232
        /zoom\.us\/j\/(\d+)/,
        // Just the meeting ID with optional password parameter
        /(\d{9,11})(?:\?pwd=([^&]+))?/,
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          const meetingId = match[1];
          const password = match[2] ? decodeURIComponent(match[2]) : undefined;

          // Validate meeting ID (should be 9-11 digits)
          if (meetingId && /^\d{9,11}$/.test(meetingId)) {
            return { meetingId, password };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error parsing Zoom URL:", error);
      return null;
    }
  };

  // NEW: Handle URL-based meeting join
  const handleJoinFromUrl = async () => {
    if (!meetingUrl.trim()) {
      setError("Please enter a meeting URL");
      return;
    }

    const parsed = parseZoomUrl(meetingUrl);
    if (!parsed) {
      setError("Invalid Zoom meeting URL. Please check the format.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Parsed meeting details:", parsed);
      console.log("Generating ZAK token for meeting:", parsed.meetingId);

      // Generate ZAK token for authenticated user join
      const zakResponse = await APIService.generateZoomZAK(parsed.meetingId);

      if (!zakResponse.success) {
        console.error("ZAK token generation failed:", zakResponse);
        throw new Error("Failed to generate ZAK token");
      }

      const zakToken = zakResponse.data.zak;
      const user = zakResponse.data.user;
      console.log("ZAK token generated successfully for user:", user.email);

      // Use existing call ID - DON'T create new call
      localStorage.setItem(
        "currentDatabaseCallId",
        propCallId || currentCallId
      );
      localStorage.setItem("currentMeetingId", parsed.meetingId);
      console.log(
        "✅ Using existing call ID for URL join:",
        propCallId || currentCallId
      );

      // Update existing call with meeting details
      try {
        await APIService.updateCall(propCallId || currentCallId, {
          meetingId: parsed.meetingId,
          platform: "zoom",
          status: "scheduled",
        });
        console.log("✅ Updated existing call with meeting ID from URL");
      } catch (updateError) {
        console.error("Failed to update existing call:", updateError);
        setError("Failed to update call session. Please try again.");
        return;
      }

      // FIRST: Check popup blocker by trying to open the AI popup
      const popupUrl = `/popup/${propCallId || currentCallId}`;
      const popupWindow = window.open(
        popupUrl,
        "ai-assistant",
        `width=${Math.floor(screen.width / 2)},height=${
          screen.height
        },scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no,left=${Math.floor(
          screen.width / 2
        )},top=0`
      );

      // Check if popup was blocked BEFORE doing anything else
      if (
        !popupWindow ||
        popupWindow.closed ||
        typeof popupWindow.closed == "undefined"
      ) {
        setError(
          "Popup blocked! Please enable popups for this site in your browser settings and try again."
        );
        setToast({
          message:
            "Popup blocked! Please allow popups from your browser settings.",
          type: "error",
          isVisible: true,
        });
        return; // Exit immediately - no other operations
      }

      // Only proceed if popup opened successfully
      // Append ZAK token to the original URL
      const originalUrl = meetingUrl.trim();
      const separator = originalUrl.includes("?") ? "&" : "?";
      const zoomJoinUrl = `${originalUrl}${separator}zak=${encodeURIComponent(
        zakToken
      )}`;

      console.log("Opening Zoom meeting with ZAK token appended:", zoomJoinUrl);

      // Start the meeting timer AFTER popup check passes
      await startMeetingTimer();

      // Open the Zoom meeting with ZAK token
      window.open(zoomJoinUrl, "_blank", "noopener,noreferrer");

      // Update UI to show meeting is active
      setIsMeetingActive(true);

      // Start AI monitoring
      if (onMeetingStart) {
        onMeetingStart({
          meetingId: parsed.meetingId,
          platform: "zoom",
          callId: propCallId || currentCallId,
          user: user,
        });
      }

      setToast({
        message: `Meeting and AI Assistant launched in separate windows!`,
        type: "success",
        isVisible: true,
      });

      console.log("✅ Meeting joined successfully with URL + ZAK token");
    } catch (error) {
      console.error("Failed to join meeting from URL:", error);
      setError("Failed to join meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Also update the regular joinMeeting function to use existing call
  const joinMeeting = async (meetingNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Generating ZAK token for meeting:", meetingNumber);

      // Generate ZAK token for authenticated user join
      const zakResponse = await APIService.generateZoomZAK(meetingNumber);

      if (!zakResponse.success) {
        console.error("ZAK token generation failed:", zakResponse);
        throw new Error("Failed to generate ZAK token");
      }

      const zakToken = zakResponse.data.zak;
      const user = zakResponse.data.user;
      console.log("ZAK token generated successfully for user:", user.email);

      // Use existing call ID - DON'T create new call
      localStorage.setItem(
        "currentDatabaseCallId",
        propCallId || currentCallId
      );
      localStorage.setItem("currentMeetingId", meetingNumber);
      console.log(
        "✅ Using existing call ID for meeting ID join:",
        propCallId || currentCallId
      );

      // Update existing call with meeting details
      try {
        await APIService.updateCall(propCallId || currentCallId, {
          meetingId: meetingNumber,
          platform: "zoom",
          status: "scheduled",
        });
        console.log("✅ Updated existing call with meeting ID");
      } catch (updateError) {
        console.error("Failed to update existing call:", updateError);
        setError("Failed to update call session. Please try again.");
        return;
      }

      // FIRST: Check popup blocker by trying to open the AI popup
      const popupUrl = `/popup/${propCallId || currentCallId}`;
      const popupWindow = window.open(
        popupUrl,
        "ai-assistant",
        `width=${Math.floor(screen.width / 2)},height=${
          screen.height
        },scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no,left=${Math.floor(
          screen.width / 2
        )},top=0`
      );

      // Check if popup was blocked BEFORE starting timer or other operations
      if (
        !popupWindow ||
        popupWindow.closed ||
        typeof popupWindow.closed == "undefined"
      ) {
        setError(
          "Popup blocked! Please enable popups for this site in your browser settings and try again."
        );
        setToast({
          message:
            "Popup blocked! Please allow popups from your browser settings.",
          type: "error",
          isVisible: true,
        });
        return; // Exit immediately - no timer or other operations
      }

      // Only proceed if popup opened successfully
      // Construct Zoom web client JOIN URL with ZAK token (no password needed)
      const zoomJoinUrl = `https://us05web.zoom.us/j/${meetingNumber.trim()}?zak=${encodeURIComponent(
        zakToken
      )}`;

      console.log("Opening Zoom meeting join URL with ZAK token:", zoomJoinUrl);

      // Start the meeting timer AFTER popup check passes
      await startMeetingTimer();

      window.open(zoomJoinUrl, "_blank", "noopener,noreferrer");

      // Update UI to show meeting is active
      setIsMeetingActive(true);

      // Start AI monitoring
      if (onMeetingStart) {
        onMeetingStart({
          meetingId: meetingNumber,
          platform: "zoom",
          callId: propCallId || currentCallId,
          user: user,
        });
      }

      setToast({
        message: `Meeting and AI Assistant launched in separate windows!`,
        type: "success",
        isVisible: true,
      });

      console.log("✅ Meeting joined successfully as authenticated user");
    } catch (error) {
      console.error("Failed to join meeting:", error);
      setError("Failed to join meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Video and Audio Controls
  const toggleVideo = () => {
    if (window.ZoomMtg) {
      if (isVideoOn) {
        window.ZoomMtg.muteVideo();
        setIsVideoOn(false);
      } else {
        window.ZoomMtg.unmuteVideo();
        setIsVideoOn(true);
      }
    }
  };

  const toggleAudio = () => {
    if (window.ZoomMtg) {
      if (isAudioOn) {
        window.ZoomMtg.mute();
        setIsAudioOn(false);
      } else {
        window.ZoomMtg.unmute();
        setIsAudioOn(true);
      }
    }
  };

  const toggleScreenShare = () => {
    if (window.ZoomMtg) {
      if (isScreenSharing) {
        window.ZoomMtg.stopShare();
        setIsScreenSharing(false);
      } else {
        window.ZoomMtg.startShare();
        setIsScreenSharing(true);
      }
    }
  };

  // NEW: Meeting duration tracking state
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isTimerActive, setIsTimerActive] = useState(false);

  // NEW: Meeting duration utility functions
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // NEW: Start meeting duration timer using actual database call ID
  const startMeetingTimer = useCallback(async () => {
    const startTime = new Date();
    setMeetingStartTime(startTime);
    setIsTimerActive(true);
    setMeetingDuration(0);

    // Get the ACTUAL database call ID
    const databaseCallId = localStorage.getItem("currentDatabaseCallId");

    if (!databaseCallId) {
      console.error("❌ No database call ID found - cannot start timer");
      return;
    }

    console.log(`📝 Starting timer for DATABASE call ID: ${databaseCallId}`);

    // Store start time in localStorage using database call ID
    localStorage.setItem(
      `meeting_${databaseCallId}_start`,
      startTime.toISOString()
    );
    localStorage.setItem(`meeting_${databaseCallId}_active`, "true");

    // Update existing call status to active
    try {
      await APIService.updateCall(databaseCallId, {
        status: "active",
        startTime: startTime.toISOString(),
      });
      console.log(
        "✅ Call status updated to active for database ID:",
        databaseCallId
      );
    } catch (error) {
      console.warn("⚠️ Failed to update call status:", error.message);
    }

    // Send meeting start via WebSocket using database call ID
    if (wsConnected && sendMeetingStart) {
      try {
        sendMeetingStart(startTime.toISOString());
      } catch (error) {
        console.error("Failed to send meeting start via WebSocket:", error);
      }
    }

    // Start the timer using database call ID
    const interval = setInterval(async () => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setMeetingDuration(duration);

      // Update localStorage every 10 seconds
      if (duration % 10 === 0) {
        localStorage.setItem(
          `meeting_${databaseCallId}_duration`,
          duration.toString()
        );
      }

      // Sync with database every 30 seconds using actual database ID
      if (duration % 30 === 0) {
        try {
          await APIService.updateCall(databaseCallId, {
            duration: duration,
          });
          console.log(
            `✅ Duration synced: ${duration}s for database call: ${databaseCallId}`
          );
        } catch (error) {
          console.warn(
            "⚠️ Failed to sync duration to database:",
            error.message
          );
        }
      }

      // Send duration update via WebSocket every 30 seconds using database call ID
      if (duration % 30 === 0 && wsConnected && sendDurationUpdate) {
        try {
          sendDurationUpdate(duration);
        } catch (error) {
          console.error("Failed to send duration update via WebSocket:", error);
        }
      }
    }, 1000);

    setTimerInterval(interval);
    console.log(
      "✅ Meeting duration timer started for database call:",
      databaseCallId
    );
  }, [wsConnected, sendMeetingStart, sendDurationUpdate]);

  // NEW: Stop meeting duration timer (fixed to use correct call ID)
  const stopMeetingTimer = useCallback(async () => {
    if (!meetingStartTime || !isTimerActive) return;

    const endTime = new Date();
    const finalDuration = Math.floor(
      (endTime.getTime() - meetingStartTime.getTime()) / 1000
    );

    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    setIsTimerActive(false);
    setMeetingDuration(finalDuration);

    // Clean up localStorage
    const databaseCallId = localStorage.getItem("currentDatabaseCallId");
    const callIdToUpdate = databaseCallId || propCallId || currentCallId;

    localStorage.removeItem(`meeting_${callIdToUpdate}_start`);
    localStorage.removeItem(`meeting_${callIdToUpdate}_duration`);
    localStorage.removeItem(`meeting_${callIdToUpdate}_active`);

    console.log(
      `📝 Stopping timer for call: ${callIdToUpdate}, duration: ${finalDuration}s`
    );

    // Update existing call with final duration and completed status
    try {
      await APIService.updateCall(callIdToUpdate, {
        duration: finalDuration,
        endTime: endTime.toISOString(),
        status: "completed",
      });

      console.log(
        `✅ Call completed with duration: ${finalDuration} seconds for call: ${callIdToUpdate}`
      );
    } catch (error) {
      console.warn("⚠️ Failed to update final call duration:", error.message);
    }

    // Send via WebSocket if available
    if (wsConnected && sendMeetingEnd) {
      try {
        sendMeetingEnd(endTime.toISOString(), finalDuration);
      } catch (error) {
        console.error("Failed to send duration via WebSocket:", error);
      }
    }
  }, [
    meetingStartTime,
    timerInterval,
    isTimerActive,
    propCallId,
    currentCallId,
    wsConnected,
    sendMeetingEnd,
  ]);

  // NEW: Recovery mechanism for page refresh
  useEffect(() => {
    const databaseCallId = localStorage.getItem("currentDatabaseCallId");
    if (!databaseCallId) return;

    const storedStart = localStorage.getItem(`meeting_${databaseCallId}_start`);
    const storedActive = localStorage.getItem(
      `meeting_${databaseCallId}_active`
    );

    if (storedStart && storedActive === "true" && !isTimerActive) {
      const startTime = new Date(storedStart);
      const now = new Date();
      const recoveredDuration = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000
      );

      setMeetingStartTime(startTime);
      setMeetingDuration(recoveredDuration);
      setIsTimerActive(true);

      // Resume timer using database call ID
      const interval = setInterval(() => {
        const currentTime = new Date();
        const duration = Math.floor(
          (currentTime.getTime() - startTime.getTime()) / 1000
        );
        setMeetingDuration(duration);

        if (duration % 10 === 0) {
          localStorage.setItem(
            `meeting_${databaseCallId}_duration`,
            duration.toString()
          );
        }

        if (duration % 30 === 0 && wsConnected) {
          try {
            sendDurationUpdate(duration);
          } catch (error) {
            console.error("Failed to sync duration after recovery:", error);
          }
        }
      }, 1000);

      setTimerInterval(interval);
      console.log(
        "✅ Meeting timer recovered for database call:",
        databaseCallId
      );
    }
  }, [isTimerActive, wsConnected, sendDurationUpdate]);

  // NEW: Handle page unload using database call ID
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const databaseCallId = localStorage.getItem("currentDatabaseCallId");
      if (isTimerActive && meetingStartTime && databaseCallId) {
        const finalDuration = Math.floor(
          (new Date().getTime() - meetingStartTime.getTime()) / 1000
        );

        const durationData = {
          callId: databaseCallId, // Use actual database call ID
          duration: finalDuration,
          endTime: new Date().toISOString(),
          platform: "zoom",
          source: "page_unload",
        };

        // Use navigator.sendBeacon for reliable data sending on page unload
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(durationData)], {
            type: "application/json",
          });
          navigator.sendBeacon(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3002"
            }/api/meetings/duration`,
            blob
          );
        }

        // Fallback: try regular fetch with keepalive
        try {
          await fetch(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3002"
            }/api/meetings/duration`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify(durationData),
              keepalive: true,
            }
          );
        } catch (error) {
          console.error("Failed to save duration on page unload:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTimerActive, meetingStartTime]);

  // NEW: Enhanced joinMeetingAsHost with better call tracking
  const joinMeetingAsHostWithTimer = useCallback(
    async (meetingNumber: string, password: string) => {
      try {
        // Get the database call ID that should already exist
        const databaseCallId = localStorage.getItem("currentDatabaseCallId");
        const meetingId = localStorage.getItem("currentMeetingId");

        console.log("📝 Starting meeting with:", {
          databaseCallId,
          meetingId,
          meetingNumber,
        });

        if (!databaseCallId) {
          console.error("❌ No database call ID found");
          setError("Call initialization failed. Please create a new meeting.");
          return;
        }

        // Skip popup test - popup will open automatically after meeting starts
        // This prevents the flickering issue where popup opens and closes

        // Only proceed if popup test passed - now do database updates and timer
        try {
          await APIService.updateCall(databaseCallId, {
            status: "active",
            startTime: new Date().toISOString(),
          });
          console.log("✅ Call status updated to active");
        } catch (error) {
          console.error("Failed to update call status:", error);
          setError("Failed to initialize call session. Please try again.");
          return;
        }

        // Start the timer BEFORE calling joinMeetingAsHost
        await startMeetingTimer();

        // Call existing function (which will open popup again and Zoom meeting)
        await joinMeetingAsHost(meetingNumber, password);
      } catch (error) {
        console.error("Failed to start meeting:", error);
        // If meeting fails to start, stop the timer
        if (isTimerActive) {
          stopMeetingTimer();
        }
        setError("Failed to start meeting. Please try again.");
      }
    },
    [
      startMeetingTimer,
      joinMeetingAsHost,
      stopMeetingTimer,
      isTimerActive,
      propCallId,
      currentCallId,
    ]
  );

  // Add connection monitoring
  useEffect(() => {
    if (!wsConnected && isMeetingActive) {
      console.warn("⚠️ WebSocket disconnected during active meeting");
      // Optionally try to reconnect or show warning to user
    }
  }, [wsConnected, isMeetingActive]);
  // NEW: Enhanced leaveMeeting with timer integration and state reset (Fixed)
  const leaveMeetingWithTimer = useCallback(async () => {
    const databaseCallId = localStorage.getItem("currentDatabaseCallId");

    // Stop timer and save final duration BEFORE doing anything else
    if (isTimerActive && meetingStartTime && databaseCallId) {
      const endTime = new Date();
      const finalDuration = Math.floor(
        (endTime.getTime() - meetingStartTime.getTime()) / 1000
      );

      // Clear timer immediately
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      setIsTimerActive(false);
      setMeetingDuration(finalDuration);

      console.log(
        `📝 Stopping timer for database call: ${databaseCallId}, duration: ${finalDuration}s`
      );

      // Update existing call with final duration and completed status
      try {
        await APIService.updateCall(databaseCallId, {
          duration: finalDuration,
          endTime: endTime.toISOString(),
          status: "completed",
        });

        setToast({
          message: `Meeting completed - Duration: ${Math.floor(
            finalDuration / 60
          )}m ${finalDuration % 60}s`,
          type: "success",
          isVisible: true,
        });

        console.log(
          `✅ Call completed with duration: ${finalDuration} seconds for database call: ${databaseCallId}`
        );
      } catch (error) {
        console.warn("⚠️ Failed to update final call duration:", error.message);

        // Try WebSocket as fallback
        if (wsConnected && sendMeetingEnd) {
          try {
            sendMeetingEnd(endTime.toISOString(), finalDuration);
            console.log("✅ Duration sent via WebSocket as fallback");
          } catch (wsError) {
            console.error("Failed to send duration via WebSocket:", wsError);
          }
        }
      }

      // Clean up localStorage using database call ID
      localStorage.removeItem(`meeting_${databaseCallId}_start`);
      localStorage.removeItem(`meeting_${databaseCallId}_duration`);
      localStorage.removeItem(`meeting_${databaseCallId}_active`);
    }

    // Clean up local storage for database call ID
    localStorage.removeItem("currentDatabaseCallId");
    localStorage.removeItem("currentMeetingId");

    // Now handle the Zoom SDK cleanup
    if (window.ZoomMtg) {
      window.ZoomMtg.leaveMeeting({
        success: () => {
          console.log("✅ Zoom SDK leave meeting successful");
          handleMeetingEndCleanup();
          navigate("/call", { replace: true });
        },
        error: () => {
          console.log(
            "⚠️ Zoom SDK leave meeting failed, but continuing cleanup"
          );
          handleMeetingEndCleanup();
          navigate("/call", { replace: true });
        },
      });
    } else {
      console.log("⚠️ Zoom SDK not available, doing direct cleanup");
      handleMeetingEndCleanup();
      navigate("/call", { replace: true });
    }

    // Cleanup function to reset UI state
    function handleMeetingEndCleanup() {
      // Clear popup timeout if still pending
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
      
      // Reset all meeting-related state
      setIsMeetingActive(false);
      setPopupOpened(false); // Reset popup flag for next meeting
      popupWindowRef.current = null; // Clear popup window reference
      setMeetingData(null);
      setMeetingNumber("");
      setTranscripts([]);
      setAiSuggestions([]);
      setParticipants([]);
      setError(null);

      // Reset audio/video states
      setIsVideoOn(true);
      setIsAudioOn(true);
      setIsScreenSharing(false);

      // Stop audio recording if active
      if (isAudioRecording) {
        stopAudioRecording();
      }

      // Leave WebSocket call using the database call ID
      if (wsConnected) {
        const dbCallId = localStorage.getItem("currentDatabaseCallId");
        leaveCall(dbCallId || propCallId || currentCallId);
      }

      // Show completion message
      if (!toast.isVisible) {
        setToast({
          message:
            "Left meeting successfully. You can now create a new meeting.",
          type: "success",
          isVisible: true,
        });
      }

      if (onMeetingEnd) {
        onMeetingEnd();
      }
    }
  }, [
    isTimerActive,
    meetingStartTime,
    timerInterval,
    propCallId,
    currentCallId,
    wsConnected,
    sendMeetingEnd,
    isAudioRecording,
    stopAudioRecording,
    leaveCall,
    onMeetingEnd,
    toast.isVisible,
  ]);

  // NEW: Handle server-initiated meeting end
  useEffect(() => {
    if (wsMeetingEnded && isMeetingActive) {
      console.log("🏁 Meeting ended by server, cleaning up...");

      setToast({
        message: "Meeting has been ended by the server.",
        type: "info",
        isVisible: true,
      });

      // Automatically trigger meeting cleanup
      setTimeout(() => {
        leaveMeetingWithTimer();
      }, 2000); // Give user time to see the message
    }
  }, [wsMeetingEnded, isMeetingActive, leaveMeetingWithTimer]);

  // Set up meeting end callback when WebSocket connects
  useEffect(() => {
    if (wsConnected && setMeetingEndCallback) {
      setMeetingEndCallback((meetingEndEvent: any) => {
        console.log("📨 Received meeting end event:", meetingEndEvent);

        // Show notification to user
        setToast({
          message: `Meeting ended: ${
            meetingEndEvent.reason || "Meeting completed"
          }`,
          type: "info",
          isVisible: true,
        });

        // Optional: Extract additional data from the event
        if (meetingEndEvent.duration) {
          console.log("📊 Final meeting duration:", meetingEndEvent.duration);
        }

        if (meetingEndEvent.participants) {
          console.log(
            "👥 Final participant count:",
            meetingEndEvent.participants.length
          );
        }
      });
    }
  }, [wsConnected, setMeetingEndCallback]);

  if (!isSDKLoaded) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Zoom SDK...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Video className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Zoom Integration
              </h3>
              <p className="text-sm text-slate-600">
                {isMeetingActive
                  ? wsMeetingEnded
                    ? "Meeting ended by server"
                    : "Meeting in progress"
                  : "Ready to start or join meeting"}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    wsConnected ? "bg-emerald-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-slate-500">
                  {wsConnected ? "AI Connected" : "AI Disconnected"}
                </span>
                {wsMeetingEnded && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-orange-600">
                      Meeting Ended
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              wsMeetingEnded
                ? "bg-orange-500"
                : isMeetingActive
                ? "bg-emerald-500 animate-pulse"
                : "bg-slate-300"
            }`}
          />
        </div>

        {/* Show meeting ended message */}
        {wsMeetingEnded && isMeetingActive && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <p className="text-orange-700 text-sm font-medium">
                Meeting has been ended by the server. Cleaning up...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {audioError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">Audio: {audioError}</p>
          </div>
        )}

        <div className="min-h-[400px]">
          {!isMeetingActive ? (
            <div className="space-y-4">
              {meetingData ? (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">
                    Meeting Created
                  </h4>
                  <div className="space-y-2 text-sm mb-4">
                    <div>
                      <span className="text-slate-600">Meeting ID:</span>
                      <span className="ml-2 font-mono">
                        {meetingData.meetingId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Password:</span>
                      <span className="ml-2 font-mono">
                        {meetingData.password}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Join URL:</span>
                      <a
                        href={meetingData.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-700 underline"
                      >
                        Open in Zoom App
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        joinMeetingAsHostWithTimer(
                          meetingData.meetingId,
                          meetingData.password
                        )
                      }
                      disabled={isLoading}
                      className="col-span-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Start Meeting as Host
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 border border-blue-200"
                    >
                      <Users className="h-4 w-4 inline mr-1" />
                      Send Invites
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meetingData.joinUrl);
                        setToast({
                          message: "Meeting link copied to clipboard!",
                          type: "success",
                          isVisible: true,
                        });
                      }}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 border border-slate-200"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={createMeeting}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Call & Meeting...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Create New Call & Meeting
                      </>
                    )}
                  </button>

                  <div className="text-center text-slate-500 text-sm font-medium">
                    or
                  </div>

                  <div className="space-y-3">
                    {/* Input Mode Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveInputMode("id")}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                          activeInputMode === "id"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Meeting ID
                      </button>
                      <button
                        onClick={() => setActiveInputMode("url")}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                          activeInputMode === "url"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Meeting URL
                      </button>
                    </div>

                    {activeInputMode === "id" ? (
                      <>
                        <input
                          type="text"
                          placeholder="Enter Meeting ID (e.g., 123 456 7890)"
                          value={meetingNumber}
                          onChange={(e) => setMeetingNumber(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        <button
                          onClick={handleJoinExistingMeeting}
                          disabled={
                            isLoading || !meetingNumber.trim() || !isSDKLoaded
                          }
                          className="w-full bg-slate-50 hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-200 disabled:border-slate-200"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"></div>
                              Joining...
                            </>
                          ) : (
                            <>Join with Meeting ID</>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <textarea
                            placeholder="Paste Zoom meeting URL here&#10;e.g., https://us05web.zoom.us/j/1234567?pwd=hjvbdcvxcvzfoigu98ah&YGIE.1"
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                          />
                          <div className="text-xs text-slate-500">
                            Supported formats: zoom.us/j/...,
                            us05web.zoom.us/j/..., or just paste the full URL
                          </div>
                        </div>
                        <button
                          onClick={handleJoinFromUrl}
                          disabled={
                            isLoading || !meetingUrl.trim() || !isSDKLoaded
                          }
                          className="w-full bg-slate-50 hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-200 disabled:border-slate-200"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"></div>
                              Joining...
                            </>
                          ) : (
                            <>Join with Meeting URL</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-3" />
                    <span className="text-emerald-800 font-medium">
                      Meeting Active
                    </span>
                  </div>
                  {/* Live duration display */}
                  {isTimerActive && (
                    <div className="flex items-center bg-white px-3 py-1 rounded-full border border-emerald-200">
                      <Clock className="h-4 w-4 text-emerald-600 mr-2" />
                      <span className="font-mono text-emerald-700 font-semibold">
                        {formatDuration(meetingDuration)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-emerald-700 text-sm mt-1">
                  AI assistance is monitoring your call and providing real-time
                  suggestions.
                  {isTimerActive &&
                    ` Duration: ${formatDuration(meetingDuration)}`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      isAudioOn
                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                    title={isAudioOn ? "Mute Audio" : "Unmute Audio"}
                  >
                    {isAudioOn ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-lg transition-colors ${
                      isVideoOn
                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                    title={isVideoOn ? "Turn Off Video" : "Turn On Video"}
                  >
                    <Video className="h-4 w-4" />
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    className={`p-2 rounded-lg transition-colors ${
                      isScreenSharing
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                  >
                    <Share className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={leaveMeetingWithTimer}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-red-200"
                >
                  Leave Meeting
                </button>
              </div>

              <div className="mt-4 bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                  Live Transcript ({transcripts.length} entries)
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  {transcripts.length === 0 ? (
                    <div className="text-slate-500 text-sm flex items-center">
                      <span className="mr-2">💬</span>
                      Waiting for conversation to begin...
                    </div>
                  ) : (
                    transcripts.map((transcript, index) => (
                      <div
                        key={index}
                        className="text-sm mb-2 p-2 bg-white rounded border"
                      >
                        <span className="font-medium text-blue-600">
                          {transcript.speaker}:
                        </span>
                        <span className="ml-2">{transcript.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                  AI Suggestions ({aiSuggestions.length} active)
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  {aiSuggestions.length === 0 ? (
                    <div className="text-slate-500 text-sm flex items-center">
                      <span className="mr-2">🤖</span>
                      AI is listening and will provide suggestions based on the
                      conversation.
                    </div>
                  ) : (
                    aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="text-sm mb-2 p-2 bg-white rounded border border-blue-200"
                      >
                        <span className="font-medium text-blue-600">
                          AI Suggestion:
                        </span>
                        <span className="ml-2">{suggestion.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSendInvites={sendMeetingInvite}
          meetingData={meetingData}
          isLoading={isLoading}
        />

        {/* Toast Notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </Card>
    </div>
  );
};
