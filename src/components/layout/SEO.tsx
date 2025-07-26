import React from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: object | object[];
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    name?: string;
    description?: string;
    image?: string;
    brand?: string;
    category?: string;
    availability?: string;
    condition?: string;
  };
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  noIndex?: boolean;
  noFollow?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Wellhead Equipment Engineers | Leading Oil & Gas Solutions',
  description = 'A leading and innovative provider of cutting-edge oil and gas equipment solutions. Wellhead equipment, pressure vessels, sand management, and pressure control systems.',
  keywords = ['oil and gas equipment', 'wellhead equipment', 'pressure vessels', 'sand management', 'flow line equipment'],
  ogImage = '/assets/images/hero-equipment.webp',
  ogType = 'website',
  canonicalUrl,
  structuredData,
  article,
  product,
  breadcrumbs,
  noIndex = false,
  noFollow = false,
}) => {
  const siteUrl = 'https://www.wellheadequipment.com';
  const fullTitle = title.includes('Wellhead Equipment Engineers') ? title : `${title} | Wellhead Equipment Engineers`;
  const currentUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  // Generate robots content
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ');

  // Generate structured data for breadcrumbs
  const breadcrumbStructuredData = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${siteUrl}${crumb.url}`
    }))
  } : null;

  // Generate structured data for products
  const productStructuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image ? `${siteUrl}${product.image}` : imageUrl,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Wellhead Equipment Engineers"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "itemCondition": `https://schema.org/${product.condition || 'NewCondition'}`,
      "seller": {
        "@type": "Organization",
        "name": "Wellhead Equipment Engineers"
      }
    }
  } : null;

  // Generate structured data for articles
  const articleStructuredData = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": fullTitle,
    "description": description,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": article.author || "Wellhead Equipment Engineers"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Wellhead Equipment Engineers",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/assets/images/logo.png`
      }
    },
    "datePublished": article.publishedTime,
    "dateModified": article.modifiedTime || article.publishedTime,
    "articleSection": article.section,
    "keywords": article.tags?.join(', ') || keywords.join(', ')
  } : null;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
      
      {/* SEO Meta Tags */}
      <meta name="robots" content={robotsContent} />
      <meta name="author" content="Wellhead Equipment Engineers" />
      <meta name="language" content="en-US" />
      <meta name="geo.region" content="US-TX" />
      <meta name="geo.placename" content="Houston" />
      <meta name="geo.position" content="29.7604;-95.3698" />
      <meta name="ICBM" content="29.7604, -95.3698" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={currentUrl} />}
      
      {/* Alternate Language Links */}
      <link rel="alternate" hrefLang="en" href={currentUrl} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="Wellhead Equipment Engineers" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@WellheadEquip" />
      <meta name="twitter:creator" content="@WellheadEquip" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="wellhead-equipment-engineers" />
      
      {/* Mobile App Links */}
      <meta property="al:web:url" content={currentUrl} />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* DNS Prefetch and Preconnect */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Business Information */}
      <meta name="business:contact_data:street_address" content="123 Industrial Drive" />
      <meta name="business:contact_data:locality" content="Houston" />
      <meta name="business:contact_data:region" content="TX" />
      <meta name="business:contact_data:postal_code" content="77001" />
      <meta name="business:contact_data:country_name" content="United States" />
      <meta name="business:contact_data:email" content="info@wellheadequipment.com" />
      <meta name="business:contact_data:phone_number" content="+1-713-555-0123" />
      <meta name="business:contact_data:website" content={siteUrl} />
      
      {/* Custom Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            />
          ))
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )
      )}
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
      )}
      
      {/* Product Structured Data */}
      {productStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
        />
      )}
      
      {/* Article Structured Data */}
      {articleStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
        />
      )}
      
      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Wellhead Equipment Engineers",
            "alternateName": "WEE",
            "url": siteUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/assets/images/logo.png`,
              "width": 300,
              "height": 100
            },
            "description": "Leading provider of oil and gas equipment solutions including wellhead equipment, pressure vessels, sand management systems, and flow line equipment.",
            "foundingDate": "2014",
            "numberOfEmployees": "50-100",
            "industry": "Oil and Gas Equipment Manufacturing",
            "address": [
              {
                "@type": "PostalAddress",
                "name": "Headquarters",
                "streetAddress": "123 Industrial Drive",
                "addressLocality": "Houston",
                "addressRegion": "TX",
                "postalCode": "77001",
                "addressCountry": "US"
              },
              {
                "@type": "PostalAddress",
                "name": "Regional Office",
                "streetAddress": "Dubai Industrial City",
                "addressLocality": "Dubai",
                "addressCountry": "AE"
              },
              {
                "@type": "PostalAddress",
                "name": "Manufacturing Facility",
                "streetAddress": "Plot No. 456, GIDC Industrial Estate",
                "addressLocality": "Vadodara",
                "addressRegion": "Gujarat",
                "postalCode": "390003",
                "addressCountry": "IN"
              }
            ],
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+1-713-555-0123",
                "email": "info@wellheadequipment.com",
                "contactType": "customer service",
                "areaServed": "Worldwide",
                "availableLanguage": ["English", "Spanish"]
              },
              {
                "@type": "ContactPoint",
                "telephone": "+971-4-555-0123",
                "email": "middleeast@wellheadequipment.com",
                "contactType": "customer service",
                "areaServed": "Middle East",
                "availableLanguage": ["English", "Arabic", "Hindi"]
              },
              {
                "@type": "ContactPoint",
                "telephone": "+1-713-911-4357",
                "email": "emergency@wellheadequipment.com",
                "contactType": "emergency",
                "areaServed": "Worldwide",
                "availableLanguage": ["English"]
              }
            ],
            "sameAs": [
              "https://www.linkedin.com/company/wellhead-equipment-engineers",
              "https://twitter.com/WellheadEquip"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Oil and Gas Equipment",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Wellhead Equipment",
                    "category": "Oil and Gas Equipment"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Pressure Vessels",
                    "category": "Oil and Gas Equipment"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Sand Management Systems",
                    "category": "Oil and Gas Equipment"
                  }
                }
              ]
            },
            "makesOffer": [
              {
                "@type": "Offer",
                "name": "Engineering Services",
                "description": "Custom engineering solutions for oil and gas equipment"
              },
              {
                "@type": "Offer",
                "name": "Manufacturing Services",
                "description": "High-quality manufacturing of oil and gas equipment"
              },
              {
                "@type": "Offer",
                "name": "Technical Support",
                "description": "24/7 technical support and maintenance services"
              }
            ]
          })
        }}
      />
      
      {/* Website Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Wellhead Equipment Engineers",
            "url": siteUrl,
            "description": description,
            "publisher": {
              "@type": "Organization",
              "name": "Wellhead Equipment Engineers"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      {/* Local Business Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Wellhead Equipment Engineers",
            "image": `${siteUrl}/assets/images/headquarters.jpg`,
            "telephone": "+1-713-555-0123",
            "email": "info@wellheadequipment.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Industrial Drive",
              "addressLocality": "Houston",
              "addressRegion": "TX",
              "postalCode": "77001",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 29.7604,
              "longitude": -95.3698
            },
            "url": siteUrl,
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "18:00"
              }
            ],
            "priceRange": "$$$$",
            "currenciesAccepted": "USD",
            "paymentAccepted": "Cash, Credit Card, Bank Transfer",
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": 29.7604,
                "longitude": -95.3698
              },
              "geoRadius": "50000"
            }
          })
        }}
      />
    </>
  );
};

export default SEO;