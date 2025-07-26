// Tests for AccessibleNavigation components
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { AccessibleNavigation, MobileAccessibleNavigation } from '../AccessibleNavigation';

const mockNavigationItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About', href: '/about' },
  { 
    id: 'services', 
    label: 'Services', 
    href: '/services',
    children: [
      { id: 'service1', label: 'Service 1', href: '/services/1' },
      { id: 'service2', label: 'Service 2', href: '/services/2' }
    ]
  },
  { id: 'contact', label: 'Contact', href: '/contact', current: true }
];

describe('AccessibleNavigation', () => {
  it('renders navigation with correct structure', () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  });

  it('applies correct ARIA attributes', () => {
    render(<AccessibleNavigation items={mockNavigationItems} ariaLabel="Main navigation" />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders vertical orientation correctly', () => {
    render(<AccessibleNavigation items={mockNavigationItems} orientation="vertical" />);
    
    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveAttribute('aria-orientation', 'vertical');
    expect(menubar).toHaveClass('flex-col', 'space-y-1');
  });

  it('shows current page indicator', () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const currentItem = screen.getByRole('menuitem', { name: 'Contact' });
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('handles items with children (submenus)', () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const servicesItem = screen.getByRole('menuitem', { name: 'Services' });
    expect(servicesItem).toHaveAttribute('aria-haspopup', 'menu');
    expect(servicesItem).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands submenu on click', async () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const servicesItem = screen.getByRole('menuitem', { name: 'Services' });
    fireEvent.click(servicesItem);
    
    await waitFor(() => {
      expect(servicesItem).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Service 1' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Service 2' })).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation with arrow keys', () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    const aboutItem = screen.getByRole('menuitem', { name: 'About' });
    
    homeItem.focus();
    expect(homeItem).toHaveFocus();
    
    fireEvent.keyDown(homeItem, { key: 'ArrowRight' });
    expect(aboutItem).toHaveFocus();
  });

  it('handles vertical keyboard navigation', () => {
    render(<AccessibleNavigation items={mockNavigationItems} orientation="vertical" />);
    
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    const aboutItem = screen.getByRole('menuitem', { name: 'About' });
    
    homeItem.focus();
    fireEvent.keyDown(homeItem, { key: 'ArrowDown' });
    expect(aboutItem).toHaveFocus();
  });

  it('wraps navigation at boundaries', () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    const contactItem = screen.getByRole('menuitem', { name: 'Contact' });
    
    homeItem.focus();
    fireEvent.keyDown(homeItem, { key: 'ArrowLeft' });
    expect(contactItem).toHaveFocus();
  });

  it('handles Enter key to activate items', () => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
    
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    fireEvent.keyDown(homeItem, { key: 'Enter' });
    
    expect(window.location.href).toBe('/');
  });

  it('handles Space key to activate items', () => {
    delete (window as any).location;
    window.location = { href: '' } as any;
    
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const aboutItem = screen.getByRole('menuitem', { name: 'About' });
    fireEvent.keyDown(aboutItem, { key: ' ' });
    
    expect(window.location.href).toBe('/about');
  });

  it('closes all submenus on Escape', async () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const servicesItem = screen.getByRole('menuitem', { name: 'Services' });
    fireEvent.click(servicesItem);
    
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(servicesItem, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('handles Home and End keys', () => {
    render(<AccessibleNavigation items={mockNavigationItems} />);
    
    const aboutItem = screen.getByRole('menuitem', { name: 'About' });
    const homeItem = screen.getByRole('menuitem', { name: 'Home' });
    const contactItem = screen.getByRole('menuitem', { name: 'Contact' });
    
    aboutItem.focus();
    fireEvent.keyDown(aboutItem, { key: 'Home' });
    expect(homeItem).toHaveFocus();
    
    fireEvent.keyDown(homeItem, { key: 'End' });
    expect(contactItem).toHaveFocus();
  });
});

describe('MobileAccessibleNavigation', () => {
  const defaultProps = {
    items: mockNavigationItems,
    isOpen: false,
    onToggle: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders toggle button', () => {
    render(<MobileAccessibleNavigation {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: 'Open mobile menu' })).toBeInTheDocument();
  });

  it('shows correct button label when closed', () => {
    render(<MobileAccessibleNavigation {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open mobile menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows correct button label when open', () => {
    render(<MobileAccessibleNavigation {...defaultProps} isOpen={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close mobile menu');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onToggle when button is clicked', () => {
    const onToggle = jest.fn();
    render(<MobileAccessibleNavigation {...defaultProps} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders navigation when open', () => {
    render(<MobileAccessibleNavigation {...defaultProps} isOpen={true} />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  });

  it('does not render navigation when closed', () => {
    render(<MobileAccessibleNavigation {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders with vertical orientation when open', () => {
    render(<MobileAccessibleNavigation {...defaultProps} isOpen={true} />);
    
    const menubar = screen.getByRole('menubar');
    expect(menubar).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('has proper mobile navigation label', () => {
    render(<MobileAccessibleNavigation {...defaultProps} isOpen={true} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Mobile navigation');
  });

  it('announces menu state changes', async () => {
    const { rerender } = render(<MobileAccessibleNavigation {...defaultProps} isOpen={false} />);
    
    rerender(<MobileAccessibleNavigation {...defaultProps} isOpen={true} />);
    
    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('Mobile menu opened');
    });
  });
});