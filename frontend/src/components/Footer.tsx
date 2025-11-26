import React from 'react';
import { Zap, Mail, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  const productLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how' },
  ];

  const companyLinks = [
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Support', href: '/support' },
  ];

  const resourceLinks = [
    { name: 'Documentation', href: '/documentation' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Use', href: '/terms-of-use' },
  ];

  const socialLinks = [
    { name: 'Email', icon: Mail, href: 'mailto:jamilunaib@hotmail.com', color: 'hover:text-cyan-500' },
  ];

  return (
    <footer className="bg-white text-gray-700 relative overflow-hidden border-t border-gray-200">
      {/* Enhanced Animated Background Elements with Air Cover Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full blur-3xl animate-air-cover"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-500/5 rounded-full blur-3xl animate-air-cover-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-green-400/5 to-cyan-500/5 rounded-full blur-2xl animate-air-cover"></div>
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-orange-400/5 to-red-500/5 rounded-full blur-2xl animate-air-cover-delayed"></div>
      </div>

      {/* Fireflies */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-firefly${
              i < 2 ? '' : i < 4 ? '-delayed-1' : '-delayed-2'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
              boxShadow: '0 0 6px rgba(251, 191, 36, 0.5)'
            }}
          />
        ))}
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse opacity-20 ${
              i % 3 === 0 ? 'animate-glow' : i % 3 === 1 ? 'animate-glow-delayed' : ''
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand with Enhanced Animations */}
          <div className="lg:col-span-2 animate-float-card">
            <div className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-cyan-500/25 animate-glow">
                  <Zap className="w-7 h-7 text-white animate-pulse-slow" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-glow-delayed"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-magnetic">
                Tryollie.io
              </span>
              <Sparkles className="w-5 h-5 text-cyan-500 animate-pulse" />
            </div>
            
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed text-lg">
              Transform your sales process with AI-powered conversation intelligence 
              and real-time guidance that helps teams close more deals.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`group w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200 hover:border-cyan-300 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 hover:rotate-3 ${social.color} shadow-lg hover:shadow-xl animate-float-card`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <social.icon className="w-5 h-5 transition-all duration-300 group-hover:scale-125 animate-pulse" />
                </a>
              ))}
            </div>
          </div>

          {/* Product with Enhanced Animations */}
          <div className="animate-float-card-delayed">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mr-3 animate-pulse"></div>
              Product
            </h3>
            <ul className="space-y-4">
              {productLinks.map((link, index) => (
                <li key={link.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-cyan-600 hover:font-semibold transition-all duration-300 hover:translate-x-1 inline-block animate-magnetic"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company with Enhanced Animations */}
          <div className="animate-float-card">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3 animate-pulse"></div>
              Company
            </h3>
            <ul className="space-y-4">
              {companyLinks.map((link, index) => (
                <li key={link.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-purple-600 hover:font-semibold transition-all duration-300 hover:translate-x-1 inline-block animate-magnetic"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources with Enhanced Animations */}
          <div className="animate-float-card-delayed">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full mr-3 animate-pulse"></div>
              Resources
            </h3>
            <ul className="space-y-4">
              {resourceLinks.map((link, index) => (
                <li key={link.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-green-600 hover:font-semibold transition-all duration-300 hover:translate-x-1 inline-block animate-magnetic"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section with Enhanced Animations */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-500 text-sm mb-4 md:mb-0 animate-float-card">
              <span>© 2025 Tryollie.io. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/privacy-policy" className="text-gray-500 hover:text-cyan-600 hover:font-semibold transition-all duration-300 animate-magnetic">
                Privacy Policy
              </a>
              <a href="/terms-of-use" className="text-gray-500 hover:text-purple-600 hover:font-semibold transition-all duration-300 animate-magnetic">
                Terms of Use
              </a>
              <a href="/support" className="text-gray-500 hover:text-green-600 hover:font-semibold transition-all duration-300 animate-magnetic">
                Support
              </a>
              <a href="/documentation" className="text-gray-500 hover:text-blue-600 hover:font-semibold transition-all duration-300 animate-magnetic">
                Documentation
              </a>
              <a href="/contact-us" className="text-gray-500 hover:text-pink-600 hover:font-semibold transition-all duration-300 animate-magnetic">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced top border with wave effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-30 animate-wave"></div>
    </footer>
  );
};

export default Footer;