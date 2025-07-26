export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  productInterest?: string;
  serviceInterest?: string;
  preferredContactMethod?: 'email' | 'phone';
  newsletter?: boolean;
}

export interface ContactFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  general?: string;
}

export interface ContactFormState {
  data: ContactFormData;
  errors: ContactFormErrors;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

export interface QuoteRequest extends ContactFormData {
  productIds?: string[];
  serviceIds?: string[];
  projectDescription: string;
  timeline?: string;
  budget?: string;
  specifications?: string;
  attachments?: File[];
}

export interface CareerApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position?: string;
  experience: string;
  education: string;
  skills: string[];
  resume: File;
  coverLetter?: string;
  portfolio?: string;
  availableStartDate?: Date;
  expectedSalary?: string;
  willingToRelocate?: boolean;
}

export interface NewsletterSubscription {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
  source?: string;
}