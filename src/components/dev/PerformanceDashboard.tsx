import React, { useState, useEffect } from 'react';
import { usePerformance, useMemoryMonitoring, useNetworkMonitoring } from '@/hooks/usePerformance';
import { Card } from '@/components/common';

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isVisible = false,
  onToggle
}) => {
  const { metrics, getCoreWebVitals, getPerformanceScore } = usePerformance();
  const memoryInfo = useMemoryMonitoring();
  const networkInfo = useNetworkMonitoring();
  const [isMinimized, setIsMinimized] = useState(false);

  const coreWebVitals = getCoreWebVitals();
  const performanceScore = getPerformanceScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'LCP':
        if (value <= 2500) return 'text-green-600';
        if (value <= 4000) return 'text-yellow-600';
        return 'text-red-600';
      case 'FID':
        if (value <= 100) return 'text-green-600';
        if (value <= 300) return 'text-yellow-600';
        return 'text-red-600';
      case 'CLS':
        if (value <= 0.1) return 'text-green-600';
        if (value <= 0.25) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (value: number | undefined, unit: string = 'ms') => {
    if (value === undefined) return 'N/A';
    if (unit === 'ms') return `${value.toFixed(0)}ms`;
    if (unit === 'score') return value.toFixed(3);
    return value.toString();
  };

  const formatBytes = (bytes: number | undefined) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Show Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '📈' : '📉'}
            </button>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Close Dashboard"
            >
              ✕
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Performance Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">Performance Score</div>
            </div>

            {/* Core Web Vitals */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Core Web Vitals</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">LCP:</span>
                  <span className={`text-sm font-medium ${getMetricColor('LCP', coreWebVitals.lcp || 0)}`}>
                    {formatValue(coreWebVitals.lcp)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">FID:</span>
                  <span className={`text-sm font-medium ${getMetricColor('FID', coreWebVitals.fid || 0)}`}>
                    {formatValue(coreWebVitals.fid)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CLS:</span>
                  <span className={`text-sm font-medium ${getMetricColor('CLS', coreWebVitals.cls || 0)}`}>
                    {formatValue(coreWebVitals.cls, 'score')}
                  </span>
                </div>
              </div>
            </div>

            {/* Other Metrics */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Other Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">FCP:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatValue(metrics.fcp)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">TTFB:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatValue(metrics.ttfb)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Page Load:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatValue(metrics.pageLoadTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            {memoryInfo.usedJSHeapSize && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Memory Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Used:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatBytes(memoryInfo.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatBytes(memoryInfo.totalJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Limit:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatBytes(memoryInfo.jsHeapSizeLimit)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Network Info */}
            {networkInfo.effectiveType && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Network</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {networkInfo.effectiveType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Downlink:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {networkInfo.downlink?.toFixed(1)} Mbps
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">RTT:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {networkInfo.rtt}ms
                    </span>
                  </div>
                  {networkInfo.saveData && (
                    <div className="text-sm text-yellow-600">
                      Data Saver: ON
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Tips */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tips</h4>
              <div className="space-y-1 text-xs text-gray-600">
                {coreWebVitals.lcp && coreWebVitals.lcp > 2500 && (
                  <div>• Optimize LCP: Reduce image sizes, use CDN</div>
                )}
                {coreWebVitals.fid && coreWebVitals.fid > 100 && (
                  <div>• Optimize FID: Reduce JavaScript execution time</div>
                )}
                {coreWebVitals.cls && coreWebVitals.cls > 0.1 && (
                  <div>• Optimize CLS: Set image dimensions, avoid dynamic content</div>
                )}
                {memoryInfo.usedJSHeapSize && memoryInfo.jsHeapSizeLimit && 
                 (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) > 0.8 && (
                  <div>• High memory usage detected</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PerformanceDashboard;