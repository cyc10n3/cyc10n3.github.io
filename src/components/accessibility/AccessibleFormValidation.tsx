// Enhanced accessible form validation components
import React, { useState, useEffect } from 'react';
import { useScreenReader } from '../../hooks/useAccessibility';
import { AccessibleInput, AccessibleTextarea, AccessibleSelect, AccessibleCheckbox } from './AccessibleForm';
import { AccessibleButton } from './AccessibleButton';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select' | 'checkbox';
  validation?: ValidationRule;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

interface AccessibleFormValidationProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  className?: string;
  showErrorSummary?: boolean;
}

export const AccessibleFormValidation: React.FC<AccessibleFormValidationProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className = '',
  showErrorSummary = true
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { announce } = useScreenReader();

  // Initialize form data
  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.type === 'checkbox' ? false : '';
    });
    setFormData(initialData);
  }, [fields]);

  const validateField = (field: FormField, value: any): string | null => {
    const { validation } = field;
    if (!validation) return null;

    // Required validation
    if (validation.required) {
      if (field.type === 'checkbox' && !value) {
        return `${field.label} is required`;
      }
      if (field.type !== 'checkbox' && (!value || value.toString().trim() === '')) {
        return `${field.label} is required`;
      }
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') return null;

    // Min length validation
    if (validation.minLength && value.toString().length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    // Max length validation
    if (validation.maxLength && value.toString().length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value.toString())) {
      if (field.type === 'email') {
        return `Please enter a valid email address`;
      }
      if (field.type === 'tel') {
        return `Please enter a valid phone number`;
      }
      return `${field.label} format is invalid`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        announce(`Error in ${field.label}: ${error}`, 'assertive');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      try {
        await onSubmit(formData);
        announce('Form submitted successfully', 'polite');
      } catch (error) {
        announce('Form submission failed. Please try again.', 'assertive');
      }
    } else {
      const errorCount = Object.keys(errors).length;
      announce(`Form has ${errorCount} error${errorCount !== 1 ? 's' : ''}. Please review and correct.`, 'assertive');
    }

    setIsSubmitting(false);
  };

  const renderField = (field: FormField) => {
    const fieldError = touched[field.name] ? errors[field.name] : '';
    const fieldId = `field-${field.name}`;

    const commonProps = {
      id: fieldId,
      label: field.label,
      value: formData[field.name] || '',
      error: fieldError,
      helpText: field.helpText,
      required: field.validation?.required,
      onBlur: () => handleFieldBlur(field.name)
    };

    switch (field.type) {
      case 'textarea':
        return (
          <AccessibleTextarea
            key={field.name}
            {...commonProps}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <AccessibleSelect
            key={field.name}
            {...commonProps}
            options={field.options || []}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case 'checkbox':
        return (
          <AccessibleCheckbox
            key={field.name}
            {...commonProps}
            checked={formData[field.name] || false}
            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
          />
        );

      default:
        return (
          <AccessibleInput
            key={field.name}
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
    }
  };

  const errorEntries = Object.entries(errors).filter(([_, error]) => error);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} noValidate>
      {/* Error Summary */}
      {showErrorSummary && errorEntries.length > 0 && (
        <div
          className="bg-red-50 border border-red-200 rounded-md p-4"
          role="alert"
          aria-labelledby="error-summary-title"
        >
          <h3 id="error-summary-title" className="text-sm font-medium text-red-800 mb-2">
            Please correct the following errors:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errorEntries.map(([fieldName, error]) => {
              const field = fields.find(f => f.name === fieldName);
              return (
                <li key={fieldName}>
                  <a
                    href={`#field-${fieldName}`}
                    className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`field-${fieldName}`)?.focus();
                    }}
                  >
                    {field?.label}: {error}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <AccessibleButton
          type="submit"
          variant="primary"
          loading={isSubmitting}
          loadingText="Submitting..."
          disabled={isSubmitting}
        >
          {submitLabel}
        </AccessibleButton>
      </div>
    </form>
  );
};

// Accessible multi-step form
interface FormStep {
  title: string;
  fields: FormField[];
  validation?: (data: Record<string, any>) => Record<string, string>;
}

interface AccessibleMultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: Record<string, any>) => void;
  className?: string;
}

export const AccessibleMultiStepForm: React.FC<AccessibleMultiStepFormProps> = ({
  steps,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const { announce } = useScreenReader();

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleStepSubmit = (stepData: Record<string, any>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    // Validate current step
    if (currentStepData.validation) {
      const errors = currentStepData.validation(stepData);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
    }

    setStepErrors({});

    if (isLastStep) {
      onComplete(updatedData);
      announce('Form completed successfully', 'polite');
    } else {
      setCurrentStep(prev => prev + 1);
      announce(`Step ${currentStep + 2} of ${steps.length}: ${steps[currentStep + 1].title}`, 'polite');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      announce(`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1].title}`, 'polite');
    }
  };

  return (
    <div className={className}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">
            Step {currentStep + 1} of {steps.length}: {currentStepData.title}
          </h2>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label={`Step ${currentStep + 1} of ${steps.length}`}
          />
        </div>
      </div>

      {/* Current Step Form */}
      <AccessibleFormValidation
        fields={currentStepData.fields}
        onSubmit={handleStepSubmit}
        submitLabel={isLastStep ? 'Complete' : 'Next'}
        showErrorSummary={true}
      />

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <AccessibleButton
            onClick={handlePreviousStep}
            variant="secondary"
            size="small"
          >
            Previous Step
          </AccessibleButton>
        </div>
      )}
    </div>
  );
};