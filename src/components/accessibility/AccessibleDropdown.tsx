// Accessible dropdown menu component with keyboard navigation
import React, { useState, useRef, useEffect } from 'react';
import { useFocusTrap, useScreenReader } from '../../hooks/useAccessibility';
import { AccessibleButton } from './AccessibleButton';

interface DropdownItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  separator?: boolean;
}

interface AccessibleDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

export const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  className = '',
  menuClassName = '',
  ariaLabel = 'Menu'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useFocusTrap(isOpen);
  const { announce } = useScreenReader();

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1'
  };

  useEffect(() => {
    if (isOpen) {
      announce(`${ariaLabel} opened`, 'polite');
      setActiveIndex(0);
    } else {
      announce(`${ariaLabel} closed`, 'polite');
      setActiveIndex(-1);
    }
  }, [isOpen, ariaLabel, announce]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    const enabledItems = items.filter(item => !item.disabled && !item.separator);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev < enabledItems.length - 1 ? prev + 1 : 0;
          focusItem(nextIndex);
          return nextIndex;
        });
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => {
          const prevIndex = prev > 0 ? prev - 1 : enabledItems.length - 1;
          focusItem(prevIndex);
          return prevIndex;
        });
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && enabledItems[activeIndex]) {
          enabledItems[activeIndex].onClick();
          setIsOpen(false);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        focusItem(0);
        break;
        
      case 'End':
        event.preventDefault();
        const lastIndex = enabledItems.length - 1;
        setActiveIndex(lastIndex);
        focusItem(lastIndex);
        break;
    }
  };

  const focusItem = (index: number) => {
    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])');
    if (menuItems && menuItems[index]) {
      (menuItems[index] as HTMLElement).focus();
    }
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div
        onClick={handleTriggerClick}
        onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          className={`
            absolute z-50 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5
            focus:outline-none ${placementClasses[placement]} ${menuClassName}
          `}
        >
          <div className="py-1">
            {items.map((item, index) => {
              if (item.separator) {
                return (
                  <div
                    key={item.id}
                    className="border-t border-gray-100 my-1"
                    role="separator"
                  />
                );
              }

              const enabledIndex = items.slice(0, index).filter(i => !i.disabled && !i.separator).length;
              const isActive = activeIndex === enabledIndex;

              return (
                <button
                  key={item.id}
                  role="menuitem"
                  tabIndex={isActive ? 0 : -1}
                  disabled={item.disabled}
                  aria-disabled={item.disabled}
                  className={`
                    w-full text-left px-4 py-2 text-sm flex items-center
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                    ${item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                    ${isActive ? 'bg-gray-100' : ''}
                  `}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && (
                    <span className="mr-3 flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};