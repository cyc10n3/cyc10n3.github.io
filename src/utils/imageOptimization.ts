// Image optimization utilities

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
}

export interface ResponsiveImageConfig {
  breakpoints: { [key: string]: number };
  sizes: string;
  formats: string[];
}

// Generate responsive image URLs
export const generateResponsiveImageUrls = (
  baseSrc: string,
  config: ResponsiveImageConfig
): { [format: string]: string } => {
  const { breakpoints, formats } = config;
  const result: { [format: string]: string } = {};

  const lastDotIndex = baseSrc.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex !== -1 ? baseSrc.substring(0, lastDotIndex) : baseSrc;
  const originalExt = lastDotIndex !== -1 ? baseSrc.substring(lastDotIndex + 1) : 'jpg';

  formats.forEach(format => {
    const urls = Object.entries(breakpoints).map(([breakpoint, width]) => {
      const ext = format === 'original' ? originalExt : format;
      return `${nameWithoutExt}-${breakpoint}.${ext} ${width}w`;
    }).join(', ');
    
    result[format] = urls;
  });

  return result;
};

// Generate blur placeholder data URL
export const generateBlurDataURL = (width = 10, height = 10): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// Calculate optimal image dimensions
export const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  fit: 'cover' | 'contain' = 'contain'
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  if (fit === 'contain') {
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }
    
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  } else {
    // cover
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.max(widthRatio, heightRatio);
    
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (sources: string[]): Promise<void> => {
  const promises = sources.map(src => preloadImage(src).catch(() => {}));
  await Promise.allSettled(promises);
};

// Get image dimensions
export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Generate srcset for responsive images
export const generateSrcSet = (
  baseSrc: string,
  widths: number[],
  format?: string
): string => {
  const lastDotIndex = baseSrc.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex !== -1 ? baseSrc.substring(0, lastDotIndex) : baseSrc;
  const originalExt = lastDotIndex !== -1 ? baseSrc.substring(lastDotIndex + 1) : 'jpg';
  const ext = format || originalExt;

  return widths.map(width => {
    return `${nameWithoutExt}-${width}w.${ext} ${width}w`;
  }).join(', ');
};

// Image format detection
export const detectImageFormat = async (): Promise<{
  webp: boolean;
  avif: boolean;
  jpeg2000: boolean;
}> => {
  const testImages = {
    webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    jpeg2000: 'data:image/jp2;base64,/0//UQAyAAAAAAABAAAAAgAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAEBwEBBwEBBwEBBwEB/1IADAAAAAEAAAQEAAH/2AMQAAAAAQAB'
  };

  const checkFormat = (dataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.height === 2);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  };

  const [webp, avif, jpeg2000] = await Promise.all([
    checkFormat(testImages.webp),
    checkFormat(testImages.avif),
    checkFormat(testImages.jpeg2000)
  ]);

  return { webp, avif, jpeg2000 };
};

// Lazy loading intersection observer options
export const lazyLoadingOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1
};

// Image compression utility (client-side)
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = calculateOptimalDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight,
        'contain'
      );

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Performance monitoring for images
export const trackImagePerformance = (src: string, startTime: number) => {
  const loadTime = performance.now() - startTime;
  
  // In a real application, you would send this data to your analytics service
  console.log(`Image loaded: ${src}, Load time: ${loadTime.toFixed(2)}ms`);
  
  // You can also use the Performance Observer API
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === src) {
          console.log(`Resource timing for ${src}:`, entry);
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }
};