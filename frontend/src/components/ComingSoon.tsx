import React, { useEffect, useState } from 'react';
import { ArrowLeft, Zap, Sparkles, Star, Rocket } from 'lucide-react';

interface ComingSoonProps {
  onBack: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ onBack }) => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random stars
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${2 + star.delay}s`,
            }}
          >
            <div className="w-full h-full bg-white rounded-full shadow-lg shadow-cyan-400/50"></div>
          </div>
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

      {/* Navigation */}
      <div className="relative z-10 p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Futuristic Logo */}
        <div className="mb-8 group">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-cyan-500/50">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Coming Soon Text */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              COMING
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              SOON
            </span>
          </h1>
        </div>

        {/* Animated Subtitle */}
        <div className="mb-12">
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-4">
            Something amazing is brewing
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          <div className="group">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Powered by cutting-edge AI technology</p>
            </div>
          </div>

          <div className="group">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Revolutionary</h3>
              <p className="text-gray-400 text-sm">Transforming sales with intelligent automation</p>
            </div>
          </div>

          <div className="group">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Game Changer</h3>
              <p className="text-gray-400 text-sm">Redefining the future of sales</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="text-gray-400 text-sm mb-2">Development Progress</div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <div className="text-gray-500 text-xs mt-2">75% Complete</div>
        </div>

        {/* Notification Signup */}
        <div className="max-w-md mx-auto">
          <p className="text-gray-400 mb-4">Be the first to know when we launch</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors duration-300 backdrop-blur-xl"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
              Notify Me
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
      <div className="absolute top-1/3 right-20 w-1 h-1 bg-blue-500 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-20 w-1.5 h-1.5 bg-purple-600 rounded-full animate-ping opacity-75" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default ComingSoon;
