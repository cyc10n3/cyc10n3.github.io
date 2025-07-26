import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import { getFallbackContent } from '@/utils/fallbacks';

interface ServicePreviewItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  features: string[];
}

const ServicesPreview: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    // Animate cards in sequence
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5]);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const services: ServicePreviewItem[] = [
    {
      id: 'wellhead-equipment',
      title: 'Wellhead Equipment',
      description: 'High-quality wellhead systems designed for optimal performance and safety in oil and gas operations.',
      icon: '🔧',
      href: '/services/wellhead-equipment',
      features: ['High pressure rating', 'API 6A compliant', 'Sour service capability']
    },
    {
      id: 'pressure-vessels',
      title: 'Pressure Vessels',
      description: 'Expertly engineered pressure vessels built to withstand extreme conditions and meet industry standards.',
      icon: '⚙️',
      href: '/services/pressure-vessels',
      features: ['ASME certified', 'Custom sizing', 'High efficiency design']
    },
    {
      id: 'sand-management',
      title: 'Sand Management Equipment',
      description: 'Advanced sand management systems to protect equipment and maintain operational efficiency.',
      icon: '🏗️',
      href: '/services/sand-management',
      features: ['80-90% capture efficiency', '10K & 5K rated', 'Multiple micron options']
    },
    {
      id: 'pressure-control',
      title: 'Pressure Control Equipment',
      description: 'Reliable pressure control equipment that ensures safe and efficient operations across all applications.',
      icon: '📊',
      href: '/services/pressure-control',
      features: ['Fail-safe operation', 'Remote control', 'API 16A compliant']
    },
    {
      id: 'storage-tanks',
      title: 'Storage Tanks',
      description: 'Durable storage tank solutions designed for various petroleum products and industrial applications.',
      icon: '🛢️',
      href: '/services/storage-tanks',
      features: ['API 650 compliant', 'Environmental protection', 'Large capacity options']
    },
    {
      id: 'custom-solutions',
      title: 'Custom Solutions',
      description: 'Tailored engineering solutions to meet specific operational requirements and industry challenges.',
      icon: '⚡',
      href: '/services/custom-solutions',
      features: ['Turnkey projects', 'Design engineering', 'Complete fabrication']
    }
  ];

  const ServiceIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = '' }) => {
    const iconMap: Record<string, React.ReactNode> = {
      '🔧': (
        <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      '⚙️': (
        <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-.42-.26l-.888-2.077a2 2 0 00-1.847-1.234h-1.538a2 2 0 00-1.847 1.234l-.888 2.077a6 6 0 00-.42.26l-2.387.477a2 2 0 00-1.022.547L4.572 19.428a2 2 0 00.547 1.022l2.387.477a6 6 0 00.42.26l.888 2.077a2 2 0 001.847 1.234h1.538a2 2 0 001.847-1.234l.888-2.077a6 6 0 00.42-.26l2.387-.477a2 2 0 001.022-.547z" />
        </svg>
      ),
      '🏗️': (
        <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      '📊': (
        <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      '🛢️': (
        <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      '⚡': (
        <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    };

    return iconMap[icon] || <span className={`text-2xl ${className}`}>{icon}</span>;
  };

  return (
    <section id="services-preview" className="section-padding bg-gray-50">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Equipment Solutions</h2>
          <p className="section-subtitle">
            A comprehensive range of oil and gas equipment for all your operational needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`transform transition-all duration-700 ${
                visibleCards.includes(index)
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link to={service.href}>
                <Card
                  className="h-full group hover:shadow-custom-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0"
                  hover
                >
                <div className="text-center space-y-6">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ServiceIcon icon={service.icon} className="text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {getFallbackContent(service.title)}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {getFallbackContent(service.description)}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-300"
                    >
                      Learn More
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Services CTA */}
        <div className="text-center mt-12">
          <Link to="/services">
            <Button
              variant="primary"
              size="lg"
              className="group"
            >
              View All Services
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-100 rounded-full opacity-10 blur-3xl" />
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;