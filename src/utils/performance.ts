// Performance monitoring and Core Web Vitals utilities

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Other Web Vitals
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
  
  // Custom metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
  
  // Navigation timing
  navigationStart?: number;
  domComplete?: number;
  loadComplete?: number;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  value?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined' || this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
    
    // Monitor resource timing
    this.observeResourceTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
            this.reportMetric('FID', fid);
          }
        });
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: any[] = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              this.metrics.cls = clsValue;
              this.reportMetric('CLS', clsValue);
            }
          }
        });
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }

  private observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.reportMetric('FCP', entry.startTime);
          }
        });
      });

      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation failed:', error);
    }
  }

  private observeTTFB() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.responseStart && entry.requestStart) {
            const ttfb = entry.responseStart - entry.requestStart;
            this.metrics.ttfb = ttfb;
            this.reportMetric('TTFB', ttfb);
          }
        });
      });

      observer.observe({ type: 'navigation', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTFB observation failed:', error);
    }
  }

  private observeNavigationTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      
      if (navigation) {
        this.metrics.navigationStart = navigation.navigationStart || navigation.fetchStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        this.metrics.domComplete = navigation.domComplete - navigation.navigationStart;
        this.metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
        
        this.reportMetric('Page Load Time', this.metrics.pageLoadTime);
        this.reportMetric('DOM Content Loaded', this.metrics.domContentLoaded);
      }
    });
  }

  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let totalResourceTime = 0;
        
        entries.forEach((entry: any) => {
          totalResourceTime += entry.duration;
          
          // Track slow resources
          if (entry.duration > 1000) {
            console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
        
        this.metrics.resourceLoadTime = totalResourceTime;
      });

      observer.observe({ type: 'resource', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing observation failed:', error);
    }
  }

  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.warn(`Long task detected: ${entry.duration}ms at ${entry.startTime}ms`);
          
          // Track attribution if available
          if (entry.attribution) {
            entry.attribution.forEach((attr: any) => {
              console.warn(`Long task attribution: ${attr.name} - ${attr.containerType}`);
            });
          }
        });
      });

      observer.observe({ type: 'longtask', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task observation failed:', error);
    }
  }

  private reportMetric(name: string, value: number) {
    // In a real application, you would send this data to your analytics service
    console.log(`Performance Metric - ${name}: ${value.toFixed(2)}ms`);
    
    // Example: Send to analytics
    // analytics.track('performance_metric', { name, value, url: window.location.href });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getCoreWebVitals(): { lcp?: number; fid?: number; cls?: number } {
    return {
      lcp: this.metrics.lcp,
      fid: this.metrics.fid,
      cls: this.metrics.cls
    };
  }

  public getPerformanceScore(): number {
    const { lcp, fid, cls } = this.getCoreWebVitals();
    let score = 100;

    // LCP scoring (target: < 2.5s)
    if (lcp) {
      if (lcp > 4000) score -= 40;
      else if (lcp > 2500) score -= 20;
    }

    // FID scoring (target: < 100ms)
    if (fid) {
      if (fid > 300) score -= 40;
      else if (fid > 100) score -= 20;
    }

    // CLS scoring (target: < 0.1)
    if (cls) {
      if (cls > 0.25) score -= 20;
      else if (cls > 0.1) score -= 10;
    }

    return Math.max(0, score);
  }

  public dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

// Utility functions for performance optimization
export const preloadResource = (href: string, as: string, crossorigin?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

export const prefetchResource = (href: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
};

export const measureFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`Function ${name} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  }) as T;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};