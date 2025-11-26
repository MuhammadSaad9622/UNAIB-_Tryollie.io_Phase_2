import React, { useState, useEffect } from "react";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  onGetDemo?: () => void;
  onLogin?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how", hasDropdown: false },
    { name: "AI Features", href: "#ai-features", hasDropdown: false },
    { name: "Testimonials", href: "#testimonials", hasDropdown: false },
    { name: "Privacy Policy", href: "/privacy-policy", hasDropdown: false },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo - Clean and Formal */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span
              className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Tryollie.io
            </span>
          </Link>

          {/* Desktop Navigation - Clean and Formal - Only show on home page */}
          {isHomePage && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <a
                    href={link.href}
                    className={`flex items-center space-x-1 font-medium text-sm lg:text-base transition-colors duration-300 ${
                      scrolled
                        ? "text-gray-700 hover:text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.hasDropdown && (
                      <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 group-hover:rotate-180 transition-transform duration-300" />
                    )}
                  </a>

                  {/* Clean underline */}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></div>
                </div>
              ))}

              <button
                onClick={onLogin}
                className={`font-medium text-sm lg:text-base transition-colors duration-300 ${
                  scrolled
                    ? "text-gray-700 hover:text-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Log in
              </button>

              <button
                onClick={onLogin}
                className="bg-black text-white px-6 py-2.5 rounded-lg font-semibold text-sm lg:text-base hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get a Demo
              </button>
            </div>
          )}

          {/* Mobile menu button - Only show on home page */}
          {isHomePage && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  scrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation - Only show on home page */}
        {isHomePage && (
          <div
            className={`md:hidden transition-all duration-300 overflow-hidden ${
              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-4 space-y-2 bg-white/95 backdrop-blur-xl rounded-2xl mt-4 border border-gray-200 shadow-xl">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-6 py-3 text-gray-700 hover:text-black hover:bg-gray-50 transition-colors duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogin?.();
                }}
                className="block px-6 py-3 text-gray-700 hover:text-black hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"></div>
    </nav>
  );
};

export default Navigation;
