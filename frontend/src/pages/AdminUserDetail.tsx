import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import APIService from "../lib/api";

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changingSubscription, setChangingSubscription] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    if (id) {
      fetchUserData();
    }
  }, [id, user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAdminUser(id!);
      setUserData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSubscription = async (plan: string) => {
    if (!id) return;
    if (!confirm(`Change user subscription to ${plan.toUpperCase()} plan?`)) {
      return;
    }

    try {
      setChangingSubscription(true);
      await APIService.updateUserSubscription(id, plan);
      showToast(`User subscription changed to ${plan.toUpperCase()} plan`, "success");
      fetchUserData(); // Refresh user data
    } catch (error: any) {
      console.error("Error changing subscription:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to change subscription";
      showToast(errorMessage, "error");
    } finally {
      setChangingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading user details...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{userData.user.name}</h1>
          <p className="text-gray-600">{userData.user.email}</p>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Users
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Role</div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  userData.user.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {userData.user.role}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Department</div>
              <div className="capitalize">
                {userData.user.department?.replace("_", " ") || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  userData.user.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {userData.user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Joined</div>
              <div>
                {new Date(userData.user.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Last Login</div>
              <div>
                {userData.user.lastLogin
                  ? new Date(userData.user.lastLogin).toLocaleDateString()
                  : "Never"}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          {userData.subscription ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Plan</div>
                <div className="flex items-center gap-2">
                  <div className="capitalize font-medium">
                    {userData.subscription.plan}
                  </div>
                  <select
                    value={userData.subscription.plan || "free"}
                    onChange={(e) => handleChangeSubscription(e.target.value)}
                    disabled={changingSubscription}
                    className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change subscription tier"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                  {changingSubscription && (
                    <span className="text-xs text-gray-500">Updating...</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    userData.subscription.status === "active" ||
                    userData.subscription.status === "trialing"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {userData.subscription.status}
                </span>
              </div>
              {userData.subscription.callLimit && (
                <div>
                  <div className="text-sm text-gray-600">Call Limit</div>
                  <div className="font-medium">
                    {userData.subscription.callsUsed || 0} / {userData.subscription.callLimit} calls
                  </div>
                </div>
              )}
              {userData.subscription.currentPeriodEnd && (
                <div>
                  <div className="text-sm text-gray-600">Renews</div>
                  <div>
                    {new Date(
                      userData.subscription.currentPeriodEnd
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
              <button
                onClick={() =>
                  navigate(`/admin/subscriptions?userId=${userData.user._id}`)
                }
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Subscription Details →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-gray-400">No subscription</div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Assign Plan</div>
                <select
                  value="free"
                  onChange={(e) => handleChangeSubscription(e.target.value)}
                  disabled={changingSubscription}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="free">Free (5 calls)</option>
                  <option value="basic">Basic (15 calls)</option>
                  <option value="standard">Standard (25 calls)</option>
                  <option value="premium">Premium (50 calls)</option>
                </select>
                {changingSubscription && (
                  <span className="text-xs text-gray-500 mt-1 block">Creating subscription...</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call Stats */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Call Statistics</h2>
          {userData.callStats ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Total Calls</div>
                <div className="text-2xl font-bold">
                  {userData.callStats.totalCalls || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-xl font-semibold text-green-600">
                  {userData.callStats.completedCalls || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Duration</div>
                <div>
                  {userData.callStats.averageDuration
                    ? Math.round(userData.callStats.averageDuration / 60) + "m"
                    : "0m"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Score</div>
                <div className="text-xl font-semibold">
                  {userData.callStats.averageScore
                    ? Math.round(userData.callStats.averageScore)
                    : "N/A"}{" "}
                  / 100
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No call data</div>
          )}
        </div>
      </div>

      {/* AI Suggestions Stats */}
      {userData.suggestionStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">AI Suggestions Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Suggestions</div>
              <div className="text-2xl font-bold">
                {userData.suggestionStats.totalSuggestions || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Used</div>
              <div className="text-2xl font-bold text-green-600">
                {userData.suggestionStats.usedSuggestions || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Usage Rate</div>
              <div className="text-2xl font-bold text-blue-600">
                {userData.suggestionStats.usageRate
                  ? Math.round(userData.suggestionStats.usageRate * 100)
                  : 0}
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
              <div className="text-2xl font-bold">
                {userData.suggestionStats.averageConfidence
                  ? Math.round(
                      userData.suggestionStats.averageConfidence * 100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;

