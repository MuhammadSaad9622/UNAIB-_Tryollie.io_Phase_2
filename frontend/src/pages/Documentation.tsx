import React, { useState } from "react";
import {
  ArrowLeft,
  Book,
  Code,
  Play,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Zap,
  Users,
  Settings,
  BarChart,
  Plus,
  Trash2,
  HelpCircle,
  AlertTriangle,
  MessageCircle,
  Clock,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const Documentation: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: "user-guide",
      title: "User Guide & App Management",
      icon: Book,
      color: "text-indigo-600",
      content: [
        {
          title: "Adding the Tryollie App",
          description: "Step-by-step guide to install and configure the app in your Zoom account",
          link: "/docs/user-guide/adding-app",
        },
        {
          title: "Using the App Features",
          description: "Complete guide to all features including call analysis, recording, and insights",
          link: "/docs/user-guide/usage",
        },
        {
          title: "Removing the App",
          description: "How to safely remove the app from your Zoom account and data handling",
          link: "/docs/user-guide/removing-app",
        },
        {
          title: "Troubleshooting Guide",
          description: "Common issues and solutions for app installation and usage",
          link: "/docs/user-guide/troubleshooting",
        },
        {
          title: "Frequently Asked Questions",
          description: "Answers to common questions about authorization, features, and support",
          link: "/docs/user-guide/faq",
        },
        {
          title: "Contact Support",
          description: "Get help from our support team with multiple contact options",
          link: "/docs/user-guide/support",
        },
      ],
    },
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Play,
      color: "text-green-600",
      content: [
        {
          title: "Quick Setup Guide",
          description: "Get up and running with Tryollie in under 5 minutes",
          link: "/docs/quick-setup",
        },
        {
          title: "Account Configuration",
          description: "Configure your account settings and preferences",
          link: "/docs/account-setup",
        },
        {
          title: "First Conversation Analysis",
          description: "Learn how to analyze your first sales conversation",
          link: "/docs/first-analysis",
        },
      ],
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: Code,
      color: "text-blue-600",
      content: [
        {
          title: "Authentication",
          description: "Learn how to authenticate with our API",
          link: "/docs/api/auth",
        },
        {
          title: "Endpoints",
          description: "Complete list of available API endpoints",
          link: "/docs/api/endpoints",
        },
        {
          title: "Webhooks",
          description: "Set up webhooks for real-time notifications",
          link: "/docs/api/webhooks",
        },
        {
          title: "SDKs",
          description: "Official SDKs for popular programming languages",
          link: "/docs/api/sdks",
        },
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: Settings,
      color: "text-purple-600",
      content: [
        {
          title: "CRM Integration",
          description: "Connect with Salesforce, HubSpot, Pipedrive, and more",
          link: "/docs/integrations/crm",
        },
        {
          title: "Calendar Integration",
          description:
            "Sync with Google Calendar, Outlook, and other calendar apps",
          link: "/docs/integrations/calendar",
        },
        {
          title: "Communication Tools",
          description: "Integrate with Zoom, Teams, Slack, and other tools",
          link: "/docs/integrations/communication",
        },
      ],
    },
    {
      id: "ai-features",
      title: "AI Features",
      icon: Zap,
      color: "text-cyan-600",
      content: [
        {
          title: "Conversation Analysis",
          description: "Understanding AI-powered conversation insights",
          link: "/docs/ai/analysis",
        },
        {
          title: "Sentiment Detection",
          description: "How our AI detects customer sentiment and emotions",
          link: "/docs/ai/sentiment",
        },
        {
          title: "Action Items",
          description: "Automated action item extraction and follow-up",
          link: "/docs/ai/action-items",
        },
        {
          title: "Custom Models",
          description: "Train custom AI models for your specific use case",
          link: "/docs/ai/custom-models",
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      icon: BarChart,
      color: "text-orange-600",
      content: [
        {
          title: "Dashboard Overview",
          description: "Understanding your analytics dashboard",
          link: "/docs/analytics/dashboard",
        },
        {
          title: "Custom Reports",
          description: "Create custom reports and insights",
          link: "/docs/analytics/reports",
        },
        {
          title: "Data Export",
          description: "Export your data for external analysis",
          link: "/docs/analytics/export",
        },
      ],
    },
    {
      id: "team-management",
      title: "Team Management",
      icon: Users,
      color: "text-pink-600",
      content: [
        {
          title: "User Roles",
          description: "Understanding different user roles and permissions",
          link: "/docs/team/roles",
        },
        {
          title: "Team Setup",
          description: "Setting up and managing your team",
          link: "/docs/team/setup",
        },
        {
          title: "Sharing & Collaboration",
          description: "Share insights and collaborate with your team",
          link: "/docs/team/collaboration",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 mt-10">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-cyan-600 transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>

          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Documentation
              </h1>
              <p className="text-gray-600 mt-2">
                Complete guide to using Tryollie
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Quick Start
          </h2>
          <p className="text-gray-700 mb-6">
            New to Tryollie? Start here to get up and running quickly with
            our AI-powered sales intelligence platform.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/docs/quick-setup"
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Setup</h3>
                  <p className="text-sm text-gray-600">5-minute setup guide</p>
                </div>
              </div>
            </Link>

            <Link
              to="/docs/first-analysis"
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    First Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Analyze your first call
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/docs/api/endpoints"
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                  <Code className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">API Reference</h3>
                  <p className="text-sm text-gray-600">Complete API docs</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* User Documentation Section */}
        <div className="mb-12 bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Adding the App */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Adding the App</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-green-100">
                  <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Step-by-Step Installation
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                      <span className="leading-relaxed">Log in to your Zoom account and navigate to the <strong className="text-gray-900">Zoom App Marketplace</strong></span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                      <span className="leading-relaxed">Search for <strong className="text-gray-900">"Tryollie"</strong> in the marketplace</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                      <span className="leading-relaxed">Click on the <strong className="text-gray-900">Tryollie app</strong> from the search results</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                      <span className="leading-relaxed">Click <strong className="text-gray-900">"Install"</strong> or <strong className="text-gray-900">"Add to Zoom"</strong> button</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                      <span className="leading-relaxed">Review and accept the required permissions</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">6</span>
                      <span className="leading-relaxed">Complete the authorization process</span>
                    </li>
                  </ol>
                </div>
                <Link
                  to="/docs/user-guide/troubleshooting"
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  View Troubleshooting Guide
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Usage Guide */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Usage Guide</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-blue-100">
                  <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Features &amp; Use Cases
                  </h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-300 pl-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-sm">Real-time Call Analysis</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">Automatically analyzes conversations during Zoom meetings and provides sentiment insights.</p>
                    </div>
                    <div className="border-l-4 border-indigo-300 pl-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-sm">Meeting Recordings</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">Access and analyze recorded meetings with AI-powered transcription.</p>
                    </div>
                    <div className="border-l-4 border-purple-300 pl-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-sm">Action Item Extraction</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">Identifies and tracks action items and follow-ups from meetings.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50/80 border-2 border-blue-200 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Prerequisites
                  </h5>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      Cloud recording enabled in Zoom settings
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      Microphone permissions granted
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      Active Tryollie subscription
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Removing the App */}
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Removing the App</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-red-100">
                  <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Removal Instructions
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                      <span className="leading-relaxed">Log in to your Zoom account and navigate to the <strong className="text-gray-900">Zoom App Marketplace</strong></span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                      <span className="leading-relaxed">Click <strong className="text-gray-900">Manage &gt;&gt; Added Apps</strong> or search for the "Tryollie" app</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                      <span className="leading-relaxed">Select the <strong className="text-gray-900">"Tryollie"</strong> app</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                      <span className="leading-relaxed">Click <strong className="text-gray-900">"Remove"</strong></span>
                    </li>
                  </ol>
                </div>
                <div className="bg-red-50/80 border-2 border-red-200 rounded-xl p-4">
                  <h5 className="font-semibold text-red-900 mb-3 flex items-center text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Implications &amp; Data Handling
                  </h5>
                  <div className="space-y-3 text-red-800 text-sm">
                    <div>
                      <h6 className="font-medium mb-1">Potential implications of removal:</h6>
                      <ul className="space-y-1 ml-3">
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1.5"></span>
                          <span>Loss of access to all analytics and insights</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1.5"></span>
                          <span>No future meeting analysis or recording processing</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-1.5"></span>
                          <span>Existing integrations will be disconnected</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium mb-1">How user data is handled after removal:</h6>
                      <p className="leading-relaxed">Meeting data and analytics are retained for 30 days for account recovery, then permanently deleted.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Troubleshooting</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-amber-100">
                  <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Common Issues &amp; Solutions
                  </h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-amber-300 pl-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-sm">Adding the app</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">Ensure you have admin permissions and a compatible Zoom account type.</p>
                    </div>
                    <div className="border-l-4 border-yellow-300 pl-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-sm">Scheduling meetings</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">Check calendar integration settings and ensure proper permissions are granted.</p>
                    </div>
                    <div className="border-l-4 border-orange-300 pl-3">
                      <h5 className="font-semibold text-gray-900 mb-1 text-sm">Accessing recordings</h5>
                      <p className="text-gray-700 leading-relaxed text-sm">Verify cloud recording is enabled and the meeting was recorded successfully.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid lg:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-300 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center`}
                  >
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {section.content.length} articles
                    </p>
                  </div>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections[section.id] && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-4">
                    {section.content.map((item, index) => (
                      <Link
                        key={index}
                        to={item.link}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors duration-300">
                              {item.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {item.description}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors duration-300 ml-2" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resources */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 Additional Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Download SDKs
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get our official SDKs for Python, Node.js, and more
              </p>
              <Link
                to="/docs/sdks"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Download →
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">API Explorer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Interactive API documentation and testing tool
              </p>
              <Link
                to="/docs/api-explorer"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Try it out →
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Book className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Best Practices
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn how to get the most out of Tryollie
              </p>
              <Link
                to="/docs/best-practices"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Read guide →
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-sm text-gray-600 mb-4">
                Join our developer community and get help
              </p>
              <Link
                to="/community"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Join now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
