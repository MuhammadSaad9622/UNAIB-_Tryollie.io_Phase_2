import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import APIService from "../lib/api";
import { Plus, Send, Check, X, Eye, Download, Search, Filter } from "lucide-react";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

const AdminInvoices: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);

  // Plan prices
  const planPrices = {
    basic: 10,
    standard: 20,
    premium: 30,
  };

  // Create invoice form state
  const [formData, setFormData] = useState({
    userId: "",
    currency: "usd",
    dueDate: "",
    selectedPlan: "", // basic, standard, or premium
    notes: "",
  });

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
    fetchStats();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await APIService.getInvoices();
      setInvoices(response.data || []);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      showToast("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all users (set a high limit to get all users)
      const response = await APIService.getAdminUsers({ limit: 1000 });
      console.log("Users response:", response); // Debug log
      
      // Handle different response structures
      if (response?.data?.users) {
        setUsers(response.data.users);
      } else if (response?.users) {
        setUsers(response.users);
      } else if (Array.isArray(response?.data)) {
        setUsers(response.data);
      } else if (response?.success && response?.data) {
        // Try to get users from data object
        const users = response.data.users || response.data || [];
        setUsers(Array.isArray(users) ? users : []);
      } else {
        console.warn("Unexpected users response structure:", response);
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data || error.message);
      showToast(
        error.response?.data?.message || "Failed to load users. Please refresh the page.",
        "error"
      );
    }
  };

  const fetchStats = async () => {
    try {
      const response = await APIService.getInvoiceStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.selectedPlan) {
        showToast("Please select a plan", "error");
        return;
      }

      const planName = formData.selectedPlan.charAt(0).toUpperCase() + formData.selectedPlan.slice(1);
      const price = planPrices[formData.selectedPlan as keyof typeof planPrices];
      const amount = price; // Amount equals the plan price

      const items = [
        {
          description: `${planName} Plan Subscription`,
          quantity: 1,
          price: price,
          total: price,
        },
      ];

      await APIService.createInvoice({
        userId: formData.userId,
        amount: amount,
        currency: formData.currency,
        dueDate: formData.dueDate,
        items,
        notes: formData.notes,
      });

      showToast("Invoice created successfully", "success");
      setShowCreateModal(false);
      setFormData({
        userId: "",
        currency: "usd",
        dueDate: "",
        selectedPlan: "",
        notes: "",
      });
      fetchInvoices();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create invoice";
      showToast(errorMessage, "error");
    }
  };

  const handleSendInvoice = async (id: string) => {
    if (!confirm("Send this invoice to the user?")) return;
    try {
      await APIService.sendInvoice(id);
      showToast("Invoice sent successfully", "success");
      fetchInvoices();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to send invoice";
      showToast(errorMessage, "error");
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm("Mark this invoice as paid?")) return;
    try {
      await APIService.markInvoicePaid(id);
      showToast("Invoice marked as paid", "success");
      fetchInvoices();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update invoice";
      showToast(errorMessage, "error");
    }
  };

  const handleCancelInvoice = async (id: string) => {
    if (!confirm("Cancel this invoice?")) return;
    try {
      await APIService.cancelInvoice(id);
      showToast("Invoice cancelled", "success");
      fetchInvoices();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to cancel invoice";
      showToast(errorMessage, "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="mt-2 text-gray-600">Create, send, and manage invoices</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Paid</p>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Unpaid</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.unpaid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by invoice number, user name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{invoice.user?.name}</div>
                        <div className="text-xs text-gray-400">{invoice.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {invoice.status === "draft" && (
                          <button
                            onClick={() => handleSendInvoice(invoice._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Send Invoice"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <button
                            onClick={() => handleMarkPaid(invoice._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Paid"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancelInvoice(invoice._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Invoice"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User *
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan *
                </label>
                <select
                  required
                  value={formData.selectedPlan}
                  onChange={(e) => {
                    const selectedPlan = e.target.value;
                    setFormData({ ...formData, selectedPlan });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a plan</option>
                  <option value="basic">Basic - $10/month</option>
                  <option value="standard">Standard - $20/month</option>
                  <option value="premium">Premium - $30/month</option>
                </select>
                {formData.selectedPlan && (
                  <p className="mt-2 text-sm text-gray-600">
                    Amount: ${planPrices[formData.selectedPlan as keyof typeof planPrices]} {formData.currency.toUpperCase()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Invoice Details</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-lg font-semibold">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User</p>
                <p className="text-lg">{selectedInvoice.user?.name}</p>
                <p className="text-sm text-gray-500">{selectedInvoice.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-lg font-semibold">
                  ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </p>
              </div>
              {selectedInvoice.paidDate && (
                <div>
                  <p className="text-sm text-gray-600">Paid Date</p>
                  <p className="text-lg">
                    {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2">Items</p>
                <div className="border rounded-lg p-4">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;

