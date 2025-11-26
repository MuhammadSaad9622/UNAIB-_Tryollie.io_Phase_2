import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CallInterface } from "../components/call/CallInterface";
import { useAuth } from "../contexts/AuthContext";

export const CallPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [callId, setCallId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCall = () => {
      setIsLoading(true);

      if (id) {
        // If we have a call ID from URL, use it
        setCallId(id);
        // Store in cookie
        document.cookie = `xczhfba=${id}; path=/; max-age=3600`;
      } else {
        // No call ID - this is fine, ZoomIntegration will handle call creation
        setCallId("");
      }

      setIsLoading(false);
    };

    if (user) {
      initializeCall();
    }
  }, [id, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing AI Sales Call...</p>
        </div>
      </div>
    );
  }

  // Always show the CallInterface - it will handle call creation if needed
  return <CallInterface callId={callId} />;
};
