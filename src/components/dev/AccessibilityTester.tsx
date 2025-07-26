// Development component for testing accessibility features
import React, { useState, useRef } from 'react';
import { runAccessibilityChecks, checkColorContrast } from '../../utils/accessibility';
import { AccessibleButton } from '../accessibility/AccessibleButton';

interface AccessibilityReport {
  issues: string[];
  warnings: string[];
  passed: string[];
  colorContrast?: {
    ratio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

export const AccessibilityTester: React.FC = () => {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isVisible, setIsVisible] = useState(false);
  const testAreaRef = useRef<HTMLDivElement>(null);

  const runTests = () => {
    if (!testAreaRef.current) return;

    const results = runAccessibilityChecks(testAreaRef.current);
    const contrastResults = checkColorContrast(foregroundColor, backgroundColor);

    setReport({
      ...results,
      colorContrast: contrastResults
    });
  };

  const testColorContrast = () => {
    const results = checkColorContrast(foregroundColor, backgroundColor);
    setReport(prev => ({
      ...prev,
      colorContrast: results,
      issues: prev?.issues || [],
      warnings: prev?.warnings || [],
      passed: prev?.passed || []
    }));
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <AccessibleButton
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="small"
          ariaLabel="Open accessibility tester"
        >
          A11y Test
        </AccessibleButton>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Accessibility Tester</h2>
            <AccessibleButton
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="small"
              ariaLabel="Close accessibility tester"
            >
              ✕
            </AccessibleButton>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Area */}
          <div>
            <h3 className="text-lg font-medium mb-4">Test Area</h3>
            <div
              ref={testAreaRef}
              className="border-2 border-dashed border-gray-300 p-4 rounded-lg"
              style={{ color: foregroundColor, backgroundColor }}
            >
              <h1>Sample Heading 1</h1>
              <h2>Sample Heading 2</h2>
              <p>This is sample text for testing accessibility.</p>
              
              <img src="/api/placeholder/100/100" alt="Sample image with alt text" />
              <img src="/api/placeholder/100/100" alt="" role="presentation" />
              
              <form>
                <label htmlFor="test-input">Test Input:</label>
                <input id="test-input" type="text" />
                
                <input type="text" placeholder="Input without label" />
                
                <button type="button">Button with text</button>
                <button type="button" aria-label="Button with aria-label">🔍</button>
                <button type="button"></button>
              </form>
              
              <a href="#test">Link with text</a>
              <a href="#test"></a>
            </div>
          </div>

          {/* Color Contrast Tester */}
          <div>
            <h3 className="text-lg font-medium mb-4">Color Contrast Tester</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fg-color" className="block text-sm font-medium mb-2">
                  Foreground Color:
                </label>
                <input
                  id="fg-color"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              <div>
                <label htmlFor="bg-color" className="block text-sm font-medium mb-2">
                  Background Color:
                </label>
                <input
                  id="bg-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
            </div>
            <div className="mt-4">
              <AccessibleButton onClick={testColorContrast} variant="secondary">
                Test Color Contrast
              </AccessibleButton>
            </div>
          </div>

          {/* Test Controls */}
          <div>
            <AccessibleButton onClick={runTests} variant="primary">
              Run Accessibility Tests
            </AccessibleButton>
          </div>

          {/* Results */}
          {report && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Test Results</h3>
              
              {/* Color Contrast Results */}
              {report.colorContrast && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Color Contrast</h4>
                  <div className="space-y-1 text-sm">
                    <p>Contrast Ratio: {report.colorContrast.ratio.toFixed(2)}:1</p>
                    <p className={report.colorContrast.wcagAA ? 'text-green-600' : 'text-red-600'}>
                      WCAG AA: {report.colorContrast.wcagAA ? 'Pass' : 'Fail'}
                    </p>
                    <p className={report.colorContrast.wcagAAA ? 'text-green-600' : 'text-red-600'}>
                      WCAG AAA: {report.colorContrast.wcagAAA ? 'Pass' : 'Fail'}
                    </p>
                  </div>
                </div>
              )}

              {/* Issues */}
              {report.issues.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Issues ({report.issues.length})</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {report.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {report.warnings.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Warnings ({report.warnings.length})</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {report.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Passed */}
              {report.passed.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Passed ({report.passed.length})</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {report.passed.map((passed, index) => (
                      <li key={index}>• {passed}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};