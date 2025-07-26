import React from 'react';
import { Link } from 'react-router-dom';
import companyData from '../data/company.json';
import servicesData from '../data/services.json';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('home.hero.viewProducts')}
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                {t('home.hero.getQuote')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Marquee */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('home.clients.title')}
            </h2>
            <p className="text-gray-600">
              {t('home.clients.subtitle')}
            </p>
          </div>
          
          {/* Marquee Container */}
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee space-x-12 items-center">
              {/* Client logos - now using local assets */}
              {[
                '/assets/images/clients/client-1.webp',
                '/assets/images/clients/client-2.webp',
                '/assets/images/clients/client-3.webp',
                '/assets/images/clients/client-4.webp',
                '/assets/images/clients/client-5.webp',
                '/assets/images/clients/client-6.png',
                '/assets/images/clients/client-7.png',
                '/assets/images/clients/client-8.png',
                '/assets/images/clients/client-9.png',
                '/assets/images/clients/client-10.png',
                '/assets/images/clients/client-11.png',
                // Duplicate for seamless loop
                '/assets/images/clients/client-1.webp',
                '/assets/images/clients/client-2.webp',
                '/assets/images/clients/client-3.webp',
                '/assets/images/clients/client-4.webp',
                '/assets/images/clients/client-5.webp',
                '/assets/images/clients/client-6.png',
                '/assets/images/clients/client-7.png',
                '/assets/images/clients/client-8.png',
                '/assets/images/clients/client-9.png',
                '/assets/images/clients/client-10.png',
                '/assets/images/clients/client-11.png'
              ].map((logoUrl, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-32 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <img 
                    src={logoUrl} 
                    alt={`Client ${index + 1}`}
                    className="max-w-full max-h-full object-contain p-2"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.services.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('home.services.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicesData.slice(0, 3).map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <Link to={`/services/${service.slug}`} className="text-blue-600 font-medium hover:text-blue-800">
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {companyData.stats.yearsOfExperience}+ Years of Industry Excellence
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {companyData.name} has been serving the oil and gas industry with 
                innovative solutions and uncompromising quality. Founded in {companyData.founded}, 
                our team brings extensive experience to every project.
              </p>
              <ul className="space-y-3 mb-8">
                {companyData.certifications.slice(0, 3).map((cert) => (
                  <li key={cert.id} className="flex items-center">
                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs">✓</span>
                    </span>
                    {cert.name}
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Learn About Us
              </Link>
            </div>
            <div className="rounded-lg h-96 overflow-hidden shadow-lg">
              <img 
                src="/assets/images/hero-equipment.webp" 
                alt="Wellhead Equipment Manufacturing Facility" 
                className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600">
              Quality, expertise, and reliability you can trust
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{companyData.stats.yearsOfExperience}+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{companyData.certifications.length}</div>
              <div className="text-gray-600">Certifications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4</div>
              <div className="text-gray-600">Office Locations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Our most popular and trusted equipment solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: '3 Phase Separator', 
                image: '/assets/images/3-phase-separator.webp',
                description: 'Instrumented vessel for well testing operations'
              },
              { 
                name: 'Sand Catcher', 
                image: '/assets/images/sand-catcher.webp',
                description: '80-90% sand capture efficiency'
              },
              { 
                name: 'Surge Tank', 
                image: '/assets/images/surge-tank-1.webp',
                description: 'Dual compartment pressurized vessel'
              },
              { 
                name: 'Gate Valve', 
                image: '/assets/images/gate-valve-1.webp',
                description: 'API-6A compliant high-pressure valves'
              }
            ].map((product, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.location.href = '/products'}
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Equipment Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Equipment Gallery
            </h2>
            <p className="text-lg text-gray-600">
              State-of-the-art equipment designed for the oil and gas industry
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { image: '/assets/images/gallery-1.webp', title: 'Sand Management Systems', description: 'Advanced sand management and flowback packages' },
              { image: '/assets/images/gallery-2.webp', title: 'Pressure Vessels', description: 'ASME certified pressure vessels and separators' },
              { image: '/assets/images/gallery-3.webp', title: 'Flow Line Equipment', description: 'Complete flow line solutions and manifolds' },
              { image: '/assets/images/gallery-4.webp', title: 'Surface Equipment', description: 'Surface welltest units and equipment' },
              { image: '/assets/images/gallery-5.webp', title: 'Manufacturing Facility', description: 'State-of-the-art manufacturing capabilities' },
              { image: '/assets/images/hero-equipment2.webp', title: 'Quality Control', description: 'Rigorous testing and quality assurance' }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to relevant page based on the item
                  if (item.title.includes('Sand Management')) {
                    window.location.href = '/products?category=sand-management';
                  } else if (item.title.includes('Pressure Vessels')) {
                    window.location.href = '/products?category=pressure-vessels';
                  } else if (item.title.includes('Flow Line')) {
                    window.location.href = '/products?category=flow-line';
                  } else {
                    window.location.href = '/products';
                  }
                }}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t('home.cta.description')}
          </p>
          <Link
            to="/contact"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('home.cta.requestQuote')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;