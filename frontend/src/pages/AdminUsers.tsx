import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import APIService from "../lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
    isActive: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [changingSubscription, setChangingSubscription] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [page, filters, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
        ...filters,
      };
      Object.keys(params).forEach(
        (key) => params[key] === "" && delete params[key]
      );
      console.log("Fetching users with params:", params);
      const response = await APIService.getAdminUsers(params);
      console.log("Users response:", response);
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        console.error("Invalid response format:", response);
        setUsers([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to fetch users: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleChangeSubscription = async (userId: string, plan: string) => {
    if (!confirm(`Change user subscription to ${plan.toUpperCase()} plan?`)) {
      return;
    }

    try {
      setChangingSubscription(userId);
      await APIService.updateUserSubscription(userId, plan);
      showToast(`User subscription changed to ${plan.toUpperCase()} plan`, "success");
      fetchUsers(); // Refresh users list
    } catch (error: any) {
      console.error("Error changing subscription:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to change subscription";
      showToast(errorMessage, "error");
    } finally {
      setChangingSubscription(null);
    }
  };

  const handleSave = async (updates: Partial<User>) => {
    if (!selectedUser) return;
    try {
      await APIService.updateAdminUser(selectedUser._id, updates);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert("Failed to update user: " + err.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await APIService.deleteAdminUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await APIService.updateAdminUser(user._id, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err: any) {
      alert("Failed to update user: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Departments</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="customer_success">Customer Success</option>
            <option value="management">Management</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) =>
              setFilters({ ...filters, isActive: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.department?.replace("_", " ") || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.subscription ? (
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                user.subscription.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.subscription.plan} - {user.subscription.status}
                            </span>
                          ) : (
                            <span className="text-gray-400">No subscription</span>
                          )}
                          <select
                            value={user.subscription?.plan || "free"}
                            onChange={(e) => handleChangeSubscription(user._id, e.target.value)}
                            disabled={changingSubscription === user._id}
                            className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Change subscription tier"
                          >
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                          </select>
                          {changingSubscription === user._id && (
                            <span className="text-xs text-gray-500">Updating...</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No users found. Try adjusting your filters.
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

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
}> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="customer_success">Customer Success</option>
              <option value="management">Management</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <span>Active</span>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUsers;

