// SEO utility functions for generating structured data

export interface ProductSEO {
  name: string;
  description: string;
  image?: string;
  category: string;
  brand?: string;
  model?: string;
  sku?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  specifications?: Record<string, string>;
}

export interface ServiceSEO {
  name: string;
  description: string;
  provider: string;
  areaServed?: string;
  serviceType: string;
  image?: string;
}

export interface ArticleSEO {
  headline: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  section?: string;
  tags?: string[];
}

export const generateProductStructuredData = (product: ProductSEO, siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image ? `${siteUrl}${product.image}` : undefined,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Wellhead Equipment Engineers"
    },
    "category": product.category,
    "model": product.model,
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency || "USD",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "itemCondition": `https://schema.org/${product.condition || 'NewCondition'}`,
      "seller": {
        "@type": "Organization",
        "name": "Wellhead Equipment Engineers"
      }
    },
    "additionalProperty": product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({
      "@type": "PropertyValue",
      "name": key,
      "value": value
    })) : undefined
  };
};

export const generateServiceStructuredData = (service: ServiceSEO, siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": service.provider
    },
    "areaServed": service.areaServed || "Worldwide",
    "serviceType": service.serviceType,
    "image": service.image ? `${siteUrl}${service.image}` : undefined
  };
};

export const generateArticleStructuredData = (article: ArticleSEO, siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": article.image ? `${siteUrl}${article.image}` : undefined,
    "author": {
      "@type": "Person",
      "name": article.author
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
    "keywords": article.tags?.join(', ')
  };
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>, siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${siteUrl}${crumb.url}`
    }))
  };
};

export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateJobPostingStructuredData = (job: {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  datePosted: string;
  validThrough?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}, siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.datePosted,
    "validThrough": job.validThrough,
    "employmentType": job.employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Wellhead Equipment Engineers",
      "sameAs": siteUrl
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location
      }
    },
    "baseSalary": job.salary ? {
      "@type": "MonetaryAmount",
      "currency": job.salary.currency,
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary.min,
        "maxValue": job.salary.max,
        "unitText": "YEAR"
      }
    } : undefined
  };
};

export const generateReviewStructuredData = (reviews: Array<{
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Wellhead Equipment Engineers",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.datePublished
    }))
  };
};

// SEO meta tag generators
export const generatePageTitle = (pageTitle: string, includeCompany = true) => {
  if (includeCompany && !pageTitle.includes('Wellhead Equipment Engineers')) {
    return `${pageTitle} | Wellhead Equipment Engineers`;
  }
  return pageTitle;
};

export const generateMetaDescription = (description: string, maxLength = 160) => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + '...';
};

export const generateKeywords = (baseKeywords: string[], pageSpecificKeywords: string[] = []) => {
  const defaultKeywords = [
    'oil and gas equipment',
    'wellhead equipment',
    'pressure vessels',
    'sand management',
    'flow line equipment',
    'ASME certified',
    'API certified'
  ];
  
  return [...new Set([...baseKeywords, ...pageSpecificKeywords, ...defaultKeywords])];
};

export const generateCanonicalUrl = (path: string, baseUrl = 'https://www.wellheadequipment.com') => {
  return `${baseUrl}${path}`;
};

// Open Graph image generator
export const generateOGImage = (title: string, description?: string) => {
  // In a real application, this would generate dynamic OG images
  // For now, return default image paths
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';
  
  return `/assets/images/og-images/default.jpg?title=${encodedTitle}&description=${encodedDescription}`;
};