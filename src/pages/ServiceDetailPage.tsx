import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import servicesData from '../data/services.json';
import ServiceCard from '../components/sections/ServiceCard';
import Button from '../components/common/Button';
import Footer from '../components/layout/Footer';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  images: string[];
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  processes?: Array<{
    step: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  equipment?: Array<{
    name: string;
    description: string;
    specifications?: Record<string, string>;
  }>;
  certifications?: string[];
  category: string;
  featured?: boolean;
}

const ServiceDetailPage: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'process' | 'equipment'>('overview');

  // Load service data
  useEffect(() => {
    if (!serviceSlug) {
      navigate('/services');
      return;
    }

    const foundService = servicesData.find(s => s.slug === serviceSlug) as Service;
    if (!foundService) {
      navigate('/services');
      return;
    }

    setService(foundService);

    // Load related services
    const related = servicesData
      .filter(s => s.slug !== serviceSlug)
      .slice(0, 3) as Service[];
    
    setRelatedServices(related);
  }, [serviceSlug, navigate]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleRequestService = () => {
    window.location.href = `/contact?service=${service.id}`;
  };

  return (
    <>
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-blue-600">Services</Link>
            <span>/</span>
            <span className="text-gray-900">{service.title}</span>
          </div>
        </nav>  
        {/* Service Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Service Image */}
          <div>
            {service.images && service.images.length > 0 && (
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{service.icon}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {service.category}
                </span>
                {service.featured && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ⭐ Featured Service
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {service.title}
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {service.longDescription}
              </p>
            </div>

            {/* Key Features */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features & Benefits</h3>
              <div className="grid grid-cols-1 gap-4">
                {service.features.slice(0, 4).map((feature: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-lg">{feature.icon || '✓'}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {service.certifications && service.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications & Standards</h3>
                <div className="flex flex-wrap gap-2">
                  {service.certifications.map((cert: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                    >
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleRequestService}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Request Service Quote
              </button>
              <Link to="/contact" className="flex-1">
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Contact Our Team
                </button>
              </Link>
            </div>
          </div>
        </div>   
        {/* Service Details Tabs */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'overview', label: 'Service Overview', icon: '📋' },
              { id: 'process', label: 'Process & Timeline', icon: '⚙️' },
              { id: 'equipment', label: 'Equipment & Tools', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Overview</h3>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  {service.longDescription}
                </p>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Capabilities</h4>
                  <ul className="space-y-3">
                    {service.features.map((feature: any, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm">{feature.icon || '✓'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{feature.title}</span>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'process' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Process & Timeline</h3>

                <div className="space-y-6">
                  {service.processes && service.processes.map((process: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {process.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{process.title}</h4>
                          {process.duration && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {process.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{process.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Equipment & Tools</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {service.equipment && service.equipment.map((equipment: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{equipment.name}</h4>
                      <p className="text-gray-600 mb-4">{equipment.description}</p>
                      
                      {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-gray-900">Key Specifications:</h5>
                          <div className="space-y-1">
                            {Object.entries(equipment.specifications).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-medium text-gray-900">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Related Services
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore other services that complement {service.title.toLowerCase()} or serve similar applications
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedServices.map((relatedService: Service, index: number) => (
                  <div
                    key={relatedService.id}
                    className="transform transition-all duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ServiceCard
                      service={relatedService}
                      onRequestService={(id: string) => window.location.href = `/contact?service=${id}`}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/services">
                  <Button variant="secondary" size="lg">
                    View All Services
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Contact our technical team to discuss how {service.title.toLowerCase()} can meet your specific operational requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={handleRequestService}
              >
                Request Service Quote
              </Button>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ServiceDetailPage;