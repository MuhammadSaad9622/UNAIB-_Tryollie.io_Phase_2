import React from 'react';
import { Brain, Phone, Database, BarChart3, MessageSquare, Target, Sparkles, Zap } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get real-time conversation analysis and actionable insights powered by advanced AI algorithms that understand sales context and predict outcomes.',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600',
      color: 'from-cyan-400 to-blue-500',
      glowColor: 'shadow-cyan-500/25'
    },
    {
      icon: Phone,
      title: 'Real-time Call Intelligence',
      description: 'Receive live coaching, objection handling suggestions, and next-best-action recommendations during every sales call with instant AI feedback.',
      image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600',
      color: 'from-purple-400 to-pink-500',
      glowColor: 'shadow-purple-500/25'
    },
    {
      icon: Database,
      title: 'Seamless CRM Integration',
      description: 'Automatically sync call data, update opportunities, and maintain perfect CRM hygiene without manual data entry using intelligent automation.',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600',
      color: 'from-green-400 to-cyan-500',
      glowColor: 'shadow-green-500/25'
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Enhanced Background Elements with Air Cover Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full blur-3xl animate-air-cover"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-500/5 rounded-full blur-3xl animate-air-cover-delayed"></div>
        <div className="absolute top-1/2 left-10 w-32 h-32 bg-gradient-to-r from-green-400/5 to-cyan-500/5 rounded-full blur-2xl animate-air-cover"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-orange-400/5 to-red-500/5 rounded-full blur-2xl animate-air-cover-delayed"></div>
      </div>

      {/* Fireflies */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-firefly${
              i < 2 ? '' : i < 4 ? '-delayed-1' : i < 6 ? '-delayed-2' : '-delayed-3'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)'
            }}
          />
        ))}
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full animate-bubble${
              i < 2 ? '' : i < 4 ? '-delayed-1' : '-delayed-2'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(2px)'
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <div className="flex items-center justify-center space-x-2 mb-6 animate-float-card">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 animate-pulse" />
            <span className="text-cyan-600 font-medium text-sm sm:text-base">Revolutionary Technology</span>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-gray-900 via-cyan-600 to-purple-600 bg-clip-text text-transparent animate-glow">
              Supercharge Your Sales Process
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Transform every conversation into a learning opportunity with AI that understands 
            your business and helps your team perform at their best.
          </p>
        </div>

        <div className="space-y-24 sm:space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              } animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Content */}
              <div className={`space-y-6 sm:space-y-8 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl ${feature.glowColor} transform hover:rotate-12 hover:scale-110 transition-all duration-500 animate-glow`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white animate-pulse-slow" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 animate-magnetic">{feature.title}</h3>
                    <div className={`w-16 sm:w-20 h-1 bg-gradient-to-r ${feature.color} rounded-full animate-wave`}></div>
                  </div>
                </div>
                
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${feature.color} bg-opacity-10 text-cyan-700 text-xs sm:text-sm font-medium rounded-full border border-cyan-200 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-float-card`}>
                    Real-time
                  </span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 text-xs sm:text-sm font-medium rounded-full border border-purple-200 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-float-card-delayed">
                    AI-powered
                  </span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500/10 to-cyan-500/10 text-green-700 text-xs sm:text-sm font-medium rounded-full border border-green-200 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-float-card">
                    Automated
                  </span>
                </div>

                <button className={`group bg-gradient-to-r ${feature.color} text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all duration-300 shadow-lg ${feature.glowColor} flex items-center space-x-2 hover:shadow-2xl animate-energy-pulse`}>
                  <span>Learn More</span>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform duration-300 animate-pulse" />
                </button>
              </div>

              {/* Image */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl sm:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-all duration-500 opacity-20 blur-xl animate-glow`}></div>
                  
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white shadow-2xl animate-float-card">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-64 sm:h-72 lg:h-80 object-cover transform group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent"></div>
                    
                    {/* Floating Icon with Enhanced Animation */}
                    <div className={`absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl ${feature.glowColor} animate-bounce-slow`}>
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats with Enhanced Animations */}
        <div className="mt-24 sm:mt-32">
          <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-gray-200 overflow-hidden shadow-2xl animate-float-card">
            {/* Background Air Cover Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl animate-air-cover"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl animate-air-cover-delayed"></div>
            
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
              <div className="group animate-float-card">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-transform duration-500 animate-glow">
                  40%
                </div>
                <div className="text-gray-700 text-base sm:text-lg font-medium">Increase in close rate</div>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mt-2 animate-wave"></div>
              </div>
              <div className="group animate-float-card-delayed">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-transform duration-500 animate-glow-delayed">
                  60%
                </div>
                <div className="text-gray-700 text-base sm:text-lg font-medium">Reduction in admin time</div>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-2 animate-wave-delayed"></div>
              </div>
              <div className="group animate-float-card">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-transform duration-500 animate-glow">
                  25%
                </div>
                <div className="text-gray-700 text-base sm:text-lg font-medium">Faster deal velocity</div>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full mx-auto mt-2 animate-wave"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;