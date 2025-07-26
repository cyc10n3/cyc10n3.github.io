import React, { ReactNode } from 'react';
import { useLazyLoading } from '@/hooks/useLazyLoading';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  animationClass?: string;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  animationClass = 'animate-fade-in-up'
}) => {
  const { isInView, ref } = useLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const Fallback = () => (
    <div className={`min-h-[200px] bg-gray-50 animate-pulse rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-gray-400">
        <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isInView ? (
        <div className={animationClass}>
          {children}
        </div>
      ) : (
        fallback || <Fallback />
      )}
    </div>
  );
};

export default LazySection;