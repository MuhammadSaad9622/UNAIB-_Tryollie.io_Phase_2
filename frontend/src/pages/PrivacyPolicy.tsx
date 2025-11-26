import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-2">Last updated: January 15, 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-cyan-600" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                At Tryollie.io, we collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email address, company details)</li>
                <li>Sales conversation data and recordings</li>
                <li>Usage analytics and performance metrics</li>
                <li>Communication preferences and support interactions</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-purple-600" />
              How We Use Your Information
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our AI-powered sales intelligence services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Develop new products and services</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Database className="w-6 h-6 mr-3 text-green-600" />
              Data Security
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Security Measures Include:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Data backup and recovery procedures</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-blue-600" />
              Your Rights
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access, update, or delete your personal information</li>
                <li>Opt-out of certain data processing activities</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
                <li>File a complaint with supervisory authorities</li>
              </ul>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
