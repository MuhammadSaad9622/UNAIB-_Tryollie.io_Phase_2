import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, MessageCircle, Mail, Phone, Clock, Search, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "How do I get started with Tryollie.io?",
      answer: "Getting started is easy! Simply sign up for an account, connect your CRM system, and start recording your sales conversations. Our AI will begin analyzing and providing insights immediately."
    },
    {
      question: "What CRM systems do you support?",
      answer: "We support all major CRM systems including Salesforce, HubSpot, Pipedrive, and more. Our API integration makes setup quick and seamless."
    },
    {
      question: "Is my conversation data secure?",
      answer: "Absolutely. We use enterprise-grade encryption and follow strict security protocols. Your data is never shared with third parties and is stored in secure, SOC 2 compliant data centers."
    },
    {
      question: "Can I customize the AI analysis?",
      answer: "Yes! Our AI can be trained on your specific sales processes, terminology, and best practices. You can also customize what insights and recommendations you receive."
    },
    {
      question: "Do you offer training for my team?",
      answer: "We provide comprehensive onboarding, training sessions, and ongoing support to ensure your team gets the most value from our platform."
    },
    {
      question: "What's included in the free trial?",
      answer: "The 14-day free trial includes full access to all features, unlimited conversation analysis, and dedicated onboarding support. No credit card required."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Support request submitted:', contactForm);
    alert('Thank you! Your support request has been submitted.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-cyan-600 transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600 mt-2">We're here to help you succeed with Tryollie.io</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Search className="w-6 h-6 mr-3 text-cyan-600" />
                Search Knowledge Base
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-purple-600" />
                Get in Touch
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-cyan-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">jamilunaib@hotmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (226) 500‑2560</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Business Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Business Name:</strong> 17315945 CANADA INC.</p>
                  <p><strong>Address:</strong> 14 Zaduk Pl, Guelph, ON, N1G 0A7</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Services</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Analysis</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data Storage</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/documentation" className="block text-cyan-600 hover:text-cyan-700 transition-colors duration-300">
                  📚 Documentation
                </Link>
                <Link to="/privacy-policy" className="block text-cyan-600 hover:text-cyan-700 transition-colors duration-300">
                  🔒 Privacy Policy
                </Link>
                <Link to="/terms-of-use" className="block text-cyan-600 hover:text-cyan-700 transition-colors duration-300">
                  📄 Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
