import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import companyData from '../data/company.json';

const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Pre-fill form based on URL parameters
  useEffect(() => {
    const product = searchParams.get('product');
    const subject = searchParams.get('subject');
    const message = searchParams.get('message');
    
    if (subject) {
      setFormData(prev => ({ ...prev, subject }));
    }
    
    if (message) {
      setFormData(prev => ({ ...prev, message }));
    }
    
    if (product) {
      setFormData(prev => ({ 
        ...prev, 
        subject: 'quote',
        message: `I am interested in getting a quote for the ${product} product. Please provide more information.`
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email content
    const emailSubject = `Contact Form: ${formData.subject}`;
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Phone: ${formData.phone}
Subject: ${formData.subject}

Message:
${formData.message}
    `;
    
    // Create mailto link
    const mailtoLink = `mailto:${companyData.offices[0].contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show confirmation
    alert('Thank you for your message! Your email client will open to send the message.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for quotes, technical support, or any questions 
            about our products and services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subject</option>
                  <option value="quote">Request Quote</option>
                  <option value="technical">Technical Support</option>
                  <option value="general">General Inquiry</option>
                  <option value="partnership">Partnership Opportunity</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Locations */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Office Locations
              </h3>
              <div className="space-y-6">
                {companyData.offices.map((office) => (
                  <div key={office.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-900 mb-2">{office.name}</h4>
                    <p className="text-sm text-blue-600 mb-2 capitalize">{office.type}</p>
                    <p className="text-gray-600 text-sm">
                      {office.address.street}<br />
                      {office.address.city}, {office.address.state} {office.address.postalCode}<br />
                      {office.address.country}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Email:</span> {office.contact.email}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Services:</span> {office.services.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Company Image */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Our Facilities
              </h3>
              <div className="space-y-4">
                <img 
                  src="/assets/images/hero-hq.webp" 
                  alt="Wellhead Equipment Headquarters"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p className="text-gray-600 text-sm">
                  Our state-of-the-art manufacturing facility in Vadodara, Gujarat, equipped with modern machinery and quality control systems.
                </p>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl mr-3">🏢</span>
                  <div>
                    <p className="font-medium text-gray-900">Headquarters</p>
                    <p className="text-blue-600 text-sm">{companyData.headquarters.city}, {companyData.headquarters.state}</p>
                  </div>
                </div>
                <a
                  href={`mailto:${companyData.offices[0].contact.email}`}
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl mr-3">✉️</span>
                  <div>
                    <p className="font-medium text-gray-900">General Inquiries</p>
                    <p className="text-green-600">{companyData.offices[0].contact.email}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${companyData.offices[1].contact.email}`}
                  className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <span className="text-2xl mr-3">🏭</span>
                  <div>
                    <p className="font-medium text-gray-900">Manufacturing</p>
                    <p className="text-orange-600">{companyData.offices[1].contact.email}</p>
                  </div>
                </a>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl mr-3">🌍</span>
                  <div>
                    <p className="font-medium text-gray-900">Global Presence</p>
                    <p className="text-gray-600 text-sm">{companyData.offices.length} Office Locations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Highlights */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                Why Choose Us
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{companyData.stats.yearsOfExperience}+</div>
                  <div className="text-sm text-blue-100">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{companyData.certifications.length}</div>
                  <div className="text-sm text-blue-100">Certifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{companyData.offices.length}</div>
                  <div className="text-sm text-blue-100">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-blue-100">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;