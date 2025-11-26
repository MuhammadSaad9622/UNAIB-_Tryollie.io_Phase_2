import React from 'react';
import { Play, Brain, Zap, ArrowRight, Sparkles, Rocket, Target } from 'lucide-react';

interface HowItWorksProps {
  onStartTrial?: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onStartTrial }) => {
  const steps = [
    {
      step: 1,
      icon: Play,
      title: 'Connect & Configure',
      description: 'Integrate with your existing tech stack in minutes. Connect your CRM, calendar, and communication tools with our intelligent setup wizard.',
      color: 'from-cyan-400 to-blue-500',
      glowColor: 'shadow-cyan-500/25'
    },
    {
      step: 2,
      icon: Brain,
      title: 'AI Learns Your Process',
      description: 'Our advanced AI analyzes your sales methodology, successful patterns, and customer preferences to create personalized guidance tailored to your team.',
      color: 'from-purple-400 to-pink-500',
      glowColor: 'shadow-purple-500/25'
    },
    {
      step: 3,
      icon: Zap,
      title: 'Real-time Assistance',
      description: 'Get live coaching, automated follow-ups, and intelligent insights during every customer interaction with instant AI-powered recommendations.',
      color: 'from-green-400 to-cyan-500',
      glowColor: 'shadow-green-500/25'
    }
  ];

  return (
    <section id="how" className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            <span className="text-purple-600 font-medium text-sm sm:text-base">Simple & Powerful</span>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get up and running in minutes with our simple three-step process. 
            No complex setup or training required.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 relative">
          {/* Animated Connection Lines - Hidden on mobile */}
          <div className="hidden lg:block absolute top-20 left-1/3 right-1/3 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500 opacity-30"></div>
          
          {steps.map((step, index) => (
            <div 
              key={step.step} 
              className="relative group"
            >
              {/* Step Card */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-100 hover:border-cyan-300 transition-all duration-500 transform hover:-translate-y-3 sm:hover:-translate-y-6 hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl sm:rounded-3xl`}></div>
                
                {/* Step Number */}
                <div className="absolute -top-4 sm:-top-6 left-6 sm:left-8">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${step.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-2xl ${step.glowColor}`}>
                    {step.step}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${step.color} rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 mt-6 sm:mt-8 shadow-2xl ${step.glowColor} group-hover:rotate-45 group-hover:scale-125 transition-all duration-500`}>
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">{step.description}</p>

                {/* Progress Indicator */}
                <div className="flex items-center space-x-2 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                        i <= index 
                          ? `bg-gradient-to-r ${step.color}` 
                          : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 sm:top-24 -right-4 sm:-right-6 z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-16 sm:mt-20">
          <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-gray-200 overflow-hidden shadow-2xl">
            <div className="relative text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                <span className="text-purple-600 font-medium text-sm sm:text-base">Ready to Launch?</span>
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
                Join thousands of sales teams already using AI to close more deals.
              </p>
              
              <button 
                onClick={onStartTrial}
                className="group bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-500 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-2xl shadow-purple-500/25 flex items-center space-x-2 sm:space-x-3 mx-auto hover:shadow-cyan-500/25"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-45 group-hover:scale-125 transition-transform duration-300" />
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 group-hover:scale-125 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;