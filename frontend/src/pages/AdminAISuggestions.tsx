import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import APIService from "../lib/api";

interface Suggestion {
  _id: string;
  type: string;
  text: string;
  confidence: number;
  used: boolean;
  priority: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  call?: {
    _id: string;
    title: string;
    meetingId?: string;
  };
}

const AdminAISuggestions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    userId: "",
    callId: "",
    type: "",
    priority: "",
    used: "",
    minConfidence: "",
    maxConfidence: "",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchSuggestions();
    fetchStats();
  }, [page, filters, user, navigate]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20, ...filters };
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );
      console.log("Fetching suggestions with params:", params);
      const response = await APIService.getAdminSuggestions(params);
      console.log("Suggestions response:", response);
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setSuggestions([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch suggestions:", err);
      console.error("Error details:", err.response?.data);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await APIService.getAdminDashboardStats();
      setStats(response.data);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Suggestions Usage</h1>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Suggestions</div>
            <div className="text-2xl font-bold">
              {stats.overview.totalSuggestions}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Used</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.overview.usedSuggestions}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Usage Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(stats.overview.suggestionUsageRate * 100)}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Recent (7d)</div>
            <div className="text-2xl font-bold">
              {stats.recentActivity.recentSuggestions}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="objection_handling">Objection Handling</option>
            <option value="closing">Closing</option>
            <option value="question">Question</option>
            <option value="pricing">Pricing</option>
            <option value="feature_highlight">Feature Highlight</option>
            <option value="rapport_building">Rapport Building</option>
            <option value="next_steps">Next Steps</option>
            <option value="follow_up">Follow Up</option>
          </select>
          <select
            value={filters.used}
            onChange={(e) => setFilters({ ...filters, used: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All</option>
            <option value="true">Used</option>
            <option value="false">Not Used</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Suggestions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Suggestion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suggestions.map((suggestion) => (
                    <tr key={suggestion._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                          {suggestion.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md truncate">
                          {suggestion.text.substring(0, 100)}
                          {suggestion.text.length > 100 && "..."}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${suggestion.confidence * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            suggestion.priority === "high" ||
                            suggestion.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : suggestion.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {suggestion.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            suggestion.used
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {suggestion.used ? "Used" : "Not Used"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {suggestions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No AI suggestions found. Try adjusting your filters.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAISuggestions;

