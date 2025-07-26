// Accessible form components with proper labeling and validation
import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { generateAriaAttributes } from '../../utils/accessibility';

interface BaseFieldProps {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

// Accessible Input Field
interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, id, error, helpText, required, className = '', ...props }, ref) => {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

    const ariaAttributes = generateAriaAttributes({
      describedBy,
      required,
      invalid: !!error
    });

    return (
      <div className={`space-y-1 ${className}`}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        
        <input
          ref={ref}
          id={id}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 placeholder-gray-400'
            }
          `}
          {...ariaAttributes}
          {...props}
        />
        
        {helpText && (
          <p id={helpId} className="text-sm text-gray-600">
            {helpText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Accessible Textarea Field
interface AccessibleTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, id, error, helpText, required, className = '', ...props }, ref) => {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

    const ariaAttributes = generateAriaAttributes({
      describedBy,
      required,
      invalid: !!error
    });

    return (
      <div className={`space-y-1 ${className}`}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        
        <textarea
          ref={ref}
          id={id}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 placeholder-gray-400'
            }
          `}
          {...ariaAttributes}
          {...props}
        />
        
        {helpText && (
          <p id={helpId} className="text-sm text-gray-600">
            {helpText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Accessible Select Field
interface AccessibleSelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, id, error, helpText, required, options, placeholder, className = '', ...props }, ref) => {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

    const ariaAttributes = generateAriaAttributes({
      describedBy,
      required,
      invalid: !!error
    });

    return (
      <div className={`space-y-1 ${className}`}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        
        <select
          ref={ref}
          id={id}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
          {...ariaAttributes}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {helpText && (
          <p id={helpId} className="text-sm text-gray-600">
            {helpText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Accessible Checkbox Field
interface AccessibleCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseFieldProps {}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ label, id, error, helpText, required, className = '', ...props }, ref) => {
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

    const ariaAttributes = generateAriaAttributes({
      describedBy,
      required,
      invalid: !!error
    });

    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-start">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`
              h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
              ${error ? 'border-red-300' : ''}
            `}
            {...ariaAttributes}
            {...props}
          />
          <label
            htmlFor={id}
            className="ml-2 block text-sm text-gray-700 cursor-pointer"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        </div>
        
        {helpText && (
          <p id={helpId} className="text-sm text-gray-600 ml-6">
            {helpText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600 ml-6" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Accessible Radio Group
interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AccessibleRadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helpText,
  required,
  className = ''
}) => {
  const groupId = `${name}-group`;
  const helpId = helpText ? `${groupId}-help` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className={`space-y-2 ${className}`}>
      <legend className="block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </legend>
      
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        aria-describedby={describedBy}
        aria-required={required}
        aria-invalid={!!error}
        className="space-y-2"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={option.disabled}
              className={`
                h-4 w-4 border-gray-300 text-blue-600
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                ${error ? 'border-red-300' : ''}
              `}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-2 block text-sm text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};