// Tests for AccessibleButton component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { AccessibleButton } from '../AccessibleButton';

describe('AccessibleButton', () => {
  it('renders with correct text', () => {
    render(<AccessibleButton>Click me</AccessibleButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<AccessibleButton variant="primary">Primary</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<AccessibleButton variant="secondary">Secondary</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

    rerender(<AccessibleButton variant="danger">Danger</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');

    rerender(<AccessibleButton variant="ghost">Ghost</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<AccessibleButton size="small">Small</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<AccessibleButton size="medium">Medium</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base');

    rerender(<AccessibleButton size="large">Large</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<AccessibleButton disabled>Disabled</AccessibleButton>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('cursor-not-allowed', 'opacity-50');
  });

  it('shows loading state correctly', () => {
    render(
      <AccessibleButton loading loadingText="Loading...">
        Submit
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toHaveClass('sr-only');
  });

  it('supports ARIA attributes', () => {
    render(
      <AccessibleButton
        ariaLabel="Custom label"
        ariaDescribedBy="description"
        ariaExpanded={true}
        ariaPressed={false}
      >
        Button
      </AccessibleButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('is keyboard accessible', () => {
    const handleClick = jest.fn();
    render(<AccessibleButton onClick={handleClick}>Button</AccessibleButton>);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<AccessibleButton ref={ref}>Button</AccessibleButton>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('applies custom className', () => {
    render(<AccessibleButton className="custom-class">Button</AccessibleButton>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('prevents click when loading', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleButton loading onClick={handleClick}>
        Button
      </AccessibleButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper focus styles', () => {
    render(<AccessibleButton>Button</AccessibleButton>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });
});