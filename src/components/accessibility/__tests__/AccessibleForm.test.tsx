// Tests for AccessibleForm components
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils';
import { 
  AccessibleInput, 
  AccessibleTextarea, 
  AccessibleSelect, 
  AccessibleCheckbox,
  AccessibleRadioGroup 
} from '../AccessibleForm';

describe('AccessibleInput', () => {
  const defaultProps = {
    id: 'test-input',
    label: 'Test Input'
  };

  it('renders with correct label', () => {
    render(<AccessibleInput {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<AccessibleInput {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('displays help text', () => {
    render(<AccessibleInput {...defaultProps} helpText="This is help text" />);
    
    expect(screen.getByText('This is help text')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'test-input-help');
  });

  it('displays error message', () => {
    render(<AccessibleInput {...defaultProps} error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('combines help text and error in describedby', () => {
    render(
      <AccessibleInput 
        {...defaultProps} 
        helpText="Help text" 
        error="Error message" 
      />
    );
    
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby', 
      'test-input-help test-input-error'
    );
  });

  it('handles input changes', () => {
    const onChange = jest.fn();
    render(<AccessibleInput {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'test value' })
    }));
  });

  it('applies error styles when error is present', () => {
    render(<AccessibleInput {...defaultProps} error="Error" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300', 'text-red-900');
  });
});

describe('AccessibleTextarea', () => {
  const defaultProps = {
    id: 'test-textarea',
    label: 'Test Textarea'
  };

  it('renders as textarea element', () => {
    render(<AccessibleTextarea {...defaultProps} />);
    
    expect(screen.getByRole('textbox', { multiline: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument();
  });

  it('handles textarea changes', () => {
    const onChange = jest.fn();
    render(<AccessibleTextarea {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox', { multiline: true });
    fireEvent.change(textarea, { target: { value: 'multi\nline\ntext' } });
    
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'multi\nline\ntext' })
    }));
  });
});

describe('AccessibleSelect', () => {
  const defaultProps = {
    id: 'test-select',
    label: 'Test Select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', disabled: true }
    ]
  };

  it('renders with options', () => {
    render(<AccessibleSelect {...defaultProps} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<AccessibleSelect {...defaultProps} placeholder="Choose an option" />);
    
    expect(screen.getByRole('option', { name: 'Choose an option' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Choose an option' })).toHaveAttribute('disabled');
  });

  it('handles disabled options', () => {
    render(<AccessibleSelect {...defaultProps} />);
    
    const disabledOption = screen.getByRole('option', { name: 'Option 3' });
    expect(disabledOption).toHaveAttribute('disabled');
  });

  it('handles selection changes', () => {
    const onChange = jest.fn();
    render(<AccessibleSelect {...defaultProps} onChange={onChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'option2' })
    }));
  });
});

describe('AccessibleCheckbox', () => {
  const defaultProps = {
    id: 'test-checkbox',
    label: 'Test Checkbox'
  };

  it('renders with correct label', () => {
    render(<AccessibleCheckbox {...defaultProps} />);
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Checkbox')).toBeInTheDocument();
  });

  it('handles checked state', () => {
    const { rerender } = render(<AccessibleCheckbox {...defaultProps} checked={false} />);
    
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    
    rerender(<AccessibleCheckbox {...defaultProps} checked={true} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('handles change events', () => {
    const onChange = jest.fn();
    render(<AccessibleCheckbox {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ checked: true })
    }));
  });

  it('shows required indicator', () => {
    render(<AccessibleCheckbox {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
  });
});

describe('AccessibleRadioGroup', () => {
  const defaultProps = {
    name: 'test-radio',
    label: 'Test Radio Group',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', disabled: true }
    ],
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as fieldset with legend', () => {
    render(<AccessibleRadioGroup {...defaultProps} />);
    
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders all radio options', () => {
    render(<AccessibleRadioGroup {...defaultProps} />);
    
    expect(screen.getByRole('radio', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Option 3' })).toBeInTheDocument();
  });

  it('handles disabled options', () => {
    render(<AccessibleRadioGroup {...defaultProps} />);
    
    const disabledRadio = screen.getByRole('radio', { name: 'Option 3' });
    expect(disabledRadio).toBeDisabled();
  });

  it('handles selection', () => {
    const onChange = jest.fn();
    render(<AccessibleRadioGroup {...defaultProps} onChange={onChange} />);
    
    fireEvent.click(screen.getByRole('radio', { name: 'Option 1' }));
    expect(onChange).toHaveBeenCalledWith('option1');
  });

  it('shows selected option', () => {
    render(<AccessibleRadioGroup {...defaultProps} value="option2" />);
    
    expect(screen.getByRole('radio', { name: 'Option 2' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Option 1' })).not.toBeChecked();
  });

  it('shows required indicator', () => {
    render(<AccessibleRadioGroup {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
  });

  it('displays error message', () => {
    render(<AccessibleRadioGroup {...defaultProps} error="Please select an option" />);
    
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });
});