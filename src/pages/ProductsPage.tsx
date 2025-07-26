import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productsData from '../data/products.json';

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Set category from URL parameter
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'pressure-vessels', name: 'Pressure Vessels' },
    { id: 'sand-management', name: 'Sand Management' },
    { id: 'flow-line', name: 'Flow Line Equipment' },
  ];

  const products = productsData;

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive range of oil and gas equipment designed and manufactured 
            to the highest industry standards.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0].url} 
                    alt={product.images[0].alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-gray-500">No Image Available</span>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  {product.featured && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                
                {/* Specifications */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Specifications:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.specifications.slice(0, 3).map((spec, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        <span className="font-medium">{spec.name}:</span> 
                        <span className="ml-1">{spec.value} {spec.unit || ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Certifications */}
                {product.certifications && product.certifications.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.map((cert, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/contact?product=${product.id}&subject=quote`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Request Quote
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-gray-600 mb-6">
            Our engineering team can design and manufacture custom equipment 
            to meet your specific requirements.
          </p>
          <button 
            onClick={() => window.location.href = '/contact?subject=engineering&message=I am interested in custom engineering solutions.'}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Engineering Team
          </button>
        </div>

        {/* Product Detail Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div>
                    {selectedProduct.images && selectedProduct.images.length > 0 && (
                      <img 
                        src={selectedProduct.images[0].url} 
                        alt={selectedProduct.images[0].alt}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div>
                    <p className="text-gray-600 mb-4">{selectedProduct.longDescription || selectedProduct.description}</p>
                    
                    {/* Specifications */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Specifications:</h3>
                      <div className="space-y-1">
                        {selectedProduct.specifications.map((spec: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-medium">{spec.name}:</span>
                            <span>{spec.value} {spec.unit || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
                      <ul className="text-sm space-y-1">
                        {selectedProduct.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Applications */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Applications:</h3>
                      <ul className="text-sm space-y-1">
                        {selectedProduct.applications.map((app: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {app}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Certifications */}
                    {selectedProduct.certifications && selectedProduct.certifications.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Certifications:</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedProduct.certifications.map((cert: string, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => {
                          window.location.href = `/contact?product=${selectedProduct.id}&subject=quote`;
                          setShowModal(false);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Request Quote
                      </button>
                      <button 
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;