import React from 'react';
import { Link } from 'react-router-dom';
import companyData from '../data/company.json';

const CareersPage: React.FC = () => {

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Careers
          </h1>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
              Empowering Oil and Gas Excellence:<br />
              Unleashing Innovation at the<br />
              Wellhead
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Join our innovative team and embark on an exciting career journey. We offer challenging opportunities, 
              a dynamic work environment, and the chance to make a meaningful impact in cutting-edge projects. 
              Grow your skills, unleash your potential, and be part of a thriving, diverse community.
            </p>
          </div>
        </section>

        {/* Life at Wellhead Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Life at Wellhead
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/assets/images/life-at-wellhead.png" 
                alt="Life at Wellhead"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/hero-equipment.webp';
                }}
              />
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                  <p className="text-gray-600">Work on cutting-edge projects that shape the future of oil and gas industry</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
                  <p className="text-gray-600">Join a diverse, thriving community of passionate professionals</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth</h3>
                  <p className="text-gray-600">Challenging opportunities to grow your skills and unleash your potential</p>
                </div>
                
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🌍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Impact</h3>
                  <p className="text-gray-600">Make a meaningful impact in a dynamic work environment</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apply Now Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-6">Apply Now</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Ready to join our team? We're always looking for talented individuals who share our passion for excellence and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Submit Application
              </Link>
              <a
                href={`mailto:${companyData.offices[0].contact.email}?subject=Career Inquiry`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact HR
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CareersPage;