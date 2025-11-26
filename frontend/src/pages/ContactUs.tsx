import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, User, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactUs: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    alert('Thank you! Your message has been sent. We will get back to you soon.');
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
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-600 mt-2">Get in touch with our team</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="What can we help you with?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Name</h3>
                    <p className="text-gray-600">17315945 CANADA INC.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Address</h3>
                    <p className="text-gray-600">14 Zaduk Pl, Guelph, ON, N1G 0A7</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Email</h3>
                    <p className="text-gray-600">jamilunaib@hotmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
                    <p className="text-gray-600">+1 (226) 500‑2560</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                    <p className="text-gray-600">Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Help?</h3>
              <p className="text-gray-600 mb-6">
                For urgent inquiries or technical support, please call us directly or send an email.
              </p>
              <div className="space-y-4">
                <a 
                  href="tel:+12265002560" 
                  className="flex items-center space-x-3 text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
                >
                  <Phone className="w-5 h-5" />
                  <span>+1 (226) 500‑2560</span>
                </a>
                <a 
                  href="mailto:jamilunaib@hotmail.com" 
                  className="flex items-center space-x-3 text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
                >
                  <Mail className="w-5 h-5" />
                  <span>jamilunaib@hotmail.com</span>
                </a>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Resources</h3>
              <div className="space-y-3">
                <Link to="/support" className="block text-cyan-600 hover:text-cyan-700 transition-colors duration-300">
                  📞 Support Center
                </Link>
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

export default ContactUs;
