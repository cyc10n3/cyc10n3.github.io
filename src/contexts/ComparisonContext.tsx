import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Product } from '@/types';

interface ComparisonContextType {
  comparisonProducts: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: boolean;
  maxProducts: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const maxProducts = 4; // Maximum products that can be compared

  const addToComparison = useCallback((product: Product) => {
    setComparisonProducts(prev => {
      // Don't add if already in comparison
      if (prev.some(p => p.id === product.id)) {
        return prev;
      }
      
      // Don't add if at maximum capacity
      if (prev.length >= maxProducts) {
        return prev;
      }
      
      return [...prev, product];
    });
  }, [maxProducts]);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonProducts([]);
  }, []);

  const isInComparison = useCallback((productId: string) => {
    return comparisonProducts.some(p => p.id === productId);
  }, [comparisonProducts]);

  const canAddMore = comparisonProducts.length < maxProducts;

  const value: ComparisonContextType = {
    comparisonProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore,
    maxProducts
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};