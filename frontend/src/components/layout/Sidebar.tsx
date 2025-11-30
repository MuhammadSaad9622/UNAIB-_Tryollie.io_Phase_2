import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Phone,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Bot,
  User,
  Shield,
  CreditCard,
  Receipt,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Active Call", href: "/call", icon: Phone },
  { name: "Knowledge Base", href: "/documents", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile, signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Check if we're on any call page (including dynamic routes)
  const isOnCallPage = location.pathname.startsWith("/call");

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-700">
        <Bot className="h-8 w-8 text-primary-500" />
        <span className="ml-2 text-xl font-bold">Tryollie</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {user?.role === "admin" ? (
          /* Admin Navigation Only */
          <>
            <Link to="/admin/dashboard">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname === "/admin/dashboard"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </motion.div>
            </Link>
            <Link to="/admin/users">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/users")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <User className="h-5 w-5 mr-3" />
                Users
              </motion.div>
            </Link>
            <Link to="/admin/meetings">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/meetings")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Phone className="h-5 w-5 mr-3" />
                Meetings
              </motion.div>
            </Link>
            <Link to="/admin/ai-suggestions">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/ai-suggestions")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Bot className="h-5 w-5 mr-3" />
                AI Usage
              </motion.div>
            </Link>
            <Link to="/admin/billing">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/billing")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Billing
              </motion.div>
            </Link>
            <Link to="/admin/analytics">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/analytics")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Analytics
              </motion.div>
            </Link>
            <Link to="/admin/subscriptions">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/subscriptions")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Shield className="h-5 w-5 mr-3" />
                Subscriptions
              </motion.div>
            </Link>
            <Link to="/admin/invoices">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname.startsWith("/admin/invoices")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <FileText className="h-5 w-5 mr-3" />
                Invoices
              </motion.div>
            </Link>
            <Link to="/settings">
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    location.pathname === "/settings"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </motion.div>
            </Link>
          </>
        ) : (
          /* Regular User Navigation */
          <>
            {navigation.map((item) => {
              // Special handling for Active Call to highlight when on any call page
              const isActive =
                item.name === "Active Call"
                  ? isOnCallPage
                  : location.pathname === item.href;

              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center px-4 py-2">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{profile?.name || "User"}</p>
            <p className="text-xs text-gray-400">
              {profile?.department || "Sales"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
