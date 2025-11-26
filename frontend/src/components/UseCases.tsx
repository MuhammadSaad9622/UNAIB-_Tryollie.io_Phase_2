import React from 'react';
import { Users, Building, Headphones, TrendingUp, Target, Shield, Sparkles, Zap } from 'lucide-react';

const UseCases: React.FC = () => {
  const useCases = [
    {
      icon: Users,
      title: 'Sales Teams',
      description: 'Empower your sales reps with real-time coaching and automated CRM updates that drive performance.',
      benefits: ['40% increase in close rate', 'Real-time objection handling', 'Automated follow-ups'],
      color: 'from-cyan-400 to-blue-500',
      glowColor: 'shadow-cyan-500/25'
    },
    {
      icon: Building,
      title: 'Enterprise',
      description: 'Scale sales excellence across large organizations with consistent AI guidance and analytics.',
      benefits: ['Standardized processes', 'Team performance analytics', 'Custom integrations'],
      color: 'from-purple-400 to-pink-500',
      glowColor: 'shadow-purple-500/25'
    },
    {
      icon: Headphones,
      title: 'Customer Success',
      description: 'Transform support calls into upselling opportunities with intelligent suggestions and insights.',
      benefits: ['Identify expansion opportunities', 'Improve retention rates', 'Proactive engagement'],
      color: 'from-green-400 to-cyan-500',
      glowColor: 'shadow-green-500/25'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Operations',
      description: 'Get complete visibility into sales performance with automated reporting and forecasting.',
      benefits: ['Pipeline visibility', 'Forecasting accuracy', 'Performance insights'],
      color: 'from-orange-400 to-red-500',
      glowColor: 'shadow-orange-500/25'
    },
    {
      icon: Target,
      title: 'Account Management',
      description: 'Nurture key accounts with personalized engagement strategies and relationship mapping.',
      benefits: ['Account growth tracking', 'Relationship mapping', 'Risk identification'],
      color: 'from-pink-400 to-purple-500',
      glowColor: 'shadow-pink-500/25'
    },
    {
      icon: Shield,
      title: 'Compliance',
      description: 'Ensure all sales conversations meet regulatory requirements with automated monitoring.',
      benefits: ['Compliance monitoring', 'Risk assessment', 'Audit trails'],
      color: 'from-indigo-400 to-blue-500',
      glowColor: 'shadow-indigo-500/25'
    }
  ];

  return (
    <section id="cases" className="py-20 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/5 to-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-green-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/5 to-orange-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-blue-600 font-medium animate-pulse">Versatile Solutions</span>
            <Sparkles className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              Use Cases
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how teams across your organization can benefit from AI-powered 
            sales enablement and conversation intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              className="group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-cyan-300 transition-all duration-500 transform hover:-translate-y-6 hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 overflow-hidden"
              style={{ 
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`,
                opacity: 0
              }}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
              
              {/* Animated Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${useCase.color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm`}></div>
              
              {/* Icon */}
              <div className={`w-20 h-20 bg-gradient-to-r ${useCase.color} rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${useCase.glowColor} group-hover:rotate-45 group-hover:scale-125 transition-all duration-500 relative z-10 animate-pulse`}>
                <useCase.icon className="w-10 h-10 text-white" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{useCase.description}</p>

                {/* Benefits */}
                <ul className="space-y-3 mb-6">
                  {useCase.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      <div className={`w-3 h-3 bg-gradient-to-r ${useCase.color} rounded-full mr-3 animate-ping`} style={{ animationDelay: `${benefitIndex * 0.2}s` }}></div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`group/btn bg-gradient-to-r ${useCase.color} text-white px-6 py-3 rounded-xl font-semibold hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-lg ${useCase.glowColor} flex items-center space-x-2 w-full justify-center hover:shadow-2xl`}>
                  <span>Explore</span>
                  <Zap className="w-4 h-4 group-hover/btn:rotate-45 group-hover/btn:scale-125 transition-transform duration-300" />
                </button>
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-r ${useCase.color} rounded-full animate-float`}
                    style={{
                      left: `${15 + (i * 10)}%`,
                      top: `${15 + (i * 8)}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Industry Stats */}
        <div className="mt-20">
          <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200 overflow-hidden shadow-2xl">
            {/* Background Animation */}
            <div className="absolute inset-0">
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                ></div>
              ))}
            </div>

            <div className="relative text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500 animate-bounce" />
                <span className="text-blue-600 font-medium animate-pulse">Industry Leading Results</span>
                <TrendingUp className="w-6 h-6 text-purple-500 animate-bounce" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient-x">
                Proven Results Across Industries
              </h3>
              <p className="text-gray-600">Real metrics from our customers</p>
            </div>
            
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-2 group-hover:scale-125 transition-transform duration-500 animate-bounce">
                  85%
                </div>
                <div className="text-gray-700 font-medium">Faster onboarding</div>
                <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mt-2 animate-pulse"></div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-125 transition-transform duration-500 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  3x
                </div>
                <div className="text-gray-700 font-medium">More qualified leads</div>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent mb-2 group-hover:scale-125 transition-transform duration-500 animate-bounce" style={{ animationDelay: '1s' }}>
                  50%
                </div>
                <div className="text-gray-700 font-medium">Less admin work</div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full mx-auto mt-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2 group-hover:scale-125 transition-transform duration-500 animate-bounce" style={{ animationDelay: '1.5s' }}>
                  95%
                </div>
                <div className="text-gray-700 font-medium">User satisfaction</div>
                <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto mt-2 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;