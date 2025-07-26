import React from 'react';
import { Link } from 'react-router-dom';
import companyData from '../../data/company.json';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer style={{ background: '#111827', color: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          {/* Company Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '8px', 
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <img 
                  src="/assets/images/logo-hq.png" 
                  alt="Wellhead Equipment Engineers Logo"
                  style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 'bold' }}>{companyData.name.replace(' Pvt. Ltd.', '')}</span>
            </div>
            <p style={{ color: '#d1d5db', marginBottom: '16px', fontSize: '14px' }}>
              {companyData.description}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>
                <strong>Headquarters:</strong>
              </p>
              <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.4' }}>
                {companyData.headquarters.street}<br />
                {companyData.headquarters.city}, {companyData.headquarters.state} {companyData.headquarters.postalCode}<br />
                {companyData.headquarters.country}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={`mailto:${companyData.offices[0].contact.email}`}
                style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}
              >
                ✉️ {companyData.offices[0].contact.email}
              </a>

              <p style={{ color: '#d1d5db', fontSize: '14px' }}>
                🏢 {companyData.offices.length} Office Locations
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{t('footer.quickLinks')}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/about" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  About Us
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/products" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  Products
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/services" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  Services
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/certification" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  Certification
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/careers" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  Careers
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/hse-policy" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  HSE Policy
                </Link>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Link to="/contact" style={{ color: '#d1d5db', textDecoration: 'none' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Services</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {companyData.capabilities.slice(0, 4).map((capability, index) => (
                <li key={index} style={{ marginBottom: '8px', color: '#d1d5db' }}>{capability}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid #374151', 
          marginTop: '32px', 
          paddingTop: '32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ color: '#d1d5db', fontSize: '14px', margin: 0 }}>
            © {currentYear} {companyData.name}. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* LinkedIn Link */}
            {companyData.socialMedia.linkedin && (
              <a
                href={companyData.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#d1d5db', textDecoration: 'none' }}
                aria-label="LinkedIn"
              >
                <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
            <a href="#" style={{ color: '#d1d5db', fontSize: '14px', textDecoration: 'none' }}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: '#d1d5db', fontSize: '14px', textDecoration: 'none' }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;