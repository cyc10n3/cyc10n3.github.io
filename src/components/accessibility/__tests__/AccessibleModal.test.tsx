// Tests for AccessibleModal component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { AccessibleModal } from '../AccessibleModal';

describe('AccessibleModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: { overflow: '' },
      writable: true
    });
  });

  it('renders when open', () => {
    render(<AccessibleModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AccessibleModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<AccessibleModal {...defaultProps} description="Modal description" />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
  });

  it('prevents body scroll when open', () => {
    render(<AccessibleModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<AccessibleModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<AccessibleModal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<AccessibleModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(<AccessibleModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const onClose = jest.fn();
    render(
      <AccessibleModal {...defaultProps} onClose={onClose} closeOnEscape={false} />
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn();
    render(<AccessibleModal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on overlay click when closeOnOverlayClick is false', () => {
    const onClose = jest.fn();
    render(
      <AccessibleModal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
    );
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when clicking modal content', () => {
    const onClose = jest.fn();
    render(<AccessibleModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<AccessibleModal {...defaultProps} size="small" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');

    rerender(<AccessibleModal {...defaultProps} size="medium" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');

    rerender(<AccessibleModal {...defaultProps} size="large" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
  });

  it('renders description when provided', () => {
    render(
      <AccessibleModal {...defaultProps} description="This is a test modal" />
    );
    
    expect(screen.getByText('This is a test modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal')).toHaveAttribute('id', 'modal-description');
  });

  it('focuses the modal when opened', async () => {
    render(<AccessibleModal {...defaultProps} />);
    
    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(document.activeElement).toBe(modal);
    });
  });

  it('traps focus within modal', () => {
    render(
      <AccessibleModal {...defaultProps}>
        <button>First button</button>
        <button>Second button</button>
      </AccessibleModal>
    );
    
    const firstButton = screen.getByText('First button');
    const secondButton = screen.getByText('Second button');
    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    
    // Focus should be trapped within modal
    firstButton.focus();
    expect(firstButton).toHaveFocus();
    
    fireEvent.keyDown(firstButton, { key: 'Tab' });
    expect(secondButton).toHaveFocus();
    
    fireEvent.keyDown(secondButton, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('restores focus to previously focused element when closed', async () => {
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Open Modal';
    document.body.appendChild(triggerButton);
    triggerButton.focus();
    
    const { rerender } = render(<AccessibleModal {...defaultProps} />);
    
    // Close modal
    rerender(<AccessibleModal {...defaultProps} isOpen={false} />);
    
    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
    
    document.body.removeChild(triggerButton);
  });

  it('announces modal opening to screen readers', async () => {
    const { rerender } = render(<AccessibleModal {...defaultProps} isOpen={false} />);
    
    rerender(<AccessibleModal {...defaultProps} isOpen={true} />);
    
    // Check for live region announcement
    await waitFor(() => {
      const liveRegion = document.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('Modal opened: Test Modal');
    });
  });
});