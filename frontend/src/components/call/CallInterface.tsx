import React, { useState, useEffect, useRef } from "react";
import { Video, MessageSquare, Brain } from "lucide-react";

import { ZoomIntegration } from "../integrations/ZoomIntegration";
import { useWebSocket } from "../../hooks/useWebSocket";
import { APIService } from "../../lib/api";

interface TranscriptEntry {
  id: string;
  speaker?: string;
  text: string;
  timestamp?: Date | number;
  confidence?: number;
  isFinal?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  timestamp?: Date | number;
  used?: boolean;
}

interface CallInterfaceProps {
  callId: string;
  userId?: string;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  callId,
  userId = "default-user",
}) => {
  const [isCallActive, setIsCallActive] = useState(false);

  // Ref for auto-scrolling suggestions
  const suggestionsEndRef = useRef<HTMLDivElement>(null);

  // Use WebSocket hook for real-time data
  const { suggestions, isConnected, joinCall, leaveCall } = useWebSocket(
    callId,
    userId
  );

  // Auto-scroll to bottom when new suggestions are added
  useEffect(() => {
    if (suggestionsEndRef.current && suggestions.length > 0) {
      suggestionsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [suggestions.length]);

  // Clean up any OAuth callback URLs if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("zoom_connected") || urlParams.get("error")) {
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleMeetingStart = (data: unknown) => {
    setIsCallActive(true);
    console.log("Meeting started:", data);

    // Join the call when meeting starts
    if (isConnected) {
      joinCall(callId, userId, "zoom");
    }
  };

  const handleMeetingEnd = () => {
    setIsCallActive(false);
    console.log("Meeting ended");

    // Leave the call when meeting ends
    if (isConnected) {
      leaveCall(callId);
    }
  };


  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                isCallActive
                  ? "bg-emerald-500 shadow-lg shadow-emerald-200 animate-pulse"
                  : "bg-slate-300"
              }`}
            />
            <h1 className="text-xl font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
              Tryollie
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 max-h-full">
        {/* Left Panel - Video/Meeting Area */}
        <div className="flex-1 flex flex-col min-h-0 max-h-full">
          {/* Video Area */}
          <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative video-area min-h-0 max-h-full overflow-hidden">
            {isCallActive ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <Video className="h-10 w-10" />
                  </div>
                  <p className="text-2xl font-bold mb-2">Call Active</p>
                  <p className="text-slate-300">Zoom integration running</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-400 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-700 rounded-2xl flex items-center justify-center">
                    <Video className="h-10 w-10" />
                  </div>
                  <p className="text-2xl font-semibold mb-2 text-slate-300">
                    Ready to start
                  </p>
                  <p className="text-slate-400 mb-6">
                    Create a meeting or join an existing one below
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Zoom Integration Controls Only */}
          <div className="bg-white border-t border-slate-200 p-6 flex-shrink-0">
            <ZoomIntegration
              callId={callId}
              userId={userId}
              onMeetingStart={handleMeetingStart}
              onMeetingEnd={handleMeetingEnd}
              shouldCreateCall={!callId} // Create call if no callId provided
            />
          </div>
        </div>
      </div>
    </div>
  );
};
