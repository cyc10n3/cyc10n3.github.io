// Performance optimization configuration

export const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds
  coreWebVitals: {
    lcp: {
      good: 2500,
      needsImprovement: 4000
    },
    fid: {
      good: 100,
      needsImprovement: 300
    },
    cls: {
      good: 0.1,
      needsImprovement: 0.25
    }
  },

  // Image optimization settings
  images: {
    lazyLoadingThreshold: 0.1,
    lazyLoadingRootMargin: '50px',
    preloadCriticalImages: true,
    modernFormats: ['avif', 'webp'],
    responsiveBreakpoints: [320, 640, 768, 1024, 1280, 1920],
    compressionQuality: 0.8
  },

  // Code splitting and lazy loading
  codeSplitting: {
    enableRouteBasedSplitting: true,
    enableComponentBasedSplitting: true,
    chunkSizeThreshold: 244 * 1024, // 244KB
    preloadRoutes: ['/products', '/services', '/contact']
  },

  // Resource optimization
  resources: {
    preloadFonts: true,
    prefetchNextPages: true,
    enableServiceWorker: true,
    enableResourceHints: true,
    criticalResourceTimeout: 3000
  },

  // Performance monitoring
  monitoring: {
    enableInProduction: false,
    enableInDevelopment: true,
    sampleRate: 0.1, // 10% of users in production
    reportingEndpoint: '/api/performance',
    longTaskThreshold: 50, // ms
    slowApiThreshold: 2000, // ms
    memoryWarningThreshold: 0.8 // 80% of heap limit
  },

  // Bundle optimization
  bundle: {
    enableTreeShaking: true,
    enableMinification: true,
    enableGzipCompression: true,
    enableBrotliCompression: true,
    splitVendorChunks: true,
    maxChunkSize: 500 * 1024 // 500KB
  },

  // Runtime optimization
  runtime: {
    enableMemoization: true,
    enableVirtualization: true,
    debounceScrollEvents: 16, // ~60fps
    throttleResizeEvents: 100,
    enableRequestIdleCallback: true
  }
};

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  // Time-based budgets (milliseconds)
  timing: {
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    timeToInteractive: 3800,
    totalBlockingTime: 300
  },

  // Size-based budgets (bytes)
  resources: {
    totalJavaScript: 170 * 1024, // 170KB
    totalCSS: 60 * 1024, // 60KB
    totalImages: 1.5 * 1024 * 1024, // 1.5MB
    totalFonts: 100 * 1024, // 100KB
    totalHTML: 30 * 1024, // 30KB
    totalBundle: 500 * 1024 // 500KB
  },

  // Network-based budgets
  network: {
    totalRequests: 50,
    criticalRequests: 10,
    thirdPartyRequests: 20,
    totalTransferSize: 2 * 1024 * 1024 // 2MB
  }
};

// Feature flags for performance optimizations
export const PERFORMANCE_FEATURES = {
  enableImageLazyLoading: true,
  enableCodeSplitting: true,
  enablePreloading: true,
  enablePrefetching: true,
  enableServiceWorker: true,
  enableWebVitalsMonitoring: true,
  enablePerformanceDashboard: process.env.NODE_ENV === 'development',
  enableBundleAnalysis: process.env.NODE_ENV === 'development',
  enableMemoryMonitoring: process.env.NODE_ENV === 'development'
};

// Device-specific optimizations
export const DEVICE_OPTIMIZATIONS = {
  mobile: {
    enableDataSaver: true,
    reduceAnimations: true,
    prioritizeAboveFold: true,
    limitConcurrentRequests: 6,
    enableImageCompression: true
  },
  tablet: {
    enableDataSaver: false,
    reduceAnimations: false,
    prioritizeAboveFold: true,
    limitConcurrentRequests: 8,
    enableImageCompression: true
  },
  desktop: {
    enableDataSaver: false,
    reduceAnimations: false,
    prioritizeAboveFold: false,
    limitConcurrentRequests: 12,
    enableImageCompression: false
  }
};

// Get device-specific configuration
export const getDeviceOptimizations = () => {
  if (typeof window === 'undefined') return DEVICE_OPTIMIZATIONS.desktop;

  const width = window.innerWidth;
  
  if (width < 768) return DEVICE_OPTIMIZATIONS.mobile;
  if (width < 1024) return DEVICE_OPTIMIZATIONS.tablet;
  return DEVICE_OPTIMIZATIONS.desktop;
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if user has data saver enabled
export const hasDataSaverEnabled = () => {
  if (typeof navigator === 'undefined') return false;
  return (navigator as any).connection?.saveData === true;
};

// Get optimal configuration based on user preferences and device
export const getOptimalConfiguration = () => {
  const deviceConfig = getDeviceOptimizations();
  const reducedMotion = prefersReducedMotion();
  const dataSaver = hasDataSaverEnabled();

  return {
    ...PERFORMANCE_CONFIG,
    images: {
      ...PERFORMANCE_CONFIG.images,
      compressionQuality: dataSaver ? 0.6 : PERFORMANCE_CONFIG.images.compressionQuality
    },
    runtime: {
      ...PERFORMANCE_CONFIG.runtime,
      debounceScrollEvents: reducedMotion ? 32 : PERFORMANCE_CONFIG.runtime.debounceScrollEvents
    },
    device: deviceConfig,
    accessibility: {
      reducedMotion,
      dataSaver
    }
  };
};