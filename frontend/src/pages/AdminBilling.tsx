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
  cancelledAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

const AdminBilling: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ plan: "", status: "" });
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

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
      const response = await APIService.getAdminSubscriptions(params);
      setSubscriptions(response.data.subscriptions);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    if (subscription._id) {
      try {
        const response = await APIService.getSubscriptionDetails(subscription._id);
        setSubscriptionDetails(response.data);
      } catch (err: any) {
        console.error("Failed to fetch subscription details:", err);
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    try {
      await APIService.cancelSubscription(id);
      fetchSubscriptions();
      setSelectedSubscription(null);
      setSubscriptionDetails(null);
    } catch (err: any) {
      alert("Failed to cancel subscription: " + err.message);
    }
  };

  const getPlanPrice = (plan: string) => {
    const prices: Record<string, string> = {
      free: "$0",
      starter: "$29",
      professional: "$79",
      enterprise: "$199",
    };
    return prices[plan] || "N/A";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing Management</h1>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriptions List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
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
                        Next Billing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr
                        key={sub._id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedSubscription?._id === sub._id
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => handleViewDetails(sub)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium">{sub.user.name}</div>
                            <div className="text-sm text-gray-500">
                              {sub.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="capitalize font-medium">
                              {sub.plan}
                            </span>
                            <div className="text-sm text-gray-500">
                              {getPlanPrice(sub.plan)}/mo
                            </div>
                          </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(sub._id);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

        {/* Subscription Details Sidebar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
          {selectedSubscription && subscriptionDetails ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">User</div>
                <div className="font-medium">{selectedSubscription.user.name}</div>
                <div className="text-sm text-gray-500">
                  {selectedSubscription.user.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Plan</div>
                <div className="font-medium capitalize">
                  {selectedSubscription.plan}
                </div>
                <div className="text-sm text-gray-500">
                  {getPlanPrice(selectedSubscription.plan)}/month
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    selectedSubscription.status === "active" ||
                    selectedSubscription.status === "trialing"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedSubscription.status}
                </span>
              </div>
              {selectedSubscription.currentPeriodStart && (
                <div>
                  <div className="text-sm text-gray-600">Current Period</div>
                  <div className="text-sm">
                    {new Date(
                      selectedSubscription.currentPeriodStart
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {selectedSubscription.currentPeriodEnd
                      ? new Date(
                          selectedSubscription.currentPeriodEnd
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              )}
              {subscriptionDetails.stripe && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Stripe Info</div>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-gray-600">Subscription ID:</span>
                      <div className="font-mono text-xs break-all">
                        {subscriptionDetails.stripe.id.substring(0, 20)}...
                      </div>
                    </div>
                    {subscriptionDetails.stripe.price && (
                      <div>
                        <span className="text-gray-600">Price:</span>{" "}
                        {subscriptionDetails.stripe.price.currency?.toUpperCase()}{" "}
                        ${(subscriptionDetails.stripe.price.unit_amount / 100).toFixed(2)}/
                        {subscriptionDetails.stripe.price.recurring?.interval}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Select a subscription to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;

