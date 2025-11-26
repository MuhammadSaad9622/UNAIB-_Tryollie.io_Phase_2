import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import APIService from "../lib/api";

interface Call {
  _id: string;
  title: string;
  status: string;
  duration: number;
  startTime: string;
  endTime?: string;
  platform: string;
  meetingId?: string;
  performanceData?: {
    score?: number;
    sentimentScore?: number;
    questionsAsked?: number;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  participants?: Array<{
    name: string;
    email?: string;
    role: string;
  }>;
}

const AdminMeetings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    userId: "",
    status: "",
    platform: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchCalls();
    fetchStats();
  }, [page, filters, user, navigate]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20, ...filters };
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );
      console.log("Fetching calls with params:", params);
      const response = await APIService.getAdminCalls(params);
      console.log("Calls response:", response);
      if (response.success && response.data) {
        setCalls(response.data.calls || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setCalls([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch calls:", err);
      console.error("Error details:", err.response?.data);
      setCalls([]);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Meetings</h1>
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
            <div className="text-sm text-gray-600">Total Meetings</div>
            <div className="text-2xl font-bold">{stats.overview.totalCalls}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.overview.completedCalls}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.callsByStatus?.active || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Platforms</div>
            <div className="text-2xl font-bold">
              {Object.keys(stats.callsByStatus || {}).length}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="in_progress">In Progress</option>
          </select>
          <select
            value={filters.platform}
            onChange={(e) =>
              setFilters({ ...filters, platform: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Platforms</option>
            <option value="zoom">Zoom</option>
            <option value="google_meet">Google Meet</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Meetings Table */}
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calls.map((call) => (
                    <tr key={call._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{call.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {call.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate">{call.title}</div>
                        {call.meetingId && (
                          <div className="text-xs text-gray-400">
                            ID: {call.meetingId.substring(0, 20)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                          {call.platform || "other"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            call.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : call.status === "active" ||
                                call.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : call.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDuration(call.duration || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {call.performanceData?.score ? (
                          <div className="flex items-center">
                            <span className="font-medium">
                              {call.performanceData.score}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">/100</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(call.startTime).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(call.startTime).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {calls.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No meetings found. Try adjusting your filters.
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

export default AdminMeetings;

