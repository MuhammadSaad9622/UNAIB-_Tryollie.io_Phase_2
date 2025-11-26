import React from "react";
import {
  Bot,
  Smartphone,
  Phone,
  Upload,
  Play,
  Mic,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";

interface AIFeaturesShowcaseProps {
  onGetStarted?: () => void;
}

const AIFeaturesShowcase: React.FC<AIFeaturesShowcaseProps> = ({
  onGetStarted,
}) => {
  const features = [
    {
      title: "AI Teammate Bot",
      description:
        "Invite ai@aisales.com to live meetings for real-time transcription, insights, and follow-up automation.",
      visual: "meeting-interface",
      icon: Bot,
      color: "from-cyan-500 to-blue-600",
      overlay: {
        title: "Sales Demo",
        participants: "Sarah, +3",
        status: "AI ASSISTING",
        statusColor: "bg-purple-500",
      },
    },
    {
      title: "Mobile App",
      description:
        "Transcribe and analyze in-person conversations with AI-powered sales coaching on the go.",
      visual: "mobile-app",
      icon: Smartphone,
      color: "from-purple-500 to-pink-600",
      overlay: {
        title: "Client Meeting",
        participants: "Alex, +2",
        status: "RECORDING",
        statusColor: "bg-red-500",
      },
    },
    {
      title: "Dialers & API",
      description:
        "Integrate with Aircall, RingCentral, and other dialers for seamless call intelligence.",
      visual: "dialer-api",
      icon: Phone,
      color: "from-orange-500 to-red-600",
      overlay: {
        title: "Outbound Call",
        participants: "Prospect",
        status: "AI COACHING",
        statusColor: "bg-blue-500",
      },
    },
    {
      title: "Audio & Video Files",
      description:
        "Upload MP3, MP4, WAV files for AI-powered meeting analysis and insights.",
      visual: "file-upload",
      icon: Upload,
      color: "from-indigo-500 to-purple-600",
      overlay: {
        title: "Training Session",
        participants: "Team Meeting",
        status: "PROCESSING",
        statusColor: "bg-yellow-500",
      },
    },
  ];

  return (
    <section
      id="ai-features"
      className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full blur-3xl animate-air-cover"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-500/5 rounded-full blur-3xl animate-air-cover-delayed"></div>
      </div>

      {/* Fireflies */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-firefly${
              i < 2 ? "" : i < 4 ? "-delayed-1" : "-delayed-2"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1px)",
              boxShadow: "0 0 8px rgba(251, 191, 36, 0.6)",
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Bot className="w-8 h-8 text-cyan-500 animate-pulse" />
            <span className="text-cyan-600 font-medium text-lg">
              AI-Powered Features
            </span>
            <Zap className="w-8 h-8 text-purple-500 animate-pulse" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-gray-900">Transform Your Sales</span>
            <br />
            <span className="text-cyan-600">with AI Intelligence</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of sales with AI-powered meeting intelligence,
            real-time coaching, and automated insights that help your team close
            more deals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="space-y-6">
                {/* Feature Header */}
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Visual Mockup */}
                <div className="relative">
                  <div
                    className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 group-hover:border-cyan-300 transition-all duration-300 transform group-hover:scale-105`}
                  >
                    {/* Mockup Header */}
                    <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        Tryollie
                      </div>
                      <div className="w-6 h-6"></div>
                    </div>

                    {/* Mockup Content */}
                    <div className="p-6">
                      {feature.visual === "meeting-interface" && (
                        <div className="space-y-4">
                          {/* Video Call Interface */}
                          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <Users className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-white font-semibold text-lg mb-2">
                              {feature.overlay.participants}
                            </div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${feature.overlay.statusColor}`}
                            >
                              {feature.overlay.status}
                            </div>
                          </div>

                          {/* Meeting Info */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {feature.overlay.title}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Today, 2:00 PM</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Play className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="w-8 h-8 bg-green-100 rounded-lg rounded-lg flex items-center justify-center">
                                  <Mic className="w-4 h-4 text-green-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.visual === "mobile-app" && (
                        <div className="space-y-4">
                          {/* Mobile App Interface */}
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium text-gray-900">
                                AI Sales Coach
                              </div>
                              <div
                                className={`w-3 h-3 ${feature.overlay.statusColor} rounded-full animate-pulse`}
                              ></div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                  <Smartphone className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {feature.overlay.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {feature.overlay.participants}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Mic className="w-3 h-3 text-red-500" />
                                <span>Recording...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.visual === "dialer-api" && (
                        <div className="space-y-4">
                          {/* Dialer Interface */}
                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  Outbound Call
                                </div>
                                <div
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${feature.overlay.statusColor}`}
                                >
                                  {feature.overlay.status}
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-orange-200">
                              <div className="text-sm text-gray-600 mb-2">
                                Prospect: John Smith
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>00:45</span>
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                                <span>AI Coaching</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {feature.visual === "file-upload" && (
                        <div className="space-y-4">
                          {/* File Upload Interface */}
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  File Processing
                                </div>
                                <div
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${feature.overlay.statusColor}`}
                                >
                                  {feature.overlay.status}
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-indigo-200">
                              <div className="text-sm text-gray-600 mb-2">
                                {feature.overlay.title}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className="w-4 h-4 bg-indigo-100 rounded flex items-center justify-center">
                                  <span className="text-xs text-indigo-600">
                                    MP4
                                  </span>
                                </div>
                                <span>training_session.mp4</span>
                                <CheckCircle className="w-3 h-3 text-yellow-500" />
                                <span>Processing...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Sales Process?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of sales professionals who are already using AI to
              close more deals, reduce admin work, and exceed their quotas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                Get Started Free
              </button>
              <button className="border-2 border-cyan-500 text-cyan-600 px-8 py-3 rounded-xl font-semibold hover:bg-cyan-50 transition-colors duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesShowcase;
