import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import APIService from "../lib/api";

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

const AdminSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ plan: "", status: "" });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchSubscriptions();
  }, [page, filters, user, navigate]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20, ...filters };
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );
      console.log("Fetching subscriptions with params:", params);
      const response = await APIService.getAdminSubscriptions(params);
      console.log("Subscriptions response:", response);
      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setSubscriptions([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch subscriptions:", err);
      console.error("Error details:", err.response?.data);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    try {
      await APIService.cancelSubscription(id);
      fetchSubscriptions();
    } catch (err: any) {
      alert("Failed to cancel subscription: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="cancelled">Cancelled</option>
            <option value="past_due">Past Due</option>
            <option value="trialing">Trialing</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
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
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((sub) => (
                    <tr key={sub._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{sub.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {sub.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {sub.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            sub.status === "active" || sub.status === "trialing"
                              ? "bg-green-100 text-green-800"
                              : sub.status === "past_due"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {sub.currentPeriodEnd
                          ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(sub.status === "active" ||
                          sub.status === "trialing") && (
                          <button
                            onClick={() => handleCancel(sub._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subscriptions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No subscriptions found. Try adjusting your filters.
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

export default AdminSubscriptions;

