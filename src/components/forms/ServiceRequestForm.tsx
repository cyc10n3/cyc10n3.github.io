import React, { useState, useRef } from 'react';
import { Button, Input, Select, Textarea, Checkbox } from '@/components/common';
import type { Service, Product } from '@/types';

export interface ServiceRequestFormData {
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  
  // Request Details
  requestType: 'service_quote' | 'technical_consultation' | 'general_inquiry';
  serviceId?: string;
  productId?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Project Information
  projectTitle: string;
  projectDescription: string;
  timeline: string;
  budget: string;
  location: string;
  
  // Technical Requirements
  technicalRequirements: string;
  specifications: string;
  
  // Additional Information
  additionalNotes: string;
  preferredContactMethod: 'email' | 'phone' | 'both';
  marketingConsent: boolean;
  
  // Files
  attachments: File[];
}

interface ServiceRequestFormProps {
  preSelectedService?: Service;
  preSelectedProduct?: Product;
  onSubmit: (data: ServiceRequestFormData) => Promise<void>;
  onCancel?: () => void;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  preSelectedService,
  preSelectedProduct,
  onSubmit,
  onCancel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceRequestFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [fileUploadError, setFileUploadError] = useState<string>('');
  
  const [formData, setFormData] = useState<ServiceRequestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    requestType: 'service_quote',
    serviceId: preSelectedService?.id,
    productId: preSelectedProduct?.id,
    urgency: 'medium',
    projectTitle: '',
    projectDescription: '',
    timeline: '',
    budget: '',
    location: '',
    technicalRequirements: '',
    specifications: '',
    additionalNotes: '',
    preferredContactMethod: 'email',
    marketingConsent: false,
    attachments: []
  });

  const requestTypeOptions = [
    { value: 'service_quote', label: 'Service Quote Request' },
    { value: 'technical_consultation', label: 'Technical Consultation' },
    { value: 'general_inquiry', label: 'General Inquiry' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low - Planning phase' },
    { value: 'medium', label: 'Medium - Within 3 months' },
    { value: 'high', label: 'High - Within 1 month' },
    { value: 'urgent', label: 'Urgent - ASAP' }
  ];

  const timelineOptions = [
    { value: 'immediate', label: 'Immediate (Within 1 week)' },
    { value: '1-month', label: 'Within 1 month' },
    { value: '3-months', label: 'Within 3 months' },
    { value: '6-months', label: 'Within 6 months' },
    { value: 'planning', label: 'Planning phase (6+ months)' }
  ];

  const budgetOptions = [
    { value: 'under-50k', label: 'Under $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: '500k-1m', label: '$500,000 - $1,000,000' },
    { value: 'over-1m', label: 'Over $1,000,000' },
    { value: 'tbd', label: 'To be determined' }
  ];

  const handleInputChange = (field: keyof ServiceRequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear submission messages when user makes changes
    if (submitError) setSubmitError('');
    if (submitSuccess) setSubmitSuccess(false);
    
    // Real-time validation for specific fields
    const newErrors = { ...errors };
    
    if (field === 'email' && value.trim()) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value.trim())) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }
    
    if (field === 'phone' && value.trim()) {
      const cleanPhone = value.replace(/[\s\-\(\)\.]/g, '');
      if (cleanPhone.length > 0 && (cleanPhone.length < 10 || cleanPhone.length > 15)) {
        newErrors.phone = 'Phone number must be between 10-15 digits';
      } else {
        delete newErrors.phone;
      }
    }
    
    if (field === 'projectDescription' && value.trim()) {
      if (value.trim().length < 20) {
        newErrors.projectDescription = 'Project description must be at least 20 characters';
      } else if (value.trim().length > 2000) {
        newErrors.projectDescription = 'Project description must be less than 2000 characters';
      } else {
        delete newErrors.projectDescription;
      }
    }
    
    setErrors(newErrors);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.zip'];
    
    setFileUploadError('');
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        return;
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        errors.push(`${file.name}: Unsupported file format`);
        return;
      }

      // Check for duplicate files
      const isDuplicate = formData.attachments.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      if (isDuplicate) {
        errors.push(`${file.name}: File already uploaded`);
        return;
      }

      validFiles.push(file);
    });

    // Check total file count
    const totalFiles = formData.attachments.length + validFiles.length;
    if (totalFiles > 5) {
      const allowedCount = 5 - formData.attachments.length;
      errors.push(`Maximum 5 files allowed. You can add ${allowedCount} more file(s).`);
      validFiles.splice(allowedCount);
    }

    // Show errors if any
    if (errors.length > 0) {
      setFileUploadError(errors.join('; '));
    }

    // Add valid files
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
    }

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceRequestFormData, string>> = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name contains invalid characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name contains invalid characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    // Phone validation (enhanced)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)\.]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone = 'Phone number must be between 10-15 digits';
      } else if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Job title validation
    if (formData.jobTitle.trim() && formData.jobTitle.trim().length < 2) {
      newErrors.jobTitle = 'Job title must be at least 2 characters';
    }

    // Project description validation
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    } else if (formData.projectDescription.trim().length < 20) {
      newErrors.projectDescription = 'Project description must be at least 20 characters';
    } else if (formData.projectDescription.trim().length > 2000) {
      newErrors.projectDescription = 'Project description must be less than 2000 characters';
    }

    // Project title validation
    if (formData.projectTitle.trim() && formData.projectTitle.trim().length < 3) {
      newErrors.projectTitle = 'Project title must be at least 3 characters';
    }

    // Location validation
    if (formData.location.trim() && formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    // Technical requirements validation
    if (formData.technicalRequirements.trim() && formData.technicalRequirements.trim().length > 1500) {
      newErrors.technicalRequirements = 'Technical requirements must be less than 1500 characters';
    }

    // Specifications validation
    if (formData.specifications.trim() && formData.specifications.trim().length > 1500) {
      newErrors.specifications = 'Specifications must be less than 1500 characters';
    }

    // Additional notes validation
    if (formData.additionalNotes.trim() && formData.additionalNotes.trim().length > 1000) {
      newErrors.additionalNotes = 'Additional notes must be less than 1000 characters';
    }

    // File validation
    if (formData.attachments.length > 5) {
      newErrors.attachments = 'Maximum 5 files allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous submission states
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate file sizes and types before submission
      const totalSize = formData.attachments.reduce((sum, file) => sum + file.size, 0);
      const maxTotalSize = 50 * 1024 * 1024; // 50MB total
      
      if (totalSize > maxTotalSize) {
        throw new Error('Total file size exceeds 50MB limit');
      }

      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          requestType: 'service_quote',
          serviceId: preSelectedService?.id,
          productId: preSelectedProduct?.id,
          urgency: 'medium',
          projectTitle: '',
          projectDescription: '',
          timeline: '',
          budget: '',
          location: '',
          technicalRequirements: '',
          specifications: '',
          additionalNotes: '',
          preferredContactMethod: 'email',
          marketingConsent: false,
          attachments: []
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while submitting the form. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            error={errors.firstName}
            required
          />
          
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company"
            value={formData.company}
            onChange={(value) => handleInputChange('company', value)}
            error={errors.company}
            required
          />
          
          <Input
            label="Job Title"
            value={formData.jobTitle}
            onChange={(value) => handleInputChange('jobTitle', value)}
          />
        </div>
      </div>

      {/* Request Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Request Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Request Type"
            value={formData.requestType}
            onChange={(value) => handleInputChange('requestType', value)}
            options={requestTypeOptions}
            required
          />
          
          <Select
            label="Urgency Level"
            value={formData.urgency}
            onChange={(value) => handleInputChange('urgency', value)}
            options={urgencyOptions}
            required
          />
        </div>

        {preSelectedService && (
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-medium text-primary-900 mb-2">Pre-selected Service:</h4>
            <p className="text-primary-700">{preSelectedService.title}</p>
          </div>
        )}

        {preSelectedProduct && (
          <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
            <h4 className="font-medium text-accent-900 mb-2">Pre-selected Product:</h4>
            <p className="text-accent-700">{preSelectedProduct.name}</p>
          </div>
        )}
      </div>    
  {/* Project Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Project Information
        </h3>

        <Input
          label="Project Title"
          value={formData.projectTitle}
          onChange={(value) => handleInputChange('projectTitle', value)}
          placeholder="Brief title for your project"
        />

        <Textarea
          label="Project Description"
          value={formData.projectDescription}
          onChange={(value) => handleInputChange('projectDescription', value)}
          error={errors.projectDescription}
          placeholder="Please provide a detailed description of your project requirements..."
          rows={4}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Timeline"
            value={formData.timeline}
            onChange={(value) => handleInputChange('timeline', value)}
            options={timelineOptions}
            placeholder="Select timeline"
          />
          
          <Select
            label="Budget Range"
            value={formData.budget}
            onChange={(value) => handleInputChange('budget', value)}
            options={budgetOptions}
            placeholder="Select budget range"
          />
          
          <Input
            label="Project Location"
            value={formData.location}
            onChange={(value) => handleInputChange('location', value)}
            placeholder="City, State/Country"
          />
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Technical Requirements
        </h3>

        <Textarea
          label="Technical Requirements"
          value={formData.technicalRequirements}
          onChange={(value) => handleInputChange('technicalRequirements', value)}
          placeholder="Describe any specific technical requirements, standards, or constraints..."
          rows={3}
        />

        <Textarea
          label="Specifications"
          value={formData.specifications}
          onChange={(value) => handleInputChange('specifications', value)}
          placeholder="Include any technical specifications, drawings references, or performance requirements..."
          rows={3}
        />
      </div>

      {/* File Attachments */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          File Attachments
        </h3>

        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={formData.attachments.length >= 5}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attach Files
            </Button>
            
            <p className="text-sm text-gray-500 mt-2">
              Upload technical drawings, specifications, or reference documents (PDF, DOC, images). 
              Max 5 files, 10MB each.
            </p>
            
            {fileUploadError && (
              <div className="mt-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-error-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-error-700 text-sm">{fileUploadError}</p>
                </div>
              </div>
            )}
          </div>

          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Additional Information
        </h3>

        <Textarea
          label="Additional Notes"
          value={formData.additionalNotes}
          onChange={(value) => handleInputChange('additionalNotes', value)}
          placeholder="Any additional information or special requirements..."
          rows={3}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Contact Method
          </label>
          <div className="space-y-2">
            {[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'both', label: 'Both Email and Phone' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="preferredContactMethod"
                  value={option.value}
                  checked={formData.preferredContactMethod === option.value}
                  onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Checkbox
          label="I would like to receive updates about new services and industry insights"
          checked={formData.marketingConsent}
          onChange={(checked) => handleInputChange('marketingConsent', checked)}
        />
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-success-800 font-medium">Request Submitted Successfully!</h4>
              <p className="text-success-700 text-sm mt-1">
                Thank you for your request. Our team will review your information and contact you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-error-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-error-800 font-medium">Submission Error</h4>
              <p className="text-error-700 text-sm mt-1">{submitError}</p>
              <p className="text-error-600 text-xs mt-2">
                Please check your information and try again. If the problem persists, contact us directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="mb-2">
          <strong>Privacy Notice:</strong> Your information will be used to process your request and provide you with relevant services. 
          We do not share your personal information with third parties without your consent.
        </p>
        <p>
          By submitting this form, you agree to our privacy policy and terms of service. 
          You can unsubscribe from marketing communications at any time.
        </p>
      </div>
    </form>
  );
};

export default ServiceRequestForm;