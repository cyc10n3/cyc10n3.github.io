export enum ProductCategory {
  PRESSURE_VESSELS = 'pressure-vessels',
  SAND_MANAGEMENT = 'sand-management',
  FLOW_LINE = 'flow-line',
  WELLHEAD = 'wellhead',
  STORAGE = 'storage',
  CUSTOM = 'custom'
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
  category: string;
}

export interface ProductDocument {
  name: string;
  type: 'datasheet' | 'manual' | 'certificate' | 'drawing';
  url: string;
  size: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: ProductCategory;
  subcategory?: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  features: string[];
  applications: string[];
  certifications: string[];
  documents: ProductDocument[];
  relatedProducts: string[];
  featured: boolean;
  status: 'active' | 'discontinued' | 'coming-soon';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  category?: ProductCategory;
  subcategory?: string;
  featured?: boolean;
  status?: Product['status'];
  search?: string;
}

export interface ProductSort {
  field: 'name' | 'category' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}