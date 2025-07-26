import React, { memo, Suspense, lazy, ReactNode, ComponentType } from 'react';
import { useRenderPerformance } from '@/hooks/usePerformance';

interface PerformanceOptimizedProps {
  children: ReactNode;
  componentName?: string;
  enableRenderTracking?: boolean;
  fallback?: ReactNode;
}

// Higher-order component for performance optimization
export const withPerformanceOptimization = <P extends object>(
  Component: ComponentType<P>,
  componentName?: string
) => {
  const OptimizedComponent = memo((props: P) => {
    if (process.env.NODE_ENV === 'development' && componentName) {
      useRenderPerformance(componentName);
    }
    
    return <Component {...props} />;
  });

  OptimizedComponent.displayName = `PerformanceOptimized(${componentName || Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

// Component for lazy loading with performance tracking
export const LazyComponent: React.FC<{
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  componentName: string;
  fallback?: ReactNode;
  [key: string]: any;
}> = ({ importFunc, componentName, fallback, ...props }) => {
  const LazyLoadedComponent = lazy(() => {
    const startTime = performance.now();
    
    return importFunc().then(module => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`Lazy component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      if (loadTime > 1000) {
        console.warn(`Slow lazy component detected: ${componentName} took ${loadTime.toFixed(2)}ms to load`);
      }
      
      return module;
    });
  });

  const DefaultFallback = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
};

// Performance optimized wrapper component
const PerformanceOptimized: React.FC<PerformanceOptimizedProps> = ({
  children,
  componentName = 'PerformanceOptimized',
  enableRenderTracking = process.env.NODE_ENV === 'development',
  fallback
}) => {
  if (enableRenderTracking) {
    useRenderPerformance(componentName);
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default memo(PerformanceOptimized);

// Utility for creating performance-optimized components
export const createOptimizedComponent = <P extends object>(
  Component: ComponentType<P>,
  options: {
    componentName?: string;
    shouldUpdate?: (prevProps: P, nextProps: P) => boolean;
    enableLazyLoading?: boolean;
  } = {}
) => {
  const { componentName, shouldUpdate, enableLazyLoading } = options;

  let OptimizedComponent = Component;

  // Apply memo with custom comparison if provided
  if (shouldUpdate) {
    OptimizedComponent = memo(Component, (prevProps, nextProps) => 
      !shouldUpdate(prevProps, nextProps)
    );
  } else {
    OptimizedComponent = memo(Component);
  }

  // Add performance tracking in development
  if (process.env.NODE_ENV === 'development' && componentName) {
    const TrackedComponent = (props: P) => {
      useRenderPerformance(componentName);
      return <OptimizedComponent {...props} />;
    };
    
    OptimizedComponent = TrackedComponent as ComponentType<P>;
  }

  // Add lazy loading if requested
  if (enableLazyLoading) {
    const LazyOptimizedComponent = lazy(() => 
      Promise.resolve({ default: OptimizedComponent })
    );
    
    const LazyWrapper = (props: P) => (
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded"></div>}>
        <LazyOptimizedComponent {...props} />
      </Suspense>
    );
    
    OptimizedComponent = LazyWrapper as ComponentType<P>;
  }

  OptimizedComponent.displayName = `Optimized(${componentName || Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

// Hook for optimizing expensive calculations
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    debounceMs?: number;
    throttleMs?: number;
  } = {}
): T => {
  const { debounceMs, throttleMs } = options;
  
  const memoizedCallback = React.useCallback(callback, deps);
  
  if (debounceMs) {
    return React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => memoizedCallback(...args), debounceMs);
      }) as T;
    }, [memoizedCallback, debounceMs]);
  }
  
  if (throttleMs) {
    return React.useMemo(() => {
      let lastCall = 0;
      return ((...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= throttleMs) {
          lastCall = now;
          return memoizedCallback(...args);
        }
      }) as T;
    }, [memoizedCallback, throttleMs]);
  }
  
  return memoizedCallback;
};

// Component for measuring and displaying render performance
export const RenderPerformanceTracker: React.FC<{
  children: ReactNode;
  componentName: string;
  showMetrics?: boolean;
}> = ({ children, componentName, showMetrics = false }) => {
  const [renderTime, setRenderTime] = React.useState<number>(0);
  const [renderCount, setRenderCount] = React.useState<number>(0);
  
  React.useEffect(() => {
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);
    
    return () => {
      const endTime = performance.now();
      const time = endTime - startTime;
      setRenderTime(time);
      
      if (time > 16) {
        console.warn(`${componentName} render #${renderCount + 1} took ${time.toFixed(2)}ms`);
      }
    };
  });
  
  return (
    <div className="relative">
      {children}
      {showMetrics && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
          {componentName}: {renderTime.toFixed(1)}ms (#{renderCount})
        </div>
      )}
    </div>
  );
};