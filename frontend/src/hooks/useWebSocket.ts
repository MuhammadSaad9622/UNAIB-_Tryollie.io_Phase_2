import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  confidence: number;
  timestamp: Date;
  isFinal?: boolean;
  callId: string;
}

interface AISuggestion {
  id: string;
  type: string;
  text: string;
  confidence: number;
  reasoning?: string;
  priority: string;
  used: boolean;
  timestamp: Date;
}

interface WebSocketData {
  transcript: TranscriptEntry[];
  suggestions: AISuggestion[];
  isConnected: boolean;
  meetingEnded?: boolean;
}

export const useWebSocket = (callId: string, userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<WebSocketData>({
    transcript: [],
    suggestions: [],
    isConnected: false,
    meetingEnded: false,
  });
  const [onMeetingEndCallback, setOnMeetingEndCallback] = useState<
    ((data: any) => void) | null
  >(null);

  const connect = useCallback(() => {
    if (!callId || !userId) {
      console.log("❌ Cannot connect: missing callId or userId", {
        callId,
        userId,
      });
      return;
    }

    console.log("🔌 Creating Socket.IO connection...");
    console.log(
      "🌐 Server URL:",
      "https://api.tryollie.io"
      // "http://localhost:3002"
    );

    const authToken =
      localStorage.getItem("authToken") || "dummy-token-for-development";
    console.log("🔑 Auth token present:", !!authToken);

    const newSocket = io(
      "https://api.tryollie.io",
      // "http://localhost:3002",
      {
        transports: ["websocket", "polling"],
        auth: {
          token: authToken,
        },
      }
    );

    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected with ID:", newSocket.id);
      setData((prev) => ({ ...prev, isConnected: true }));
    });

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setData((prev) => ({ ...prev, isConnected: false }));
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      setData((prev) => ({ ...prev, isConnected: false }));
    });

    setSocket(newSocket);
  }, [callId, userId]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setData({
        transcript: [],
        suggestions: [],
        isConnected: false,
      });
    }
  }, [socket]);

  const joinCall = useCallback(
    (callId: string, userId: string, platform?: string) => {
      console.log("📞 Attempting to join call:", { callId, userId, platform });
      console.log("🔌 Socket connected:", socket?.connected);

      if (socket && socket.connected) {
        console.log(
          `📞 Joining call ${callId} on platform ${platform || "unknown"}`
        );
        socket.emit("joinCall", {
          callId,
          userId,
          platform: platform || "unknown",
        });
      } else {
        console.log("❌ Socket not connected, cannot join call");
      }
    },
    [socket]
  );

  const leaveCall = useCallback(
    (callId: string) => {
      if (socket && socket.connected) {
        console.log(`📞 Leaving call ${callId}`);
        socket.emit("leaveCall", { callId });
      }
    },
    [socket]
  );

  const markSuggestionUsed = useCallback(
    (suggestionId: string) => {
      if (socket && socket.connected) {
        socket.emit("useSuggestion", {
          suggestionId,
          callId,
          feedback: "used",
        });
      }
    },
    [socket, callId]
  );

  useEffect(() => {
    if (!socket) {
      connect();
      return;
    }

    // Real-time transcript events with deduplication
    socket.on("newTranscript", (transcript: TranscriptEntry) => {
      setData((prev) => {
        // Check for duplicates by text and timestamp to prevent multiple entries
        const isDuplicate = prev.transcript.some(
          (existing) =>
            existing.text === transcript.text &&
            existing.speaker === transcript.speaker &&
            Math.abs(
              new Date(existing.timestamp).getTime() -
                new Date(transcript.timestamp).getTime()
            ) < 5000
        );

        if (isDuplicate) {
          return prev;
        }

        return {
          ...prev,
          transcript: [...prev.transcript.slice(-50), transcript],
        };
      });
    });

    // AI suggestion events
    socket.on("newSuggestion", (suggestion: AISuggestion) => {
      setData((prev) => {
        // Check for duplicates based on text and timestamp
        const isDuplicate = prev.suggestions.some(
          (existing) =>
            existing.text === suggestion.text &&
            Math.abs(
              new Date(existing.timestamp).getTime() -
                new Date(suggestion.timestamp).getTime()
            ) < 1000
        );

        if (isDuplicate) {
          return prev;
        }

        const newSuggestions = [...prev.suggestions.slice(-10), suggestion];
        return {
          ...prev,
          suggestions: newSuggestions,
        };
      });
    });

    // Suggestion usage events
    socket.on(
      "suggestionUsed",
      ({ suggestionId }: { suggestionId: string }) => {
        setData((prev) => ({
          ...prev,
          suggestions: prev.suggestions.map((s) =>
            s.id === suggestionId ? { ...s, used: true } : s
          ),
        }));
      }
    );

    // Meeting events
    socket.on("meetingStarted", ({ meetingId }: { meetingId: string }) => {
      console.log("🎬 Meeting started:", meetingId);
    });

    socket.on("meetingEnded", (meetingEndEvent: any) => {
      console.log("🏁 Meeting ended by server:", meetingEndEvent);

      // Update state to indicate meeting has ended
      setData((prev) => ({
        ...prev,
        meetingEnded: true,
      }));

      // Call the callback if it exists
      if (onMeetingEndCallback) {
        onMeetingEndCallback(meetingEndEvent);
      }

      // Optional: Clear transcript and suggestions on meeting end
      setTimeout(() => {
        setData((prev) => ({
          ...prev,
          transcript: [],
          suggestions: [],
          meetingEnded: false,
        }));
      }, 5000); // Clear after 5 seconds
    });

    socket.on(
      "participantJoined",
      ({ participant }: { participant: unknown }) => {
        console.log("👤 Participant joined:", participant);
      }
    );

    socket.on(
      "participantLeft",
      ({ participant }: { participant: unknown }) => {
        console.log("👋 Participant left:", participant);
      }
    );

    // Call events
    socket.on(
      "callJoined",
      ({ callId, platform }: { callId: string; platform: string }) => {
        console.log(`✅ Successfully joined call ${callId} on ${platform}`);
      }
    );

    socket.on("callLeft", ({ callId }: { callId: string }) => {
      console.log(`👋 Successfully left call ${callId}`);
    });

    // Error events
    socket.on("transcriptionError", ({ error }: { error: string }) => {
      console.error("❌ Transcription error:", error);
    });

    socket.on("suggestionError", ({ error }: { error: string }) => {
      console.error("❌ AI suggestion error:", error);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.error("❌ Socket error:", message);
    });

    // Cleanup event listeners
    return () => {
      socket.off("newTranscript");
      socket.off("newSuggestion");
      socket.off("suggestionUsed");
      socket.off("meetingStarted");
      socket.off("meetingEnded");
      socket.off("participantJoined");
      socket.off("participantLeft");
      socket.off("callJoined");
      socket.off("callLeft");
      socket.off("transcriptionError");
      socket.off("suggestionError");
      socket.off("error");
    };
  }, [socket, connect, onMeetingEndCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sendAudioData = useCallback(
    (audioData: string) => {
      if (socket && socket.connected) {
        socket.emit("audioData", {
          callId,
          audioData,
        });
      }
    },
    [socket, callId]
  );

  // NEW: Send meeting duration update
  const sendDurationUpdate = useCallback(
    (duration: number) => {
      if (socket && socket.connected) {
        socket.emit("meetingEvent", {
          callId,
          event: "duration_update",
          platform: "zoom", // or detect platform dynamically
          payload: { duration },
        });
      }
    },
    [socket, callId]
  );

  // NEW: Send meeting timer start
  const sendMeetingStart = useCallback(
    (startTime: string) => {
      if (socket && socket.connected) {
        socket.emit("meetingEvent", {
          callId,
          event: "meeting_started",
          platform: "zoom",
          payload: { startTime },
        });
      }
    },
    [socket, callId]
  );

  // NEW: Send meeting timer end
  const sendMeetingEnd = useCallback(
    (endTime: string, duration: number) => {
      if (socket && socket.connected) {
        socket.emit("meetingEvent", {
          callId,
          event: "meeting_ended",
          platform: "zoom",
          payload: { endTime, duration },
        });
      }
    },
    [socket, callId]
  );

  // NEW: Method to set meeting end callback
  const setMeetingEndCallback = useCallback((callback: (data: any) => void) => {
    setOnMeetingEndCallback(() => callback);
  }, []);

  return {
    ...data,
    joinCall,
    leaveCall,
    markSuggestionUsed,
    socket,
    sendAudioData,
    sendDurationUpdate,
    sendMeetingStart,
    sendMeetingEnd,
    setMeetingEndCallback,
  };
};
