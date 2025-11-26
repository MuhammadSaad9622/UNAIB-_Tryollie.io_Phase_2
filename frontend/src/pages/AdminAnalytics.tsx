import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import APIService from "../lib/api";

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [groupBy, setGroupBy] = useState("day");

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchAnalytics();
  }, [timeRange, groupBy, user, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      const response = await APIService.getAdminAnalytics({
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        groupBy,
      });
      setAnalytics(response.data);
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="day">By Day</option>
            <option value="month">By Month</option>
          </select>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Calls Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Calls Over Time</h2>
            <div className="space-y-2">
              {analytics.callsOverTime?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{item._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {item.count} calls
                    </span>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(
                                ...analytics.callsOverTime.map(
                                  (i: any) => i.count
                                )
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">New Users Over Time</h2>
            <div className="space-y-2">
              {analytics.usersOverTime?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{item._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {item.count} users
                    </span>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(
                                ...analytics.usersOverTime.map(
                                  (i: any) => i.count
                                ),
                                1
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              AI Suggestions Over Time
            </h2>
            <div className="space-y-2">
              {analytics.suggestionsOverTime?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{item._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {item.total} total, {item.used} used
                    </span>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (item.total /
                              Math.max(
                                ...analytics.suggestionsOverTime.map(
                                  (i: any) => i.total
                                ),
                                1
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;

