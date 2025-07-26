// Accessible navigation components with keyboard support and ARIA
import React, { useState, useRef, useEffect } from 'react';
import { useKeyboardNavigation, useScreenReader } from '../../hooks/useAccessibility';
import { AccessibleButton } from './AccessibleButton';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  children?: NavigationItem[];
  icon?: React.ReactNode;
  current?: boolean;
}

interface AccessibleNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  ariaLabel?: string;
}

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  items,
  orientation = 'horizontal',
  className = '',
  ariaLabel = 'Main navigation'
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const { announce } = useScreenReader();

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const { key } = event;
    const isHorizontal = orientation === 'horizontal';
    
    switch (key) {
      case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : items.length - 1;
        setActiveIndex(prevIndex);
        focusItem(prevIndex);
        break;
        
      case isHorizontal ? 'ArrowRight' : 'ArrowDown':
        event.preventDefault();
        const nextIndex = index < items.length - 1 ? index + 1 : 0;
        setActiveIndex(nextIndex);
        focusItem(nextIndex);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        const item = items[index];
        if (item.children) {
          toggleExpanded(item.id);
        } else {
          window.location.href = item.href;
        }
        break;
        
      case 'Escape':
        if (expandedItems.size > 0) {
          setExpandedItems(new Set());
          announce('All submenus closed', 'polite');
        }
        break;
        
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        focusItem(0);
        break;
        
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        focusItem(items.length - 1);
        break;
    }
  };

  const focusItem = (index: number) => {
    const navItems = navRef.current?.querySelectorAll('[role="menuitem"]');
    if (navItems && navItems[index]) {
      (navItems[index] as HTMLElement).focus();
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
      announce('Submenu closed', 'polite');
    } else {
      newExpanded.add(itemId);
      announce('Submenu opened', 'polite');
    }
    setExpandedItems(newExpanded);
  };

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={item.id} className="relative">
        <a
          href={hasChildren ? undefined : item.href}
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-current={item.current ? 'page' : undefined}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-200
            ${item.current 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            }
          }}
          onKeyDown={(e) => handleKeyDown(e.nativeEvent, index)}
        >
          {item.icon && (
            <span className="mr-2" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
          {hasChildren && (
            <svg
              className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </a>
        
        {hasChildren && isExpanded && (
          <ul
            role="menu"
            aria-labelledby={item.id}
            className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            {item.children!.map((child, childIndex) => (
              <li key={child.id}>
                <a
                  href={child.href}
                  role="menuitem"
                  tabIndex={-1}
                  aria-current={child.current ? 'page' : undefined}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  {child.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={className}
    >
      <ul
        role="menubar"
        aria-orientation={orientation}
        className={`
          flex ${orientation === 'vertical' ? 'flex-col space-y-1' : 'space-x-1'}
        `}
      >
        {items.map((item, index) => renderNavigationItem(item, index))}
      </ul>
    </nav>
  );
};

// Mobile accessible navigation with hamburger menu
interface MobileNavigationProps {
  items: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const MobileAccessibleNavigation: React.FC<MobileNavigationProps> = ({
  items,
  isOpen,
  onToggle,
  className = ''
}) => {
  const { announce } = useScreenReader();

  useEffect(() => {
    if (isOpen) {
      announce('Mobile menu opened', 'polite');
    } else {
      announce('Mobile menu closed', 'polite');
    }
  }, [isOpen, announce]);

  return (
    <div className={className}>
      <AccessibleButton
        onClick={onToggle}
        variant="ghost"
        ariaLabel={isOpen ? 'Close mobile menu' : 'Open mobile menu'}
        ariaExpanded={isOpen}
        ariaPressed={isOpen}
        className="md:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </AccessibleButton>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
          <nav className="px-4 py-2">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};