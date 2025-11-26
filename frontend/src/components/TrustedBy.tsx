import React from 'react';
import { Building2, Briefcase, Zap, Shield, Globe, Users, Sparkles } from 'lucide-react';

const TrustedBy: React.FC = () => {
  const companies = [
    { name: 'TechCorp', icon: Building2, color: 'from-cyan-400 to-blue-500' },
    { name: 'SalesForce', icon: Briefcase, color: 'from-blue-400 to-purple-500' },
    { name: 'FastGrow', icon: Zap, color: 'from-purple-400 to-pink-500' },
    { name: 'SecureData', icon: Shield, color: 'from-pink-400 to-red-500' },
    { name: 'GlobalTech', icon: Globe, color: 'from-green-400 to-cyan-500' },
    { name: 'TeamWork', icon: Users, color: 'from-orange-400 to-yellow-500' },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
            <p className="text-xs sm:text-sm font-medium text-cyan-600 uppercase tracking-wide">
              Trusted by leading sales teams
            </p>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Powering the Future of Sales
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="group flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border-2 border-gray-100 hover:border-cyan-300 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 sm:hover:-translate-y-4 hover:rotate-3 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${company.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:rotate-45 group-hover:scale-125 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                <company.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 group-hover:font-bold text-center">
                {company.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-2 group">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
              <span className="text-gray-700 group-hover:text-green-600 transition-colors duration-300">500+ companies</span>
            </div>
            <div className="flex items-center space-x-2 group">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"></div>
              <span className="text-gray-700 group-hover:text-cyan-600 transition-colors duration-300">50k+ sales calls analyzed</span>
            </div>
            <div className="flex items-center space-x-2 group">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
              <span className="text-gray-700 group-hover:text-purple-600 transition-colors duration-300">98% customer satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;