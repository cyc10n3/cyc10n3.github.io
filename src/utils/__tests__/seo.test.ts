// Tests for SEO utility functions
import {
  generateMetaTags,
  generateStructuredData,
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateCanonicalUrl,
  generateBreadcrumbStructuredData
} from '../seo';

describe('generateMetaTags', () => {
  const mockSeoData = {
    title: 'Test Page Title',
    description: 'Test page description for SEO',
    keywords: ['test', 'seo', 'keywords'],
    author: 'Test Author',
    robots: 'index,follow' as const,
    canonical: 'https://example.com/test-page'
  };

  it('generates basic meta tags', () => {
    const metaTags = generateMetaTags(mockSeoData);

    expect(metaTags).toContainEqual({
      name: 'description',
      content: 'Test page description for SEO'
    });

    expect(metaTags).toContainEqual({
      name: 'keywords',
      content: 'test,seo,keywords'
    });

    expect(metaTags).toContainEqual({
      name: 'author',
      content: 'Test Author'
    });

    expect(metaTags).toContainEqual({
      name: 'robots',
      content: 'index,follow'
    });
  });

  it('handles missing optional fields', () => {
    const minimalSeoData = {
      title: 'Test Title',
      description: 'Test description'
    };

    const metaTags = generateMetaTags(minimalSeoData);

    expect(metaTags).toContainEqual({
      name: 'description',
      content: 'Test description'
    });

    // Should not include undefined fields
    expect(metaTags.find(tag => tag.name === 'keywords')).toBeUndefined();
    expect(metaTags.find(tag => tag.name === 'author')).toBeUndefined();
  });

  it('includes viewport meta tag', () => {
    const metaTags = generateMetaTags(mockSeoData);

    expect(metaTags).toContainEqual({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    });
  });

  it('includes charset meta tag', () => {
    const metaTags = generateMetaTags(mockSeoData);

    expect(metaTags).toContainEqual({
      charset: 'utf-8'
    });
  });
});

describe('generateOpenGraphTags', () => {
  const mockOgData = {
    title: 'OG Test Title',
    description: 'OG test description',
    image: 'https://example.com/og-image.jpg',
    url: 'https://example.com/test-page',
    type: 'website' as const,
    siteName: 'Test Site'
  };

  it('generates Open Graph meta tags', () => {
    const ogTags = generateOpenGraphTags(mockOgData);

    expect(ogTags).toContainEqual({
      property: 'og:title',
      content: 'OG Test Title'
    });

    expect(ogTags).toContainEqual({
      property: 'og:description',
      content: 'OG test description'
    });

    expect(ogTags).toContainEqual({
      property: 'og:image',
      content: 'https://example.com/og-image.jpg'
    });

    expect(ogTags).toContainEqual({
      property: 'og:url',
      content: 'https://example.com/test-page'
    });

    expect(ogTags).toContainEqual({
      property: 'og:type',
      content: 'website'
    });

    expect(ogTags).toContainEqual({
      property: 'og:site_name',
      content: 'Test Site'
    });
  });

  it('handles missing optional fields', () => {
    const minimalOgData = {
      title: 'OG Title',
      description: 'OG description'
    };

    const ogTags = generateOpenGraphTags(minimalOgData);

    expect(ogTags).toContainEqual({
      property: 'og:title',
      content: 'OG Title'
    });

    expect(ogTags.find(tag => tag.property === 'og:image')).toBeUndefined();
    expect(ogTags.find(tag => tag.property === 'og:url')).toBeUndefined();
  });
});

describe('generateTwitterCardTags', () => {
  const mockTwitterData = {
    card: 'summary_large_image' as const,
    title: 'Twitter Test Title',
    description: 'Twitter test description',
    image: 'https://example.com/twitter-image.jpg',
    site: '@testsite',
    creator: '@testcreator'
  };

  it('generates Twitter Card meta tags', () => {
    const twitterTags = generateTwitterCardTags(mockTwitterData);

    expect(twitterTags).toContainEqual({
      name: 'twitter:card',
      content: 'summary_large_image'
    });

    expect(twitterTags).toContainEqual({
      name: 'twitter:title',
      content: 'Twitter Test Title'
    });

    expect(twitterTags).toContainEqual({
      name: 'twitter:description',
      content: 'Twitter test description'
    });

    expect(twitterTags).toContainEqual({
      name: 'twitter:image',
      content: 'https://example.com/twitter-image.jpg'
    });

    expect(twitterTags).toContainEqual({
      name: 'twitter:site',
      content: '@testsite'
    });

    expect(twitterTags).toContainEqual({
      name: 'twitter:creator',
      content: '@testcreator'
    });
  });

  it('defaults to summary card type', () => {
    const minimalTwitterData = {
      title: 'Twitter Title',
      description: 'Twitter description'
    };

    const twitterTags = generateTwitterCardTags(minimalTwitterData);

    expect(twitterTags).toContainEqual({
      name: 'twitter:card',
      content: 'summary'
    });
  });
});

