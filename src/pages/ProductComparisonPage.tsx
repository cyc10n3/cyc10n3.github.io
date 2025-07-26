import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer, SEO, Breadcrumb } from '@/components/layout';
import { Button, Card } from '@/components/common';
import { useComparison } from '@/contexts/ComparisonContext';
import { getFallbackContent, getFallbackImage } from '@/utils/fallbacks';
import type { Product } from '@/types';

const ProductComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  useEffect(() => {
    if (comparisonProducts.length === 0) {
      navigate('/products');
    }
  }, [comparisonProducts.length, navigate]);

  if (comparisonProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products to Compare</h2>
          <p className="text-gray-600 mb-6">Add products to comparison from the products page.</p>
          <Link to="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Compare Products', href: '/products/compare' }
  ];

  // Get all unique specification categories
  const allSpecCategories = Array.from(
    new Set(
      comparisonProducts.flatMap(product => 
        product.specifications.map(spec => spec.category)
      )
    )
  );

  // Get all unique features
  const allFeatures = Array.from(
    new Set(comparisonProducts.flatMap(product => product.features))
  );

  // Get all unique applications
  const allApplications = Array.from(
    new Set(comparisonProducts.flatMap(product => product.applications))
  );

  // Get all unique certifications
  const allCertifications = Array.from(
    new Set(comparisonProducts.flatMap(product => product.certifications))
  );

  const handleExportComparison = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product-comparison.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = () => {
    const headers = ['Specification', ...comparisonProducts.map(p => p.name)];
    const rows = [headers];

    // Add basic info
    rows.push(['Product Name', ...comparisonProducts.map(p => p.name)]);
    rows.push(['Category', ...comparisonProducts.map(p => p.category.replace('-', ' '))]);
    rows.push(['Description', ...comparisonProducts.map(p => p.description)]);

    // Add specifications
    allSpecCategories.forEach(category => {
      const categorySpecs = comparisonProducts[0].specifications
        .filter(spec => spec.category === category)
        .map(spec => spec.name);

      categorySpecs.forEach(specName => {
        const row = [specName];
        comparisonProducts.forEach(product => {
          const spec = product.specifications.find(s => s.name === specName);
          row.push(spec ? `${spec.value} ${spec.unit || ''}`.trim() : 'N/A');
        });
        rows.push(row);
      });
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const getSpecificationValue = (product: Product, specName: string) => {
    const spec = product.specifications.find(s => s.name === specName);
    return spec ? `${spec.value} ${spec.unit || ''}`.trim() : 'N/A';
  };

  const hasFeature = (product: Product, feature: string) => {
    return product.features.includes(feature);
  };

  const hasApplication = (product: Product, application: string) => {
    return product.applications.includes(application);
  };

  const hasCertification = (product: Product, certification: string) => {
    return product.certifications.includes(certification);
  };

  return (
    <>
      <SEO
        title="Compare Products | Oil & Gas Equipment | Wellhead Equipment Engineers"
        description="Compare oil and gas equipment specifications, features, and applications side by side to find the perfect solution for your needs."
        keywords={['product comparison', 'oil gas equipment comparison', 'specifications comparison']}
        canonicalUrl="/products/compare"
      />

      <Header />

      <main id="main-content">
        {/* Breadcrumb */}
        <section className="bg-gray-50 py-4">
          <div className="container">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </section>

        {/* Header */}
        <section className="bg-white py-8 border-b border-gray-200">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Product Comparison
                </h1>
                <p className="text-gray-600">
                  Compare {comparisonProducts.length} products side by side
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showDifferencesOnly}
                    onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Show differences only</span>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportComparison}
                >
                  Export CSV
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearComparison}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Overview */}
        <section className="bg-gray-50 py-8">
          <div className="container">
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${comparisonProducts.length}, 1fr)` }}>
              {comparisonProducts.map((product) => {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                const imageProps = getFallbackImage(primaryImage?.url, primaryImage?.alt || product.name);

                return (
                  <Card key={product.id} className="p-6 text-center">
                    <div className="relative mb-4">
                      <img
                        {...imageProps}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFromComparison(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        aria-label={`Remove ${product.name} from comparison`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {getFallbackContent(product.name)}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {getFallbackContent(product.description)}
                    </p>

                    <div className="flex flex-col gap-2">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="secondary" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.location.href = `/contact?product=${product.id}`}
                      >
                        Request Quote
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Specifications Comparison */}
        <section className="bg-white py-8">
          <div className="container">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
            
            {allSpecCategories.map((category) => {
              const categorySpecs = comparisonProducts[0].specifications
                .filter(spec => spec.category === category)
                .map(spec => spec.name);

              return (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {category}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                            Specification
                          </th>
                          {comparisonProducts.map((product) => (
                            <th key={product.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                              {product.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categorySpecs.map((specName, index) => {
                          const values = comparisonProducts.map(product => getSpecificationValue(product, specName));
                          const hasVariation = new Set(values).size > 1;
                          
                          if (showDifferencesOnly && !hasVariation) {
                            return null;
                          }

                          return (
                            <tr key={specName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                {specName}
                              </td>
                              {comparisonProducts.map((product) => {
                                const value = getSpecificationValue(product, specName);
                                return (
                                  <td key={product.id} className={`px-4 py-3 text-sm text-center border-r border-gray-200 last:border-r-0 ${
                                    hasVariation && showDifferencesOnly ? 'bg-yellow-50' : ''
                                  }`}>
                                    {value}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Comparison */}
        <section className="bg-gray-50 py-8">
          <div className="container">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Features Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                      Feature
                    </th>
                    {comparisonProducts.map((product) => (
                      <th key={product.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, index) => {
                    const hasVariation = comparisonProducts.some(p => hasFeature(p, feature)) && 
                                        comparisonProducts.some(p => !hasFeature(p, feature));
                    
                    if (showDifferencesOnly && !hasVariation) {
                      return null;
                    }

                    return (
                      <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {feature}
                        </td>
                        {comparisonProducts.map((product) => (
                          <td key={product.id} className={`px-4 py-3 text-center border-r border-gray-200 last:border-r-0 ${
                            hasVariation && showDifferencesOnly ? 'bg-yellow-50' : ''
                          }`}>
                            {hasFeature(product, feature) ? (
                              <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Applications Comparison */}
        <section className="bg-white py-8">
          <div className="container">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                      Application
                    </th>
                    {comparisonProducts.map((product) => (
                      <th key={product.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allApplications.map((application, index) => {
                    const hasVariation = comparisonProducts.some(p => hasApplication(p, application)) && 
                                        comparisonProducts.some(p => !hasApplication(p, application));
                    
                    if (showDifferencesOnly && !hasVariation) {
                      return null;
                    }

                    return (
                      <tr key={application} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {application}
                        </td>
                        {comparisonProducts.map((product) => (
                          <td key={product.id} className={`px-4 py-3 text-center border-r border-gray-200 last:border-r-0 ${
                            hasVariation && showDifferencesOnly ? 'bg-yellow-50' : ''
                          }`}>
                            {hasApplication(product, application) ? (
                              <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Certifications Comparison */}
        <section className="bg-gray-50 py-8">
          <div className="container">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications & Standards</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                      Certification
                    </th>
                    {comparisonProducts.map((product) => (
                      <th key={product.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allCertifications.map((certification, index) => {
                    const hasVariation = comparisonProducts.some(p => hasCertification(p, certification)) && 
                                        comparisonProducts.some(p => !hasCertification(p, certification));
                    
                    if (showDifferencesOnly && !hasVariation) {
                      return null;
                    }

                    return (
                      <tr key={certification} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                          {certification}
                        </td>
                        {comparisonProducts.map((product) => (
                          <td key={product.id} className={`px-4 py-3 text-center border-r border-gray-200 last:border-r-0 ${
                            hasVariation && showDifferencesOnly ? 'bg-yellow-50' : ''
                          }`}>
                            {hasCertification(product, certification) ? (
                              <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make a Decision?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Contact our technical team to discuss which products best meet your specific requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Get Expert Consultation
                </Button>
              </Link>
              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Browse More Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ProductComparisonPage;