import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
  objectPosition = 'center',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const formats = ['webp', 'avif'];
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    
    // Extract file extension and name
    const lastDotIndex = baseSrc.lastIndexOf('.');
    const extension = lastDotIndex !== -1 ? baseSrc.substring(lastDotIndex + 1) : 'jpg';
    const nameWithoutExt = lastDotIndex !== -1 ? baseSrc.substring(0, lastDotIndex) : baseSrc;
    
    // Generate srcset for different sizes
    const srcSet = sizes.map(size => {
      return `${nameWithoutExt}-${size}w.${extension} ${size}w`;
    }).join(', ');
    
    return srcSet;
  };

  // Generate WebP and AVIF sources
  const generateModernSources = (baseSrc: string) => {
    const lastDotIndex = baseSrc.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex !== -1 ? baseSrc.substring(0, lastDotIndex) : baseSrc;
    
    return {
      avif: `${nameWithoutExt}.avif`,
      webp: `${nameWithoutExt}.webp`
    };
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const modernSources = generateModernSources(src);
  const srcSet = generateSrcSet(src);

  // Placeholder component
  const Placeholder = () => (
    <div
      className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '200px',
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  // Error component
  const ErrorFallback = () => (
    <div
      className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '200px',
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      <div className="text-center text-gray-500">
        <svg
          className="w-8 h-8 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-sm">Image failed to load</p>
      </div>
    </div>
  );

  if (hasError) {
    return <ErrorFallback />;
  }

  if (!isInView && !priority) {
    return (
      <div ref={imgRef}>
        <Placeholder />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className={`absolute inset-0 ${className}`}
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Loading placeholder */}
      {!isLoaded && placeholder === 'empty' && <Placeholder />}

      {/* Optimized picture element with modern formats */}
      <picture className={isLoaded ? '' : 'opacity-0'}>
        {/* AVIF format for modern browsers */}
        <source
          srcSet={`${modernSources.avif} 1x`}
          type="image/avif"
          sizes={sizes}
        />
        
        {/* WebP format for most browsers */}
        <source
          srcSet={`${modernSources.webp} 1x`}
          type="image/webp"
          sizes={sizes}
        />
        
        {/* Fallback to original format */}
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          decoding="async"
          className={`transition-opacity duration-300 ${className}`}
          style={{
            objectFit,
            objectPosition,
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;