describe('generateStructuredData', () => {
  const mockOrganizationData = {
    type: 'Organization' as const,
    name: 'Test Organization',
    url: 'https://example.com',
    logo: 'https://example.com/logo.jpg',
    description: 'Test organization description',
    address: {
      streetAddress: '123 Test St',
      addressLocality: 'Test City',
      addressRegion: 'Test State',
      postalCode: '12345',
      addressCountry: 'US'
    },
    contactPoint: {
      telephone: '+1-555-123-4567',
      contactType: 'customer service'
    }
  };

  it('generates organization structured data', () => {
    const structuredData = generateStructuredData(mockOrganizationData);

    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test Organization',
      url: 'https://example.com',
      logo: 'https://example.com/logo.jpg',
      description: 'Test organization description',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Test St',
        addressLocality: 'Test City',
        addressRegion: 'Test State',
        postalCode: '12345',
        addressCountry: 'US'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service'
      }
    });
  });

  it('generates product structured data', () => {
    const mockProductData = {
      type: 'Product' as const,
      name: 'Test Product',
      description: 'Test product description',
      image: 'https://example.com/product.jpg',
      brand: 'Test Brand',
      sku: 'TEST-SKU-123',
      offers: {
        price: '99.99',
        priceCurrency: 'USD',
        availability: 'InStock'
      }
    };

    const structuredData = generateStructuredData(mockProductData);

    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
      description: 'Test product description',
      image: 'https://example.com/product.jpg',
      brand: 'Test Brand',
      sku: 'TEST-SKU-123',
      offers: {
        '@type': 'Offer',
        price: '99.99',
        priceCurrency: 'USD',
        availability: 'InStock'
      }
    });
  });
});

describe('generateCanonicalUrl', () => {
  it('generates canonical URL from base and path', () => {
    const canonical = generateCanonicalUrl('https://example.com', '/test-page');
    expect(canonical).toBe('https://example.com/test-page');
  });

  it('handles trailing slashes correctly', () => {
    const canonical1 = generateCanonicalUrl('https://example.com/', '/test-page');
    const canonical2 = generateCanonicalUrl('https://example.com', 'test-page');
    
    expect(canonical1).toBe('https://example.com/test-page');
    expect(canonical2).toBe('https://example.com/test-page');
  });

  it('handles empty path', () => {
    const canonical = generateCanonicalUrl('https://example.com', '');
    expect(canonical).toBe('https://example.com');
  });

  it('handles root path', () => {
    const canonical = generateCanonicalUrl('https://example.com', '/');
    expect(canonical).toBe('https://example.com');
  });
});

describe('generateBreadcrumbStructuredData', () => {
  const mockBreadcrumbs = [
    { name: 'Home', url: 'https://example.com' },
    { name: 'Products', url: 'https://example.com/products' },
    { name: 'Test Product', url: 'https://example.com/products/test-product' }
  ];

  it('generates breadcrumb structured data', () => {
    const structuredData = generateBreadcrumbStructuredData(mockBreadcrumbs);

    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://example.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: 'https://example.com/products'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Test Product',
          item: 'https://example.com/products/test-product'
        }
      ]
    });
  });

  it('handles empty breadcrumbs', () => {
    const structuredData = generateBreadcrumbStructuredData([]);

    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: []
    });
  });

  it('handles single breadcrumb', () => {
    const singleBreadcrumb = [{ name: 'Home', url: 'https://example.com' }];
    const structuredData = generateBreadcrumbStructuredData(singleBreadcrumb);

    expect(structuredData.itemListElement).toHaveLength(1);
    expect(structuredData.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com'
    });
  });
});