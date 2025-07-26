import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header, Footer, SEO, Breadcrumb } from '@/components/layout';
import { Button, Card, Modal } from '@/components/common';
import { ProductCard } from '@/components/sections';
import { useComparison } from '@/contexts/ComparisonContext';
import type { Product } from '@/types';
import { ProductCategory } from '@/types';
import { getFallbackContent, getFallbackImage } from '@/utils/fallbacks';
import { generateProductStructuredData, generateBreadcrumbStructuredData } from '@/utils/seo';
import productsData from '@/data/products.json';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useComparison();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features' | 'applications'>('overview');

  // Load product data
  useEffect(() => {
    if (!productId) {
      navigate('/products');
      return;
    }

    const foundProduct = (productsData as Product[]).find(p => p.id === productId);
    if (!foundProduct) {
      navigate('/products');
      return;
    }

    setProduct(foundProduct);

    // Load related products
    const related = (productsData as Product[])
      .filter(p => 
        p.id !== productId && 
        (p.category === foundProduct.category || 
         foundProduct.relatedProducts.includes(p.id))
      )
      .slice(0, 4);
    
    setRelatedProducts(related);
  }, [productId, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), href: `/products?category=${product.category}` },
    { label: product.name, href: `/products/${product.id}` }
  ];

  const handleRequestQuote = () => {
    window.location.href = `/contact?product=${product.id}`;
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const getCategoryDisplay = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const groupedSpecifications = product.specifications.reduce((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {} as Record<string, typeof product.specifications>);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/products?category=${product.category}` },
    { label: product.name, href: `/products/${product.id}` }
  ];

  const productStructuredData = generateProductStructuredData({
    name: product.name,
    description: product.longDescription || product.description,
    image: product.images[0],
    category: product.category,
    brand: 'Wellhead Equipment Engineers',
    model: product.model,
    sku: product.id,
    availability: 'InStock',
    condition: 'NewCondition',
    specifications: product.specifications.reduce((acc, spec) => {
      acc[spec.name] = spec.value;
      return acc;
    }, {} as Record<string, string>)
  }, 'https://www.wellheadequipment.com');

  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbItems, 'https://www.wellheadequipment.com');

  return (
    <>
      <SEO
        title={`${product.name} | Oil & Gas Equipment | Wellhead Equipment Engineers`}
        description={product.longDescription || product.description}
        keywords={[
          product.name.toLowerCase(),
          product.category,
          ...product.features.slice(0, 5),
          ...product.certifications
        ]}
        canonicalUrl={`/products/${product.id}`}
        ogType="product"
        ogImage={product.images[0]}
        product={{
          name: product.name,
          description: product.longDescription || product.description,
          image: product.images[0],
          brand: 'Wellhead Equipment Engineers',
          category: product.category,
          availability: 'InStock',
          condition: 'NewCondition'
        }}
        breadcrumbs={breadcrumbItems}
        structuredData={[productStructuredData, breadcrumbStructuredData]}
      />

      <Header />

      <main id="main-content">
        {/* Breadcrumb */}
        <section className="bg-gray-50 py-4">
          <div className="container">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </section>

        {/* Product Header */}
        <section className="section-padding bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group">
                  <img
                    {...getFallbackImage(
                      product.images[selectedImageIndex]?.url || primaryImage?.url,
                      product.images[selectedImageIndex]?.alt || primaryImage?.alt || product.name
                    )}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onClick={() => handleImageClick(selectedImageIndex)}
                  />
                  
                  {/* Zoom Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'border-primary-500 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          {...getFallbackImage(image.url, image.alt)}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {getCategoryDisplay(product.category)}
                    </span>
                    {product.featured && (
                      <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                        ⭐ Featured Product
                      </span>
                    )}
                    {product.status === 'coming-soon' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {getFallbackContent(product.name)}
                  </h1>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {getFallbackContent(product.longDescription || product.description)}
                  </p>
                </div>

                {/* Key Specifications */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.slice(0, 6).map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">{spec.name}:</span>
                        <span className="text-gray-900 font-semibold">
                          {spec.value} {spec.unit && <span className="text-gray-500">{spec.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {product.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications & Standards</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-success-50 text-success-700 rounded-lg text-sm font-medium border border-success-200"
                        >
                          ✓ {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleRequestQuote}
                      className="flex-1"
                    >
                      Request Quote
                    </Button>
                    <Link to="/contact" className="flex-1">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full"
                      >
                        Contact Sales
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.print()}
                    >
                      Print Details
                    </Button>
                  </div>
                  
                  {/* Comparison Button */}
                  <Button
                    variant={isInComparison(product.id) ? "outline" : "ghost"}
                    size="lg"
                    onClick={() => {
                      if (isInComparison(product.id)) {
                        removeFromComparison(product.id);
                      } else if (canAddMore) {
                        addToComparison(product);
                      }
                    }}
                    disabled={!isInComparison(product.id) && !canAddMore}
                    className={`w-full transition-all duration-300 ${
                      isInComparison(product.id)
                        ? 'border-accent-500 text-accent-600 bg-accent-50' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {isInComparison(product.id) ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Compare
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {canAddMore ? 'Add to Compare' : 'Compare Full (Max 4)'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="section-padding bg-gray-50">
          <div className="container">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'specifications', label: 'Specifications', icon: '⚙️' },
                { id: 'features', label: 'Features', icon: '✨' },
                { id: 'applications', label: 'Applications', icon: '🔧' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-custom'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
              {activeTab === 'overview' && (
                <Card className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Overview</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {getFallbackContent(product.longDescription || product.description)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h4>
                        <ul className="space-y-2">
                          {product.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Primary Applications</h4>
                        <ul className="space-y-2">
                          {product.applications.slice(0, 5).map((application, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <svg className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">{application}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'specifications' && (
                <Card className="p-8">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Technical Specifications</h3>
                      <p className="text-gray-600 mb-6">
                        Detailed technical specifications and performance parameters for {product.name}.
                      </p>
                    </div>

                    {Object.entries(groupedSpecifications).map(([category, specs]) => (
                      <div key={category} className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {specs.map((spec, index) => (
                            <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                              <span className="text-gray-600 font-medium">{spec.name}</span>
                              <span className="text-gray-900 font-semibold">
                                {spec.value} {spec.unit && <span className="text-gray-500">{spec.unit}</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab === 'features' && (
                <Card className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Features</h3>
                      <p className="text-gray-600 mb-6">
                        Comprehensive list of features and capabilities that make {product.name} the ideal choice for your operations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {feature.split(' ').slice(0, 3).join(' ')}
                            </h5>
                            <p className="text-gray-600 text-sm">{feature}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'applications' && (
                <Card className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Applications & Use Cases</h3>
                      <p className="text-gray-600 mb-6">
                        Explore the various applications and use cases where {product.name} delivers exceptional performance.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.applications.map((application, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300">
                          <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {application.split(' ').slice(0, 2).join(' ')}
                            </h5>
                            <p className="text-gray-600 text-sm">{application}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section-padding bg-white">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Related Products
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore other products that complement {product.name} or serve similar applications
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((relatedProduct, index) => (
                  <div
                    key={relatedProduct.id}
                    className="transform transition-all duration-700 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard
                      product={relatedProduct}
                      onViewDetails={(id) => navigate(`/products/${id}`)}
                      onRequestQuote={(id) => window.location.href = `/contact?product=${id}`}
                    />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/products">
                  <Button variant="secondary" size="lg">
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Contact our technical team to discuss how {product.name} can meet your specific requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
                onClick={handleRequestQuote}
              >
                Request Detailed Quote
              </Button>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Image Modal */}
      {isImageModalOpen && (
        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          size="xl"
        >
          <div className="relative">
            {/* Navigation Buttons */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setSelectedImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <img
                {...getFallbackImage(
                  product.images[selectedImageIndex]?.url,
                  product.images[selectedImageIndex]?.alt || product.name
                )}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white rounded-b-lg">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-200">
                  {product.images[selectedImageIndex]?.caption || `${product.name} - Image ${selectedImageIndex + 1}`}
                </p>
                <div className="mt-2 text-sm text-gray-300">
                  Image {selectedImageIndex + 1} of {product.images.length}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductDetailPage;