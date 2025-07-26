import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import type { Service } from '@/types';
import { getFallbackContent, getFallbackImage } from '@/utils/fallbacks';

interface ServiceCardProps {
  service: Service;
  layout?: 'vertical' | 'horizontal';
  onRequestService?: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  layout = 'vertical',
  onRequestService
}) => {
  const primaryImage = service.images?.[0];
  const imageProps = getFallbackImage(primaryImage, service.title);

  if (layout === 'horizontal') {
    return (
      <Card className="group hover:shadow-custom-hover transition-all duration-300 border-0 overflow-hidden h-full">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image */}
          <div className="lg:w-2/5 relative">
            <div className="aspect-video lg:aspect-auto lg:h-full relative overflow-hidden">
              <img
                {...imageProps}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {service.featured && (
                <div className="absolute top-3 left-3 bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ Featured
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {service.category}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/5 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {service.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {getFallbackContent(service.title)}
                </h3>
                
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {getFallbackContent(service.description)}
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Key Features:</h4>
                {service.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 line-clamp-1">{feature.title}</span>
                  </div>
                ))}
                {service.features.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{service.features.length - 3} more features
                  </div>
                )}
              </div>

              {/* Certifications */}
              {service.certifications && service.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {service.certifications.slice(0, 3).map((cert, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-success-50 text-success-700 rounded text-xs font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                  {service.certifications.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{service.certifications.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link to={`/services/${service.slug}`} className="flex-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full group-hover:bg-primary-50 group-hover:border-primary-200 transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
              {onRequestService && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRequestService(service.id)}
                  className="flex-1"
                >
                  Request Service
                </Button>
              )}
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
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          <img
            {...imageProps}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {service.featured && (
              <div className="bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ⭐ Featured
              </div>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {service.category}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link to={`/services/${service.slug}`} className="flex-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white"
              >
                Learn More
              </Button>
            </Link>
            {onRequestService && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestService(service.id);
                }}
                className="flex-1"
              >
                Request
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{service.icon}</span>
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                {service.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {getFallbackContent(service.title)}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {getFallbackContent(service.description)}
            </p>

            {/* Key Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Key Features:</h4>
              {service.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 line-clamp-1">{feature.title}</span>
                </div>
              ))}
              {service.features.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{service.features.length - 2} more features
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          {service.certifications && service.certifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {service.certifications.slice(0, 3).map((cert, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-success-50 text-success-700 rounded text-xs font-medium"
                  >
                    {cert}
                  </span>
                ))}
                {service.certifications.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{service.certifications.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Link to={`/services/${service.slug}`} className="flex-1">
              <Button
                variant="secondary"
                size="sm"
                className="w-full group-hover:bg-primary-50 group-hover:border-primary-200 transition-all duration-300"
              >
                Learn More
              </Button>
            </Link>
            {onRequestService && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRequestService(service.id)}
                className="flex-1"
              >
                Request Service
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;