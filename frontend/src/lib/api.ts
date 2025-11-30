import axios from "axios";

// Use environment variable or fallback to default
// Check if we're in development mode (localhost)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
  ? "http://localhost:3002/api"
  : "https://api.tryollie.io/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  // Check localStorage for token
  const token = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Also add user ID header as fallback
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData.id) {
        config.headers["x-user-id"] = userData.id;
      }
    } catch (e) {
      console.warn("Failed to parse user data from localStorage");
    }
  }

  return config;
});

// Track if we're already refreshing the token to prevent multiple refreshes
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Get token from localStorage
            const token = localStorage.getItem("authToken");

            if (!token) {
              throw new Error("No authentication token found");
            }

            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Check if we're on the login page or trying to refresh the token
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register");

      if (isAuthEndpoint) {
        // Don't try to refresh for auth endpoints
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // For now, just clear the token and reject
        // In a real app, you would implement token refresh here
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        isRefreshing = false;
        processQueue(error, null);

        // Redirect to login page only if not already on signin page
        if (window.location.pathname !== "/signin" && window.location.pathname !== "/signup") {
          window.location.href = "/signin";
        }

        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        isRefreshing = false;
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export class APIService {
  // Authentication
  static async login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  }

  static async register(name: string, email: string, password: string) {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  }

  static async getProfile() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  }

  static async updateProfile(updates: any) {
    const response = await apiClient.patch("/auth/me", updates);
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    const response = await apiClient.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Calls
  static async getCalls(params?: any) {
    const response = await apiClient.get("/calls", { params });
    return response.data;
  }

  static async createCall(callData: any) {
    const response = await apiClient.post("/calls", callData);
    return response.data;
  }

  static async getCall(id: string) {
    const response = await apiClient.get(`/calls/${id}`);
    return response.data;
  }

  static async getCallLog(id: string) {
    const response = await apiClient.get(`/calls/${id}/log`);
    return response.data;
  }

  static async generateCallSummary(id: string) {
    const response = await apiClient.post(`/calls/${id}/summary`);
    return response.data;
  }

  static async shareCallSummary(id: string, email: string, summary?: string) {
    const response = await apiClient.post(`/calls/${id}/share`, { email, summary });
    return response.data;
  }

  static async updateCall(id: string, updates: any) {
    try {
      console.log(`📝 API: Updating call ${id} with:`, updates);

      const response = await apiClient.patch(`/calls/${id}`, updates);

      console.log(`✅ API: Call update successful for ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ API: Failed to update call ${id}:`,
        error.response?.data || error.message
      );
      const errorDetails = error.response?.data || {};
      throw new Error(errorDetails.message || "Failed to update call");
    }
  }

  static async deleteCall(id: string) {
    const response = await apiClient.delete(`/calls/${id}`);
    return response.data;
  }

  static async startCall(id: string) {
    const response = await apiClient.patch(`/calls/${id}/start`);
    return response.data;
  }

  static async endCall(id: string) {
    const response = await apiClient.patch(`/calls/${id}/end`);
    return response.data;
  }

  // Zoom Meeting Services
  static async createZoomMeeting(meetingData: any) {
    const response = await apiClient.post("/meetings/zoom/create", {
      meetingData,
    });
    return response.data;
  }

  static async getZoomMeeting(meetingId: string) {
    const response = await apiClient.get(`/meetings/zoom/${meetingId}`);
    return response.data;
  }

  static async listZoomMeetings(type?: string) {
    const response = await apiClient.get("/meetings/zoom/user/list", {
      params: { type },
    });
    return response.data;
  }

  static async generateZoomSDKSignature(
    meetingNumber: string,
    role: number = 0
  ) {
    const response = await apiClient.post("/meetings/zoom/sdk-signature", {
      meetingNumber,
      role,
    });
    return response.data;
  }

  static async sendMeetingInvite(inviteData: any) {
    const response = await apiClient.post(
      "/meetings/zoom/send-invite",
      inviteData
    );
    return response.data;
  }

  static async disableMeetingNotifications(meetingId: string) {
    const response = await apiClient.patch(
      `/meetings/zoom/${meetingId}/disable-notifications`
    );
    return response.data;
  }

  // Generate Zoom ZAK token for joining meetings as authenticated user
  static async generateZoomZAK(meetingNumber: string) {
    const response = await apiClient.post("/meetings/zoom/generate-zak", {
      meetingNumber,
    });
    return response.data;
  }

  // Zoom OAuth Services
  static async getZoomAuthUrl() {
    const response = await apiClient.get("/meetings/zoom/oauth/auth-url");
    return response.data;
  }

  static async getZoomConnectionStatus() {
    const response = await apiClient.get("/meetings/zoom/oauth/status");
    return response.data;
  }

  static async getZoomDiagnostic() {
    const response = await apiClient.get("/meetings/zoom/oauth/diagnostic");
    return response.data;
  }

  static async disconnectZoom() {
    const response = await apiClient.post("/meetings/zoom/oauth/disconnect");
    return response.data;
  }

  static async refreshZoomToken() {
    const response = await apiClient.post("/meetings/zoom/oauth/refresh");
    return response.data;
  }

  // Google Meet Services
  static async getGoogleAuthUrl() {
    const response = await apiClient.get("/meetings/google/auth-url");
    return response.data;
  }

  static async exchangeGoogleCode(code: string) {
    const response = await apiClient.post("/meetings/google/exchange-code", {
      code,
    });
    return response.data;
  }

  static async createGoogleMeet(userTokens: any, meetingData: any) {
    const response = await apiClient.post("/meetings/google/create", {
      userTokens,
      meetingData,
    });
    return response.data;
  }

  static async listGoogleMeets(userTokens: any, maxResults?: number) {
    const response = await apiClient.get("/meetings/google/user/list", {
      params: {
        userTokens: JSON.stringify(userTokens),
        maxResults,
      },
    });
    return response.data;
  }

  // Documents
  static async getDocuments(params?: any) {
    try {
      const response = await apiClient.get("/documents", { params });
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to fetch documents"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static async getDocument(id: string) {
    try {
      const response = await apiClient.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to fetch document"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static async uploadDocument(formData: FormData) {
    try {
      const response = await apiClient.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to upload document"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static async createUrlDocument(documentData: {
    name: string;
    url: string;
    tags?: string[];
  }) {
    try {
      const response = await apiClient.post("/documents/url", documentData);
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to create URL document"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static async updateDocument(id: string, updates: any) {
    try {
      const response = await apiClient.patch(`/documents/${id}`, updates);
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to update document"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static async deleteDocument(id: string) {
    try {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to delete document"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static async getDocumentAISuggestion(id: string) {
    try {
      const response = await apiClient.get(`/documents/${id}/ai-suggestion`);
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to get AI suggestion"
      );
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  static async askDocumentQuestion(id: string, question: string) {
    try {
      const response = await apiClient.post(`/documents/${id}/qa`, { question });
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || 'Failed to get document answer'
      );
      enhancedError.code = errorDetails.code || 'UNKNOWN_ERROR';
      enhancedError.details = errorDetails.details || 'An unexpected error occurred';
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  static async downloadDocument(id: string) {
    try {
      const response = await apiClient.get(`/documents/${id}/download`, {
        responseType: "blob", // Important for file downloads
      });
      return response.data;
    } catch (error) {
      // Extract detailed error information if available
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to download document"
      );

      // Add additional properties to the error
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  }

  static getDocumentDownloadUrl(id: string) {
    return `${API_BASE_URL}/documents/${id}/download`;
  }

  static async processTextForAISuggestion(
    text: string,
    documentType: string = "text"
  ) {
    try {
      const response = await apiClient.post("/documents/process-text", {
        text,
        documentType,
      });
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || {};
      const enhancedError = new Error(
        errorDetails.message || "Failed to process text for AI suggestion"
      );
      enhancedError.code = errorDetails.code || "UNKNOWN_ERROR";
      enhancedError.details =
        errorDetails.details || "An unexpected error occurred";
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  // Analytics
  static async getDashboardAnalytics(timeRange = "30") {
    const response = await apiClient.get("/analytics/", {
      params: { timeRange },
    });
    return response.data;
  }

  static async getSuccessRateAnalytics(timeRange = "30") {
    const response = await apiClient.get("/analytics/success-rate", {
      params: { timeRange },
    });
    return response.data;
  }

  static async getPerformanceAnalytics(timeRange = "30", groupBy = "day") {
    const response = await apiClient.get("/analytics/performance", {
      params: { timeRange, groupBy },
    });
    return response.data;
  }

  // AI Suggestion Analytics
  static async getAISuggestionStats(timeRange = 30, detailed = false) {
    const response = await apiClient.get("/analytics/ai-suggestions", {
      params: { timeRange, detailed: detailed.toString() },
    });
    return response.data;
  }

  static async getAISuggestionStatsByType(timeRange = 30) {
    const response = await apiClient.get("/analytics/ai-suggestions/by-type", {
      params: { timeRange },
    });
    return response.data;
  }

  static async getDetailedAISuggestionStats(timeRange = 30) {
    const response = await apiClient.get("/analytics/ai-suggestions", {
      params: { timeRange, detailed: "true" },
    });
    return response.data;
  }

  // Health Check
  static async getHealth() {
    const response = await apiClient.get("/health");
    return response.data;
  }

  // NEW: Update meeting duration in real-time (simplified)
  static async updateMeetingDuration(
    callId: string,
    duration: number,
    source: string = "manual"
  ) {
    try {
      console.log(
        `📝 API: Updating duration for call ${callId} - Duration: ${duration}s, Source: ${source}`
      );

      const response = await apiClient.patch(`/meetings/duration/${callId}`, {
        duration,
        source,
      });

      console.log(
        `✅ API: Duration update successful for call ${callId}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ API: Failed to update meeting duration for call ${callId}:`,
        error.response?.data || error.message
      );
      const errorDetails = error.response?.data || {};
      throw new Error(
        errorDetails.message || "Failed to update meeting duration"
      );
    }
  }

  // NEW: Quota Analytics
  static async getDailyQuotaUsage(date?: string) {
    const params = date ? { date } : {};
    const response = await apiClient.get("/analytics/quota/daily", { params });
    return response.data;
  }

  static async getWeeklyQuotaTrends(startDate?: string) {
    const params = startDate ? { startDate } : {};
    const response = await apiClient.get("/analytics/quota/weekly", { params });
    return response.data;
  }

  static async getQuotaStatus() {
    const response = await apiClient.get("/analytics/quota/status");
    return response.data;
  }

  // Admin API methods
  static async getAdminDashboardStats() {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  }

  static async getAdminAnalytics(params?: any) {
    const response = await apiClient.get("/admin/analytics", { params });
    return response.data;
  }

  static async getAdminUsers(params?: any) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  }

  static async getAdminUser(id: string) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  }

  static async updateAdminUser(id: string, updates: any) {
    const response = await apiClient.patch(`/admin/users/${id}`, updates);
    return response.data;
  }

  static async deleteAdminUser(id: string) {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }

  static async updateUserSubscription(id: string, plan: string) {
    const response = await apiClient.patch(`/admin/users/${id}/subscription`, { plan });
    return response.data;
  }

  static async getAdminCalls(params?: any) {
    const response = await apiClient.get("/admin/calls", { params });
    return response.data;
  }

  static async getAdminCall(id: string) {
    const response = await apiClient.get(`/admin/calls/${id}`);
    return response.data;
  }

  static async getAdminSuggestions(params?: any) {
    const response = await apiClient.get("/admin/suggestions", { params });
    return response.data;
  }

  static async getAdminSubscriptions(params?: any) {
    const response = await apiClient.get("/admin/subscriptions", { params });
    return response.data;
  }

  static async updateAdminSubscription(id: string, updates: any) {
    const response = await apiClient.patch(`/admin/subscriptions/${id}`, updates);
    return response.data;
  }

  // Billing API methods
  static async getBillingConfig() {
    const response = await apiClient.get("/billing/config");
    return response.data;
  }

  static async getPlans() {
    const response = await apiClient.get("/billing/plans");
    return response.data;
  }

  static async getSubscription() {
    const response = await apiClient.get("/billing/subscription");
    return response.data;
  }

  static async createStripeCustomer(data: any) {
    const response = await apiClient.post("/billing/customers", data);
    return response.data;
  }

  static async createCheckoutSession(data: any) {
    const response = await apiClient.post("/billing/checkout", data);
    return response.data;
  }

  static async getSubscriptionDetails(id: string) {
    const response = await apiClient.get(`/billing/subscriptions/${id}`);
    return response.data;
  }

  static async cancelSubscription(id: string) {
    const response = await apiClient.post(`/billing/subscriptions/${id}/cancel`);
    return response.data;
  }

  // Invoice API methods
  static async getInvoices(userId?: string) {
    const params = userId ? { userId } : {};
    const response = await apiClient.get("/billing/invoices", { params });
    return response.data;
  }

  static async getInvoice(id: string) {
    const response = await apiClient.get(`/billing/invoices/${id}`);
    return response.data;
  }

  static async createInvoice(data: any) {
    const response = await apiClient.post("/billing/invoices", data);
    return response.data;
  }

  static async sendInvoice(id: string) {
    const response = await apiClient.post(`/billing/invoices/${id}/send`);
    return response.data;
  }

  static async markInvoicePaid(id: string) {
    const response = await apiClient.post(`/billing/invoices/${id}/mark-paid`);
    return response.data;
  }

  static async cancelInvoice(id: string) {
    const response = await apiClient.post(`/billing/invoices/${id}/cancel`);
    return response.data;
  }

  static async getInvoiceStats() {
    const response = await apiClient.get("/billing/invoices/stats/overview");
    return response.data;
  }

  static async payInvoice(id: string) {
    const response = await apiClient.post(`/billing/invoices/${id}/pay`);
    return response.data;
  }
}

export default APIService;
