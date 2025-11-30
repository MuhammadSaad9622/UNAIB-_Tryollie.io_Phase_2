import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { CallPage } from "./pages/CallPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminMeetings from "./pages/AdminMeetings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAISuggestions from "./pages/AdminAISuggestions";
import AdminBilling from "./pages/AdminBilling";
import AdminUserDetail from "./pages/AdminUserDetail";
import BillingPage from "./pages/BillingPage";
import AdminInvoices from "./pages/AdminInvoices";
import InvoicesPage from "./pages/InvoicesPage";

import { CallLog } from "./pages/CallLog";
import { PopupPage } from "./pages/PopupPage";

// Landing page components
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import Features from "./components/Features";
import AIFeaturesShowcase from "./components/AIFeaturesShowcase";
import HowItWorks from "./components/HowItWorks";
import UseCases from "./components/UseCases";
import Testimonials from "./components/Testimonials";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import ComingSoon from "./components/ComingSoon";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Support from "./pages/Support";
import Documentation from "./pages/Documentation";
import ContactUs from "./pages/ContactUs";

// Home page component for non-authenticated users
const HomePage: React.FC = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleGetDemo = () => {
    setShowComingSoon(true);
  };

  const handleLogin = () => {
    // Navigate to sign in instead of showing coming soon
    window.location.href = "/signin";
  };

  const handleStartTrial = () => {
    setShowComingSoon(true);
  };

  const handleGetStarted = () => {
    setShowComingSoon(true);
  };

  const handleBackToHome = () => {
    setShowComingSoon(false);
  };

  if (showComingSoon) {
    return <ComingSoon onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onLogin={handleLogin} />
      <Hero onGetDemo={handleLogin} />
      <TrustedBy />
      <Features />
      <AIFeaturesShowcase onGetStarted={handleLogin} />
      <HowItWorks onStartTrial={handleLogin} />
      <UseCases />
      <Testimonials />
      <CallToAction onGetDemo={handleLogin} onStartTrial={handleLogin} />
      <Footer />
    </div>
  );
};

// Layout component for marketing pages with navigation and footer
const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
};

// Layout component for authenticated users
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Tryollie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

// Main routing component
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Tryollie...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public marketing routes */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/signin"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <SignInPage />
          )
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <MarketingLayout>
            <PrivacyPolicy />
          </MarketingLayout>
        }
      />
      <Route
        path="/terms-of-use"
        element={
          <MarketingLayout>
            <TermsOfUse />
          </MarketingLayout>
        }
      />
      <Route
        path="/support"
        element={
          <MarketingLayout>
            <Support />
          </MarketingLayout>
        }
      />
      <Route
        path="/documentation"
        element={
          <MarketingLayout>
            <Documentation />
          </MarketingLayout>
        }
      />
      <Route
        path="/contact-us"
        element={
          <MarketingLayout>
            <ContactUs />
          </MarketingLayout>
        }
      />

      {/* Auth routes */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected app routes */}
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/call"
        element={
          <AppLayout>
            <CallPage />
          </AppLayout>
        }
      />
      <Route
        path="/call/:id"
        element={
          <AppLayout>
            <CallPage />
          </AppLayout>
        }
      />
      <Route
        path="/calls/new"
        element={
          <AppLayout>
            <CallPage />
          </AppLayout>
        }
      />
      <Route
        path="/calls/:callId"
        element={
          <AppLayout>
            <CallPage />
          </AppLayout>
        }
      />
      <Route
        path="/call/log/:id"
        element={
          <AppLayout>
            <CallLog />
          </AppLayout>
        }
      />
      <Route
        path="/documents"
        element={
          <AppLayout>
            <DocumentsPage />
          </AppLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppLayout>
            <AnalyticsPage />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        }
      />
      <Route
        path="/billing"
        element={
          <AppLayout>
            <BillingPage />
          </AppLayout>
        }
      />
      <Route
        path="/invoices"
        element={
          <AppLayout>
            <InvoicesPage />
          </AppLayout>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AppLayout>
            <AdminUsers />
          </AppLayout>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <AppLayout>
            <AdminUserDetail />
          </AppLayout>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <AppLayout>
            <AdminSubscriptions />
          </AppLayout>
        }
      />
      <Route
        path="/admin/meetings"
        element={
          <AppLayout>
            <AdminMeetings />
          </AppLayout>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AppLayout>
            <AdminAnalytics />
          </AppLayout>
        }
      />
      <Route
        path="/admin/ai-suggestions"
        element={
          <AppLayout>
            <AdminAISuggestions />
          </AppLayout>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <AppLayout>
            <AdminBilling />
          </AppLayout>
        }
      />
      <Route
        path="/admin/invoices"
        element={
          <AppLayout>
            <AdminInvoices />
          </AppLayout>
        }
      />

      {/* Popup route - no layout wrapper */}
      <Route path="/popup/:callId" element={<PopupPage />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
