import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Phone,
  Brain,
  CreditCard,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import APIService from "../lib/api";

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalCalls: number;
    completedCalls: number;
    totalSuggestions: number;
    usedSuggestions: number;
    suggestionUsageRate: number;
  };
  subscriptions: {
    byPlan: Array<{ _id: string; count: number; active: number }>;
    total: number;
    active: number;
    inactive: number;
  };
  callsByStatus: Record<string, number>;
  usersByDepartment: Record<string, number>;
  recentActivity: {
    recentCalls: number;
    recentSuggestions: number;
    newUsersThisWeek: number;
  };
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    lastLogin?: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await APIService.getAdminDashboardStats();
      console.log("Dashboard stats response:", response);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.response?.data?.message || err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md"
        >
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchStats}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm text-gray-500 text-center"
        >
          <p>Check browser console for more details.</p>
          <p>Make sure the backend server is running and you're authenticated.</p>
        </motion.div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Centralized view of all platform activity and analytics
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Activity className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Live Status</span>
        </div>
      </motion.div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/admin/users")}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.overview.totalUsers.toLocaleString()}</div>
          <div className="text-xs text-primary-600 font-medium">Manage all users →</div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/admin/meetings")}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
              <Phone className="h-6 w-6" />
            </div>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Total Meetings</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.overview.totalCalls.toLocaleString()}</div>
          <div className="text-xs text-primary-600 font-medium">View all meetings →</div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/admin/ai-suggestions")}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
              <Brain className="h-6 w-6" />
            </div>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">AI Suggestions</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.overview.totalSuggestions.toLocaleString()}</div>
          <div className="text-xs text-primary-600 font-medium">View AI usage →</div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate("/admin/billing")}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
              <CreditCard className="h-6 w-6" />
            </div>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Active Subscriptions</div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.subscriptions.active.toLocaleString()}</div>
          <div className="text-xs text-primary-600 font-medium">Manage billing →</div>
        </motion.button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.overview.totalUsers}
          subtitle={`${stats.overview.activeUsers} active`}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Total Calls"
          value={stats.overview.totalCalls}
          subtitle={`${stats.overview.completedCalls} completed`}
          icon={<Phone className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="AI Suggestions"
          value={stats.overview.totalSuggestions}
          subtitle={`${Math.round(stats.overview.suggestionUsageRate * 100)}% used`}
          icon={<Brain className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.subscriptions.active}
          subtitle={`${stats.subscriptions.total} total`}
          icon={<CreditCard className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Subscriptions by Plan</h2>
          </div>
          {stats.subscriptions.byPlan && stats.subscriptions.byPlan.length > 0 ? (
            <div className="space-y-3">
              {stats.subscriptions.byPlan.map((plan, index) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="capitalize font-medium text-gray-700">{plan._id || "free"}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      {plan.active}/{plan.count}
                    </span>
                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full shadow-sm"
                        style={{
                          width: `${plan.count > 0 ? (plan.active / plan.count) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No subscriptions found
            </div>
          )}
        </motion.div>

        {/* Users by Department */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Users by Department</h2>
          </div>
          {stats.usersByDepartment && Object.keys(stats.usersByDepartment).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.usersByDepartment).map(([dept, count], index) => (
                <motion.div
                  key={dept}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="capitalize font-medium text-gray-700">{dept.replace("_", " ")}</span>
                  <span className="font-bold text-lg text-gray-900">{count}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No department data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-green-100 text-green-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity (Last 7 Days)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">New Users</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {stats.recentActivity.newUsersThisWeek}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">New Calls</span>
            </div>
            <div className="text-3xl font-bold text-green-700">
              {stats.recentActivity.recentCalls}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">New Suggestions</span>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {stats.recentActivity.recentSuggestions}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            {[
              { icon: Users, label: "Manage All Users", path: "/admin/users", colorClass: "text-blue-600" },
              { icon: Phone, label: "View All Meetings", path: "/admin/meetings", colorClass: "text-green-600" },
              { icon: Brain, label: "Monitor AI Usage", path: "/admin/ai-suggestions", colorClass: "text-purple-600" },
              { icon: CreditCard, label: "Manage Billing", path: "/admin/billing", colorClass: "text-orange-600" },
              { icon: BarChart3, label: "View Analytics", path: "/admin/analytics", colorClass: "text-indigo-600" },
            ].map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => navigate(action.path)}
                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-lg transition-all duration-200 flex items-center gap-3 group"
              >
                <action.icon className={`h-5 w-5 ${action.colorClass} group-hover:scale-110 transition-transform`} />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-700">Active Users</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm"
                    style={{
                      width: `${
                        stats.overview.totalUsers > 0
                          ? (stats.overview.activeUsers /
                              stats.overview.totalUsers) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {stats.overview.activeUsers}/{stats.overview.totalUsers}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-700">Active Subscriptions</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full shadow-sm"
                    style={{
                      width: `${
                        stats.subscriptions.total > 0
                          ? (stats.subscriptions.active /
                              stats.subscriptions.total) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {stats.subscriptions.active}/{stats.subscriptions.total}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-700">AI Usage Rate</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                  {Math.round(stats.overview.suggestionUsageRate * 100)}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
        </div>
        {stats.recentUsers && stats.recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-900">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {user.lastLogin ? (
                        <span className="text-gray-600">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Never</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No users found in the database.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "indigo";
}> = ({ title, value, subtitle, icon, color = "blue" }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      gradient: "from-blue-50 to-blue-100/50",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      gradient: "from-green-50 to-green-100/50",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      gradient: "from-purple-50 to-purple-100/50",
      border: "border-purple-200",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      gradient: "from-orange-50 to-orange-100/50",
      border: "border-orange-200",
    },
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      gradient: "from-indigo-50 to-indigo-100/50",
      border: "border-indigo-200",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
        <div className={`p-4 rounded-xl ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;

