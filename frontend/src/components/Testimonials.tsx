import React from 'react';
import { Star, Quote, Sparkles, Heart } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'VP of Sales',
      company: 'TechCorp',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'Aircover transformed our sales process completely. Our team is closing 40% more deals with the real-time AI guidance. It\'s like having a sales coach in every call.',
      rating: 5,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'Michael Chen',
      role: 'Sales Director',
      company: 'GrowthLabs',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'The CRM integration is seamless. We save hours every week on data entry and our pipeline accuracy has improved dramatically. This is the future of sales.',
      rating: 5,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Revenue',
      company: 'ScaleUp Inc',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'The real-time coaching feature is game-changing. Even our junior reps are performing like seasoned professionals. ROI was immediate and substantial.',
      rating: 5,
      color: 'from-green-400 to-cyan-500'
    },
    {
      name: 'David Kim',
      role: 'Sales Manager',
      company: 'InnovateCorp',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'The AI insights have revolutionized how we approach sales. Our conversion rates increased by 35% in just the first quarter.',
      rating: 5,
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'Lisa Wang',
      role: 'VP of Growth',
      company: 'ScaleTech',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'We\'ve seen a 50% reduction in follow-up time and our team is more confident than ever. This tool is a game-changer.',
      rating: 5,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      name: 'Alex Thompson',
      role: 'Sales Operations Lead',
      company: 'DataFlow Inc',
      avatar: 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'The analytics dashboard gives us insights we never had before. Our forecasting accuracy improved by 60% in just two months.',
      rating: 5,
      color: 'from-teal-400 to-emerald-500'
    },
    {
      name: 'Maria Garcia',
      role: 'Enterprise Sales Director',
      company: 'GlobalTech Solutions',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
      quote: 'Enterprise sales require precision and timing. This AI tool has become our secret weapon for closing big deals.',
      rating: 5,
      color: 'from-rose-400 to-pink-500'
    }
  ];

  // Create a duplicated array for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-20 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-pink-400/5 to-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-400/5 to-cyan-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* Floating Hearts */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="w-6 h-6 text-pink-500 animate-bounce" />
            <span className="text-pink-600 font-medium animate-pulse">Customer Love</span>
            <Heart className="w-6 h-6 text-purple-500 animate-bounce" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              What Our Customers Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. See how sales teams are achieving 
            remarkable results with Aircover.
          </p>
        </div>

        {/* Infinite Horizontal Scrolling Testimonials */}
        <div className="relative overflow-hidden">
          {/* Left fade overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          
          {/* Right fade overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-scroll-horizontal">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-pink-300 transition-all duration-500 transform hover:-translate-y-6 hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 overflow-hidden flex-shrink-0 mx-4"
                style={{ 
                  width: '400px',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s forwards`,
                  opacity: 0
                }}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Animated Border */}
                <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm`}></div>
                
                {/* Quote Icon */}
                <div className="absolute -top-4 left-8">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25 animate-bounce group-hover:animate-spin`}>
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center mb-6 mt-8">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-current animate-pulse hover:scale-125 transition-transform duration-300" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-600 mb-8 leading-relaxed text-lg relative z-10 group-hover:text-gray-700 transition-colors duration-300">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center relative z-10">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover mr-4 border-4 border-gray-200 group-hover:border-cyan-400 group-hover:scale-110 transition-all duration-300"
                    />
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${testimonial.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">{testimonial.role}</div>
                    <div className={`text-sm font-medium bg-gradient-to-r ${testimonial.color} bg-clip-text text-transparent`}>
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 bg-gradient-to-r ${testimonial.color} rounded-full animate-float`}
                      style={{
                        left: `${10 + (i * 8)}%`,
                        top: `${10 + (i * 7)}%`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Direction Indicator */}
        <div className="flex items-center justify-center mt-8 space-x-2 text-gray-400">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Scrolls continuously</span>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Enhanced Trust Indicators */}
        <div className="mt-20">
          <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200 overflow-hidden shadow-2xl">
            {/* Background Animation */}
            <div className="absolute inset-0">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                ></div>
              ))}
            </div>

            <div className="relative">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Sparkles className="w-6 h-6 text-pink-500 animate-bounce" />
                  <span className="text-pink-600 font-medium animate-pulse">Trusted Worldwide</span>
                  <Sparkles className="w-6 h-6 text-purple-500 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                  Join the Success Story
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-transform duration-500 animate-bounce">
                    4.9/5
                  </div>
                  <div className="text-gray-700 text-lg font-medium mb-2">Average rating</div>
                  <div className="flex items-center justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 text-yellow-400 fill-current animate-pulse hover:scale-125 transition-transform duration-300" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mt-3 animate-pulse"></div>
                </div>
                
                <div className="group text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-transform duration-500 animate-bounce" style={{ animationDelay: '0.5s' }}>
                    500+
                  </div>
                  <div className="text-gray-700 text-lg font-medium mb-2">Happy customers</div>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                <div className="group text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent mb-3 group-hover:scale-125 transition-transform duration-500 animate-bounce" style={{ animationDelay: '1s' }}>
                    98%
                  </div>
                  <div className="text-gray-700 text-lg font-medium mb-2">Would recommend</div>
                  <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full mx-auto mt-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;