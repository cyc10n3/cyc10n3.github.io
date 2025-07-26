import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import { getFallbackContent, getFallbackImage } from '@/utils/fallbacks';

const AboutPreview: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('about-preview');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const aboutImage = getFallbackImage('/assets/images/about-us-mission.png', 'Wellhead Equipment Engineers Company');

  const companyValues = [
    {
      icon: '🎯',
      title: 'Visionary Leadership',
      description: 'The art of inspiring and guiding others towards a compelling future through innovative and forward-thinking strategies.'
    },
    {
      icon: '🌐',
      title: 'Expansive Network',
      description: 'A large-scale interconnected system, encompassing extensive reach and connectivity across global markets.'
    },
    {
      icon: '💡',
      title: 'Technological Innovation',
      description: 'The creation and application of new or improved technologies that drive progress and advancements across industries.'
    },
    {
      icon: '🌱',
      title: 'Sustainability & Responsibility',
      description: 'Fostering a balanced and ethical approach to ensure the well-being of future generations and the planet.'
    }
  ];

  const stats = [
    { number: '10+', label: 'Years Experience', icon: '📅' },
    { number: '500+', label: 'Projects Completed', icon: '🏗️' },
    { number: '100+', label: 'Satisfied Clients', icon: '😊' },
    { number: '15+', label: 'Countries Served', icon: '🌍' }
  ];

  return (
    <section id="about-preview" className="section-padding bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent-100 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'}`}>
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                About Our Company
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Leading the Industry 
                <span className="gradient-text block">Forward</span>
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {getFallbackContent(
                  'We are committed to excellence in oil and gas equipment solutions with unwavering dedication to innovation and quality in the energy industry.'
                )}
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To lead the oil and gas exploration industry by consistently delivering safe, efficient, 
                  and responsible exploration activities while maximizing the value of our natural resources.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To be the foremost global leader in oil and gas exploration, setting the standard for 
                  excellence in exploration practices, environmental stewardship, and operational efficiency.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <Link to="/about">
                <Button
                  variant="primary"
                  size="lg"
                  className="group"
                >
                  Learn More About Us
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Content */}
          <div className={`relative ${isVisible ? 'animate-slide-in-right' : 'opacity-0 translate-x-8'}`}>
            {/* Main Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  {...aboutImage}
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Achievement Card */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-custom p-6 max-w-xs">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">ASME Certified</div>
                    <div className="text-sm text-gray-600">U & R Stamp Holder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Values Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Wellhead Equipment Engineers
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our collaboration can lead to groundbreaking achievements and mutual success through our core values and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div
                key={index}
                className={`text-center group transform transition-all duration-700 ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${(index + 4) * 100}ms` }}
              >
                <div className="relative">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{value.icon}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {value.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl -m-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;