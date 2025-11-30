import React, { useEffect, useState } from 'react';
import { Play, ArrowRight, Bot, Zap, TrendingUp, Sparkles, Brain, Rocket, Star, Target, Shield, Users } from 'lucide-react';

interface HeroProps {
  onGetDemo?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetDemo }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Enablement', 'Intelligence', 'Automation', 'Excellence'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Enhanced Background with Air Cover Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        
        {/* Air Cover Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full animate-air-cover blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full animate-air-cover-delayed blur-xl"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-green-400/20 to-cyan-500/20 rounded-full animate-air-cover blur-xl"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full animate-air-cover-delayed blur-xl"></div>
      </div>

      {/* Fireflies */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-firefly${
              i < 4 ? '' : i < 8 ? '-delayed-1' : i < 10 ? '-delayed-2' : '-delayed-3'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
            }}
          />
        ))}
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-full animate-bubble${
              i < 2 ? '' : i < 4 ? '-delayed-1' : i < 6 ? '-delayed-2' : '-delayed-3'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(2px)'
            }}
          />
        ))}
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float opacity-30 ${
              i % 3 === 0 ? 'animate-glow' : i % 3 === 1 ? 'animate-glow-delayed' : ''
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          >
            {i % 3 === 0 && <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>}
            {i % 3 === 1 && <div className="w-1 h-1 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full"></div>}
            {i % 3 === 2 && <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>}
          </div>
        ))}
      </div>

      {/* Particle Flow Streams */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-particle-flow"
            style={{
              top: `${20 + i * 30}%`,
              left: '-10px',
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 z-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left relative z-20">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 backdrop-blur-sm animate-float-card">
                  <span className="text-cyan-400 text-xs sm:text-sm font-medium flex items-center">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                    AI-Powered Sales Revolution
                    <Rocket className="w-3 h-3 sm:w-4 sm:h-4 ml-2 animate-bounce-slow" />
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-white">Real-time Sales</span>
                <br />
                <span className="text-cyan-400">
                  {words[currentWord]}
                </span>
                <br />
                <span className="text-white">Powered by </span>
                <span className="text-purple-400">
                  AI.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Transform every sales conversation with{' '}
                <span className="text-cyan-400 font-semibold">AI-powered insights</span>, 
                real-time guidance, and automated CRM updates that help your team close more deals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onGetDemo}
                className="group relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/25"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce-slow" />
                  <span>Get a Demo</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group border-2 border-cyan-500/50 text-cyan-400 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-cyan-500/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-2 sm:space-x-3 hover:scale-105">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Watch Video</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-2 text-gray-400 animate-float-card">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 animate-float-card-delayed">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 animate-float-card">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column - Dynamic Moving Image */}
          <div className="relative mt-8 lg:mt-0 z-20">
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto animate-spin-360">
              {/* Main AI Evolution Container */}
              <div className="relative w-full h-full">
                {/* Animated Background Grid */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl border border-cyan-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 opacity-30 animate-pulse">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                  </div>
                </div>

                {/* Central AI Brain with Evolution Animation */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Outer Ring - Evolution Stages */}
                    <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-40 xl:h-40 border-2 border-cyan-400/30 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-36 xl:h-36 border-2 border-purple-400/30 rounded-full animate-spin-reverse"></div>
                    <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 border-2 border-blue-400/30 rounded-full animate-spin-slow" style={{ animationDelay: '1s' }}></div>
                    
                    {/* Central AI Core */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 relative z-10">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 bg-gray-900 rounded-full flex items-center justify-center animate-pulse">
                        <Brain className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-8 text-cyan-400" />
                      </div>
                    </div>

                    {/* Floating Data Particles */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-float"
                        style={{
                          left: `${50 + 25 * Math.cos(i * Math.PI / 3)}%`,
                          top: `${50 + 25 * Math.sin(i * Math.PI / 3)}%`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: '3s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Feature Icons - Mobile Responsive */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 animate-float-card">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-xs text-white/80 mt-1 text-center hidden sm:block">Security</div>
                  </div>
                </div>

                <div className="absolute top-1/4 right-1 sm:top-1/3 sm:right-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 animate-float-card" style={{ animationDelay: '0.5s' }}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-xs text-white/80 mt-1 text-center hidden sm:block">AI Assistant</div>
                  </div>
                </div>

                <div className="absolute bottom-1/4 left-1 sm:bottom-1/3 sm:left-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 animate-float-card" style={{ animationDelay: '1s' }}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-xs text-white/80 mt-1 text-center hidden sm:block">Analytics</div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 animate-float-card" style={{ animationDelay: '1.5s' }}>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="text-xs text-white/80 mt-1 text-center hidden sm:block">Insights</div>
                  </div>
                </div>

                {/* Real-time Data Stream - Mobile Responsive */}
                <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl shadow-cyan-500/25 animate-pulse">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white animate-pulse" />
                      <div className="text-white text-xs sm:text-sm font-semibold">Real-time</div>
                    </div>
                    <div className="text-white/80 text-xs mt-1 hidden sm:block">Live AI Processing</div>
                  </div>
                </div>

                {/* Animated Connection Lines - Mobile Responsive */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 400 500">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 200 100 Q 300 150 350 200 T 200 300 Q 100 350 50 400"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                      opacity="0.6"
                    />
                    <path
                      d="M 50 100 Q 150 150 200 200 T 350 300 Q 300 350 200 400"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                      opacity="0.4"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </svg>
                </div>

                {/* Glowing Orbs - Mobile Responsive */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm"></div>
                <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 bg-purple-400 rounded-full animate-pulse opacity-60 blur-sm" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-pulse opacity-60 blur-sm" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced bottom border with wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50 animate-wave z-20"></div>
    </section>
  );
};

export default Hero;