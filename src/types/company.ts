export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  email: string;
  phone?: string;
  fax?: string;
  website?: string;
}

export interface Office {
  id: string;
  name: string;
  type: 'headquarters' | 'manufacturing' | 'sales' | 'regional';
  address: Address;
  contact: ContactInfo;
  services: string[];
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  number?: string;
  validUntil?: Date;
  image: string;
  description?: string;
  category: string;
}

export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  bio: string;
  image?: string;
  email?: string;
  linkedin?: string;
  expertise: string[];
}

export interface CompanyStats {
  yearsOfExperience: number;
  projectsCompleted: number;
  clientsSatisfied: number;
  countriesServed: number;
  employeeCount: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  founded: number;
  headquarters: Address;
  offices: Office[];
  certifications: Certification[];
  socialMedia: SocialMediaLinks;
  leadership: TeamMember[];
  stats: CompanyStats;
  industries: string[];
  capabilities: string[];
}