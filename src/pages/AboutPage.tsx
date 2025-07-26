import React from 'react';
import companyData from '../data/company.json';

const AboutPage: React.FC = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About {companyData.name.replace(' Pvt. Ltd.', '')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Founded in {companyData.founded}, we've been a trusted partner for oil and gas companies, 
            delivering innovative equipment solutions that drive industry success.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700">
              {companyData.mission}
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700">
              {companyData.vision}
            </p>
          </div>
        </div>

        {/* Company Highlights */}
        <div className="bg-white py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{companyData.stats.yearsOfExperience}+</div>
              <div className="text-gray-600">Years of Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{companyData.certifications.length}</div>
              <div className="text-gray-600">Active Certifications</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{companyData.offices.length}</div>
              <div className="text-gray-600">Office Locations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{companyData.capabilities.length}</div>
              <div className="text-gray-600">Core Services</div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Certifications & Standards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {companyData.certifications.slice(0, 3).map((cert) => (
              <div key={cert.id} className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img 
                    src={cert.image} 
                    alt={cert.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{cert.name}</h3>
                <p className="text-gray-600">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyData.values.map((value, index) => {
              const [title, description] = value.split(' - ');
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-xl font-semibold text-blue-600 mb-3">{title}</h3>
                  <p className="text-gray-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Office Locations */}
        <div className="bg-gray-50 p-8 rounded-lg mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Global Presence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyData.offices.map((office) => (
              <div key={office.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{office.name}</h3>
                <p className="text-blue-600 mb-3 capitalize">{office.type}</p>
                <div className="text-gray-600 mb-4">
                  <p>{office.address.street}</p>
                  <p>{office.address.city}, {office.address.state} {office.address.postalCode}</p>
                  <p>{office.address.country}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <p><strong>Email:</strong> {office.contact.email}</p>
                  <p><strong>Services:</strong> {office.services.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default AboutPage;