import React, { useState } from 'react';
import companyData from '../data/company.json';

const CertificationsPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Certifications
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our certifications demonstrate our commitment to quality, safety, and environmental responsibility. 
            We maintain the highest industry standards to ensure excellence in all our operations.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companyData.certifications.map((certification) => (
            <div key={certification.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Certificate Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center p-4 cursor-pointer hover:bg-gray-200 transition-colors">
                <img
                  src={certification.image}
                  alt={certification.name}
                  className="max-w-full max-h-full object-contain hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(certification.image)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span class="text-blue-600 font-bold text-2xl">✓</span>
                      </div>
                    `;
                  }}
                />
              </div>

              {/* Certificate Details */}
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-2">
                    {certification.category}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {certification.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Issued by: {certification.issuer}
                  </p>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {certification.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Commitment to Excellence
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              These certifications reflect our unwavering commitment to maintaining the highest standards 
              in quality management, environmental stewardship, and occupational health and safety. 
              We continuously invest in training, processes, and systems to ensure compliance and excellence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-sm text-gray-600">Rigorous quality management systems ensuring consistent excellence</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-2xl">🌱</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Environmental Responsibility</h3>
                <p className="text-sm text-gray-600">Committed to sustainable practices and environmental protection</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-600 text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Safety First</h3>
                <p className="text-sm text-gray-600">Comprehensive safety management ensuring worker well-being</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions About Our Certifications?
            </h2>
            <p className="text-gray-600 mb-6">
              For more information about our certifications or to request certificate copies, please contact us.
            </p>
            <a
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Image Popup Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Certificate"
                className="max-w-full max-h-full object-contain"
                style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationsPage;