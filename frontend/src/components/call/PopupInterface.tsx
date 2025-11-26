import React, { useState, useEffect, useRef } from "react";
import { X, Mic, MicOff, StopCircle, RotateCcw } from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";

interface PopupInterfaceProps {
  callId: string;
  userId?: string;
  onClose?: () => void;
}

export const PopupInterface: React.FC<PopupInterfaceProps> = ({
  callId,
  userId = "default-user",
  onClose,
}) => {
  const [isListening, setIsListening] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [actualCallId, setActualCallId] = useState<string | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize actual call ID on component mount
  useEffect(() => {
    const initializeCallId = () => {
      // First, try the provided callId
      if (
        callId &&
        callId.length >= 20 &&
        !callId.includes("call_") &&
        !callId.includes("meeting_")
      ) {
        console.log("✅ Using provided valid call ID:", callId);
        setActualCallId(callId);
        return;
      }

      // Fallback to localStorage
      const storedCallId = localStorage.getItem("currentDatabaseCallId");
      if (
        storedCallId &&
        storedCallId.length >= 20 &&
        !storedCallId.includes("call_") &&
        !storedCallId.includes("meeting_")
      ) {
        console.log("✅ Using stored database call ID:", storedCallId);
        setActualCallId(storedCallId);
        return;
      }

      console.error("❌ No valid call ID found in props or localStorage");
      setActualCallId(null);
    };

    initializeCallId();
  }, [callId]);

  // Use WebSocket hook for real-time data with validated database call ID
  const {
    transcript,
    suggestions,
    isConnected,
    joinCall,
    leaveCall,
    socket,
    requestSuggestion,
  } = useWebSocket(actualCallId || "", userId);

  // Monitor for AI typing state - show typing when we have new transcript but no new suggestion yet
  useEffect(() => {
    if (transcript.length > 0 && suggestions.length > 0) {
      const lastTranscriptTime = new Date(
        transcript[transcript.length - 1].timestamp
      ).getTime();
      const lastSuggestionTime = new Date(
        suggestions[suggestions.length - 1].timestamp
      ).getTime();

      // If last transcript is newer than last suggestion by more than 2 seconds, show typing
      setIsAITyping(lastTranscriptTime > lastSuggestionTime + 2000);
    } else if (transcript.length > 0 && suggestions.length === 0) {
      // If we have transcript but no suggestions yet, show typing
      setIsAITyping(true);
    } else {
      setIsAITyping(false);
    }
  }, [transcript, suggestions]);

  // Auto-scroll to bottom when new messages arrive or when typing state changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, suggestions, isAITyping]);

  // Debug: Log with validated call ID
  useEffect(() => {
    if (actualCallId) {
      console.log("📊 PopupInterface - Current data:", {
        transcriptCount: transcript.length,
        suggestionsCount: suggestions.length,
        isConnected,
        actualCallId,
        userId,
      });

      if (transcript.length > 0) {
        console.log("📝 Latest transcript:", transcript[transcript.length - 1]);
      }

      if (suggestions.length > 0) {
        console.log(
          "🤖 Latest suggestion:",
          suggestions[suggestions.length - 1]
        );
      }
    }
  }, [transcript, suggestions, isConnected, actualCallId, userId]);

  // Auto-join the call when component mounts using validated database call ID
  useEffect(() => {
    if (isConnected && actualCallId && userId) {
      console.log(
        `🔌 Auto-joining call with REAL DATABASE ID: ${actualCallId} for user ${userId}`
      );
      joinCall(actualCallId, userId, "zoom");
    } else if (!actualCallId) {
      console.error("❌ Cannot join call - no valid database ID available");
    }
  }, [isConnected, actualCallId, userId, joinCall]);

  const handleClose = () => {
    if (isConnected && actualCallId) {
      leaveCall(actualCallId);
    }
    if (onClose) {
      onClose();
    } else {
      window.close();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleStopListening = () => {
    setIsListening(!isListening);
    // You can add logic here to actually stop/start listening
  };

  const handleClear = () => {
    // Clear the current conversation using real database call ID
    if (socket && actualCallId) {
      socket.emit("clearConversation", { callId: actualCallId });
    }
  };

  // Handle manual AI trigger (Space or Enter)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        // Prevent default behavior if needed (e.g., scrolling for Space)
        // event.preventDefault();
        console.log(`⌨️ Key pressed: ${event.code} - Requesting AI suggestion`);
        requestSuggestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestSuggestion]);

  // Show loading if actualCallId is still being determined
  if (actualCallId === null) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-900 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-4">Initializing AI Assistant</h2>
          <p className="mb-4">Looking for your active call session...</p>
          <p className="text-gray-600 text-sm">
            If this persists, please create a new call from the dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Show error if invalid call ID
  if (!actualCallId) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-900 p-6">
          <h2 className="text-xl font-bold mb-4">Invalid Call ID</h2>
          <p className="mb-4">
            The provided call ID is not valid. Please ensure you're using a real
            database call ID.
          </p>
          <button
            onClick={handleClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleMinimize}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Mic className="h-4 w-4" />
          <span>AI Assistant</span>
        </button>
      </div>
    );
  }

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex justify-end mb-4">
      <div className="max-w-xs">
        <div className="bg-blue-500 rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div
                className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <div>
            <span className="text-gray-900 font-semibold">Tryollie AI</span>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
              ></div>
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Exit
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {!isConnected ? (
          // Connecting State - Optimized with better messaging
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Assistant Ready
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Waiting for your Zoom meeting to start. Once you join the meeting, the AI assistant will automatically connect and start providing real-time suggestions.
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Ready to connect...</span>
              </div>
            </div>
          </div>
        ) : transcript.length === 0 && suggestions.length === 0 ? (
          // Empty State - Connected but no data yet
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Mic className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Assistant Ready
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your AI assistant is listening and will provide real-time
                insights during your conversation.
              </p>
            </div>
          </div>
        ) : (
          // Messages Container
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {(() => {
                const allMessages = [
                  ...transcript.map((t) => ({ ...t, type: "transcript" })),
                  ...suggestions.map((s) => ({ ...s, type: "suggestion" })),
                ].sort((a, b) => {
                  const timeA = new Date(a.timestamp || 0).getTime();
                  const timeB = new Date(b.timestamp || 0).getTime();
                  return timeA - timeB;
                });

                const messageElements = allMessages.map((message, index) => {
                  if (message.type === "transcript") {
                    const transcriptMessage = message as typeof message & {
                      speaker: string;
                    };
                    return (
                      <div
                        key={`transcript-${index}`}
                        className="flex justify-start mb-4"
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                            <p className="text-gray-900 text-sm leading-relaxed">
                              {transcriptMessage.text}
                            </p>
                          </div>
                          <div className="mt-1 ml-4 text-xs text-gray-500">
                            {transcriptMessage.speaker} •{" "}
                            {new Date(
                              transcriptMessage.timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    const suggestionMessage = message as typeof message & {
                      reasoning?: string;
                    };
                    return (
                      <div
                        key={`suggestion-${index}`}
                        className="flex justify-end mb-4"
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div className="bg-blue-500 rounded-2xl px-4 py-3">
                            <p className="text-white text-sm leading-relaxed">
                              {suggestionMessage.text}
                            </p>
                            {suggestionMessage.reasoning && (
                              <div className="mt-2 pt-2 border-t border-blue-400/30">
                                <p className="text-blue-100 text-xs">
                                  💡 {suggestionMessage.reasoning}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mt-1 mr-4 text-xs text-gray-500 text-right">
                            AI •{" "}
                            {new Date(
                              suggestionMessage.timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                });

                // Add typing indicator if AI is typing
                if (isAITyping) {
                  messageElements.push(
                    <TypingIndicator key="typing-indicator" />
                  );
                }

                return messageElements;
              })()}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
