import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/common';
import { getFallbackImage } from '@/utils/fallbacks';

const ComparisonBar: React.FC = () => {
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();
  const [isExpanded, setIsExpanded] = useState(false);

  if (comparisonProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Comparison Info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">
                Compare Products ({comparisonProducts.length})
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isExpanded && (
              <div className="flex items-center space-x-2">
                {comparisonProducts.slice(0, 3).map((product) => {
                  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                  const imageProps = getFallbackImage(primaryImage?.url, primaryImage?.alt || product.name);
                  
                  return (
                    <div key={product.id} className="relative">
                      <img
                        {...imageProps}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  );
                })}
                {comparisonProducts.length > 3 && (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    +{comparisonProducts.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={clearComparison}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Clear All
            </button>
            
            <Link to="/products/compare">
              <Button variant="primary" size="sm">
                Compare Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="border-t border-gray-200 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {comparisonProducts.map((product) => {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                const imageProps = getFallbackImage(primaryImage?.url, primaryImage?.alt || product.name);
                
                return (
                  <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      {...imageProps}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {product.category.replace('-', ' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromComparison(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${product.name} from comparison`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonBar;