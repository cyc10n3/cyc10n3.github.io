import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common';
import { getFallbackImage } from '@/utils/fallbacks';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
}

const EquipmentGallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('equipment-gallery');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedImage) {
        if (event.key === 'Escape') {
          setSelectedImage(null);
        } else if (event.key === 'ArrowLeft') {
          navigateImage('prev');
        } else if (event.key === 'ArrowRight') {
          navigateImage('next');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      src: '/assets/images/gallery-1.webp',
      alt: 'Wellhead Equipment Installation',
      title: 'Wellhead Equipment',
      category: 'wellhead'
    },
    {
      id: '2',
      src: '/assets/images/gallery-2.webp',
      alt: 'Pressure Vessel Equipment',
      title: 'Pressure Vessel System',
      category: 'pressure-vessels'
    },
    {
      id: '3',
      src: '/assets/images/gallery-3.webp',
      alt: 'Sand Management System',
      title: 'Sand Management Equipment',
      category: 'sand-management'
    },
    {
      id: '4',
      src: '/assets/images/gallery-4.webp',
      alt: 'Pressure Control Equipment',
      title: 'Pressure Control System',
      category: 'pressure-control'
    },
    {
      id: '5',
      src: '/assets/images/gallery-5.webp',
      alt: 'Storage Tank System',
      title: 'Storage Tank Installation',
      category: 'storage'
    },
    {
      id: '6',
      src: '/assets/images/services-equipment.webp',
      alt: 'Surface Welltest Unit',
      title: 'Surface Welltest Equipment',
      category: 'wellhead'
    },
    {
      id: '7',
      src: '/assets/images/products-equipment.webp',
      alt: 'Flow Line Equipment',
      title: 'Flow Line System',
      category: 'flow-line'
    },
    {
      id: '8',
      src: '/assets/images/hero-equipment.webp',
      alt: 'Oil and Gas Equipment',
      title: 'Complete Equipment Package',
      category: 'custom'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Equipment' },
    { id: 'wellhead', label: 'Wellhead' },
    { id: 'pressure-vessels', label: 'Pressure Vessels' },
    { id: 'sand-management', label: 'Sand Management' },
    { id: 'pressure-control', label: 'Pressure Control' },
    { id: 'storage', label: 'Storage' },
    { id: 'flow-line', label: 'Flow Line' },
    { id: 'custom', label: 'Custom Solutions' }
  ];

  const filteredImages = activeFilter === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeFilter);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <section id="equipment-gallery" className="section-padding bg-white">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Equipment Gallery</h2>
          <p className="section-subtitle">
            See our high-quality oil and gas equipment in action across various projects and installations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === category.id
                  ? 'bg-primary-500 text-white shadow-custom'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => {
            const imageProps = getFallbackImage(image.src, image.alt);
            
            return (
              <div
                key={image.id}
                className={`group cursor-pointer transform transition-all duration-700 ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => openLightbox(image)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(image);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${image.title} in lightbox`}
              >
                <div className="relative overflow-hidden rounded-xl shadow-custom hover:shadow-custom-hover transition-all duration-300 group-hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative aspect-square">
                    <img
                      {...imageProps}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                      <p className="text-sm text-gray-200 capitalize">
                        {image.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-500">Try selecting a different category to view more equipment.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={closeLightbox}
          size="xl"
        >
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.src = '/assets/images/placeholder.webp';
                }}
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white rounded-b-lg">
                <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-200 capitalize">
                  {selectedImage.category.replace('-', ' ')} Equipment
                </p>
                <div className="mt-2 text-sm text-gray-300">
                  Image {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} of {filteredImages.length}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default EquipmentGallery;