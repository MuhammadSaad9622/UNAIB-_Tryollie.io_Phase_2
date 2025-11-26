import React from "react";
import {
  ArrowLeft,
  FileText,
  Scale,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfUse: React.FC = () => {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms of Use</h1>
              <p className="text-gray-600 mt-2">
                Last updated: January 15, 2025
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Scale className="w-6 h-6 mr-3 text-cyan-600" />
              Acceptance of Terms
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using Tryollie.io services, you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> These terms constitute a legally
                  binding agreement between you and Tryollie.io, Inc.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-purple-600" />
              User Responsibilities
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>As a user of Tryollie.io, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Provide accurate and complete information when creating your
                  account
                </li>
                <li>
                  Maintain the confidentiality of your account credentials
                </li>
                <li>
                  Use the service in compliance with all applicable laws and
                  regulations
                </li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>
                  Respect intellectual property rights and not infringe on
                  third-party rights
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
              Prohibited Uses
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>You may not use our service:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  For any unlawful purpose or to solicit others to perform
                  unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, or laws
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, or discriminate
                  against any individual or group
                </li>
                <li>To submit false or misleading information</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
              Service Availability
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We strive to provide continuous service availability, but we do
                not guarantee that our service will be available at all times.
                We may experience downtime for maintenance, updates, or
                technical issues.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Service Level Agreement:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>99.9% uptime target for core services</li>
                  <li>Scheduled maintenance with advance notice</li>
                  <li>24/7 technical support for enterprise customers</li>
                  <li>Regular security updates and improvements</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Intellectual Property
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                The service and its original content, features, and
                functionality are and will remain the exclusive property of
                Tryollie.io and its licensors. The service is protected by
                copyright, trademark, and other laws.
              </p>
              <p>
                Our trademarks and trade dress may not be used in connection
                with any product or service without our prior written consent.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Limitation of Liability
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In no event shall Tryollie.io, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
