// src/components/admin/UsersTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Shield,
  ShieldOff,
  ShieldAlert,
  Eye,
  Calendar,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { adminService } from "../../services";
import { AdminUser, AdminUserListParams, AdminUserActionRequest } from "../../types/admin";
import ConfirmModal from "./ConfirmModal";
import BaseModal from "../modals/BaseModal";
import Button from "../ui/Button";

interface ConfirmState {
  isOpen: boolean;
  type: "ban" | "suspend" | "activate" | null;
  userId: number | null;
}

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    type: null,
    userId: null,
  });

  const [filters, setFilters] = useState<AdminUserListParams>({
    page: 1,
    page_size: 20,
    ordering: "-created_at",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUsers(filters);
      setUsers(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / (filters.page_size || 20)));
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: tempSearch || undefined,
      page: 1,
    }));
    setSearchQuery(tempSearch);
  };

  const handleFilterChange = (key: keyof AdminUserListParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const performAction = async (
    userId: number,
    action: AdminUserActionRequest["action"],
    reason?: string
  ) => {
    try {
      setActionLoading(userId);
      await adminService.performUserAction(userId, { action, reason });
      await fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      setConfirmState({ isOpen: false, type: null, userId: null });
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmModal = (type: ConfirmState["type"], userId: number) => {
    setConfirmState({ isOpen: true, type, userId });
  };

  const handleConfirm = (reason?: string) => {
    if (confirmState.userId && confirmState.type) {
      performAction(confirmState.userId, confirmState.type, reason);
    }
  };

  const getConfirmConfig = () => {
    switch (confirmState.type) {
      case "ban":
        return {
          title: "Ban User",
          message:
            "Are you sure you want to ban this user? They will not be able to access the platform.",
          confirmText: "Ban User",
          type: "danger" as const,
          requireReason: true,
        };
      case "suspend":
        return {
          title: "Suspend User",
          message: "Are you sure you want to suspend this user? They can be reactivated later.",
          confirmText: "Suspend",
          type: "warning" as const,
          requireReason: true,
        };
      case "activate":
        return {
          title: "Activate User",
          message: "Are you sure you want to activate this user? They will regain full access.",
          confirmText: "Activate",
          type: "success" as const,
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to perform this action?",
          confirmText: "Confirm",
          type: "warning" as const,
        };
    }
  };

  const handleBan = (userId: number) => openConfirmModal("ban", userId);
  const handleSuspend = (userId: number) => openConfirmModal("suspend", userId);
  const handleActivate = (userId: number) => openConfirmModal("activate", userId);

  const getStatusBadge = (status: AdminUser["status_display"]) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-yellow-100 text-yellow-800",
      banned: "bg-red-100 text-red-800",
    };

    const icons = {
      active: CheckCircle,
      suspended: ShieldAlert,
      banned: XCircle,
    };

    const Icon = icons[status];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600 mt-1">{totalCount} total users found</p>
          </div>
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">{totalCount} total users found</p>
        </div>
        <button
          onClick={() => fetchUsers()}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={tempSearch}
                  onChange={e => setTempSearch(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search by email or name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || "all"}
              onChange={e =>
                handleFilterChange("status", e.target.value === "all" ? undefined : e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Status</label>
            <select
              value={
                filters.email_verified === true
                  ? "verified"
                  : filters.email_verified === false
                    ? "unverified"
                    : "all"
              }
              onChange={e => {
                const value =
                  e.target.value === "verified"
                    ? true
                    : e.target.value === "unverified"
                      ? false
                      : undefined;
                handleFilterChange("email_verified", value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ads Posted</label>
            <select
              value={filters.has_ads === true ? "yes" : "all"}
              onChange={e =>
                handleFilterChange("has_ads", e.target.value === "yes" ? true : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Users</option>
              <option value="yes">With Ads</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.ordering || "-created_at"}
              onChange={e => handleFilterChange("ordering", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="email">Email A-Z</option>
              <option value="-email">Email Z-A</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ page: 1, page_size: 20, ordering: "-created_at" });
                setTempSearch("");
                setSearchQuery("");
              }}
              className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => fetchUsers()}
              className="ml-4 text-red-600 hover:text-red-700 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No users found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">
                        {(currentPage - 1) * (filters.page_size || 20) + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="font-medium text-gray-900 hover:text-orange-600"
                          >
                            {user.full_name}
                          </button>
                          <div className="flex items-center space-x-2 mt-0.5 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{user.email}</span>
                            {user.email_verified && (
                              <CheckCircle
                                className="h-3 w-3 text-green-600"
                                // title="Email Verified"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="font-medium text-gray-900">{user.total_ads}</span>
                          <span className="text-gray-500 ml-1">total</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="text-green-600">{user.active_ads} active</span>
                          {user.pending_ads > 0 && (
                            <span className="text-yellow-600">{user.pending_ads} pending</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.status_display)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>
                          {user.days_since_joined === 0
                            ? "Today"
                            : user.days_since_joined === 1
                              ? "Yesterday"
                              : `${user.days_since_joined} days ago`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.status_display === "active" && (
                          <>
                            <button
                              onClick={() => handleSuspend(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors disabled:opacity-50"
                              title="Suspend"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBan(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                              title="Ban"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(user.status_display === "suspended" ||
                          user.status_display === "banned") && (
                          <button
                            onClick={() => handleActivate(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors disabled:opacity-50"
                            title="Activate"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * (filters.page_size || 20) + 1} to{" "}
                  {Math.min(currentPage * (filters.page_size || 20), totalCount)} of {totalCount}{" "}
                  results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-orange-500 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onBan={() => handleBan(selectedUser.id)}
          onSuspend={() => handleSuspend(selectedUser.id)}
          onActivate={() => handleActivate(selectedUser.id)}
          actionLoading={actionLoading === selectedUser.id}
        />
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, type: null, userId: null })}
        onConfirm={handleConfirm}
        loading={actionLoading !== null}
        {...getConfirmConfig()}
      />
    </div>
  );
};

interface UserDetailsModalProps {
  user: AdminUser;
  onClose: () => void;
  onBan: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  actionLoading: boolean;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onBan,
  onSuspend,
  onActivate,
  actionLoading,
}) => {
  return (
    <BaseModal isOpen={true} onClose={onClose} maxWidth="max-w-2xl" title="User Details">
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{user.full_name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  user.status_display === "active"
                    ? "bg-green-100 text-green-800"
                    : user.status_display === "suspended"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {user.status_display.charAt(0).toUpperCase() + user.status_display.slice(1)}
              </span>
              {user.email_verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-sm font-semibold text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-sm font-semibold text-gray-900">{user.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Login</p>
            <p className="text-sm font-semibold text-gray-900">
              {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Ad Statistics</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{user.total_ads}</p>
              <p className="text-xs text-gray-600 mt-1">Total Ads</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{user.active_ads}</p>
              <p className="text-xs text-gray-600 mt-1">Active</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{user.pending_ads}</p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{user.featured_ads}</p>
              <p className="text-xs text-gray-600 mt-1">Featured</p>
            </div>
          </div>
        </div>

        {user.suspension_reason && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Suspension Reason</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">{user.suspension_reason}</p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Account ID:</span>
              <span className="font-medium text-gray-900">#{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days Since Joined:</span>
              <span className="font-medium text-gray-900">{user.days_since_joined} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Status:</span>
              <span
                className={`font-medium ${user.email_verified ? "text-green-600" : "text-red-600"}`}
              >
                {user.email_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default UsersTab;
