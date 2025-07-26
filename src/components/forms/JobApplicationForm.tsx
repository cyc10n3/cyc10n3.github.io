import React, { useState, useRef } from 'react';
import { Button, Input, Select, Textarea, Checkbox } from '@/components/common';

export interface JobApplicationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Position Information
  positionAppliedFor: string;
  department: string;
  preferredLocation: string;
  availableStartDate: string;
  salaryExpectation: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  
  // Professional Information
  currentJobTitle: string;
  currentEmployer: string;
  yearsOfExperience: string;
  relevantSkills: string;
  education: string;
  certifications: string;
  
  // Application Details
  coverLetter: string;
  whyJoinCompany: string;
  additionalInformation: string;
  
  // Legal & Consent
  workAuthorization: 'yes' | 'no' | 'visa-required';
  willingToRelocate: boolean;
  backgroundCheckConsent: boolean;
  marketingConsent: boolean;
  
  // Files
  resume: File | null;
  coverLetterFile: File | null;
  portfolio: File | null;
  additionalDocuments: File[];
}

interface JobApplicationFormProps {
  preSelectedPosition?: string;
  preSelectedDepartment?: string;
  onSubmit: (data: JobApplicationFormData) => Promise<void>;
  onCancel?: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  preSelectedPosition,
  preSelectedDepartment,
  onSubmit,
  onCancel
}) => {
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JobApplicationFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [fileUploadErrors, setFileUploadErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<JobApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    positionAppliedFor: preSelectedPosition || '',
    department: preSelectedDepartment || '',
    preferredLocation: '',
    availableStartDate: '',
    salaryExpectation: '',
    employmentType: 'full-time',
    currentJobTitle: '',
    currentEmployer: '',
    yearsOfExperience: '',
    relevantSkills: '',
    education: '',
    certifications: '',
    coverLetter: '',
    whyJoinCompany: '',
    additionalInformation: '',
    workAuthorization: 'yes',
    willingToRelocate: false,
    backgroundCheckConsent: false,
    marketingConsent: false,
    resume: null,
    coverLetterFile: null,
    portfolio: null,
    additionalDocuments: []
  });

  const positionOptions = [
    { value: 'senior-mechanical-engineer', label: 'Senior Mechanical Engineer' },
    { value: 'quality-assurance-specialist', label: 'Quality Assurance Specialist' },
    { value: 'project-manager', label: 'Project Manager' },
    { value: 'manufacturing-technician', label: 'Manufacturing Technician' },
    { value: 'sales-engineer', label: 'Sales Engineer' },
    { value: 'software-developer', label: 'Software Developer' },
    { value: 'operations-coordinator', label: 'Operations Coordinator' },
    { value: 'other', label: 'Other (specify in cover letter)' }
  ];

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'quality-control', label: 'Quality Control' },
    { value: 'sales-marketing', label: 'Sales & Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'information-technology', label: 'Information Technology' },
    { value: 'human-resources', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' }
  ];

  const locationOptions = [
    { value: 'houston-tx', label: 'Houston, TX (Headquarters)' },
    { value: 'dubai-uae', label: 'Dubai, UAE (Regional Office)' },
    { value: 'vadodara-india', label: 'Vadodara, India (Manufacturing)' },
    { value: 'remote', label: 'Remote' },
    { value: 'flexible', label: 'Flexible/Open to Discussion' }
  ];

  const experienceOptions = [
    { value: '0-1', label: '0-1 years (Entry Level)' },
    { value: '2-3', label: '2-3 years' },
    { value: '4-6', label: '4-6 years' },
    { value: '7-10', label: '7-10 years' },
    { value: '11-15', label: '11-15 years' },
    { value: '15+', label: '15+ years (Senior Level)' }
  ];

  const salaryOptions = [
    { value: 'under-50k', label: 'Under $50,000' },
    { value: '50k-75k', label: '$50,000 - $75,000' },
    { value: '75k-100k', label: '$75,000 - $100,000' },
    { value: '100k-125k', label: '$100,000 - $125,000' },
    { value: '125k-150k', label: '$125,000 - $150,000' },
    { value: 'over-150k', label: 'Over $150,000' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  const handleInputChange = (field: keyof JobApplicationFormData, value: any) => {
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
    
    setErrors(newErrors);
  };

  const handleFileUpload = (fileType: 'resume' | 'coverLetterFile' | 'portfolio' | 'additionalDocuments', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    setFileUploadErrors(prev => ({ ...prev, [fileType]: '' }));

    if (fileType === 'additionalDocuments') {
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        if (file.size > maxSize) {
          errors.push(`${file.name}: File too large (max 10MB)`);
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Unsupported file format`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        setFileUploadErrors(prev => ({ ...prev, [fileType]: errors.join('; ') }));
      }

      if (validFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          additionalDocuments: [...prev.additionalDocuments, ...validFiles].slice(0, 3) // Max 3 additional files
        }));
      }
    } else {
      const file = files[0];
      if (!file) return;

      if (file.size > maxSize) {
        setFileUploadErrors(prev => ({ ...prev, [fileType]: 'File too large (max 10MB)' }));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setFileUploadErrors(prev => ({ ...prev, [fileType]: 'Unsupported file format. Please use PDF, DOC, DOCX, or TXT.' }));
        return;
      }

      setFormData(prev => ({ ...prev, [fileType]: file }));
    }

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (fileType: 'resume' | 'coverLetterFile' | 'portfolio', index?: number) => {
    if (fileType === 'additionalDocuments' && typeof index === 'number') {
      setFormData(prev => ({
        ...prev,
        additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({ ...prev, [fileType]: null }));
    }
  };

  const removeAdditionalDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JobApplicationFormData, string>> = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.positionAppliedFor.trim()) newErrors.positionAppliedFor = 'Position is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of experience is required';
    if (!formData.coverLetter.trim()) newErrors.coverLetter = 'Cover letter is required';
    if (!formData.whyJoinCompany.trim()) newErrors.whyJoinCompany = 'Please explain why you want to join our company';

    // Email validation
    if (formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)\.]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone = 'Phone number must be between 10-15 digits';
      }
    }

    // Resume file validation
    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    }

    // Legal consent validation
    if (!formData.backgroundCheckConsent) {
      newErrors.backgroundCheckConsent = 'Background check consent is required';
    }

    // Character limits
    if (formData.coverLetter.length > 2000) {
      newErrors.coverLetter = 'Cover letter must be less than 2000 characters';
    }

    if (formData.whyJoinCompany.length > 1000) {
      newErrors.whyJoinCompany = 'Response must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          positionAppliedFor: preSelectedPosition || '',
          department: preSelectedDepartment || '',
          preferredLocation: '',
          availableStartDate: '',
          salaryExpectation: '',
          employmentType: 'full-time',
          currentJobTitle: '',
          currentEmployer: '',
          yearsOfExperience: '',
          relevantSkills: '',
          education: '',
          certifications: '',
          coverLetter: '',
          whyJoinCompany: '',
          additionalInformation: '',
          workAuthorization: 'yes',
          willingToRelocate: false,
          backgroundCheckConsent: false,
          marketingConsent: false,
          resume: null,
          coverLetterFile: null,
          portfolio: null,
          additionalDocuments: []
        });
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while submitting your application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            error={errors.firstName}
            required
          />
          
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
          />
          
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={(value) => handleInputChange('address', value)}
          placeholder="Street address"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={(value) => handleInputChange('city', value)}
          />
          
          <Input
            label="State/Province"
            name="state"
            value={formData.state}
            onChange={(value) => handleInputChange('state', value)}
          />
          
          <Input
            label="ZIP/Postal Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={(value) => handleInputChange('zipCode', value)}
          />
          
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={(value) => handleInputChange('country', value)}
            placeholder="United States"
          />
        </div>
      </div>      {
/* Position Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Position Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Position Applied For"
            name="positionAppliedFor"
            value={formData.positionAppliedFor}
            onChange={(value) => handleInputChange('positionAppliedFor', value)}
            options={positionOptions}
            error={errors.positionAppliedFor}
            required
          />
          
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={(value) => handleInputChange('department', value)}
            options={departmentOptions}
            error={errors.department}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Preferred Location"
            name="preferredLocation"
            value={formData.preferredLocation}
            onChange={(value) => handleInputChange('preferredLocation', value)}
            options={locationOptions}
            placeholder="Select location"
          />
          
          <Input
            label="Available Start Date"
            name="availableStartDate"
            type="date"
            value={formData.availableStartDate}
            onChange={(value) => handleInputChange('availableStartDate', value)}
          />
          
          <Select
            label="Employment Type"
            name="employmentType"
            value={formData.employmentType}
            onChange={(value) => handleInputChange('employmentType', value)}
            options={[
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' },
              { value: 'internship', label: 'Internship' }
            ]}
          />
        </div>

        <Select
          label="Salary Expectation"
          name="salaryExpectation"
          value={formData.salaryExpectation}
          onChange={(value) => handleInputChange('salaryExpectation', value)}
          options={salaryOptions}
          placeholder="Select salary range"
        />
      </div>

      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Professional Background
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Current Job Title"
            name="currentJobTitle"
            value={formData.currentJobTitle}
            onChange={(value) => handleInputChange('currentJobTitle', value)}
            placeholder="e.g., Senior Engineer"
          />
          
          <Input
            label="Current Employer"
            name="currentEmployer"
            value={formData.currentEmployer}
            onChange={(value) => handleInputChange('currentEmployer', value)}
            placeholder="Company name"
          />
        </div>

        <Select
          label="Years of Experience"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={(value) => handleInputChange('yearsOfExperience', value)}
          options={experienceOptions}
          error={errors.yearsOfExperience}
          required
        />

        <Textarea
          label="Relevant Skills"
          name="relevantSkills"
          value={formData.relevantSkills}
          onChange={(value) => handleInputChange('relevantSkills', value)}
          placeholder="List your key skills relevant to this position..."
          rows={3}
        />

        <Textarea
          label="Education"
          name="education"
          value={formData.education}
          onChange={(value) => handleInputChange('education', value)}
          placeholder="Degree, Institution, Year of graduation..."
          rows={3}
        />

        <Textarea
          label="Certifications"
          name="certifications"
          value={formData.certifications}
          onChange={(value) => handleInputChange('certifications', value)}
          placeholder="Professional certifications, licenses, etc..."
          rows={2}
        />
      </div>

      {/* File Uploads */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Documents
        </h3>

        {/* Resume Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Resume <span className="text-red-500">*</span>
          </label>
          <input
            ref={resumeInputRef}
            type="file"
            onChange={(e) => handleFileUpload('resume', e)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => resumeInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Resume
            </Button>
            
            {formData.resume && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">{formData.resume.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile('resume')}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {fileUploadErrors.resume && (
            <p className="text-sm text-red-600">{fileUploadErrors.resume}</p>
          )}
          {errors.resume && (
            <p className="text-sm text-red-600">{errors.resume}</p>
          )}
          
          <p className="text-xs text-gray-500">
            Upload your resume in PDF, DOC, DOCX, or TXT format (max 10MB)
          </p>
        </div>

        {/* Cover Letter File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Cover Letter (File)
          </label>
          <input
            ref={coverLetterInputRef}
            type="file"
            onChange={(e) => handleFileUpload('coverLetterFile', e)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => coverLetterInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Cover Letter
            </Button>
            
            {formData.coverLetterFile && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">{formData.coverLetterFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile('coverLetterFile')}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {fileUploadErrors.coverLetterFile && (
            <p className="text-sm text-red-600">{fileUploadErrors.coverLetterFile}</p>
          )}
          
          <p className="text-xs text-gray-500">
            Optional: Upload a separate cover letter file
          </p>
        </div>

        {/* Portfolio Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Portfolio/Work Samples
          </label>
          <input
            ref={portfolioInputRef}
            type="file"
            onChange={(e) => handleFileUpload('portfolio', e)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => portfolioInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Portfolio
            </Button>
            
            {formData.portfolio && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">{formData.portfolio.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile('portfolio')}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {fileUploadErrors.portfolio && (
            <p className="text-sm text-red-600">{fileUploadErrors.portfolio}</p>
          )}
          
          <p className="text-xs text-gray-500">
            Optional: Upload work samples, portfolio, or project examples
          </p>
        </div>

        {/* Additional Documents */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Documents
          </label>
          <input
            ref={documentsInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileUpload('additionalDocuments', e)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => documentsInputRef.current?.click()}
              disabled={formData.additionalDocuments.length >= 3}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Additional Documents
            </Button>
            
            {formData.additionalDocuments.length > 0 && (
              <div className="space-y-2">
                {formData.additionalDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdditionalDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {fileUploadErrors.additionalDocuments && (
            <p className="text-sm text-red-600">{fileUploadErrors.additionalDocuments}</p>
          )}
          
          <p className="text-xs text-gray-500">
            Optional: Upload up to 3 additional documents (references, transcripts, etc.)
          </p>
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Application Details
        </h3>

        <Textarea
          label="Cover Letter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={(value) => handleInputChange('coverLetter', value)}
          error={errors.coverLetter}
          placeholder="Write your cover letter here. Explain your interest in the position and how your experience makes you a good fit..."
          rows={6}
          required
        />

        <Textarea
          label="Why do you want to join our company?"
          name="whyJoinCompany"
          value={formData.whyJoinCompany}
          onChange={(value) => handleInputChange('whyJoinCompany', value)}
          error={errors.whyJoinCompany}
          placeholder="Tell us what attracts you to our company and this opportunity..."
          rows={4}
          required
        />

        <Textarea
          label="Additional Information"
          name="additionalInformation"
          value={formData.additionalInformation}
          onChange={(value) => handleInputChange('additionalInformation', value)}
          placeholder="Any additional information you'd like to share..."
          rows={3}
        />
      </div>

      {/* Legal & Consent */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Legal Information & Consent
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Are you authorized to work in the country where this position is located?
          </label>
          <div className="space-y-2">
            {[
              { value: 'yes', label: 'Yes, I am authorized to work' },
              { value: 'no', label: 'No, I am not authorized to work' },
              { value: 'visa-required', label: 'I will require visa sponsorship' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="workAuthorization"
                  value={option.value}
                  checked={formData.workAuthorization === option.value}
                  onChange={(e) => handleInputChange('workAuthorization', e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Checkbox
          label="I am willing to relocate if required for this position"
          checked={formData.willingToRelocate}
          onChange={(checked) => handleInputChange('willingToRelocate', checked)}
        />

        <Checkbox
          label="I consent to a background check as part of the hiring process"
          checked={formData.backgroundCheckConsent}
          onChange={(checked) => handleInputChange('backgroundCheckConsent', checked)}
          error={errors.backgroundCheckConsent}
          required
        />

        <Checkbox
          label="I would like to receive updates about future job opportunities and company news"
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
              <h4 className="text-success-800 font-medium">Application Submitted Successfully!</h4>
              <p className="text-success-700 text-sm mt-1">
                Thank you for your application. Our HR team will review your submission and contact you within 5-7 business days.
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
              Submitting Application...
            </>
          ) : (
            'Submit Application'
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
          <strong>Privacy Notice:</strong> Your personal information and documents will be used solely for recruitment purposes. 
          We maintain strict confidentiality and comply with all applicable data protection laws.
        </p>
        <p>
          By submitting this application, you agree to our privacy policy and terms of service. 
          You can request deletion of your data at any time by contacting our HR team.
        </p>
      </div>
    </form>
  );
};

export default JobApplicationForm;