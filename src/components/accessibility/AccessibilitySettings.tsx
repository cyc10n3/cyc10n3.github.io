// Accessibility settings panel component
import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { AccessibleButton } from './AccessibleButton';
import { AccessibleModal } from './AccessibleModal';
import { AccessibleSelect, AccessibleCheckbox } from './AccessibleForm';

export const AccessibilitySettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, announce } = useAccessibility();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSetting(key, value);
    announce(`${key} setting changed to ${value}`, 'polite');
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  return (
    <>
      <AccessibleButton
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="small"
        ariaLabel="Open accessibility settings"
        className="fixed bottom-4 left-4 z-40 bg-white shadow-lg border border-gray-300"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="ml-2">A11y</span>
      </AccessibleButton>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Accessibility Settings"
        description="Customize your accessibility preferences"
        size="medium"
      >
        <div className="space-y-6">
          {/* Font Size */}
          <AccessibleSelect
            id="font-size"
            label="Font Size"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value as any)}
            options={fontSizeOptions}
            helpText="Adjust the text size throughout the application"
          />

          {/* Motion Preferences */}
          <AccessibleCheckbox
            id="reduced-motion"
            label="Reduce motion and animations"
            checked={settings.reducedMotion}
            onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
            helpText="Minimize animations and transitions for better focus"
          />

          {/* Contrast Preferences */}
          <AccessibleCheckbox
            id="high-contrast"
            label="High contrast mode"
            checked={settings.highContrast}
            onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
            helpText="Increase contrast for better visibility"
          />

          {/* Focus Visible */}
          <AccessibleCheckbox
            id="focus-visible"
            label="Enhanced focus indicators"
            checked={settings.focusVisible}
            onChange={(e) => handleSettingChange('focusVisible', e.target.checked)}
            helpText="Show clear focus indicators when navigating with keyboard"
          />

          {/* Screen Reader Optimization */}
          <AccessibleCheckbox
            id="screen-reader-optimized"
            label="Screen reader optimizations"
            checked={settings.screenReaderOptimized}
            onChange={(e) => handleSettingChange('screenReaderOptimized', e.target.checked)}
            helpText="Optimize interface for screen reader users"
          />

          {/* Reset to Defaults */}
          <div className="pt-4 border-t border-gray-200">
            <AccessibleButton
              onClick={() => {
                updateSetting('fontSize', 'medium');
                updateSetting('reducedMotion', false);
                updateSetting('highContrast', false);
                updateSetting('focusVisible', true);
                updateSetting('screenReaderOptimized', false);
                announce('Accessibility settings reset to defaults', 'polite');
              }}
              variant="secondary"
              size="small"
            >
              Reset to Defaults
            </AccessibleButton>
          </div>

          {/* Current Settings Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Current Settings</h3>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Font Size:</dt>
                <dd className="text-gray-900 capitalize">{settings.fontSize}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Reduced Motion:</dt>
                <dd className="text-gray-900">{settings.reducedMotion ? 'On' : 'Off'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">High Contrast:</dt>
                <dd className="text-gray-900">{settings.highContrast ? 'On' : 'Off'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Focus Indicators:</dt>
                <dd className="text-gray-900">{settings.focusVisible ? 'On' : 'Off'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Screen Reader Mode:</dt>
                <dd className="text-gray-900">{settings.screenReaderOptimized ? 'On' : 'Off'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </AccessibleModal>
    </>
  );
};