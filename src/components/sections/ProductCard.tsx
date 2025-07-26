import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, OptimizedImage } from '@/components/common';
import { useComparison } from '@/contexts/ComparisonContext';
import type { Product } from '@/types';
import { getFallbackContent, getFallbackImage } from '@/utils/fallbacks';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
  onRequestQuote: (productId: string) => void;
  layout?: 'vertical' | 'horizontal';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onRequestQuote,
  layout = 'vertical'
}) => {
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useComparison();
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const imageProps = getFallbackImage(primaryImage?.url, primaryImage?.alt || product.name);
  
  const inComparison = isInComparison(product.id);

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inComparison) {
      removeFromComparison(product.id);
    } else if (canAddMore) {
      addToComparison(product);
    }
  };

  // Get category display name
  const getCategoryDisplay = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get key specifications for display
  const getKeySpecs = () => {
    const keySpecs = product.specifications.slice(0, 3);
    return keySpecs.map(spec => ({
      name: spec.name,
      value: `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`
    }));
  };

  if (layout === 'horizontal') {
    return (
      <Card className="group hover:shadow-custom-hover transition-all duration-300 border-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/3 relative">
            <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
              <OptimizedImage
                src={imageProps.src}
                alt={imageProps.alt}
                className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {product.featured && (
                <div className="absolute top-3 left-3 bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ Featured
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {getCategoryDisplay(product.category)}
                  </span>
                  {product.status === 'coming-soon' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {getFallbackContent(product.name)}
                </h3>
                
                <p className="text-gray-600 leading-relaxed line-clamp-2">
                  {getFallbackContent(product.description)}
                </p>
              </div>

              {/* Key Specifications */}
              <div className="space-y-2">
                {getKeySpecs().map((spec, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{spec.name}:</span>
                    <span className="font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewDetails(product.id)}
                  className="flex-1 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all duration-300"
                >
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRequestQuote(product.id)}
                  className="flex-1"
                >
                  Request Quote
                </Button>
              </div>
              
              {/* Comparison Button */}
              <Button
                variant={inComparison ? "outline" : "ghost"}
                size="sm"
                onClick={handleComparisonToggle}
                disabled={!inComparison && !canAddMore}
                className={`w-full transition-all duration-300 ${
                  inComparison 
                    ? 'border-accent-500 text-accent-600 bg-accent-50' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {inComparison ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Compare
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {canAddMore ? 'Add to Compare' : 'Compare Full'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-custom-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 h-full">
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <OptimizedImage
            src={imageProps.src}
            alt={imageProps.alt}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            objectFit="cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <div className="bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ⭐ Featured
              </div>
            )}
            {product.status === 'coming-soon' && (
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Coming Soon
              </div>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {getCategoryDisplay(product.category)}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link to={`/products/${product.id}`} className="flex-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
              >
                Details
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRequestQuote(product.id);
              }}
              className="flex-1"
            >
              Quote
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {getFallbackContent(product.name)}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {getFallbackContent(product.description)}
            </p>

            {/* Key Features */}
            <div className="space-y-2">
              {product.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 line-clamp-1">{feature}</span>
                </div>
              ))}
              {product.features.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{product.features.length - 2} more features
                </div>
              )}
            </div>

            {/* Key Specifications */}
            <div className="space-y-1 pt-2 border-t border-gray-100">
              {getKeySpecs().slice(0, 2).map((spec, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 truncate">{spec.name}:</span>
                  <span className="font-medium text-gray-900 ml-2">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {product.certifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {product.certifications.slice(0, 3).map((cert, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-success-50 text-success-700 rounded text-xs font-medium"
                  >
                    {cert}
                  </span>
                ))}
                {product.certifications.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{product.certifications.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 mt-6">
            <div className="flex gap-3">
              <Link to={`/products/${product.id}`} className="flex-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full group-hover:bg-primary-50 group-hover:border-primary-200 transition-all duration-300"
                >
                  View Details
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRequestQuote(product.id)}
                className="flex-1"
              >
                Request Quote
              </Button>
            </div>
            
            {/* Comparison Button */}
            <Button
              variant={inComparison ? "outline" : "ghost"}
              size="sm"
              onClick={handleComparisonToggle}
              disabled={!inComparison && !canAddMore}
              className={`w-full transition-all duration-300 ${
                inComparison 
                  ? 'border-accent-500 text-accent-600 bg-accent-50' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {inComparison ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Compare
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {canAddMore ? 'Add to Compare' : 'Compare Full'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;