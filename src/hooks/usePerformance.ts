import { useEffect, useState, useCallback } from 'react';
import { getPerformanceMonitor, PerformanceMetrics } from '@/utils/performance';

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const monitor = getPerformanceMonitor();
    
    // Update metrics periodically
    const updateMetrics = () => {
      setMetrics(monitor.getMetrics());
      setIsLoading(false);
    };

    // Initial update
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getCoreWebVitals = useCallback(() => {
    const monitor = getPerformanceMonitor();
    return monitor.getCoreWebVitals();
  }, []);

  const getPerformanceScore = useCallback(() => {
    const monitor = getPerformanceMonitor();
    return monitor.getPerformanceScore();
  }, []);

  return {
    metrics,
    isLoading,
    getCoreWebVitals,
    getPerformanceScore
  };
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`Component ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};

// Hook for measuring API call performance
export const useApiPerformance = () => {
  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`API call to ${endpoint} took ${duration.toFixed(2)}ms`);
      
      // Track slow API calls
      if (duration > 2000) {
        console.warn(`Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`API call to ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  return { measureApiCall };
};

// Hook for monitoring scroll performance
export const useScrollPerformance = () => {
  useEffect(() => {
    let lastScrollTime = 0;
    let frameCount = 0;
    let totalFrameTime = 0;

    const handleScroll = () => {
      const currentTime = performance.now();
      
      if (lastScrollTime > 0) {
        const frameTime = currentTime - lastScrollTime;
        totalFrameTime += frameTime;
        frameCount++;
        
        // Calculate average FPS over the last 60 frames
        if (frameCount >= 60) {
          const averageFrameTime = totalFrameTime / frameCount;
          const fps = 1000 / averageFrameTime;
          
          if (fps < 30) {
            console.warn(`Low scroll FPS detected: ${fps.toFixed(1)} FPS`);
          }
          
          // Reset counters
          frameCount = 0;
          totalFrameTime = 0;
        }
      }
      
      lastScrollTime = currentTime;
    };

    const throttledScrollHandler = throttleScrollHandler(handleScroll, 16); // ~60fps
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
    };
  }, []);
};

// Throttle helper for scroll handler
const throttleScrollHandler = (func: () => void, limit: number) => {
  let inThrottle: boolean;
  return () => {
    if (!inThrottle) {
      requestAnimationFrame(func);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Hook for monitoring memory usage
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
        
        // Warn about high memory usage
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercentage > 80) {
          console.warn(`High memory usage detected: ${usagePercentage.toFixed(1)}%`);
        }
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Hook for monitoring network performance
export const useNetworkMonitoring = () => {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }>({});

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      }
    };

    updateNetworkInfo();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
};