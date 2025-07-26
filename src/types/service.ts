export interface ServiceFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceProcess {
  step: number;
  title: string;
  description: string;
  duration?: string;
}

export interface CaseStudy {
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  image?: string;
}

export interface ServiceEquipment {
  name: string;
  description: string;
  specifications: Record<string, string>;
  image?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  images: string[];
  features: ServiceFeature[];
  processes: ServiceProcess[];
  equipment: ServiceEquipment[];
  certifications: string[];
  caseStudies: CaseStudy[];
  featured: boolean;
  order: number;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFilter {
  category?: string;
  featured?: boolean;
  tags?: string[];
  search?: string;
}

export interface ServiceSort {
  field: 'title' | 'category' | 'order' | 'createdAt';
  direction: 'asc' | 'desc';
}