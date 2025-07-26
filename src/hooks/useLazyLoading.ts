import { useState, useEffect, useRef, RefObject } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseLazyLoadingReturn {
  isInView: boolean;
  ref: RefObject<HTMLElement>;
}

export const useLazyLoading = (
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { isInView, ref };
};

// Hook for preloading images
export const useImagePreloader = (imageSources: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src));
          resolve();
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(src));
          reject();
        };
        img.src = src;
      });
    };

    const preloadAll = async () => {
      const promises = imageSources.map(src => 
        preloadImage(src).catch(() => {}) // Ignore errors to continue with other images
      );
      await Promise.allSettled(promises);
    };

    if (imageSources.length > 0) {
      preloadAll();
    }
  }, [imageSources]);

  return {
    loadedImages,
    failedImages,
    isLoaded: (src: string) => loadedImages.has(src),
    hasFailed: (src: string) => failedImages.has(src),
  };
};

// Hook for responsive image loading
export const useResponsiveImage = (
  baseSrc: string,
  breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  }
) => {
  const [currentSrc, setCurrentSrc] = useState(baseSrc);

  useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      let selectedBreakpoint = 'sm';

      Object.entries(breakpoints).forEach(([breakpoint, minWidth]) => {
        if (width >= minWidth) {
          selectedBreakpoint = breakpoint;
        }
      });

      // Generate responsive image path
      const lastDotIndex = baseSrc.lastIndexOf('.');
      const extension = lastDotIndex !== -1 ? baseSrc.substring(lastDotIndex) : '.jpg';
      const nameWithoutExt = lastDotIndex !== -1 ? baseSrc.substring(0, lastDotIndex) : baseSrc;
      
      const responsiveSrc = `${nameWithoutExt}-${selectedBreakpoint}${extension}`;
      setCurrentSrc(responsiveSrc);
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);

    return () => {
      window.removeEventListener('resize', updateImageSrc);
    };
  }, [baseSrc, breakpoints]);

  return currentSrc;
};

// Hook for image format detection and optimization
export const useOptimalImageFormat = () => {
  const [supportedFormats, setSupportedFormats] = useState<{
    webp: boolean;
    avif: boolean;
  }>({
    webp: false,
    avif: false,
  });

  useEffect(() => {
    const checkWebPSupport = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    };

    const checkAVIFSupport = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const avif = new Image();
        avif.onload = avif.onerror = () => {
          resolve(avif.height === 2);
        };
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      });
    };

    const detectFormats = async () => {
      const [webp, avif] = await Promise.all([
        checkWebPSupport(),
        checkAVIFSupport(),
      ]);

      setSupportedFormats({ webp, avif });
    };

    detectFormats();
  }, []);

  const getOptimalSrc = (baseSrc: string): string => {
    const lastDotIndex = baseSrc.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex !== -1 ? baseSrc.substring(0, lastDotIndex) : baseSrc;

    if (supportedFormats.avif) {
      return `${nameWithoutExt}.avif`;
    } else if (supportedFormats.webp) {
      return `${nameWithoutExt}.webp`;
    }

    return baseSrc;
  };

  return { supportedFormats, getOptimalSrc };
};

// Hook for progressive image loading
export const useProgressiveImage = (lowQualitySrc: string, highQualitySrc: string) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setCurrentSrc(lowQualitySrc);

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = highQualitySrc;
  }, [lowQualitySrc, highQualitySrc]);

  return { currentSrc, isLoading };
};